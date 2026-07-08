import type { DashboardRenewalData } from "./types";

/**
 * Figma 시안 placeholder($NN, $Method$, mm/dd)를 그대로 둔 시드 데이터.
 * 실서비스에서는 api 레이어가 서버 응답으로 대체한다.
 */
export const DASHBOARD_RENEWAL_SEED: DashboardRenewalData = {
  topInfo: {
    monthlyVolumeDisplay: "$10.078",
    monthlyVolumeDecimals: "73",
    volumeMoM: 13.4,
    monthlyCountDisplay: "10",
    monthlyCountDecimals: "000",
    countMoM: 3,
    lastUpdate: "Today",
    currencies: ["All (KRW)", "All (USD)", "KRW", "USD", "JPY", "EUR"],
    currency: "All (KRW)",
  },

  trend: {
    amountUnitLabel: "Unit: 10,000 KRW",
    countUnitLabel: "Unit: 100 TXs",
    recent7d: [
      { label: "06/25", amount: 3_050_000, count: 8_200 },
      { label: "06/26", amount: 3_420_000, count: 9_100 },
      { label: "06/27", amount: 3_180_000, count: 9_800 },
      { label: "06/28", amount: 3_600_000, count: 11_200 },
      { label: "06/29", amount: 2_140_000, count: 11_600 },
      { label: "06/30", amount: 3_410_000, count: 12_100 },
      { label: "Today", amount: 3_820_000, count: 12_600 },
    ],
    recent6m: [
      { label: "26.01", amount: 74_200_000, count: 301_000 },
      { label: "26.02", amount: 68_900_000, count: 288_000 },
      { label: "26.03", amount: 81_400_000, count: 322_000 },
      { label: "26.04", amount: 77_800_000, count: 310_000 },
      { label: "26.05", amount: 88_100_000, count: 341_000 },
      { label: "26.06", amount: 92_600_000, count: 355_000 },
    ],
  },

  target: {
    achievedRate: 75.8,
    refYearMonth: "2026.01",
    remainingDisplay: "$2,410,000",
    avgAmount6m: "$8,120,000",
    yesterdayVolume: "$341,000",
    averageDailyVolume: "$336,000",
  },

  topCountries: {
    lastUpdated: "yyyy.mm.dd-1",
    amountUnitLabel: "Unit: 10,000 KRW",
    countUnitLabel: "Unit: 100 TXs",
    byAmount: [
      {
        name: "China",
        amount: 480,
        count: 48,
        rawAmount: 3_600_000,
        rawCount: 12_000,
      },
      {
        name: "Japan",
        amount: 350,
        count: 34,
        rawAmount: 2_680_000,
        rawCount: 8_900,
      },
      {
        name: "USA",
        amount: 285,
        count: 27,
        rawAmount: 2_120_000,
        rawCount: 7_100,
      },
      {
        name: "Others",
        amount: 195,
        count: 18,
        rawAmount: 1_490_000,
        rawCount: 4_800,
      },
      {
        name: "S.Korea",
        amount: 90,
        count: 8,
        rawAmount: 720_000,
        rawCount: 2_100,
      },
    ],
    byCount: [
      {
        name: "China",
        amount: 480,
        count: 48,
        rawAmount: 3_600_000,
        rawCount: 12_000,
      },
      {
        name: "USA",
        amount: 285,
        count: 35,
        rawAmount: 2_120_000,
        rawCount: 9_200,
      },
      {
        name: "Others",
        amount: 195,
        count: 26,
        rawAmount: 1_490_000,
        rawCount: 6_900,
      },
      {
        name: "Japan",
        amount: 350,
        count: 19,
        rawAmount: 2_680_000,
        rawCount: 5_000,
      },
      {
        name: "S.Korea",
        amount: 90,
        count: 7,
        rawAmount: 720_000,
        rawCount: 1_900,
      },
    ],
  },

  notices: [
    { id: 1, badge: "alert", title: "${Error Message}$" },
    { id: 2, badge: "system", title: "${System Alert}$" },
    { id: 3, badge: "new", title: "${Recent Transaction}$" },
  ],

  payments: {
    lastUpdated: "yyyy.mm.dd-1",
    countries: [
      "All Countries",
      "United States",
      "Canada",
      "Mexico",
      "United Kingdom",
      "Australia",
      "Germany",
      "France",
      "Japan",
      "South Korea",
      "Brazil",
      "India",
      "South Africa",
      "Kenya",
      "Nigeria",
      "Ghana",
      "Egypt",
    ].map((country) => ({
      country,
      groups: [
        {
          key: "creditCard",
          label: "Credit Card",
          share: 90,
          methods: [
            { name: "$Method$", ratio: 45, amount: 3_600_000, count: 12_000 },
            { name: "$Method$", ratio: 25, amount: 2_000_000, count: 6_600 },
            { name: "$Method$", ratio: 18, amount: 1_440_000, count: 4_700 },
            { name: "$Method$", ratio: 12, amount: 960_000, count: 3_100 },
          ],
        },
        {
          key: "transfer",
          label: "Payment & Transfer",
          share: 10,
          methods: [
            { name: "$Method$", ratio: 52, amount: 416_000, count: 1_400 },
            { name: "$Method$", ratio: 22, amount: 176_000, count: 580 },
            { name: "$Method$", ratio: 12, amount: 96_000, count: 320 },
            { name: "$Method$", ratio: 6, amount: 48_000, count: 160 },
            { name: "$Method$", ratio: 4, amount: 32_000, count: 100 },
            { name: "$Method$", ratio: 2, amount: 16_000, count: 50 },
            { name: "$Method$", ratio: 1, amount: 8_000, count: 25 },
            { name: "$Method$", ratio: 1, amount: 8_000, count: 25 },
          ],
        },
      ],
    })),
  },
};
