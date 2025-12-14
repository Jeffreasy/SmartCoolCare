import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";
import { DemoModal } from "@/components/shared/DemoModal";
import { motion } from "framer-motion";
import { staggerContainer, fadeInUp } from "@/lib/animations/variants";

export default function CTABanner() {
    return (
        <Section
            id="cta"
            className="relative overflow-hidden bg-gradient-to-b from-primary/10 via-background to-background"
        >
            <Container>
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={staggerContainer}
                    className="space-y-10 sm:space-y-14"
                >
                    <motion.div variants={fadeInUp} className="text-center space-y-6 max-w-4xl mx-auto">
                        <h2 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-shadow-light">
                            Klaar voor betrouwbare koelkastbewaking zonder abonnement?
                        </h2>
                        <p className="text-base sm:text-lg lg:text-xl text-muted-foreground">
                            Vraag nu een gratis demo aan en ontdek hoe SmartCool Care jouw compliance vereenvoudigt.
                        </p>
                    </motion.div>

                    <motion.div variants={fadeInUp} className="flex justify-center">
                        <DemoModal
                            triggerText="Gratis Demo Aanvragen"
                            triggerClassName="bg-accent hover:bg-accent/90 text-white w-full sm:w-auto px-10"
                        />
                    </motion.div>

                    <motion.div
                        variants={fadeInUp}
                        className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 text-center text-sm sm:text-base"
                    >
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
                    </motion.div>

                    <motion.div variants={fadeInUp} className="text-center text-base sm:text-lg text-muted-foreground">
                        <p>Pilotprogramma start Q1 2026 – beperkte plekken beschikbaar.</p>
                    </motion.div>
                </motion.div>
            </Container>
        </Section>
    );
}
