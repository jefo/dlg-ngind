import { createPort } from "@maxdev1/sotajs";
import type { FailureDto } from "../../shared/dtos";

// --- Выходные Порты (Output Ports) для под-домена Design ---

/**
 * Сообщает об успешном определении и сохранении новой личности бота.
 */
export const botPersonaDefinedOutPort = 
	createPort<(dto: { personaId: string; name: string }) => Promise<void>>();

/**
 * Сообщает об общей ошибке в процессе выполнения use case.
 */
export const operationFailedOutPort =
	createPort<(dto: FailureDto) => Promise<void>>();
