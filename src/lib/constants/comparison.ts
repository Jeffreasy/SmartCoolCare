
export type ComparisonValue = string | boolean | {
  value: string;
  highlight?: "green" | "red" | "orange";
  tooltip?: string;
  icon?: string;
  savings?: string;
};

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
        basis: {
            value: "€149",
            highlight: "green",
        },
        pro: {
            value: "€199",
            highlight: "green",
        },
        elite: {
            value: "€249",
            highlight: "green",
        },
        testo: {
            value: "€300-500",
            highlight: "red",
            tooltip: "51-151% duurder dan SmartCool PRO",
        },
        hobo: {
            value: "€200-400",
            highlight: "orange",
            tooltip: "0,5-101% duurder dan SmartCool PRO",
        },
    },
    {
        feature: "Maandelijkse kosten",
        basis: {
            value: "€0",
            icon: "✅",
        },
        pro: {
            value: "€0",
            icon: "✅",
        },
        elite: {
            value: "€0",
            icon: "✅",
        },
        testo: {
            value: "€10-20",
            icon: "💸",
        },
        hobo: {
            value: "€10-15",
            icon: "💸",
        },
    },
    {
        feature: "HACCP/GDP Compliant",
        basis: true,
        pro: true,
        elite: true,
        testo: true,
        hobo: true,
    },
    {
        feature: "Temperatuurmeting",
        basis: "NTC 10k (±0,5°C)",
        pro: "NTC 10k (±0,5°C)",
        elite: "NTC 10k + BME280",
        testo: "PT1000 (±0,3°C)",
        hobo: "Thermistor (±0,2°C)",
    },
    {
        feature: "Lokaal alarm (zoemer)",
        basis: false,
        pro: true,
        elite: true,
        testo: false,
        hobo: false,
    },
    {
        feature: "Deurdetectie",
        basis: false,
        pro: {
            value: "✅ Met alarm",
        },
        elite: {
            value: "✅ Met alarm",
        },
        testo: {
            value: "Optioneel",
            tooltip: "Vereist extra module",
        },
        hobo: false,
    },
    {
        feature: "Vocht monitoring",
        basis: false,
        pro: false,
        elite: {
            value: "✅ BME280",
            highlight: "green",
        },
        testo: {
            value: "€€€ Extra module vereist",
            highlight: "red",
        },
        hobo: {
            value: "Beperkt (apart device)",
            highlight: "orange",
        },
    },
    {
        feature: "Cloud platform",
        basis: "SmartCool Dashboard",
        pro: "SmartCool Dashboard",
        elite: "SmartCool Dashboard",
        testo: "Testo Cloud",
        hobo: "HOBOlink",
    },
    {
        feature: "Batterij backup",
        basis: false,
        pro: false,
        elite: {
            value: "✅ 3-6 mnd",
            highlight: "green",
        },
        testo: {
            value: "Beperkt (72u)",
            highlight: "orange",
        },
        hobo: "Ja",
    },
    {
        feature: "Repareerbaar",
        basis: "Soldeervrij",
        pro: "Soldeervrij",
        elite: "Soldeervrij",
        testo: "Sealed unit",
        hobo: "Sealed unit",
    },
    {
        feature: "Break-even periode",
        basis: "Direct",
        pro: "Direct",
        elite: "Direct",
        testo: "8-18 mnd",
        hobo: "6-14 mnd",
    },
    {
        feature: "3-jaar TCO",
        basis: "€149",
        pro: "€199",
        elite: "€249",
        testo: {
            value: "€660-1.220",
            savings: "↑ 232-513%",
        },
        hobo: {
            value: "€560-940",
            savings: "↑ 181-372%",
        },
        highlight: true,
    },
];
