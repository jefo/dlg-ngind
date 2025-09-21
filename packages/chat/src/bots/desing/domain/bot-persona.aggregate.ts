import { createAggregate, createPort } from "@maxdev1/sotajs";
import { z } from "zod";
import { FormDefinitionSchema, type FormDefinition } from "./form.entity";
import { FsmDefinitionSchema, type FsmDefinition } from "./fsm.entity";
import {
	StateViewMap,
	type ViewDefinition,
} from "./view-definition.entity";

// --- Схема Агрегата ---

const BotPersonaPropsSchema = z.object({
	id: z.string(),
	name: z.string().min(1, "Bot name cannot be empty"),
	fsmDefinition: FsmDefinitionSchema,
	viewDefinition: StateViewMap,
	formDefinition: FormDefinitionSchema,
});

type BotPersonaProps = z.infer<typeof BotPersonaPropsSchema>;

// --- Агрегат BotPersona ---

/**
 * Агрегат BotPersona.
 * Ответственность: Хранить и защищать целостность "чертежа" (личности) бота.
 * Является транзакционной границей для определений FSM, View и Form.
 * Гарантирует, что определение бота всегда консистентно и готово к исполнению.
 */
export const BotPersona = createAggregate({
	name: "BotPersona",
	schema: BotPersonaPropsSchema,

	/**
	 * Инварианты — это бизнес-правила, которые должны соблюдаться всегда.
	 * Они автоматически проверяются после каждого вызова action.
	 */
	invariants: [
		(state) => {
			const fsmStates = new Set(state.fsmDefinition.states.map((s) => s.id));
			if (!fsmStates.has(state.fsmDefinition.initialStateId)) {
				throw new Error(
					`Invariant failed: Initial state '${state.fsmDefinition.initialStateId}' not found in FSM state list.`,
				);
			}
		},
		(state) => {
			const fsmStates = new Set(state.fsmDefinition.states.map((s) => s.id));
			for (const transition of state.fsmDefinition.transitions) {
				if (!fsmStates.has(transition.from)) {
					throw new Error(
						`Invariant failed: Transition '${transition.event}' refers to a non-existent 'from' state: '${transition.from}'.`,
					);
				}
				if (!fsmStates.has(transition.to)) {
					throw new Error(
						`Invariant failed: Transition '${transition.event}' refers to a non-existent 'to' state: '${transition.to}'.`,
					);
				}
			}
		},
		(state) => {
			const fsmStateIds = new Set(state.fsmDefinition.states.map((s) => s.id));
			const viewNodeIds = new Set(state.viewDefinition.nodes.map((n) => n.id));

			for (const fsmStateId of fsmStateIds) {
				if (!viewNodeIds.has(fsmStateId)) {
					throw new Error(
						`Invariant failed: FSM state '${fsmStateId}' has no corresponding node in View Definition.`,
					);
				}
			}
		},
	],

	/**
	 * Actions — это единственно верный способ изменить состояние агрегата.
	 * Они инкапсулируют бизнес-операции над "чертежом" бота.
	 */
	actions: {
		rename: (state: BotPersonaProps, newName: string) => {
			if (newName.trim().length === 0) {
				throw new Error("Bot name cannot be empty.");
			}
			state.name = newName;
		},
		updateFsm: (state: BotPersonaProps, newFsm: FsmDefinition) => {
			// Валидация самой схемы FSM произойдет на уровне Zod
			state.fsmDefinition = newFsm;
			// После этого автоматически запустятся инварианты для проверки консистентности
		},
		updateView: (state: BotPersonaProps, newView: ViewDefinition) => {
			state.viewDefinition = newView;
		},
		updateForm: (state: BotPersonaProps, newForm: FormDefinition) => {
			state.formDefinition = newForm;
		},
	},
});

export type BotPersona = ReturnType<typeof BotPersona.create>;

// --- Порты Домена ---

/**
 * Порт для сохранения состояния агрегата BotPersona.
 * Принимает на вход чистое состояние (props), а не инстанс с методами.
 */
export const saveBotPersonaPort =
	createPort<(props: BotPersonaProps) => Promise<void>>();

/**
 * Порт для поиска и восстановления агрегата BotPersona из хранилища.
 */
export const findBotPersonaByIdPort =
	createPort<(id: string) => Promise<BotPersona | null>>();
