import { z } from "zod";
import { createAggregate, createPort } from "@maxdev1/sotajs";
import {
	FormDefinitionSchema,
	FsmDefinitionSchema,
	ViewDefinitionSchema,
} from "../../desing/domain";
import type {
	FsmDefinition,
	ViewDefinition,
	FormDefinition,
} from "../../desing/domain";

// --- Схема состояния и типы ---

const ConversationStateSchema = z.object({
	id: z.string().uuid(),
	botPersonaId: z.string().uuid(),
	chatId: z.string(),
	status: z.enum(["active", "finished", "cancelled"]),

	currentStateId: z.string(),
	formState: z.record(z.string(), z.any()), // Простое хранилище для собранных данных

	// Копии "чертежей" для автономной работы
	fsmDefinition: FsmDefinitionSchema,
	viewDefinition: ViewDefinitionSchema,
	formDefinition: FormDefinitionSchema,

	createdAt: z.date(),
	updatedAt: z.date(),
});

type ConversationState = z.infer<typeof ConversationStateSchema>;

// --- Агрегат Conversation ---

export const Conversation = createAggregate({
	name: "Conversation",
	schema: ConversationStateSchema,
	invariants: [],

	computed: {
		isActive: (state) => state.status === "active",
		isFinished: (state) => state.status === "finished",

		/**
		 * Находит узел представления для текущего состояния и разрешает
		 * его props, подставляя значения из formState.
		 */
		currentView: (state) => {
			const viewNode = state.viewDefinition.nodes.find(
				(n) => n.id === state.currentStateId,
			);

			if (!viewNode) {
				// Этого не должно произойти, если BotPersona прошел валидацию
				return null;
			}

			const resolvedProps: Record<string, any> = {};
			for (const key in viewNode.props) {
				const propValue = viewNode.props[key];
				if (typeof propValue === "string" && propValue.startsWith("context.")) {
					const contextKey = propValue.substring("context.".length);
					resolvedProps[key] = state.formState[contextKey];
				} else {
					resolvedProps[key] = propValue;
				}
			}

			return { ...viewNode, props: resolvedProps };
		},
	},

	actions: {
		/**
		 * Главный метод, двигающий диалог вперед.
		 */
		applyEvent: (
			state: ConversationState,
			{ event, payload }: { event: string; payload?: Record<string, any> },
		) => {
			if (state.status !== "active") {
				throw new Error("Cannot apply event to a non-active conversation.");
			}

			const transition = state.fsmDefinition.transitions.find(
				(t) => t.from === state.currentStateId && t.event === event,
			);

			if (!transition) {
				// В будущем здесь можно будет вызвать output port `invalidInput`
				throw new Error(
					`Invalid event '${event}' for state '${state.currentStateId}'.`,
				);
			}

			// 1. Обновляем состояние формы согласно правилам `assign`
			if (transition.assign) {
				for (const [formKey, payloadExpr] of Object.entries(
					transition.assign,
				)) {
					if (
						typeof payloadExpr === "string" &&
						payloadExpr.startsWith("payload.")
					) {
						const payloadKey = payloadExpr.substring("payload.".length);
						if (payload && payloadKey in payload) {
							state.formState[formKey] = payload[payloadKey];
						}
					} else {
						// Прямое присваивание литерала
						state.formState[formKey] = payloadExpr;
					}
				}
			}

			// 2. Обновляем текущее состояние FSM
			state.currentStateId = transition.to;

			// 3. Проверяем, не стало ли новое состояние финальным
			const isFinal = !state.fsmDefinition.transitions.some(
				(t) => t.from === state.currentStateId,
			);

			if (isFinal) {
				state.status = "finished";
			}

			state.updatedAt = new Date();
		},

		finish: (state: ConversationState) => {
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
