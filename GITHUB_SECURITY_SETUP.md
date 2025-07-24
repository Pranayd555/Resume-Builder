# GitHub Security Setup Guide

## Fixing Trivy Vulnerability Scanner Issues

The Trivy vulnerability scanner in your CI/CD pipeline was failing because GitHub Code Scanning was not enabled for your repository. Here's how to fix it:

### What Was Fixed

1. **Added Required Permissions**: Added `security-events: write` permission to the workflow
2. **Added Error Handling**: Added `continue-on-error: true` to prevent workflow failures
3. **Added User Feedback**: Added a step to display scan results and provide guidance

### How to Enable GitHub Code Scanning

1. **Go to Repository Settings**:
   - Navigate to your repository on GitHub
   - Click on "Settings" tab

2. **Enable Code Scanning**:
   - In the left sidebar, click "Security & analysis"
   - Find "Code scanning" section
   - Click "Set up" or "Enable"

3. **Choose Code Scanning Tool**:
   - Select "GitHub Advanced Security (GHAS)" if available
   - Or choose "CodeQL" for basic scanning
   - Follow the setup wizard

### Alternative: Use Trivy Without GitHub Security Tab

If you don't want to enable Code Scanning, you can modify the workflow to only run Trivy locally:

```yaml
- name: Run Trivy vulnerability scanner
  uses: aquasecurity/trivy-action@master
  with:
    scan-type: 'fs'
    scan-ref: '.'
    format: 'table'
    output: 'trivy-results.txt'

- name: Display Trivy results
  run: |
    echo "=== Trivy Security Scan Results ==="
    if [ -f "trivy-results.txt" ]; then
      cat trivy-results.txt
    else
      echo "No vulnerabilities found or scan failed"
    fi
```

### Current Workflow Changes

The following changes were made to `.github/workflows/ci-cd.yml`:

1. **Added workflow-level permissions**:
   ```yaml
   permissions:
     security-events: write
     actions: read
     contents: read
   ```

2. **Added error handling to Trivy upload**:
   ```yaml
   - name: Upload Trivy scan results to GitHub Security tab
     uses: github/codeql-action/upload-sarif@v3
     if: always()
     with:
       sarif_file: 'trivy-results.sarif'
     continue-on-error: true
   ```

3. **Added results summary step**:
   ```yaml
   - name: Display Trivy results summary
     if: always()
     run: |
       echo "=== Trivy Security Scan Results ==="
       if [ -f "trivy-results.sarif" ]; then
         echo "Scan completed successfully. Results saved to trivy-results.sarif"
         echo "Note: To view results in GitHub Security tab, enable Code Scanning in repository settings."
         echo "Go to: Settings > Security & analysis > Code scanning > Set up"
       else
         echo "No scan results found."
       fi
   ```

### Benefits of These Changes

1. **Workflow Won't Fail**: The security scan step won't cause the entire pipeline to fail
2. **Better Feedback**: You'll get clear information about what happened and what to do next
3. **Flexible**: Works whether Code Scanning is enabled or not
4. **Secure**: Proper permissions ensure the workflow can access security features when available

### Next Steps

1. **Commit and push** the updated workflow file
2. **Enable Code Scanning** in your repository settings (optional but recommended)
3. **Monitor** the next workflow run to ensure it completes successfully

The workflow should now run without the "Resource not accessible by integration" error, and you'll get helpful feedback about the security scan results. 