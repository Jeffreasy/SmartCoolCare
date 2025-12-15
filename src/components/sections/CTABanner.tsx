import { Section } from "@/components/layout/Section";
import { DemoModal } from "@/components/shared/DemoModal";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { StaggerInView } from "@/components/shared/StaggerInView";
import { FadeInUpBlock } from "@/components/shared/FadeInUpBlock";
import { DEMO_CTA_BUTTON, GRID_3_COL_RESP, TEXT_MUTED_LEAD } from "@/lib/styles";

export default function CTABanner() {
    return (
        <Section
            id="cta"
            className="relative overflow-hidden bg-gradient-to-b from-primary/10 via-background to-background"
        >
            <StaggerInView className="space-y-10 sm:space-y-14">
                <FadeInUpBlock>
                    <SectionHeading
                        className="space-y-6 max-w-4xl mx-auto"
                        title="Klaar voor betrouwbare koelkastbewaking zonder abonnement?"
                        subtitle="Vraag nu een gratis demo aan en ontdek hoe SmartCool Care jouw compliance vereenvoudigt."
                        titleClassName="text-3xl sm:text-4xl lg:text-6xl font-bold text-shadow-light"
                        subtitleClassName="text-base sm:text-lg lg:text-xl text-muted-foreground"
                    />
                </FadeInUpBlock>

                <FadeInUpBlock className="flex justify-center">
                        <DemoModal
                            triggerText="Gratis Demo Aanvragen"
                            triggerClassName={`${DEMO_CTA_BUTTON} px-10`}
                        />
                </FadeInUpBlock>

                <FadeInUpBlock className={`${GRID_3_COL_RESP} text-center text-sm sm:text-base`}>
                        <div>
                            <p className="font-semibold">Q1 2026</p>
                            <p>CE Marking + 10 pilots</p>
                        </div>
                        <div>
                            <p className="font-semibold">Q2 2026</p>
                            <p>Commerciële launch + Kickstarter</p>
                        </div>
                        <div>
                            <p className="font-semibold">Q4 2026</p>
                            <p>Version 2.0 met multi-sensor support</p>
                        </div>
                </FadeInUpBlock>

                <FadeInUpBlock className={`text-center ${TEXT_MUTED_LEAD}`}>
                        <p>Pilotprogramma start Q1 2026 – beperkte plekken beschikbaar.</p>
                </FadeInUpBlock>
            </StaggerInView>
        </Section>
    );
}
