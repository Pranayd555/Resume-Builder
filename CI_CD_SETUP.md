# CI/CD Pipeline Setup Guide

This guide explains how to set up and use the CI/CD pipeline for the Resume Builder project.

## Overview

The CI/CD pipeline consists of multiple GitHub Actions workflows that handle:

- **Testing**: Unit tests, integration tests, and code quality checks
- **Security**: Vulnerability scanning and dependency checks
- **Building**: Frontend build and backend containerization
- **Deployment**: Automated deployment to staging and production environments
- **Monitoring**: Health checks and notifications

## Workflows

### 1. Main CI/CD Pipeline (`ci-cd.yml`)

**Triggers**: Push to `main`/`develop` branches, Pull Requests

**Jobs**:
- **Backend Tests**: Runs tests with MongoDB service
- **Frontend Tests & Build**: Runs tests and builds React app
- **Security Scan**: Vulnerability scanning with Trivy
- **Integration Tests**: End-to-end testing (main branch only)
- **Deploy Staging**: Deploy to staging environment (develop branch)
- **Deploy Production**: Deploy to production environment (main branch)
- **Notify on Failure**: Send notifications on pipeline failures

### 2. Dependency Check (`dependency-check.yml`)

**Triggers**: Weekly schedule, manual dispatch

**Jobs**:
- **Check Dependencies**: Audit for vulnerabilities and outdated packages
- **Update Dependencies**: Automated dependency updates with PR creation

### 3. Code Quality (`code-quality.yml`)

**Triggers**: Push to `main`/`develop` branches, Pull Requests

**Jobs**:
- **Code Quality Checks**: Linting, formatting, and coverage reports
- **SonarCloud Analysis**: Code quality analysis (optional)

### 4. Deployment (`deploy.yml`)

**Triggers**: Push to `main`/`develop` branches, manual dispatch

**Jobs**:
- **Deploy to Heroku**: Backend deployment
- **Deploy to Vercel**: Frontend deployment
- **AWS Deployment**: Alternative deployment option
- **Health Checks**: Post-deployment verification
- **Notifications**: Deployment status notifications

## Setup Instructions

### 1. GitHub Repository Setup

1. **Enable GitHub Actions**: Go to your repository → Settings → Actions → General → Allow all actions
2. **Set up branch protection**: Go to Settings → Branches → Add rule for `main` branch
   - Require status checks to pass before merging
   - Require branches to be up to date before merging

### 2. Environment Variables & Secrets

Add the following secrets in your GitHub repository (Settings → Secrets and variables → Actions):

#### Required Secrets

```bash
# Database
TEST_MONGODB_URI=mongodb://localhost:27017/test

# JWT Secrets
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-jwt-refresh-secret

# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

#### Deployment Platform Secrets

**For Heroku:**
```bash
HEROKU_API_KEY=your-heroku-api-key
HEROKU_EMAIL=your-heroku-email
HEROKU_APP_NAME_PROD=your-prod-app-name
HEROKU_APP_NAME_STAGING=your-staging-app-name
```

**For Vercel:**
```bash
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-org-id
VERCEL_PROJECT_ID=your-project-id
```

**For AWS (optional):**
```bash
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
```

**For Notifications:**
```bash
SLACK_WEBHOOK_URL=your-slack-webhook-url
```

#### Environment URLs
```bash
BACKEND_URL_PROD=https://your-backend-prod.herokuapp.com
BACKEND_URL_STAGING=https://your-backend-staging.herokuapp.com
FRONTEND_URL_PROD=https://your-frontend-prod.vercel.app
FRONTEND_URL_STAGING=https://your-frontend-staging.vercel.app
```

### 3. Environment Setup

Create environments in GitHub (Settings → Environments):

1. **staging**: For staging deployments
2. **production**: For production deployments

Add environment-specific secrets and protection rules as needed.

### 4. Local Development Setup

#### Using Docker Compose

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd scrap
   ```

2. **Set up environment variables**:
   ```bash
   cp backend/env.template backend/.env
   # Edit backend/.env with your configuration
   ```

3. **Start the development environment**:
   ```bash
   docker-compose up -d
   ```

4. **Access the applications**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - MongoDB: localhost:27017

#### Manual Setup

1. **Backend Setup**:
   ```bash
   cd backend
   npm install
   cp env.template .env
   # Edit .env with your configuration
   npm run dev
   ```

2. **Frontend Setup**:
   ```bash
   cd resume-builder
   npm install
   npm start
   ```

## Usage

### Development Workflow

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make changes and commit**:
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

3. **Push to trigger CI**:
   ```bash
   git push origin feature/your-feature-name
   ```

4. **Create Pull Request**: The CI pipeline will run automatically

### Deployment Workflow

1. **Staging Deployment**: Push to `develop` branch
2. **Production Deployment**: Merge to `main` branch

### Manual Actions

1. **Run dependency check**: Go to Actions → Dependency Check → Run workflow
2. **Manual deployment**: Go to Actions → Deploy → Run workflow

## Monitoring & Troubleshooting

### Pipeline Status

- Check workflow runs: GitHub → Actions tab
- View logs: Click on any job to see detailed logs
- Download artifacts: Available in workflow run summary

### Common Issues

1. **Tests failing**: Check test logs and fix failing tests
2. **Build failures**: Verify dependencies and build configuration
3. **Deployment failures**: Check environment variables and platform credentials
4. **Security vulnerabilities**: Review Trivy scan results and update dependencies

### Health Checks

The pipeline includes health checks for:
- Backend API availability
- Frontend application loading
- Database connectivity

### Notifications

Configure notifications for:
- Pipeline failures
- Deployment status
- Security alerts

## Customization

### Adding New Tests

1. **Backend tests**: Add to `backend/` directory
2. **Frontend tests**: Add to `resume-builder/src/` directory
3. **Integration tests**: Add to `backend/tests/integration/`

### Adding New Deployment Platforms

1. Create a new job in `deploy.yml`
2. Add platform-specific secrets
3. Configure deployment steps

### Modifying Workflow Triggers

Edit the `on` section in workflow files to change when workflows run.

## Security Considerations

1. **Secrets Management**: Never commit secrets to the repository
2. **Dependency Scanning**: Regularly review and update dependencies
3. **Code Scanning**: Enable GitHub Code Scanning for additional security
4. **Access Control**: Use environment protection rules for production

## Performance Optimization

1. **Caching**: Dependencies are cached between runs
2. **Parallel Jobs**: Jobs run in parallel where possible
3. **Artifact Management**: Build artifacts are shared between jobs
4. **Resource Limits**: Jobs use minimal resources by default

## Support

For issues with the CI/CD pipeline:

1. Check the GitHub Actions documentation
2. Review workflow logs for specific error messages
3. Verify environment variables and secrets
4. Test locally before pushing changes

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Documentation](https://docs.docker.com/)
- [Heroku Deployment Guide](https://devcenter.heroku.com/)
- [Vercel Deployment Guide](https://vercel.com/docs) 