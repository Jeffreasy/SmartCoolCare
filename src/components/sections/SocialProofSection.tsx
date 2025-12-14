import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { stats, testimonials } from "@/lib/constants/socialProof";
import { motion } from "framer-motion";
import { staggerContainer, fadeInUp } from "@/lib/animations/variants";
import { Quote } from "lucide-react";

export default function SocialProofSection() {
    return (
        <Section id="socialproof">
            <Container>
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={staggerContainer}
                    className="space-y-20"
                >
                    {/* Stats */}
                    <motion.div variants={fadeInUp} className="text-center space-y-8">
                        <h2 className="text-4xl lg:text-5xl font-bold text-primary">
                            Getest en vertrouwd
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
                            {stats.map((stat, index) => (
                                <motion.div
                                    key={index}
                                    variants={fadeInUp}
                                    className="space-y-2"
                                >
                                    <p className="text-5xl font-bold text-accent">{stat.value}</p>
                                    <p className="text-base sm:text-lg text-muted-foreground">{stat.label}</p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Testimonials */}
                    <motion.div variants={fadeInUp} className="space-y-8">
                        <h2 className="text-4xl lg:text-5xl font-bold text-primary text-center">
                            Wat onze pilotklanten zeggen
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {testimonials.map((testimonial, index) => (
                                <motion.div key={index} variants={fadeInUp}>
                                    <Card className="h-full shadow-lg">
                                        <CardHeader>
                                            <Quote className="h-8 w-8 text-accent mb-4" />
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <p className="text-base sm:text-lg italic text-muted-foreground">
                                                "{testimonial.quote}"
                                            </p>
                                            <div>
                                                <p className="font-semibold text-primary">{testimonial.author}</p>
                                                <CardDescription>{testimonial.role}</CardDescription>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                        <p className="text-center text-muted-foreground mt-8">
                            Eerste klanttestimonials beschikbaar vanaf Q1 2026 na succesvolle pilots.
                        </p>
                    </motion.div>
                </motion.div>
            </Container>
        </Section>
    );
}
