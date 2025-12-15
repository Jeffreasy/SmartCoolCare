import { Section } from "@/components/layout/Section";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { faqItems } from "@/lib/constants/faq";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { StaggerInView } from "@/components/shared/StaggerInView";
import { FadeInUpBlock } from "@/components/shared/FadeInUpBlock";
import { MAX_W_4XL_CENTER, SECTION_STACK_DEFAULT } from "@/lib/styles";

export default function FAQSection() {
    return (
        <Section id="faq" background="bg-muted/30">
            <StaggerInView className={SECTION_STACK_DEFAULT}>
                <FadeInUpBlock>
                    <SectionHeading
                        title="Veelgestelde vragen"
                        subtitle="Alles wat je wilt weten over SmartCool Care – duidelijk en eerlijk beantwoord."
                        titleClassName="text-4xl lg:text-5xl"
                    />
                </FadeInUpBlock>

                <FadeInUpBlock className={MAX_W_4XL_CENTER}>
                        <Accordion type="single" collapsible className="w-full space-y-4">
                            {faqItems.map((faq, index) => (
                                <AccordionItem
                                    key={index}
                                    value={`item-${index}`}
                                    className="border rounded-lg px-6 bg-card shadow-sm"
                                >
                                    <AccordionTrigger className="text-lg font-medium text-primary hover:no-underline py-6">
                                        {faq.question}
                                    </AccordionTrigger>
                                    <AccordionContent className="text-muted-foreground pb-6">
                                        {faq.answer}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                </FadeInUpBlock>
            </StaggerInView>
        </Section>
    );
}
