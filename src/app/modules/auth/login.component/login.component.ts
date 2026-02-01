import { Component } from '@angular/core';
import { I18nService } from '../../../core/services/i18n.service';

@Component({
  selector: 'app-login.component',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  activeTab: 'login' | 'register' = 'login';
  showForgotModal = false;

  loginEmail = '';
  loginPassword = '';
  loginRemember = false;

  registerName = '';
  registerEmail = '';
  registerPassword = '';
  registerConfirmPassword = '';

  forgotEmail = '';
  forgotSent = false;

  constructor(public i18n: I18nService) { }

  switchTab(tab: 'login' | 'register'): void {
    this.activeTab = tab;
  }

  onLogin(): void {
    console.log('Login:', this.loginEmail);
  }

  onRegister(): void {
    console.log('Register:', this.registerName, this.registerEmail);
  }

  onForgot(): void {
    this.forgotSent = true;
    setTimeout(() => {
      this.showForgotModal = false;
      this.forgotSent = false;
      this.forgotEmail = '';
    }, 2500);
  }

  loginWithGoogle(): void {
    console.log('Google login');
  }

}
