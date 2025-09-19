import { HydratedView, RenderViewInput } from '../../domain/ports.ts';

/**
 * Простой адаптер для рендеринга представлений
 * 
 * Этот адаптер выполняет базовую гидратацию компонентов,
 * заменяя плейсхолдеры в свойствах компонентов на значения из контекста.
 */
export const renderViewAdapter = async (input: RenderViewInput): Promise<HydratedView> => {
  const { view, context } = input;

  // Копируем представление для гидратации
  const hydratedView: HydratedView = {
    id: view.id as string,
    name: view.name as string,
    layout: view.layout as string,
    components: [],
  };

  // Гидратируем каждый компонент
  if (Array.isArray(view.components)) {
    hydratedView.components = view.components.map((component: any) => {
      // Создаем копию компонента
      const hydratedComponent = { ...component };

      // Гидратируем свойства компонента
      if (hydratedComponent.props && typeof hydratedComponent.props === 'object') {
        hydratedComponent.props = hydrateObject(hydratedComponent.props, context);
      }

      return hydratedComponent;
    });
  }

  return hydratedView;
};

/**
 * Рекурсивная функция для гидратации объекта
 * Заменяет плейсхолдеры вида {{key}} на значения из контекста
 */
const hydrateObject = (obj: Record<string, any>, context: Record<string, any>): Record<string, any> => {
  const hydratedObj: Record<string, any> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      // Заменяем плейсхолдеры в строках
      hydratedObj[key] = hydrateString(value, context);
    } else if (Array.isArray(value)) {
      // Рекурсивно обрабатываем массивы
      hydratedObj[key] = value.map((item) => {
        if (typeof item === 'string') {
          return hydrateString(item, context);
        } else if (typeof item === 'object' && item !== null) {
          return hydrateObject(item, context);
        }
        return item;
      });
    } else if (typeof value === 'object' && value !== null) {
      // Рекурсивно обрабатываем вложенные объекты
      hydratedObj[key] = hydrateObject(value, context);
    } else {
      // Оставляем значение как есть
      hydratedObj[key] = value;
    }
  }

  return hydratedObj;
};

/**
 * Функция для замены плейсхолдеров в строке на значения из контекста
 */
const hydrateString = (str: string, context: Record<string, any>): string => {
  // Ищем все плейсхолдеры вида {{key}} и заменяем их на значения из контекста
  return str.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return context[key] !== undefined ? String(context[key]) : match;
  });
};