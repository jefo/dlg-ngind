import { setPortAdapter, usePort } from "@maxdev1/sotajs";
import { composeApp } from "./src/composition";
import { defineBotPersonaUseCase } from "./src/desing/application/define-bot-persona.use-case";
import { botPersonaDefinedOutPort } from "./src/desing/application/ports";
import { processUserInputUseCase } from "./src/runtime/application/process-user-input.use-case";
import { startNurturingSequenceOutPort } from "./src/runtime/application/ports";
import { startConversationUseCase } from "./src/runtime/application/start-conversation.use-case";

// --- Определение "JTBD Lead Qualifier Bot v1.1" ---

const jtbdQualifierBotDefinition = {
	name: "JTBD Lead Qualifier Bot v1.1",
	formDefinition: {
		id: "jtbd-form-v1.1",
		name: "JTBD Form v1.1",
		fields: [
			{ id: "f-name", name: "name", type: "string", label: "Name" },
			{ id: "f-job", name: "job", type: "multiselect", label: "Job" },
			{ id: "f-context", name: "context", type: "multiselect", label: "Context" },
			{ id: "f-struggles", name: "struggles", type: "string", label: "Struggles" },
			{ id: "f-outcomes", name: "outcomes", type: "string", label: "Outcomes" },
			{ id: "f-extras", name: "extras", type: "multiselect", label: "Extras" },
			{ id: "f-timeline", name: "timeline", type: "string", label: "Timeline" },
			{ id: "f-budget", name: "budget", type: "string", label: "Budget" },
			{ id: "f-estimate", name: "estimate", type: "object", label: "Estimate" },
			{ id: "f-recommended_model", name: "recommendedModel", type: "string", label: "Recommended Model" },
		],
	},
	fsmDefinition: {
		initialStateId: "welcome",
		states: [
			{ id: "welcome" },
			{ id: "ask_name" },
			{ id: "ask_job" },
			{ id: "ask_context" },
			{ id: "ask_struggles" },
			{ id: "ask_outcomes" },
			{ id: "ask_extras" },
			{ id: "ask_timeline" },
			{ id: "ask_budget" },
			{ id: "pre_offer" },
			{ id: "ask_show_examples" },
			{ id: "show_examples" },
			{ id: "book_call" },
			{ id: "nurturing_goodbye" },
			{ id: "simple_goodbye" },
		],
		transitions: [
			{ from: "welcome", event: "START", to: "ask_name" },
			{ from: "ask_name", event: "SUBMIT_NAME", to: "ask_job", assign: { name: "payload.text" } },
			{ from: "ask_job", event: "SUBMIT_JOBS", to: "ask_context", assign: { job: "payload.selection" } },
			{ from: "ask_context", event: "SUBMIT_CONTEXTS", to: "ask_struggles", assign: { context: "payload.selection" } },
			{ from: "ask_struggles", event: "SUBMIT_STRUGGLES", to: "ask_outcomes", assign: { struggles: "payload.text" } },
			{ from: "ask_outcomes", event: "SUBMIT_OUTCOMES", to: "ask_extras", assign: { outcomes: "payload.text" } },
			{ from: "ask_extras", event: "SUBMIT_EXTRAS", to: "ask_timeline", assign: { extras: "payload.selection" } },
			{ from: "ask_timeline", event: "SELECT_TIMELINE", to: "ask_budget", assign: { timeline: "payload.selection" } },

			// Расчет пре-оффера и переход к его показу
			{
				from: "ask_budget",
				event: "SELECT_BUDGET",
				to: "pre_offer",
				assign: { budget: "payload.selection", estimate: { price: "$1500-$2500", timeline: "4-6 недель" }, recommendedModel: "Бот для SaaS-триала" },
				cond: { field: "extras", operator: "contains", value: "crm" },
			},
			{
				from: "ask_budget",
				event: "SELECT_BUDGET",
				to: "pre_offer",
				assign: { budget: "payload.selection", estimate: { price: "$800-$1200", timeline: "3-4 недели" }, recommendedModel: "Бот для вебинарной воронки" },
			},

			// Ветвление после пре-оффера
			{ from: "pre_offer", event: "CONTINUE", to: "ask_show_examples" },
			{ from: "pre_offer", event: "TOO_EXPENSIVE", to: "nurturing_goodbye" },

			{ from: "ask_show_examples", event: "ACCEPT_EXAMPLES", to: "show_examples" },
			{ from: "ask_show_examples", event: "DECLINE_EXAMPLES", to: "book_call" },

			{ from: "show_examples", event: "CONTINUE", to: "book_call" },
			{ from: "book_call", event: "BOOK_CALL", to: "simple_goodbye" },
		],
	},
	viewDefinition: {
		nodes: [
			{ id: "welcome", component: "Message", props: { text: "👋 Привет! Я помогу вам понять, какой бот нужен именно вашему бизнесу. Поехали?", buttons: [{ label: "Поехали!", event: "START" }] } },
			{ id: "ask_name", component: "Message", props: { text: "Для начала, как я могу к вам обращаться?" } },
			{ id: "ask_job", component: "Message", props: { text: "Какую основную задачу должен решать ваш бот? (можно выбрать несколько)", buttons: [{ label: "Квалификация лидов" }, { label: "Поддержка (FAQ)" }, { label: "Далее", event: "SUBMIT_JOBS", payload: { selection: ["qualification", "support"] } }] } },
			{ id: "ask_context", component: "Message", props: { text: "А где именно бот будет работать?", buttons: [{ label: "Telegram" }, { label: "Веб-сайт" }, { label: "Далее", event: "SUBMIT_CONTEXTS", payload: { selection: ["website"] } }] } },
			{ id: "ask_struggles", component: "Message", props: { text: "Понял. Какие узкие места в ваших процессах вы видите сейчас?", buttons: [{ label: "Долго отвечаем на заявки", event: "SUBMIT_STRUGGLES", payload: { text: "Долго отвечаем на заявки" } }] } },
			{ id: "ask_outcomes", component: "Message", props: { text: "Ок. А достижение каких KPI будет для вас идеальным результатом?", buttons: [{ label: "Рост конверсии", event: "SUBMIT_OUTCOMES", payload: { text: "Рост конверсии" } }] } },
			{ id: "ask_extras", component: "Message", props: { text: "Нужны ли какие-то дополнительные возможности?", buttons: [{ label: "Интеграция с CRM" }, { label: "Сбор аналитики" }, { label: "Далее", event: "SUBMIT_EXTRAS", payload: { selection: ["crm", "analytics"] } }] } },
			{ id: "ask_timeline", component: "Message", props: { text: "Какие у вас желаемые сроки запуска?", buttons: [{ label: "В течение месяца", event: "SELECT_TIMELINE", payload: { selection: "month" } }] } },
			{ id: "ask_budget", component: "Message", props: { text: "И последний вопрос, чтобы я мог предложить вам релевантное решение. В какой бюджет планируете уложиться?", buttons: [{ label: "$1500+", event: "SELECT_BUDGET", payload: { selection: ">1500" } }] } },

			// Шаг с пре-оффером
			{ id: "pre_offer", component: "Message", props: { text: "Спасибо, context.name! На основе ваших ответов, вам идеально подходит модель **context.recommendedModel**. Обычно такие проекты стоят **context.estimate.price** и занимают **context.estimate.timeline**. Это предварительная оценка.", buttons: [{ label: "Звучит интересно!", event: "CONTINUE" }, { label: "Спасибо, пока неактуально", event: "TOO_EXPENSIVE" }] } },

			{ id: "ask_show_examples", component: "Message", props: { text: "Хотите, я покажу вам примеры подобных ботов в действии?", buttons: [{ label: "Да, покажи", event: "ACCEPT_EXAMPLES" }, { label: "Нет, спасибо", event: "DECLINE_EXAMPLES" }] } },
			{ id: "show_examples", component: "Message", props: { text: "Отлично! Вот ссылка на релевантный кейс: [ссылка на кейс]. Изучите, и дайте мне знать, когда будете готовы продолжить.", buttons: [{ label: "Готов продолжить", event: "CONTINUE" }] } },
			{ id: "book_call", component: "Message", props: { text: "Супер! Финальный шаг — забронировать короткий звонок с нашим специалистом для обсуждения деталей. Вот ссылка на календарь: [ссылка на Calendly]", buttons: [{ label: "Забронировал!", event: "BOOK_CALL" }] } },

			// Прощания
			{ id: "nurturing_goodbye", component: "Message", props: { text: "Понимаю. Спасибо, что уделили время! Чтобы вы могли лучше оценить потенциал, я буду иногда присылать вам полезные материалы по этой теме. Хорошего дня!" } },
			{ id: "simple_goodbye", component: "Message", props: { text: "Отлично! Рады будем поработать. Хорошего дня!" } },
		],
	},
};

// Простоая замена для jest.fn() в обычном скрипте
const createMock = () => {
	const calls: any[] = [];
	const fn = (...args: any[]) => {
		calls.push(args);
	};
	fn.mock = {
		calls: calls,
	};
	return fn;
};

async function runJtbdQualifierTestFinal() {
	console.log("\n--- 🚀 Starting E2E JTBD Qualifier Bot Test (Final) ---");

	composeApp();

	// Используем нашу простую мок-функцию
	const startNurturingMock = createMock();
	setPortAdapter(startNurturingSequenceOutPort, startNurturingMock as any);

	let createdPersonaId: string;
	setPortAdapter(botPersonaDefinedOutPort, async (dto) => {
		createdPersonaId = dto.personaId;
	});

	await defineBotPersonaUseCase(jtbdQualifierBotDefinition);

	const chatId = "e2e-jtbd-chat-final";
	await startConversationUseCase({ botPersonaId: createdPersonaId, chatId });

	// --- Сценарий 1: Успешная квалификация ---
	console.log("\n--- 演 Scenario 1: Successful Qualification ---");
	await processUserInputUseCase({ chatId, event: "START" });
	await processUserInputUseCase({ chatId, event: "SUBMIT_NAME", payload: { text: "Петр" } });
	await processUserInputUseCase({ chatId, event: "SUBMIT_JOBS", payload: { selection: ["qualification"] } });
	await processUserInputUseCase({ chatId, event: "SUBMIT_CONTEXTS", payload: { selection: ["website"] } });
	await processUserInputUseCase({ chatId, event: "SUBMIT_STRUGGLES", payload: { text: "Низкая конверсия" } });
	await processUserInputUseCase({ chatId, event: "SUBMIT_OUTCOMES", payload: { text: "Рост лидов" } });
	await processUserInputUseCase({ chatId, event: "SUBMIT_EXTRAS", payload: { selection: ["crm"] } }); // Выбираем CRM
	await processUserInputUseCase({ chatId, event: "SELECT_TIMELINE", payload: { selection: "month" } });
	await processUserInputUseCase({ chatId, event: "SELECT_BUDGET", payload: { selection: ">1500" } }); // Бюджет подходит
	await processUserInputUseCase({ chatId, event: "CONTINUE" }); // Соглашаемся с пре-оффером
	await processUserInputUseCase({ chatId, event: "ACCEPT_EXAMPLES" }); // Соглашаемся посмотреть примеры
	await processUserInputUseCase({ chatId, event: "CONTINUE" });
	await processUserInputUseCase({ chatId, event: "BOOK_CALL" });

	// --- Сценарий 2: Нецелевой лид ---
	console.log("\n--- 演 Scenario 2: Non-qualified Lead (Nurturing) ---");
	const chatId2 = "e2e-jtbd-chat-nurturing";
	await startConversationUseCase({ botPersonaId: createdPersonaId, chatId: chatId2 });
	await processUserInputUseCase({ chatId: chatId2, event: "START" });
	await processUserInputUseCase({ chatId: chatId2, event: "SUBMIT_NAME", payload: { text: "Иван" } });
	await processUserInputUseCase({ chatId: chatId2, event: "SUBMIT_JOBS", payload: { selection: ["support"] } });
	await processUserInputUseCase({ chatId: chatId2, event: "SUBMIT_CONTEXTS", payload: { selection: ["telegram"] } });
	await processUserInputUseCase({ chatId: chatId2, event: "SUBMIT_STRUGGLES", payload: { text: "Клиенты долго ждут ответа" } });
	await processUserInputUseCase({ chatId: chatId2, event: "SUBMIT_OUTCOMES", payload: { text: "Ускорить саппорт" } });
	await processUserInputUseCase({ chatId: chatId2, event: "SUBMIT_EXTRAS", payload: { selection: [] } }); // Без CRM
	await processUserInputUseCase({ chatId: chatId2, event: "SELECT_TIMELINE", payload: { selection: "month" } });
	await processUserInputUseCase({ chatId: chatId2, event: "SELECT_BUDGET", payload: { selection: ">1500" } });
	await processUserInputUseCase({ chatId: chatId2, event: "TOO_EXPENSIVE" }); // Нажимает "пока неактуально"

	// Проверяем, что порт для nurturing был вызван
	if (startNurturingMock.mock.calls.length > 0) {
		console.log("\n✅ startNurturingSequenceOutPort was called successfully!");
	} else {
		console.error("❌ E2E Test Failed: startNurturingSequenceOutPort was NOT called.");
	}

	console.log("\n--- ✅ E2E Final Test Finished ---\n");
}

// Запускаем тест
runJtbdQualifierTestFinal();