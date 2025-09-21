import { z } from "zod";
import { createAggregate } from "@maxdev1/sotajs";
import {
	BotProductCardComponentSchema,
	ButtonComponentSchema,
	CardComponentSchema,
	MessageComponentSchema,
	ProductCardComponentSchema,
} from "./components.value-object";

const ComponentsSchema = z.union([
	MessageComponentSchema,
	ButtonComponentSchema,
	CardComponentSchema,
	ProductCardComponentSchema,
	BotProductCardComponentSchema,
]);

// Схема для агрегата View
export const ViewSchema = z.object({
	id: z.string(),
	name: z.string(),
	description: z.string().optional(),
	layout: z.enum(["vertical", "horizontal", "grid"]),
	components: z.array(ComponentsSchema),
});

export type ViewProps = z.infer<typeof ViewSchema>;

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
