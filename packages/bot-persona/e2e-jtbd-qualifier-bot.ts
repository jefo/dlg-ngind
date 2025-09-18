import { setPortAdapter } from "@maxdev1/sotajs";
import { composeApp } from "./src/composition";
import { defineBotPersonaUseCase } from "./src/desing/application/define-bot-persona.use-case";
import { botPersonaDefinedOutPort } from "./src/desing/application/ports";
import { processUserInputUseCase } from "./src/runtime/application/process-user-input.use-case";
import { startConversationUseCase } from "./src/runtime/application/start-conversation.use-case";

// --- Определение "JTBD Lead Qualifier Bot" ---

const jtbdQualifierBotDefinition = {
	name: "JTBD Lead Qualifier Bot",
	formDefinition: {
		id: "jtbd-form",
		name: "JTBD Form",
		fields: [
			{ id: "f-job", name: "job", type: "multiselect", label: "Job" },
			{ id: "f-context", name: "context", type: "multiselect", label: "Context" },
			{ id: "f-struggles", name: "struggles", type: "string", label: "Struggles" },
			{ id: "f-outcomes", name: "outcomes", type: "string", label: "Outcomes" },
			{ id: "f-budget", name: "budget", type: "string", label: "Budget" },
			{ id: "f-timeline", name: "timeline", type: "string", label: "Timeline" },
			{ id: "f-extras", name: "extras", type: "multiselect", label: "Extras" },
		],
	},
	fsmDefinition: {
		initialStateId: "welcome",
		states: [
			{ id: "welcome" },
			{ id: "ask_job" },
			{ id: "ask_context" },
			{ id: "ask_struggles" },
			{ id: "ask_outcomes" },
			{ id: "ask_budget" },
			{ id: "ask_timeline" },
			{ id: "ask_extras" },
			{ id: "show_estimate" },
			{ id: "show_summary" },
			{ id: "final_cta" },
			{ id: "goodbye" },
		],
		transitions: [
			{ from: "welcome", event: "START", to: "ask_job" },
			{ from: "ask_job", event: "SELECT_JOB", to: "ask_context", assign: { job: "payload.selection" } },
			{ from: "ask_context", event: "SELECT_CONTEXT", to: "ask_struggles", assign: { context: "payload.selection" } },
			{ from: "ask_struggles", event: "SUBMIT_STRUGGLES", to: "ask_outcomes", assign: { struggles: "payload.text" } },
			{ from: "ask_outcomes", event: "SUBMIT_OUTCOMES", to: "ask_budget", assign: { outcomes: "payload.text" } },
			{ from: "ask_budget", event: "SELECT_BUDGET", to: "ask_timeline", assign: { budget: "payload.selection" } },
			{ from: "ask_timeline", event: "SELECT_TIMELINE", to: "ask_extras", assign: { timeline: "payload.selection" } },
			{ from: "ask_extras", event: "SELECT_EXTRAS", to: "show_estimate", assign: { extras: "payload.selection" } },
      // Условные переходы, которые мы добавили!
			{
				from: "show_estimate",
				event: "CONTINUE",
				to: "show_summary",
        // Пример использования cond. Перейдет сюда, если бюджет НЕ "еще не знаю"
				cond: { field: "budget", operator: "not_equals", value: "not_decided" },
			},
      {
				from: "show_estimate",
				event: "CONTINUE",
				to: "goodbye", // Сразу прощаемся, если бюджет не определен
			},
			{ from: "show_summary", event: "CONTINUE", to: "final_cta" },
			{ from: "final_cta", event: "ACCEPT_DEMO", to: "goodbye" },
			{ from: "final_cta", event: "DECLINE_DEMO", to: "goodbye" },
		],
	},
	viewDefinition: {
		nodes: [
			{ id: "welcome", component: "Message", props: { text: "👋 Привет! Я помогу вам понять, какой бот нужен именно вашему бизнесу. Обычно это занимает 3–5 минут. Поехали?", buttons: [{ label: "Поехали!", event: "START" }] } },
			{ id: "ask_job", component: "Message", props: { text: "Какую задачу должен решать ваш бот?", buttons: [{ label: "Квалификация лидов", event: "SELECT_JOB", payload: { selection: "qualification" } }, { label: "Поддержка (FAQ)", event: "SELECT_JOB", payload: { selection: "support" } }] } },
			{ id: "ask_context", component: "Message", props: { text: "А где именно бот будет работать?", buttons: [{ label: "Telegram", event: "SELECT_CONTEXT", payload: { selection: "telegram" } }, { label: "Веб-сайт", event: "SELECT_CONTEXT", payload: { selection: "website" } }] } },
			{ id: "ask_struggles", component: "Message", props: { text: "С какими трудностями вы сталкиваетесь без бота?" } },
			{ id: "ask_outcomes", component: "Message", props: { text: "Как вы поймёте, что бот работает идеально?" } },
			{ id: "ask_budget", component: "Message", props: { text: "А какой у вас ориентировочный бюджет на проект?", buttons: [{ label: "до $500", event: "SELECT_BUDGET", payload: { selection: "<500" } }, { label: "$500–1500", event: "SELECT_BUDGET", payload: { selection: "500-1500" } }, { label: "Ещё не знаю", event: "SELECT_BUDGET", payload: { selection: "not_decided" } }] } },
			{ id: "ask_timeline", component: "Message", props: { text: "Какие у вас сроки запуска?", buttons: [{ label: "Срочно (1–2 недели)", event: "SELECT_TIMELINE", payload: { selection: "urgent" } }, { label: "В течение месяца", event: "SELECT_TIMELINE", payload: { selection: "month" } }] } },
			{ id: "ask_extras", component: "Message", props: { text: "Хотите, чтобы я предложил дополнительные возможности?", buttons: [{ label: "Интеграция с CRM", event: "SELECT_EXTRAS", payload: { selection: "crm" } }, { label: "Нет, только база", event: "SELECT_EXTRAS", payload: { selection: "none" } }] } },
      // Плейсхолдер для предварительного расчета
			{ id: "show_estimate", component: "Message", props: { text: "Спасибо! На основе ваших ответов, проект обычно занимает 3-4 недели и стоит $800-$1200. Это предварительная оценка.", buttons: [{ label: "Продолжить", event: "CONTINUE" }] } },
			{ id: "show_summary", component: "Message", props: { text: "Спасибо 🙏! Вот резюме вашей заявки:\n🎯 Цель: context.job\n💰 Бюджет: context.budget\n⏳ Сроки: context.timeline", buttons: [{ label: "Все верно!", event: "CONTINUE" }] } },
			{ id: "final_cta", component: "Message", props: { text: "Я передам это нашему менеджеру. Хотите получить бесплатный демо-прототип вашего будущего бота?", buttons: [{ label: "Да, хочу демо!", event: "ACCEPT_DEMO" }, { label: "Нет, спасибо", event: "DECLINE_DEMO" }] } },
			{ id: "goodbye", component: "Message", props: { text: "Отлично! Спасибо за уделенное время. Хорошего дня!" } },
		],
	},
};

// --- Основная функция теста ---

async function runJtbdQualifierTest() {
	console.log("\n--- 🚀 Starting E2E JTBD Qualifier Bot Test ---");

	composeApp();

	let createdPersonaId: string;
	setPortAdapter(botPersonaDefinedOutPort, async (dto) => {
		createdPersonaId = dto.personaId;
		console.log(`\n✅ Bot Persona Defined: ${dto.name} (ID: ${dto.personaId})`);
	});

	// 1. Определяем "личность" бота
	console.log("\n1️⃣  Defining JTBD Qualifier Bot Persona...");
	await defineBotPersonaUseCase(jtbdQualifierBotDefinition);

	if (!createdPersonaId) {
		console.error("❌ E2E Test Failed: Bot Persona ID was not captured.");
		return;
	}

	const chatId = "e2e-jtbd-chat-1";

	// 2. Начинаем диалог
	console.log(`\n2️⃣  Starting conversation for chatId: ${chatId}...`);
	await startConversationUseCase({ botPersonaId: createdPersonaId, chatId });

	// 3. Эмулируем полный путь пользователя по сценарию
	console.log("\n➡️  Event: START");
	await processUserInputUseCase({ chatId, event: "START" });

	console.log("\n➡️  Event: SELECT_JOB");
	await processUserInputUseCase({ chatId, event: "SELECT_JOB", payload: { selection: "qualification" } });

	console.log("\n➡️  Event: SELECT_CONTEXT");
	await processUserInputUseCase({ chatId, event: "SELECT_CONTEXT", payload: { selection: "website" } });

	console.log("\n➡️  Event: SUBMIT_STRUGGLES");
	await processUserInputUseCase({ chatId, event: "SUBMIT_STRUGGLES", payload: { text: "Теряем лидов по ночам" } });

	console.log("\n➡️  Event: SUBMIT_OUTCOMES");
	await processUserInputUseCase({ chatId, event: "SUBMIT_OUTCOMES", payload: { text: "Все лиды в CRM" } });

	console.log("\n➡️  Event: SELECT_BUDGET");
	await processUserInputUseCase({ chatId, event: "SELECT_BUDGET", payload: { selection: "500-1500" } });

	console.log("\n➡️  Event: SELECT_TIMELINE");
	await processUserInputUseCase({ chatId, event: "SELECT_TIMELINE", payload: { selection: "month" } });

	console.log("\n➡️  Event: SELECT_EXTRAS");
	await processUserInputUseCase({ chatId, event: "SELECT_EXTRAS", payload: { selection: "crm" } });

	console.log("\n➡️  Event: CONTINUE (after estimate)");
	await processUserInputUseCase({ chatId, event: "CONTINUE" });

	console.log("\n➡️  Event: CONTINUE (after summary)");
	await processUserInputUseCase({ chatId, event: "CONTINUE" });

	console.log("\n➡️  Event: ACCEPT_DEMO");
	await processUserInputUseCase({ chatId, event: "ACCEPT_DEMO" });

	console.log("\n--- ✅ E2E JTBD Qualifier Bot Test Finished ---\n");
}

// Запускаем тест
runJtbdQualifierTest();
