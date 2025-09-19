// DTO для UI слоя приложения

// Базовый интерфейс для всех UI компонентов
export interface UIComponent {
  id: string;
  type: string;
  props: Record<string, any>;
}

// DTO для результата рендеринга
export interface RenderedView {
  id: string;
  name: string;
  layout: string;
  components: UIComponent[];
}

// Специализированные DTO для компонентов

export interface MessageComponentDTO extends UIComponent {
  type: 'message';
  props: {
    text: string;
    variant?: 'default' | 'info' | 'success' | 'warning' | 'error';
  };
}

export interface ButtonComponentDTO extends UIComponent {
  type: 'button';
  props: {
    text: string;
    action: string;
    payload?: Record<string, any>;
  };
}

export interface CardComponentDTO extends UIComponent {
  type: 'card';
  props: {
    title: string;
    description?: string;
    imageUrl?: string;
    actions?: ButtonComponentDTO[];
  };
}

export interface ProductCardComponentDTO extends UIComponent {
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

export interface BotProductCardComponentDTO extends UIComponent {
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