# Master Branch CI/CD Pipeline

This document describes the automated CI/CD pipeline for the `master` branch, which handles production deployments to Vercel.

## Overview

The `master.yml` workflow automates the entire deployment process from code validation to production deployment on Vercel. Unlike the pull request workflow, this pipeline excludes E2E tests for faster deployment while maintaining code quality through linting and unit tests.

## Workflow Triggers

The pipeline runs automatically on:

- **Push to master**: Any commit pushed to the `master` branch
- **Manual trigger**: Can be triggered manually from GitHub Actions tab using `workflow_dispatch`

## Pipeline Stages

### 1. Lint (🔍)

**Purpose**: Ensure code quality and consistency

**Steps**:

- Checkout repository
- Setup Node.js (version from `.nvmrc`)
- Install dependencies with `npm ci`
- Run ESLint checks
- Run Prettier format checks

**Timeout**: 10 minutes

### 2. Unit Tests (🧪)

**Purpose**: Verify component and function behavior

**Steps**:

- Checkout repository
- Setup Node.js
- Install dependencies
- Run Vitest unit tests with coverage
- Display coverage summary
- Upload coverage artifacts

**Dependencies**: Requires `lint` job to pass

**Timeout**: 15 minutes

**Artifacts**:

- `unit-test-coverage` - Coverage reports (retained for 7 days)

### 3. Build (🔨)

**Purpose**: Build production-ready application

**Steps**:

- Checkout repository
- Setup Node.js
- Install dependencies
- Build project with `npm run build`
- Upload build artifacts

**Dependencies**: Requires `lint` and `unit-tests` jobs to pass

**Timeout**: 15 minutes

**Environment Variables**:

- `PUBLIC_SUPABASE_URL` - Required for build process
- `PUBLIC_SUPABASE_KEY` - Required for build process

**Artifacts**:

- `build-output` - Built application files (retained for 1 day)

### 4. Deploy (🚀)

**Purpose**: Deploy application to Vercel production

**Steps**:

1. Checkout repository
2. Setup Node.js
3. Install dependencies
4. Install Vercel CLI globally
5. Pull Vercel environment configuration
6. Build project artifacts with Vercel
7. Deploy prebuilt artifacts to production
8. Output deployment URL and summary

**Dependencies**: Requires `build` job to pass

**Timeout**: 10 minutes

**Environment**: `production`

**Required Secrets**:

- `VERCEL_TOKEN` - Vercel authentication token
- `VERCEL_ORG_ID` - Vercel organization ID
- `VERCEL_PROJECT_ID` - Vercel project ID

**Outputs**:

- `deployment_url` - URL of the deployed application

### 5. Status Summary (📊)

**Purpose**: Provide comprehensive pipeline status

**Steps**:

- Determine overall status of all jobs
- Display formatted summary with job results
- Show success/failure indicators

**Dependencies**: Runs after all jobs (always executes)

**Always runs**: Yes (even if previous jobs fail)

## Required GitHub Secrets

Configure these secrets in: **Repository Settings > Secrets and variables > Actions**

| Secret Name           | Description                 | How to Obtain                                                                     |
| --------------------- | --------------------------- | --------------------------------------------------------------------------------- |
| `VERCEL_TOKEN`        | Vercel authentication token | Generate at [Vercel Account Settings > Tokens](https://vercel.com/account/tokens) |
| `VERCEL_ORG_ID`       | Vercel organization ID      | Found in `.vercel/project.json` after `vercel link`                               |
| `VERCEL_PROJECT_ID`   | Vercel project ID           | Found in `.vercel/project.json` after `vercel link`                               |
| `PUBLIC_SUPABASE_URL` | Supabase project URL        | From Supabase project settings                                                    |
| `PUBLIC_SUPABASE_KEY` | Supabase anon key           | From Supabase project settings                                                    |

## Vercel Setup

Before the pipeline can deploy, you must link your project to Vercel:

1. Install Vercel CLI:

   ```bash
   npm install -g vercel@latest
   ```

2. Link project:

   ```bash
   vercel link
   ```

3. Extract IDs from `.vercel/project.json`:

   ```bash
   cat .vercel/project.json
   ```

4. Add IDs to GitHub Secrets

See `VERCEL_DEPLOYMENT.md` for detailed setup instructions.

## Differences from Pull Request Workflow

| Feature            | Pull Request      | Master         |
| ------------------ | ----------------- | -------------- |
| **Triggers**       | PR opened/updated | Push to master |
| **Lint**           | ✅ Yes            | ✅ Yes         |
| **Unit Tests**     | ✅ Yes            | ✅ Yes         |
| **E2E Tests**      | ✅ Yes            | ❌ No          |
| **Build**          | ❌ No             | ✅ Yes         |
| **Deploy**         | ❌ No             | ✅ Yes         |
| **PR Comment**     | ✅ Yes            | ❌ No          |
| **Status Summary** | ✅ Yes            | ✅ Yes         |

**Why no E2E tests?**

- Faster deployment to production
- E2E tests already run on PR validation
- Reduces deployment time from ~20min to ~10min
- Master branch only receives code that passed all PR checks

## Monitoring Deployments

### GitHub Actions

1. Go to **Actions** tab in GitHub repository
2. Select **Master CI/CD Pipeline** workflow
3. View latest run or specific commit run
4. Check job logs for detailed information

### Vercel Dashboard

1. Log in to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. View deployments list
4. Click deployment for logs and details

## Troubleshooting

### Build Failures

**Symptom**: Build job fails

**Common Causes**:

- Missing environment variables
- TypeScript errors
- Dependency issues

**Solutions**:

1. Check GitHub Actions logs
2. Verify secrets are configured
3. Test build locally: `npm run build`

### Deployment Failures

**Symptom**: Deploy job fails

**Common Causes**:

- Invalid Vercel credentials
- Incorrect project IDs
- Network issues

**Solutions**:

1. Verify `VERCEL_TOKEN` is valid
2. Check `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID`
3. Re-run `vercel link` if needed
4. Test deployment locally: `vercel --prod`

### Runtime Errors

**Symptom**: Deployment succeeds but app doesn't work

**Common Causes**:

- Missing environment variables in Vercel
- Database connection issues
- RLS policy problems

**Solutions**:

1. Check Vercel Function Logs
2. Verify environment variables in Vercel dashboard
3. Test Supabase connection
4. Review RLS policies

## Manual Deployment

To deploy manually without CI/CD:

```bash
# Install Vercel CLI
npm install -g vercel@latest

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

## Best Practices

1. **Always test locally first**

   ```bash
   npm run lint
   npm run test:unit
   npm run build
   ```

2. **Use pull requests**
   - All code should go through PR review
   - PRs run full validation including E2E tests
   - Only merge to master after PR approval

3. **Monitor deployments**
   - Check GitHub Actions for pipeline status
   - Review Vercel logs after deployment
   - Test critical features after deployment

4. **Environment variables**
   - Keep secrets secure in GitHub Secrets
   - Sync environment variables between GitHub and Vercel
   - Document any new required variables

5. **Rollback if needed**
   - Vercel keeps deployment history
   - Can instantly rollback to previous deployment
   - Use Vercel dashboard for quick rollbacks

## Concurrency

The workflow uses concurrency control:

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

This means:

- Only one deployment runs per branch at a time
- New pushes cancel in-progress deployments
- Prevents multiple simultaneous deployments

## Artifacts

The workflow generates artifacts for debugging:

| Artifact             | Retention | Purpose                    |
| -------------------- | --------- | -------------------------- |
| `unit-test-coverage` | 7 days    | Unit test coverage reports |
| `build-output`       | 1 day     | Built application files    |

Download artifacts from GitHub Actions run page.

## Related Documentation

- [Pull Request Workflow](./README.md) - PR validation pipeline
- [Vercel Deployment Guide](../../VERCEL_DEPLOYMENT.md) - Detailed Vercel setup
- [Environment Variables Setup](../ENV_TEST_SETUP.md) - Secrets configuration
- [CI/CD Setup Summary](../CI_CD_SETUP_SUMMARY.md) - Overall CI/CD overview
