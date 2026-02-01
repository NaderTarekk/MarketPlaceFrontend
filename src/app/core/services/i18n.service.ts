// i18n.service.ts

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type Lang = 'ar' | 'en';

const translations: Record<string, Record<Lang, string>> = {
  // ─── Navbar ───
  search_placeholder: { ar: 'ما الذي تبحث عنه؟', en: 'What are you looking for?' },
  nav_home: { ar: 'الرئيسية', en: 'Home' },
  nav_about: { ar: 'عن الموقع', en: 'About' },
  nav_contact: { ar: 'تواصل معنا', en: 'Contact' },
  wishlist: { ar: 'المفضلة', en: 'Wishlist' },
  cart: { ar: 'السلة', en: 'Cart' },

  // ─── Sidebar ───
  categories: { ar: 'الفئات', en: 'Categories' },
  cat_womens: { ar: 'أزياء السيدات', en: "Women's Fashion" },
  cat_mens: { ar: 'أزياء الرجال', en: "Men's Fashion" },
  cat_electronics: { ar: 'الإلكترونيات', en: 'Electronics' },
  cat_home: { ar: 'البيت والأسلوب', en: 'Home & Lifestyle' },
  cat_medicine: { ar: 'الأدوية', en: 'Medicine' },
  cat_sports: { ar: 'الرياضة والخارجية', en: 'Sports & Outdoor' },
  cat_babies: { ar: 'الأطفال والألعاب', en: "Baby's & Toys" },
  cat_groceries: { ar: 'البقالة والحيوانات', en: 'Groceries & Pets' },
  cat_health: { ar: 'الصحة والجمال', en: 'Health & Beauty' },

  // ─── Banner ───
  banner_upto: { ar: 'حتى 10%', en: 'Up to 10%' },
  banner_voucher: { ar: 'خصم كوبون', en: 'off Voucher' },
  banner_limited: { ar: 'عرض محدود — لا تفوتك الفرصة', en: "Limited time offer — don't miss out" },

  // ─── Product Card ───
  add_to_cart: { ar: 'أضف للسلة', en: 'Add To Cart' },
  save: { ar: 'وفر', en: 'Save' },

  // ─── Product Names ───
  prod_keyboard: { ar: 'كيبورد سلكي AK-900', en: 'AK-900 Wired Keyboard' },
  prod_gamepad: { ar: 'جوستيك HAVIT HV-G92', en: 'HAVIT HV-G92 Gamepad' },
  prod_monitor: { ar: 'شاشة ألعاب IPS LCD', en: 'IPS LCD Gaming Monitor' },
  prod_chair: { ar: 'كرسي المريح E-Series', en: 'E-Series Comfort Chair' },

  // ─── Auth ───
  login:                  { ar: 'تسجيل الدخول',                          en: 'Login' },
  register:               { ar: 'إنشاء حساب',                            en: 'Register' },
  email:                  { ar: 'البريد الإلكتروني',                     en: 'Email' },
  password:               { ar: 'كلمة المرور',                           en: 'Password' },
  confirm_password:       { ar: 'تأكيد كلمة المرور',                     en: 'Confirm Password' },
  full_name:              { ar: 'الاسم الكامل',                          en: 'Full Name' },
  remember_me:            { ar: 'تذكرني',                                en: 'Remember Me' },
  forgot_password:        { ar: 'نسيت كلمة المرور؟',                     en: 'Forgot Password?' },
  forgot_title:           { ar: 'استعادة كلمة المرور',                   en: 'Reset Password' },
  forgot_desc:            { ar: 'أدخل بريدك وسنبعتلك رابط استعادة',       en: "Enter your email and we'll send a reset link" },
  forgot_sent:            { ar: 'تم إرسال رابط الاستعادة على بريدك',      en: 'Reset link sent to your email!' },
  send_reset:             { ar: 'إرسال رابط الاستعادة',                  en: 'Send Reset Link' },
  sign_in:                { ar: 'تسجيل الدخول',                          en: 'Sign In' },
  create_account:         { ar: 'إنشاء الحساب',                          en: 'Create Account' },
  or_continue:            { ar: 'أو استمر مع',                           en: 'Or continue with' },
  sign_in_google:         { ar: 'تسجيل الدخول بجوجل',                    en: 'Sign in with Google' },
  already_have:           { ar: 'لديك حساب بالفعل؟',                     en: 'Already have an account?' },
  dont_have:              { ar: 'لا تملك حساباً؟',                       en: "Don't have an account?" },
  cancel:                 { ar: 'إلغاء',                                 en: 'Cancel' },
  email_placeholder:      { ar: 'أنت@مثال.كوم',                          en: 'you@example.com' },
  name_placeholder:       { ar: 'محمد أحمد',                             en: 'John Doe' },

  // ─── Buttons ───
  view_all: { ar: 'عرض كل المنتجات', en: 'View All Products' },
};

@Injectable({ providedIn: 'root' })
export class I18nService {
  private lang$ = new BehaviorSubject<Lang>(this.getSavedLang());

  private getSavedLang(): Lang {
    const saved = localStorage.getItem('lang');
    return (saved === 'ar' || saved === 'en') ? saved : 'en';
  }

  get currentLang(): Lang {
    return this.lang$.getValue();
  }

  lang$Observable(): Observable<Lang> {
    return this.lang$.asObservable();
  }

  switch(lang: Lang): void {
    this.lang$.next(lang);
  }

  t(key: string): string {
    const entry = translations[key];
    if (!entry) return key;
    return entry[this.currentLang] ?? key;
  }

  formatPrice(amount: number): string {
    const num = amount.toLocaleString('en-US');
    return this.currentLang === 'ar' ? `${num} جنيه` : `EGP ${num}`;
  }

  formatSaving(amount: number): string {
    const num = amount.toLocaleString('en-US');
    return this.currentLang === 'ar' ? `وفر ${num} جنيه` : `Save EGP ${num}`;
  }

  isRtl(): boolean {
    return this.currentLang === 'ar';
  }
}