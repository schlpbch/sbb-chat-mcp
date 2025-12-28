'use client';

import { exportChatAsText, exportChatAsJSON } from '@/lib/exportUtils';
import type { Message } from '@/types/chat';

/**
 * Custom hook for handling chat export functionality
 * @param messages - Array of chat messages to export
 * @returns Object containing export handler function
 */
export function useChatExport(messages: Message[]) {
  const handleExportChat = () => {
    if (messages.length === 0) {
      alert('No messages to export');
      return;
    }

    const choice = confirm('Export as JSON? (Cancel for plain text)');
    if (choice) {
      exportChatAsJSON(messages);
    } else {
      exportChatAsText(messages);
    }
  };

  return { handleExportChat };
}
