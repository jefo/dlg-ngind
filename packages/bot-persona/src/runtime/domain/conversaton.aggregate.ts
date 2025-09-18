import { z } from "zod";
import { createAggregate, createPort } from "@maxdev1/sotajs";
import {
	FormDefinitionSchema,
	FsmDefinitionSchema,
	ViewDefinitionSchema,
	FormEntity,
	FormEntitySchema,
} from "../../desing/domain";

// --- Схема состояния и типы ---

const ConversationStateSchema = z.object({
	id: z.string().uuid(),
	botPersonaId: z.string().uuid(),
	chatId: z.string(),
	status: z.enum(["active", "finished", "cancelled"]),
	currentStateId: z.string(),

	// Вся форма целиком является частью состояния диалога
	form: FormEntitySchema,

	// Копии "чертежей" для автономной работы
	fsmDefinition: FsmDefinitionSchema,
	viewDefinition: ViewDefinitionSchema,

	createdAt: z.date(),
	updatedAt: z.date(),
});

type ConversationState = z.infer<typeof ConversationStateSchema>;

// --- Агрегат Conversation ---

export const Conversation = createAggregate({
	name: "Conversation",
	schema: ConversationStateSchema,
	invariants: [],

	// Указываем, что `form` - это вложенная сущность
	entities: {
		form: FormEntity,
	},

	computed: {
		isActive: (state) => state.status === "active",
		isFinished: (state) => state.status === "finished",
		currentView: (state) => {
			const viewNode = state.viewDefinition.nodes.find(
				(n) => n.id === state.currentStateId,
			);
			if (!viewNode) return null;

			const resolvedProps: Record<string, any> = { ...viewNode.props };
			const formState = state.form.state.formState;

			const getNestedValue = (obj: any, path: string) =>
				path.split(".").reduce((acc, part) => acc && acc[part], obj);

			const context: Record<string, any> = {};
			for (const field of state.form.state.definition.fields) {
				context[field.name] = formState[field.id]?.value;
			}

			for (const key in resolvedProps) {
				let propValue = resolvedProps[key];
				if (typeof propValue === "string" && propValue.includes("context.")) {
					const matches = propValue.match(/context\.([\w_\.]+)/g) || [];
					for (const match of matches) {
						const path = match.substring("context.".length);
						const valueToReplace = getNestedValue(context, path);

						if (valueToReplace !== undefined && valueToReplace !== null) {
							// Use a simple string replacement
							propValue = propValue.replace(match, valueToReplace);
						}
					}
					resolvedProps[key] = propValue;
				}
			}

			return { ...viewNode, props: resolvedProps };
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
		                    } else {
		                        valueToSet = payloadExpr;
		                    }
		
		                    state.form.actions.setFieldValue({
		                        fieldId: field.id,
		                        value: valueToSet,
		                    });
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
