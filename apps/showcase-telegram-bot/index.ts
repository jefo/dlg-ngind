import { setPortAdapter } from "@maxdev1/sotajs";
import { jtbdQualifierBotDefinition } from "./bot";
import { composeChatApp } from "@dlg-ngind/chat/";
import { composeBotPersonaApp } from "@dlg-ngind/bot-persona/";
import {
	interactionProcessedOutPort,
	incomingMessageReceivedOutPort,
	startChatServiceUseCase,
} from "@dlg-ngind/chat/src/application";
import { processUserInputUseCase } from "@dlg-ngind/bot-persona/src/runtime/application";
import {
	botPersonaDefinedOutPort,
	defineBotPersonaUseCase,
} from "@dlg-ngind/bot-persona/src/desing/application";
import { viewRenderOutPort } from "@dlg-ngind/bot-persona/src/runtime/application/ports";
import {
	telegramViewPresentationPort,
	telegramViewPresentationErrorPort,
} from "@dlg-ngind/bot-persona/src/ui/application/ports/presentation.ports.ts";
import { telegramViewPresentationAdapter } from "@dlg-ngind/bot-persona/src/ui/presentation/telegram/telegram.presenter.adapter.ts";

async function main() {
	console.log("🚀 Starting Showcase Telegram Bot...");

	// 1. Собираем оба контекста
	composeChatApp({ channel: "telegram" });
	composeBotPersonaApp();

	// --- Настраиваем порты вывода (как bot-persona отправляет сообщения) ---
	// TODO: do not use mass setPortAdapters - doest not works

	setPortAdapter(telegramViewPresentationPort, telegramViewPresentationAdapter);
	setPortAdapter(telegramViewPresentationErrorPort, async (error) => {
		console.error("[Telegram Presenter] Error:", error.message);
	});

	// --- Настраиваем порты ввода (как bot-persona получает сообщения) ---

	// Канал 1: Обработка нажатий на кнопки (интеракции)
	setPortAdapter(interactionProcessedOutPort, async (interaction) => {
		console.log(
			`[Orchestrator]: Got interaction from @chat, routing to @bot-persona...`,
		);
		await processUserInputUseCase(interaction);
	});

	// Канал 2: Обработка текстовых сообщений
	setPortAdapter(incomingMessageReceivedOutPort, async (message) => {
		console.log(
			`[Orchestrator]: Got text message from @chat, routing to @bot-persona...`,
		);
		// Мы преобразуем DTO сообщения в DTO, понятный для processUserInputUseCase
		await processUserInputUseCase({
			chatId: message.chatId,
			event: "text", // <--- ИЗМЕНЕНИЕ: Используем фиксированное событие "text"
			payload: { text: message.text },
		});
	});

	// 3. Определяем и запускаем нашего бота
	let botPersonaId: string = "";
	setPortAdapter(botPersonaDefinedOutPort, async (dto) => {
		console.log(
			`[Orchestrator]: Bot Persona "${dto.name}" defined with ID: ${dto.personaId}`,
		);
		botPersonaId = dto.personaId;
	});

	await defineBotPersonaUseCase(jtbdQualifierBotDefinition);

	if (!botPersonaId) {
		console.error(
			"[Orchestrator]: Could not define Bot Persona. Shutting down.",
		);
		return;
	}

	// --- Демонстрационный запуск диалога (опционально) ---
	const demoChatIdEnv = process.env.DEMO_CHAT_ID;
	if (demoChatIdEnv) {
		const demoChatId = `telegram:${demoChatIdEnv}`;
		console.log("[Debug] Starting demo conversation for chatId:", demoChatId);
		const { startConversationUseCase } = await import(
			"@dlg-ngind/bot-persona/src/runtime/application"
		);
		await startConversationUseCase({
			botPersonaId,
			chatId: demoChatId,
		});
	} else {
		console.warn(
			"[Orchestrator]: DEMO_CHAT_ID env variable is not set. Cannot start demo conversation.",
		);
	}

	// 4. Запускаем основной сервис прослушивания сообщений из Telegram
	await startChatServiceUseCase({
		channel: "telegram",
		config: { token: process.env.TELEGRAM_BOT_TOKEN },
	});

	console.log(
		`✅ Showcase Telegram Bot is running. Send a message to your bot or press a button.`,
	);
}

main().catch(console.error);
