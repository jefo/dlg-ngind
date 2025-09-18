# Project Context: dlg-ngind

## Project Overview

This is a TypeScript-based dialogue system framework called "dlg-ngind" that implements Domain-Driven Design (DDD) principles using the SotaJS framework. The system is designed to create conversational AI systems with a graph-based data structure approach.

### Core Technologies
- **Language:** TypeScript
- **Runtime:** Bun (JavaScript runtime)
- **Framework:** SotaJS (Domain-First Development Framework)
- **Architecture:** Domain-Driven Design (DDD) with Hexagonal Architecture principles
- **Package Management:** npm workspaces

### Project Structure
```
dlg-ngind/
├── packages/
│   ├── bot-persona/     # Bot personality and design domain
│   ├── chat/            # Chat functionality
│   └── event-bus/       # Event handling system
├── docs/                # Project documentation
├── examples/            # Example implementations
└── specs/               # Specifications
```

## Key Components

### 1. SotaJS Framework
SotaJS is a TypeScript framework focused on business logic as the most valuable asset of a project. Key principles include:
- **Domain-First Approach:** Business logic is at the center of development
- **Explicit Dependencies:** Uses `usePort()` hook for transparent dependency declaration
- **Functional Approach:** Business logic is expressed as simple async functions (Use Cases)
- **Testability:** Architecture designed for isolated testing
- **Separation of Logic and Presentation:** Use Cases don't return data directly but communicate results through Output Ports

### 2. Core Concepts
- **Domain Objects:** Aggregates, Entities, and Value Objects that model the business domain
- **Use Cases:** Atomic application operations that orchestrate interactions between domain models and external services
- **Ports:** Abstract contracts for interacting with external infrastructure
- **Output Ports:** Special ports that Use Cases call to notify the outside world of operation results
- **Adapters:** Concrete implementations of ports

### 3. Dialogue System Components
- **GraphYa:** Graph-based system for managing dialogue flows
- **Bot Persona:** System for defining bot personalities and behaviors
- **Conversation Management:** Runtime handling of active dialogues

## Development Workflow

### Building and Running
```bash
# Install dependencies
bun install

# Run the project
bun run index.ts
```

### Package Structure
Each package follows the SotaJS architecture:
```
package/
├── src/
│   ├── domain/          # Domain models (aggregates, entities, value objects)
│   ├── app/             # Use cases and business logic
│   └── infra/           # Infrastructure adapters and ports
├── tests/               # Unit and integration tests
└── docs/                # Package-specific documentation
```

## Architectural Principles

### 1. Domain-First Development
1. **Domain Modeling:** Create rich aggregates that encapsulate business rules
2. **Use Cases:** Functional orchestrators coordinating between domain models and external services
3. **Isolated Testing:** Ability to test all business logic without infrastructure
4. **Adapter Implementation:** Connect real infrastructure (DB, API) at the final stage

### 2. Dependency Injection
The DI system is built on key functions:
- `createPort`: Creates a typed contract for a dependency
- `setPortAdapter`: Binds a port to its concrete implementation (adapter)
- `usePort`: Retrieves a port implementation within a Use Case
- `setPortAdapters`: Allows binding multiple port-adapter pairs in one call
- `usePorts`: Allows retrieving multiple port implementations in one call

### 3. Clean Architecture Flow
1. External system calls a Use Case with input data
2. Use Case calls `usePort` to get implementations of needed ports
3. Use Case orchestrates calls between domain aggregates and ports
4. Domain aggregates contain all business logic
5. Results are communicated through Output Ports
6. Adapters handle infrastructure concerns (database, presentation)

## Development Conventions

### Code Organization
1. **Domain Layer:** Contains Aggregates, Entities, and Value Objects with business logic
2. **Application Layer:** Contains Use Cases that orchestrate business operations
3. **Infrastructure Layer:** Contains concrete implementations of ports and external service adapters

### Testing Approach
- **Unit Tests:** Validate creation of aggregates with valid/invalid data
- **Action Tests:** Verify correctness of aggregate actions
- **Integration Tests:** Check interactions between aggregates
- **Use Case Tests:** Test business logic orchestration

### Naming Conventions
- **Ports:** Use descriptive names with `Port` suffix
- **Output Ports:** Always end with `OutPort` suffix
- **Use Cases:** Named as verbs describing the business operation
- **Aggregates/Entities:** Named as nouns representing domain concepts

## Key Documentation Files

1. **docs/README.md:** Main architecture and development guide for SotaJS
2. **ProcessUserInputUseCase.md:** Detailed architecture for processing user input
3. **playbook.md:** Roadmap for implementing the "Greeter Bot" scenario
4. **nlu_course_plan.md:** Plan for Natural Language Understanding implementation
5. **docs/architecture.md:** Overall project architecture documentation

## Getting Started

To begin development:
1. Understand the SotaJS principles from `docs/README.md`
2. Review the existing packages in `packages/` directory
3. Follow the roadmap in `playbook.md` for implementing features
4. Use the domain-first approach: model the domain before implementing use cases
5. Write isolated tests for all business logic before connecting infrastructure

## Extensibility

The system is designed for easy extension:
- New aggregate types for domain entities
- New transition patterns between states
- New communication channels for user interaction
- New handlers for intents and events