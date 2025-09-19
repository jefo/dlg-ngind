import { describe, it, expect } from 'bun:test';
import { MessageComponent, ButtonComponent, CardComponent, ProductCardComponent, BotProductCardComponent } from '../src/domain/index.ts';

describe('UI Components', () => {
  it('should create a message component', () => {
    const message = MessageComponent.create({
      id: 'msg1',
      type: 'message',
      props: {
        text: 'Hello, world!',
        variant: 'info'
      }
    });

    expect(message.props.id).toBe('msg1');
    expect(message.props.type).toBe('message');
    expect(message.props.props.text).toBe('Hello, world!');
    expect(message.props.props.variant).toBe('info');
  });

  it('should create a button component', () => {
    const button = ButtonComponent.create({
      id: 'btn1',
      type: 'button',
      props: {
        text: 'Click me',
        action: 'click'
      }
    });

    expect(button.props.id).toBe('btn1');
    expect(button.props.type).toBe('button');
    expect(button.props.props.text).toBe('Click me');
    expect(button.props.props.action).toBe('click');
  });

  it('should create a card component', () => {
    const card = CardComponent.create({
      id: 'card1',
      type: 'card',
      props: {
        title: 'Welcome',
        description: 'This is a sample card',
        imageUrl: 'https://example.com/image.jpg'
      }
    });

    expect(card.props.id).toBe('card1');
    expect(card.props.type).toBe('card');
    expect(card.props.props.title).toBe('Welcome');
    expect(card.props.props.description).toBe('This is a sample card');
    expect(card.props.props.imageUrl).toBe('https://example.com/image.jpg');
  });

  it('should create a product card component', () => {
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

    expect(productCard.props.id).toBe('product1');
    expect(productCard.props.type).toBe('product-card');
    expect(productCard.props.props.title).toBe('Ноутбук');
    expect(productCard.props.props.description).toBe('Мощный игровой ноутбук');
    expect(productCard.props.props.imageUrl).toBe('https://example.com/laptop.jpg');
    expect(productCard.props.props.price).toBe(99999);
    expect(productCard.props.props.currency).toBe('RUB');
    expect(productCard.props.props.actionText).toBe('Подробнее');
    expect(productCard.props.props.action).toBe('view_product');
  });

  it('should create a bot product card component', () => {
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

    expect(botProductCard.props.id).toBe('bot1');
    expect(botProductCard.props.type).toBe('bot-product-card');
    expect(botProductCard.props.props.modelName).toBe('Sales Assistant Pro');
    expect(botProductCard.props.props.features).toEqual([
      'Автоматическая квалификация лида',
      'Интеграция с CRM',
      'Многоканальная поддержка'
    ]);
    expect(botProductCard.props.props.price).toBe(29900);
    expect(botProductCard.props.props.currency).toBe('RUB');
    expect(botProductCard.props.props.integrations).toEqual([
      'Telegram',
      'WhatsApp',
      'Slack',
      'CRM Systems'
    ]);
    expect(botProductCard.props.props.actionText).toBe('Подробнее');
    expect(botProductCard.props.props.action).toBe('view_bot_details');
  });
});