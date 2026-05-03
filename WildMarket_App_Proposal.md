<style>
body, html { direction: rtl; text-align: right; font-family: 'Segoe UI', Tahoma, Arial, sans-serif; line-height: 1.9; color: #1e293b; }
table { direction: rtl; width: 100%; border-collapse: collapse; margin-bottom: 20px; }
th, td { text-align: right; padding: 10px 14px; border: 1px solid #e2e8f0; font-size: 13px; }
th { background: #0a2540; color: white; font-size: 13px; }
h1, h2, h3 { text-align: right; color: #0a2540; }
h1 { font-size: 22px; border-bottom: 3px solid #0a2540; padding-bottom: 10px; }
h2 { font-size: 17px; margin-top: 28px; }
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; padding-bottom: 20px; border-bottom: 2px solid #e2e8f0; }
.header img:first-child { height: 70px; }
.header img:last-child { height: 45px; }
.section { background: linear-gradient(135deg, #0a2540, #153d64); color: white; padding: 10px 18px; border-radius: 8px; margin: 24px 0 14px; font-size: 15px; font-weight: 700; }
.total-box { background: linear-gradient(135deg, #0a2540, #1c5a8a); color: white; border-radius: 12px; padding: 20px 24px; text-align: center; margin: 20px 0; }
.total-box .price { font-size: 32px; font-weight: 800; margin: 8px 0; }
.total-box .label { font-size: 14px; opacity: 0.8; }
.total-box .includes { font-size: 12px; opacity: 0.7; margin-top: 6px; }
.warning { background: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; padding: 14px 18px; margin: 16px 0; font-size: 12px; color: #92400e; }
.footer { text-align: center; margin-top: 30px; padding-top: 15px; border-top: 2px solid #e2e8f0; color: #9ca3af; font-size: 11px; }
.footer img { height: 32px; opacity: 0.7; margin-top: 8px; }
.info-row { display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 13px; }
.info-label { color: #64748b; }
.info-value { font-weight: 700; color: #0a2540; }
</style>

<div class="header">
  <img src="./public/wild.jpeg" alt="Wild Market" />
  <div style="text-align:center">
    <h2 style="margin:0;font-size:20px;color:#0a2540">عرض سعر — تطبيق Wild Market للموبايل</h2>
    <p style="margin:4px 0 0;font-size:12px;color:#64748b">Mobile Application — Android & iOS</p>
  </div>
  <img src="./public/nhc.png" alt="Nile Hash Code Solutions" />
</div>

---

<div class="info-row"><span class="info-label">رقم العرض:</span> <span class="info-value">NHC-2026-0430-APP</span></div>
<div class="info-row"><span class="info-label">التاريخ:</span> <span class="info-value">30 أبريل 2026</span></div>
<div class="info-row"><span class="info-label">مقدم من:</span> <span class="info-value">Nile Hash Code Solutions</span></div>
<div class="info-row"><span class="info-label">مقدم إلى:</span> <span class="info-value">د/ خالد</span></div>
<div class="info-row"><span class="info-label">صلاحية العرض:</span> <span class="info-value">30 يوم من تاريخ الإصدار</span></div>

---

# وصف المشروع

تطوير تطبيق موبايل لمنصة **Wild Market** للتجارة الإلكترونية يعمل على نظامي **Android** و **iOS** باستخدام تقنية **Flutter** (كود واحد للنظامين). التطبيق يشمل جميع وظائف الموقع الحالي مع تجربة مستخدم محسّنة للموبايل.

---

<div class="section">أولاً: شاشات العملاء</div>

| الشاشة | التفاصيل |
|--------|----------|
| تسجيل الدخول والتسجيل | تسجيل بالإيميل + تسجيل بحساب Google + OTP |
| الصفحة الرئيسية | بانرات متحركة + عروض حصرية + منتجات مميزة + براندات مشهورة |
| صفحة المنتجات | عرض المنتجات + بحث + فلاتر (تصنيف، براند، سعر) + ترتيب |
| تفاصيل المنتج | صور + وصف + تقييمات + اختيار مقاس/لون + إضافة للسلة |
| السلة | عرض المنتجات + تعديل الكميات + كود خصم + ملخص الطلب |
| إتمام الطلب | اختيار العنوان + طريقة الدفع (COD) + تأكيد الطلب |
| طلباتي | عرض الطلبات + حالة كل طلب + تتبع الشحن |
| البروفايل | بيانات شخصية + عناوين التوصيل + تغيير اللغة |
| المفضلة | قائمة المنتجات المفضلة |
| العروض | صفحة العروض مع countdown + منتجات مخفضة |

<div class="section">ثانياً: مميزات عامة</div>

| الميزة | التفاصيل |
|--------|----------|
| Push Notifications | إشعارات فورية (طلب جديد، تحديث شحن، عروض) |
| دعم اللغتين | العربية (RTL) + الإنجليزية (LTR) |
| التصميم | Material Design 3 + تصميم عصري متوافق مع الموقع |
| الأداء | تحميل سريع + Lazy Loading + تخزين مؤقت للصور |
| الأمان | JWT Authentication + Secure Storage |
| التوافق | Android 8+ و iOS 13+ |

<div class="section">ثالثاً: التقنيات المستخدمة</div>

| البند | التفاصيل |
|-------|----------|
| لغة التطوير | Flutter (Dart) |
| المنصات | Android + iOS من كود واحد |
| الربط | REST API — نفس Backend الموقع الحالي (.NET 8) |
| إدارة الحالة | Provider / Riverpod |
| الإشعارات | Firebase Cloud Messaging (FCM) |

<div class="section">رابعاً: التسليمات</div>

| البند | التفاصيل |
|-------|----------|
| السورس كود | كود Flutter كامل |
| ملف Android | APK + رفع على Google Play Store |
| ملف iOS | IPA + رفع على App Store |
| أدلة الاستخدام | دليل التركيب والتشغيل |

---

<div class="total-box">
  <div class="label">إجمالي تكلفة المشروع</div>
  <div class="price">62,000 ج.م</div>
  <div class="label">اثنان وستون ألف جنيه مصري</div>
  <div class="includes">شامل: السيرفر + الدومين + رفع على المتاجر (Google Play + App Store)</div>
</div>

## شروط الدفع

| المرحلة | النسبة | المبلغ | الموعد |
|---------|--------|--------|--------|
| دفعة مقدمة | 25% | 15,500 ج.م | قبل بدء التنفيذ |
| دفعة نهائية | 75% | 46,500 ج.م | بعد التسليم النهائي والاختبار |

| البند | التفاصيل |
|-------|----------|
| طريقة الدفع | تحويل بنكي / فودافون كاش / InstaPay |
| يشمل | السيرفر + الدومين + رفع على المتاجر |

## الجدول الزمني

| المرحلة | المحتوى | المدة |
|---------|---------|-------|
| Phase 1 | تصميم UI/UX + شاشات العملاء (رئيسية، منتجات، سلة، طلبات) | 3-4 أسابيع |
| Phase 2 | Push Notifications + اختبار + تحسينات | 3-4 أسابيع |
| Phase 3 | رفع على المتاجر + إعداد السيرفر والدومين | 1 أسبوع |
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
    <p style="font-size:13px;font-weight:700;margin-top:8px">د/ خالد</p>
  </div>
</div>

---

<div class="footer">
  <p>Nile Hash Code Solutions — جميع الحقوق محفوظة 2026</p>
  <img src="./public/nhc.png" alt="NHC Solutions" />
</div>
