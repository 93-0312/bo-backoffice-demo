/**
 * 정산 도메인 타입 (entities/settlement/model).
 *
 * "정산 리스트"와 "영중소 정산서 목록"이 공유하는 정산 레코드.
 * 영중소(SME)는 그룹ID·영중소 지급보류금이 추가되는 변형이다.
 */
export type MerchantStatus = "LIVE" | "TEST" | "TERMINATE" | "SUSPEND";
export type SettlementType = "seller" | "mid";
export type SettlementState = "paid" | "pending" | "hold";

export interface Settlement {
  id: string;
  mid: string;
  merchantName: string;
  /** 영중소 그룹ID (SME 전용) */
  groupId?: string;
  merchantStatus: MerchantStatus;
  settlementType: SettlementType;
  /** 셀러 수 */
  sellerCount: number;
  /** 정산 회차 */
  round: number;
  /** 정산일자 (YYYY-MM-DD) */
  settledAt: string;
  txCurrency: string;
  settlementAmount: number;
  settlementCurrency: string;
  confirmedAmount: number;
  state: SettlementState;
  /** 지급보류금 */
  holdAmount: number;
  /** 영중소 정산서 여부 */
  isSme: boolean;
}

export const MERCHANT_STATUS_LABEL: Record<MerchantStatus, string> = {
  LIVE: "LIVE",
  TEST: "TEST",
  TERMINATE: "해지",
  SUSPEND: "정지",
};

export const SETTLEMENT_TYPE_LABEL: Record<SettlementType, string> = {
  seller: "셀러별정산",
  mid: "MID정산",
};

export const SETTLEMENT_STATE_LABEL: Record<SettlementState, string> = {
  paid: "지급 완료",
  pending: "지급 대기",
  hold: "지급 보류",
};
