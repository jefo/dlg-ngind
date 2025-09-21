import { z } from "zod";
import { createAggregate, createPort } from "@maxdev1/sotajs";
import {
	FormDefinitionSchema,
	FsmDefinitionSchema,
	FormEntity,
	FormEntitySchema,
} from "../../desing/domain";
import {
	BotProductCardComponentSchema,
	ButtonComponentSchema,
	CardComponentSchema,
	MessageComponentSchema,
	ProductCardComponentSchema,
	ViewSchema,
	type ViewProps,
} from "../../../ui";

const ConversationStateSchema = z.object({
	id: z.string().uuid(),
	botPersonaId: z.string().uuid(),
	chatId: z.string(),
	status: z.enum(["active", "finished", "cancelled"]),
	currentStateId: z.string(),
	form: FormEntitySchema,
	// Копии "чертежей" для автономной работы
	fsmDefinition: FsmDefinitionSchema,
	// id is a FSM key
	viewMap: z.record(z.string(), ViewSchema),
	createdAt: z.date(),
	updatedAt: z.date(),
});

type ConversationState = z.infer<typeof ConversationStateSchema>;

// --- Агрегат Conversation ---

export const Conversation = createAggregate({
	name: "Conversation",
	schema: ConversationStateSchema,
	invariants: [],
	entities: {
		form: FormEntity,
	},
	computed: {
		isActive: (state) => state.status === "active",
		isFinished: (state) => state.status === "finished",
		currentView: (state): ViewProps => {
			const viewNode = state.viewMap[state.currentStateId];
			if (!viewNode)
				throw new Error("Current state not found in view definition");

			return viewNode;
		},
	},
	actions: {
		applyEvent: (
			state,
			{ event, payload }: { event: string; payload?: Record<string, any> },
		) => {
			if (state.status !== "active") {
				throw new Error("Cannot apply event to a non-active conversation.");
			}

			const possibleTransitions = state.fsmDefinition.transitions.filter(
				(t) => t.from === state.currentStateId && t.event === event,
			);

			let transition = null;

			for (const t of possibleTransitions) {
				if (!t.cond) {
					transition = t;
					break;
				}

				const { field, operator, value } = t.cond;
				const fieldDefinition = state.form.state.definition.fields.find(
					(f) => f.name === field,
				);
				if (!fieldDefinition) continue;

				const formValue = state.form.state.formState[fieldDefinition.id]?.value;

				let conditionMet = false;
				if (operator === "equals") {
					conditionMet = formValue === value;
				} else if (operator === "not_equals") {
					conditionMet = formValue !== value;
				} else if (operator === "contains") {
					conditionMet = Array.isArray(formValue) && formValue.includes(value);
				}

				if (conditionMet) {
					transition = t;
					break;
				}
			}

			if (!transition) {
				throw new Error(
					`Invalid event '${event}' for state '${state.currentStateId}' or conditions not met.`,
				);
			}

			if (transition.assign) {
				for (const [fieldName, payloadExpr] of Object.entries(
					transition.assign,
				)) {
					const field = state.form.state.definition.fields.find(
						(f) => f.name === fieldName,
					);
					if (!field) continue;

					let valueToSet: any;
					if (
						typeof payloadExpr === "string" &&
						payloadExpr.startsWith("payload.")
					) {
						const payloadKey = payloadExpr.substring("payload.".length);
						if (payload && payloadKey in payload) {
							valueToSet = payload[payloadKey];
						}
						// --- НАЧАЛО ИЗМЕНЕНИЯ: Обработка мультивыбора ---
					} else if (
						typeof payloadExpr === "object" &&
						!Array.isArray(payloadExpr) &&
						payloadExpr !== null &&
						"op" in payloadExpr &&
						payloadExpr.op === "add"
					) {
						const fieldState = state.form.state.formState[field.id];
						const currentArray = Array.isArray(fieldState?.value)
							? fieldState.value
							: [];
						const valueToAdd = (payloadExpr as any).value.startsWith("payload.")
							? payload?.[(payloadExpr as any).value.substring(8)]
							: (payloadExpr as any).value;

						if (valueToAdd !== undefined) {
							valueToSet = [...currentArray, valueToAdd];
						}
						// --- КОНЕЦ ИЗМЕНЕНИЯ ---
					} else {
						valueToSet = payloadExpr;
					}

					if (valueToSet !== undefined) {
						state.form.actions.setFieldValue({
							fieldId: field.id,
							value: valueToSet,
						});
					}
				}
			}

			state.currentStateId = transition.to;

			const isFinal = !state.fsmDefinition.transitions.some(
				(t) => t.from === state.currentStateId,
			);

			if (isFinal) {
				state.status = "finished";
			}

			state.updatedAt = new Date();
		},
		finish: (state) => {
			state.status = "finished";
			state.updatedAt = new Date();
		},
	},
});

export type Conversation = ReturnType<typeof Conversation.create>;

// --- Порты Домена ---

export const saveConversationPort =
	createPort<(props: ConversationState) => Promise<void>>();

export const findActiveConversationByChatIdPort =
	createPort<(chatId: string) => Promise<Conversation | null>>();
