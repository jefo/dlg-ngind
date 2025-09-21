// apps/showcase-telegram-bot/bot/view.ts
import { randomUUID } from "crypto";

export const viewDefinition = {
	id: "jtbd-view-definition",
	nodes: [
		{ 
			id: "welcome", 
			components: [
				{
					id: randomUUID(),
					type: "message",
					props: { 
						text: "👋 Привет! Я помогу вам понять, какой бот нужен именно вашему бизнесу. Поехали?" 
					}
				},
				{
					id: randomUUID(),
					type: "button",
					props: { 
						text: "Поехали!", 
						action: "START" 
					}
				}
			]
		},
		{ 
			id: "ask_name", 
			components: [
				{
					id: randomUUID(),
					type: "message",
					props: { 
						text: "Для начала, как я могу к вам обращаться?" 
					}
				}
			]
		},
		{ 
			id: "ask_job", 
			components: [
				{
					id: randomUUID(),
					type: "message",
					props: { 
						text: "Какую основную задачу должен решать ваш бот? (можно выбрать несколько)" 
					}
				},
				{
					id: randomUUID(),
					type: "button",
					props: { 
						text: "Квалификация лидов", 
						action: "ADD_SELECTION", 
						payload: { value: "qualification" } 
					}
				},
				{
					id: randomUUID(),
					type: "button",
					props: { 
						text: "Поддержка (FAQ)", 
						action: "ADD_SELECTION", 
						payload: { value: "support" } 
					}
				},
				{
					id: randomUUID(),
					type: "button",
					props: { 
						text: "Далее", 
						action: "SUBMIT_JOBS" 
					}
				}
			]
		},
		{ 
			id: "ask_context", 
			components: [
				{
					id: randomUUID(),
					type: "message",
					props: { 
						text: "А где именно бот будет работать?" 
					}
				},
				{
					id: randomUUID(),
					type: "button",
					props: { 
						text: "Telegram", 
						action: "ADD_SELECTION", 
						payload: { value: "telegram" } 
					}
				},
				{
					id: randomUUID(),
					type: "button",
					props: { 
						text: "Веб-сайт", 
						action: "ADD_SELECTION", 
						payload: { value: "website" } 
					}
				},
				{
					id: randomUUID(),
					type: "button",
					props: { 
						text: "Далее", 
						action: "SUBMIT_CONTEXTS" 
					}
				}
			]
		},
		{ 
			id: "ask_struggles", 
			components: [
				{
					id: randomUUID(),
					type: "message",
					props: { 
						text: "Понял. Какие узкие места в ваших процессах вы видите сейчас?" 
					}
				},
				{
					id: randomUUID(),
					type: "button",
					props: { 
						text: "Долго отвечаем на заявки", 
						action: "SUBMIT_STRUGGLES", 
						payload: { selection: "long_response" } 
					}
				}
			]
		},
		{ 
			id: "ask_outcomes", 
			components: [
				{
					id: randomUUID(),
					type: "message",
					props: { 
						text: "Ок. А достижение каких KPI будет для вас идеальным результатом?" 
					}
				},
				{
					id: randomUUID(),
					type: "button",
					props: { 
						text: "Рост конверсии", 
						action: "SUBMIT_OUTCOMES", 
						payload: { selection: "conversion_growth" } 
					}
				}
			]
		},
		{ 
			id: "ask_extras", 
			components: [
				{
					id: randomUUID(),
					type: "message",
					props: { 
						text: "Нужны ли какие-то дополнительные возможности?" 
					}
				},
				{
					id: randomUUID(),
					type: "button",
					props: { 
						text: "Интеграция с CRM" 
					}
				},
				{
					id: randomUUID(),
					type: "button",
					props: { 
						text: "Сбор аналитики" 
					}
				},
				{
					id: randomUUID(),
					type: "button",
					props: { 
						text: "Далее", 
						action: "SUBMIT_EXTRAS", 
						payload: { selection: ["crm", "analytics"] } 
					}
				}
			]
		},
		{ 
			id: "ask_timeline", 
			components: [
				{
					id: randomUUID(),
					type: "message",
					props: { 
						text: "Какие у вас желаемые сроки запуска?" 
					}
				},
				{
					id: randomUUID(),
					type: "button",
					props: { 
						text: "В течение месяца", 
						action: "SELECT_TIMELINE", 
						payload: { selection: "month" } 
					}
				}
			]
		},
		{ 
			id: "ask_budget", 
			components: [
				{
					id: randomUUID(),
					type: "message",
					props: { 
						text: "И последний вопрос, чтобы я мог предложить вам релевантное решение. В какой бюджет планируете уложиться?" 
					}
				},
				{
					id: randomUUID(),
					type: "button",
					props: { 
						text: "$1500+", 
						action: "SELECT_BUDGET", 
						payload: { selection: ">1500" } 
					}
				}
			]
		},
		{ 
			id: "pre_offer", 
			components: [
				{
					id: randomUUID(),
					type: "message",
					props: { 
						text: "Спасибо, {{name}}! На основе ваших ответов, вам идеально подходит модель **{{recommendedModel}}**. Обычно такие проекты стоят **{{estimate.price}}** и занимают **{{estimate.timeline}}**. Это предварительная оценка." 
					}
				},
				{
					id: randomUUID(),
					type: "button",
					props: { 
						text: "Звучит интересно!", 
						action: "CONTINUE" 
					}
				},
				{
					id: randomUUID(),
					type: "button",
					props: { 
						text: "Спасибо, пока неактуально", 
						action: "TOO_EXPENSIVE" 
					}
				}
			]
		},
		{ 
			id: "ask_show_examples", 
			components: [
				{
					id: randomUUID(),
					type: "message",
					props: { 
						text: "Хотите, я покажу вам примеры подобных ботов в действии?" 
					}
				},
				{
					id: randomUUID(),
					type: "button",
					props: { 
						text: "Да, покажи", 
						action: "ACCEPT_EXAMPLES" 
					}
				},
				{
					id: randomUUID(),
					type: "button",
					props: { 
						text: "Нет, спасибо", 
						action: "DECLINE_EXAMPLES" 
					}
				}
			]
		},
		{ 
			id: "show_examples", 
			components: [
				{
					id: randomUUID(),
					type: "message",
					props: { 
						text: "Отлично! Вот ссылка на релевантный кейс: [ссылка на кейс]. Изучите, и дайте мне знать, когда будете готовы продолжить." 
					}
				},
				{
					id: randomUUID(),
					type: "button",
					props: { 
						text: "Готов продолжить", 
						action: "CONTINUE" 
					}
				}
			]
		},
		{ 
			id: "book_call", 
			components: [
				{
					id: randomUUID(),
					type: "message",
					props: { 
						text: "Супер! Финальный шаг — забронировать короткий звонок с нашим специалистом для обсуждения деталей. Вот ссылка на календарь: [ссылка на Calendly]" 
					}
				},
				{
					id: randomUUID(),
					type: "button",
					props: { 
						text: "Забронировал!", 
						action: "BOOK_CALL" 
					}
				}
			]
		},
		{ 
			id: "nurturing_goodbye", 
			components: [
				{
					id: randomUUID(),
					type: "message",
					props: { 
						text: "Понимаю. Спасибо, что уделили время! Чтобы вы могли лучше оценить потенциал, я буду иногда присылать вам полезные материалы по этой теме. Хорошего дня!" 
					}
				}
			]
		},
		{ 
			id: "simple_goodbye", 
			components: [
				{
					id: randomUUID(),
					type: "message",
					props: { 
						text: "Отлично! Рады будем поработать. Хорошего дня!" 
					}
				}
			]
		},
	],
};