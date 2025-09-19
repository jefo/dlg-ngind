# Event Bus Context

## Overview

This context provides event-driven communication infrastructure for the dialogue system. It implements Domain-Driven Design principles with the SotaJS framework to enable loose coupling between system components through asynchronous messaging.

## Key Features

- Event publishing and subscription
- Topic-based message routing
- In-memory event storage
- Integration with other bounded contexts

## Entry Point

This document serves as the entry point for the Event Bus context. For more detailed information, see:

- [README](./README.md) - Project overview (if available)
- [Index](./src/index.ts) - Main module exports and public API
- [Integration Tests](./src/event-bus.integration.test.ts) - Example usage and integration patterns

## Architecture

Follows the SotaJS DDD architecture with clear separation of concerns:

- **Domain**: Core business logic and entities for event management
- **Application**: Use cases and business workflows for event handling
- **Infrastructure**: Adapters and external integrations

## Key Concepts

Based on the SotaJS framework principles:

- **Domain-First Approach**: Business logic is at the center of development
- **Explicit Dependencies**: Uses `usePort()` hook for transparent dependency declaration
- **Functional Approach**: Business logic is expressed as simple async functions (Use Cases)
- **Testability**: Architecture designed for isolated testing
- **Separation of Logic and Presentation**: Use Cases don't return data directly but communicate results through Output Ports

## Key Use Cases

1. **Publish Event** - Broadcast events to subscribers
2. **Subscribe to Topic** - Register interest in specific event types
3. **Route Events** - Direct events to appropriate handlers
4. **Manage Event Store** - Store and retrieve events

## Integration

The event bus context is designed to be easily integrated into:
- Other bounded contexts in the system
- External messaging systems
- Microservices architectures
- Real-time notification systems

All integration points are handled through well-defined use cases and ports/adapters pattern.