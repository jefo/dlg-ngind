import { z } from 'zod';
import { createValueObject } from '@maxdev1/sotajs';

// Компонент сообщения
const MessageComponentSchema = z.object({
  id: z.string(),
  type: z.literal('message'),
  props: z.object({
    text: z.string(),
    variant: z.enum(['default', 'info', 'success', 'warning', 'error']).optional(),
  }),
});

export const MessageComponent = createValueObject(MessageComponentSchema);

// Компонент кнопки
const ButtonComponentSchema = z.object({
  id: z.string(),
  type: z.literal('button'),
  props: z.object({
    text: z.string(),
    action: z.string(),
    payload: z.record(z.string(), z.unknown()).optional(),
  }),
});

export const ButtonComponent = createValueObject(ButtonComponentSchema);

// Компонент карточки
const CardComponentSchema = z.object({
  id: z.string(),
  type: z.literal('card'),
  props: z.object({
    title: z.string(),
    description: z.string().optional(),
    imageUrl: z.string().optional(),
    actions: z.array(ButtonComponentSchema).optional(),
  }),
});

export const CardComponent = createValueObject(CardComponentSchema);