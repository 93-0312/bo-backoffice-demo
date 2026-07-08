import type { Settlement } from "./types";

/** 정산 목업 시드 (정산 리스트 + 영중소 정산서). */
export const SETTLEMENT_SEED: Settlement[] = [
  { id: "stl_01", mid: "24020005", merchantName: "감스고코리아", merchantStatus: "LIVE", settlementType: "seller", sellerCount: 12, round: 220, settledAt: "2026-06-20", txCurrency: "KRW", settlementAmount: 18420000, settlementCurrency: "KRW", confirmedAmount: 18120000, state: "paid", holdAmount: 300000, isSme: false },
  { id: "stl_02", mid: "24020011", merchantName: "네오스토어", merchantStatus: "TEST", settlementType: "seller", sellerCount: 5, round: 100, settledAt: "2026-06-20", txCurrency: "KRW", settlementAmount: 4200000, settlementCurrency: "KRW", confirmedAmount: 4200000, state: "pending", holdAmount: 0, isSme: false },
  { id: "stl_03", mid: "24020023", merchantName: "마켓플러스", merchantStatus: "TERMINATE", settlementType: "seller", sellerCount: 0, round: 0, settledAt: "2026-05-31", txCurrency: "KRW", settlementAmount: 0, settlementCurrency: "KRW", confirmedAmount: 0, state: "hold", holdAmount: 150000, isSme: false },
  { id: "stl_04", mid: "24020031", merchantName: "스마트커머스", merchantStatus: "SUSPEND", settlementType: "mid", sellerCount: 3, round: 45, settledAt: "2026-06-19", txCurrency: "USD", settlementAmount: 9800, settlementCurrency: "USD", confirmedAmount: 9800, state: "paid", holdAmount: 0, isSme: false },
  { id: "stl_05", mid: "24020045", merchantName: "디지털허브", merchantStatus: "LIVE", settlementType: "seller", sellerCount: 8, round: 78, settledAt: "2026-06-20", txCurrency: "USD", settlementAmount: 15600, settlementCurrency: "USD", confirmedAmount: 15300, state: "paid", holdAmount: 300, isSme: false },
  // --- 영중소(SME) ---
  { id: "sme_01", mid: "24020005", merchantName: "감스고코리아", groupId: "GRP-0001", merchantStatus: "LIVE", settlementType: "seller", sellerCount: 12, round: 220, settledAt: "2026-06-20", txCurrency: "KRW", settlementAmount: 18420000, settlementCurrency: "KRW", confirmedAmount: 18120000, state: "paid", holdAmount: 120000, isSme: true },
  { id: "sme_02", mid: "24020011", merchantName: "네오스토어", groupId: "GRP-0002", merchantStatus: "TEST", settlementType: "seller", sellerCount: 5, round: 100, settledAt: "2026-06-20", txCurrency: "KRW", settlementAmount: 4200000, settlementCurrency: "KRW", confirmedAmount: 4200000, state: "pending", holdAmount: 0, isSme: true },
  { id: "sme_03", mid: "24020045", merchantName: "디지털허브", groupId: "GRP-0003", merchantStatus: "LIVE", settlementType: "mid", sellerCount: 8, round: 78, settledAt: "2026-06-20", txCurrency: "USD", settlementAmount: 15600, settlementCurrency: "USD", confirmedAmount: 15300, state: "paid", holdAmount: 100, isSme: true },
];
