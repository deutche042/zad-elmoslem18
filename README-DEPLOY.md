# 🕌 زاد Muslim — Vercel Deployment Guide

## الخطوة 1: إنشاء مشروع على Vercel
1. روح على https://vercel.com واعمل حساب (أو سجل دخول بـ GitHub)
2. اضغط "Add New Project"
3. اختار "Upload" (مش من GitHub)

## الخطوة 2: رفع الملفات
1. ارفع كل الملفات اللي في مجلد `vercel-hosting`
2. **مفيش node_modules** — Vercel هيجيبه لوحده
3. **مفيش .next** — Vercel هيبنيه لوحده

## الخطوة 3: Environment Variables (مهم جداً!)
في صفحة Environment Variables على Vercel، حط المتغيرات دي:

```
DATABASE_URL=file:./db/custom.db
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BDfKkya975WhlfmZAkyxvBaiInsvJ-RyqNIZXyhPWTIemqB8nfmrhLruP2r1Yizaw915G_qSZG8pMl6-f0xUIM8
VAPID_PRIVATE_KEY=6IDB6Vntsb7D9yTa18iCLP8KWsd4CzUL1IBc9pTl66I
VAPID_SUBJECT=mailto:zad-muslim@app.com
```

## الخطوة 4: Build Settings
- **Framework Preset**: Next.js (تلقائي)
- **Build Command**: `npm run build`
- **Install Command**: `npm install`
- **Output Directory**: `.next`

## الخطوة 5: اضغط Deploy
واس-te وهينرفع ويشتغل!

## ⚠️ ملاحظات مهمة:

### قاعدة البيانات (SQLite)
Vercel بيكون filesystem read-only، يعني SQLite مش هيشتغل على Vercel نفسه.
الحل: غير قاعدة البيانات لـ Turso (SQLite على السحاب) — مجاني:
1. روح https://turso.tech واعمل حساب
2. اعمل قاعدة بيانات جديدة
3. حط الـ URL في `DATABASE_URL` على Vercel

### لو عايز تستخدم SQLite بدون سيرفر:
الـ cron job مش هيشتغل، بس الإشعارات اللي بتشتغل من الـ Service Worker (أوفلاين) هتشتغل.

## ✅ الميزات اللي هتشتغل على Vercel:
- كل الصفحات والتطبيق كله
- مواقيت الصلاة
- الأذان (صوت)
- تذكير الصلاة
- الصلاة على النبي
- الإشعارات الفورية (Push Notifications)
- كل الإعدادات
