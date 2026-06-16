# Architecture Layers

This directory contains the organized architectural layers of the SDG Atlas Government application.

## Layer Structure

### 1. UI Layer (`ui/`)
Purely presentational components with no business logic.
- Receive data via props
- Emit events via callbacks
- No direct state management
- No side effects

### 2. Presentation Layer (`presentation/`)
Components that handle UI state and user interactions.
- Manage local UI state (expanded/collapsed, modals, etc.)
- Coordinate between UI components
- Delegate business logic to domain layer
- Use custom hooks for shared behavior

### 3. Domain Layer (`domain/`)
Business logic and domain models.
- Services for business operations
- Domain-specific types and interfaces
- Business rules and validations
- Data transformations

### 4. Data Layer (`data/`)
Data access and external integrations.
- API clients
- Local storage operations
- Data fetching and caching
- External service integrations

## Migration Progress

- ✅ State management migrated to Zustand (store/)
- ✅ Custom hooks created (hooks/)
- ⏳ Component layer separation in progress
- ⏳ Business logic extraction in progress
