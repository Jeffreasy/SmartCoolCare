import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { CheckItem } from "@/components/shared/CheckItem";
import { techSections } from "@/lib/constants/techSpecs";
import { motion } from "framer-motion";
import { staggerContainer, fadeInUp } from "@/lib/animations/variants";

export default function TechSpecsSection() {
    return (
        <Section id="techspecs" background="bg-muted/30">
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
                            Betrouwbare techniek, gebouwd voor de praktijk
                        </h2>
                        <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto">
                            Robuuste hardware en veilige software die 24/7 werkt – zonder complexe installatie.
                        </p>
                    </motion.div>

                    <motion.div variants={fadeInUp} className="max-w-4xl mx-auto">
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
                    </motion.div>
                </motion.div>
            </Container>
        </Section>
    );
}
