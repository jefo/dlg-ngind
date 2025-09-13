import { receiveIncomingMessageUseCase } from "./index";
import { getTelegramUpdates } from "./telegram-api.client";

/**
 * Преобразует "сырое" обновление от Telegram в наш внутренний DTO.
 */
async function handleTelegramUpdate(
	update: any,
	customHandler?: (payload: any) => Promise<void>,
) {
	const message = update.message;
	if (!message || !message.text) return;

	const payload = {
		chatId: `telegram:${message.chat.id}`,
		personaId: `telegram:${message.from.id}`,
		personaName: message.from.first_name || "User",
		text: message.text,
	};

	console.log(
		`< [Adapter]: Received message from ${payload.personaName}. Routing to Core...`,
	);

	if (customHandler) {
		await customHandler(payload);
	} else {
		await receiveIncomingMessageUseCase(payload);
	}
}

/**
 * Главный цикл адаптера, который опрашивает Telegram.
 * Если передан customHandler, он будет использоваться вместо стандартного обработчика.
 */
export async function runTelegramAdapter(
	customHandler?: (payload: any) => Promise<void>,
) {
	console.log("Running Telegram Adapter...");
	let offset = 0;
	while (true) {
		try {
			const updates = await getTelegramUpdates(offset);
			for (const update of updates) {
				offset = update.update_id + 1;
				await handleTelegramUpdate(update, customHandler);
			}
		} catch (error) {
			console.error("[Adapter]: Error in polling loop:", error);
			await new Promise((resolve) => setTimeout(resolve, 10000));
		}
	}
}
