// Базовый интерфейс для всех UI компонентов
export interface Component {
  type: string;
  props: Record<string, any>;
}

// Конкретные реализации компонентов
export interface MessageComponent extends Component {
  type: 'message';
  props: {
    text: string;
    variant?: 'default' | 'info' | 'success' | 'warning' | 'error';
  };
}

export interface ButtonComponent extends Component {
  type: 'button';
  props: {
    text: string;
    action: string;
    payload?: Record<string, any>;
  };
}

export interface CardComponent extends Component {
  type: 'card';
  props: {
    title: string;
    description?: string;
    imageUrl?: string;
    actions?: ButtonComponent[];
  };
}

export interface CarouselComponent extends Component {
  type: 'carousel';
  props: {
    items: CardComponent[];
  };
}