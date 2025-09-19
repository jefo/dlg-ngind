// apps/showcase-telegram-bot/bot/fsm.ts

export const fsmDefinition = {
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
} as const;