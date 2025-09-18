# Future Integration: Booking Bot

This document outlines how the booking context will integrate with the existing `@packages/bot-persona` package to create a complete booking bot solution.

## Vision

Our goal is to create a conversational booking bot that leverages:
1. The existing `@packages/bot-persona` FSM engine for conversation flow
2. The new `@dlg-ngind/booking` context for appointment scheduling functionality

## Integration Architecture

### 1. Component Interaction

```
User <-> @chat <-> @bot-persona <-> @dlg-ngind/booking
```

1. **@chat**: Handles messaging platform integration (Telegram, WhatsApp, etc.)
2. **@bot-persona**: Manages conversation flow using FSM
3. **@dlg-ngind/booking**: Provides booking functionality through use cases

### 2. Data Flow

1. User sends message to bot through @chat
2. @chat forwards message to @bot-persona
3. @bot-persona processes message and determines next step in conversation
4. When booking is needed, @bot-persona calls appropriate use cases in @dlg-ngind/booking
5. @dlg-ngind/booking performs booking operations and returns results
6. @bot-persona formats response and sends back through @chat

## Implementation Plan

### Phase 1: Adapter Development

Create adapters to connect @bot-persona with @dlg-ngind/booking:

```typescript
// booking-adapters.ts
import { 
  getAvailableTimeSlotsUseCase,
  scheduleAppointmentUseCase,
  cancelAppointmentUseCase
} from "@dlg-ngind/booking";
import { setPortAdapter } from "@maxdev1/sotajs";

// Adapter for getting available time slots
export const bookingGetAvailableSlotsAdapter = async (input: any) => {
  return await getAvailableTimeSlotsUseCase(input);
};

// Adapter for scheduling appointments
export const bookingScheduleAppointmentAdapter = async (input: any) => {
  return await scheduleAppointmentUseCase(input);
};

// Adapter for cancelling appointments
export const bookingCancelAppointmentAdapter = async (input: any) => {
  return await cancelAppointmentUseCase(input);
};

// Register adapters with bot-persona ports
export const composeBookingBotIntegration = () => {
  // These would be new ports added to @bot-persona
  // setPortAdapter(getAvailableSlotsPort, bookingGetAvailableSlotsAdapter);
  // setPortAdapter(scheduleAppointmentPort, bookingScheduleAppointmentAdapter);
  // setPortAdapter(cancelAppointmentPort, bookingCancelAppointmentAdapter);
};
```

### Phase 2: Bot Definition

Define the booking bot using the existing FSM approach:

```typescript
// booking-bot-definition.ts
const bookingBotDefinition = {
  name: "Booking Bot",
  fsmDefinition: {
    initialStateId: "welcome",
    states: [
      { id: "welcome" },
      { id: "show_availability" },
      { id: "collect_client_info" },
      { id: "confirm_booking" },
      { id: "booking_confirmed" },
      { id: "booking_cancelled" }
    ],
    transitions: [
      {
        from: "welcome",
        event: "START_BOOKING",
        to: "show_availability"
      },
      {
        from: "show_availability",
        event: "SELECT_SLOT",
        to: "collect_client_info",
        assign: { selectedSlotId: "payload.slotId" }
      },
      {
        from: "collect_client_info",
        event: "SUBMIT_CLIENT_INFO",
        to: "confirm_booking",
        assign: { 
          clientName: "payload.name",
          clientEmail: "payload.email",
          clientPhone: "payload.phone"
        }
      },
      {
        from: "confirm_booking",
        event: "CONFIRM_BOOKING",
        to: "booking_confirmed"
      },
      {
        from: "booking_confirmed",
        event: "CANCEL_BOOKING",
        to: "booking_cancelled"
      }
    ]
  },
  viewDefinition: {
    nodes: [
      {
        id: "welcome",
        component: "Message",
        props: { 
          text: "Welcome to our booking service! I can help you schedule a consultation with our experts." 
        }
      },
      {
        id: "show_availability",
        component: "TimeSlotSelector",
        props: { 
          text: "Here are the available time slots for the next week:" 
        }
      },
      {
        id: "collect_client_info",
        component: "Form",
        props: {
          title: "Please provide your contact information",
          fields: [
            { id: "name", label: "Full Name", type: "string" },
            { id: "email", label: "Email Address", type: "string" },
            { id: "phone", label: "Phone Number", type: "string" }
          ]
        }
      },
      {
        id: "confirm_booking",
        component: "BookingConfirmation",
        props: {
          text: "Please confirm your booking details:"
        }
      },
      {
        id: "booking_confirmed",
        component: "Message",
        props: {
          text: "Your appointment has been booked successfully! Your booking reference is: context.bookingReference"
        }
      },
      {
        id: "booking_cancelled",
        component: "Message",
        props: {
          text: "Your appointment has been cancelled successfully."
        }
      }
    ]
  },
  formDefinition: {
    id: "booking-form",
    name: "Booking Form",
    fields: [
      { id: "selected-slot-id", name: "selectedSlotId", type: "string" },
      { id: "client-name", name: "clientName", type: "string" },
      { id: "client-email", name: "clientEmail", type: "string" },
      { id: "client-phone", name: "clientPhone", type: "string" },
      { id: "booking-reference", name: "bookingReference", type: "string" }
    ]
  }
};
```

### Phase 3: Custom Components

Create custom components for the booking bot:

```typescript
// TimeSlotSelector component
const TimeSlotSelector = ({ timeSlots, onSelect }) => {
  return (
    <div>
      <h3>Available Time Slots</h3>
      <ul>
        {timeSlots.map((slot, index) => (
          <li key={slot.id}>
            <button onClick={() => onSelect(slot.id)}>
              {slot.start.toLocaleString()} ({slot.duration} minutes)
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

// BookingConfirmation component
const BookingConfirmation = ({ bookingDetails, onConfirm, onCancel }) => {
  return (
    <div>
      <h3>Confirm Your Booking</h3>
      <p>Time: {bookingDetails.time}</p>
      <p>Name: {bookingDetails.name}</p>
      <p>Email: {bookingDetails.email}</p>
      <p>Phone: {bookingDetails.phone}</p>
      <button onClick={onConfirm}>Confirm Booking</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  );
};
```

## Conversation Flow

### 1. Welcome and Introduction
- Bot greets user and explains booking service
- Offers to show available time slots

### 2. Availability Display
- Bot retrieves and displays available time slots
- User selects preferred time slot

### 3. Client Information Collection
- Bot collects client name, email, and phone
- Validates input format

### 4. Booking Confirmation
- Bot displays booking details for confirmation
- User confirms or cancels booking

### 5. Booking Result
- Bot confirms booking and provides reference number
- Offers options for cancellation or rescheduling

### 6. Cancellation (Optional)
- User can cancel booking using reference number
- Bot confirms cancellation

## Integration Benefits

### 1. Leveraging Existing Technology
- Uses proven @bot-persona FSM engine
- Builds on existing @chat messaging infrastructure
- Maintains consistency with current architecture

### 2. Separation of Concerns
- Conversation flow managed by @bot-persona
- Booking logic handled by @dlg-ngind/booking
- Clean boundaries between components

### 3. Reusability
- Booking functionality can be used by multiple bots
- Conversation flow can be customized for different contexts
- Components can be reused across projects

## Implementation Timeline

### Week 1-2: Adapter Development
- Create adapters for booking use cases
- Set up port registration
- Test adapter functionality

### Week 3-4: Bot Definition
- Define FSM for booking conversation
- Create view definitions
- Implement custom components

### Week 5-6: Integration Testing
- Test end-to-end booking flow
- Validate error handling
- Optimize performance

### Week 7-8: Deployment and Monitoring
- Deploy to production environment
- Set up monitoring and logging
- Document integration process

## Conclusion

This integration approach allows us to create a powerful booking bot by combining:
1. The conversation management capabilities of @bot-persona
2. The booking functionality of @dlg-ngind/booking
3. The messaging infrastructure of @chat

The result will be a robust, scalable booking bot that can be easily maintained and extended.