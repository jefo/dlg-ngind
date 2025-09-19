import { describe, it, expect } from 'bun:test';
import { Component, MessageComponent, ButtonComponent, CardComponent } from '../src/domain/index.ts';

describe('UI Components', () => {
  it('should create a generic component', () => {
    const component = Component.create({
      id: 'comp1',
      type: 'custom',
      props: { text: 'Hello' }
    });

    expect(component.props.id).toBe('comp1');
    expect(component.props.type).toBe('custom');
    expect(component.props.props).toEqual({ text: 'Hello' });
  });

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
});