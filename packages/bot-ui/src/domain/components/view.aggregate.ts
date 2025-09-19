import { z } from "zod";
import { createAggregate } from "@maxdev1/sotajs";

// Схема для агрегата View
const ViewSchema = z.object({
	id: z.string(),
	name: z.string(),
	description: z.string().optional(),
	layout: z.enum(["vertical", "horizontal", "grid"]),
	components: z.array(z.record(z.string(), z.unknown())), // Массив компонентов
});

export const View = createAggregate({
	schema: ViewSchema,
	name: "View",

	computed: {
		componentCount: (state) => state.components.length,
	},

	actions: {
		// Добавление компонента в представление
		addComponent: (state, component: any) => {
			state.components.push(component);
		},

		// Удаление компонента по ID
		removeComponent: (state, componentId: string) => {
			state.components = state.components.filter(
				(comp: any) => comp.id !== componentId,
			);
		},

		// Обновление layout
		updateLayout: (state, layout: "vertical" | "horizontal" | "grid") => {
			state.layout = layout;
		},
	},

	invariants: [],
});
