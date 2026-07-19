# Changelog

## [2.9.1]
### Maintenance & Chores
- **docs**: updated configuration documentation (`docs/configuration.md`) and added Quick Start guide to `README.md`.
- **chore**: removed unused python scripts (`check_circular.py`, `check_ddd.py`).
- **chore**: added ESLint + `@typescript-eslint` configuration and resolved critical `prefer-as-const` / `preserve-caught-error` errors.
- **chore**: added `.env.example` to hide actual secrets, ensured `.env` is gitignored.
- **chore**: cleaned up generated files (`coverage/`, `dist/`) from git tracking, and added comprehensive `.gitignore`.

---
0b6abd7 chore: update gitignore for node_modules and OS files
108d288 docs: provider runtime documentation
532744c feat(runtime): production provider execution
a4081a1 feat(config): provider configuration
5b8df80 feat(runtime): replace demo pipelines with provider runtime
f2fa4f4 Merge branch 'worktree-my-worktree' into chore/wire-pipelines
cd45caf feat(prompt): add prompt management system
52e018d chore: add CLAUDE.md with architectural guidelines and commands
6caa179 feat(provider): add provider abstraction layer
