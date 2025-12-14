import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckItem } from "./CheckItem";
import { pricingTiers } from "@/lib/constants/pricing";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { DemoModal } from "@/components/shared/DemoModal";

type PricingTier = typeof pricingTiers[number];

interface PricingCardProps {
    tier: PricingTier;
}

export function PricingCard({ tier }: PricingCardProps) {
    const isRecommended = tier.recommended;

    return (
        <motion.div
            whileHover={{ y: -8 }}
            transition={{ duration: 0.3 }}
            className="relative"
        >
            <Card className={cn(
                "h-full flex flex-col border-2 transition-all duration-300",
                isRecommended ? "border-accent shadow-2xl scale-105" : "border-border shadow-lg"
            )}>
                {isRecommended && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-white">
                        Aanbevolen
                    </Badge>
                )}

                <CardHeader className="text-center pb-8">
                    <CardTitle className="text-3xl font-bold text-primary">
                        {tier.name}
                    </CardTitle>
                    <div className="mt-6">
                        <span className="text-5xl font-bold text-primary">€{tier.price}</span>
                        <span className="text-muted-foreground ml-2">eenmalig</span>
                    </div>
                    <CardDescription className="mt-4 text-base">
                        {tier.idealFor}
                    </CardDescription>
                </CardHeader>

                <CardContent className="flex-1">
                    <ul className="space-y-4">
                        {tier.features.map((feature, index) => (
                            <li key={index}>
                                <CheckItem>{feature}</CheckItem>
                            </li>
                        ))}
                    </ul>
                </CardContent>

                <CardFooter className="mt-auto">
                    <DemoModal
                        triggerText="Gratis Demo Aanvragen"
                        triggerSize="lg"
                        triggerClassName={cn(
                            "w-full text-lg",
                            isRecommended
                                ? "bg-accent hover:bg-accent/90 text-white"
                                : "bg-primary hover:bg-primary/90"
                        )}
                    />
                </CardFooter>
            </Card>
        </motion.div>
    );
}
