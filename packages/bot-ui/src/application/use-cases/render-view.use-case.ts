import { z } from "zod";
import { usePort } from "@maxdev1/sotajs";
import {
  renderViewPort,
  viewRenderedOutPort,
  viewRenderingFailedOutPort,
} from "../../domain/ports.ts";
import {
  telegramViewPresentationPort,
  telegramViewPresentationErrorPort,
  webViewPresentationPort,
  webViewPresentationErrorPort
} from "../ports/presentation.ports.ts";
import { RenderedView } from "../dto/ui.dto.ts";

// DTO для входных данных use case
const RenderViewUseCaseInputSchema = z.object({
  view: z.record(z.string(), z.unknown()),
  context: z.record(z.string(), z.unknown()),
  platform?: z.enum(["telegram", "web"]), // Платформа для презентации
});

type RenderViewUseCaseInput = z.infer<typeof RenderViewUseCaseInputSchema>;

/**
 * Use Case для рендеринга представлений
 *
 * Этот use case принимает представление и контекстные данные,
 * передает их в порт рендеринга и уведомляет о результате через выходные порты.
 * Также может передать результат в презентационный слой для конкретной платформы.
 */
export const renderViewUseCase = async (
  input: RenderViewUseCaseInput,
): Promise<void> => {
  const command = RenderViewUseCaseInputSchema.parse(input);

  // Получение зависимостей
  const renderView = usePort(renderViewPort);
  const viewRendered = usePort(viewRenderedOutPort);
  const viewRenderingFailed = usePort(viewRenderingFailedOutPort);

  try {
    // Рендеринг представления
    const result = await renderView({
      view: command.view,
      context: command.context as Record<string, any>,
    });

    // Преобразуем результат в формат RenderedView
    const renderedView: RenderedView = {
      id: result.id,
      name: result.name,
      layout: result.layout,
      components: result.components
    };

    // Уведомление об успешном рендеринге
    await viewRendered(result);

    // Если указана платформа, передаем результат в презентационный слой
    if (command.platform) {
      switch (command.platform) {
        case "telegram":
          const telegramPresenter = usePort(telegramViewPresentationPort);
          const telegramPresenterError = usePort(telegramViewPresentationErrorPort);
          try {
            await telegramPresenter(renderedView);
          } catch (error: any) {
            await telegramPresenterError({ message: error.message });
          }
          break;
          
        case "web":
          const webPresenter = usePort(webViewPresentationPort);
          const webPresenterError = usePort(webViewPresentationErrorPort);
          try {
            await webPresenter(renderedView);
          } catch (error: any) {
            await webPresenterError({ message: error.message });
          }
          break;
      }
    }
  } catch (error: any) {
    // Уведомление о неудаче
    await viewRenderingFailed({ message: error.message });
    
    // Если указана платформа, уведомляем презентационный слой об ошибке
    if (command.platform) {
      switch (command.platform) {
        case "telegram":
          const telegramPresenterError = usePort(telegramViewPresentationErrorPort);
          await telegramPresenterError({ message: error.message });
          break;
          
        case "web":
          const webPresenterError = usePort(webViewPresentationErrorPort);
          await webPresenterError({ message: error.message });
          break;
      }
    }
  }
};
