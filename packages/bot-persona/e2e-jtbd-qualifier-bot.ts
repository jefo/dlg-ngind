import { setPortAdapter } from "@maxdev1/sotajs";
import { composeApp } from "./src/composition";
import { defineBotPersonaUseCase } from "./src/desing/application/define-bot-persona.use-case";
import { botPersonaDefinedOutPort } from "./src/desing/application/ports";
import { processUserInputUseCase } from "./src/runtime/application/process-user-input.use-case";
import { startConversationUseCase } from "./src/runtime/application/start-conversation.use-case";

// --- Определение "JTBD Lead Qualifier Bot v2" ---

const jtbdQualifierBotDefinition = {
	name: "JTBD Lead Qualifier Bot v2",
	formDefinition: {
		id: "jtbd-form-v2",
		name: "JTBD Form v2",
		fields: [
			{ id: "f-job", name: "job", type: "multiselect", label: "Job" },
			{ id: "f-context", name: "context", type: "multiselect", label: "Context" },
			{ id: "f-struggles", name: "struggles", type: "string", label: "Struggles" },
			{ id: "f-outcomes", name: "outcomes", type: "string", label: "Outcomes" },
			{ id: "f-extras", name: "extras", type: "multiselect", label: "Extras" },
			{ id: "f-timeline", name: "timeline", type: "string", label: "Timeline" },
			{ id: "f-budget", name: "budget", type: "string", label: "Budget" },
			// Поле для хранения динамической оценки
			{ id: "f-estimate", name: "estimate", type: "object", label: "Estimate" },
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
			{ id: "ask_extras" },
			{ id: "ask_timeline" },
			{ id: "ask_budget" },
			{ id: "show_estimate" },
			{ id: "show_summary" },
			{ id: "final_cta" },
			{ id: "goodbye" },
		],
		transitions: [
			{ from: "welcome", event: "START", to: "ask_job" },
			{ from: "ask_job", event: "SUBMIT_JOBS", to: "ask_context", assign: { job: "payload.selection" } },
			{ from: "ask_context", event: "SUBMIT_CONTEXTS", to: "ask_struggles", assign: { context: "payload.selection" } },
			{ from: "ask_struggles", event: "SUBMIT_STRUGGLES", to: "ask_outcomes", assign: { struggles: "payload.text" } },
			{ from: "ask_outcomes", event: "SUBMIT_OUTCOMES", to: "ask_extras", assign: { outcomes: "payload.text" } },
      // Изменен порядок: сначала фичи, потом сроки и бюджет
			{ from: "ask_extras", event: "SUBMIT_EXTRAS", to: "ask_timeline", assign: { extras: "payload.selection" } },
			{ from: "ask_timeline", event: "SELECT_TIMELINE", to: "ask_budget", assign: { timeline: "payload.selection" } },

      // Динамический расчет оценки в зависимости от наличия CRM в `extras`
			{
				from: "ask_budget",
				event: "SELECT_BUDGET",
				to: "show_estimate",
				assign: { budget: "payload.selection", estimate: "{ price: \"$1500-$2500\", timeline: \"4-6 недель\" }" },
				cond: { field: "extras", operator: "contains", value: "crm" },
			},
			{
				from: "ask_budget",
				event: "SELECT_BUDGET",
				to: "show_estimate",
				assign: { budget: "payload.selection", estimate: "{ price: \"$800-$1200\", timeline: \"3-4 недели\" }" },
			},

			{ from: "show_estimate", event: "CONTINUE", to: "show_summary" },
			{ from: "show_summary", event: "CONTINUE", to: "final_cta" },
			{ from: "final_cta", event: "ACCEPT_DEMO", to: "goodbye" },
			{ from: "final_cta", event: "DECLINE_DEMO", to: "goodbye" },
		],
	},
	viewDefinition: {
		nodes: [
			{ id: "welcome", component: "Message", props: { text: "👋 Привет! Я помогу вам понять, какой бот нужен именно вашему бизнесу. Обычно это занимает 3–5 минут. Поехали?", buttons: [{ label: "Поехали!", event: "START" }] } },
      // Добавлена кнопка "Далее" для мульти-селекта
			{ id: "ask_job", component: "Message", props: { text: "Какую задачу должен решать ваш бот? (можно выбрать несколько)", buttons: [{ label: "Квалификация лидов"}, { label: "Поддержка (FAQ)"}, { label: "Далее", event: "SUBMIT_JOBS", payload: { selection: ["qualification", "support"] } }] } },
			{ id: "ask_context", component: "Message", props: { text: "А где именно бот будет работать? (можно выбрать несколько)", buttons: [{ label: "Telegram"}, { label: "Веб-сайт"}, { label: "Далее", event: "SUBMIT_CONTEXTS", payload: { selection: ["telegram", "website"] } }] } },
      // Улучшенные формулировки и добавлены кнопки
			{ id: "ask_struggles", component: "Message", props: { text: "Какие узкие места в вашей воронке продаж или процессах вы видите сейчас?", buttons: [{ label: "Долго отвечаем на заявки", event: "SUBMIT_STRUGGLES", payload: { text: "Долго отвечаем на заявки" } }, { label: "Теряем клиентов", event: "SUBMIT_STRUGGLES", payload: { text: "Теряем клиентов" } }] } },
			{ id: "ask_outcomes", component: "Message", props: { text: "Достижение каких KPI будет для вас идеальным результатом работы бота?", buttons: [{ label: "Рост конверсии", event: "SUBMIT_OUTCOMES", payload: { text: "Рост конверсии" } }, { label: "Снижение времени ответа", event: "SUBMIT_OUTCOMES", payload: { text: "Снижение времени ответа" } }] } },
			{ id: "ask_extras", component: "Message", props: { text: "Хотите, чтобы я предложил дополнительные возможности? (можно выбрать несколько)", buttons: [{ label: "Интеграция с CRM"}, { label: "Сбор аналитики"}, { label: "Далее", event: "SUBMIT_EXTRAS", payload: { selection: ["crm", "analytics"] } }] } },
			{ id: "ask_timeline", component: "Message", props: { text: "Какие у вас сроки запуска?", buttons: [{ label: "Срочно (1–2 недели)", event: "SELECT_TIMELINE", payload: { selection: "urgent" } }, { label: "В течение месяца", event: "SELECT_TIMELINE", payload: { selection: "month" } }] } },
			{ id: "ask_budget", component: "Message", props: { text: "А какой у вас ориентировочный бюджет на проект?", buttons: [{ label: "до $1500", event: "SELECT_BUDGET", payload: { selection: "<1500" } }, { label: "$1500+", event: "SELECT_BUDGET", payload: { selection: ">1500" } }] } },
      // Вьюха для оценки теперь динамическая
			{ id: "show_estimate", component: "Message", props: { text: "Спасибо! На основе ваших ответов, проект обычно занимает context.estimate.timeline и стоит context.estimate.price. Это предварительная оценка.", buttons: [{ label: "Продолжить", event: "CONTINUE" }] } },
			{ id: "show_summary", component: "Message", props: { text: "Спасибо 🙏! Вот резюме вашей заявки:\n🎯 Цель: context.job\n💰 Бюджет: context.budget\n⏳ Сроки: context.timeline", buttons: [{ label: "Все верно!", event: "CONTINUE" }] } },
			{ id: "final_cta", component: "Message", props: { text: "Я передам это нашему менеджеру. Хотите получить бесплатный демо-прототип вашего будущего бота?", buttons: [{ label: "Да, хочу демо!", event: "ACCEPT_DEMO" }, { label: "Нет, спасибо", event: "DECLINE_DEMO" }] } },
			{ id: "goodbye", component: "Message", props: { text: "Отлично! Спасибо за уделенное время. Хорошего дня!" } },
		],
	},
};


async function runJtbdQualifierTestV2() {
	console.log("\n--- 🚀 Starting E2E JTBD Qualifier Bot Test v2 ---");

	composeApp();

	let createdPersonaId: string;
	setPortAdapter(botPersonaDefinedOutPort, async (dto) => {
		createdPersonaId = dto.personaId;
		console.log(`\n✅ Bot Persona Defined: ${dto.name} (ID: ${dto.personaId})`);
	});

	console.log("\n1️⃣  Defining JTBD Qualifier Bot Persona v2...");
	await defineBotPersonaUseCase(jtbdQualifierBotDefinition);

	if (!createdPersonaId) {
		console.error("❌ E2E Test Failed: Bot Persona ID was not captured.");
		return;
	}

	const chatId = "e2e-jtbd-chat-v2";

	console.log(`\n2️⃣  Starting conversation for chatId: ${chatId}...`);
	await startConversationUseCase({ botPersonaId: createdPersonaId, chatId });

	// 3. Эмулируем полный путь пользователя по новому сценарию
	console.log("\n➡️  Event: START");
	await processUserInputUseCase({ chatId, event: "START" });

	console.log("\n➡️  Event: SUBMIT_JOBS");
	await processUserInputUseCase({ chatId, event: "SUBMIT_JOBS", payload: { selection: ["qualification", "support"] } });

	console.log("\n➡️  Event: SUBMIT_CONTEXTS");
	await processUserInputUseCase({ chatId, event: "SUBMIT_CONTEXTS", payload: { selection: ["website"] } });

	console.log("\n➡️  Event: SUBMIT_STRUGGLES");
	await processUserInputUseCase({ chatId, event: "SUBMIT_STRUGGLES", payload: { text: "Теряем лидов по ночам" } });

	console.log("\n➡️  Event: SUBMIT_OUTCOMES");
	await processUserInputUseCase({ chatId, event: "SUBMIT_OUTCOMES", payload: { text: "Все лиды в CRM" } });

  // Проверяем логику с CRM
	console.log("\n➡️  Event: SUBMIT_EXTRAS");
	await processUserInputUseCase({ chatId, event: "SUBMIT_EXTRAS", payload: { selection: ["crm", "analytics"] } });

	console.log("\n➡️  Event: SELECT_TIMELINE");
	await processUserInputUseCase({ chatId, event: "SELECT_TIMELINE", payload: { selection: "month" } });

	console.log("\n➡️  Event: SELECT_BUDGET");
	await processUserInputUseCase({ chatId, event: "SELECT_BUDGET", payload: { selection: ">1500" } });

	console.log("\n➡️  Event: CONTINUE (after estimate)");
	await processUserInputUseCase({ chatId, event: "CONTINUE" });

	console.log("\n➡️  Event: CONTINUE (after summary)");
	await processUserInputUseCase({ chatId, event: "CONTINUE" });

	console.log("\n➡️  Event: ACCEPT_DEMO");
	await processUserInputUseCase({ chatId, event: "ACCEPT_DEMO" });

	console.log("\n--- ✅ E2E JTBD Qualifier Bot Test v2 Finished ---\\n");
}

runJtbdQualifierTestV2();