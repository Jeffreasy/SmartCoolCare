export const pricingTiers = [
    {
        name: "BASIS",
        price: 149,
        recommended: false,
        color: "green",
        features: [
            "Temperatuurmeting (DS18B20, -55°C tot +125°C, ±0.5°C nauwkeurig)",
            "24/7 automatische logging (elke 15 min)",
            "Live cloud dashboard (Google Sheets)",
            "HTTPS beveiligde transmissie",
        ],
        idealFor: "Keukens, algemene opslag",
    },
    {
        name: "PRO",
        price: 199,
        recommended: true,
        color: "yellow",
        features: [
            "Alles van BASIS +",
            "Deurdetectie (Reed Switch MC-38)",
            "Lokaal alarm (Active Buzzer 5V)",
            "Cloud alerts bij temperatuur >7°C",
        ],
        idealFor: "Medicatiekoelkasten, zorginstellingen",
    },
    {
        name: "ELITE",
        price: 249,
        recommended: false,
        color: "red",
        features: [
            "Alles van PRO +",
            "Klimaatmonitoring (BME280: temp + vocht + luchtdruk)",
            "Batterij backup (18650 Li-Ion 3000mAh)",
            "Black Box functionaliteit bij stroomuitval",
        ],
        idealFor: "Vaccins, GGD, apotheken, IGJ audits",
    },
] as const;
