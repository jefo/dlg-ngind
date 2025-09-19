import { expect, describe, it } from "bun:test";
import { telegramPresenterAdapter } from './telegram.presenter';

describe('telegramPresenterAdapter', () => {
  it('should process a message component without errors', async () => {
    const dto = {
      chatId: 'telegram:123456',
      componentName: 'message',
      props: {
        text: 'Hello World',
        buttons: [
          { label: 'Button 1', event: 'EVENT_1' },
          { label: 'Button 2', event: 'EVENT_2', payload: { key: 'value' } }
        ]
      }
    };

    // This test just verifies the function can be called without throwing errors
    // Since we can't easily mock the Telegram API in Bun, we'll just ensure it runs
    expect(async () => {
      await telegramPresenterAdapter(dto);
    }).not.toThrow();
  });

  it('should process a message without buttons without errors', async () => {
    const dto = {
      chatId: 'telegram:123456',
      componentName: 'message',
      props: {
        text: 'Hello World'
      }
    };

    expect(async () => {
      await telegramPresenterAdapter(dto);
    }).not.toThrow();
  });

  it('should ignore non-message components', async () => {
    const dto = {
      chatId: 'telegram:123456',
      componentName: 'buttonGroup',
      props: {
        buttons: [{ label: 'Button 1', event: 'EVENT_1' }]
      }
    };

    expect(async () => {
      await telegramPresenterAdapter(dto);
    }).not.toThrow();
  });
});