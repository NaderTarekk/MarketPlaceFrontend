<style>
body, html { direction: rtl; text-align: right; font-family: 'Segoe UI', Tahoma, Arial, sans-serif; line-height: 1.8; }
table { direction: rtl; width: 100%; border-collapse: collapse; margin-bottom: 20px; }
th, td { text-align: right; padding: 10px 14px; border: 1px solid #e5e7eb; font-size: 13px; }
th { background: #1e3a5f; color: white; font-size: 14px; }
h1, h2, h3 { text-align: right; color: #1e3a5f; }
h1 { border-bottom: 3px solid #2563eb; padding-bottom: 10px; font-size: 22px; }
h2 { font-size: 18px; margin-top: 30px; }
.exists { color: #16a34a; font-weight: bold; }
.missing { color: #dc2626; font-weight: bold; }
.partial { color: #d97706; font-weight: bold; }
.section-title { background: linear-gradient(135deg, #1e3a5f, #2563eb); color: white; padding: 10px 16px; border-radius: 8px; margin: 24px 0 14px; font-size: 16px; }
.doc-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px solid #e5e7eb; }
.doc-header img:first-child { height: 80px; }
.doc-header img:last-child { height: 45px; }
.doc-footer { text-align: center; margin-top: 30px; padding-top: 15px; border-top: 2px solid #e5e7eb; color: #9ca3af; font-size: 11px; }
.doc-footer img { height: 28px; opacity: 0.7; margin-top: 6px; }
.note { background: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; padding: 10px 14px; font-size: 12px; color: #92400e; margin: 10px 0; }
</style>

<div class="doc-header">
  <img src="./public/wild.jpeg" alt="Wild Market" />
  <img src="./public/nhc.png" alt="Nile Hash Code Solutions" />
</div>

# تحليل الفجوة — Wild Market vs Babcash BRD

### المتطلبات الناقصة لتحويل Wild Market إلى منصة Babcash

---

<div class="section-title">أولاً: نظام المستخدمين والأدوار (Actors & Roles)</div>

| # | المتطلب | الحالة | الوصف التفصيلي |
|---|---------|--------|----------------|
| 1 | دور المسوق (Affiliate) | <span class="missing">غير موجود ❌</span> | إنشاء دور جديد "Affiliate" منفصل عن Vendor — يقدر يسوّق منتجات، يدخل أوردرات، يسحب عمولات |
| 2 | دور المساعد (Moderator) | <span class="missing">غير موجود ❌</span> | مساعدين تابعين لمسوق واحد، صلاحيات محدودة (إدخال أوردرات + متابعة شحن)، بدون صلاحيات مالية |
| 3 | تعديل صلاحيات التاجر (Merchant) | <span class="partial">يحتاج تعديل ⚠️</span> | التاجر حالياً يرفع منتجات ويعدل أسعار. المطلوب: منع التاجر من رفع/تعديل المنتجات إلا بموافقة الأدمن |
| 4 | Super Admin | <span class="partial">جزئي ⚠️</span> | موجود Admin واحد. المطلوب: مستويات أدمن (Super Admin + Admin عادي) |

<div class="section-title">ثانياً: نظام المنتجات</div>

| # | المتطلب | الحالة | الوصف التفصيلي |
|---|---------|--------|----------------|
| 5 | رفع المنتجات من الأدمن فقط | <span class="partial">يحتاج تعديل ⚠️</span> | حالياً التاجر يرفع منتجاته. المطلوب: الأدمن فقط يرفع المنتجات والتاجر يشاهد فقط |
| 6 | ميديا تسويقية للمنتجات (فيديوهات) | <span class="partial">جزئي ⚠️</span> | الصور موجودة. المطلوب: إضافة فيديوهات + ميديا تسويقية قابلة للتحميل من المسوق |
| 7 | مكتبة ميديا (Google Drive style) | <span class="missing">غير موجود ❌</span> | نظام رفع وتحميل ميديا منظم لكل منتج — المسوق يقدر يحمّل الصور والفيديوهات |

<div class="section-title">ثالثاً: نظام المسوقين (Affiliate System)</div>

| # | المتطلب | الحالة | الوصف التفصيلي |
|---|---------|--------|----------------|
| 8 | لوحة تحكم المسوق (Affiliate Dashboard) | <span class="missing">غير موجود ❌</span> | داشبورد خاص بالمسوق: أوردراته، عمولاته، إحصائياته، منتجاته المسوّقة |
| 9 | إدخال أوردرات يدوي | <span class="missing">غير موجود ❌</span> | المسوق يدخل أوردر بنفسه (اسم العميل + عنوان + منتجات) والمنصة تشحن |
| 10 | ربط متجر خارجي (EasyOrders API) | <span class="missing">غير موجود ❌</span> | API لربط المتاجر الخارجية بالمنصة لاستقبال الأوردرات تلقائياً |
| 11 | تتبع مصدر الأوردر (Source Tracking) | <span class="missing">غير موجود ❌</span> | تتبع من أي مسوق جاء الأوردر + من أي منصة (Facebook, TikTok, etc.) |
| 12 | روابط تسويقية خاصة (Affiliate Links) | <span class="missing">غير موجود ❌</span> | كل مسوق يحصل على رابط خاص بكل منتج لتتبع مبيعاته |

<div class="section-title">رابعاً: صفحات الهبوط (Landing Pages)</div>

| # | المتطلب | الحالة | الوصف التفصيلي |
|---|---------|--------|----------------|
| 13 | Landing Page تلقائية لكل منتج | <span class="missing">غير موجود ❌</span> | صفحة هبوط مخصصة لكل منتج تُنشأ تلقائياً مع رابط خاص لكل مسوق |
| 14 | إمكانية سحب Landing Page وربطها بمتجر خارجي | <span class="missing">غير موجود ❌</span> | المسوق يقدر يستخدم الصفحة مباشرة أو يربطها بمتجره |

<div class="section-title">خامساً: نظام البونص التحفيزي (Dynamic Bonus Engine)</div>

| # | المتطلب | الحالة | الوصف التفصيلي |
|---|---------|--------|----------------|
| 15 | نظام بونص ديناميكي | <span class="missing">غير موجود ❌</span> | بعد X أوردرات مستلمة → بونص مالي. الشروط قابلة للتعديل من الأدمن (عدد أوردرات، فترة زمنية، قيمة البونص) |
| 16 | حملات أسبوعية / شهرية | <span class="missing">غير موجود ❌</span> | حملات تحفيزية مؤقتة بشروط وجوائز محددة |

<div class="section-title">سادساً: نظام Loyalty Branding</div>

| # | المتطلب | الحالة | الوصف التفصيلي |
|---|---------|--------|----------------|
| 17 | اسم المسوق على ظرف الشحن | <span class="missing">غير موجود ❌</span> | عند وصول المسوق لـ 50 أو 100 أوردر مستلم → يُفعّل اسمه على ظرف الشحن |
| 18 | لوجو المسوق على الفاتورة | <span class="missing">غير موجود ❌</span> | لوجو المسوق يظهر على الكرتونة أو الفاتورة الداخلية |
| 19 | Alert للأدمن عند وصول المسوق للحد | <span class="missing">غير موجود ❌</span> | إشعار تلقائي للأدمن عند تحقيق المسوق شرط الولاء |

<div class="section-title">سابعاً: الدفع والتحويلات (Payments & Payouts)</div>

| # | المتطلب | الحالة | الوصف التفصيلي |
|---|---------|--------|----------------|
| 20 | تكامل Paymob | <span class="missing">غير موجود ❌</span> | بوابة دفع Paymob لتحصيل المدفوعات الإلكترونية |
| 21 | تحويل عمولات المسوقين تلقائياً | <span class="partial">جزئي ⚠️</span> | نظام سحب (Withdrawals) موجود لكن يدوي. المطلوب: تحويل تلقائي عبر Paymob/InstaPay |
| 22 | تحويل مستحقات التجار | <span class="partial">جزئي ⚠️</span> | نظام تسوية موجود لكن بدون تكامل مع بوابات الدفع |

<div class="section-title">ثامناً: التتبع وقواعد البيانات (Tracking & Data)</div>

| # | المتطلب | الحالة | الوصف التفصيلي |
|---|---------|--------|----------------|
| 23 | تتبع مصدر العميل | <span class="missing">غير موجود ❌</span> | من أي مسوق + من أي منصة (Facebook Pixel, UTM parameters) |
| 24 | تقارير تحليلية متقدمة | <span class="partial">جزئي ⚠️</span> | تقارير مالية أساسية موجودة. المطلوب: تقارير أداء المسوقين + معدل التحويل + تحليل المناطق |

<div class="section-title">تاسعاً: تحسين محركات البحث (SEO)</div>

| # | المتطلب | الحالة | الوصف التفصيلي |
|---|---------|--------|----------------|
| 25 | Friendly URLs (Slugs) | <span class="exists">موجود ✅</span> | Product slugs موجودة |
| 26 | Meta Tags (OG Tags) | <span class="missing">غير موجود ❌</span> | Meta tags ديناميكية لكل صفحة منتج (title, description, og:image) |
| 27 | سرعة تحميل عالية | <span class="partial">يحتاج تحسين ⚠️</span> | Lazy loading موجود. المطلوب: تحسينات إضافية (SSR, image optimization) |

<div class="section-title">عاشراً: الأمان (Security)</div>

| # | المتطلب | الحالة | الوصف التفصيلي |
|---|---------|--------|----------------|
| 28 | OTP عند التسجيل | <span class="exists">موجود ✅</span> | نظام OTP كامل |
| 29 | WhatsApp OTP | <span class="missing">غير موجود ❌</span> | إرسال OTP عبر واتساب (اختياري) |
| 30 | Role-Based Access Control | <span class="exists">موجود ✅</span> | نظام صلاحيات كامل |
| 31 | API Tokens | <span class="exists">موجود ✅</span> | JWT Authentication موجود |

<div class="section-title">حادي عشر: قابلية التوسع (Multi-Country)</div>

| # | المتطلب | الحالة | الوصف التفصيلي |
|---|---------|--------|----------------|
| 32 | دعم عملات متعددة | <span class="missing">غير موجود ❌</span> | حالياً EGP فقط. المطلوب: SAR, AED, MAD |
| 33 | شركات شحن مختلفة لكل دولة | <span class="missing">غير موجود ❌</span> | نظام شحن حالياً لمصر فقط |
| 34 | بوابات دفع مختلفة حسب الدولة | <span class="missing">غير موجود ❌</span> | بوابة دفع واحدة |
| 35 | بنية Multi-Tenant | <span class="missing">غير موجود ❌</span> | إعدادات مستقلة لكل دولة (ضرائب، شحن، عملة) |

<div class="section-title">ثاني عشر: التوثيق (Documentation)</div>

| # | المتطلب | الحالة | الوصف التفصيلي |
|---|---------|--------|----------------|
| 36 | API Documentation | <span class="partial">جزئي ⚠️</span> | Swagger موجود. المطلوب: توثيق شامل |
| 37 | Database Schema | <span class="missing">غير موجود ❌</span> | توثيق هيكل قاعدة البيانات |
| 38 | دليل الأدمن / المسوق / التاجر | <span class="missing">غير موجود ❌</span> | أدلة استخدام لكل دور |

---

<div class="section-title">ملخص التحليل</div>

| الحالة | العدد | النسبة |
|--------|-------|--------|
| <span class="exists">موجود ✅</span> | 4 | 11% |
| <span class="partial">جزئي / يحتاج تعديل ⚠️</span> | 9 | 24% |
| <span class="missing">غير موجود ❌</span> | 25 | 65% |
| **الإجمالي** | **38** | **100%** |

<div class="note">
<strong>ملاحظة:</strong> Wild Market حالياً منصة Marketplace (سوق إلكتروني). التحول لنموذج Babcash (Affiliate-First SaaS) يتطلب بناء طبقة كاملة جديدة للمسوقين مع الحفاظ على البنية التحتية الموجودة (شحن، مخازن، مدفوعات، عمولات).
</div>

---

<div class="doc-footer">
  <p>Prepared by Nile Hash Code Solutions</p>
  <img src="./public/nhc.png" alt="NHC Solutions" />
</div>
