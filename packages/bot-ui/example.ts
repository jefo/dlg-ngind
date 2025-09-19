// Пример использования представлений
import { View } from './src/domain/components/view.aggregate.ts';
import { MessageComponent, ButtonComponent } from './src/domain/components/specific-components.value-objects.ts';
import { renderViewUseCase } from './src/application/use-cases/render-view.use-case.ts';
import { renderViewAdapter } from './src/infrastructure/adapters/render-view.adapter.ts';
import { setPortAdapter, resetDI } from '@maxdev1/sotajs';
import { renderViewPort, viewRenderedOutPort, viewRenderingFailedOutPort } from './src/domain/ports.ts';

// Функция для демонстрации использования
async function demonstrateViewUsage() {
  console.log('=== Демонстрация использования представлений ===\n');

  // Сброс DI контейнера
  resetDI();

  // Регистрация адаптеров
  setPortAdapter(renderViewPort, renderViewAdapter);
  setPortAdapter(viewRenderedOutPort, async (result) => {
    console.log('✅ Представление успешно отрендерено:');
    console.log(JSON.stringify(result, null, 2));
  });
  setPortAdapter(viewRenderingFailedOutPort, async (error) => {
    console.log('❌ Ошибка рендеринга:');
    console.log(error);
  });

  // Создание компонентов
  const message = MessageComponent.create({
    id: 'msg1',
    type: 'message',
    props: {
      text: 'Hello, {{name}}! Welcome to our service.',
      variant: 'info'
    }
  });

  const button = ButtonComponent.create({
    id: 'btn1',
    type: 'button',
    props: {
      text: 'Get Started',
      action: 'start'
    }
  });

  const secondButton = ButtonComponent.create({
    id: 'btn2',
    type: 'button',
    props: {
      text: 'Learn More',
      action: 'learn_more',
      payload: {
        url: 'https://example.com'
      }
    }
  });

  // Создание представления
  const view = View.create({
    id: 'view1',
    name: 'welcome',
    description: 'Welcome screen with greeting message and action buttons',
    layout: 'vertical',
    components: [message.props, button.props, secondButton.props]
  });

  console.log('Создано представление:');
  console.log(JSON.stringify(view.state, null, 2));
  console.log('\n');

  // Рендеринг представления с контекстом
  console.log('Рендеринг представления с контекстом { name: "Alice" }...\n');
  
  await renderViewUseCase({
    view: view.state,
    context: { name: 'Alice' }
  });
}

// Запуск демонстрации
demonstrateViewUsage().catch(console.error);