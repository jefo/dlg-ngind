import { setPortAdapter, resetDI } from "@maxdev1/sotajs";

// --- Импорт всех портов ---
// Design
import {
	findBotPersonaByIdPort,
	saveBotPersonaPort,
} from "./desing/domain/bot-persona.aggregate";
import {
	botPersonaDefinedOutPort,
	operationFailedOutPort,
} from "./desing/application/ports";

// Runtime
import {
	findActiveConversationByChatIdPort,
	saveConversationPort,
} from "./runtime/domain/conversaton.aggregate";
import {
	componentRenderOutPort,
	conversationFinishedOutPort,
	conversationNotFoundOutPort,
	invalidInputOutPort,
} from "./runtime/application/ports";

// --- Импорт всех адаптеров ---
import {
	inMemoryFindActiveConversationByChatIdAdapter,
	inMemoryFindBotPersonaByIdAdapter,
	inMemorySaveBotPersonaAdapter,
	inMemorySaveConversationAdapter,
} from "./shared/infrastructure/persistence/in-memory.adapters";
import {
	consoleComponentRenderAdapter,
	consoleFailurePresenter,
} from "./shared/infrastructure/presenters/console.presenters";

/**
 * Функция для связывания всех портов с их реализациями (адаптерами).
 * Это сердце приложения, где происходит внедрение зависимостей.
 */
export function composeApp() {
	// Очищаем контейнер перед каждой композицией (важно для тестов)
	resetDI();

	// --- Связывание портов данных ---
	setPortAdapter(
		findBotPersonaByIdPort,
		inMemoryFindBotPersonaByIdAdapter,
	);
	setPortAdapter(saveBotPersonaPort, inMemorySaveBotPersonaAdapter);
	setPortAdapter(
		findActiveConversationByChatIdPort,
		inMemoryFindActiveConversationByChatIdAdapter,
	);
	setPortAdapter(saveConversationPort, inMemorySaveConversationAdapter);

	// --- Связывание выходных портов ---
	setPortAdapter(operationFailedOutPort, consoleFailurePresenter);
	setPortAdapter(conversationNotFoundOutPort, consoleFailurePresenter);
	setPortAdapter(invalidInputOutPort, consoleFailurePresenter);

	setPortAdapter(componentRenderOutPort, consoleComponentRenderAdapter);

	// Для портов, у которых пока нет сложного презентера, используем простой console.log
	setPortAdapter(botPersonaDefinedOutPort, async (dto) => {
		console.log(`✅ Bot Persona Defined: ${dto.name} (ID: ${dto.personaId})`);
	});
	setPortAdapter(conversationFinishedOutPort, async (dto) => {
		console.log(`🏁 Conversation Finished for chat: ${dto.chatId}`);
	});

	console.log("--- Application Composed ---");
}