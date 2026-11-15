#!/usr/bin/env bash
# Print SonarCloud's findings for a pull request: the quality gate result and
# every issue it annotated (file:line). Reads the GitHub check run through the
# gh CLI, so no SonarCloud token is needed.
#
#   scripts/sonar-pr-issues.sh          # PR of the current branch
#   scripts/sonar-pr-issues.sh 34       # a specific PR
#
# "failure" annotations are the ones that break the quality gate's ratings
# (security / reliability) or are critical; fix those first, then the rest.
set -euo pipefail

repo=$(gh repo view --json nameWithOwner -q .nameWithOwner)
pr=${1:-$(gh pr view --json number -q .number)}
sha=$(gh pr view "$pr" --json headRefOid -q .headRefOid)

run=$(gh api "repos/$repo/commits/$sha/check-runs" \
  -q '.check_runs[] | select(.name | test("SonarCloud")) | "\(.id) \(.conclusion // .status)"' | head -n 1)
if [ -z "$run" ]; then
  echo "No SonarCloud check on PR #$pr ($sha) yet."
  exit 0
fi

id=${run%% *}
echo "SonarCloud on PR #$pr ($sha): ${run#* }"
gh api "repos/$repo/check-runs/$id" -q '.output.title // ""'
gh api "repos/$repo/check-runs/$id" -q '.output.summary // ""' \
  | grep -oE '\[[A-E] [A-Za-z ]+ on New Code\]' | tr -d '[]' | sed 's/^/  failed: /' || true
echo
gh api --paginate "repos/$repo/check-runs/$id/annotations" \
  -q '.[] | "\(.annotation_level)\t\(.path):\(.start_line)\t\(.title)"' \
  | sort -r | column -t -s $'\t' || true
