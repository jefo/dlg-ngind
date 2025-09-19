import { z } from "zod";
import { createEntity } from "@maxdev1/sotajs";

// --- Схема и тип для данных, описывающих одну кнопку ---

export const ButtonSchema = z.object({
  id: z.string().uuid(),
  label: z.string(),
  event: z.string().optional(),
  payload: z.record(z.string(), z.any()).optional(),
});

export type ButtonProps = z.infer<typeof ButtonSchema>;

// --- Сущность Кнопки ---

/**
 * ButtonEntity представляет собой одну интерактивную кнопку в UI.
 * Она инкапсулирует данные, необходимые для ее отображения и работы.
 */
export const ButtonEntity = createEntity({
  schema: ButtonSchema,
  actions: {
    // В будущем здесь могут быть действия, например, изменить label
    updateLabel: (state: ButtonProps, newLabel: string) => {
      state.label = newLabel;
    },
  },
});

export type ButtonEntity = ReturnType<typeof ButtonEntity.create>;
