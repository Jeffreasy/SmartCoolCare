import { Section } from "@/components/layout/Section";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { comparisonFeatures } from "@/lib/constants/comparison";
import type { ComparisonFeature, ComparisonValue } from "@/lib/constants/comparison";
import { cn } from "@/lib/utils";
import { Check, X, Info } from "lucide-react";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { StaggerInView } from "@/components/shared/StaggerInView";
import { FadeInUpBlock } from "@/components/shared/FadeInUpBlock";
import { SECTION_STACK_DEFAULT, TEXT_MUTED_LEAD } from "@/lib/styles";

const columns = ["Feature", "SmartCool BASIS", "SmartCool PRO", "SmartCool ELITE", "Testo", "HOBO"] as const;

function renderComparisonValue(value: ComparisonValue) {
    if (typeof value === "boolean") {
        return value ? (
            <Check className="h-5 w-5 text-accent mx-auto" />
        ) : (
            <X className="h-5 w-5 text-alert mx-auto" />
        );
    }

    if (typeof value === "object") {
        const { value: displayValue, highlight, tooltip, icon, savings } = value;
        
        const colorClass = highlight === "green" 
            ? "text-accent font-semibold" 
            : highlight === "red" 
            ? "text-alert font-semibold" 
            : highlight === "orange"
            ? "text-orange-600 font-semibold"
            : "";

        const content = (
            <span className={cn("inline-flex items-center gap-1", colorClass)}>
                {icon && <span>{icon}</span>}
                {displayValue}
                {savings && <span className="text-xs ml-1 text-alert">{savings}</span>}
            </span>
        );

        if (tooltip) {
            return (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <span className="inline-flex items-center gap-1 cursor-help">
                                {content}
                                <Info className="h-4 w-4 text-muted-foreground inline" />
                            </span>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{tooltip}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            );
        }

        return content;
    }

    return value;
}

export default function FeatureComparisonSection() {
    return (
        <Section id="comparison">
            <StaggerInView className={SECTION_STACK_DEFAULT}>
                <FadeInUpBlock>
                    <SectionHeading
                        title="Waarom zorginstellingen overstappen naar SmartCool Care"
                        subtitle={
                            <>
                                50-70% lagere TCO dan Testo/HOBO, meer preventieve features en geen abonnementsverplichtingen.
                            </>
                        }
                        titleClassName="text-4xl lg:text-5xl"
                    />
                </FadeInUpBlock>

                <FadeInUpBlock className="overflow-x-auto">
                        <Table className="min-w-full">
                            <TableHeader>
                                <TableRow className="border-b-2 border-primary">
                                    {columns.map((column) => (
                                        <TableHead
                                            key={column}
                                            className={cn(
                                                "text-left font-semibold text-lg py-6",
                                                column.includes("SmartCool") && "text-center text-accent",
                                                column === "SmartCool PRO" && "bg-accent/10"
                                            )}
                                        >
                                            <div className="flex flex-col items-center gap-2">
                                                {column}
                                                {column === "SmartCool PRO" && (
                                                    <Badge className="bg-accent text-white">Aanbevolen</Badge>
                                                )}
                                            </div>
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {comparisonFeatures.map((row: ComparisonFeature, index: number) => (
                                    <TableRow
                                        key={index}
                                        className={cn(
                                            "border-b",
                                            row.highlight && "bg-accent/5 font-semibold"
                                        )}
                                    >
                                        <TableCell className="py-6 font-medium">{row.feature}</TableCell>
                                        <TableCell className="text-center py-6">{renderComparisonValue(row.basis)}</TableCell>
                                        <TableCell className="text-center py-6 bg-accent/5">{renderComparisonValue(row.pro)}</TableCell>
                                        <TableCell className="text-center py-6">{renderComparisonValue(row.elite)}</TableCell>
                                        <TableCell className="text-center py-6 text-muted-foreground">{renderComparisonValue(row.testo)}</TableCell>
                                        <TableCell className="text-center py-6 text-muted-foreground">{renderComparisonValue(row.hobo)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                </FadeInUpBlock>

                <FadeInUpBlock className="space-y-4">
                    <div className={cn(TEXT_MUTED_LEAD, "text-left space-y-3")}>
                        <p className="font-semibold text-foreground">3-jaar TCO berekening:</p>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                            <li>Eenmalige aanschafkosten apparaat</li>
                            <li>Maandelijkse abonnementskosten (cloud platform + support)</li>
                            <li>Geschat energieverbruik batterijen/stroomadapters</li>
                            <li>Geen berekening voor uitval-/onderhoudskosten (variabel per merk)</li>
                        </ul>
                        <p className="flex items-center gap-2 font-medium text-accent mt-4">
                            <span className="text-2xl">💡</span>
                            <span>65% van zorginstellingen kiest PRO voor medicatiekoelkasten</span>
                        </p>
                    </div>
                    <div className="flex justify-center mt-6">
                        <Button size="lg" asChild>
                            <a href="#pricing">Bekijk prijzen en bestel direct</a>
                        </Button>
                    </div>
                </FadeInUpBlock>
            </StaggerInView>
        </Section>
    );
}
