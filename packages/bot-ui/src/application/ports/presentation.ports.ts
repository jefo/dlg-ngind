import { createPort } from '@maxdev1/sotajs';
import { RenderedView } from '../dto/ui.dto.ts';

// Порт для презентации рендеринга на Telegram
export const telegramViewPresentationPort = createPort<(renderedView: RenderedView) => Promise<void>>();

// Порт для уведомления об ошибке презентации в Telegram
export const telegramViewPresentationErrorPort = createPort<(error: { message: string }) => Promise<void>>();

// Порт для презентации рендеринга на Web
export const webViewPresentationPort = createPort<(renderedView: RenderedView) => Promise<void>>();

// Порт для уведомления об ошибке презентации в Web
export const webViewPresentationErrorPort = createPort<(error: { message: string }) => Promise<void>>();