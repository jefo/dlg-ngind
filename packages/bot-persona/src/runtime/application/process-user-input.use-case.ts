import { usePort } from "@maxdev1/sotajs";
import { z } from "zod";
import {
	findActiveConversationByChatIdPort,
	saveConversationPort,
} from "../domain/conversaton.aggregate";
import {
	componentRenderOutPort,
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
	const componentRender = usePort(componentRenderOutPort);
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

		// 5. Сохраняем измененное состояние
		await saveConversation(conversation.state);

		// 6. Отправляем пользователю новое представление
		const nextView = conversation.currentView;
		if (nextView) {
			// В новой системе компонентов мы отправляем весь массив компонентов
			for (const component of nextView.components) {
				await componentRender({
					chatId: conversation.state.chatId,
					componentName: component.id, // Используем id компонента как имя
					props: component, // Передаем весь компонент как props
				});
			}
		}

		// 7. Если диалог завершился, уведомляем систему
		if (conversation.isFinished) {
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
