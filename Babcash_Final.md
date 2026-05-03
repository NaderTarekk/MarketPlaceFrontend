<style>
body, html { direction: rtl; text-align: right; font-family: 'Segoe UI', Tahoma, Arial, sans-serif; line-height: 1.9; color: #1e293b; }
table { direction: rtl; width: 100%; border-collapse: collapse; margin-bottom: 20px; }
th, td { text-align: right; padding: 10px 14px; border: 1px solid #e2e8f0; font-size: 13px; }
th { background: #0a2540; color: white; font-size: 13px; }
h1, h2, h3 { text-align: right; color: #0a2540; }
h1 { font-size: 22px; border-bottom: 3px solid #0a2540; padding-bottom: 10px; }
h2 { font-size: 17px; margin-top: 28px; }
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; padding-bottom: 20px; border-bottom: 2px solid #e2e8f0; }
.header img { height: 60px; }
.section { background: linear-gradient(135deg, #0a2540, #153d64); color: white; padding: 10px 18px; border-radius: 8px; margin: 24px 0 14px; font-size: 15px; font-weight: 700; }
.highlight { background: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 14px 18px; margin: 16px 0; }
.warning { background: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; padding: 14px 18px; margin: 16px 0; font-size: 12px; color: #92400e; }
.total-box { background: linear-gradient(135deg, #0a2540, #1c5a8a); color: white; border-radius: 12px; padding: 20px 24px; text-align: center; margin: 20px 0; }
.total-box .price { font-size: 32px; font-weight: 800; margin: 8px 0; }
.total-box .label { font-size: 14px; opacity: 0.8; }
.footer { text-align: center; margin-top: 30px; padding-top: 15px; border-top: 2px solid #e2e8f0; color: #9ca3af; font-size: 11px; }
.footer img { height: 32px; opacity: 0.7; margin-top: 8px; }
.info-row { display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 13px; }
.info-label { color: #64748b; }
.info-value { font-weight: 700; color: #0a2540; }
</style>

<div class="header">
  <div>
    <h2 style="margin:0;font-size:20px;color:#0a2540">عرض سعر — منصة Babcash</h2>
    <p style="margin:4px 0 0;font-size:12px;color:#64748b">Affiliate & Dropshipping Platform</p>
  </div>
  <img src="./public/nhc.png" alt="Nile Hash Code Solutions" />
</div>

---

<div class="info-row"><span class="info-label">رقم العرض:</span> <span class="info-value">NHC-2026-0430</span></div>
<div class="info-row"><span class="info-label">التاريخ:</span> <span class="info-value">30 أبريل 2026</span></div>
<div class="info-row"><span class="info-label">مقدم من:</span> <span class="info-value">Nile Hash Code Solutions</span></div>
<div class="info-row"><span class="info-label">مقدم إلى:</span> <span class="info-value">أ/ أحمد عادل</span></div>
<div class="info-row"><span class="info-label">صلاحية العرض:</span> <span class="info-value">30 يوم من تاريخ الإصدار</span></div>

---

# وصف المشروع

منصة **Babcash** هي منصة **SaaS** تعتمد على نموذج **Affiliate-First**، حيث تتم جميع عمليات البيع حصرياً من خلال المسوقين التابعين للمنصة. المنصة مصممة لدعم المسوقين المحترفين وفرق الميديا بايرز، مع قابلية التوسع للعمل في أكثر من دولة.

---

<div class="section">أولاً: نظام المستخدمين والصلاحيات</div>

| البند | التفاصيل |
|-------|----------|
| Super Admin / Admin | تحكم كامل في المنصة — إدارة المستخدمين، المنتجات، العمولات، الشحن، البونص |
| التاجر (Merchant) | مشاهدة المخزون والمبيعات فقط — لا يملك صلاحية رفع أو تعديل المنتجات |
| المسوق (Affiliate) | تسويق المنتجات، إدخال الأوردرات، سحب العمولات، تحميل الميديا |
| المساعد (Moderator) | تابع لمسوق واحد — إدخال أوردرات ومتابعة شحن فقط — بدون صلاحيات مالية |
| نظام الصلاحيات | Dynamic Permission Matrix — قابل لإضافة أدوار مستقبلية بدون إعادة بناء |

<div class="section">ثانياً: نظام المنتجات</div>

| البند | التفاصيل |
|-------|----------|
| رفع المنتجات | من خلال إدارة المنصة (Admin) فقط |
| محتوى المنتج | صور + فيديوهات + ميديا تسويقية قابلة للتحميل |
| مكتبة الميديا | نظام رفع وتحميل منظم لكل منتج — شبيه بـ Google Drive |
| صلاحيات التاجر | مشاهدة فقط — التعديل بموافقة الأدمن (اختياري) |

<div class="section">ثالثاً: نظام المسوقين (Affiliate System)</div>

| البند | التفاصيل |
|-------|----------|
| لوحة تحكم المسوق | أوردرات، أوردرات مستلمة، عمولات، رصيد المحفظة |
| روابط تسويقية | كود إحالة فريد + روابط تسويقية تلقائية لكل منتج |
| إدخال الأوردرات | إدخال يدوي من داخل المنصة + ربط متجر خارجي عبر API (EasyOrders) |
| تتبع المصدر | تتبع مصدر كل أوردر (من أي مسوق + من أي منصة) |
| التسويق | عبر Facebook، TikTok، أو أي منصة خارجية |

<div class="section">رابعاً: صفحات الهبوط (Landing Pages)</div>

| البند | التفاصيل |
|-------|----------|
| إنشاء تلقائي | Landing Page لكل منتج تُنشأ تلقائياً مع رابط خاص لكل مسوق |
| التخصيص | إمكانية تعديل الألوان واللوجو والـ CTA |
| الاستخدام | استخدام مباشر أو سحبها وربطها بمتجر خارجي |
| SEO | روابط نظيفة + Meta Tags + Schema-ready |

<div class="section">خامساً: نظام البونص التحفيزي (Dynamic Bonus Engine)</div>

| البند | التفاصيل |
|-------|----------|
| نظام بونص مرن | بعد X أوردرات مستلمة ← بونص مالي |
| شروط قابلة للتعديل | عدد الأوردرات، الفترة الزمنية، قيمة البونص — كلها من لوحة الأدمن |
| حملات تحفيزية | حملات أسبوعية / شهرية بشروط وجوائز محددة |
| عمولات متدرجة | Tier-based commissions حسب أداء المسوق |

<div class="section">سادساً: نظام Loyalty Branding</div>

| البند | التفاصيل |
|-------|----------|
| الشرط | عند وصول المسوق لـ 50 أو 100 أوردر مستلم فعلياً |
| الإجراء | إشعار تلقائي للأدمن + تفعيل اسم/لوجو المسوق |
| التطبيق | اسم المسوق على ظرف الشحن + لوجو على الفاتورة الداخلية |
| ملاحظة | ليس متجر مستقل — ليس دومين خاص — الهدف بناء Brand للمسوق |

<div class="section">سابعاً: الدفع والمحفظة (Payments & Wallet)</div>

| البند | التفاصيل |
|-------|----------|
| بوابات الدفع | تكامل Paymob + InstaPay + المحافظ الإلكترونية |
| نظام المحفظة | رصيد معلق (Pending) — متاح (Available) — مسحوب (Withdrawn) |
| التحويلات | تحويل عمولات المسوقين + مستحقات التجار |
| تحكم الأدمن | دفع يدوي / تلقائي + سجل التحويلات + قواعد منع الاحتيال |

<div class="section">ثامناً: التتبع والتحليلات (Tracking & Analytics)</div>

| البند | التفاصيل |
|-------|----------|
| تتبع النقرات | Click Tracking + Conversion Tracking |
| التقنية | Cookie + Server-side fallback |
| الإسناد | ربط كل أوردر بالمسوق المسؤول + المنصة المصدر |
| قاعدة البيانات | ملفات عملاء + سجل أوردرات + سجلات الإسناد |
| التقارير | أداء المسوقين + معدل التحويل + تحليل المناطق |

<div class="section">تاسعاً: قابلية التوسع (Multi-Country)</div>

| البند | التفاصيل |
|-------|----------|
| دعم متعدد الدول | جدول دول + جدول عملات |
| الشحن | شركات شحن مختلفة لكل دولة |
| الدفع | بوابات دفع مختلفة حسب الدولة |
| الإعدادات | ضرائب + قواعد شحن + عملة — مستقلة لكل دولة |
| البنية | Multi-Tenant جاهزة للتوسع بدون إعادة بناء |

<div class="section">عاشراً: SEO والأداء</div>

| البند | التفاصيل |
|-------|----------|
| SSR | Server-Side Rendering لتحسين محركات البحث |
| Sitemap | توليد تلقائي لخريطة الموقع |
| Meta Tags | ديناميكية لكل صفحة منتج |
| الأداء | تحسين سرعة التحميل + Mobile-first design |

<div class="section">حادي عشر: الأمان</div>

| البند | التفاصيل |
|-------|----------|
| المصادقة | JWT Authentication + OTP عند التسجيل |
| الحماية | Rate Limiting + تشفير البيانات الحساسة |
| المراقبة | Activity Logs + Audit Trails |
| الصلاحيات | Role-Based Access Control كامل |

<div class="section">ثاني عشر: اللغات والتصميم</div>

| البند | التفاصيل |
|-------|----------|
| اللغات | دعم كامل للعربية (RTL) والإنجليزية (LTR) |
| التوسع | قابل لإضافة لغات أخرى مستقبلاً |
| التصميم | Responsive + Mobile-first |
| الإشعارات | Dashboard + Email + SMS (جاهز للمستقبل) |

<div class="section">ثالث عشر: التسليمات</div>

| البند | التفاصيل |
|-------|----------|
| السورس كود | كامل Frontend + Backend |
| أدلة الاستخدام | دليل الأدمن + دليل المسوق + دليل التاجر |
| التركيب | Deployment Guide + Environment Setup Guide |

---

<div class="total-box">
  <div class="label">إجمالي تكلفة المشروع</div>
  <div class="price">250,000 ج.م</div>
  <div class="label">مائتان وخمسون ألف جنيه مصري</div>
</div>

## شروط الدفع

يتم سداد المبلغ كاملاً **بعد التسليم النهائي** واختبار المنصة والتأكد من مطابقتها للمتطلبات المذكورة في هذا المستند.

| البند | التفاصيل |
|-------|----------|
| المبلغ | **250,000 ج.م** |
| موعد السداد | بعد التسليم النهائي والاختبار |
| طريقة الدفع | تحويل بنكي / فودافون كاش / InstaPay |

## الجدول الزمني

| المرحلة | المحتوى | المدة |
|---------|---------|-------|
| Phase 1 — Core | Auth + Roles + Products + Orders + Tracking + Affiliate Module | 4 أسابيع |
| Phase 2 — Monetization | Wallet + Payments + Bonuses + Branding + Landing Pages | 4 أسابيع |
| Phase 3 — Scale | Multi-country + SEO + Performance + Security + Documentation | 2-4 أسابيع |
| **الإجمالي** | | **2 - 3 شهور** |

## ضمان ما بعد التسليم

- دعم فني مجاني لمدة **شهر واحد** بعد التسليم النهائي
- إصلاح أي bugs يتم اكتشافها خلال فترة الضمان
- الدعم يشمل: إصلاح أخطاء + إرشاد تقني — ولا يشمل فيتشرز جديدة

<div class="warning">
<strong>ملاحظة مهمة:</strong> أي متطلبات إضافية غير مذكورة صراحة في هذا المستند تُعتبر خارج نطاق العمل ويتم تقييمها وتسعيرها بشكل منفصل بالاتفاق بين الطرفين.
</div>

---

<div style="display:flex;justify-content:space-between;margin-top:40px;padding-top:20px">
  <div style="text-align:center">
    <p style="font-size:12px;color:#64748b;margin-bottom:40px">توقيع المُنفّذ</p>
    <div style="border-top:1px solid #cbd5e1;width:200px;margin:0 auto"></div>
    <p style="font-size:13px;font-weight:700;margin-top:8px">Nile Hash Code Solutions</p>
  </div>
  <div style="text-align:center">
    <p style="font-size:12px;color:#64748b;margin-bottom:40px">توقيع العميل</p>
    <div style="border-top:1px solid #cbd5e1;width:200px;margin:0 auto"></div>
    <p style="font-size:13px;font-weight:700;margin-top:8px">أ/ أحمد عادل</p>
  </div>
</div>

---

<div class="footer">
  <p>Nile Hash Code Solutions — جميع الحقوق محفوظة 2026</p>
  <img src="./public/nhc.png" alt="NHC Solutions" />
</div>
