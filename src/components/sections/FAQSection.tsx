import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { faqItems } from "@/lib/constants/faq";
import { motion } from "framer-motion";
import { staggerContainer, fadeInUp } from "@/lib/animations/variants";

export default function FAQSection() {
    return (
        <Section id="faq" background="bg-muted/30">
            <Container>
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={staggerContainer}
                    className="space-y-12"
                >
                    <motion.div variants={fadeInUp} className="text-center space-y-4">
                        <h2 className="text-4xl lg:text-5xl font-bold text-primary">
                            Veelgestelde vragen
                        </h2>
                        <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto">
                            Alles wat je wilt weten over SmartCool Care – duidelijk en eerlijk beantwoord.
                        </p>
                    </motion.div>

                    <motion.div variants={fadeInUp} className="max-w-4xl mx-auto">
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
                    </motion.div>
                </motion.div>
            </Container>
        </Section>
    );
}
