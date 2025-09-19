// apps/showcase-telegram-bot/bot/form.ts

export const formDefinition = {
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
};