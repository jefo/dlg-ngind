// Chat package exports
export { composeChatApp, composeFullApp } from "./src/composition";

// Entities
export { PersonaEntity as Persona } from "./src/persona.entity";
export { ChatEntity as Chat } from "./src/chat.entity";
export { Message } from "./src/message.entity";

// Domain Ports
export {
	findPersonaByIdPort,
	savePersonaPort,
	findChatByIdPort,
	saveChatPort,
	saveMessagePort,
} from "./src/chat.domain.ports";

// Application Ports
export { runTelegramAdapter } from "./src/telegram.adapter";

// Application Ports
export {
	MessageSentOutputSchema,
	messageSentOutPort,
} from "./src/chat.application.ports";

// Use Cases
export { sendMessageUseCase } from "./src/send-message.use-case";
export { createPersonaUseCase } from "./src/create-persona.use-case";
export { createChatUseCase } from "./src/create-chat.use-case";
export { receiveIncomingMessageUseCase } from "./src/receive-incoming-message.use-case";

// Infrastructure
export {
	inMemorySavePersonaAdapter,
	inMemoryFindPersonaByIdAdapter,
	inMemorySaveChatAdapter,
	inMemoryFindChatByIdAdapter,
	inMemorySaveMessageAdapter,
	inMemoryFindMessageByIdAdapter,
	inMemoryFindAllMessagesAdapter,
} from "./src/infrastructure/persistence/in-memory.adapters";
