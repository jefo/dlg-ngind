// Пример использования представлений
import { View } from './src/domain/components/view.aggregate.ts';
import { MessageComponent, ButtonComponent, ProductCardComponent, BotProductCardComponent } from './src/domain/components/specific-components.value-objects.ts';
import { renderViewUseCase } from './src/application/use-cases/render-view.use-case.ts';
import { renderViewAdapter } from './src/infrastructure/adapters/render-view.adapter.ts';
import { telegramViewPresentationAdapter } from './src/presentation/telegram/telegram.presenter.adapter.ts';
import { setPortAdapter, resetDI } from '@maxdev1/sotajs';
import { 
  renderViewPort, 
  viewRenderedOutPort, 
  viewRenderingFailedOutPort 
} from './src/domain/ports.ts';
import {
  telegramViewPresentationPort,
  telegramViewPresentationErrorPort
} from './src/application/ports/presentation.ports.ts';

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
  
  // Регистрация презентационных адаптеров
  setPortAdapter(telegramViewPresentationPort, telegramViewPresentationAdapter);
  setPortAdapter(telegramViewPresentationErrorPort, async (error) => {
    console.log('❌ Ошибка презентации в Telegram:');
    console.log(error);
  });

  // Создание компонентов
  const message = MessageComponent.create({
    id: 'msg1',
    type: 'message',
    props: {
      text: 'Hello, {{name}}! Welcome to our store.',
      variant: 'info'
    }
  });

  // Создание карточки товара
  const productCard = ProductCardComponent.create({
    id: 'product1',
    type: 'product-card',
    props: {
      title: 'Ноутбук',
      description: 'Мощный игровой ноутбук с процессором Intel Core i7 и видеокартой RTX 3080',
      imageUrl: 'https://example.com/laptop.jpg',
      price: 99999,
      currency: 'RUB',
      actionText: 'Подробнее',
      action: 'view_product_details'
    }
  });

  // Создание карточки бота
  const botProductCard = BotProductCardComponent.create({
    id: 'bot1',
    type: 'bot-product-card',
    props: {
      modelName: 'Sales Assistant Pro',
      features: [
        'Автоматическая квалификация лида',
        'Интеграция с CRM',
        'Многоканальная поддержка'
      ],
      price: 29900,
      currency: 'RUB',
      integrations: [
        'Telegram',
        'WhatsApp',
        'Slack',
        'CRM Systems'
      ],
      actionText: 'Подробнее',
      action: 'view_bot_details'
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
    description: 'Welcome screen with greeting message and product cards',
    layout: 'vertical',
    components: [message.props, productCard.props, botProductCard.props, button.props, secondButton.props]
  });

  console.log('Создано представление:');
  console.log(JSON.stringify(view.state, null, 2));
  console.log('\n');

  // Рендеринг представления с контекстом для Telegram
  console.log('Рендеринг представления с контекстом { name: "Alice" } для Telegram...\n');
  
  await renderViewUseCase({
    view: view.state,
    context: { name: 'Alice' },
    platform: 'telegram'
  });
}

// Запуск демонстрации
demonstrateViewUsage().catch(console.error);