import { BotPersona } from "../../../desing/domain";
import type { BotPersonaProps } from "../../../desing/domain";
import { Conversation } from "../../../runtime/domain";
import type { ConversationState } from "../../../runtime/domain";
import { botPersonas, conversations } from "./db"; // Импортируем хранилища

// --- Адаптеры для BotPersona ---

export const inMemorySaveBotPersonaAdapter = (
	props: BotPersonaProps,
): Promise<void> => {
	botPersonas.set(props.id, props);
	return Promise.resolve();
};

export const inMemoryFindBotPersonaByIdAdapter = async (
	id: string,
): Promise<BotPersona | null> => {
	const props = botPersonas.get(id);
	return props ? BotPersona.create(props) : null;
};

// --- Адаптеры для Conversation ---

export const inMemorySaveConversationAdapter = (
	props: ConversationState,
): Promise<void> => {
	conversations.set(props.id, props);
	return Promise.resolve();
};

export const inMemoryFindActiveConversationByChatIdAdapter = async (
	chatId: string,
): Promise<Conversation | null> => {
	for (const props of conversations.values()) {
		if (props.chatId === chatId && props.status === "active") {
			return Conversation.create(props);
		}
	}
	return null;
};
