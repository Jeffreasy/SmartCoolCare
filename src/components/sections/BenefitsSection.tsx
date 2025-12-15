import { Section } from "@/components/layout/Section";
import { benefits } from "@/lib/constants/benefits";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { StaggerInView } from "@/components/shared/StaggerInView";
import { FadeInUpBlock } from "@/components/shared/FadeInUpBlock";
import { StaggerGrid } from "@/components/shared/StaggerGrid";
import { HOVER_SHADOW_LG, SECTION_STACK_DEFAULT, TEXT_MUTED_LEAD } from "@/lib/styles";

export default function BenefitsSection() {
    return (
        <Section id="benefits" background="bg-muted/30">
            <StaggerInView className={SECTION_STACK_DEFAULT}>
                <FadeInUpBlock>
                    <SectionHeading
                        title="Waarom kiezen voor SmartCool Care?"
                        subtitle="Praktische voordelen die direct impact hebben op jouw dagelijkse werkzaamheden en budget."
                        titleClassName="text-4xl lg:text-5xl"
                    />
                </FadeInUpBlock>

                <StaggerGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {benefits.map((benefit) => (
                        <FadeInUpBlock
                            key={benefit.title}
                            className={`flex flex-col gap-4 p-8 bg-card rounded-xl ${HOVER_SHADOW_LG}`}
                        >
                            <h3 className="text-2xl font-semibold text-primary">{benefit.title}</h3>
                            <p className={`${TEXT_MUTED_LEAD} flex-1`}>{benefit.description}</p>
                        </FadeInUpBlock>
                    ))}
                </StaggerGrid>
            </StaggerInView>
        </Section>
    );
}
