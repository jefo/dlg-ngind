import { usePort } from "@maxdev1/sotajs";
import { z } from "zod";
import {
	findActiveConversationByChatIdPort,
	saveConversationPort,
} from "../domain/conversaton.aggregate";
import {
	viewRenderOutPort,
	conversationFinishedOutPort,
	conversationNotFoundOutPort,
	invalidInputOutPort,
} from "./ports";

// --- Входной DTO и его схема ---

const ProcessUserInputSchema = z.object({
	chatId: z.string(),
	event: z.string(),
	payload: z.record(z.string(), z.any()).optional(),
});

type ProcessUserInput = z.infer<typeof ProcessUserInputSchema>;

/**
 * Use Case для обработки ввода пользователя и продвижения диалога.
 */
export async function processUserInputUseCase(
	input: ProcessUserInput,
): Promise<void> {
	// 1. Валидация входных данных
	const validationResult = ProcessUserInputSchema.safeParse(input);
	if (!validationResult.success) {
		// Этот порт из другого под-домена, но он общий для ошибок
		const { operationFailedOutPort } = await import(
			"../../desing/application/ports"
		);
		const operationFailed = usePort(operationFailedOutPort);
		await operationFailed({
			chatId: input.chatId ?? "N/A",
			reason: `Invalid input for ProcessUserInputUseCase: ${validationResult.error.message}`,
			timestamp: new Date(),
		});
		return;
	}

	const { chatId, event, payload } = validationResult.data;

	// 2. Получение зависимостей через порты
	const findConversation = usePort(findActiveConversationByChatIdPort);
	const saveConversation = usePort(saveConversationPort);
	const conversationNotFound = usePort(conversationNotFoundOutPort);
	const invalidInput = usePort(invalidInputOutPort);
	const viewRender = usePort(viewRenderOutPort);
	const conversationFinished = usePort(conversationFinishedOutPort);

	try {
		// 3. Загружаем активный диалог
		const conversation = await findConversation(chatId);
		if (!conversation) {
			await conversationNotFound({
				chatId,
				reason: `Active conversation for chatId '${chatId}' not found.`,
				timestamp: new Date(),
			});
			return;
		}

		// 4. Делегируем всю бизнес-логику агрегату
		conversation.actions.applyEvent({ event, payload });

		// 5. Получаем все необходимые данные из агрегата ДО сохранения
		const nextView = conversation.currentView;
		const isFinished = conversation.isFinished;

		// 6. Сохраняем измененное состояние (это аннулирует Proxy)
		await saveConversation(conversation.state);

		// 7. Отправляем пользователю новое представление, используя локальную переменную
		if (nextView) {
			await viewRender({
				chatId: chatId,
				viewNode: {
					id: nextView.id,
					components: nextView.components,
				},
			});
		}

		// 8. Если диалог завершился, уведомляем систему
		if (isFinished) {
			await conversationFinished({ chatId });
		}
	} catch (error: any) {
		// 8. Обрабатываем ошибку бизнес-логики (например, невалидный event)
		await invalidInput({
			chatId,
			reason: error.message,
			timestamp: new Date(),
		});
	}
}
