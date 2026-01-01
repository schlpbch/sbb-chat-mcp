import type { Meta, StoryObj } from '@storybook/react';
import { ToastProvider, useToast } from './Toast';

// Demo component that uses the toast
function ToastDemo({ variant, message }: { variant?: 'success' | 'error' | 'info'; message: string }) {
  const { showToast } = useToast();

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <button
        onClick={() => showToast(message, variant)}
        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
      >
        Show Toast
      </button>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Click the button to trigger a toast notification
      </p>
    </div>
  );
}

const meta: Meta = {
  title: 'UI/Toast',
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Toast notification system with success, error, and info variants. Auto-dismisses after 3 seconds.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ToastProvider>
        <Story />
      </ToastProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj;

export const Success: Story = {
  render: () => <ToastDemo variant="success" message="Operation completed successfully!" />,
};

export const Error: Story = {
  render: () => <ToastDemo variant="error" message="Something went wrong. Please try again." />,
};

export const Info: Story = {
  render: () => <ToastDemo variant="info" message="This is an informational message." />,
};

export const LongMessage: Story = {
  render: () => (
    <ToastDemo
      variant="info"
      message="This is a longer message to demonstrate how the toast handles multiple lines of text. It should wrap nicely."
    />
  ),
};

export const MultipleToasts: Story = {
  render: () => {
    const Demo = () => {
      const { showToast } = useToast();

      const handleMultiple = () => {
        showToast('First toast!', 'info');
        setTimeout(() => showToast('Second toast!', 'success'), 500);
        setTimeout(() => showToast('Third toast!', 'error'), 1000);
      };

      return (
        <div className="flex flex-col items-center justify-center p-8 space-y-4">
          <button
            onClick={handleMultiple}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Show Multiple Toasts
          </button>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Click to trigger multiple toasts in sequence
          </p>
        </div>
      );
    };

    return <Demo />;
  },
};
