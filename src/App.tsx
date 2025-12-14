import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import PricingSection from "@/components/sections/PricingSection";
import FeatureComparisonSection from "@/components/sections/FeatureComparisonSection";
import TechSpecsSection from "@/components/sections/TechSpecsSection";
import UseCasesSection from "@/components/sections/UseCasesSection";
import BenefitsSection from "@/components/sections/BenefitsSection";
import SocialProofSection from "@/components/sections/SocialProofSection";
import FAQSection from "@/components/sections/FAQSection";
import CTABanner from "@/components/sections/CTABanner";
import { Toaster } from "@/components/ui/toaster";
import { Separator } from "@/components/ui/separator";
import { CookieConsentBar } from "@/components/layout/CookieConsentBar";
import { BackToTop } from "@/components/shared/BackToTop";

function App() {
  return (
    <div className="min-h-screen flex flex-col pb-32 sm:pb-28">
      <Navbar />
      <main className="flex-1 text-[15px] sm:text-base leading-relaxed [&_h1]:tracking-tight [&_h2]:tracking-tight [&_h3]:tracking-tight [&_h1]:leading-tight [&_h2]:leading-tight">
        <Hero />
        <Separator className="my-16 bg-gradient-to-r from-transparent via-border to-transparent" />
        <PricingSection />
        <Separator className="my-16 bg-gradient-to-r from-transparent via-border to-transparent" />
        <FeatureComparisonSection />
        <Separator className="my-16 bg-gradient-to-r from-transparent via-border to-transparent" />
        <TechSpecsSection />
        <Separator className="my-16 bg-gradient-to-r from-transparent via-border to-transparent" />
        <UseCasesSection />
        <Separator className="my-16 bg-gradient-to-r from-transparent via-border to-transparent" />
        <BenefitsSection />
        <Separator className="my-16 bg-gradient-to-r from-transparent via-border to-transparent" />
        <SocialProofSection />
        <Separator className="my-16 bg-gradient-to-r from-transparent via-border to-transparent" />
        <FAQSection />
        <Separator className="my-16 bg-gradient-to-r from-transparent via-border to-transparent" />
        <CTABanner />
      </main>
      <Footer />
      <BackToTop />
      <CookieConsentBar />
      <Toaster />
    </div>
  );
}

export default App;
