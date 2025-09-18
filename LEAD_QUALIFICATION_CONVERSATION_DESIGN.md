# Lead Qualification Bot Conversation Design

## 1. Business Goal
Qualify leads for custom commercial bot development services to increase consultation booking conversion rate.

## 2. Target Audience
Businesses and entrepreneurs seeking custom bot solutions for:
- Customer support automation
- Sales and lead generation
- Employee training and onboarding
- Process automation
- E-commerce assistance

## 3. Conversation Design Principles
1. **Value-first approach**: Provide immediate value to encourage completion
2. **Progressive disclosure**: Collect information gradually to avoid overwhelming
3. **Clear purpose**: Make it obvious why each question is asked
4. **Respect user time**: Keep the process under 2 minutes
5. **Qualification focus**: Gather information that helps sales team prioritize leads

## 4. Lead Qualification Framework
Based on BANT methodology (Budget, Authority, Need, Timeline) adapted for bot development services.

### 4.1. Need Qualification
**Objective**: Understand the business problem and bot requirements
**Key Questions**:
- What business challenge are you trying to solve?
- What type of bot do you need?
- What platforms should it support?
- What key features are required?

### 4.2. Authority Qualification
**Objective**: Identify decision maker and buying process
**Key Questions**:
- Who will be involved in the decision process?
- What is your role in this project?
- Do you have budget approval authority?

### 4.3. Budget Qualification
**Objective**: Assess project budget range and funding
**Key Questions**:
- What is your estimated budget for this project?
- Do you have budget allocated for this year?

### 4.4. Timeline Qualification
**Objective**: Understand project urgency and decision timeline
**Key Questions**:
- When do you need this solution implemented?
- What is driving this timeline?

## 5. Conversation Flow Design

### 5.1. Welcome & Value Proposition
**Purpose**: Set expectations and establish value
**Content**: 
- Friendly greeting
- Clear explanation of process (2 minutes)
- Value proposition (qualified assessment = better solution)
**Qualification Aspect**: First engagement filter - do they stay or leave?

### 5.2. Business Context Collection
**Purpose**: Understand the lead's business and challenges
**Questions**:
1. "What's your company name and industry?"
2. "What business challenge are you hoping to solve with a bot?"
**Qualification Aspect**: 
- Industry relevance for our expertise
- Clarity of problem statement indicates serious intent

### 5.3. Bot Requirements Discovery
**Purpose**: Identify specific bot needs and complexity
**Questions**:
1. "What type of bot are you looking for?" (Multiple choice)
   - Customer Support FAQ Bot
   - Sales Assistant Bot
   - Lead Qualification Bot
   - Employee Training Bot
   - Process Automation Bot
   - E-commerce Assistant Bot
   - Other (text input)
2. "What messaging platforms should it support?" (Multiple choice)
   - Telegram
   - WhatsApp
   - Website Chat
   - Facebook Messenger
   - VK
   - Other
3. "What key features are important to you?" (Multiple choice)
   - Natural Language Understanding
   - Integration with CRM/ERP
   - Multi-language Support
   - Analytics and Reporting
   - Voice/Speech Capabilities
   - Other

### 5.4. Project Scope Assessment
**Purpose**: Gauge project complexity and budget alignment
**Questions**:
1. "How complex do you think your bot requirements are?" (Scale 1-5)
2. "Do you have existing systems the bot needs to integrate with?"

### 5.5. Budget & Authority Discovery
**Purpose**: Assess budget range and decision-making authority
**Questions**:
1. "What's your estimated budget for this project?" (Multiple choice)
   - Less than 50,000 RUB
   - 50,000 - 150,000 RUB
   - 150,000 - 300,000 RUB
   - More than 300,000 RUB
   - Not sure yet
2. "What's your role in this project?" (Multiple choice)
   - CEO/Founder
   - Department Head
   - Project Manager
   - Employee/Consultant
   - Investor/Stakeholder

### 5.6. Timeline & Urgency
**Purpose**: Understand project timeline and decision process
**Questions**:
1. "When do you need this solution?" (Multiple choice)
   - ASAP (1-2 weeks)
   - This month
   - Next 1-3 months
   - 3+ months
   - Just researching
2. "What's driving this timeline?" (Text input)

### 5.7. Consultation CTA
**Purpose**: Present clear next step and capture contact
**Content**:
- Summary of provided information
- Value proposition for consultation
- Clear call-to-action with Calendly link
- Alternative contact options

## 6. Qualification Scoring System

### 6.1. Lead Scoring Criteria
**Hot Lead (Score 8-10)**:
- Clear business problem identified
- Budget range matches our services (150,000+ RUB)
- Decision authority or clear path to decision maker
- Urgent timeline (3 months or less)
- Complex requirements matching our expertise

**Warm Lead (Score 5-7)**:
- Some business context provided
- Moderate budget range (50,000-150,000 RUB)
- Indirect decision influence
- Medium timeline (3-6 months)
- Standard requirements

**Cold Lead (Score 1-4)**:
- Vague or no business problem
- Low budget or no budget
- No decision authority
- Long timeline (6+ months)
- Very simple requirements or just researching

### 6.2. Disqualification Criteria
Automatically disqualify leads that indicate:
- No budget allocated
- Just researching with no timeline
- Looking for free/very cheap solutions
- No decision authority with no contact to decision maker

## 7. Error Handling & Fallbacks

### 7.1. Invalid Input Handling
- Provide clear error messages for required fields
- Offer examples for complex questions
- Allow users to go back and correct answers

### 7.2. Drop-off Recovery
- Track abandonment points for optimization
- Consider follow-up email for incomplete flows
- Simplify difficult questions based on feedback

### 7.3. Technical Fallbacks
- Handle platform limitations gracefully
- Provide alternative contact methods
- Ensure mobile responsiveness

## 8. Data Collection Schema

### 8.1. Collected Information
```json
{
  "companyInfo": {
    "companyName": "string",
    "industry": "string"
  },
  "businessProblem": "string",
  "botRequirements": {
    "botType": "enum",
    "platforms": ["string"],
    "features": ["string"],
    "complexity": "number"
  },
  "projectScope": {
    "integrations": "string",
    "existingSystems": "boolean"
  },
  "budgetInfo": {
    "budgetRange": "enum",
    "budgetClarity": "enum"
  },
  "authorityInfo": {
    "role": "enum",
    "decisionAuthority": "boolean"
  },
  "timelineInfo": {
    "implementationTimeline": "enum",
    "timelineDriver": "string"
  },
  "qualificationScore": "number",
  "leadType": "enum"
}
```

## 9. Success Metrics Definition

### 9.1. Conversation Metrics
- Completion rate: >80%
- Average completion time: <2 minutes
- Drop-off points analysis

### 9.2. Qualification Metrics
- Hot lead conversion rate: >15%
- Warm lead conversion rate: >8%
- Cold lead conversion rate: >2%

### 9.3. Business Metrics
- Consultation booking rate from qualified leads: >25%
- Revenue conversion from consultations: >40%
- Customer satisfaction with lead quality: >4.5/5

## 10. Validation & Testing Plan

### 10.1. Internal Testing
- Test with team members unfamiliar with the project
- Validate question clarity and flow
- Check mobile responsiveness

### 10.2. External Validation
- Test with potential clients (friends, family, network)
- Gather feedback on question relevance
- Measure completion rates

### 10.3. Iteration Plan
- Monitor initial results for first 100 leads
- Identify common drop-off points
- Refine questions based on feedback
- Optimize for higher completion rates