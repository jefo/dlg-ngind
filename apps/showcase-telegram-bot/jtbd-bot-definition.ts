/**
 * Выносим определение бота в отдельный файл для чистоты.
 */
export const jtbdQualifierBotDefinition = {
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
			// ... (здесь должно быть полное определение view, но для краткости опускаем)
		],
	},
};