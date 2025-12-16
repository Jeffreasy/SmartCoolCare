import { Container } from "../layout/Container";
import { motion, useReducedMotion } from "framer-motion";
import { staggerContainer as baseStaggerContainer } from "@/lib/animations/variants";
import { DemoModal } from "@/components/shared/DemoModal";
import { DEMO_CTA_BUTTON } from "@/lib/styles";

export default function Hero() {
    const shouldReduceMotion = useReducedMotion();
    const staggerContainer = shouldReduceMotion
        ? { hidden: { opacity: 1 }, visible: { opacity: 1 } }
        : baseStaggerContainer;

    return (
        <div className="relative overflow-hidden min-h-screen flex items-center">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/60 via-background/80 to-accent/40" />

            <motion.div
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
                className="relative z-10 w-full py-20 lg:py-32 flex flex-col items-center text-center gap-12"
            >
                <Container>
                    <div className="relative text-center max-w-4xl mx-auto">
                        <div className="rounded-2xl bg-background/70 backdrop-blur-sm px-5 py-8 sm:px-6 sm:py-10 md:px-10 md:py-12">
                            <div className="flex justify-center mb-8">
                                <img
                                    src="/Logo Koelkasten.svg"
                                    alt="SmartCool Care Logo"
                                    className="h-16 w-auto sm:h-20 md:h-24"
                                />
                            </div>
                            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6 text-balance">
                                Bespaar <span className="text-primary">€500+</span> per jaar én voorkom
                                HACCP-boetes
                            </h1>
                            <p className="text-base sm:text-lg text-gray-600 mb-8 leading-relaxed">
                                Automatische 24/7 temperatuurregistratie voor zorginstellingen en horeca.
                                HACCP & GDP compliant, terugverdiend in 3 maanden. Vanaf €149 eenmalig,
                                geen abonnementen.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <DemoModal
                                    triggerText="Start Gratis Proefinstallatie"
                                    triggerClassName={DEMO_CTA_BUTTON}
                                />
                                <DemoModal
                                    triggerText="Bekijk 2-min Demo"
                                    triggerVariant="outline"
                                    triggerClassName="bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-200 hover:border-primary w-full sm:w-auto"
                                />
                            </div>
                        </div>
                    </div>
                </Container>
            </motion.div>
        </div>
    );
}
