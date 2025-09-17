import { createPort } from "@maxdev1/sotajs";
import type { FailureDto } from "../../shared/dtos";
import type { ComponentRenderDto } from "../dtos";

// --- Выходные Порты (Output Ports) для под-домена Runtime ---

/**
 * Сообщает о необходимости отрендерить компонент для пользователя.
 */
export const componentRenderOutPort =
	createPort<(dto: ComponentRenderDto) => Promise<void>>();

/**
 * Сообщает о завершении диалога.
 */
export const conversationFinishedOutPort =
	createPort<(dto: { chatId: string }) => Promise<void>>();

/**
 * Сообщает о том, что пользователь ввел невалидные данные или событие.
 */
export const invalidInputOutPort =
	createPort<(dto: FailureDto) => Promise<void>>();

/**
 * Сообщает о том, что активный диалог для данного чата не найден.
 */
export const conversationNotFoundOutPort =
	createPort<(dto: FailureDto) => Promise<void>>();
