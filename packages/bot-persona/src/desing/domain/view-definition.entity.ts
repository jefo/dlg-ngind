import { z } from "zod";
import { createEntity } from "@maxdev1/sotajs";
import {
	BotProductCardComponentSchema,
	ButtonComponentSchema,
	CardComponentSchema,
	MessageComponentSchema,
	ProductCardComponentSchema,
} from "../../ui";
// --- Чистые определения и схемы для хранения и передачи данных (DTOs) ---

// Объединенная схема для всех компонентов bot-ui
const BotUIComponentSchema = z.union([
	MessageComponentSchema,
	ButtonComponentSchema,
	CardComponentSchema,
	ProductCardComponentSchema,
	BotProductCardComponentSchema,
	z.object({
		id: z.string(),
		type: z.string(),
		props: z.record(z.string(), z.unknown()),
	}),
]);

export type BotUIComponent = z.infer<typeof BotUIComponentSchema>;

// Узел отображения теперь может состоять из bot-ui компонентов
export const ComponentDescriptorSchema = z.object({
	id: z.string(), // ID состояния FSM, которому соответствует этот узел
	components: z.array(BotUIComponentSchema),
});

/**
 * ViewDefinitionSchema - это "чертеж" представлений.
 * Он сопоставляет состояния FSM с набором UI-компонентов из bot-ui.
 * Именно эта структура хранится внутри агрегата BotPersona.
 */
export const ViewDefinitionSchema = z.object({
	id: z.string(),
	nodes: z.array(ComponentDescriptorSchema),
});

// --- Типы, выведенные из схем ---

export type ComponentDescriptor = z.infer<typeof ComponentDescriptorSchema>;

// --- Сущность View для конструирования ---

/**
 * Схема состояния для ViewEntity. Расширяет чистое определение, добавляя собственный ID.
 */

type ViewDefinitionState = z.infer<typeof ViewDefinitionSchema>;

/**
 * ViewEntity - это Сущность, которая используется для конструирования и изменения карты представлений.
 * Она предоставляет actions для безопасной мутации определения View.
 */
export const ViewDefinitionEntity = createEntity({
	schema: ViewDefinitionSchema,
	actions: {
		addOrUpdateNode: (
			state: ViewDefinitionState,
			node: ComponentDescriptor,
		) => {
			const nodeIndex = state.nodes.findIndex((n) => n.id === node.id);
			if (nodeIndex !== -1) {
				// Узел существует - обновляем его
				state.nodes[nodeIndex] = node;
			} else {
				// Узел новый - добавляем его
				state.nodes.push(node);
			}
		},

		removeNode: (state: ViewDefinitionState, nodeId: string) => {
			state.nodes = state.nodes.filter((n) => n.id !== nodeId);
		},

		// Новый action для добавления компонента к узлу
		addComponentToNode: (
			state: ViewDefinitionState,
			nodeId: string,
			component: BotUIComponent,
		) => {
			const nodeIndex = state.nodes.findIndex((n) => n.id === nodeId);
			if (nodeIndex !== -1) {
				state.nodes[nodeIndex].components.push(component);
			} else {
				// Если узел не существует, создаем его
				state.nodes.push({
					id: nodeId,
					components: [component],
				});
			}
		},

		// Новый action для удаления компонента из узла
		removeComponentFromNode: (
			state: ViewDefinitionState,
			nodeId: string,
			componentId: string,
		) => {
			const nodeIndex = state.nodes.findIndex((n) => n.id === nodeId);
			if (nodeIndex !== -1) {
				state.nodes[nodeIndex].components = state.nodes[
					nodeIndex
				].components.filter((comp: any) => comp.id !== componentId);
			}
		},
	},
});

export type ViewDefinitionEntity = ReturnType<
	typeof ViewDefinitionEntity.create
>;
