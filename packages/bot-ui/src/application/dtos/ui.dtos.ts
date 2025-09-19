// DTO для UI слоя приложения

// Базовый интерфейс для всех UI компонентов
export interface UIComponent {
  id: string;
  type: string;
  props: Record<string, any>;
}

// DTO для результата рендеринга представления
export interface RenderedView {
  id: string;
  name: string;
  layout: 'vertical' | 'horizontal' | 'grid';
  components: UIComponent[];
}

// DTO для сообщения
export interface UIMessage extends UIComponent {
  type: 'message';
  props: {
    text: string;
    variant?: 'default' | 'info' | 'success' | 'warning' | 'error';
  };
}

// DTO для кнопки
export interface UIButton extends UIComponent {
  type: 'button';
  props: {
    text: string;
    action: string;
    payload?: Record<string, any>;
  };
}

// DTO для карточки
export interface UICard extends UIComponent {
  type: 'card';
  props: {
    title: string;
    description?: string;
    imageUrl?: string;
    actions?: UIButton[];
  };
}

// DTO для карточки товара
export interface UIProductCard extends UIComponent {
  type: 'product-card';
  props: {
    title: string;
    description?: string;
    imageUrl?: string;
    price?: number;
    currency?: string;
    actionText?: string;
    action?: string;
  };
}

// DTO для карточки бота
export interface UIBotProductCard extends UIComponent {
  type: 'bot-product-card';
  props: {
    modelName: string;
    features: string[];
    price: number;
    currency?: string;
    integrations: string[];
    actionText?: string;
    action?: string;
  };
}