import { Section } from "@/components/layout/Section";
import { pricingTiers } from "@/lib/constants/pricing";
import { PricingCard } from "@/components/shared/PricingCard";
import { motion } from "framer-motion";
import { staggerContainer, fadeInUp } from "@/lib/animations/variants";

export default function PricingSection() {
    return (
        <Section id="pricing" className="bg-gradient-to-b from-transparent to-muted/30">
            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={staggerContainer}
                className="text-center space-y-12"
            >
                <motion.div variants={fadeInUp} className="space-y-4">
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary">
                        Kies jouw variant
                    </h2>
                    <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto">
                        Drie eenvoudige tiers – geen verborgen kosten, geen abonnementen.
                        De PRO variant is het meest gekozen door zorginstellingen en apotheken.
                    </p>
                </motion.div>

                <motion.div
                    variants={staggerContainer}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto"
                >
                    {pricingTiers.map((tier) => (
                        <motion.div key={tier.name} variants={fadeInUp}>
                            <PricingCard tier={tier} />
                        </motion.div>
                    ))}
                </motion.div>
            </motion.div>
        </Section>
    );
}
