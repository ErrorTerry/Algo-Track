#!/usr/bin/env bash
set -euo pipefail

# 현재 레포에 적용
REPO="$(gh repo view --json nameWithOwner -q .nameWithOwner)"

echo "Creating labels on $REPO ..."

# area
gh label create "area:frontend"  --color "4E88FF" --description "Frontend related work"   -R "$REPO" || true
gh label create "area:backend"   --color "8D5BFF" --description "Backend related work"    -R "$REPO" || true
gh label create "area:fullstack" --color "4CAF50" --description "Frontend + Backend"      -R "$REPO" || true
gh label create "area:infra"     --color "B08800" --description "Infra/CI/CD"             -R "$REPO" || true
gh label create "area:docs"      --color "6A737D" --description "Documentation"           -R "$REPO" || true

# type
gh label create "type:bug"      --color "D73A49" --description "Bug fix"                 -R "$REPO" || true
gh label create "type:feature"  --color "0E8A16" --description "New feature"             -R "$REPO" || true
gh label create "type:refactor" --color "0366D6" --description "Refactor"                -R "$REPO" || true
gh label create "type:chore"    --color "586069" --description "Chore / maintenance"     -R "$REPO" || true
gh label create "type:test"     --color "1D76DB" --description "Testing"                 -R "$REPO" || true
gh label create "type:question" --color "D876E3" --description "Question / discussion"   -R "$REPO" || true

# priority
gh label create "priority:critical" --color "B60205" --description "Must fix ASAP"       -R "$REPO" || true
gh label create "priority:high"     --color "E99695" --description "High priority"       -R "$REPO" || true
gh label create "priority:medium"   --color "FBCA04" --description "Medium priority"     -R "$REPO" || true
gh label create "priority:low"      --color "C2E0C6" --description "Low priority"        -R "$REPO" || true

# status
gh label create "status:blocked"      --color "000000" --description "Blocked"           -R "$REPO" || true
gh label create "status:needs-triage" --color "7057FF" --description "Needs triage"      -R "$REPO" || true

echo "Done ✅"
