# Contributing Guide

## Welcome! 👋

Thank you for considering contributing to this project. This guide will help you understand our workflow and standards.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Branching Strategy](#branching-strategy)
- [Commit Convention](#commit-convention)
- [Code Standards](#code-standards)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow

## Getting Started

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- Git

### Setup

```bash
# Fork the repository
# Clone your fork
git clone https://github.com/YOUR_USERNAME/Bilisim_Vadisi_Hackathon.git
cd Bilisim_Vadisi_Hackathon

# Add upstream remote
git remote add upstream https://github.com/erendemirer1/Bilisim_Vadisi_Hackathon.git

# Install dependencies
cd backend && npm install
cd ../frontend && npm install
```

## Development Workflow

### 1. Sync with Upstream

```bash
git checkout main
git pull upstream main
git push origin main
```

### 2. Create Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 3. Make Changes

```bash
# Make your changes
# Run tests
npm test

# Run linter
npm run lint

# Format code
npm run format
```

### 4. Commit Changes

```bash
git add .
git commit -m "feat: add amazing feature"
```

### 5. Push and Create PR

```bash
git push origin feature/your-feature-name
# Create Pull Request on GitHub
```

## Branching Strategy

We use **Git Flow** branching model:

```
main (production)
  └── dev (development)
       ├── feature/user-auth
       ├── feature/api-endpoints
       ├── bugfix/login-error
       └── hotfix/security-patch
```

### Branch Types

#### `main`
- Production-ready code
- Protected branch
- Only merge via PR from `dev`
- Tags for releases (v1.0.0, v1.1.0)

#### `dev`
- Development branch
- Integration branch for features
- CI/CD runs on push
- Merge features here first

#### `feature/*`
- New features
- Branch from: `dev`
- Merge to: `dev`
- Example: `feature/user-authentication`

#### `bugfix/*`
- Bug fixes
- Branch from: `dev`
- Merge to: `dev`
- Example: `bugfix/login-validation`

#### `hotfix/*`
- Critical production fixes
- Branch from: `main`
- Merge to: `main` AND `dev`
- Example: `hotfix/security-vulnerability`

#### `release/*`
- Release preparation
- Branch from: `dev`
- Merge to: `main` and `dev`
- Example: `release/v1.2.0`

### Branch Naming

```bash
# Features
feature/user-authentication
feature/api-rate-limiting
feature/docker-optimization

# Bug fixes
bugfix/memory-leak
bugfix/null-pointer-error

# Hotfixes
hotfix/security-patch
hotfix/critical-crash

# Releases
release/v1.0.0
release/v2.0.0-beta
```

## Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

### Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style (formatting, semicolons, etc.)
- **refactor**: Code refactoring
- **perf**: Performance improvements
- **test**: Adding/updating tests
- **chore**: Build process, dependencies, etc.
- **ci**: CI/CD changes

### Examples

```bash
# Feature
git commit -m "feat: add user authentication endpoint"
git commit -m "feat(backend): implement JWT token validation"

# Bug fix
git commit -m "fix: resolve memory leak in server"
git commit -m "fix(frontend): correct responsive layout on mobile"

# Documentation
git commit -m "docs: update API documentation"
git commit -m "docs(readme): add deployment instructions"

# Breaking change
git commit -m "feat!: change API response format

BREAKING CHANGE: API now returns data in different structure"
```

### Commit Message Guidelines

**DO:**
- Use imperative mood ("add" not "added")
- Keep first line under 72 characters
- Reference issues: `fix: resolve login bug (#123)`
- Be specific and descriptive

**DON'T:**
- Write vague messages: "fix stuff"
- Use past tense: "added feature"
- Commit unrelated changes together

## Code Standards

### Backend (Node.js)

```bash
# Run linter
npm run lint

# Auto-fix issues
npm run lint:fix

# Format code
npm run format
```

**Rules:**
- Use `const` and `let`, never `var`
- Semicolons required
- 2 spaces indentation
- Single quotes for strings (configurable)
- Descriptive variable names
- JSDoc comments for functions

### Frontend (HTML/CSS)

```bash
# Lint HTML
npm run lint:html

# Format code
npm run format
```

**Rules:**
- Semantic HTML
- Lowercase tags and attributes
- Double quotes for attributes
- Alt text for images
- Accessible markup

### General

- **File naming**: lowercase-with-dashes.js
- **Max line length**: 80 characters
- **Function size**: Keep functions small and focused
- **Comments**: Explain "why", not "what"
- **No commented code**: Remove it

## Testing

### Running Tests

```bash
# Backend tests
cd backend
npm test

# With coverage
npm test -- --coverage

# Watch mode
npm run test:watch
```

### Writing Tests

```javascript
describe("Feature Name", () => {
  test("should do something specific", () => {
    // Arrange
    const input = "test";
    
    // Act
    const result = myFunction(input);
    
    // Assert
    expect(result).toBe("expected");
  });
});
```

### Test Requirements

- All new features must have tests
- Bug fixes should include regression tests
- Aim for >80% code coverage
- Tests must pass before merging

## Pull Request Process

### Before Creating PR

- [ ] Branch from latest `dev`
- [ ] Follow commit conventions
- [ ] Run tests locally
- [ ] Run linters
- [ ] Update documentation
- [ ] Self-review your code

### Creating PR

1. **Title**: Follow commit convention
   ```
   feat: add user authentication
   ```

2. **Description**: Include
   - What changes were made
   - Why these changes were needed
   - How to test
   - Related issues (#123)
   - Screenshots (if UI changes)

3. **Template**:
   ```markdown
   ## Description
   Brief description of changes
   
   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update
   
   ## Testing
   - [ ] Tests pass locally
   - [ ] Added new tests
   - [ ] Manual testing done
   
   ## Checklist
   - [ ] Code follows style guidelines
   - [ ] Self-reviewed
   - [ ] Commented complex code
   - [ ] Updated documentation
   - [ ] No new warnings
   ```

### PR Review Process

1. **Automated checks** must pass:
   - CI pipeline
   - Linting
   - Tests
   - Build

2. **Code review** by maintainer:
   - Code quality
   - Test coverage
   - Documentation
   - Follows standards

3. **Approval** required before merge

4. **Squash and merge** to keep history clean

### After PR Merged

```bash
# Update your local branches
git checkout dev
git pull upstream dev

# Delete feature branch
git branch -d feature/your-feature
git push origin --delete feature/your-feature
```

## Review Guidelines

### For Reviewers

**Focus on:**
- Correctness and functionality
- Code quality and maintainability
- Test coverage
- Documentation
- Performance implications
- Security concerns

**Be:**
- Constructive and specific
- Respectful and encouraging
- Timely in responses

**Comment format:**
```
❌ "This is wrong"
✅ "Consider using Array.map() here for better readability"

❌ "Bad naming"
✅ "getUserData might be clearer as fetchUserData since it's async"
```

### For Contributors

- Respond to all comments
- Don't take feedback personally
- Ask questions if unclear
- Update PR based on feedback
- Mark conversations as resolved

## Release Process

### Version Numbering

We use [Semantic Versioning](https://semver.org/):

```
MAJOR.MINOR.PATCH (e.g., 1.2.3)
```

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes

### Creating a Release

```bash
# Update version
npm version minor  # or major, patch

# Create release branch
git checkout -b release/v1.2.0

# Update CHANGELOG.md
# Test thoroughly

# Merge to main
git checkout main
git merge release/v1.2.0

# Tag release
git tag -a v1.2.0 -m "Release v1.2.0"
git push origin v1.2.0

# Merge back to dev
git checkout dev
git merge main
```

## Getting Help

- 📖 Read the [README](../README.md)
- 📚 Check [Documentation](../docs/)
- 💬 Open an issue for questions
- 📧 Contact maintainers

## Recognition

Contributors will be added to:
- CONTRIBUTORS.md file
- Release notes
- README acknowledgments

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (MIT).

---

**Thank you for contributing! 🎉**
