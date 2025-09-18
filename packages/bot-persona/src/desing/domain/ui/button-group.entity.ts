import { z } from "zod";
import { createEntity } from "@maxdev1/sotajs";
import { ButtonSchema, type ButtonProps } from "./button.entity";

// --- Схема и тип для группы кнопок ---

export const ButtonGroupSchema = z.object({
  id: z.string().uuid(),
  buttons: z.array(ButtonSchema),
  // В будущем здесь можно добавить layout: 'inline' | 'grid' и т.д.
});

export type ButtonGroupProps = z.infer<typeof ButtonGroupSchema>;

// --- Сущность Группы Кнопок ---

/**
 * ButtonGroupEntity представляет собой контейнер для одной или нескольких кнопок.
 */
export const ButtonGroupEntity = createEntity({
  name: "ButtonGroup",
  schema: ButtonGroupSchema,
  actions: {
    addButton: (state: ButtonGroupProps, newButton: ButtonProps) => {
      state.buttons.push(newButton);
    },
    removeButton: (state: ButtonGroupProps, buttonId: string) => {
      state.buttons = state.buttons.filter(b => b.id !== buttonId);
    }
  },
});

export type ButtonGroupEntity = ReturnType<typeof ButtonGroupEntity.create>;
