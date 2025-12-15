# Content & constants

Most non-component content is stored as exported constants under `src/lib/constants/`.

## Files currently present

- `benefits.ts`: `benefits` list.
- `pricing.ts`: `pricingTiers` list.
- `comparison.ts`: comparison table types + `comparisonFeatures`.
- `faq.ts`: `FAQItem` interface + `faqItems` list.
- `socialProof.ts`: `stats` + `testimonials`.
- `techSpecs.ts`: `techSections`.
- `useCases.ts`: `useCases`.

## Where constants are consumed (examples)

- FAQ: `faqItems` is imported by `src/components/sections/FAQSection.tsx`.
- Pricing: `pricingTiers` is imported by `src/components/sections/PricingSection.tsx`.
- Comparison table: `comparisonFeatures` is imported by `src/components/sections/FeatureComparisonSection.tsx`.

These are plain exports; there is no runtime loading step (no API fetch) involved.

## FAQ source of truth

- `src/lib/constants/faq.ts` is the single source of truth for FAQ content (`FAQItem` + `faqItems`).

