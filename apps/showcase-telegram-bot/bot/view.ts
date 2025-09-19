// apps/showcase-telegram-bot/bot/view.ts
import { randomUUID } from "crypto";

export const viewDefinition = {
	nodes: [
		{ 
			id: "welcome", 
			components: [
				{ message: { id: randomUUID(), text: "👋 Привет! Я помогу вам понять, какой бот нужен именно вашему бизнесу. Поехали?" } },
				{ buttonGroup: { id: randomUUID(), buttons: [{ id: randomUUID(), label: "Поехали!", event: "START" }] } }
			]
		},
		{ 
			id: "ask_name", 
			components: [
				{ message: { id: randomUUID(), text: "Для начала, как я могу к вам обращаться?" } }
			]
		},
		{ 
			id: "ask_job", 
			components: [
				{ message: { id: randomUUID(), text: "Какую основную задачу должен решать ваш бот? (можно выбрать несколько)" } },
				{ buttonGroup: { id: randomUUID(), buttons: [{ id: randomUUID(), label: "Квалификация лидов"}, { id: randomUUID(), label: "Поддержка (FAQ)"}, { id: randomUUID(), label: "Далее", event: "SUBMIT_JOBS", payload: { selection: ["qualification", "support"] } }] } }
			]
		},
		{ 
			id: "ask_context", 
			components: [
				{ message: { id: randomUUID(), text: "А где именно бот будет работать?" } },
				{ buttonGroup: { id: randomUUID(), buttons: [{ id: randomUUID(), label: "Telegram" }, { id: randomUUID(), label: "Веб-сайт" }, { id: randomUUID(), label: "Далее", event: "SUBMIT_CONTEXTS", payload: { selection: ["website"] } }] } }
			]
		},
		{ 
			id: "ask_struggles", 
			components: [
				{ message: { id: randomUUID(), text: "Понял. Какие узкие места в ваших процессах вы видите сейчас?" } },
				{ buttonGroup: { id: randomUUID(), buttons: [{ id: randomUUID(), label: "Долго отвечаем на заявки", event: "SUBMIT_STRUGGLES", payload: { text: "Долго отвечаем на заявки" } }] } }
			]
		},
		{ 
			id: "ask_outcomes", 
			components: [
				{ message: { id: randomUUID(), text: "Ок. А достижение каких KPI будет для вас идеальным результатом?" } },
				{ buttonGroup: { id: randomUUID(), buttons: [{ id: randomUUID(), label: "Рост конверсии", event: "SUBMIT_OUTCOMES", payload: { text: "Рост конверсии" } }] } }
			]
		},
		{ 
			id: "ask_extras", 
			components: [
				{ message: { id: randomUUID(), text: "Нужны ли какие-то дополнительные возможности?" } },
				{ buttonGroup: { id: randomUUID(), buttons: [{ id: randomUUID(), label: "Интеграция с CRM" }, { id: randomUUID(), label: "Сбор аналитики" }, { id: randomUUID(), label: "Далее", event: "SUBMIT_EXTRAS", payload: { selection: ["crm", "analytics"] } }] } }
			]
		},
		{ 
			id: "ask_timeline", 
			components: [
				{ message: { id: randomUUID(), text: "Какие у вас желаемые сроки запуска?" } },
				{ buttonGroup: { id: randomUUID(), buttons: [{ id: randomUUID(), label: "В течение месяца", event: "SELECT_TIMELINE", payload: { selection: "month" } }] } }
			]
		},
		{ 
			id: "ask_budget", 
			components: [
				{ message: { id: randomUUID(), text: "И последний вопрос, чтобы я мог предложить вам релевантное решение. В какой бюджет планируете уложиться?" } },
				{ buttonGroup: { id: randomUUID(), buttons: [{ id: randomUUID(), label: "$1500+", event: "SELECT_BUDGET", payload: { selection: ">1500" } }] } }
			]
		},
		{ 
			id: "pre_offer", 
			components: [
				{ message: { id: randomUUID(), text: "Спасибо, context.name! На основе ваших ответов, вам идеально подходит модель **context.recommendedModel**. Обычно такие проекты стоят **context.estimate.price** и занимают **context.estimate.timeline**. Это предварительная оценка." } },
				{ buttonGroup: { id: randomUUID(), buttons: [{ id: randomUUID(), label: "Звучит интересно!", event: "CONTINUE" }, { id: randomUUID(), label: "Спасибо, пока неактуально", event: "TOO_EXPENSIVE" }] } }
			]
		},
		{ 
			id: "ask_show_examples", 
			components: [
				{ message: { id: randomUUID(), text: "Хотите, я покажу вам примеры подобных ботов в действии?" } },
				{ buttonGroup: { id: randomUUID(), buttons: [{ id: randomUUID(), label: "Да, покажи", event: "ACCEPT_EXAMPLES" }, { id: randomUUID(), label: "Нет, спасибо", event: "DECLINE_EXAMPLES" }] } }
			]
		},
		{ 
			id: "show_examples", 
			components: [
				{ message: { id: randomUUID(), text: "Отлично! Вот ссылка на релевантный кейс: [ссылка на кейс]. Изучите, и дайте мне знать, когда будете готовы продолжить." } },
				{ buttonGroup: { id: randomUUID(), buttons: [{ id: randomUUID(), label: "Готов продолжить", event: "CONTINUE" }] } }
			]
		},
		{ 
			id: "book_call", 
			components: [
				{ message: { id: randomUUID(), text: "Супер! Финальный шаг — забронировать короткий звонок с нашим специалистом для обсуждения деталей. Вот ссылка на календарь: [ссылка на Calendly]" } },
				{ buttonGroup: { id: randomUUID(), buttons: [{ id: randomUUID(), label: "Забронировал!", event: "BOOK_CALL" }] } }
			]
		},
		{ 
			id: "nurturing_goodbye", 
			components: [
				{ message: { id: randomUUID(), text: "Понимаю. Спасибо, что уделили время! Чтобы вы могли лучше оценить потенциал, я буду иногда присылать вам полезные материалы по этой теме. Хорошего дня!" } } 
			]
		},
		{ 
			id: "simple_goodbye", 
			components: [
				{ message: { id: randomUUID(), text: "Отлично! Рады будем поработать. Хорошего дня!" } }
			]
		},
	],
};