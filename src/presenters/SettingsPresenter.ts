import { notificationService, authService } from '../services';
import { changeLanguage, SupportedLanguage } from '../localization';

export interface SettingsViewCallbacks {
  showLoading: () => void;
  hideLoading: () => void;
  showError: (message: string) => void;
  onLanguageChanged: (language: SupportedLanguage) => void;
  onNotificationToggled: (enabled: boolean) => void;
  onLogoutSuccess: () => void;
  showLogoutConfirmation: () => void;
}

export class SettingsPresenter {
  private callbacks: SettingsViewCallbacks;

  constructor(callbacks: SettingsViewCallbacks) {
    this.callbacks = callbacks;
  }

  async onChangeLanguage(language: SupportedLanguage): Promise<void> {
    this.callbacks.showLoading();

    try {
      await changeLanguage(language);
      this.callbacks.onLanguageChanged(language);
    } catch (error) {
      this.callbacks.showError('errors.unknownError');
    } finally {
      this.callbacks.hideLoading();
    }
  }

  async onToggleNotifications(enable: boolean): Promise<void> {
    if (enable) {
      const hasPermission = await notificationService.requestPermissions();
      
      if (hasPermission) {
        await notificationService.registerForPushNotifications();
        this.callbacks.onNotificationToggled(true);
      } else {
        this.callbacks.showError('settings.notificationsDisabled');
        this.callbacks.onNotificationToggled(false);
      }
    } else {
      this.callbacks.onNotificationToggled(false);
    }
  }

  onLogoutTapped(): void {
    this.callbacks.showLogoutConfirmation();
  }

  async confirmLogout(): Promise<void> {
    this.callbacks.showLoading();

    try {
      await authService.logout();
      this.callbacks.onLogoutSuccess();
    } catch (error) {
      this.callbacks.showError('errors.unknownError');
    } finally {
      this.callbacks.hideLoading();
    }
  }
}

export default SettingsPresenter;
