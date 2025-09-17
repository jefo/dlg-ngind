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

			for (const key in resolvedProps) {
				const propValue = resolvedProps[key];
				if (typeof propValue === "string" && propValue.includes("context.")) {
					// Ищем все вхождения context.fieldName в строке
					const matches = propValue.match(/context\.[\w_]+/g) || [];
					for (const match of matches) {
						const contextKey = match.substring("context.".length);
						const field = state.form.state.definition.fields.find(
							(f) => f.name === contextKey,
						);
						if (field && formState[field.id]?.value) {
							// Заменяем шаблон на реальное значение
							resolvedProps[key] = resolvedProps[key].replace(
								match,
								state.form.state.formState[field.id]?.value,
							);
						}
					}
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

			const transition = state.fsmDefinition.transitions.find(
				(t) => t.from === state.currentStateId && t.event === event,
			);

			if (!transition) {
				throw new Error(
					`Invalid event '${event}' for state '${state.currentStateId}'.`,
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
