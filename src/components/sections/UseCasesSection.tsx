import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCases } from "@/lib/constants/useCases";
import { motion } from "framer-motion";
import { staggerContainer, fadeInUp } from "@/lib/animations/variants";
import { Hospital, Pill, Utensils, Shield } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { CheckItem } from "@/components/shared/CheckItem";

const iconMap: Record<string, LucideIcon> = {
    Zorginstellingen: Hospital,
    Apotheken: Pill,
    "Horeca & Restaurants": Utensils,
    "GGD & Ziekenhuizen": Shield,
};

export default function UseCasesSection() {
    return (
        <Section id="usecases" className="bg-muted/20">
            <Container>
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={staggerContainer}
                    className="space-y-10 sm:space-y-12"
                >
                    <motion.div variants={fadeInUp} className="text-center space-y-4">
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary">
                            Perfect voor jouw sector
                        </h2>
                        <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto">
                            Of je nu werkt in de zorg, apotheek, horeca of bij de GGD – SmartCool Care biedt betrouwbare 24/7 bewaking met snelle ROI.
                        </p>
                    </motion.div>

                    <motion.div
                        variants={staggerContainer}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8"
                    >
                        {useCases.map((useCase) => {
                            const Icon = iconMap[useCase.title] || Shield;

                            return (
                                <motion.div key={useCase.title} variants={fadeInUp}>
                                    <Card className="h-full flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300">
                                        <CardHeader className="text-center">
                                            <div className="p-4 rounded-full bg-accent/10 mx-auto w-fit">
                                                <Icon className="h-9 w-9 sm:h-10 sm:w-10 text-accent" />
                                            </div>
                                            <CardTitle className="text-2xl font-semibold text-primary mt-4">
                                                {useCase.title}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="flex-1">
                                            <ul className="space-y-3">
                                                {useCase.items.map((item, itemIndex) => (
                                                    <li key={itemIndex}>
                                                        <CheckItem>{item}</CheckItem>
                                                    </li>
                                                ))}
                                            </ul>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </motion.div>
            </Container>
        </Section>
    );
}
