import { createPort } from "@maxdev1/sotajs";
import type { FailureDto } from "../../shared/dtos";
import type { ComponentRenderDto } from "../dtos";
// import type { ViewRenderDto } from "../dtos";

// --- Выходные Порты (Output Ports) для под-домена Runtime ---

/**
 * Сообщает о необходимости отрендерить компонент для пользователя.
 * @deprecated Используйте viewRenderOutPort вместо этого.
 */
export const componentRenderOutPort =
	createPort<(dto: ComponentRenderDto) => Promise<void>>();

/**
 * Сообщает о необходимости отрендерить всё представление (все компоненты для состояния FSM).
 */
// export const viewRenderOutPort =
// 	createPort<(dto: ViewRenderDto) => Promise<void>>();

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

/**
 * DTO для запуска nurturing-цепочки.
 */
export type StartNurturingSequenceDto = {
	chatId: string;
	contactInfo?: {
		email?: string;
		name?: string;
	};
};

/**
 * Сообщает о необходимости запустить nurturing-цепочку для лида.
 */
export const startNurturingSequenceOutPort =
	createPort<(dto: StartNurturingSequenceDto) => Promise<void>>();
