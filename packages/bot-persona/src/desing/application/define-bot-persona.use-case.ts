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
