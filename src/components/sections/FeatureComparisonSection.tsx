import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { comparisonFeatures } from "@/lib/constants/comparison";
import type { ComparisonFeature, ComparisonValue } from "@/lib/constants/comparison";
import { motion } from "framer-motion";
import { staggerContainer, fadeInUp } from "@/lib/animations/variants";
import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";

const columns = ["Feature", "SmartCool BASIS", "SmartCool PRO", "SmartCool ELITE", "Testo", "HOBO"] as const;

function renderComparisonValue(value: ComparisonValue) {
    if (typeof value === "boolean") {
        return value ? (
            <Check className="h-5 w-5 text-accent mx-auto" />
        ) : (
            <X className="h-5 w-5 text-alert mx-auto" />
        );
    }

    return value;
}

export default function FeatureComparisonSection() {
    return (
        <Section id="comparison">
            <Container>
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={staggerContainer}
                    className="space-y-12"
                >
                    <motion.div variants={fadeInUp} className="text-center space-y-4">
                        <h2 className="text-4xl lg:text-5xl font-bold text-primary">
                            Waarom SmartCool Care de beste keuze is
                        </h2>
                        <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto">
                            Vergelijk onze varianten met de gevestigde concurrentie.
                            Lagere kosten, meer features en geen lock-in.
                        </p>
                    </motion.div>

                    <motion.div variants={fadeInUp} className="overflow-x-auto">
                        <Table className="min-w-full">
                            <TableHeader>
                                <TableRow className="border-b-2 border-primary">
                                    {columns.map((column) => (
                                        <TableHead
                                            key={column}
                                            className={cn(
                                                "text-left font-semibold text-lg py-6",
                                                column.includes("SmartCool") && "text-center text-accent"
                                            )}
                                        >
                                            {column === "SmartCool PRO" && (
                                                <Badge className="ml-2 bg-accent text-white">Aanbevolen</Badge>
                                            )}
                                            {column}
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
                                        <TableCell className="text-center py-6">{renderComparisonValue(row.pro)}</TableCell>
                                        <TableCell className="text-center py-6">{renderComparisonValue(row.elite)}</TableCell>
                                        <TableCell className="text-center py-6 text-muted-foreground">{renderComparisonValue(row.testo)}</TableCell>
                                        <TableCell className="text-center py-6 text-muted-foreground">{renderComparisonValue(row.hobo)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </motion.div>

                    <motion.div variants={fadeInUp} className="text-center">
                        <p className="text-base sm:text-lg text-muted-foreground">
                            * 3-jaar Total Cost of Ownership berekend inclusief abonnementen bij concurrenten
                        </p>
                    </motion.div>
                </motion.div>
            </Container>
        </Section>
    );
}
