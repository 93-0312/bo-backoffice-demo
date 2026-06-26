import type { SellerTransaction } from "./types";

/** 분할정산 거래내역 목업 시드. */
export const SELLER_TX_SEED: SellerTransaction[] = [
  { id: "stx_01", stid: "STID00000124", transactedAt: "2026-06-24 11:25:24", sellerOrderId: "SOID-77410", sid: "gamsgo_01", sellerName: "감스고", mid: "24020005", midName: "Gamsgo_KRW", tid: "260224112509GO00lysh", orderId: "OID-2630001", type: "SALE", state: "SUCCESS", currency: "KRW", amount: 34449, payverse: false },
  { id: "stx_02", stid: "STID00000125", transactedAt: "2026-06-24 11:25:24", sellerOrderId: "SOID-77411", sid: "gamsgo_02", sellerName: "감스고", mid: "24020005", midName: "Gamsgo_KRW", tid: "260224112509GO00lysh", orderId: "OID-2630002", type: "SALE", state: "SUCCESS", currency: "KRW", amount: 22000, payverse: false },
  { id: "stx_03", stid: "STID00000126", transactedAt: "2026-06-23 09:30:01", sellerOrderId: "SOID-77280", sid: "neostore_01", sellerName: "네오스토어", mid: "24020011", midName: "NeoStore_KRW", tid: "260223093001GO00xyz9", orderId: "OID-2629888", type: "REFUND", state: "SUCCESS", currency: "KRW", amount: 15900, payverse: false },
  { id: "stx_04", stid: "STID00000127", transactedAt: "2026-06-22 18:02:11", sellerOrderId: "SOID-77150", sid: "marketplus_02", sellerName: "마켓플러스", mid: "24020023", midName: "MarketPlus_KRW", tid: "260222180211GO00abc1", orderId: "OID-2629500", type: "SALE", state: "DECLINE", currency: "KRW", amount: 48000, payverse: true },
  { id: "stx_05", stid: "STID00000128", transactedAt: "2026-06-22 14:48:30", sellerOrderId: "SOID-77090", sid: "digitalhub_01", sellerName: "디지털허브", mid: "24020045", midName: "DigitalHub_USD", tid: "260222144830GO00usd2", orderId: "OID-2629400", type: "SALE", state: "SUCCESS", currency: "USD", amount: 129, payverse: false },
  { id: "stx_06", stid: "STID00000129", transactedAt: "2026-06-21 10:15:00", sellerOrderId: "SOID-76980", sid: "digitalhub_02", sellerName: "디지털허브", mid: "24020045", midName: "DigitalHub_USD", tid: "260221101500GO00usd3", orderId: "OID-2629200", type: "SALE", state: "SUCCESS", currency: "USD", amount: 59, payverse: true },
  { id: "stx_07", stid: "STID00000130", transactedAt: "2026-06-20 20:40:12", sellerOrderId: "SOID-76800", sid: "gamsgo_01", sellerName: "감스고", mid: "24020005", midName: "Gamsgo_KRW", tid: "260220204012GO00lm45", orderId: "OID-2628900", type: "SALE", state: "SUCCESS", currency: "KRW", amount: 12449, payverse: false },
];
