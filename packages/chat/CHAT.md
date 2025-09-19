# Chat Context

## Overview

This context provides core chat functionality for conversational AI systems. It implements Domain-Driven Design principles with the SotaJS framework to manage real-time messaging and conversation flows.

## Key Features

- Real-time messaging infrastructure
- Conversation state management
- Message routing and delivery
- Integration with bot systems

## Entry Point

This document serves as the entry point for the Chat context. For more detailed information, see:

- [README](./README.md) - Project overview and getting started guide
- [Run Script](./run.ts) - Main entry point for running the chat system
- [Index](./index.ts) - Module exports and main API

## Architecture

Follows the SotaJS DDD architecture with clear separation of concerns:

- **Domain**: Core business logic and entities for chat systems
- **Application**: Use cases and business workflows for chat management
- **Infrastructure**: Adapters and external integrations

## Key Concepts

Based on the SotaJS framework principles:

- **Domain-First Approach**: Business logic is at the center of development
- **Explicit Dependencies**: Uses `usePort()` hook for transparent dependency declaration
- **Functional Approach**: Business logic is expressed as simple async functions (Use Cases)
- **Testability**: Architecture designed for isolated testing
- **Separation of Logic and Presentation**: Use Cases don't return data directly but communicate results through Output Ports

## Key Use Cases

1. **Send Message** - Deliver messages between participants
2. **Manage Conversation State** - Track and update conversation context
3. **Route Messages** - Direct messages to appropriate handlers
4. **Handle Message Receipt** - Process incoming messages

## Integration

The chat context is designed to be easily integrated into:
- Web applications
- Mobile applications
- Messaging platforms
- Bot systems

All integration points are handled through well-defined use cases and ports/adapters pattern.