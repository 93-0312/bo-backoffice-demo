/**
 * 분할정산 거래내역 도메인 타입 (entities/seller-transaction/model).
 *
 * "셀러 > 분할정산 > 거래내역" 화면의 한 행 = STID 단위 셀러 거래.
 * 기존 entities/transaction(가맹점 TID 단위)과 달리, 분할정산은 셀러(SID)·STID 관점이다.
 */
export type SellerTxType = "SALE" | "REFUND";
export type SellerTxState = "SUCCESS" | "DECLINE" | "PENDING";

export interface SellerTransaction {
  id: string;
  stid: string;
  transactedAt: string;
  /** 셀러주문ID */
  sellerOrderId: string;
  sid: string;
  sellerName: string;
  mid: string;
  midName: string;
  tid: string;
  /** 주문ID */
  orderId: string;
  type: SellerTxType;
  state: SellerTxState;
  currency: string;
  amount: number;
  /** 상품명 (환불 모달 표시용) */
  productName: string;
  /** 환불 가능 금액 (이미 일부 환불됐으면 amount 보다 작음) */
  refundableAmount: number;
  /** 페이버스 결제 여부 ('페이버스 결제 제외' 필터용) */
  payverse: boolean;
}

export const SELLER_TX_TYPE_LABEL: Record<SellerTxType, string> = {
  SALE: "승인",
  REFUND: "환불",
};

export const SELLER_TX_STATE_LABEL: Record<SellerTxState, string> = {
  SUCCESS: "성공",
  DECLINE: "거절",
  PENDING: "대기",
};
