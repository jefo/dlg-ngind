// Bot Persona Engine with Enhanced Domain Components

console.log("Bot Persona Engine with Enhanced Domain Components");

// Export core framework components
export * from './src/composition';

// Export existing domain components
export * from './src/domain/bot-persona/bot-persona.aggregate';
export * from './src/domain/conversation/conversation.aggregate';
export * from './src/domain/runtime-entity.factory';

// Export application components
export * from './src/application/use-cases/start-conversation.use-case';
export * from './src/application/use-cases/process-user-input.use-case';
export * from './src/application/use-cases/define-bot-persona.use-case';
export * from './src/application/use-cases/define-conversation-model.use-case';

// Export ports
export * from './src/domain/ports';
export * from './src/application/ports';

// Export infrastructure components
export * from './src/infrastructure/persistence/in-memory.adapters';

console.log("Enhanced domain components ready for use!");