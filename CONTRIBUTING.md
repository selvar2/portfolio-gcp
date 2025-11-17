# Contributing to Portfolio Backend

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Respect differing viewpoints

## How to Contribute

### Reporting Bugs

1. Check if the bug already exists in [Issues](https://github.com/yourusername/portfolio-gcp/issues)
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (OS, Node version, etc.)
   - Screenshots if applicable

### Suggesting Features

1. Check existing [Issues](https://github.com/yourusername/portfolio-gcp/issues) and [Pull Requests](https://github.com/yourusername/portfolio-gcp/pulls)
2. Create a new issue with:
   - Clear feature description
   - Use case and benefits
   - Possible implementation approach

### Pull Requests

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Write or update tests
5. Ensure tests pass (`npm test`)
6. Run linter (`npm run lint`)
7. Commit with clear messages
8. Push to your fork
9. Open a Pull Request

## Development Setup

```bash
# Clone your fork
git clone https://github.com/yourusername/portfolio-gcp.git
cd portfolio-gcp

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Run in development mode
npm run dev

# Run tests
npm test
```

## Code Style

- Follow TypeScript best practices
- Use ESLint configuration
- Format with Prettier
- Write meaningful comments
- Follow existing patterns

## Testing

- Write tests for new features
- Update tests for changed functionality
- Aim for >80% code coverage
- Test edge cases

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new portfolio endpoint
fix: resolve rate limiting issue
docs: update deployment guide
test: add contact form tests
refactor: simplify storage service
```

## Questions?

Open an issue or reach out to maintainers.
