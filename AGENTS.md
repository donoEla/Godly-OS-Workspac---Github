# Godly OS — Development & Collaboration Guidelines

## Git Collaboration Protocol
1. **Always Check for Remote Updates First**:
   Before modifying files, adding features, or starting work, always inspect the remote GitHub repository (`git fetch origin` / `git pull origin main`) to ensure any commits from other developers are pulled and merged cleanly into the local workspace first.
2. **Push Only When Explicitly Instructed**:
   Never automatically run `git push`. Always stage and commit changes locally first, verify the code (`tsc -b && npm run build`), and only push to GitHub when the user explicitly instructs: "push to github" or "push".
3. **Repository URL**:
   Origin: `https://github.com/donoEla/Godly-OS-Workspac---Github.git`
   Default branch: `main`
