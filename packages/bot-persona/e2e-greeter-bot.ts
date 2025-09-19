import { setPortAdapter } from "@maxdev1/sotajs";
import { composeBotPersonaApp } from "./src/composition";
import { defineBotPersonaUseCase } from "./src/desing/application/define-bot-persona.use-case";
import { botPersonaDefinedOutPort } from "./src/desing/application/ports";
import { processUserInputUseCase } from "./src/runtime/application/process-user-input.use-case";
import { startConversationUseCase } from "./src/runtime/application/start-conversation.use-case";

// --- Определение нашего "Greeter Bot" ---

const greeterBotDefinition = {
	name: "Greeter Bot",
	fsmDefinition: {
		initialStateId: "welcome",
		states: [{ id: "welcome" }, { id: "ask_name" }, { id: "greet_user" }],
		transitions: [
			{
				from: "welcome",
				event: "START",
				to: "ask_name",
			},
			{
				from: "ask_name",
				event: "SUBMIT_NAME",
				to: "greet_user",
				assign: { userName: "payload.name" }, // Сохраняем имя из payload в formState
			},
		],
	},
	viewDefinition: {
		nodes: [
			{
				id: "welcome",
				component: "Message",
				props: { text: "Привет! Я бот, который умеет здороваться." },
			},
			{
				id: "ask_name",
				component: "Message",
				props: { text: "Как тебя зовут?" },
			},
			{
				id: "greet_user",
				component: "Message",
				// Используем динамическое свойство, которое будет заполнено из контекста
				props: { text: "Приятно познакомиться, context.userName!" },
			},
		],
	},
	formDefinition: {
		id: "greeter-form",
		name: "Greeter Form",
		fields: [
			{
				id: "user-name-field",
				name: "userName", // Ключ, который мы используем в `assign` и `context.`
				type: "string",
				label: "User Name",
			},
		],
	},
};

// --- Основная функция теста ---

async function runGreeterTest() {
	console.log("\n--- 🚀 Starting E2E Greeter Bot Test ---");

	// 1. Собираем приложение со всеми стандартными зависимостями
	composeBotPersonaApp();

	// 2. Переопределяем порт для перехвата ID созданного бота.
	// Это нужно делать ПОСЛЕ composeApp, чтобы наша подмена не была затерта.
	let createdPersonaId: string;
	setPortAdapter(botPersonaDefinedOutPort, async (dto) => {
		createdPersonaId = dto.personaId;
		console.log(`\n✅ Bot Persona Defined: ${dto.name} (ID: ${dto.personaId})`);
	});

	// 3. ШАГ 1: Определяем "личность" нашего бота
	console.log("\n1️⃣  Defining Greeter Bot Persona...");

	await defineBotPersonaUseCase(greeterBotDefinition);

	if (!createdPersonaId) {
		console.error("❌ E2E Test Failed: Bot Persona ID was not captured.");
		return;
	}

	// 4. ШАГ 2: Начинаем диалог
	const chatId = "e2e-test-chat-1";
	console.log(`\n2️⃣  Starting conversation for chatId: ${chatId}...`);
	await startConversationUseCase({ botPersonaId: createdPersonaId, chatId });

	// 5. ШАГ 3: Эмулируем первое действие пользователя (например, нажал кнопку "Начать")
	console.log("\n3️⃣  Processing user event: START...");
	await processUserInputUseCase({ chatId, event: "START" });

	// 6. ШАГ 4: Эмулируем ввод имени пользователем
	const userName = "Джамшут";
	console.log(`\n4️⃣  Processing user event: SUBMIT_NAME with payload: { name: "${userName}" }...`);
	await processUserInputUseCase({
		chatId,
		event: "SUBMIT_NAME",
		payload: { name: userName },
	});

	console.log("\n--- ✅ E2E Greeter Bot Test Finished ---\n");
}

// Запускаем тест
runGreeterTest();
