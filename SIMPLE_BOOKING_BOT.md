# Simple Booking Bot for Consultation Scheduling

## 1. Project Goal
Create a simple booking bot that will be linked from our kwork listing to help potential clients schedule free consultation appointments.

## 2. Stakeholders
- **Business Owner**: Needs qualified consultations with potential clients
- **Potential Clients**: Seeking bot development services and want to discuss their needs
- **Consultation Team**: Will conduct the scheduled consultations

## 3. Functional Requirements

### 3.1. Core Functionality
1. Display available consultation time slots
2. Collect minimal client contact information
3. Schedule and confirm consultation appointments
4. Send booking confirmations and reminders

### 3.2. Bot Capabilities
- **Conversation Flow**: Simple 4-step linear flow
- **Information Collection**: Name, email, phone number
- **Integration**: Calendar system and notification services
- **Management**: Rescheduling and cancellation capabilities

## 4. Use Cases

### 4.1. Primary Use Case: Schedule Consultation
**Actor**: Potential client
**Preconditions**: Client accesses bot via kwork link
**Main Flow**:
1. Bot greets client and explains booking process
2. Bot displays available time slots
3. Client selects preferred time slot
4. Bot collects contact information
5. Bot confirms booking and sends confirmation
**Postconditions**: Appointment scheduled and confirmed

### 4.2. Secondary Use Case: Manage Booking
**Actor**: Potential client
**Preconditions**: Client has existing booking
**Main Flow**:
1. Client accesses booking management with reference
2. Client views existing appointment
3. Client reschedules or cancels appointment
4. System updates appointment and notifies team
**Postconditions**: Appointment modified or cancelled

## 5. Domain Model

### 5.1. Core Entities
- **Appointment**: Scheduled consultation with time and client info
- **Client**: Person booking the consultation
- **TimeSlot**: Available time period for booking

### 5.2. Value Objects
- **ContactInfo**: Client's contact details (name, email, phone)
- **DateTimeRange**: Start and end times for appointments
- **BookingReference**: Unique identifier for client access

## 6. Conversation Model

### 6.1. States
Based on simple conversation design in `SIMPLE_BOOKING_CONVERSATION_DESIGN.md`:

1. **Welcome**: Initial greeting and value proposition
2. **Availability**: Display and selection of time slots
3. **ContactInfo**: Collection of client contact information
4. **Confirmation**: Booking confirmation and next steps

### 6.2. Transitions
- Welcome → Availability (on START)
- Availability → ContactInfo (on SELECT_SLOT)
- ContactInfo → Confirmation (on SUBMIT_CONTACT)
- Confirmation → Welcome (on NEW_BOOKING for restart)

## 7. Non-Functional Requirements

### 7.1. Performance
- Response time: < 100ms
- Availability: 99.9%
- Concurrent users: 100+

### 7.2. Integration
- Seamless integration with existing `@chat` and `@bot-persona` packages
- Calendar system integration for availability management
- Notification system for confirmations and reminders

### 7.3. Usability
- Simple, intuitive 4-step conversation flow
- Mobile-responsive interface
- Clear instructions and value proposition at each step

## 8. Constraints
- Must use existing FSM engine in `@packages/bot-persona`
- Must integrate with current `@chat` messaging infrastructure
- Deployment within 2 weeks
- Minimal new development required
- Follow conversation design principles from `SIMPLE_BOOKING_CONVERSATION_DESIGN.md`

## 9. Success Metrics
- Booking completion rate > 90%
- Consultation attendance rate > 80%
- User completion time < 1 minute
- Cancellation rate < 10%

## 10. Model-As-A-Code Definition

```yaml
bot:
  name: "Consultation Booking Bot"
  description: "Simple booking bot for scheduling free consultations"
  type: "BookingBot"
  
conversation:
  initialState: "welcome"
  states:
    - id: "welcome"
      type: "Greeting"
      description: "Initial greeting and value proposition"
      
    - id: "availability"
      type: "SlotSelection"
      description: "Display and selection of available time slots"
      
    - id: "contact_info"
      type: "DataCollection"
      description: "Collection of client contact information"
      
    - id: "confirmation"
      type: "Confirmation"
      description: "Booking confirmation and next steps"

transitions:
  - from: "welcome"
    to: "availability"
    event: "START"
    description: "Begin booking process"
    
  - from: "availability"
    to: "contact_info"
    event: "SELECT_SLOT"
    description: "Time slot selected"
    
  - from: "contact_info"
    to: "confirmation"
    event: "SUBMIT_CONTACT"
    description: "Contact information submitted"
    
  - from: "confirmation"
    to: "welcome"
    event: "NEW_BOOKING"
    description: "Start new booking process"
```

## 11. Future Considerations
- Integration with CRM systems for automated lead distribution
- Support for multiple consultants with specific expertise
- Advanced availability rules based on consultant skills
- Multi-language support for international clients