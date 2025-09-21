import { createPort } from '@maxdev1/sotajs';
import { View } from './view.aggregate.ts';

// DTO для входных данных рендеринга
export interface RenderViewInput {
  view: any; // Представление для рендеринга
  context: Record<string, any>; // Контекстные данные для гидратации
}

// DTO для результата рендеринга
export interface HydratedView {
  id: string;
  name: string;
  layout: string;
  components: any[];
}

// Порт для рендеринга представлений
export const renderViewPort = createPort<(input: RenderViewInput) => Promise<HydratedView>>();

// Выходные порты для различных результатов рендеринга
export const viewRenderedOutPort = createPort<(result: HydratedView) => Promise<void>>();
export const viewRenderingFailedOutPort = createPort<(error: { message: string }) => Promise<void>>();