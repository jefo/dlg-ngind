import { setPortAdapter } from "@maxdev1/sotajs";
import { composeApp } from "./src/composition";
import { defineBotPersonaUseCase } from "./src/desing/application/define-bot-persona.use-case";
import { botPersonaDefinedOutPort } from "./src/desing/application/ports";
import { processUserInputUseCase } from "./src/runtime/application/process-user-input.use-case";
import { startConversationUseCase } from "./src/runtime/application/start-conversation.use-case";

// --- Определение "Lead Qualifier Bot" ---

const leadQualifierBotDefinition = {
	name: "Lead Qualifier Bot",
	fsmDefinition: {
		initialStateId: "welcome",
		states: [
			{ id: "welcome" },
			{ id: "ask_name" },
			{ id: "ask_company_size" },
			{ id: "ask_role" },
			{ id: "ask_goal" },
			{ id: "offer_call" },
			{ id: "qualified_goodbye" },
			{ id: "declined_goodbye" },
		],
		transitions: [
			{ from: "welcome", event: "START", to: "ask_name" },
			{
				from: "ask_name",
				event: "SUBMIT_NAME",
				to: "ask_company_size",
				assign: { userName: "payload.name" },
			},
			{
				from: "ask_company_size",
				event: "SELECT_SIZE",
				to: "ask_role",
				assign: { companySize: "payload.size" },
			},
			{
				from: "ask_role",
				event: "SUBMIT_ROLE",
				to: "ask_goal",
				assign: { userRole: "payload.role" },
			},
			{
				from: "ask_goal",
				event: "SUBMIT_GOAL",
				to: "offer_call",
				assign: { userGoal: "payload.goal" },
			},
			{ from: "offer_call", event: "ACCEPT_CALL", to: "qualified_goodbye" },
			{ from: "offer_call", event: "DECLINE_CALL", to: "declined_goodbye" },
		],
	},
	viewDefinition: {
		nodes: [
			{
				id: "welcome",
				component: "Message",
				props: {
					text: "Здравствуйте! Я помогу вам подобрать решение и определю, сможем ли мы быть вам полезны. Нажмите 'Начать', чтобы продолжить.",
					buttons: [{ label: "Начать", event: "START" }],
				},
			},
			{
				id: "ask_name",
				component: "Message",
				props: { text: "Рад знакомству! Как я могу к вам обращаться?" },
			},
			{
				id: "ask_company_size",
				component: "Message",
				props: {
					text: "Спасибо, context.userName! Подскажите, пожалуйста, сколько сотрудников в вашей компании?",
					buttons: [
						{ label: "1-10", event: "SELECT_SIZE", payload: { size: "1-10" } },
						{
							label: "11-50",
							event: "SELECT_SIZE",
							payload: { size: "11-50" },
						},
						{
							label: "51-200",
							event: "SELECT_SIZE",
							payload: { size: "51-200" },
						},
						{
							label: "200+",
							event: "SELECT_SIZE",
							payload: { size: "200+" },
						},
					],
				},
			},
			{
				id: "ask_role",
				component: "Message",
				props: { text: "Понял. А какая у вас роль в компании?" },
			},
			{
				id: "ask_goal",
				component: "Message",
				props: {
					text: "Отлично. Опишите кратко, какую задачу или проблему вы хотите решить с помощью бота?",
				},
			},
			{
				id: "offer_call",
				component: "Message",
				props: {
					text: "Спасибо за ответы! Вижу, что мы можем быть вам полезны. context.userName, предлагаю созвониться с нашим специалистом для детального обсуждения. Удобно?",
					buttons: [
						{ label: "Да, удобно", event: "ACCEPT_CALL" },
						{ label: "Нет, спасибо", event: "DECLINE_CALL" },
					],
				},
			},
			{
				id: "qualified_goodbye",
				component: "Message",
				props: {
					text: "Отлично! Наш менеджер скоро свяжется с вами. Хорошего дня!",
				},
			},
			{
				id: "declined_goodbye",
				component: "Message",
				props: {
					text: "Понимаю. В любом случае, спасибо за уделенное время! Если что-то изменится, вы знаете, где нас найти.",
				},
			},
		],
	},
	formDefinition: {
		id: "lead-qualifier-form",
		name: "Lead Qualifier Form",
		fields: [
			{ id: "f-name", name: "userName", type: "string", label: "User Name" },
			{
				id: "f-size",
				name: "companySize",
				type: "string",
				label: "Company Size",
			},
			{ id: "f-role", name: "userRole", type: "string", label: "User Role" },
			{ id: "f-goal", name: "userGoal", type: "string", label: "User Goal" },
		],
	},
};

// --- Основная функция теста ---

async function runLeadQualifierTest() {
	console.log("\n--- 🚀 Starting E2E Lead Qualifier Bot Test ---");

	composeApp();

	let createdPersonaId: string;
	setPortAdapter(botPersonaDefinedOutPort, async (dto) => {
		createdPersonaId = dto.personaId;
		console.log(`\n✅ Bot Persona Defined: ${dto.name} (ID: ${dto.personaId})`);
	});

	// 1. Определяем "личность" бота
	console.log("\n1️⃣  Defining Lead Qualifier Bot Persona...");
	await defineBotPersonaUseCase(leadQualifierBotDefinition);

	if (!createdPersonaId) {
		console.error("❌ E2E Test Failed: Bot Persona ID was not captured.");
		return;
	}

	const chatId = "e2e-lead-qualifier-chat-1";

	// 2. Начинаем диалог
	console.log(`\n2️⃣  Starting conversation for chatId: ${chatId}...`);
	await startConversationUseCase({ botPersonaId: createdPersonaId, chatId });

	// 3. Пользователь нажимает "Начать"
	console.log("\n3️⃣  Processing user event: START...");
	await processUserInputUseCase({ chatId, event: "START" });

	// 4. Пользователь вводит имя
	const userName = "Евгений";
	console.log(`\n4️⃣  Processing user event: SUBMIT_NAME with payload: { name: "${userName}" }...`);
	await processUserInputUseCase({
		chatId,
		event: "SUBMIT_NAME",
		payload: { name: userName },
	});

	// 5. Пользователь выбирает размер компании
	const companySize = "11-50";
	console.log(`\n5️⃣  Processing user event: SELECT_SIZE with payload: { size: "${companySize}" }...`);
	await processUserInputUseCase({
		chatId,
		event: "SELECT_SIZE",
		payload: { size: companySize },
	});

	// 6. Пользователь вводит свою роль
	const userRole = "Владелец";
	console.log(`\n6️⃣  Processing user event: SUBMIT_ROLE with payload: { role: "${userRole}" }...`);
	await processUserInputUseCase({
		chatId,
		event: "SUBMIT_ROLE",
		payload: { role: userRole },
	});

	// 7. Пользователь описывает задачу
	const userGoal = "Автоматизировать первую линию поддержки";
	console.log(`\n7️⃣  Processing user event: SUBMIT_GOAL with payload: { goal: "${userGoal}" }...`);
	await processUserInputUseCase({
		chatId,
		event: "SUBMIT_GOAL",
		payload: { goal: userGoal },
	});

	// 8. Пользователь соглашается на звонок
	console.log("\n8️⃣  Processing user event: ACCEPT_CALL...");
	await processUserInputUseCase({ chatId, event: "ACCEPT_CALL" });

	console.log("\n--- ✅ E2E Lead Qualifier Bot Test Finished ---\n");
}

// Запускаем тест
runLeadQualifierTest();
