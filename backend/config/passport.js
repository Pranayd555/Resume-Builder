const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
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
    callbackURL: 'http://localhost:5000/api/auth/google/callback'
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists with Google ID
      let user = await User.findOne({ googleId: profile.id });
      
      if (user) {
        // Update login count and last login
        user.usage.loginCount += 1;
        user.usage.lastLogin = new Date();
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
  passport.use(new LinkedInStrategy({
    clientID: process.env.LINKEDIN_CLIENT_ID,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
    callbackURL: 'http://localhost:5000/api/auth/linkedin/callback',
    scope: ['r_emailaddress', 'r_liteprofile']
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists with LinkedIn ID
      let user = await User.findOne({ linkedinId: profile.id });
      
      if (user) {
        // Update login count and last login
        user.usage.loginCount += 1;
        user.usage.lastLogin = new Date();
        await user.save();
        return done(null, user);
      }
      
      // Check if user exists with same email
      const existingUser = await User.findOne({ email: profile.emails[0].value });
      
      if (existingUser) {
        // Link LinkedIn account to existing user
        existingUser.linkedinId = profile.id;
        existingUser.isEmailVerified = true;
        existingUser.usage.loginCount += 1;
        existingUser.usage.lastLogin = new Date();
        await existingUser.save();
        return done(null, existingUser);
      }
      
      // Create new user
      const newUser = new User({
        firstName: profile.name.givenName,
        lastName: profile.name.familyName,
        email: profile.emails[0].value,
        linkedinId: profile.id,
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
      
      logger.info(`New user created via LinkedIn OAuth: ${newUser.email}`);
      return done(null, newUser);
    } catch (error) {
      logger.error('LinkedIn OAuth Error:', error);
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