import { setPortAdapter } from "@maxdev1/sotajs";
import { jtbdQualifierBotDefinition } from "./bot";
import { composeChatApp } from "@dlg-ngind/chat/";
import { composeBotPersonaApp } from "@dlg-ngind/bot-persona/";
import {
	incomingMessageReceivedOutPort,
	interactionProcessedOutPort,
	startChatServiceUseCase,
} from "@dlg-ngind/chat/src/application";
import {
	componentRenderOutPort,
	processUserInputUseCase,
	startConversationUseCase,
} from "@dlg-ngind/bot-persona/src/runtime/application";
import { telegramPresenterAdapter } from "@dlg-ngind/chat/src/infrastructure";
import {
	botPersonaDefinedOutPort,
	defineBotPersonaUseCase,
} from "@dlg-ngind/bot-persona/src/desing/application";

async function main() {
	console.log("🚀 Starting Showcase Telegram Bot...");

	// 1. Собираем оба контекста
	composeChatApp({ channel: "telegram" });
	composeBotPersonaApp();

	setPortAdapter(componentRenderOutPort, telegramPresenterAdapter);

	// 2. Определяем, как контексты взаимодействуют друг с другом
	setPortAdapter(interactionProcessedOutPort, async (interaction) => {
		console.log(
			`[Orchestrator]: Got interaction from @chat, routing to @bot-persona...`,
		);
		await processUserInputUseCase(interaction);
	});

	setPortAdapter(incomingMessageReceivedOutPort, async (message) => {
		console.log(
			`[Orchestrator]: Got text message from @chat, routing to @bot-persona...`,
		);
		await processUserInputUseCase({
			chatId: message.chatId,
			event: message.text,
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

	console.log("[Debug] DEMO_CHAT_ID from env:", process.env.DEMO_CHAT_ID);
	const demoChatId = `telegram:${process.env.DEMO_CHAT_ID}`;
	console.log("[Debug] demoChatId:", demoChatId);
	if (!process.env.DEMO_CHAT_ID) {
		console.warn(
			"[Orchestrator]: DEMO_CHAT_ID env variable is not set. Cannot start demo conversation.",
		);
	} else {
		console.log("[Debug] Starting demo conversation for chatId:", demoChatId);
		await startConversationUseCase({
			botPersonaId,
			chatId: demoChatId,
		});
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
