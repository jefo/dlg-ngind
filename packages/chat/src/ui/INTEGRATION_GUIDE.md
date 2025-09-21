# Интеграция `bot-ui` в диалоговые боты

## Обзор

Контекст `bot-ui` предоставляет мощные возможности для создания богатых интерфейсов в диалоговых ботах. Этот документ описывает, как интегрировать `bot-ui` в существующие и новые боты.

## Основные концепции

### Компоненты (Components)
Атомарные элементы интерфейса, которые можно использовать в представлениях:

```typescript
// Сообщение с персонализацией
const welcomeMessage = MessageComponent.create({
  id: 'welcome-msg',
  type: 'message',
  props: {
    text: 'Hello, {{userName}}! Welcome to our service.',
    variant: 'info'
  }
});

// Интерактивная кнопка
const actionButton = ButtonComponent.create({
  id: 'get-started-btn',
  type: 'button',
  props: {
    text: 'Get Started',
    action: 'start_onboarding'
  }
});
```

### Представления (Views)
Композитные структуры, определяющие компоновку интерфейса:

```typescript
// Представление приветствия
const welcomeView = View.create({
  id: 'welcome-view',
  name: 'welcome',
  layout: 'vertical',
  components: [welcomeMessage.props, actionButton.props]
});
```

## Интеграция с `bot-persona`

### Рендеринг в Use Cases

Когда бот переходит в новое состояние, он может запрашивать рендеринг представления:

```typescript
// presentation layer for telegram platform
await renderViewUseCase({
  view,
  context
});
```

## Примеры использования

### 1. Простое приветствие

```typescript
// Компоненты
const greeting = MessageComponent.create({
  id: 'greeting',
  type: 'message',
  props: {
    text: 'Hi {{name}}! How can I help you today?',
    variant: 'info'
  }
});

const helpButton = ButtonComponent.create({
  id: 'help-btn',
  type: 'button',
  props: {
    text: 'Show Help',
    action: 'show_help'
  }
});

const contactButton = ButtonComponent.create({
  id: 'contact-btn',
  type: 'button',
  props: {
    text: 'Contact Support',
    action: 'contact_support'
  }
});

// Представление
const greetingView = View.create({
  id: 'greeting-view',
  name: 'greeting',
  layout: 'vertical',
  components: [
    greeting.props,
    helpButton.props,
    contactButton.props
  ]
});
```

### 2. Карточка продукта

```typescript
// Компоненты
const productCard = CardComponent.create({
  id: 'product-card',
  type: 'card',
  props: {
    title: '{{productName}}',
    description: '{{productDescription}}',
    imageUrl: '{{productImage}}',
    actions: [
      {
        id: 'buy-btn',
        type: 'button',
        props: {
          text: 'Buy Now - ${{price}}',
          action: 'buy_product',
          payload: {
            productId: '{{productId}}'
          }
        }
      }
    ]
  }
});

// Представление
const productView = View.create({
  id: 'product-view',
  name: 'product',
  layout: 'vertical',
  components: [productCard.props]
});
```

## Практические рекомендации

### 1. Создание библиотеки компонентов
Создайте переиспользуемые компоненты для часто используемых элементов интерфейса:

```typescript
// Библиотека стандартных кнопок
export const StandardButtons = {
  back: () => ButtonComponent.create({
    id: 'back-btn',
    type: 'button',
    props: {
      text: '← Back',
      action: 'go_back'
    }
  }),
  
  cancel: () => ButtonComponent.create({
    id: 'cancel-btn',
    type: 'button',
    props: {
      text: 'Cancel',
      action: 'cancel'
    }
  })
};
```

### 2. Управление layout'ами
Используйте разные типы layout'ов для разных сценариев:

```typescript
// Вертикальный список для форм
const formView = View.create({
  id: 'form-view',
  name: 'form',
  layout: 'vertical',
  components: formFields
});

// Горизонтальный список для кнопок действий
const actionView = View.create({
  id: 'action-view',
  name: 'actions',
  layout: 'horizontal',
  components: actionButtons
});
```

### 3. Персонализация
Используйте плейсхолдеры для персонализации интерфейса:

```typescript
// Шаблон с плейсхолдерами
const personalizedMessage = MessageComponent.create({
  id: 'personalized-msg',
  type: 'message',
  props: {
    text: 'Welcome back, {{userName}}! You have {{unreadCount}} unread messages.',
    variant: 'success'
  }
});

// При рендеринге контекст заменит плейсхолдеры
await renderViewUseCase({
  view: view.state,
  context: {
    userName: 'John',
    unreadCount: 5
  }
});
```

## Тестирование

### Тестирование компонентов
```typescript
it('should create a message component', () => {
  const message = MessageComponent.create({
    id: 'test-msg',
    type: 'message',
    props: {
      text: 'Hello, world!',
      variant: 'info'
    }
  });

  expect(message.props.id).toBe('test-msg');
  expect(message.props.props.text).toBe('Hello, world!');
});
```

### Тестирование представлений
```typescript
it('should add components to a view', () => {
  const view = View.create({
    id: 'test-view',
    name: 'test',
    layout: 'vertical',
    components: []
  });

  const message = MessageComponent.create({
    id: 'msg1',
    type: 'message',
    props: { text: 'Hello' }
  });

  view.actions.addComponent(message.props);

  expect(view.componentCount).toBe(1);
});
```

## Мониторинг и аналитика

Используйте события рендеринга для сбора аналитики:

```typescript
// Регистрация адаптера для аналитики
setPortAdapter(viewRenderedOutPort, async (result) => {
  // Отправка события в аналитику
  analytics.track('view_rendered', {
    viewId: result.id,
    viewName: result.name,
    componentCount: result.components.length
  });
});
```

Этот подход позволяет отслеживать, какие представления и компоненты используются чаще всего, что помогает в оптимизации интерфейса.