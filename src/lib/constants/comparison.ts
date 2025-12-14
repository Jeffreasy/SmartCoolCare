
export type ComparisonValue = string | boolean;

export interface ComparisonFeature {
    feature: string;
    basis: ComparisonValue;
    pro: ComparisonValue;
    elite: ComparisonValue;
    testo: ComparisonValue;
    hobo: ComparisonValue;
    highlight?: boolean;
}

export const comparisonFeatures: ComparisonFeature[] = [
    {
        feature: "Eenmalige prijs",
        basis: "€149",
        pro: "€199",
        elite: "€249",
        testo: "€300-500",
        hobo: "€200-400",
    },
    {
        feature: "Maandelijkse kosten",
        basis: "€0",
        pro: "€0",
        elite: "€0",
        testo: "€10-20",
        hobo: "€10-15",
    },
    {
        feature: "Deurdetectie",
        basis: false,
        pro: true,
        elite: true,
        testo: false,
        hobo: false,
    },
    {
        feature: "Vocht monitoring",
        basis: false,
        pro: false,
        elite: true,
        testo: "€€€ extra",
        hobo: "€€€ extra",
    },
    {
        feature: "Batterij backup",
        basis: false,
        pro: false,
        elite: true,
        testo: "Beperkt",
        hobo: "Ja",
    },
    {
        feature: "3-jaar TCO",
        basis: "€149",
        pro: "€199",
        elite: "€249",
        testo: "€660-1.220",
        hobo: "€560-940",
        highlight: true,
    },
];
