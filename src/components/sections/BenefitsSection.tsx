import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";
import { benefits } from "@/lib/constants/benefits";
import { motion } from "framer-motion";
import { staggerContainer, fadeInUp } from "@/lib/animations/variants";

export default function BenefitsSection() {
    return (
        <Section id="benefits" background="bg-muted/30">
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
                            Waarom kiezen voor SmartCool Care?
                        </h2>
                        <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto">
                            Praktische voordelen die direct impact hebben op jouw dagelijkse werkzaamheden en budget.
                        </p>
                    </motion.div>

                    <motion.div
                        variants={staggerContainer}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto"
                    >
                        {benefits.map((benefit, index) => (
                            <motion.div
                                key={index}
                                variants={fadeInUp}
                                className="flex flex-col gap-4 p-8 bg-card rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
                            >
                                <h3 className="text-2xl font-semibold text-primary">
                                    {benefit.title}
                                </h3>
                                <p className="text-base sm:text-lg text-muted-foreground flex-1">
                                    {benefit.description}
                                </p>
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.div>
            </Container>
        </Section>
    );
}
