import { usePort } from "@maxdev1/sotajs";
import { randomUUID } from "crypto";
import { z } from "zod";

import {
	BotPersona,
	saveBotPersonaPort,
} from "../domain/bot-persona.aggregate";
import {
	FsmDefinitionSchema,
	ViewDefinitionSchema,
	FormDefinitionSchema,
} from "../domain";
import { botPersonaDefinedOutPort, operationFailedOutPort } from "./ports";

// --- Входной DTO и его схема ---

const DefineBotPersonaInputSchema = z.object({
	name: z.string(),
	fsmDefinition: FsmDefinitionSchema,
	viewDefinition: ViewDefinitionSchema,
	formDefinition: FormDefinitionSchema,
});

type DefineBotPersonaInput = z.infer<typeof DefineBotPersonaInputSchema>;

/**
 * Use Case для определения нового шаблона бота (BotPersona).
 * Принимает полное определение, создает агрегат, который проверяет
 * все инварианты, и сохраняет его в случае успеха.
 * 
 * После миграции на новый UI модуль, ViewDefinition теперь поддерживает:
 * - MessageComponent: текстовые сообщения с вариантами оформления
 * - ButtonComponent: интерактивные кнопки с действиями
 * - CardComponent: карточки с заголовком, описанием и изображением
 * - ProductCardComponent: карточки товаров с ценой и кнопкой "подробнее"
 * - BotProductCardComponent: карточки ботов с функциями, стоимостью и интеграциями
 * 
 * Пример использования с новыми компонентами:
 * 
 * const botPersona = await defineBotPersonaUseCase({
 *   name: "Витрина ботов",
 *   fsmDefinition: {
 *     initialStateId: "welcome",
 *     states: [
 *       { id: "welcome", type: "normal" },
 *       { id: "bots-list", type: "normal" }
 *     ],
 *     transitions: [
 *       { event: "view_bots", from: "welcome", to: "bots-list" }
 *     ]
 *   },
 *   viewDefinition: {
 *     nodes: [
 *       {
 *         id: "welcome",
 *         components: [
 *           {
 *             id: "welcome-msg",
 *             type: "message",
 *             props: {
 *               text: "Добро пожаловать! Выберите интересующий вас бот.",
 *               variant: "info"
 *             }
 *           },
 *           {
 *             id: "view-bots-btn",
 *             type: "button",
 *             props: {
 *               text: "Просмотреть ботов",
 *               action: "view_bots"
 *             }
 *           }
 *         ]
 *       },
 *       {
 *         id: "bots-list",
 *         components: [
 *           {
 *             id: "sales-assistant-card",
 *             type: "bot-product-card",
 *             props: {
 *               modelName: "Sales Assistant Pro",
 *               features: [
 *                 "Автоматическая квалификация лида",
 *                 "Интеграция с CRM"
 *               ],
 *               price: 29900,
 *               currency: "RUB",
 *               integrations: ["Telegram", "WhatsApp"],
 *               actionText: "Подробнее",
 *               action: "view_bot_details"
 *             }
 *           }
 *         ]
 *       }
 *     ]
 *   },
 *   formDefinition: {
 *     fields: []
 *   }
 * });
 */
export async function defineBotPersonaUseCase(
	input: DefineBotPersonaInput,
): Promise<void> {
	// 1. Валидация входных данных
	const validationResult = DefineBotPersonaInputSchema.safeParse(input);
	const operationFailed = usePort(operationFailedOutPort);

	if (!validationResult.success) {
		await operationFailed({
			// В данном use case у нас нет chatId
			chatId: "N/A",
			reason: `Invalid input for DefineBotPersonaUseCase: ${validationResult.error.message}`,
			timestamp: new Date(),
		});
		return;
	}

	const { name, fsmDefinition, viewDefinition, formDefinition } =
		validationResult.data;

	// 2. Получение зависимостей через порты
	const saveBotPersona = usePort(saveBotPersonaPort);
	const botPersonaDefined = usePort(botPersonaDefinedOutPort);

	try {
		// 3. Создание агрегата (здесь происходит вся доменная валидация и проверка инвариантов)
		const botPersona = BotPersona.create({
			id: randomUUID(),
			name,
			fsmDefinition,
			viewDefinition,
			formDefinition,
		});

		// 4. Сохранение состояния агрегата
		await saveBotPersona(botPersona.state);

		// 5. Уведомление об успехе через выходной порт
		await botPersonaDefined({
			personaId: botPersona.id,
			name: botPersona.state.name,
		});
	} catch (error: any) {
		// 6. Уведомление об ошибке (например, нарушение инварианта) через выходной порт
		await operationFailed({
			chatId: "N/A",
			reason: `Failed to define bot persona: ${error.message}`,
			timestamp: new Date(),
		});
	}
}
