// login.component.ts

import { Component, ElementRef, OnInit, QueryList, ViewChildren, OnDestroy, AfterViewInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { I18nService } from '../../../core/services/i18n.service';
import { AuthService } from '../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { interval, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';

declare const google: any;

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
  @ViewChildren('otpInputs') otpInputs!: QueryList<ElementRef>;

  currentStep: number = 1;
  loader: boolean = false;
  userEmail: string = '';
  resetToken: string = '';

  // OTP
  otpValues: string[] = ['', '', '', '', '', ''];
  resendTimer: number = 60;
  timerSubscription?: Subscription;

  // Password
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  passwordStrength: string = '';
  passwordStrengthText: string = '';

  // Forms
  passwordForm: FormGroup;
  activeTab: 'login' | 'register' = 'login';
  showForgotModal = false;
  showRegPassword = false;

  // Forgot Password
  forgotStep: number = 1;
  forgotEmail = '';
  newPassword: string = '';
  confirmNewPassword: string = '';
  showNewPassword: boolean = false;
  showConfirmNewPassword: boolean = false;

  // Google
  showCompleteProfileModal = false;
  googleEmail = '';
  googleToken = '';

  // Register
  registerRole: 'Customer' | 'Vendor' | 'DeliveryAgent' = 'Customer';
  registerPhone = '';
  vendorBusinessName = '';
  vendorCommercialReg = '';
  vendorTaxNumber = '';
  vendorBusinessAddress = '';
  registerName = '';
  registerEmail = '';
  registerPassword = '';
  registerConfirmPassword = '';

  // Login
  loginEmail = '';
  loginPassword = '';
  loginRemember = false;

  // Complete Profile
  profileFullName = '';
  profilePhoneNumber = '';
  profileAge = '';

  emailForm: FormGroup;
  otpForm: FormGroup;

  // Loading
  isLoading = false;

  constructor(
    public i18n: I18nService,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });

    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.passwordForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/']);
      return;
    }
  }

  ngOnDestroy(): void {
    this.cleanupTimer();
  }

  // ═══════════════════════════════════════════════
  // FORGOT PASSWORD FUNCTIONS
  // ═══════════════════════════════════════════════
  goBack(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
      if (this.timerSubscription) {
        this.timerSubscription.unsubscribe();
      }
    }
  }
  closeForgotModal(): void {
    this.showForgotModal = false;
    setTimeout(() => {
      this.resetForgotPasswordState();
    }, 300);
  }

  resetForgotPasswordState(): void {
    this.forgotStep = 1;
    this.forgotEmail = '';
    this.otpValues = ['', '', '', '', '', ''];
    this.newPassword = '';
    this.confirmNewPassword = '';
    this.resetToken = '';
    this.passwordStrength = '';
    this.passwordStrengthText = '';
    this.showNewPassword = false;
    this.showConfirmNewPassword = false;
    this.resendTimer = 0;
    this.cleanupTimer();
  }

  cleanupTimer(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
      this.timerSubscription = undefined;
    }
  }

  focusFirstOtpInput(): void {
    const inputs = this.otpInputs?.toArray();
    if (inputs && inputs.length > 0 && inputs[0] && inputs[0].nativeElement) {
      inputs[0].nativeElement.focus();
    }
  }

  addShakeAnimation(): void {
    const otpContainer = document.querySelector('.otp-container');
    if (otpContainer) {
      otpContainer.classList.add('shake');
      setTimeout(() => {
        otpContainer.classList.remove('shake');
      }, 500);
    }

    setTimeout(() => {
      this.otpValues = ['', '', '', '', '', ''];
      const inputs = this.otpInputs?.toArray();
      if (inputs) {
        inputs.forEach(input => {
          if (input && input.nativeElement) {
            input.nativeElement.value = '';
          }
        });

        if (inputs[0] && inputs[0].nativeElement) {
          inputs[0].nativeElement.focus();
        }
      }
    }, 500);
  }

  //==================================================================================================================================
  //==================================================================================================================================

  // Password Match Validator
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const newPassword = control.get('newPassword');
    const confirmPassword = control.get('confirmPassword');

    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  // Step 1: Send Reset Code
  sendResetCode(): void {
    if (!this.forgotEmail) {
      this.toastr.error('أدخل البريد الإلكتروني');
      return;
    }

    this.isLoading = true;

    this.authService.ForgotPassword(this.forgotEmail.trim().toLowerCase()).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res.success === false) {
          this.toastr.error(res.message);
          return;
        }
        this.toastr.success('تم إرسال الكود');
        this.forgotStep = 2;  // ← هنا المشكلة كانت - لازم تغير forgotStep مش currentStep
        this.startResendTimer();
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.toastr.error('حدث خطأ');
      }
    });
  }

  // Timer for resend
  startResendTimer(): void {
    this.resendTimer = 60;
    this.cleanupTimer();

    this.ngZone.runOutsideAngular(() => {
      this.timerSubscription = interval(1000)
        .pipe(take(60))
        .subscribe(() => {
          this.ngZone.run(() => {
            this.resendTimer--;
            this.cdr.detectChanges();
          });
        });
    });
  }

  // Resend Code
  resendCode(): void {
    this.sendResetCode();
  }

  // OTP Input Handling
  onOtpInput(event: Event, index: number): void {
    event.preventDefault();
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/\D/g, '');

    // خد أول رقم بس
    const digit = value.charAt(0);

    // حدث القيمة
    this.otpValues[index] = digit;
    input.value = digit;

    // انتقل للخانة التالية بعد delay
    if (digit && index < 5) {
      setTimeout(() => {
        const inputs = this.otpInputs.toArray();
        const nextInput = inputs[index + 1]?.nativeElement;
        if (nextInput) {
          nextInput.value = ''; // امسح أي قيمة موجودة
          nextInput.focus();
        }
      }, 0);
    }

    this.otpForm.patchValue({ otp: this.otpValues.join('') });
  }

  onOtpKeydown(event: KeyboardEvent, index: number): void {
    const inputs = this.otpInputs.toArray();

    if (event.key === 'Backspace') {
      event.preventDefault();

      if (this.otpValues[index]) {
        // لو فيه قيمة، امسحها وخليه في نفس الخانة
        this.otpValues[index] = '';
        inputs[index].nativeElement.value = '';
      } else if (index > 0) {
        // لو فاضية، روح للي قبلها وامسحها
        this.otpValues[index - 1] = '';
        inputs[index - 1].nativeElement.value = '';
        inputs[index - 1].nativeElement.focus();
      }

      this.otpForm.patchValue({ otp: this.otpValues.join('') });
      return;
    }

    if (event.key === 'Delete') {
      event.preventDefault();
      this.otpValues[index] = '';
      inputs[index].nativeElement.value = '';
      this.otpForm.patchValue({ otp: this.otpValues.join('') });
      return;
    }

    // Arrow Keys
    if (event.key === 'ArrowLeft' && index > 0) {
      inputs[index - 1].nativeElement.focus();
    }
    if (event.key === 'ArrowRight' && index < 5) {
      inputs[index + 1].nativeElement.focus();
    }
  }

  onOtpPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pastedData = event.clipboardData?.getData('text') || '';
    const digits = pastedData.replace(/\D/g, '').slice(0, 6);

    if (digits.length === 6) {
      this.otpValues = digits.split('');
      this.otpForm.patchValue({ otp: digits });

      // تحديث الـ inputs
      const inputs = this.otpInputs.toArray();
      inputs.forEach((input, i) => {
        input.nativeElement.value = this.otpValues[i];
      });

      // التركيز على الحقل الأخير
      inputs[5]?.nativeElement.focus();
    }
  }

  isOtpComplete(): boolean {
    return this.otpValues.every(v => v !== '');
  }

  // Step 2: Verify Code
  verifyCode(): void {
    if (!this.isOtpComplete()) {
      this.toastr.error('يرجى إدخال الكود كاملاً', 'خطأ');
      return;
    }

    this.isLoading = true;
    const code = this.otpValues.join('');

    this.authService.VerifyResetCode(this.forgotEmail, code).subscribe({  // ← غير userEmail لـ forgotEmail
      next: (res: any) => {
        this.isLoading = false;
        if (!res.success) {
          this.toastr.error(res.message, 'خطأ');
          this.addShakeAnimation();
          return;
        }
        this.toastr.success('تم التحقق بنجاح');
        this.resetToken = res.token;
        this.forgotStep = 3;  // ← غير currentStep لـ forgotStep
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        this.toastr.error(err.error?.message || 'الكود غير صحيح');
        this.addShakeAnimation();
      }
    });
  }

  // Step 3: Reset Password
  resetPassword(): void {
    if (!this.newPassword || !this.confirmNewPassword) {
      this.toastr.error('أدخل كلمة المرور');
      return;
    }

    if (this.newPassword !== this.confirmNewPassword) {
      this.toastr.error('كلمة المرور غير متطابقة');
      return;
    }

    if (this.newPassword.length < 6) {
      this.toastr.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    this.isLoading = true;

    this.authService.ResetPassword({
      email: this.forgotEmail,
      token: this.resetToken,
      newPassword: this.newPassword
    }).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (!res.success) {
          this.toastr.error(res.message);
          return;
        }
        this.toastr.success('تم تغيير كلمة المرور بنجاح');
        this.forgotStep = 4;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        this.toastr.error(err.error?.message || 'حدث خطأ');
      }
    });
  }

  // Password Strength
  checkPasswordStrength(): void {
    const password = this.newPassword || '';  // ← غير هنا
    let strength = 0;

    if (password.length >= 6) strength++;
    if (password.length >= 10) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    if (strength <= 2) {
      this.passwordStrength = 'weak';
      this.passwordStrengthText = this.i18n.currentLang === 'ar' ? 'ضعيفة' : 'Weak';
    } else if (strength <= 3) {
      this.passwordStrength = 'fair';
      this.passwordStrengthText = this.i18n.currentLang === 'ar' ? 'متوسطة' : 'Fair';
    } else if (strength <= 4) {
      this.passwordStrength = 'good';
      this.passwordStrengthText = this.i18n.currentLang === 'ar' ? 'جيدة' : 'Good';
    } else {
      this.passwordStrength = 'strong';
      this.passwordStrengthText = this.i18n.currentLang === 'ar' ? 'قوية' : 'Strong';
    }
  }

  // Toggle Password Visibility
  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  //==================================================================================================================================
  //==================================================================================================================================

  goBackStep(): void {
    if (this.forgotStep > 1 && this.forgotStep < 4 && !this.isLoading) {
      this.forgotStep--;

      // Reset step-specific data
      if (this.forgotStep === 1) {
        this.otpValues = ['', '', '', '', '', ''];
        this.newPassword = '';
        this.confirmNewPassword = '';
        this.resetToken = '';
        this.cleanupTimer();
        this.resendTimer = 0;
      }

      if (this.forgotStep === 2) {
        this.newPassword = '';
        this.confirmNewPassword = '';
        this.resetToken = '';
        this.passwordStrength = '';
        this.passwordStrengthText = '';

        // ✅ التركيز على أول OTP input
        setTimeout(() => {
          this.focusFirstOtpInput();
        }, 100);
      }
    }
  }

  // ═══════════════════════════════════════════════
  // LOGIN & REGISTER FUNCTIONS
  // ═══════════════════════════════════════════════

  switchTab(tab: 'login' | 'register'): void {
    this.activeTab = tab;
  }

  onLogin(): void {
    if (!this.loginEmail || !this.loginPassword) {
      this.toastr.error(this.i18n.currentLang === 'ar' ? 'الرجاء ملء جميع الحقول' : 'Please fill all fields');
      return;
    }

    this.isLoading = true;

    this.authService.login({
      email: this.loginEmail,
      password: this.loginPassword
    }).subscribe({
      next: (res) => {
        if(res.user.isBanned === true){
          this.isLoading = false;
          this.toastr.error(this.i18n.currentLang === 'ar' ? 'تم حظر حسابك، يرجى التواصل مع الدعم' : 'Your account has been banned, please contact support');
          this.cdr.detectChanges();
          return;
        }
        this.isLoading = false;
        if (res.success && res.token && res.role) {
          this.authService.saveToken(res.token, res.role);
          this.toastr.success(res.message || (this.i18n.currentLang === 'ar' ? 'تم تسجيل الدخول بنجاح' : 'Login successful'));
          this.cdr.detectChanges(); // ✅ Force change detection to update the UI immediately
          this.router.navigate(['/']);
        } else {
          const message = res.message || (this.i18n.currentLang === 'ar' ? 'خطأ في تسجيل الدخول' : 'Login failed');
          this.toastr.error(message);
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Login error:', err);
        const message = err.error?.message || (this.i18n.currentLang === 'ar' ? 'خطأ في تسجيل الدخول' : 'Login failed');
        this.toastr.error(message);
      }
    });
  }

  onRegister(): void {
    if (!this.registerName || !this.registerEmail || !this.registerPassword || !this.registerConfirmPassword) {
      this.toastr.error(this.i18n.currentLang === 'ar' ? 'الرجاء ملء جميع الحقول' : 'Please fill all fields');
      return;
    }

    if (this.registerPassword !== this.registerConfirmPassword) {
      this.toastr.error(this.i18n.currentLang === 'ar' ? 'كلمة المرور غير متطابقة' : 'Passwords do not match');
      return;
    }

    if (this.registerRole === 'Vendor') {
      if (!this.vendorBusinessName || !this.vendorCommercialReg || !this.vendorTaxNumber || !this.vendorBusinessAddress) {
        this.toastr.error(this.i18n.currentLang === 'ar' ? 'الرجاء ملء جميع بيانات التاجر' : 'Please fill all vendor information');
        return;
      }
    }

    this.isLoading = true;

    const payload: any = {
      fullName: this.registerName,
      email: this.registerEmail,
      password: this.registerPassword,
      confirmPassword: this.registerConfirmPassword,
      phoneNumber: this.registerPhone,
      role: 'Customer'
    };

    if (this.registerRole === 'Vendor') {
      payload.businessName = this.vendorBusinessName;
      payload.commercialRegistration = this.vendorCommercialReg;
      payload.taxNumber = this.vendorTaxNumber;
      payload.businessAddress = this.vendorBusinessAddress;
    }

    this.authService.register(payload).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success) {
          if (this.registerRole === 'Vendor') {
            this.toastr.success(this.i18n.currentLang === 'ar'
              ? 'تم إرسال طلبك بنجاح! سيتم مراجعته من قبل الإدارة'
              : 'Your request has been submitted! It will be reviewed by admin');
            this.switchTab('login');
          } else {
            if (res.token && res.role) {
              this.authService.saveToken(res.token, res.role);
              this.toastr.success(res.message || (this.i18n.currentLang === 'ar' ? 'تم إنشاء الحساب بنجاح' : 'Account created successfully'));
              this.router.navigate(['/']);
            }
          }
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Register error:', err);
        const message = err.error?.message || (this.i18n.currentLang === 'ar' ? 'خطأ في إنشاء الحساب' : 'Registration failed');
        this.toastr.error(message);
      }
    });
  }

  loginWithGoogle(): void {
    if (typeof google !== 'undefined') {
      google.accounts.id.prompt();
    } else {
      this.toastr.error(this.i18n.currentLang === 'ar' ? 'خطأ في تحميل Google Sign-In' : 'Failed to load Google Sign-In');
    }
  }

  handleGoogleCallback(response: any): void {
    const token = response.credential;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      this.googleEmail = payload.email;
      this.googleToken = token;

      this.isLoading = true;

      this.authService.googleLogin({ token }).subscribe({
        next: (res) => {
          this.isLoading = false;
          if (res.success) {
            if (res.isNewUser) {
              this.showCompleteProfileModal = true;
            } else {
              if (res.token && res.role) {
                this.authService.saveToken(res.token, res.role);
                this.toastr.success(this.i18n.currentLang === 'ar' ? 'تم تسجيل الدخول بنجاح' : 'Login successful');
                this.router.navigate(['/']);
              }
            }
          }
        },
        error: (err) => {
          this.isLoading = false;
          console.error('Google login error:', err);
          this.toastr.error(this.i18n.currentLang === 'ar' ? 'خطأ في تسجيل الدخول بجوجل' : 'Google login failed');
        }
      });
    } catch (error) {
      console.error('Error parsing Google token:', error);
      this.toastr.error(this.i18n.currentLang === 'ar' ? 'خطأ في معالجة البيانات' : 'Failed to process data');
    }
  }

  completeProfile(): void {
    if (!this.profileFullName || !this.profilePhoneNumber || !this.profileAge) {
      this.toastr.error(this.i18n.currentLang === 'ar' ? 'الرجاء ملء جميع الحقول' : 'Please fill all fields');
      return;
    }

    const age = parseInt(this.profileAge);
    if (isNaN(age) || age < 13 || age > 120) {
      this.toastr.error(this.i18n.currentLang === 'ar' ? 'الرجاء إدخال عمر صحيح' : 'Please enter a valid age');
      return;
    }

    this.isLoading = true;

    this.authService.completeGoogleProfile({
      email: this.googleEmail,
      googleToken: this.googleToken,
      fullName: this.profileFullName,
      phoneNumber: this.profilePhoneNumber,
      age: age
    }).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success && res.token && res.role) {
          this.authService.saveToken(res.token, res.role);
          this.showCompleteProfileModal = false;
          this.toastr.success(res.message || (this.i18n.currentLang === 'ar' ? 'تم إنشاء الحساب بنجاح' : 'Account created successfully'));
          this.router.navigate(['/']);
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Complete profile error:', err);
        const message = err.error?.message || (this.i18n.currentLang === 'ar' ? 'خطأ في حفظ البيانات' : 'Failed to save profile');
        this.toastr.error(message);
      }
    });
  }
}