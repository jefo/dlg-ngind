import { describe, it, expect } from 'bun:test';
import { View } from '../domain/components/view.entity.ts';
import { MessageComponent } from '../domain/components/specific-components.value-objects.ts';

describe('View Aggregate', () => {
  it('should create a view', () => {
    const view = View.create({
      id: 'view1',
      name: 'test-view',
      description: 'A test view',
      layout: 'vertical',
      components: []
    });

    expect(view.state.id).toBe('view1');
    expect(view.state.name).toBe('test-view');
    expect(view.state.description).toBe('A test view');
    expect(view.state.layout).toBe('vertical');
    expect(view.componentCount).toBe(0);
  });

  it('should add components to a view', () => {
    const view = View.create({
      id: 'view1',
      name: 'test-view',
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
    expect(view.state.components).toHaveLength(1);
  });

  it('should remove components from a view', () => {
    const message = MessageComponent.create({
      id: 'msg1',
      type: 'message',
      props: { text: 'Hello' }
    });

    const view = View.create({
      id: 'view1',
      name: 'test-view',
      layout: 'vertical',
      components: [message.props]
    });

    expect(view.componentCount).toBe(1);

    view.actions.removeComponent('msg1');

    expect(view.componentCount).toBe(0);
    expect(view.state.components).toHaveLength(0);
  });

  it('should update layout', () => {
    const view = View.create({
      id: 'view1',
      name: 'test-view',
      layout: 'vertical',
      components: []
    });

    expect(view.state.layout).toBe('vertical');

    view.actions.updateLayout('horizontal');

    expect(view.state.layout).toBe('horizontal');
  });
});