import { z } from "zod";
import { createValueObject } from "@maxdev1/sotajs";

// Компонент сообщения
export const MessageComponentSchema = z.object({
	id: z.string(),
	type: z.literal("message"),
	props: z.object({
		text: z.string(),
		variant: z
			.enum(["default", "info", "success", "warning", "error"])
			.optional(),
	}),
});

export type MessageComponent = z.infer<typeof MessageComponentSchema>;
export const MessageComponent = createValueObject(MessageComponentSchema);

// Компонент кнопки
export const ButtonComponentSchema = z.object({
	id: z.string(),
	type: z.literal("button"),
	props: z.object({
		text: z.string(),
		action: z.string(),
		payload: z.record(z.string(), z.unknown()).optional(),
	}),
});

export type ButtonComponent = z.infer<typeof ButtonComponentSchema>;
export const ButtonComponent = createValueObject(ButtonComponentSchema);

// Компонент карточки
export const CardComponentSchema = z.object({
	id: z.string(),
	type: z.literal("card"),
	props: z.object({
		title: z.string(),
		description: z.string().optional(),
		imageUrl: z.string().optional(),
		actions: z.array(ButtonComponentSchema).optional(),
	}),
});

export type CardComponent = z.infer<typeof CardComponentSchema>;
export const CardComponent = createValueObject(CardComponentSchema);

// Компонент карточки товара
export const ProductCardComponentSchema = z.object({
	id: z.string(),
	type: z.literal("product-card"),
	props: z.object({
		title: z.string(),
		description: z.string().optional(),
		imageUrl: z.string().optional(),
		price: z.number().optional(),
		currency: z.string().optional(),
		actionText: z.string().optional(), // Текст для кнопки "подробнее"
		action: z.string().optional(), // Действие при нажатии кнопки
	}),
});

export type ProductCardComponent = z.infer<typeof ProductCardComponentSchema>;
export const ProductCardComponent = createValueObject(
	ProductCardComponentSchema,
);

// Компонент карточки бота
export const BotProductCardComponentSchema = z.object({
	id: z.string(),
	type: z.literal("bot-product-card"),
	props: z.object({
		modelName: z.string(), // Название модели бота
		features: z.array(z.string()), // Список функций бота
		price: z.number(), // Стоимость
		currency: z.string().optional(), // Валюта
		integrations: z.array(z.string()), // Возможные интеграции
		actionText: z.string().optional(), // Текст для кнопки "подробнее"
		action: z.string().optional(), // Действие при нажатии кнопки
	}),
});

export type BotProductCardComponent = z.infer<typeof BotProductCardComponentSchema>;
export const BotProductCardComponent = createValueObject(
	BotProductCardComponentSchema,
);
