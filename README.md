# dlg-ngind Platform

A TypeScript-based dialogue system framework implementing Domain-Driven Design (DDD) principles using the SotaJS framework.

## Current Focus
Implementing a lead qualification bot for our kwork custom bot development service using existing FSM engine capabilities.

## Key Documentation
- `LEAD_QUALIFICATION_BOT.md` - Specification for lead qualification bot
- `IMPLEMENTATION_PLAN.md` - Implementation steps
- `CONTEXT_MAP.md` - System context map
- `playbook.md` - Development roadmap
- `ProcessUserInputUseCase.md` - Key use case documentation

## New Bounded Contexts
- `packages/booking` - Booking context for appointment scheduling
- Future integration with `@packages/bot-persona` for complete booking bot solution

## Immediate Goal
Create a lead qualification bot that will be linked from our kwork listing to qualify leads and drive them to book a free consultation.

## Approach
Using existing `@packages/bot-persona` FSM engine - perfect fit for this linear qualification flow. No need for complex engines or modules.

## Implementation
1. Define bot persona using FSM approach
2. Integrate with existing `@chat` for messaging
3. Deploy and link from kwork
4. Collect qualified leads for consultation bookings

## Future Vision
Combine the existing bot-persona capabilities with the new booking context to create a complete booking bot solution that can be deployed across multiple platforms.

This lean approach uses our existing technology perfectly suited for this use case while avoiding unnecessary complexity, with a clear path for future enhancement and integration.