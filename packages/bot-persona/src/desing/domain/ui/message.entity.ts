import { z } from "zod";
import { createEntity } from "@maxdev1/sotajs";

// --- Схема и тип для данных, описывающих текстовое сообщение ---

export const MessageSchema = z.object({
  id: z.string().uuid(),
  text: z.string(),
});

export type MessageProps = z.infer<typeof MessageSchema>;

// --- Сущность Сообщения ---

/**
 * MessageEntity представляет собой текстовый блок в UI.
 */
export const MessageEntity = createEntity({
  name: "Message",
  schema: MessageSchema,
  actions: {
    updateText: (state: MessageProps, newText: string) => {
      state.text = newText;
    },
  },
});

export type MessageEntity = ReturnType<typeof MessageEntity.create>;
