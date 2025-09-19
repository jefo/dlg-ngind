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
import { createFormFromDefinition } from "../../desing/domain";

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

	const findBotPersonaById = usePort(findBotPersonaByIdPort);
	const findActiveConversationByChatId = usePort(
		findActiveConversationByChatIdPort,
	);
	const saveConversation = usePort(saveConversationPort);
	const componentRender = usePort(componentRenderOutPort);

	try {
		const existingConversation = await findActiveConversationByChatId(chatId);
		if (existingConversation) {
			throw new Error(
				`An active conversation already exists for chatId ${chatId}.`,
			);
		}

		const persona = await findBotPersonaById(botPersonaId);
		if (!persona) {
			throw new Error(`BotPersona with id ${botPersonaId} not found.`);
		}

		const now = new Date();

		// 1. Создаем инстанс FormEntity
		const form = createFormFromDefinition(
			persona.state.formDefinition,
			randomUUID(),
		);

		// 2. Создаем агрегат Conversation, передавая в него состояние формы
		const conversation = Conversation.create({
			id: randomUUID(),
			botPersonaId,
			chatId,
			status: "active",
			currentStateId: persona.state.fsmDefinition.initialStateId,
			form: form.state, // Передаем состояние FormEntity
			fsmDefinition: persona.state.fsmDefinition,
			viewDefinition: persona.state.viewDefinition,
			createdAt: now,
			updatedAt: now,
		});

		await saveConversation(conversation.state);

		const initialView = conversation.currentView;
		if (initialView) {
			// В новой системе компонентов мы отправляем весь массив компонентов
			for (const component of initialView.components) {
				await componentRender({
					chatId: conversation.state.chatId,
					componentName: component.id, // Используем id компонента как имя
					props: component, // Передаем весь компонент как props
				});
			}
		}
	} catch (error: any) {
		await operationFailed({
			chatId,
			reason: `Failed to start conversation: ${error.message}`,
			timestamp: new Date(),
		});
	}
}
