import { setPortAdapter, resetDI } from "@maxdev1/sotajs";
import {
	messageSentOutPort,
	startListeningPort,
	stopListeningPort,
} from "./application/chat.application.ports";
import {
	inMemorySavePersonaAdapter,
	inMemoryFindPersonaByIdAdapter,
	inMemorySaveChatAdapter,
	inMemoryFindChatByIdAdapter,
	inMemorySaveMessageAdapter,
} from "./infrastructure/persistence/in-memory.adapters";
import {
	findChatByIdPort,
	findPersonaByIdPort,
	saveChatPort,
	saveMessagePort,
	savePersonaPort,
} from "./domain/chat.domain.ports";
import {
	telegramStartListeningAdapter,
	telegramStopListeningAdapter,
} from "./infrastructure/platform/telegram.adapter";
import { sendTelegramMessage } from "./infrastructure/platform/telegram-api.client";

/**
 * Composes the application based on environment configuration.
 */
export function composeChatApp(config: { channel?: string }) {
	resetDI();

	// --- Bind data ports ---
	setPortAdapter(findPersonaByIdPort, inMemoryFindPersonaByIdAdapter);
	setPortAdapter(savePersonaPort, inMemorySavePersonaAdapter);
	setPortAdapter(findChatByIdPort, inMemoryFindChatByIdAdapter);
	setPortAdapter(saveChatPort, inMemorySaveChatAdapter);
	setPortAdapter(saveMessagePort, inMemorySaveMessageAdapter);

	// --- Bind output ports ---
	setPortAdapter(messageSentOutPort, async (dto) => {
		console.log(`[MessageSent]: Echoing '${dto.content}' to chat ${dto.chatId}`);
		// In a real app, this would use a proper presenter and DI to get the token.
		// For this example, we read it directly from env.
		const token = process.env.TELEGRAM_BOT_TOKEN;
		const [platform, platformChatId] = dto.chatId.split(":");

		if (platform === "telegram" && token && platformChatId) {
			await sendTelegramMessage(
				Number(platformChatId),
				`Echo: ${dto.content}`,
				token,
			);
		}
	});

	// --- Bind lifecycle ports based on channel config ---
	switch (config.channel) {
		case "telegram":
			setPortAdapter(startListeningPort, telegramStartListeningAdapter);
			setPortAdapter(stopListeningPort, telegramStopListeningAdapter);
			console.log("[Composition]: Telegram adapter configured.");
			break;
		default:
			console.warn(
				`[Composition]: No adapter configured for channel: ${config.channel}`,
			);
	}
}
