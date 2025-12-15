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
    const badge = 'badge' in tier ? tier.badge : (isRecommended ? "Aanbevolen" : undefined);
    const ctaText = 'ctaText' in tier ? tier.ctaText : "Gratis Demo Aanvragen";
    const roi = 'roi' in tier ? tier.roi : undefined;
    const popularityLabel = 'popularityLabel' in tier ? tier.popularityLabel : undefined;

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
                {badge && (
                    <Badge className={cn(
                        "absolute -top-3 left-1/2 -translate-x-1/2 text-white",
                        isRecommended ? "bg-accent" : "bg-primary"
                    )}>
                        {badge}
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
                    <p className="text-sm text-muted-foreground mt-2">
                        vs. €560-€1.220 bij Testo/HOBO (3 jaar)
                    </p>
                    {roi && (
                        <p className="text-sm text-green-600 font-medium mt-1">
                            {roi}
                        </p>
                    )}
                    <CardDescription className="mt-4 text-base">
                        {tier.idealFor}
                    </CardDescription>
                    {popularityLabel && (
                        <p className="text-sm text-accent font-medium mt-2">
                            {popularityLabel}
                        </p>
                    )}
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
                        triggerText={ctaText}
                        triggerSize="lg"
                        tierName={tier.name}
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
