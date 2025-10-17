# 🎨 SCSS/Sass Guide - MeCoins

## การใช้งาน SCSS ในโปรเจค MeCoins

---

## ✅ ติดตั้งแล้ว

```bash
npm install sass --save-dev
```

SCSS พร้อมใช้งานแล้ว! Next.js รองรับ SCSS โดยอัตโนมัติ

---

## 📂 โครงสร้างไฟล์ SCSS

```
mecoins/
├── styles/
│   ├── globals.scss       # Global styles + Tailwind
│   ├── variables.scss     # ตัวแปร (colors, spacing, etc.)
│   └── mixins.scss        # Mixins และ Functions
├── containers/
│   └── test/
│       ├── EmailTestButton.tsx
│       └── EmailTestButton.module.scss  # Component styles
└── app/
    └── layout.tsx         # Import globals.scss ที่นี่
```

---

## 🎯 วิธีใช้งาน

### 1. Global SCSS
```tsx
// app/layout.tsx
import '../styles/globals.scss'  // ✅ ทำแล้ว
```

### 2. SCSS Modules (แนะนำ)
```tsx
// Component.tsx
import styles from './Component.module.scss'

<div className={styles.container}>
  <button className={styles.button}>Click</button>
</div>
```

```scss
// Component.module.scss
.container {
  padding: 1rem;
  background: white;
}

.button {
  background: #0ea5e9;
  color: white;
  padding: 0.5rem 1rem;
  
  &:hover {
    background: darken(#0ea5e9, 10%);
  }
}
```

### 3. Import Variables และ Mixins
```scss
@import '@/styles/variables';
@import '@/styles/mixins';

.myButton {
  @include button-base;
  @include button-variant($primary);
}
```

---

## 📝 Variables ที่มี

### Colors
```scss
$primary: #0ea5e9;
$secondary: #6b7280;
$success: #10b981;
$danger: #ef4444;
$warning: #f59e0b;
```

### Spacing
```scss
$spacing-xs: 0.25rem;
$spacing-sm: 0.5rem;
$spacing-md: 1rem;
$spacing-lg: 1.5rem;
$spacing-xl: 2rem;
```

### Typography
```scss
$font-size-xs: 0.75rem;
$font-size-sm: 0.875rem;
$font-size-base: 1rem;
$font-size-lg: 1.125rem;
$font-size-xl: 1.25rem;
```

**การใช้งาน:**
```scss
.text {
  color: $primary;
  font-size: $font-size-lg;
  padding: $spacing-md;
}
```

---

## 🛠️ Mixins ที่มี

### Flexbox
```scss
@mixin flex-center
@mixin flex-between
@mixin flex-column
```

**ตัวอย่าง:**
```scss
.header {
  @include flex-between;
  padding: 1rem;
}
```

### Buttons
```scss
@mixin button-base
@mixin button-variant($bg-color, $text-color)
@mixin gradient-button($color1, $color2)
```

**ตัวอย่าง:**
```scss
.myButton {
  @include button-base;
  @include gradient-button(#0ea5e9, #0369a1);
}
```

### Cards
```scss
@mixin card
@mixin card-hover
```

**ตัวอย่าง:**
```scss
.productCard {
  @include card;
  @include card-hover;
}
```

### Forms
```scss
@mixin input-base
```

**ตัวอย่าง:**
```scss
.input {
  @include input-base;
}
```

### Responsive
```scss
@mixin respond-to($breakpoint)
// $breakpoint: 'sm', 'md', 'lg', 'xl'
```

**ตัวอย่าง:**
```scss
.container {
  padding: 1rem;
  
  @include respond-to('md') {
    padding: 2rem;
  }
  
  @include respond-to('lg') {
    padding: 3rem;
  }
}
```

---

## 💡 ตัวอย่างการใช้งาน

### ตัวอย่างที่ 1: Component แบบง่าย

```tsx
// components/MyCard.tsx
import styles from './MyCard.module.scss'

export default function MyCard() {
  return (
    <div className={styles.card}>
      <h2 className={styles.title}>Title</h2>
      <p className={styles.content}>Content</p>
    </div>
  )
}
```

```scss
// components/MyCard.module.scss
@import '@/styles/variables';
@import '@/styles/mixins';

.card {
  @include card;
  @include card-hover;
}

.title {
  font-size: $font-size-xl;
  font-weight: 700;
  color: $gray-800;
  margin-bottom: $spacing-md;
}

.content {
  color: $gray-600;
  line-height: 1.6;
}
```

---

### ตัวอย่างที่ 2: Button Component

```scss
@import '@/styles/variables';
@import '@/styles/mixins';

.button {
  @include button-base;
  
  &--primary {
    @include button-variant($primary);
  }
  
  &--success {
    @include button-variant($success);
  }
  
  &--danger {
    @include button-variant($danger);
  }
  
  &--gradient {
    @include gradient-button($primary, $primary-dark);
  }
}
```

**ใช้งาน:**
```tsx
<button className={styles.button}>Base</button>
<button className={`${styles.button} ${styles['button--primary']}`}>Primary</button>
<button className={`${styles.button} ${styles['button--gradient']}`}>Gradient</button>
```

---

### ตัวอย่างที่ 3: Responsive Layout

```scss
@import '@/styles/mixins';

.grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: 1fr;
  
  @include respond-to('md') {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @include respond-to('lg') {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

---

## 🎨 ตัวอย่างที่มีในโปรเจค

### EmailTestButton.module.scss
```scss
@import '@/styles/variables';
@import '@/styles/mixins';

.button {
  @include button-base;
  
  &--primary {
    @include button-variant($primary);
  }
}

.modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  @include flex-center;
  z-index: $z-modal;
  animation: fadeIn 0.2s ease;
}

.templateButton {
  &--blue {
    @include gradient-button($blue, darken($blue, 10%));
  }
  
  &--green {
    @include gradient-button($green, darken($green, 10%));
  }
}
```

---

## 🔧 การสร้าง SCSS Module ใหม่

### Step 1: สร้างไฟล์
```
components/
└── MyComponent/
    ├── MyComponent.tsx
    └── MyComponent.module.scss
```

### Step 2: เขียน SCSS
```scss
// MyComponent.module.scss
@import '@/styles/variables';
@import '@/styles/mixins';

.wrapper {
  @include card;
  margin: $spacing-lg 0;
}

.title {
  font-size: $font-size-2xl;
  color: $primary;
  margin-bottom: $spacing-md;
}
```

### Step 3: ใช้ใน Component
```tsx
// MyComponent.tsx
import styles from './MyComponent.module.scss'

export default function MyComponent() {
  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>Hello</h2>
    </div>
  )
}
```

---

## ✨ Features ของ SCSS

### 1. Nesting
```scss
.card {
  background: white;
  
  .title {
    font-size: 1.5rem;
  }
  
  .content {
    color: gray;
    
    a {
      color: blue;
      
      &:hover {
        text-decoration: underline;
      }
    }
  }
}
```

### 2. Variables
```scss
$primary: #0ea5e9;
$spacing: 1rem;

.button {
  background: $primary;
  padding: $spacing;
}
```

### 3. Mixins
```scss
@mixin rounded {
  border-radius: 0.5rem;
}

.card {
  @include rounded;
}
```

### 4. Functions
```scss
@function calculate-spacing($multiplier) {
  @return 1rem * $multiplier;
}

.container {
  padding: calculate-spacing(2); // 2rem
}
```

### 5. Extend/Inheritance
```scss
%button-base {
  padding: 0.5rem 1rem;
  border: none;
  cursor: pointer;
}

.btn-primary {
  @extend %button-base;
  background: blue;
}

.btn-secondary {
  @extend %button-base;
  background: gray;
}
```

---

## 🎯 Best Practices

### ✅ Do's:
1. ใช้ SCSS Modules สำหรับ component styles
2. ใช้ variables สำหรับค่าที่ใช้ซ้ำ
3. ใช้ mixins สำหรับ patterns ที่ซ้ำ
4. Nest แค่ 3-4 levels
5. ตั้งชื่อ class แบบ BEM หรือ camelCase

### ❌ Don'ts:
1. อย่า nest ลึกเกินไป (> 4 levels)
2. อย่าสร้าง global styles มากเกินไป
3. อย่าใช้ !important (ถ้าไม่จำเป็น)
4. อย่าทำซ้ำ code ที่ควรเป็น mixin

---

## 🔄 SCSS กับ Tailwind

โปรเจคนี้ใช้ทั้ง **SCSS** และ **Tailwind CSS**:

### Tailwind: ใช้สำหรับ
- ✅ Utility classes (px-4, py-2, bg-blue-500)
- ✅ Responsive (md:, lg:)
- ✅ Prototyping ที่รวดเร็ว

### SCSS: ใช้สำหรับ
- ✅ Component-specific styles
- ✅ Complex animations
- ✅ Theme variables
- ✅ Reusable mixins

**ใช้ร่วมกันได้:**
```tsx
<div className={`${styles.card} bg-white shadow-lg`}>
  {/* SCSS module + Tailwind */}
</div>
```

---

## 📚 ตัวอย่างเพิ่มเติม

### Loading Spinner
```scss
.spinner {
  width: 2rem;
  height: 2rem;
  border: 4px solid $primary;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
```

### Modal
```scss
.modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  @include flex-center;
  z-index: $z-modal;
  @include fade-in;
  
  &Content {
    background: white;
    border-radius: $border-radius-xl;
    max-width: 600px;
    width: 100%;
    @include slide-up;
  }
}
```

### Badge
```scss
.badge {
  &--success {
    @include badge($success, $success);
  }
  
  &--danger {
    @include badge($danger, $danger);
  }
  
  &--warning {
    @include badge($warning, $warning);
  }
}
```

---

## 🛠️ Commands

```bash
# Next.js compiles SCSS automatically
npm run dev

# No additional commands needed!
```

---

## 📖 Resources

- [Sass Documentation](https://sass-lang.com/documentation)
- [Next.js Sass Support](https://nextjs.org/docs/app/building-your-application/styling/sass)
- [SCSS Basics](https://sass-lang.com/guide)

---

**SCSS พร้อมใช้งานแล้ว! 🎨**

ลองสร้าง Component ใหม่ด้วย `.module.scss` ได้เลย!

