import type { Persona } from "../persona.entity";
import type { Chat } from "../chat.entity";
import type { Message } from "../message.entity";

// Эмуляция таблиц в базе данных
export const memoryPersonas = new Map<string, Persona>();
export const memoryChats = new Map<string, Chat>();
export const memoryMessages = new Map<string, Message>();

// --- Адаптеры для Persona ---

export const inMemorySavePersonaAdapter = async (
	persona: Persona,
): Promise<void> => {
	memoryPersonas.set(persona.id, persona);
};

export const inMemoryFindPersonaByIdAdapter = async (
	id: string,
): Promise<Persona | null> => {
	return memoryPersonas.get(id) ?? null;
};

// --- Адаптеры для Chat ---

export const inMemorySaveChatAdapter = async (chat: Chat): Promise<void> => {
	memoryChats.set(chat.id, chat);
};

export const inMemoryFindChatByIdAdapter = async (
	id: string,
): Promise<Chat | null> => {
	return memoryChats.get(id) ?? null;
};

// --- Адаптеры для Message ---

export const inMemorySaveMessageAdapter = async (
	message: Message,
): Promise<void> => {
	memoryMessages.set(message.id, message);
};

export const inMemoryFindMessageByIdAdapter = async (
	id: string,
): Promise<Message | null> => {
	return memoryMessages.get(id) ?? null;
};

// Адаптер для тестов - возвращает все сообщения
export const inMemoryFindAllMessagesAdapter = async (): Promise<
	Map<string, Message>
> => {
	return memoryMessages;
};
