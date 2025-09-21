import type { BotPersonaProps } from "../../../desing/domain";
import type { ConversationState } from "../../../runtime/domain";

// Эмуляция таблиц в базе данных как синглтонов
export const botPersonas = new Map<string, BotPersonaProps>();
export const conversations = new Map<string, ConversationState>();
