import { usePort } from "@maxdev1/sotajs";
import { z } from "zod";
import {
	findActiveConversationByChatIdPort,
	saveConversationPort,
} from "../domain/conversaton.aggregate";
import {
	conversationFinishedOutPort,
	conversationNotFoundOutPort,
	invalidInputOutPort,
} from "./ports";
import { renderMessagePort } from "../domain/ports";

// --- Входной DTO и его схема ---

const HandleEventInputSchema = z.object({
	chatId: z.string(),
	event: z.string(),
	payload: z.record(z.string(), z.any()).optional(),
});

type HandleEventInput = z.infer<typeof HandleEventInputSchema>;

/**
 * Use Case для обработки event (нажатия кнопки или команды) чата.
 * Не годится для NLU
 */
export async function handleEventUseCase(
	input: HandleEventInput,
): Promise<void> {
	const { chatId, event, payload } = input;

	// 2. Получение зависимостей через порты
	const findConversation = usePort(findActiveConversationByChatIdPort);
	const saveConversation = usePort(saveConversationPort);
	const conversationNotFound = usePort(conversationNotFoundOutPort);
	const invalidInput = usePort(invalidInputOutPort);
	const renderMessage = usePort(renderMessagePort);
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
		// 6. Сохраняем измененное состояние (это аннулирует Proxy)
		await saveConversation(conversation.state);

		// 7. Отправляем пользователю новое представление, используя локальную переменную
		if (conversation.currentView) {
			await renderMessage({
				view: conversation.currentView,
				data: conversation.formData,
			});
		}

		// 8. Если диалог завершился, уведомляем систему
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
