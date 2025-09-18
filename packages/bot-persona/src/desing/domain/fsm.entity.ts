import { z } from "zod";
import { createEntity } from "@maxdev1/sotajs";

// --- Чистые определения и схемы для хранения и передачи данных (DTOs) ---

export const GuardConditionSchema = z.object({
	field: z.string(),
	operator: z.enum(["equals", "not_equals", "contains"]),
	value: z.any(),
});

export const TransitionDefinitionSchema = z.object({
	from: z.string(),
	to: z.string(),
	event: z.string(),
	assign: z.record(z.string(), z.string()).optional(),
	cond: GuardConditionSchema.optional(),
});

export const StateDefinitionSchema = z.object({
	id: z.string(),
});

/**
 * FsmDefinitionSchema - это "чертеж" конечного автомата.
 * Он описывает структуру, но не имеет собственного поведения или жизненного цикла.
 * Именно эта структура хранится внутри агрегата BotPersona.
 */
export const FsmDefinitionSchema = z.object({
	initialStateId: z.string(),
	states: z.array(StateDefinitionSchema),
	transitions: z.array(TransitionDefinitionSchema),
});

// --- Типы, выведенные из схем ---

export type FsmDefinition = z.infer<typeof FsmDefinitionSchema>;
export type StateDefinition = z.infer<typeof StateDefinitionSchema>;
export type TransitionDefinition = z.infer<typeof TransitionDefinitionSchema>;

// --- Сущность FSM для конструирования ---

/**
 * Схема состояния для FsmEntity. Расширяет чистое определение, добавляя собственный ID.
 */
const FsmEntitySchema = FsmDefinitionSchema.extend({
	id: z.string().uuid(),
});

type FsmEntityState = z.infer<typeof FsmEntitySchema>;

/**
 * FsmEntity - это Сущность, которая используется для конструирования и изменения FSM.
 * Она предоставляет actions для безопасной мутации определения FSM.
 * Не используется в рантайме, только в дизайн-системе (например, в no-code редакторе).
 */
export const FsmEntity = createEntity({
	schema: FsmEntitySchema,
	actions: {
		addState: (state: FsmEntityState, newState: StateDefinition) => {
			if (state.states.some((s) => s.id === newState.id)) {
				throw new Error(`State with id ${newState.id} already exists.`);
			}
			state.states.push(newState);
		},

		removeState: (state: FsmEntityState, stateId: string) => {
			state.states = state.states.filter((s) => s.id !== stateId);
			// Также удаляем все переходы, связанные с этим состоянием
			state.transitions = state.transitions.filter(
				(t) => t.from !== stateId && t.to !== stateId,
			);
		},

		addTransition: (state: FsmEntityState, newTransition: TransitionDefinition) => {
			const fromExists = state.states.some((s) => s.id === newTransition.from);
			const toExists = state.states.some((s) => s.id === newTransition.to);

			if (!fromExists || !toExists) {
				throw new Error("Cannot add transition between non-existent states.");
			}

			state.transitions.push(newTransition);
		},

		setInitialState: (state: FsmEntityState, stateId: string) => {
			if (!state.states.some((s) => s.id === stateId)) {
				throw new Error(`Cannot set initial state to non-existent state '${stateId}'.`);
			}
			state.initialStateId = stateId;
		},
	},
});

export type FsmEntity = ReturnType<typeof FsmEntity.create>;