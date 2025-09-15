import { z } from "zod";
import { usePort } from "@maxdev1/sotajs";
import {
	findChatByIdPort,
	findPersonaByIdPort,
	saveChatPort,
} from "../../domain/chat.domain.ports";
import { createChatUseCase } from "./create-chat.use-case";
import { createPersonaUseCase } from "./create-persona.use-case";
import { sendMessageUseCase } from "./send-message.use-case";

// DTO для входящего сообщения, не зависящий от платформы
const ReceiveMessageInputSchema = z.object({
	chatId: z.string(),
	personaId: z.string(),
	personaName: z.string(),
	text: z.string(),
});

/**
 * Оркестрирующий Use Case.
 * Принимает сообщение, гарантирует наличие Персоны и Чата,
 * а затем передает управление в sendMessageUseCase.
 */
export const receiveIncomingMessageUseCase = async (input: unknown) => {
	const validInput = ReceiveMessageInputSchema.parse(input);

	const findPersona = usePort(findPersonaByIdPort);
	const findChat = usePort(findChatByIdPort);
	const saveChat = usePort(saveChatPort);

	// 1. Убедимся, что Персона существует, или создадим ее
	let persona = await findPersona(validInput.personaId);
	if (!persona) {
		console.log(
			`[Core]: Persona ${validInput.personaId} not found. Creating...`,
		);
		await createPersonaUseCase({
			id: validInput.personaId,
			name: validInput.personaName,
		});
	}

	// 2. Убедимся, что Чат существует, или создадим его
	let chat = await findChat(validInput.chatId);
	if (!chat) {
		console.log(`[Core]: Chat ${validInput.chatId} not found. Creating...`);
		await createChatUseCase({
			id: validInput.chatId,
			title: "Telegram Chat", // Можно будет передавать из адаптера
			participantIds: [validInput.personaId],
		});
		// Перезагружаем чат, чтобы иметь его в переменной
		chat = await findChat(validInput.chatId);
	} else {
		// 3. Если чат существует, убедимся, что отправитель является его участником
		if (chat && !chat.state.participantIds.includes(validInput.personaId)) {
			console.log(
				`[Core]: Adding persona ${validInput.personaId} to chat ${validInput.chatId}`,
			);
			chat.actions.addParticipant(validInput.personaId);
			await saveChat(chat); // Сохраняем тот же объект, так как он был мутирован
		}
	}

	// 4. Передаем управление основному use case для отправки сообщения
	return await sendMessageUseCase({
		chatId: validInput.chatId,
		senderId: validInput.personaId,
		content: validInput.text,
	});
};