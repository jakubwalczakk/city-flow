#!/usr/bin/env node

/**
 * Vercel Ignored Build Step
 * 
 * This script checks if GitHub Actions CI passed before allowing Vercel to build.
 * If CI is still running or failed, Vercel build is skipped.
 * 
 * Exit codes:
 * - 0 = Skip build (CI failed or pending)
 * - 1 = Proceed with build (CI passed)
 */

const REQUIRED_CHECKS = [
  'lint',
  'unit-tests', 
  'e2e-tests',
  'verify-build'
];

async function main() {
  const commitSha = process.env.VERCEL_GIT_COMMIT_SHA;
  const commitMessage = process.env.VERCEL_GIT_COMMIT_MESSAGE || '';
  
  console.log('🔍 Checking GitHub Actions status...');
  console.log(`📝 Commit: ${commitSha}`);
  console.log(`💬 Message: ${commitMessage}`);
  
  // Allow build if this is a manual deploy or not from git
  if (!commitSha) {
    console.log('✅ Manual deployment or no commit SHA - allowing build');
    process.exit(1);
  }
  
  // Check if we should skip CI check (e.g., for [skip ci] commits)
  if (commitMessage.includes('[skip ci]') || commitMessage.includes('[vercel skip]')) {
    console.log('⏩ [skip ci] detected - allowing build without checks');
    process.exit(1);
  }
  
  try {
    // Try to get GitHub API token
    const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
    
    if (!token) {
      console.log('⚠️  No GitHub token found - allowing build');
      console.log('💡 Set GITHUB_TOKEN in Vercel environment variables for CI checks');
      process.exit(1);
    }
    
    // Get repository from Vercel env
    const repo = process.env.VERCEL_GIT_REPO_SLUG;
    const owner = process.env.VERCEL_GIT_REPO_OWNER;
    
    if (!repo || !owner) {
      console.log('⚠️  Repository info not found - allowing build');
      process.exit(1);
    }
    
    // Fetch check runs from GitHub API
    const url = `https://api.github.com/repos/${owner}/${repo}/commits/${commitSha}/check-runs`;
    
    console.log(`🔍 Fetching checks from: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Vercel-Build-Check'
      }
    });
    
    if (!response.ok) {
      console.log(`⚠️  GitHub API error (${response.status}) - allowing build`);
      process.exit(1);
    }
    
    const data = await response.json();
    const checkRuns = data.check_runs || [];
    
    console.log(`\n📊 Found ${checkRuns.length} check runs:`);
    
    // Find our required checks
    const requiredCheckStatuses = {};
    
    for (const checkName of REQUIRED_CHECKS) {
      const check = checkRuns.find(run => run.name === checkName);
      
      if (!check) {
        console.log(`  ⏸️  ${checkName}: Not started yet`);
        requiredCheckStatuses[checkName] = 'pending';
      } else {
        const status = check.status;
        const conclusion = check.conclusion;
        
        if (status === 'completed') {
          if (conclusion === 'success') {
            console.log(`  ✅ ${checkName}: Passed`);
            requiredCheckStatuses[checkName] = 'success';
          } else {
            console.log(`  ❌ ${checkName}: Failed (${conclusion})`);
            requiredCheckStatuses[checkName] = 'failure';
          }
        } else {
          console.log(`  ⏳ ${checkName}: Running (${status})`);
          requiredCheckStatuses[checkName] = 'pending';
        }
      }
    }
    
    // Check if all required checks passed
    const allPassed = REQUIRED_CHECKS.every(
      check => requiredCheckStatuses[check] === 'success'
    );
    
    const anyFailed = REQUIRED_CHECKS.some(
      check => requiredCheckStatuses[check] === 'failure'
    );
    
    const anyPending = REQUIRED_CHECKS.some(
      check => requiredCheckStatuses[check] === 'pending'
    );
    
    console.log('\n📋 Summary:');
    
    if (allPassed) {
      console.log('✅ All CI checks passed!');
      console.log('🚀 Proceeding with Vercel build...');
      process.exit(1); // 1 = build
    } else if (anyFailed) {
      console.log('❌ Some CI checks failed!');
      console.log('⛔ Skipping Vercel build to prevent broken deployment');
      console.log('💡 Fix the issues and push again');
      process.exit(0); // 0 = skip build
    } else if (anyPending) {
      console.log('⏳ CI checks are still running...');
      console.log('⛔ Skipping Vercel build - will retry when checks complete');
      console.log('💡 Vercel will automatically retry when GitHub notifies completion');
      process.exit(0); // 0 = skip build
    } else {
      console.log('⚠️  Could not determine check status - allowing build');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('⚠️  Error checking CI status:', error.message);
    console.log('⚠️  Allowing build to proceed (fail-safe)');
    process.exit(1);
  }
}

main();

