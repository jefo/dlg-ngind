# Lead Qualification Bot Technical Specification

## 1. Overview
Technical specification for implementing the lead qualification bot using existing `@packages/bot-persona` FSM engine, based on the conversation design document.

## 2. Architecture Mapping

### 2.1. Conversation Design to Technical Components
| Conversation Design Element | Technical Implementation |
|---------------------------|-------------------------|
| Welcome State | FSM State + View Component |
| Business Context Collection | FSM State + Form Definition |
| Bot Requirements Discovery | FSM State + Form Definition with Select Options |
| Project Scope Assessment | FSM State + Form Definition |
| Budget & Authority Discovery | FSM State + Form Definition with Select Options |
| Timeline & Urgency | FSM State + Form Definition with Select Options |
| Consultation CTA | FSM State + View Component with Calendly Link |
| Qualification Scoring | Form Data Processing + Business Logic |

### 2.2. Data Flow
1. User input → Form Validation → FSM State Transition → Data Storage → Next View
2. Form Data → Qualification Scoring → Lead Prioritization → Sales Notification

## 3. FSM Definition

### 3.1. States Structure
```typescript
const fsmDefinition = {
  initialStateId: "welcome",
  states: [
    { id: "welcome" },
    { id: "business_context" },
    { id: "bot_requirements" },
    { id: "project_scope" },
    { id: "budget_authority" },
    { id: "timeline" },
    { id: "consultation_cta" }
  ],
  transitions: [
    { from: "welcome", event: "START", to: "business_context" },
    { from: "business_context", event: "SUBMIT_BUSINESS", to: "bot_requirements" },
    { from: "bot_requirements", event: "SUBMIT_REQUIREMENTS", to: "project_scope" },
    { from: "project_scope", event: "SUBMIT_SCOPE", to: "budget_authority" },
    { from: "budget_authority", event: "SUBMIT_BUDGET_AUTHORITY", to: "timeline" },
    { from: "timeline", event: "SUBMIT_TIMELINE", to: "consultation_cta" }
  ]
};
```

## 4. Form Definitions

### 4.1. Business Context Form
```typescript
const businessContextForm = {
  id: "business-context-form",
  name: "Business Context Form",
  fields: [
    {
      id: "company-name-field",
      name: "companyName",
      type: "string",
      label: "Company Name",
      required: true
    },
    {
      id: "industry-field",
      name: "industry",
      type: "string",
      label: "Industry",
      required: true
    },
    {
      id: "business-problem-field",
      name: "businessProblem",
      type: "text",
      label: "What business challenge are you hoping to solve with a bot?",
      required: true
    }
  ]
};
```

### 4.2. Bot Requirements Form
```typescript
const botRequirementsForm = {
  id: "bot-requirements-form",
  name: "Bot Requirements Form",
  fields: [
    {
      id: "bot-type-field",
      name: "botType",
      type: "select",
      label: "What type of bot are you looking for?",
      options: [
        "Customer Support FAQ Bot",
        "Sales Assistant Bot", 
        "Lead Qualification Bot",
        "Employee Training Bot",
        "Process Automation Bot",
        "E-commerce Assistant Bot",
        "Other"
      ],
      required: true
    },
    {
      id: "platforms-field",
      name: "platforms",
      type: "multiselect",
      label: "What messaging platforms should it support?",
      options: [
        "Telegram",
        "WhatsApp", 
        "Website Chat",
        "Facebook Messenger",
        "VK",
        "Other"
      ],
      required: true
    },
    {
      id: "features-field",
      name: "features",
      type: "multiselect",
      label: "What key features are important to you?",
      options: [
        "Natural Language Understanding",
        "Integration with CRM/ERP",
        "Multi-language Support",
        "Analytics and Reporting",
        "Voice/Speech Capabilities",
        "Other"
      ]
    }
  ]
};
```

## 5. View Definitions

### 5.1. Welcome View
```typescript
const welcomeView = {
  id: "welcome",
  component: "Message",
  props: {
    text: "Привет! Я помогу вам определить, подходит ли вам наша услуга по созданию кастомных чат-ботов. Потратим всего 2 минуты, и вы получите персональную оценку вашего проекта!",
    buttons: [
      { text: "Начать", action: "START" }
    ]
  }
};
```

### 5.2. Consultation CTA View
```typescript
const consultationCtaView = {
  id: "consultation_cta",
  component: "Message",
  props: {
    text: "Спасибо за информацию! На основе вашего описания проекта, мы можем предложить решение, которое поможет вам {businessProblem}. Чтобы обсудить детали и получить персональное предложение, запишитесь на бесплатную консультацию.",
    buttons: [
      { text: "Записаться на консультацию", url: "https://your-calendly-link" },
      { text: "Получить презентацию по email", action: "REQUEST_PRESENTATION" }
    ]
  }
};
```

## 6. Qualification Scoring Logic

### 6.1. Scoring Algorithm
```typescript
interface LeadData {
  budgetRange: string;
  role: string;
  decisionAuthority: boolean;
  implementationTimeline: string;
  botType: string;
  complexity: number;
}

function calculateQualificationScore(data: LeadData): { score: number, type: string } {
  let score = 0;
  
  // Budget scoring
  switch(data.budgetRange) {
    case "More than 300,000 RUB": score += 3; break;
    case "150,000 - 300,000 RUB": score += 2; break;
    case "50,000 - 150,000 RUB": score += 1; break;
    default: score += 0;
  }
  
  // Authority scoring
  if (data.decisionAuthority) score += 2;
  if (data.role === "CEO/Founder" || data.role === "Department Head") score += 1;
  
  // Timeline scoring
  switch(data.implementationTimeline) {
    case "ASAP (1-2 weeks)": score += 3; break;
    case "This month": score += 2; break;
    case "Next 1-3 months": score += 1; break;
    default: score += 0;
  }
  
  // Complexity scoring
  score += Math.min(data.complexity, 3);
  
  // Lead type classification
  let type = "Cold";
  if (score >= 8) type = "Hot";
  else if (score >= 5) type = "Warm";
  
  return { score, type };
}
```

## 7. Integration Points

### 7.1. Lead Data Storage
Using existing `@packages/bot-persona` form storage with additional qualification data:

```typescript
interface StoredLeadData {
  // Existing form data
  formState: Record<string, any>;
  
  // Additional qualification data
  qualificationScore: number;
  leadType: "Hot" | "Warm" | "Cold";
  createdAt: Date;
  completedAt: Date;
  
  // Scoring components for transparency
  budgetScore: number;
  authorityScore: number;
  timelineScore: number;
  complexityScore: number;
}
```

### 7.2. Sales Team Notification
Integration with existing notification system:

```typescript
function notifySalesTeam(leadData: StoredLeadData) {
  // Use existing notification port
  const notificationPort = usePort(salesNotificationPort);
  
  notificationPort.send({
    type: "NEW_LEAD",
    priority: leadData.leadType,
    leadId: leadData.conversationId,
    score: leadData.qualificationScore,
    summary: generateLeadSummary(leadData)
  });
}
```

## 8. Error Handling

### 8.1. Form Validation
```typescript
const validationRules = {
  companyName: {
    required: true,
    minLength: 2,
    maxLength: 100
  },
  businessProblem: {
    required: true,
    minLength: 10,
    maxLength: 500
  },
  budgetRange: {
    required: true,
    enum: [
      "Less than 50,000 RUB",
      "50,000 - 150,000 RUB", 
      "150,000 - 300,000 RUB",
      "More than 300,000 RUB",
      "Not sure yet"
    ]
  }
};
```

### 8.2. Fallback Mechanisms
```typescript
const fallbackViews = {
  technicalError: {
    component: "Message",
    props: {
      text: "Извините, произошла техническая ошибка. Пожалуйста, попробуйте позже или свяжитесь с нами напрямую.",
      buttons: [
        { text: "Попробовать снова", action: "RESTART" },
        { text: "Связаться напрямую", url: "mailto:contact@example.com" }
      ]
    }
  },
  timeout: {
    component: "Message", 
    props: {
      text: "Время сессии истекло. Хотите начать заново?",
      buttons: [
        { text: "Начать заново", action: "RESTART" }
      ]
    }
  }
};
```

## 9. Analytics and Monitoring

### 9.1. Key Metrics Tracking
```typescript
const analyticsEvents = {
  conversationStarted: { event: "CONVERSATION_STARTED" },
  stateTransition: { event: "STATE_TRANSITION", from: string, to: string },
  formSubmitted: { event: "FORM_SUBMITTED", formId: string },
  conversationCompleted: { event: "CONVERSATION_COMPLETED", duration: number },
  leadQualified: { event: "LEAD_QUALIFIED", score: number, type: string },
  consultationBooked: { event: "CONSULTATION_BOOKED" }
};
```

## 10. Testing Strategy

### 10.1. Unit Tests
```typescript
describe("Lead Qualification Bot", () => {
  it("should calculate correct qualification scores", () => {
    const testData = {
      budgetRange: "More than 300,000 RUB",
      role: "CEO/Founder",
      decisionAuthority: true,
      implementationTimeline: "ASAP (1-2 weeks)",
      botType: "Custom",
      complexity: 3
    };
    
    const result = calculateQualificationScore(testData);
    expect(result.score).toBe(11);
    expect(result.type).toBe("Hot");
  });
});
```

This technical specification provides the bridge between the conversation design and implementation, ensuring we build exactly what's needed for effective lead qualification.