# Frontend entrypoints

## HTML entry

- `index.html` mounts the app into `<div id="root"></div>` and loads the module `src/main.tsx`.
- There is no `<link rel="preload">` for a hero background image; the `Hero` section background is implemented in-component.

## React bootstrap

- `src/main.tsx` imports global styles from `src/index.css` and renders `App` into the root element.

## App composition

- `src/App.tsx` composes the page:
  - layout: `Navbar`, `Footer`
  - sections: `Hero`, `PricingSection`, `FeatureComparisonSection`, `TechSpecsSection`, `UseCasesSection`, `BenefitsSection`, `SocialProofSection`, `FAQSection`, `CTABanner`
  - utilities: `BackToTop`, `CookieConsentBar`, `Toaster`

Separators between sections are implemented with the `Separator` component.

## Section implementation pattern (as used in code)

Most sections follow this structure:

- `Section` (layout wrapper)
- `StaggerInView` (in-view animation orchestration)
- `SectionHeading` (standardized title/subtitle)
- `FadeInUpBlock` and `StaggerGrid` (motion building blocks)

## Styling pipeline (what is actually imported)

- Global Tailwind layers are defined in `src/index.css` (`@tailwind base/components/utilities`).
- `src/App.css` exists but is not imported by `src/main.tsx` or `src/App.tsx`.

## Navigation behaviour

- `src/components/layout/Navbar.tsx` defines hash links (`#hero`, `#pricing`, `#comparison`, `#faq`, `#cta`).
- It uses `IntersectionObserver` to track which section is active, and a `hashchange` listener to track hash.
- Clicking nav links prevents default navigation and calls `scrollIntoView({ behavior: "smooth" })`.

