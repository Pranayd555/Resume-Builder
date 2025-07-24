# SonarCloud Setup Guide

## Overview

SonarCloud is a cloud-based code quality and security analysis platform. This guide will help you set up SonarCloud analysis for your Resume Builder project.

## Current Issue

The SonarCloud scan is failing with the error:
```
Failed to query JRE metadata: . Please check the property `sonar.token` or the environment variable `SONAR_TOKEN`.
```

This happens because the `SONAR_TOKEN` secret is not configured in your GitHub repository.

## Step-by-Step Setup

### 1. Create SonarCloud Account

1. Go to [https://sonarcloud.io](https://sonarcloud.io)
2. Click "Sign Up" and create an account
3. You can sign up with GitHub, GitLab, Bitbucket, or email

### 2. Create Organization

1. After signing in, click "Create Organization"
2. Choose a plan (Free plan is available for public repositories)
3. Enter your organization name (e.g., `your-username` or `your-company`)
4. Complete the organization setup

### 3. Create Project

1. In your SonarCloud organization, click "Create Project"
2. Choose "GitHub" as your Git provider
3. Authorize SonarCloud to access your GitHub repositories
4. Select your `resume-builder` repository
5. Choose "Use the global setting" for analysis method
6. Click "Set Up"

### 4. Get Authentication Token

1. In SonarCloud, go to your profile (top-right corner)
2. Click "My Account"
3. Go to "Security" tab
4. Click "Generate Tokens"
5. Enter a name (e.g., "GitHub Actions")
6. Copy the generated token (you won't see it again!)

### 5. Configure GitHub Secrets

1. Go to your GitHub repository
2. Click "Settings" tab
3. In the left sidebar, click "Secrets and variables" → "Actions"
4. Click "New repository secret"
5. Add the following secrets:

#### Required Secret:
- **Name**: `SONAR_TOKEN`
- **Value**: Your SonarCloud authentication token (from step 4)

#### Optional Secrets (if you want to customize):
- **Name**: `SONAR_PROJECT_KEY`
- **Value**: Your SonarCloud project key (default: `resume-builder`)

- **Name**: `SONAR_ORGANIZATION`
- **Value**: Your SonarCloud organization key

### 6. Update Configuration Files

The following files have been created/updated:

#### `sonar-project.properties`
This file contains the SonarCloud configuration:
```properties
sonar.projectKey=resume-builder
sonar.organization=your-organization
sonar.projectName=Resume Builder
sonar.sources=backend,resume-builder/src
sonar.javascript.lcov.reportPaths=backend/coverage/lcov.info,resume-builder/coverage/lcov.info
```

#### `.github/workflows/code-quality.yml`
The workflow has been updated to:
- Handle missing `SONAR_TOKEN` gracefully
- Provide helpful setup instructions
- Continue on error to prevent workflow failures

## Configuration Details

### What SonarCloud Analyzes

1. **Code Quality**: Code smells, bugs, and technical debt
2. **Security**: Security vulnerabilities and hotspots
3. **Coverage**: Test coverage from Jest reports
4. **Duplications**: Code duplications
5. **Maintainability**: Code complexity and maintainability

### Excluded Files

The following files/directories are excluded from analysis:
- `node_modules/`
- `coverage/`
- `build/`
- `dist/`
- `.git/`
- `scripts/`
- `thumbnails/`
- `uploads/`
- Test files (`*.test.js`, `*.spec.js`)

### Quality Gates

SonarCloud uses quality gates to ensure code quality:
- **Coverage**: Minimum test coverage percentage
- **Duplications**: Maximum code duplication percentage
- **Reliability**: Maximum number of bugs
- **Security**: Maximum number of vulnerabilities
- **Maintainability**: Maximum technical debt

## Troubleshooting

### Common Issues

1. **"SONAR_TOKEN not found"**
   - Ensure you've added the `SONAR_TOKEN` secret to your GitHub repository
   - Check that the token is valid in SonarCloud

2. **"Project not found"**
   - Verify your project key in `sonar-project.properties`
   - Ensure the project exists in your SonarCloud organization

3. **"Organization not found"**
   - Check your organization key in `sonar-project.properties`
   - Ensure you have access to the organization

4. **"Coverage reports not found"**
   - Make sure tests are running and generating coverage reports
   - Check the paths in `sonar.javascript.lcov.reportPaths`

### Debug Steps

1. Check the workflow logs for detailed error messages
2. Verify all required secrets are set
3. Test the SonarCloud connection manually
4. Check SonarCloud project settings

## Benefits

Once configured, SonarCloud will provide:

1. **Automated Code Review**: Continuous analysis of code quality
2. **Security Scanning**: Detection of security vulnerabilities
3. **Coverage Tracking**: Test coverage monitoring
4. **Quality Metrics**: Maintainability and reliability scores
5. **Issue Tracking**: Detailed reports of code issues
6. **Trend Analysis**: Historical quality trends

## Next Steps

1. **Add the `SONAR_TOKEN` secret** to your GitHub repository
2. **Update the organization key** in `sonar-project.properties` if needed
3. **Run the workflow** to test the SonarCloud integration
4. **Review the analysis results** in SonarCloud dashboard
5. **Configure quality gates** based on your project requirements

## Support

- [SonarCloud Documentation](https://docs.sonarcloud.io/)
- [SonarCloud Community](https://community.sonarsource.com/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

The workflow will now handle missing SonarCloud configuration gracefully and provide clear instructions for setup. 