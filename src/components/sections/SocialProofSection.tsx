import { Section } from "@/components/layout/Section";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { stats, testimonials } from "@/lib/constants/socialProof";
import { Quote } from "lucide-react";
import { StaggerInView } from "@/components/shared/StaggerInView";
import { FadeInUpBlock } from "@/components/shared/FadeInUpBlock";
import { TEXT_MUTED_LEAD } from "@/lib/styles";

export default function SocialProofSection() {
    return (
        <Section id="socialproof">
            <StaggerInView className="space-y-20">
                    {/* Stats */}
                    <FadeInUpBlock className="text-center space-y-8">
                        <h2 className="text-4xl lg:text-5xl font-bold text-primary">
                            Getest en vertrouwd
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
                            {stats.map((stat, index) => (
                                <FadeInUpBlock
                                    key={index}
                                    className="space-y-2"
                                >
                                    <p className="text-5xl font-bold text-accent">{stat.value}</p>
                                    <p className={TEXT_MUTED_LEAD}>{stat.label}</p>
                                </FadeInUpBlock>
                            ))}
                        </div>
                    </FadeInUpBlock>

                    {/* Testimonials */}
                    <FadeInUpBlock className="space-y-8">
                        <h2 className="text-4xl lg:text-5xl font-bold text-primary text-center">
                            Wat onze pilotklanten zeggen
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {testimonials.map((testimonial, index) => (
                                <FadeInUpBlock key={index}>
                                    <Card className="h-full shadow-lg">
                                        <CardHeader>
                                            <Quote className="h-8 w-8 text-accent mb-4" />
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <p className={`${TEXT_MUTED_LEAD} italic`}>
                                                "{testimonial.quote}"
                                            </p>
                                            <div>
                                                <p className="font-semibold text-primary">{testimonial.author}</p>
                                                <CardDescription>{testimonial.role}</CardDescription>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </FadeInUpBlock>
                            ))}
                        </div>
                        <p className="text-center text-muted-foreground mt-8">
                            Eerste klanttestimonials beschikbaar vanaf Q1 2026 na succesvolle pilots.
                        </p>
                    </FadeInUpBlock>
            </StaggerInView>
        </Section>
    );
}
