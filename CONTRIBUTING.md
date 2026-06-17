# Contributing to the SDG Decision Intelligence Framework

Thank you for your interest in contributing to the SDG Decision Intelligence Framework. This document provides guidelines for contributing to the project, which is designed as a research-grade decision intelligence platform for sustainable development portfolio design.

---

## Table of Contents

1. [Contribution Philosophy](#contribution-philosophy)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Coding Standards](#coding-standards)
5. [Architecture Standards](#architecture-standards)
6. [Documentation Standards](#documentation-standards)
7. [Testing Expectations](#testing-expectations)
8. [Pull Request Process](#pull-request-process)
9. [Research Contributions](#research-contributions)

---

## Contribution Philosophy

The SDG Decision Intelligence Framework is a research-oriented project that values:

- **Rigor**: All contributions should be mathematically sound and empirically validated where possible
- **Transparency**: Code and documentation should be clear, well-documented, and explainable
- **Reproducibility**: Research contributions should be reproducible and well-documented
- **Collaboration**: We welcome contributions from researchers, practitioners, and developers
- **Impact**: Contributions should advance the state of the art or improve practical utility

### Types of Contributions

We welcome contributions in the following areas:

- **Core Algorithms**: New graph algorithms, MCDA methods, scoring systems
- **Research**: Empirical validation, case studies, methodological improvements
- **Documentation**: Technical documentation, user guides, research papers
- **Testing**: Test coverage, validation datasets, benchmarking
- **Infrastructure**: Build tools, CI/CD, deployment automation
- **Internationalization**: Translations, localization

---

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- TypeScript 6.0+
- Git
- Familiarity with the project architecture

### Initial Setup

```bash
# Clone the repository
git clone https://github.com/your-org/sdg-decision-intelligence-framework.git
cd sdg-decision-intelligence-framework

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

### Development Environment

We recommend using:
- **IDE**: VS Code with TypeScript and Preact extensions
- **Node Version**: Use nvm to manage Node versions
- **Git Hooks**: Configure Husky for pre-commit hooks

---

## Development Workflow

### Branch Strategy

- **main**: Production-ready code
- **develop**: Integration branch for features
- **feature/***: Feature branches
- **bugfix/***: Bug fix branches
- **research/***: Research and experimental branches
- **docs/***: Documentation updates

### Workflow Steps

1. **Create Branch**: Create a descriptive branch from `develop`
   ```bash
   git checkout -b feature/your-feature-name develop
   ```

2. **Develop**: Implement your changes following coding standards

3. **Test**: Write and run tests
   ```bash
   npm test
   ```

4. **Document**: Update documentation as needed

5. **Commit**: Commit with clear, descriptive messages
   ```bash
   git commit -m "feat: add new centrality measure"
   ```

6. **Push**: Push to your fork
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Pull Request**: Create a pull request to `develop`

### Commit Message Convention

We follow conventional commits:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Test additions or changes
- `chore`: Maintenance tasks

**Format**:
```
type(scope): subject

body

footer
```

**Example**:
```
feat(graph): add eigenvector centrality calculation

Implement eigenvector centrality using power iteration method.
Includes normalization and convergence checking.

Closes #123
```

---

## Coding Standards

### TypeScript Standards

#### Type Safety

- **Strict Mode**: Always use strict TypeScript settings
- **No Any**: Avoid `any` type; use specific types or `unknown`
- **Interfaces**: Use interfaces for object shapes
- **Type Inference**: Leverage type inference where appropriate

```typescript
// Good
interface CentralityResult {
  nodeId: number;
  score: number;
  rank: number;
}

function calculateCentrality(graph: Graph): CentralityResult[] {
  // Implementation
}

// Bad
function calculateCentrality(graph: any): any[] {
  // Implementation
}
```

#### Functional Programming

- **Pure Functions**: Prefer pure functions without side effects
- **Immutability**: Use immutable data structures where possible
- **Explicit Dependencies**: Pass dependencies explicitly

```typescript
// Good
function calculateScore(params: InitiativeParams): Score {
  // Pure function, no side effects
}

// Bad
let globalState = {};
function calculateScore(params: InitiativeParams): Score {
  globalState = params; // Side effect
}
```

#### Error Handling

- **Explicit Types**: Use union types for error handling
- **Error Objects**: Create custom error types
- **Graceful Degradation**: Handle errors gracefully

```typescript
// Good
type Result<T> = { success: true; data: T } | { success: false; error: Error };

function calculateScore(params: InitiativeParams): Result<Score> {
  try {
    const score = computeScore(params);
    return { success: true, data: score };
  } catch (error) {
    return { success: false, error: error as Error };
  }
}

// Bad
function calculateScore(params: InitiativeParams): Score {
  return computeScore(params); // May throw
}
```

### Code Organization

#### File Structure

```
src/
├── components/       # UI components
├── services/         # Business logic services
├── utils/            # Pure utility functions
├── types/            # TypeScript type definitions
├── hooks/            # React/Preact hooks
├── context/          # Context providers
└── store/            # State management
```

#### Naming Conventions

- **Files**: kebab-case (`graph-algorithms.ts`)
- **Components**: PascalCase (`GraphVisualization.tsx`)
- **Functions**: camelCase (`calculateCentrality`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_ITERATIONS`)
- **Types/Interfaces**: PascalCase (`Graph`, `CentralityResult`)

### Code Style

We use ESLint and Prettier for consistent code style:

```bash
# Lint code
npm run lint

# Format code
npm run format
```

**Key Style Rules**:
- 2-space indentation
- Single quotes for strings
- Trailing commas where allowed
- No semicolons (Prettier default)
- Max line length: 100 characters

---

## Architecture Standards

### Layered Architecture

The project follows a strict layered architecture:

```
UI Layer (pure presentational)
  ↓
Presentation Layer (UI state, coordination)
  ↓
Domain Layer (business logic, analytical engines)
  ↓
Data Layer (data access, external integrations)
```

**Rules**:
- UI Layer: No business logic, props-driven
- Presentation Layer: UI state only, delegates to domain
- Domain Layer: Pure functions, no UI dependencies
- Data Layer: Data access only, no business logic

### Dependency Rules

- **No Circular Dependencies**: Components should not create circular imports
- **Layer Dependencies**: Higher layers can depend on lower layers, not vice versa
- **Interface Segregation**: Depend on abstractions, not concrete implementations

### Service Design

#### Pure Functions

Analytical engines should be pure functions:

```typescript
// Good
export function calculateDegreeCentrality(graph: Graph): Map<number, number> {
  // Pure function, deterministic output
}

// Bad
export class CentralityCalculator {
  private cache = new Map();
  
  calculate(graph: Graph) {
    // Has state, not pure
  }
}
```

#### Dependency Injection

Services should receive dependencies:

```typescript
// Good
export class ScoringEngine {
  constructor(
    private graphService: GraphService,
    private mcdaService: MCDAService
  ) {}
}

// Bad
export class ScoringEngine {
  private graphService = new GraphService(); // Hard dependency
}
```

### Type Definitions

All public APIs should have explicit type definitions:

```typescript
// Good
export interface Graph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export function analyzeGraph(graph: Graph): GraphAnalysis {
  // Implementation
}

// Bad
export function analyzeGraph(graph: any) {
  // Implementation
}
```

---

## Documentation Standards

### Code Documentation

#### JSDoc Comments

Document all public functions and complex logic:

```typescript
/**
 * Calculate degree centrality for each node in the graph.
 * 
 * Degree centrality measures the number of connections a node has,
 * normalized by the maximum possible connections (n-1).
 * 
 * @param graph - The graph to analyze
 * @returns Map of node IDs to degree centrality scores (0-1)
 * 
 * @example
 * ```typescript
 * const graph = { nodes: [{id: 1}], edges: [] };
 * const centrality = calculateDegreeCentrality(graph);
 * // centrality.get(1) === 0
 * ```
 * 
 * @complexity O(|V| + |E|) where V is vertices, E is edges
 * 
 * @see {@link https://en.wikipedia.org/wiki/Centrality|Centrality on Wikipedia}
 */
export function calculateDegreeCentrality(graph: Graph): Map<number, number> {
  // Implementation
}
```

#### Inline Comments

Use inline comments for complex logic:

```typescript
// Normalize by (n-1) to get value in range [0, 1]
centrality.forEach((value, key) => {
  centrality.set(key, n > 1 ? value / (n - 1) : 0);
});
```

### README Documentation

Update README.md for user-facing changes:

- New features
- Breaking changes
- Configuration changes
- Migration guides

### Technical Documentation

Update technical documentation in `docs/`:

- **ARCHITECTURE.md**: For architecture changes
- **GRAPH_MODEL.md**: For graph algorithm changes
- **SCORING_SYSTEMS.md**: For scoring system changes
- **SIMULATION_ENGINE.md**: For simulation changes
- **DECISION_INTELLIGENCE.md**: For decision logic changes

### Research Documentation

For research contributions:

- Document methodology in METHODOLOGY.md
- Add references to existing literature
- Include empirical validation results
- Provide reproducibility information

---

## Testing Expectations

### Test Coverage

We aim for:
- **Overall Coverage**: 80%+
- **Core Algorithms**: 90%+
- **Critical Paths**: 95%+

### Test Structure

```
src/__tests__/
├── graphAlgorithms.test.ts
├── scoringEngine.test.ts
├── mcdaMethods.test.ts
└── setup.ts
```

### Test Types

#### Unit Tests

Test individual functions in isolation:

```typescript
describe('calculateDegreeCentrality', () => {
  it('should calculate degree centrality correctly', () => {
    const graph: Graph = {
      nodes: [{id: 1, label: 'A'}, {id: 2, label: 'B'}],
      edges: [{from: 1, to: 2, weight: 1}]
    };
    
    const result = calculateDegreeCentrality(graph);
    
    expect(result.get(1)).toBe(1);
    expect(result.get(2)).toBe(1);
  });
  
  it('should handle empty graph', () => {
    const graph: Graph = { nodes: [], edges: [] };
    const result = calculateDegreeCentrality(graph);
    expect(result.size).toBe(0);
  });
});
```

#### Integration Tests

Test component interactions:

```typescript
describe('Scoring Engine Integration', () => {
  it('should calculate all scores for an initiative', () => {
    const initiative: Initiative = {
      // ... initiative data
    };
    
    const scores = calculateInitiativeScores(initiative);
    
    expect(scores.impact).toBeGreaterThanOrEqual(0);
    expect(scores.impact).toBeLessThanOrEqual(100);
    expect(scores.overall).toBeDefined();
  });
});
```

#### Research Validation Tests

For research contributions, include validation tests:

```typescript
describe('Centrality Validation', () => {
  it('should match published results for standard graphs', () => {
    // Test against known results from literature
    const karateClubGraph = loadKarateClubGraph();
    const result = calculateBetweennessCentrality(karateClubGraph);
    
    // Compare with published values
    expect(result.get(34)).toBeCloseTo(0.43, 0.01);
  });
});
```

### Test Data

Use test fixtures for reproducible tests:

```typescript
// __tests__/fixtures/graphs.ts
export const completeGraph: Graph = {
  nodes: [/* ... */],
  edges: [/* ... */]
};

export const starGraph: Graph = {
  nodes: [/* ... */],
  edges: [/* ... */]
};
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test graphAlgorithms.test.ts
```

---

## Pull Request Process

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] All tests passing
- [ ] Test coverage maintained/improved

## Documentation
- [ ] Code documented with JSDoc
- [ ] Technical documentation updated
- [ ] README updated (if user-facing)
- [ ] Research documentation added (if research contribution)

## Checklist
- [ ] Code follows style guidelines
- [ ] No linting errors
- [ ] No TypeScript errors
- [ ] Commit messages follow convention
- [ ] PR description is clear
```

### Review Process

1. **Automated Checks**: CI/CD runs tests, linting, type checking
2. **Peer Review**: At least one maintainer reviews the PR
3. **Research Review**: Research contributions require additional review
4. **Approval**: Maintainer approves and merges

### Review Criteria

- **Correctness**: Code is correct and well-tested
- **Style**: Code follows project standards
- **Documentation**: Changes are well-documented
- **Impact**: Changes align with project goals
- **Research Quality**: Research contributions are rigorous and validated

---

## Research Contributions

### Research Standards

Research contributions must meet additional standards:

#### Methodological Rigor

- Clear research question and hypothesis
- Appropriate methodology for the question
- Reproducible experimental setup
- Statistical significance where applicable

#### Empirical Validation

- Validation against real-world data where possible
- Comparison with baseline methods
- Ablation studies for complex methods
- Error analysis and discussion

#### Documentation

- Complete methodology documentation
- Reproducibility information (data, code, parameters)
- Limitations and assumptions clearly stated
- Comparison with related work

### Research Contribution Process

1. **Proposal**: Open issue with research proposal
2. **Discussion**: Discuss approach with maintainers
3. **Implementation**: Implement in research branch
4. **Validation**: Conduct empirical validation
5. **Documentation**: Document methodology and results
6. **Review**: Research review process
7. **Publication**: Consider joint publication

### Research Branches

Use `research/` prefix for research branches:

```bash
git checkout -b research/dynamic-network-modeling develop
```

Research branches may have longer development cycles and different review processes.

---

## Getting Help

### Communication Channels

- **GitHub Issues**: Bug reports, feature requests, questions
- **GitHub Discussions**: General discussions, ideas
- **Email**: For sensitive issues or private questions

### Asking Good Questions

When asking for help:

1. **Search first**: Check existing issues and documentation
2. **Be specific**: Provide clear, detailed information
3. **Include context**: Share relevant code, error messages, environment
4. **Show effort**: Demonstrate what you've tried

### Issue Templates

Use appropriate issue templates:

- **Bug Report**: For reporting bugs
- **Feature Request**: For proposing new features
- **Research Proposal**: For proposing research contributions
- **Question**: For asking questions

---

## Recognition

Contributors will be recognized in:

- CONTRIBUTORS.md file
- Release notes for significant contributions
- Research papers for research contributions
- Conference presentations for major contributions

---

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

## Contact

For questions about contributing, contact the maintainers through GitHub issues or email.

---

Thank you for contributing to the SDG Decision Intelligence Framework!
