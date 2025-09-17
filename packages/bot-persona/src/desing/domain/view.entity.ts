import { z } from "zod";
import { createEntity } from "@maxdev1/sotajs";

// --- Чистые определения и схемы для хранения и передачи данных (DTOs) ---

export const ComponentDescriptorSchema = z.object({
	id: z.string(), // ID состояния FSM, которому соответствует этот узел
	component: z.string(), // Имя UI-компонента
	props: z.record(z.string(), z.any()).optional(), // Свойства для компонента
});

/**
 * ViewDefinitionSchema - это "чертеж" представлений.
 * Он сопоставляет состояния FSM с UI-компонентами.
 * Именно эта структура хранится внутри агрегата BotPersona.
 */
export const ViewDefinitionSchema = z.object({
	nodes: z.array(ComponentDescriptorSchema),
});

// --- Типы, выведенные из схем ---

export type ViewDefinition = z.infer<typeof ViewDefinitionSchema>;
export type ComponentDescriptor = z.infer<typeof ComponentDescriptorSchema>;

// --- Сущность View для конструирования ---

/**
 * Схема состояния для ViewEntity. Расширяет чистое определение, добавляя собственный ID.
 */
const ViewEntitySchema = ViewDefinitionSchema.extend({
	id: z.string().uuid(),
});

type ViewEntityState = z.infer<typeof ViewEntitySchema>;

/**
 * ViewEntity - это Сущность, которая используется для конструирования и изменения карты представлений.
 * Она предоставляет actions для безопасной мутации определения View.
 */
export const ViewEntity = createEntity({
	schema: ViewEntitySchema,
	actions: {
		addOrUpdateNode: (state: ViewEntityState, node: ComponentDescriptor) => {
			const nodeIndex = state.nodes.findIndex((n) => n.id === node.id);
			if (nodeIndex !== -1) {
				// Узел существует - обновляем его
				state.nodes[nodeIndex] = node;
			} else {
				// Узел новый - добавляем его
				state.nodes.push(node);
			}
		},

		removeNode: (state: ViewEntityState, nodeId: string) => {
			state.nodes = state.nodes.filter((n) => n.id !== nodeId);
		},
	},
});

export type ViewEntity = ReturnType<typeof ViewEntity.create>;
