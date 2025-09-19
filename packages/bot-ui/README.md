# Контекст проекта: `bot-ui`

## 1. Общее описание

**`bot-ui`** — это ограниченный контекст (Bounded Context), отвечающий за **визуальное представление диалоговых интерфейсов** в чат-ботах. Он определяет, как будет выглядеть интерфейс бота и как пользователь будет с ним взаимодействовать.

Контекст представляет собой "UI-кит" или "движок рендеринга", который позволяет создавать богатые интерфейсы для диалоговых систем независимо от платформы (Telegram, Slack, Web и т.д.).

## 2. Бизнес-ценность

### Основные функции контекста:

1. **Библиотека компонентов интерфейса** — Единый источник правды о том, из каких элементов может состоять интерфейс бота:
   - Сообщения (Messages) с различными стилями
   - Кнопки действий (Buttons) 
   - Карточки с информацией (Cards)
   - Карточки товаров (Product Cards) с изображением, описанием и ценой
   - Карточки ботов (Bot Product Cards) с функциями, стоимостью и интеграциями
   - Галереи изображений (Carousels)
   - И другие UI-элементы

2. **Компоновка интерфейсов (Views)** — Возможность создавать сложные экраны, комбинируя компоненты в различные layout'ы:
   - Вертикальные и горизонтальные списки
   - Сетки элементов
   - Комбинированные представления

3. **Движок персонализации** — Механизм подстановки персональных данных пользователя в шаблоны интерфейса:
   - Персонализация приветствий
   - Динамическое отображение информации
   - Адаптация интерфейса под контекст диалога

4. **Платформо-независимый рендеринг** — Подготовка универсального описания интерфейса, которое затем может быть адаптировано под любую платформу.

5. **Слой презентации** — Преобразование универсального описания интерфейса в формат, понятный конкретной платформе (Telegram, Web и др.)

## 3. Взаимодействие с другими контекстами

### Входящие зависимости:
- **`bot-persona`** — Запрашивает рендеринг интерфейсов для отображения ответов бота пользователю

### Исходящие зависимости:
- **Презентеры платформ** — Получают универсальное описание интерфейса и адаптируют его под конкретные платформы (Telegram, Slack, Web)

## 4. Архитектурный подход

Контекст разработан в соответствии с принципами **Domain-Driven Design** и **Гексагональной архитектуры** с использованием фреймворка **SotaJS**:

### Уровни архитектуры:

1. **Домен (`src/domain`):**
   - **Компоненты (`components`):** Схемы и типы для всех UI-компонентов как объектов-значений
   - **Представления (`view.aggregate.ts`):** Агрегаты, определяющие компоновку компонентов и layout
   - **Порты (`ports.ts`):** Абстрактные контракты для движка шаблонизации и выходные порты

2. **Приложение (`src/application`):**
   - **Use Cases:** Основной use case — `renderViewUseCase`, который оркестрирует процесс рендеринга
   - **DTO (`dto/`):** Структуры данных для передачи между слоями
   - **Порты презентации (`ports/`):** Контракты для слоя презентации

3. **Инфраструктура (`src/infrastructure`):**
   - **Адаптеры (`adapters`):** Конкретная реализация порта рендеринга

4. **Презентация (`src/presentation`):**
   - **Адаптеры презентации:** Преобразование универсального описания в формат конкретной платформы

### Специализированные компоненты:

1. **MessageComponent** - текстовое сообщение с вариантами оформления
2. **ButtonComponent** - интерактивная кнопка с действием
3. **CardComponent** - карточка с заголовком, описанием и изображением
4. **ProductCardComponent** - карточка товара с изображением, описанием, ценой и кнопкой "подробнее"
5. **BotProductCardComponent** - карточка бота с названием модели, функциями, стоимостью, интеграциями и кнопкой "подробнее"

## 5. Преимущества подхода

### Для бизнеса:
- **Гибкость интерфейсов** — Возможность быстро создавать и модифицировать интерфейсы ботов
- **Консистентность** — Единый подход к построению интерфейсов во всех каналах
- **Персонализация** — Автоматическая адаптация интерфейсов под пользователей
- **Мультиплатформенность** — Поддержка различных платформ с единой кодовой базой

### Для разработки:
- **Тестируемость** — Все бизнес-правила изолированы и покрыты тестами
- **Расширяемость** — Простое добавление новых типов компонентов, layout'ов и платформ
- **Поддерживаемость** — Четкое разделение ответственности между слоями
- **Типобезопасность** — Строгая типизация на всех уровнях

## 6. Использование

Пример использования контекста:

```typescript
import { View } from '@dlg-ngind/bot-ui';
import { MessageComponent, ButtonComponent, ProductCardComponent, BotProductCardComponent } from '@dlg-ngind/bot-ui';
import { renderViewUseCase } from '@dlg-ngind/bot-ui/application';
import { renderViewAdapter } from '@dlg-ngind/bot-ui/infrastructure';
import { telegramViewPresentationAdapter } from '@dlg-ngind/bot-ui/presentation';
import { setPortAdapter, resetDI } from '@maxdev1/sotajs';
import { 
  renderViewPort, 
  viewRenderedOutPort, 
  viewRenderingFailedOutPort 
} from '@dlg-ngind/bot-ui/domain';
import {
  telegramViewPresentationPort,
  telegramViewPresentationErrorPort
} from '@dlg-ngind/bot-ui/application';

// Настройка DI контейнера
resetDI();
setPortAdapter(renderViewPort, renderViewAdapter);
setPortAdapter(viewRenderedOutPort, async (result) => {
  console.log('Представление успешно отрендерено');
});
setPortAdapter(viewRenderingFailedOutPort, async (error) => {
  console.log('Ошибка рендеринга:', error);
});

// Настройка презентационного слоя для Telegram
setPortAdapter(telegramViewPresentationPort, telegramViewPresentationAdapter);
setPortAdapter(telegramViewPresentationErrorPort, async (error) => {
  console.log('Ошибка презентации в Telegram:', error);
});

// Создание компонентов
const message = MessageComponent.create({
  id: 'msg1',
  type: 'message',
  props: {
    text: 'Hello, {{name}}!',
    variant: 'info'
  }
});

// Создание карточки товара
const productCard = ProductCardComponent.create({
  id: 'product1',
  type: 'product-card',
  props: {
    title: 'Ноутбук',
    description: 'Мощный игровой ноутбук',
    imageUrl: 'https://example.com/laptop.jpg',
    price: 99999,
    currency: 'RUB',
    actionText: 'Подробнее',
    action: 'view_product'
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
    text: 'Click me',
    action: 'click'
  }
});

// Создание представления
const view = View.create({
  id: 'view1',
  name: 'greeting',
  layout: 'vertical',
  components: [message, productCard, botProductCard, button]
});

// Рендеринг представления для Telegram
await renderViewUseCase({
  view: view.state,
  context: { name: 'John' },
  platform: 'telegram' // Указываем платформу для презентации
});
```