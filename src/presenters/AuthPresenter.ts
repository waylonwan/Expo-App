import { authService, notificationService } from '../services';
import { LoginRequest, RegisterRequest, Member } from '../models';

export interface AuthViewCallbacks {
  showLoading: () => void;
  hideLoading: () => void;
  showError: (message: string) => void;
  onLoginSuccess: (member: Member) => void;
  onRegisterSuccess: (member: Member) => void;
  onLogoutSuccess: () => void;
}

export class AuthPresenter {
  private callbacks: AuthViewCallbacks;

  constructor(callbacks: AuthViewCallbacks) {
    this.callbacks = callbacks;
  }

  validateEmail(email: string): { valid: boolean; error?: string } {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return { valid: false, error: 'auth.invalidEmail' };
    }
    return { valid: true };
  }

  validatePhone(phone: string): { valid: boolean; error?: string } {
    if (!phone || phone.trim().length === 0) {
      return { valid: false, error: 'auth.invalidPhone' };
    }
    return { valid: true };
  }

  validatePassword(password: string): { valid: boolean; error?: string } {
    if (!password || password.length < 6) {
      return { valid: false, error: 'auth.invalidPassword' };
    }
    return { valid: true };
  }

  validatePasswordMatch(password: string, confirmPassword: string): { valid: boolean; error?: string } {
    if (password !== confirmPassword) {
      return { valid: false, error: 'auth.passwordMismatch' };
    }
    return { valid: true };
  }

  async onLogin(phone: string, password: string): Promise<void> {
    const phoneValidation = this.validatePhone(phone);
    if (!phoneValidation.valid) {
      this.callbacks.showError(phoneValidation.error!);
      return;
    }

    const passwordValidation = this.validatePassword(password);
    if (!passwordValidation.valid) {
      this.callbacks.showError(passwordValidation.error!);
      return;
    }

    this.callbacks.showLoading();

    try {
      const response = await authService.login({ phone, password });

      if (response.success && response.data) {
        await notificationService.registerForPushNotifications();
        this.callbacks.onLoginSuccess(response.data.member);
      } else {
        this.callbacks.showError(response.error?.message || 'auth.loginFailed');
      }
    } catch (error) {
      this.callbacks.showError('errors.unknownError');
    } finally {
      this.callbacks.hideLoading();
    }
  }

  async onRegister(
    email: string,
    password: string,
    confirmPassword: string,
    name: string,
    phone?: string
  ): Promise<void> {
    const emailValidation = this.validateEmail(email);
    if (!emailValidation.valid) {
      this.callbacks.showError(emailValidation.error!);
      return;
    }

    const passwordValidation = this.validatePassword(password);
    if (!passwordValidation.valid) {
      this.callbacks.showError(passwordValidation.error!);
      return;
    }

    const matchValidation = this.validatePasswordMatch(password, confirmPassword);
    if (!matchValidation.valid) {
      this.callbacks.showError(matchValidation.error!);
      return;
    }

    if (!name || name.trim().length === 0) {
      this.callbacks.showError('Please enter your name');
      return;
    }

    this.callbacks.showLoading();

    try {
      const response = await authService.register({
        email,
        password,
        name: name.trim(),
        phone: phone?.trim(),
      });

      if (response.success && response.data) {
        await notificationService.registerForPushNotifications();
        this.callbacks.onRegisterSuccess(response.data.member);
      } else {
        this.callbacks.showError(response.error?.message || 'auth.registerFailed');
      }
    } catch (error) {
      this.callbacks.showError('errors.unknownError');
    } finally {
      this.callbacks.hideLoading();
    }
  }

  async onLogout(): Promise<void> {
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

export default AuthPresenter;
