import type { Language } from '@/lib/i18n';

export interface QuickAction {
  icon: string;
  label: string;
  description: string;
  query: string;
  color: string;
  category: string;
}

export interface WelcomeSectionProps {
  language: Language;
  onSendMessage: (query: string) => void;
}
