import { setPortAdapter } from "@maxdev1/sotajs";
import { resetDI } from "@maxdev1/sotajs";
import {
	botPersonas,
	componentRenderOutPort,
	composeApp,
	defineBotPersonaUseCase,
	inMemoryFindActiveConversationByChatIdAdapter,
	processUserInputUseCase,
	startConversationUseCase,
} from "bot-persona";

// import {
// 	// Bot Persona exports
// 	defineBotPersonaUseCase,
// 	startConversationUseCase,
// 	processUserInputUseCase,
// 	composeApp,
// 	botPersonas,
// 	componentRenderOutPort,
// 	inMemoryFindActiveConversationByChatIdAdapter,
// } from "bot-persona";

import {
	// Chat exports
	sendMessageUseCase,
	receiveIncomingMessageUseCase,
	runTelegramAdapter,
	composeChatApp,
	messageSentOutPort,
	saveMessagePort,
	inMemorySaveMessageAdapter,
} from "chat";

// --- 1. Декларация: Описываем "личность" нашего бота ---

const greeterBotDescriptor = {
	name: "GreeterBot",
	formDescriptor: {
		properties: { userName: { type: String, default: "незнакомец" } },
		guards: {
			userName: (name: string) =>
				name.length > 1 || "Имя должно быть длиннее одного символа!",
		},
	},
	fsm: {
		initialState: "asking_name",
		states: [
			{
				id: "asking_name",
				on: [
					{
						event: "MESSAGE_RECEIVED",
						target: "greeting",
						assign: { userName: "payload.text" },
					},
				],
			},
			{ id: "greeting", on: [] }, // Конечное состояние
		],
	},
	viewMap: {
		nodes: [
			{
				id: "asking_name",
				component: "Text",
				props: { text: "Привет! Как тебя зовут?" },
			},
			{
				id: "greeting",
				component: "Text",
				props: { text: "Приятно познакомиться, {{form.userName}}!" },
			},
		],
	},
};

// --- 2. Композиция: Собираем приложение и связываем контексты ---

async function setupApp() {
	resetDI();

	// --- Настраиваем BotPersona ---
	composeApp();

	// --- Настраиваем Chat ---
	composeChatApp();

	// --- Адаптер-мост: связывает выход из BotPersona со входом в Chat ---
	const rendererAdapter = async (dto: {
		chatId: string;
		componentName: string;
		props: any;
	}) => {
		console.log(
			`[RendererAdapter]: Got render request for ${dto.componentName}`,
		);
		// Пока поддерживаем только простой текстовый компонент
		if (dto.componentName === "Text") {
			await sendMessageUseCase({
				chatId: dto.chatId,
				senderId: "BOT",
				content: dto.props.text,
			});
		}
	};
	setPortAdapter(componentRenderOutPort, rendererAdapter);

	console.log("[App]: Composition complete.");
}

// --- 3. Оркестрация: Запускаем и координируем работу ---

async function main() {
	await setupApp();

	// Определяем нашего бота в системе
	await defineBotPersonaUseCase(greeterBotDescriptor);
	const greeterBot = Array.from(botPersonas.values())[0];
	console.log(`[App]: Bot Persona '${greeterBot.state.name}' defined.`);

	// Адаптер Telegram будет вызывать этот use case при получении сообщения
	const handleTelegramMessage = async (msg: {
		chatId: string;
		personaId: string;
		text: string;
	}) => {
		let conversation = await inMemoryFindActiveConversationByChatIdAdapter(
			msg.chatId,
		);
		if (!conversation) {
			console.log(
				`[App]: No active conversation for ${msg.chatId}, starting new one.`,
			);
			await startConversationUseCase({
				botPersonaId: greeterBot.state.id,
				chatId: msg.chatId,
			});
		}

		await processUserInputUseCase({
			chatId: msg.chatId,
			event: "MESSAGE_RECEIVED",
			payload: { text: msg.text },
		});
	};

	// Запускаем Telegram-адаптер, передав ему наш обработчик
	// Это имитирует подключение нашего `Application` к внешнему миру
	runTelegramAdapter(handleTelegramMessage);
	console.log("[App]: Telegram adapter started. Bot is running.");
}

main().catch(console.error);
