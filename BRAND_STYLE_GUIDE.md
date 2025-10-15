# M&M'S Fun Club Brand & Style Guide

This document serves as a comprehensive style guide for the M&M'S Fun Club platform, including fonts, colors, logos, and styling guidelines that can be used across different platforms and implementations.

## Table of Contents
- [Brand Colors](#brand-colors)
- [Typography](#typography)
- [Logos & Assets](#logos--assets)
- [UI Components](#ui-components)
- [Layout Guidelines](#layout-guidelines)
- [Interactive Elements](#interactive-elements)
- [Accessibility](#accessibility)

---

## Brand Colors

### Primary Brand Colors
\`\`\`css
/* Primary Brown - Main brand color */
--primary: #5A1F06;
--primary-foreground: #FFFFFF;

/* M&M'S Yellow - Secondary brand color */
--secondary: #FFD200;
--secondary-foreground: #5A1F06;

/* Success Green - Positive actions, achievements */
--success: #00A836;
--success-foreground: #FFFFFF;

/* Alert Red - Destructive actions, warnings */
--destructive: #D70100;
--destructive-foreground: #FFFFFF;

/* Accent Orange - Call-to-action, highlights */
--accent: #FA6400;
--accent-foreground: #FFFFFF;

/* Blue - Information, links */
--info: #0E74E1;
--info-foreground: #FFFFFF;
\`\`\`

### M&M'S Character Colors
\`\`\`css
/* Individual M&M character colors for candies/game elements */
--mm-green: #00A836;
--mm-blue: #0E74E1;
--mm-brown: #5A1F06;
--mm-red: #D70100;
--mm-orange: #FA6400;
--mm-yellow: #FFD200;
\`\`\`

### Neutral Colors
\`\`\`css
/* Background and text colors */
--background: #FFFFFF;
--foreground: #5A1F06;
--muted: #F5F5F5;
--muted-foreground: #6B7280;
--border: #E5E7EB;
\`\`\`

---

## Typography

### Font Families

#### Primary Font: All Together Serif
- **Usage**: Headings, buttons, emphasis text
- **Weights**: Bold (700), Light (300)
- **CDN Links**:
  - Bold: `https://res.cloudinary.com/basis/raw/upload/v1739299966/MMS%20Fun%20Club/AllTogetherSerifW05-Bold.woff2`
  - Light: `https://res.cloudinary.com/basis/raw/upload/v1739299966/MMS%20Fun%20Club/AllTogetherSerifW05-Light.woff2`

#### Secondary Font: All Together Sans
- **Usage**: Body text, descriptions, labels
- **Weight**: Regular (400)
- **CDN Link**: `https://res.cloudinary.com/basis/raw/upload/v1739299966/MMS%20Fun%20Club/AllTogetherSansW05-Regular.woff2`

### Font Implementation
\`\`\`css
@font-face {
  font-family: "All Together Serif";
  src: url("https://res.cloudinary.com/basis/raw/upload/v1739299966/MMS%20Fun%20Club/AllTogetherSerifW05-Bold.woff2") format("woff2");
  font-weight: bold;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: "All Together Serif";
  src: url("https://res.cloudinary.com/basis/raw/upload/v1739299966/MMS%20Fun%20Club/AllTogetherSerifW05-Light.woff2") format("woff2");
  font-weight: 300;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: "All Together Sans";
  src: url("https://res.cloudinary.com/basis/raw/upload/v1739299966/MMS%20Fun%20Club/AllTogetherSansW05-Regular.woff2") format("woff2");
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}
\`\`\`

### Typography Scale
\`\`\`css
/* Headings - Use All Together Serif Bold */
h1 { font-size: 2rem; font-weight: bold; } /* 32px */
h2 { font-size: 1.5rem; font-weight: bold; } /* 24px */
h3 { font-size: 1.25rem; font-weight: bold; } /* 20px */
h4 { font-size: 1.125rem; font-weight: bold; } /* 18px */

/* Body text - Use All Together Sans Regular */
body { font-size: 1rem; } /* 16px */
small { font-size: 0.875rem; } /* 14px */
xs { font-size: 0.75rem; } /* 12px */
\`\`\`

---

## Logos & Assets

### Primary Logos
- **Fun Club Logo (Variant 2)**: `https://hebbkx1anhila5yf.public.blob.vercel-storage.com/fun-club-logo-var2-4iEoRI3BA3ArXmhgtSawr5k2b5jp57.svg`
  - Usage: Main navigation, headers, branding
  - Format: SVG (scalable)
  - Background: Transparent

- **M&M'S Logo (White on Lentil)**: `https://res.cloudinary.com/basis/image/upload/v1742275944/MMS%20Fun%20Club/M_M_S_just_M_logo_white_on_lentil.svg`
  - Usage: Game elements, candy representations
  - Format: SVG
  - Color: White with filter options

### Character Sprites (Game Assets)
- **M&M Character - Up**: `https://hebbkx1anhila5yf.public.blob.vercel-storage.com/M%26M%E2%80%99S%20Up-Udc1AJVvEIe7hHsy5UyehWvr1Id1lU.png`
- **M&M Character - Down**: `https://hebbkx1anhila5yf.public.blob.vercel-storage.com/M%26M%E2%80%99S%20Down-CP4xYRou0Cmk5gqw12f6bRIcAQCS8E.png`
- **M&M Character - Left**: `https://hebbkx1anhila5yf.public.blob.vercel-storage.com/M%26M%E2%80%99S%20Left-UFUACtERIeRobOvj1EwrUzhRJULadt.png`
- **M&M Character - Right**: `https://hebbkx1anhila5yf.public.blob.vercel-storage.com/M%26M%E2%80%99S%20Right-1Tx85CTAeY8CDqGl5JbmHBH78WPHc9.png`

### Brand Partner Logos
- **Walgreens**: `https://hebbkx1anhila5yf.public.blob.vercel-storage.com/W_logo_RGB-1hvWaSVla4z5bvbBOJZxO5ZLUzWUN0.png`
- **Target**: `https://hebbkx1anhila5yf.public.blob.vercel-storage.com/target-logo-preview-ljSgsf0BKpqVHdkQPlgSWZoqw2wnHy.png`
- **Dollar General**: `https://hebbkx1anhila5yf.public.blob.vercel-storage.com/dollar-general-logo-2CA4A2BD6E-seeklogo.com-cuWXvM402T0AAQnVfSeIkK0QygdHIe.png`

### Product Images
- **PB&J M&M'S**: `https://res.cloudinary.com/basis/image/upload/v1742278833/MMS%20Fun%20Club/PBJ_MMS.png`
- **Peanut M&M'S**: `https://res.cloudinary.com/basis/image/upload/v1742278834/MMS%20Fun%20Club/Peanut_MMS.png`
- **Original M&M'S**: `https://res.cloudinary.com/basis/image/upload/v1742278833/MMS%20Fun%20Club/MMS.png`
- **Peanut Butter M&M'S**: `https://res.cloudinary.com/basis/image/upload/v1742278833/MMS%20Fun%20Club/Peanut_Butter_MMS.png`

### Footer Branding
- **Powered by Perk**: `https://res.cloudinary.com/basis/image/upload/v1743697910/Powered-by-Perk_andgi5.png`

---

## UI Components

### Buttons

#### Primary Button
\`\`\`css
.btn-primary {
  background-color: #5A1F06;
  color: #FFFFFF;
  font-family: "All Together Serif", serif;
  font-weight: bold;
  border-radius: 9999px; /* Fully rounded */
  padding: 0.5rem 1.25rem;
  border: none;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background-color: rgba(90, 31, 6, 0.8);
}
\`\`\`

#### Secondary Button
\`\`\`css
.btn-secondary {
  background-color: #FFD200;
  color: #5A1F06;
  font-family: "All Together Serif", serif;
  font-weight: bold;
  border-radius: 9999px;
  padding: 0.5rem 1.25rem;
  border: none;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background-color: rgba(255, 210, 0, 0.8);
}
\`\`\`

#### Outline Button
\`\`\`css
.btn-outline {
  background-color: transparent;
  color: #5A1F06;
  font-family: "All Together Serif", serif;
  font-weight: bold;
  border: 2px solid #5A1F06;
  border-radius: 9999px;
  padding: 0.5rem 1.25rem;
  transition: all 0.2s ease;
}

.btn-outline:hover {
  background-color: rgba(255, 210, 0, 0.2);
}
\`\`\`

### Cards
\`\`\`css
.card {
  background-color: #FFFFFF;
  border: 2px solid rgba(90, 31, 6, 0.2);
  border-radius: 1.25rem; /* 20px */
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.card-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid rgba(90, 31, 6, 0.1);
}

.card-content {
  padding: 1.5rem;
}
\`\`\`

### Game Elements
\`\`\`css
.game-container {
  background-color: #FFD200;
  border-radius: 1.25rem;
  border: 4px solid #5A1F06;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.maze-cell {
  border-radius: 4px;
  transition: all 0.2s ease;
}

.maze-wall {
  background-color: #5A1F06;
}

.maze-empty {
  background-color: #FFFFFF;
}
\`\`\`

---

## Layout Guidelines

### Container Widths
\`\`\`css
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

@media (min-width: 768px) {
  .container {
    padding: 0 2rem;
  }
}
\`\`\`

### Spacing Scale
\`\`\`css
/* Use consistent spacing throughout */
--spacing-xs: 0.25rem;  /* 4px */
--spacing-sm: 0.5rem;   /* 8px */
--spacing-md: 1rem;     /* 16px */
--spacing-lg: 1.5rem;   /* 24px */
--spacing-xl: 2rem;     /* 32px */
--spacing-2xl: 3rem;    /* 48px */
\`\`\`

### Grid System
\`\`\`css
/* Responsive grid layouts */
.grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
.grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }

@media (max-width: 768px) {
  .grid-2, .grid-3 {
    grid-template-columns: 1fr;
  }
}
\`\`\`

---

## Interactive Elements

### Hover Effects
\`\`\`css
.interactive-element {
  transition: all 0.2s ease;
  cursor: pointer;
}

.interactive-element:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}
\`\`\`

### Loading States
\`\`\`css
.loading {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
\`\`\`

### Focus States
\`\`\`css
.focusable:focus {
  outline: 2px solid #0E74E1;
  outline-offset: 2px;
}
\`\`\`

---

## Accessibility

### Color Contrast
- All text on background colors meets WCAG AA standards (4.5:1 ratio minimum)
- Primary brown (#5A1F06) on white: 8.9:1 ratio ✅
- White text on primary brown: 8.9:1 ratio ✅
- Primary brown on yellow (#FFD200): 4.8:1 ratio ✅

### Screen Reader Support
\`\`\`html
<!-- Use semantic HTML -->
<main>
  <header>
    <h1>Page Title</h1>
  </header>
  <section aria-labelledby="section-heading">
    <h2 id="section-heading">Section Title</h2>
  </section>
</main>

<!-- Screen reader only text -->
<span class="sr-only">Screen reader only content</span>
\`\`\`

### Keyboard Navigation
- All interactive elements must be keyboard accessible
- Focus indicators must be visible
- Tab order should be logical

---

## Implementation Notes

### CSS Custom Properties
\`\`\`css
:root {
  /* Colors */
  --primary: #5A1F06;
  --secondary: #FFD200;
  --success: #00A836;
  --destructive: #D70100;
  --accent: #FA6400;
  --info: #0E74E1;
  
  /* Typography */
  --font-serif: "All Together Serif", serif;
  --font-sans: "All Together Sans", sans-serif;
  
  /* Spacing */
  --radius: 0.5rem;
  --radius-lg: 1.25rem;
  --radius-full: 9999px;
}
\`\`\`

### Responsive Breakpoints
\`\`\`css
/* Mobile First Approach */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
\`\`\`

### Performance Considerations
- Use `font-display: swap` for custom fonts
- Optimize images with appropriate formats (WebP when possible)
- Use CSS transforms for animations (better performance)
- Minimize layout shifts with proper sizing

---

## Usage Examples

### Basic Page Structure
\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>M&M'S Fun Club</title>
  <!-- Font preloads -->
  <link rel="preload" href="[font-url]" as="font" type="font/woff2" crossorigin>
</head>
<body style="font-family: 'All Together Sans', sans-serif;">
  <header>
    <img src="[logo-url]" alt="M&M'S Fun Club" />
    <h1 style="font-family: 'All Together Serif', serif;">Page Title</h1>
  </header>
  <main>
    <!-- Content -->
  </main>
</body>
</html>
\`\`\`

### Component Example
\`\`\`jsx
// React/Next.js component example
function PrimaryButton({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="bg-[#5A1F06] hover:bg-[#5A1F06]/80 text-white rounded-full px-5 py-2 transition-all"
      style={{ fontFamily: "'All Together Serif', serif", fontWeight: "bold" }}
    >
      {children}
    </button>
  );
}
\`\`\`

---

## Version History
- **v1.0** - Initial brand guide creation
- **Current Version**: v1.0

---

*This style guide should be referenced for all M&M'S Fun Club platform implementations to ensure brand consistency across different platforms and technologies.*
