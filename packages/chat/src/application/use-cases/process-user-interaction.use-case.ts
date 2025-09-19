import { z } from "zod";
import { usePort } from "@maxdev1/sotajs";
import { interactionProcessedOutPort } from "../chat.application.ports";

// Схема для входных данных
const ProcessInteractionInputSchema = z.object({
	chatId: z.string(),
	personaId: z.string(),
	event: z.string(),
	payload: z.record(z.string(), z.any()).optional(),
});

type ProcessInteractionInput = z.infer<typeof ProcessInteractionInputSchema>;

/**
 * Use Case для обработки интерактивных событий (нажатий на кнопки).
 * Его задача - принять событие от адаптера и уведомить систему через выходной порт.
 */
export const processUserInteractionUseCase = async (
	input: ProcessInteractionInput,
): Promise<void> => {
	const validInput = ProcessInteractionInputSchema.parse(input);

	const interactionProcessed = usePort(interactionProcessedOutPort);

	// Просто передаем данные дальше в выходной порт, на который подпишется оркестратор
	await interactionProcessed(validInput);
};
