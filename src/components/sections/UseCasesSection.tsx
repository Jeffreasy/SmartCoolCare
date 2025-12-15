import { Section } from "@/components/layout/Section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCases } from "@/lib/constants/useCases";
import { Hospital, Pill, Utensils, Shield } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { CheckItem } from "@/components/shared/CheckItem";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { StaggerInView } from "@/components/shared/StaggerInView";
import { FadeInUpBlock } from "@/components/shared/FadeInUpBlock";
import { StaggerGrid } from "@/components/shared/StaggerGrid";
import { HOVER_SHADOW_LG } from "@/lib/styles";

const iconMap: Record<string, LucideIcon> = {
    Zorginstellingen: Hospital,
    Apotheken: Pill,
    "Horeca & Restaurants": Utensils,
    "GGD & Ziekenhuizen": Shield,
};

export default function UseCasesSection() {
    return (
        <Section id="usecases" className="bg-muted/20">
            <StaggerInView className="space-y-10 sm:space-y-12">
                <FadeInUpBlock>
                    <SectionHeading
                        title="Perfect voor jouw sector"
                        subtitle="Of je nu werkt in de zorg, apotheek, horeca of bij de GGD – SmartCool Care biedt betrouwbare 24/7 bewaking met snelle ROI."
                    />
                </FadeInUpBlock>

                <StaggerGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                        {useCases.map((useCase) => {
                            const Icon = iconMap[useCase.title] || Shield;

                            return (
                                <FadeInUpBlock key={useCase.title}>
                                    <Card className={`h-full flex flex-col ${HOVER_SHADOW_LG}`}>
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
                                </FadeInUpBlock>
                            );
                        })}
                </StaggerGrid>
            </StaggerInView>
        </Section>
    );
}
