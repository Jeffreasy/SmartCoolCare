import { Section } from "@/components/layout/Section";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { CheckItem } from "@/components/shared/CheckItem";
import { techSections } from "@/lib/constants/techSpecs";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { StaggerInView } from "@/components/shared/StaggerInView";
import { FadeInUpBlock } from "@/components/shared/FadeInUpBlock";
import { MAX_W_4XL_CENTER, SECTION_STACK_DEFAULT } from "@/lib/styles";

export default function TechSpecsSection() {
    return (
        <Section id="techspecs" background="bg-muted/30">
            <StaggerInView className={SECTION_STACK_DEFAULT}>
                <FadeInUpBlock>
                    <SectionHeading
                        title="Betrouwbare techniek, gebouwd voor de praktijk"
                        subtitle="Robuuste hardware en veilige software die 24/7 werkt – zonder complexe installatie."
                        titleClassName="text-4xl lg:text-5xl"
                    />
                </FadeInUpBlock>

                <FadeInUpBlock className={MAX_W_4XL_CENTER}>
                        <Accordion type="single" collapsible className="w-full">
                            {techSections.map((section, sectionIndex) => (
                                <AccordionItem key={sectionIndex} value={`item-${sectionIndex}`}>
                                    <AccordionTrigger className="text-xl font-semibold text-primary hover:no-underline">
                                        {section.title}
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <ul className="space-y-4 pt-4">
                                            {section.items.map((item, itemIndex) => (
                                                <li key={itemIndex}>
                                                    <CheckItem>{item}</CheckItem>
                                                </li>
                                            ))}
                                        </ul>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                </FadeInUpBlock>
            </StaggerInView>
        </Section>
    );
}
