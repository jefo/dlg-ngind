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

// Компонент карточки товара
const ProductCardComponentSchema = z.object({
  id: z.string(),
  type: z.literal('product-card'),
  props: z.object({
    title: z.string(),
    description: z.string().optional(),
    imageUrl: z.string().optional(),
    price: z.number().optional(),
    currency: z.string().optional(),
    actionText: z.string().optional(), // Текст для кнопки "подробнее"
    action: z.string().optional(),     // Действие при нажатии кнопки
  }),
});

export const ProductCardComponent = createValueObject(ProductCardComponentSchema);

// Компонент карточки бота
const BotProductCardComponentSchema = z.object({
  id: z.string(),
  type: z.literal('bot-product-card'),
  props: z.object({
    modelName: z.string(),              // Название модели бота
    features: z.array(z.string()),      // Список функций бота
    price: z.number(),                  // Стоимость
    currency: z.string().optional(),    // Валюта
    integrations: z.array(z.string()),  // Возможные интеграции
    actionText: z.string().optional(),  // Текст для кнопки "подробнее"
    action: z.string().optional(),      // Действие при нажатии кнопки
  }),
});

export const BotProductCardComponent = createValueObject(BotProductCardComponentSchema);