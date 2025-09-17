import { usePort } from "@maxdev1/sotajs";
import { z } from "zod";
import { randomUUID } from "crypto";
import { findBotPersonaByIdPort } from "../../desing/domain/bot-persona.aggregate";
import {
	Conversation,
	findActiveConversationByChatIdPort,
	saveConversationPort,
} from "../domain/conversaton.aggregate";
import { componentRenderOutPort } from "./ports";
import { operationFailedOutPort } from "../../desing/application/ports";

// --- Входной DTO и его схема ---

const StartConversationInputSchema = z.object({
	botPersonaId: z.string().uuid(),
	chatId: z.string(),
	initialContext: z.record(z.string(), z.any()).optional(),
});

type StartConversationInput = z.infer<typeof StartConversationInputSchema>;

/**
 * Use Case для запуска нового диалога с пользователем.
 */
export async function startConversationUseCase(
	input: StartConversationInput,
): Promise<void> {
	// 1. Валидация входных данных
	const validationResult = StartConversationInputSchema.safeParse(input);
	const operationFailed = usePort(operationFailedOutPort);

	if (!validationResult.success) {
		await operationFailed({
			chatId: input.chatId ?? "N/A",
			reason: `Invalid input for StartConversationUseCase: ${validationResult.error.message}`,
			timestamp: new Date(),
		});
		return;
	}

	const { botPersonaId, chatId, initialContext } = validationResult.data;

	// 2. Получение зависимостей через порты
	const findBotPersonaById = usePort(findBotPersonaByIdPort);
	const findActiveConversationByChatId = usePort(
		findActiveConversationByChatIdPort,
	);
	const saveConversation = usePort(saveConversationPort);
	const componentRender = usePort(componentRenderOutPort);

	try {
		// 3. Проверяем, нет ли уже активного диалога
		const existingConversation = await findActiveConversationByChatId(chatId);
		if (existingConversation) {
			throw new Error(
				`An active conversation already exists for chatId ${chatId}.`,
			);
		}

		// 4. Загружаем "личность" бота
		const persona = await findBotPersonaById(botPersonaId);
		if (!persona) {
			throw new Error(`BotPersona with id ${botPersonaId} not found.`);
		}

		// 5. Создаем новый агрегат Conversation
		const now = new Date();
		const conversation = Conversation.create({
			id: randomUUID(),
			botPersonaId,
			chatId,
			status: "active",
			currentStateId: persona.state.fsmDefinition.initialStateId,
			formState: initialContext ?? {},
			// Копируем "чертежи" в инстанс диалога
			fsmDefinition: persona.state.fsmDefinition,
			viewDefinition: persona.state.viewDefinition,
			formDefinition: persona.state.formDefinition,
			createdAt: now,
			updatedAt: now,
		});

		// 6. Сохраняем новый диалог
		await saveConversation(conversation.state);

		// 7. Отправляем пользователю первое сообщение
		const initialView = conversation.currentView;
		if (initialView) {
			await componentRender({
				chatId: conversation.state.chatId,
				componentName: initialView.component,
				props: initialView.props ?? {},
			});
		}
	} catch (error: any) {
		await operationFailed({
			chatId,
			reason: `Failed to start conversation: ${error.message}`,
			timestamp: new Date(),
		});
	}
}
