import { describe, it, expect } from 'bun:test';
import { renderViewAdapter } from '../infrastructure/adapters/render-view.adapter.ts';

describe('Render View Adapter', () => {
  it('should hydrate a view with context data', async () => {
    const input = {
      view: {
        id: 'view1',
        name: 'test-view',
        layout: 'vertical',
        components: [
          {
            id: 'msg1',
            type: 'message',
            props: {
              text: 'Hello, {{name}}!',
              variant: 'info'
            }
          }
        ]
      },
      context: {
        name: 'Alice'
      }
    };

    const result = await renderViewAdapter(input);

    expect(result.id).toBe('view1');
    expect(result.name).toBe('test-view');
    expect(result.layout).toBe('vertical');
    expect(result.components).toHaveLength(1);
    expect(result.components[0].props.text).toBe('Hello, Alice!');
  });

  it('should handle missing context values', async () => {
    const input = {
      view: {
        id: 'view1',
        name: 'test-view',
        layout: 'vertical',
        components: [
          {
            id: 'msg1',
            type: 'message',
            props: {
              text: 'Hello, {{name}}!',
              variant: 'info'
            }
          }
        ]
      },
      context: {
        // name отсутствует
      }
    };

    const result = await renderViewAdapter(input);

    // Плейсхолдер должен остаться без изменений, если значение отсутствует в контексте
    expect(result.components[0].props.text).toBe('Hello, {{name}}!');
  });

  it('should handle nested objects in props', async () => {
    const input = {
      view: {
        id: 'view1',
        name: 'test-view',
        layout: 'vertical',
        components: [
          {
            id: 'card1',
            type: 'card',
            props: {
              title: 'Welcome, {{name}}!',
              description: 'Your score is {{score}}',
              details: {
                level: 'Level {{level}}',
                points: '{{points}} points'
              }
            }
          }
        ]
      },
      context: {
        name: 'Bob',
        score: 100,
        level: 5,
        points: 500
      }
    };

    const result = await renderViewAdapter(input);

    expect(result.components[0].props.title).toBe('Welcome, Bob!');
    expect(result.components[0].props.description).toBe('Your score is 100');
    expect(result.components[0].props.details.level).toBe('Level 5');
    expect(result.components[0].props.details.points).toBe('500 points');
  });
});