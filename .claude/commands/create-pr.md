---
description: Create pull request for current feature branch
argument-hint: <optional-pr-title>
---

@ROADMAP.md

**Pull Request Creation Workflow**

Additional context for PR title: $ARGUMENTS

Execute the following steps in order:

## 1. Detect Current Branch and Validate

```bash
# Get current branch
CURRENT_BRANCH=$(git branch --show-current)

# Check if on a feature branch (not main/develop)
if [[ "$CURRENT_BRANCH" == "main" || "$CURRENT_BRANCH" == "develop" ]]; then
  echo "ERROR: Cannot create PR from main/develop branch"
  exit 1
fi

echo "Current branch: $CURRENT_BRANCH"
```

## 2. Determine Base Branch

**Check for develop branch:**
```bash
if git show-ref --verify --quiet refs/heads/develop; then
  BASE_BRANCH="develop"
elif git show-ref --verify --quiet refs/remotes/origin/develop; then
  BASE_BRANCH="develop"
else
  BASE_BRANCH="main"
fi

echo "Base branch: $BASE_BRANCH"
```

**Prompt user for confirmation:**
"Target base branch is `$BASE_BRANCH`. Is this correct? (y/n)"

## 3. Check for Uncommitted Changes

```bash
UNCOMMITTED=$(git status --porcelain | grep -v '.claude/settings.local.json' || true)

if [[ -n "$UNCOMMITTED" ]]; then
  echo "WARNING: Uncommitted changes detected"
  git status --short
  echo ""
  echo "What would you like to do?"
  echo "  1. Cancel and use /finish-session first (recommended)"
  echo "  2. Commit now with manual message"
  echo "  3. Continue anyway (PR will only include committed work)"
fi
```

## 4. Generate PR Title and Description

**Determine PR title:**
- If `$ARGUMENTS` is provided → Use it as title
- If `$ARGUMENTS` is empty → Generate from branch name and commits

**Auto-generate title from branch name:**
```bash
FEATURE_NAME=$(echo "$CURRENT_BRANCH" | sed 's|feature/||' | sed 's|-| |g')
PR_TITLE="feat: $FEATURE_NAME"
```

**Auto-generate description from commit history:**
```bash
git log $BASE_BRANCH..HEAD --pretty=format:"- %s" > /tmp/pr_commits.txt
```

**Create description template:**
```markdown
## Summary
[Brief description of what this feature implements]

## Changes
$(cat /tmp/pr_commits.txt)

## Testing
- [ ] Backend tests passing
- [ ] Web tests passing (if applicable)
- [ ] Mobile tests passing (if applicable)
- [ ] Manual testing completed

## Documentation
- [ ] ROADMAP.md updated
- [ ] OpenAPI/Swagger annotations added (if new endpoints)
- [ ] README.md updated (if user-facing changes)

Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```

## 5. Create Pull Request with GitHub CLI

```bash
gh pr create \
  --base "$BASE_BRANCH" \
  --head "$CURRENT_BRANCH" \
  --title "$PR_TITLE" \
  --body "[Generated description]"
```

**Capture PR URL:**
```bash
PR_URL=$(gh pr view --json url --jq .url)
echo "Pull Request created: $PR_URL"
```

## 6. Final Summary

```
Pull Request Created

PR Details:
- Title: $PR_TITLE
- URL: $PR_URL
- Base: $BASE_BRANCH ← $CURRENT_BRANCH

Next Steps:
1. Review PR at: $PR_URL
2. Address any CI/CD failures
3. Wait for approval and merge
```
