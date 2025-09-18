# Booking Context

Bounded context for appointment booking and scheduling functionality.

## Overview

This context provides functionality for scheduling consultations between potential clients and our sales/consultation team. It implements a simple booking system using Domain-Driven Design principles with the SotaJS framework.

## Key Features

- Appointment scheduling with time slot management
- Client contact information collection
- Booking confirmation and notifications
- Rescheduling and cancellation capabilities

## Installation

```bash
bun install
```

## Running Tests

```bash
bun test
```

## Architecture

Follows the SotaJS DDD architecture with clear separation of concerns:

- **Domain**: Core business logic and entities
- **Application**: Use cases and business workflows
- **Infrastructure**: Adapters and external integrations