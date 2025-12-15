import { Section } from "@/components/layout/Section";
import { pricingTiers } from "@/lib/constants/pricing";
import { PricingCard } from "@/components/shared/PricingCard";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { StaggerInView } from "@/components/shared/StaggerInView";
import { FadeInUpBlock } from "@/components/shared/FadeInUpBlock";
import { StaggerGrid } from "@/components/shared/StaggerGrid";
import { GRID_3_COL_RESP, SECTION_STACK_DEFAULT } from "@/lib/styles";

export default function PricingSection() {
    return (
        <Section id="pricing" className="bg-gradient-to-b from-transparent to-muted/30">
            <StaggerInView className={`text-center ${SECTION_STACK_DEFAULT}`}>
                <FadeInUpBlock>
                    <SectionHeading
                        title="Welke variant past bij jouw koelkast?"
                        subtitle={
                            <>
                                Van keuken tot vaccinopslag — alle varianten HACCP-compliant en zonder maandelijkse kosten.
                            </>
                        }
                    />
                </FadeInUpBlock>

                <StaggerGrid className={`${GRID_3_COL_RESP} max-w-7xl mx-auto`}>
                    {pricingTiers.map((tier) => (
                        <FadeInUpBlock key={tier.name}>
                            <PricingCard tier={tier} />
                        </FadeInUpBlock>
                    ))}
                </StaggerGrid>
            </StaggerInView>
        </Section>
    );
}
