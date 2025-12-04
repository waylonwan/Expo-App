export type Language = 'zh-HK' | 'zh-CN' | 'en';

export interface AppSettings {
  language: Language;
  notificationsEnabled: boolean;
  pushToken?: string;
}
