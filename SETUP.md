# Setup Guide

This guide provides detailed instructions for setting up the SDG Decision Intelligence Framework development environment.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Development Workflow](#development-workflow)
4. [Building](#building)
5. [Testing](#testing)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### System Requirements

- **Operating System**: macOS, Linux, or Windows (with WSL2)
- **Node.js**: Version 18.0 or higher
- **npm**: Version 9.0 or higher (comes with Node.js)
- **Git**: Version 2.0 or higher
- **Disk Space**: At least 500 MB free space

### Optional but Recommended

- **nvm**: Node Version Manager for managing Node versions
- **VS Code**: Recommended IDE with TypeScript and Preact extensions
- **GitHub CLI**: For GitHub integration

---

## Installation

### Step 1: Install Node.js

#### Using nvm (Recommended)

```bash
# Install nvm (macOS/Linux)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Install nvm (Windows)
# Download and install from https://github.com/coreybutler/nvm-windows

# Install Node.js 18
nvm install 18
nvm use 18

# Verify installation
node --version
npm --version
```

#### Using Official Installer

Download and install from https://nodejs.org/

### Step 2: Clone the Repository

```bash
# Clone the repository
git clone https://github.com/your-org/sdg-decision-intelligence-framework.git
cd sdg-decision-intelligence-framework

# Verify clone
ls
```

### Step 3: Install Dependencies

```bash
# Install all dependencies
npm install

# Verify installation
npm list --depth=0
```

### Step 4: Verify Installation

```bash
# Run tests to verify setup
npm test

# Start development server
npm run dev
```

The development server should start at http://localhost:5173

---

## Development Workflow

### Starting the Development Server

```bash
# Start development server with hot module replacement
npm run dev

# The server will start at http://localhost:5173
# Open this URL in your browser
```

### Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode (re-run on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests with UI interface
npm run test:ui
```

### Building for Production

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# The preview server will start at http://localhost:4173
```

### Code Quality

```bash
# Run linter
npm run lint

# Run linter and auto-fix issues
npm run lint:fix

# Format code with Prettier
npm run format
```

---

## Building

### Development Build

```bash
# Development build (not minified, includes source maps)
npm run dev
```

### Production Build

```bash
# Production build (minified, optimized)
npm run build

# Output will be in the dist/ directory
```

### Build Options

The build process uses Vite with the following configuration:

- **TypeScript**: Strict type checking
- **Minification**: Enabled for production
- **Source Maps**: Generated for development
- **Tree Shaking**: Removes unused code
- **Code Splitting**: Automatic chunk splitting

### Build Output

```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── [other assets]
```

---

## Reproducibility Workflow

This section documents the complete workflow for reproducing the framework's behavior and results as described in the documentation.

### Complete Reproduction Steps

To reproduce the exact examples and results from the documentation:

```bash
# 1. Clone the repository
git clone https://github.com/your-org/sdg-decision-intelligence-framework.git
cd sdg-decision-intelligence-framework

# 2. Install dependencies
npm install

# 3. Run the test suite to verify correctness
npm test

# 4. Start the development server
npm run dev

# 5. Open http://localhost:5173 in your browser
# The application should load with the default example scenarios
```

### Verifying Reproducibility

After completing the setup steps, you should be able to:

1. **Load Example Projects**: The dashboard should display sample SDG initiatives with pre-calculated scores
2. **Run Scoring Algorithms**: All scoring functions should produce deterministic results for identical inputs
3. **Reproduce Graph Analysis**: Network metrics (centrality, betweenness, etc.) should be consistent across runs
4. **Validate MCDA Methods**: AHP, TOPSIS, ELECTRE, and PROMETHEE should produce consistent rankings
5. **Monte Carlo Results**: Simulation runs with fixed random seeds should produce identical outputs

### Deterministic Behavior

The framework ensures reproducibility through:

- **Fixed Random Seeds**: Monte Carlo simulations use seeded random number generators for consistent results
- **Deterministic Algorithms**: All scoring and graph algorithms are deterministic
- **Version-Pinned Dependencies**: `package-lock.json` ensures exact dependency versions
- **Type-Safe Implementation**: TypeScript prevents runtime type errors that could cause non-deterministic behavior

### Test Coverage

The test suite (`src/__tests__/`) validates:

- Graph algorithm correctness (centrality, community detection, path analysis)
- Scoring engine accuracy (impact, sustainability, feasibility, SDG alignment)
- MCDA method implementation (AHP, TOPSIS, ELECTRE, PROMETHEE)
- Consensus ranking aggregation
- Formula-to-implementation traceability

Running `npm test` should pass all tests, confirming that your environment reproduces the expected behavior.

### Troubleshooting Reproducibility Issues

If results differ from documentation:

1. **Check Node.js Version**: Ensure you're using Node.js 18.0 or higher
2. **Verify Dependencies**: Run `npm install` to ensure exact dependency versions
3. **Clear Caches**: Remove `.vite` and `node_modules/.cache` directories
4. **Run Tests**: `npm test` should pass without errors
5. **Check Environment Variables**: Ensure no conflicting `.env` files are present

### Reporting Reproducibility Issues

If you cannot reproduce the documented results:

1. Document your environment (OS, Node.js version, npm version)
2. Run `npm test` and report any failing tests
3. Provide the specific example or scenario that fails to reproduce
4. Include error messages or unexpected outputs

---

## Testing

### Test Structure

```
src/__tests__/
├── graphAlgorithms.test.ts
├── scoringEngine.test.ts
├── mcdaMethods.test.ts
└── setup.ts
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test graphAlgorithms.test.ts

# Run tests matching a pattern
npm test -- graph
```

### Test Coverage

```bash
# Generate coverage report
npm run test:coverage

# Coverage report will be in coverage/ directory
# Open coverage/index.html in browser to view
```

### Writing Tests

See [CONTRIBUTING.md](CONTRIBUTING.md) for testing guidelines and standards.

---

## Troubleshooting

### Common Issues

#### Issue: "Module not found" Error

**Solution**:
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Issue: TypeScript Compilation Errors

**Solution**:
```bash
# Ensure TypeScript version is correct
npm list typescript

# Reinstall TypeScript
npm install --save-dev typescript@latest

# Clear TypeScript cache
rm -rf .vite
npm run dev
```

#### Issue: Port Already in Use

**Solution**:
```bash
# Find process using port 5173
lsof -i :5173  # macOS/Linux
netstat -ano | findstr :5173  # Windows

# Kill the process or use different port
npm run dev -- --port 3000
```

#### Issue: Tests Failing After Dependency Update

**Solution**:
```bash
# Update all dependencies
npm update

# If issues persist, reinstall from scratch
rm -rf node_modules package-lock.json
npm install
```

#### Issue: Build Fails with Memory Error

**Solution**:
```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

### Getting Help

If you encounter issues not covered here:

1. Check [GitHub Issues](https://github.com/your-org/sdg-decision-intelligence-framework/issues)
2. Search existing documentation
3. Open a new issue with detailed information:
   - Operating system and version
   - Node.js and npm versions
   - Error messages and stack traces
   - Steps to reproduce

---

## IDE Setup

### VS Code

#### Recommended Extensions

- **TypeScript**: TypeScript language support
- **Preact**: Preact syntax highlighting
- **ESLint**: Linting support
- **Prettier**: Code formatting
- **GitLens**: Git integration

#### VS Code Settings

Create `.vscode/settings.json`:

```json
{
  "typescript.tsdk": "node_modules/typescript/lib",
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

#### VS Code Tasks

Create `.vscode/tasks.json`:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "dev",
      "type": "npm",
      "script": "dev",
      "problemMatcher": []
    },
    {
      "label": "test",
      "type": "npm",
      "script": "test",
      "problemMatcher": []
    },
    {
      "label": "build",
      "type": "npm",
      "script": "build",
      "problemMatcher": []
    }
  ]
}
```

### Other IDEs

The project can be developed with any IDE that supports TypeScript. Ensure your IDE is configured to:

- Use the TypeScript version from `node_modules`
- Enable strict type checking
- Configure ESLint and Prettier integration

---

## Environment Variables

### Development Variables

Create a `.env` file in the project root:

```env
# Development settings
VITE_API_URL=http://localhost:3000
VITE_ENABLE_DEV_TOOLS=true
```

### Production Variables

Create a `.env.production` file:

```env
# Production settings
VITE_API_URL=https://api.example.com
VITE_ENABLE_DEV_TOOLS=false
```

### Available Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | API endpoint URL | (empty) |
| `VITE_ENABLE_DEV_TOOLS` | Enable development tools | `true` |

---

## Git Configuration

### Setting Up Git

```bash
# Configure Git user (if not already configured)
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Configure line endings (macOS/Linux)
git config --global core.autocrlf input

# Configure line endings (Windows)
git config --global core.autocrlf true
```

### Git Hooks

The project uses Husky for Git hooks. Hooks are automatically installed during `npm install`.

### Pre-commit Hook

The pre-commit hook runs:
- ESLint
- Prettier formatting
- TypeScript type checking

### Pre-push Hook

The pre-push hook runs:
- All tests
- Build verification

---

## Performance Tips

### Development Performance

- Use `npm run dev` for hot module replacement
- Avoid running unnecessary background processes
- Use Chrome DevTools for performance profiling

### Build Performance

- Use `npm run build` for optimized production builds
- Enable tree shaking by using ES modules
- Minimize bundle size by avoiding large dependencies

---

## Security Considerations

### Dependency Security

```bash
# Audit dependencies for vulnerabilities
npm audit

# Fix vulnerabilities automatically
npm audit fix

# Review security updates
npm outdated
```

### Environment Variables

- Never commit `.env` files
- Use `.env.example` as a template
- Rotate API keys regularly

---

## Next Steps

After completing setup:

1. Read the [README.md](README.md) for project overview
2. Review [ARCHITECTURE.md](docs/ARCHITECTURE.md) for technical details
3. Explore the codebase starting with `src/`
4. Run the development server and explore the UI
5. Review [CONTRIBUTING.md](CONTRIBUTING.md) to start contributing

---

## Additional Resources

- [Vite Documentation](https://vitejs.dev/)
- [Preact Documentation](https://preactjs.com/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Vitest Documentation](https://vitest.dev/)

---

## Support

For setup issues:

1. Check this guide first
2. Search [GitHub Issues](https://github.com/your-org/sdg-decision-intelligence-framework/issues)
3. Open a new issue with detailed information

Happy coding!
