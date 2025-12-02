const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const OpenIDConnectStrategy = require('passport-openidconnect').Strategy;
const jwt_decode = require('jwt-decode').jwtDecode;
const User = require('../models/User');
const logger = require('../utils/logger');

// JWT Strategy
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
  algorithms: ['HS256']
};

passport.use(new JwtStrategy(jwtOptions, async (payload, done) => {
  try {
    const user = await User.findById(payload.id).select('-password');

    if (!user) {
      return done(null, false);
    }

    if (!user.isActive) {
      return done(null, false);
    }

    return done(null, user);
  } catch (error) {
    logger.error('JWT Strategy Error:', error);
    return done(error, false);
  }
}));

// Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback'
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists with Google ID
      let user = await User.findOne({ googleId: profile.id });

      if (user) {
        // Update login count and last login
        user.usage.loginCount += 1;
        user.usage.lastLogin = new Date();

        // Update profile picture if it's missing or if it's an avatar (not uploaded)
        if (profile.photos && profile.photos[0] && profile.photos[0].value) {
          if (!user.profilePicture || !user.profilePicture.type) {
            user.profilePicture = {
              type: 'avatar',
              avatarUrl: profile.photos[0].value
            };
          } else if (user.profilePicture.type === 'avatar') {
            user.profilePicture.avatarUrl = profile.photos[0].value;
          }
        }

        await user.save();
        return done(null, user);
      }

      // Check if user exists with same email
      const existingUser = await User.findOne({ email: profile.emails[0].value });

      if (existingUser) {
        // Link Google account to existing user
        existingUser.googleId = profile.id;
        existingUser.isEmailVerified = true;
        existingUser.usage.loginCount += 1;
        existingUser.usage.lastLogin = new Date();

        // Update profile picture if it's missing or if it's an avatar (not uploaded)
        if (profile.photos && profile.photos[0] && profile.photos[0].value) {
          if (!existingUser.profilePicture || !existingUser.profilePicture.type) {
            existingUser.profilePicture = {
              type: 'avatar',
              avatarUrl: profile.photos[0].value
            };
          } else if (existingUser.profilePicture.type === 'avatar') {
            existingUser.profilePicture.avatarUrl = profile.photos[0].value;
          }
        }

        await existingUser.save();
        return done(null, existingUser);
      }

      // Create new user
      const newUser = new User({
        firstName: profile.name.givenName,
        lastName: profile.name.familyName,
        email: profile.emails[0].value,
        googleId: profile.id,
        isEmailVerified: true,
        profilePicture: profile.photos[0]?.value ? {
          type: 'avatar',
          avatarUrl: profile.photos[0].value
        } : undefined,
        usage: {
          loginCount: 1,
          lastLogin: new Date()
        }
      });

      await newUser.save();

      logger.info(`New user created via Google OAuth: ${newUser.email}`);
      return done(null, newUser);
    } catch (error) {
      logger.error('Google OAuth Error:', error);
      return done(error, null);
    }
  }));
}

// LinkedIn OAuth Strategy
if (process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET) {
  passport.use('linkedin', new OpenIDConnectStrategy({
    issuer: 'https://www.linkedin.com/oauth', // base OIDC issuer
    insecure_oidc_skip_issuer_verification: true,
    authorizationURL: 'https://www.linkedin.com/oauth/v2/authorization',
    tokenURL: 'https://www.linkedin.com/oauth/v2/accessToken',
    userInfoURL: 'https://api.linkedin.com/v2/userinfo', // OIDC-compliant endpoint
    clientID: process.env.LINKEDIN_CLIENT_ID,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
    callbackURL: process.env.LINKEDIN_CALLBACK_URL,
    scope: ['openid', 'profile', 'email'],
  }, async (issuer, sub, profile, jwtClaims, accessToken, refreshToken, done) => {
    try {
      const decodedJwtClaims = jwt_decode(jwtClaims);
      const linkedinId = decodedJwtClaims.sub;
      const firstName = decodedJwtClaims.given_name;
      const lastName = decodedJwtClaims.family_name;
      const email = decodedJwtClaims.email;
      const profilePicture = decodedJwtClaims.picture;

      // Step 2: Find or create user
      let user = await User.findOne({ linkedinId });
      if (user) {
        user.usage.loginCount += 1;
        user.usage.lastLogin = new Date();

        // Update profile picture if it's missing or if it's an avatar (not uploaded)
        if (profilePicture) {
          if (!user.profilePicture || !user.profilePicture.type) {
            user.profilePicture = {
              type: 'avatar',
              avatarUrl: profilePicture
            };
          } else if (user.profilePicture.type === 'avatar') {
            user.profilePicture.avatarUrl = profilePicture;
          }
        }

        await user.save();
        return done(null, user);
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        if (!existingUser.linkedinId) {
          // If an existing user is found by email, but they don't have a linkedinId,
          // it means this is their first LinkedIn login. Link the account.
          existingUser.linkedinId = linkedinId;
          existingUser.isEmailVerified = true;
          existingUser.usage.loginCount += 1;
          existingUser.usage.lastLogin = new Date();

          // Update profile picture if it's missing or if it's an avatar (not uploaded)
          if (profilePicture) {
            if (!existingUser.profilePicture || !existingUser.profilePicture.type) {
              existingUser.profilePicture = {
                type: 'avatar',
                avatarUrl: profilePicture
              };
            } else if (existingUser.profilePicture.type === 'avatar') {
              existingUser.profilePicture.avatarUrl = profilePicture;
            }
          }

          await existingUser.save();
          return done(null, existingUser);
        } else {
          // If an existing user is found by email AND they already have a linkedinId,
          // it means this email is already linked to a different LinkedIn account.
          // This is an account conflict. Prevent login to avoid account takeover.
          logger.error(`LinkedIn OAuth Error: Email ${email} is already linked to another LinkedIn account.`);
          return done(new Error('Email already linked to another LinkedIn account.'), null);
        }
      }

      const newUser = new User({
        firstName,
        lastName,
        email,
        linkedinId,
        isEmailVerified: true,
        profilePicture: profilePicture
          ? { type: 'avatar', avatarUrl: profilePicture }
          : undefined,
        usage: { loginCount: 1, lastLogin: new Date() }
      });

      await newUser.save();
      logger.info(`LinkedIn authentication successful for user3: ${newUser.id}`);
      return done(null, newUser);

    } catch (error) {
      logger.error('LinkedIn OIDC Fetch Error:', error.response?.data || error);
      return done(error, null);
    }
  }));
}

// Serialize user for sessions (though we're using JWT, this might be needed for OAuth)
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).select('-password');
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;