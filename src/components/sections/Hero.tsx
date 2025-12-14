import { Container } from "../layout/Container";
import { motion, useReducedMotion } from "framer-motion";
import { staggerContainer as baseStaggerContainer } from "@/lib/animations/variants";
import { DemoModal } from "@/components/shared/DemoModal";

export default function Hero() {
    const shouldReduceMotion = useReducedMotion();
    const staggerContainer = shouldReduceMotion
        ? { hidden: { opacity: 1 }, visible: { opacity: 1 } }
        : baseStaggerContainer;

    return (
        <div className="relative overflow-hidden min-h-screen flex items-center">
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20 scale-105"
                style={{
                    backgroundImage:
                        "url('/assets/hero-bg.jpg')",
                }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/60 via-background/80 to-accent/40" />

            <motion.div
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
                className="relative z-10 py-20 lg:py-32 flex flex-col items-center text-center gap-12"
            >
                <Container>
                    <div className="relative text-center max-w-4xl mx-auto">
                        <div className="rounded-2xl bg-background/70 backdrop-blur-sm px-5 py-8 sm:px-6 sm:py-10 md:px-10 md:py-12">
                            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6 text-balance">
                                Professionele Koeling Monitoring voor{" "}
                                <span className="text-primary">€149</span>
                            </h1>
                            <p className="text-base sm:text-lg text-gray-600 mb-8 leading-relaxed">
                                HACCP & GDP compliant temperatuurmonitoring zonder abonnementskosten.
                                Soldeervrij, repareerbaar en direct te gebruiken.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <DemoModal
                                    triggerText="Gratis Demo Aanvragen"
                                    triggerClassName="bg-accent hover:bg-accent/90 text-white w-full sm:w-auto"
                                />
                                <DemoModal
                                    triggerText="Plan een Demo"
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
