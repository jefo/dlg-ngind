import type { PersonaEntityType, ChatEntityType, MessageEntityType } from "../../domain";

// Эмуляция таблиц в базе данных
export const memoryPersonas = new Map<string, PersonaEntityType>();
export const memoryChats = new Map<string, ChatEntityType>();
export const memoryMessages = new Map<string, MessageEntityType>();

// --- Адаптеры для Persona ---

export const inMemorySavePersonaAdapter = async (
	persona: PersonaEntityType,
): Promise<void> => {
	memoryPersonas.set(persona.id, persona);
};

export const inMemoryFindPersonaByIdAdapter = async (
	id: string,
): Promise<PersonaEntityType | null> => {
	return memoryPersonas.get(id) ?? null;
};

// --- Адаптеры для Chat ---

export const inMemorySaveChatAdapter = async (chat: ChatEntityType): Promise<void> => {
	memoryChats.set(chat.id, chat);
};

export const inMemoryFindChatByIdAdapter = async (
	id: string,
): Promise<ChatEntityType | null> => {
	return memoryChats.get(id) ?? null;
};

// --- Адаптеры для Message ---

export const inMemorySaveMessageAdapter = async (
	message: MessageEntityType,
): Promise<void> => {
	memoryMessages.set(message.id, message);
};

export const inMemoryFindMessageByIdAdapter = async (
	id: string,
): Promise<MessageEntityType | null> => {
	return memoryMessages.get(id) ?? null;
};

// Адаптер для тестов - возвращает все сообщения
export const inMemoryFindAllMessagesAdapter = async (): Promise<
	Map<string, MessageEntityType>
> => {
	return memoryMessages;
};
