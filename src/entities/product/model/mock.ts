import type { Product } from "./types";

/** Product 목업 시드 (entities/product/model). */
export const PRODUCT_SEED: Product[] = [
  { id: "p_001", name: "무선 노이즈캔슬링 헤드폰", sku: "EL-HP-001", category: "electronics", price: 289000, stock: 42, status: "active", createdAt: "2026-02-01T10:00:00+09:00" },
  { id: "p_002", name: "프리미엄 가죽 백팩", sku: "FA-BG-014", category: "fashion", price: 159000, stock: 7, status: "active", createdAt: "2026-03-12T10:00:00+09:00" },
  { id: "p_003", name: "스마트 LED 스탠드", sku: "HO-LT-022", category: "home", price: 64000, stock: 0, status: "out_of_stock", createdAt: "2026-01-20T10:00:00+09:00" },
  { id: "p_004", name: "비타민C 브라이트닝 세럼", sku: "BE-SR-009", category: "beauty", price: 38000, stock: 120, status: "active", createdAt: "2026-04-05T10:00:00+09:00" },
  { id: "p_005", name: "기계식 키보드 (적축)", sku: "EL-KB-031", category: "electronics", price: 119000, stock: 3, status: "active", createdAt: "2026-05-18T10:00:00+09:00" },
  { id: "p_006", name: "린넨 오버사이즈 셔츠", sku: "FA-SH-027", category: "fashion", price: 49000, stock: 31, status: "draft", createdAt: "2026-06-08T10:00:00+09:00" },
  { id: "p_007", name: "아로마 디퓨저 세트", sku: "HO-DF-005", category: "home", price: 72000, stock: 18, status: "active", createdAt: "2026-03-29T10:00:00+09:00" },
  { id: "p_008", name: "수분 진정 토너패드", sku: "BE-TP-016", category: "beauty", price: 24000, stock: 9, status: "active", createdAt: "2026-06-01T10:00:00+09:00" },
];
