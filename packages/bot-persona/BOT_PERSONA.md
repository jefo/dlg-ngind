# Bot Persona Context

## Overview

This context provides functionality for defining and managing bot personalities and behaviors in conversational AI systems. It implements Domain-Driven Design principles with the SotaJS framework.

## Key Features

- Bot personality modeling and management
- Behavioral pattern definition
- Persona consistency across conversations
- Integration with dialogue flow systems

## Entry Point

This document serves as the entry point for the Bot Persona context. For more detailed information, see:

- [README](./README.md) - Project overview and getting started guide
- [Documentation](./docs.md) - Complete SotaJS architecture and development guide
- [E2E Greeter Bot Demo](./e2e-greeter-bot.ts) - Complete end-to-end demonstration of a greeter bot
- [E2E JTBD Qualifier Bot Demo](./e2e-jtbd-qualifier-bot.ts) - Jobs-To-Be-Done qualifier bot implementation
- [E2E Lead Qualifier Bot Demo](./e2e-lead-qualifier-bot.ts) - Lead qualification bot implementation

## Architecture

Follows the SotaJS DDD architecture with clear separation of concerns:

- **Domain**: Core business logic and entities for bot personas
- **Application**: Use cases and business workflows for persona management
- **Infrastructure**: Adapters and external integrations

## Key Concepts

Based on the SotaJS framework principles:

- **Domain-First Approach**: Business logic is at the center of development
- **Explicit Dependencies**: Uses `usePort()` hook for transparent dependency declaration
- **Functional Approach**: Business logic is expressed as simple async functions (Use Cases)
- **Testability**: Architecture designed for isolated testing
- **Separation of Logic and Presentation**: Use Cases don't return data directly but communicate results through Output Ports

## Key Use Cases

1. **Define Bot Persona** - Create and configure bot personality traits
2. **Update Bot Behavior** - Modify behavioral patterns
3. **Consistency Check** - Ensure persona consistency across interactions
4. **Persona Switching** - Change persona based on context

## Integration

The bot persona context is designed to be easily integrated into:
- Chat systems
- Voice assistants
- Customer service platforms
- Other conversational AI systems

All integration points are handled through well-defined use cases and ports/adapters pattern.