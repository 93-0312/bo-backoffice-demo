/**
 * SID 도메인 타입 (entities/sid/model).
 *
 * "셀러 > 분할정산 > SID 리스트" 화면의 한 행 = 분할정산 셀러(SID) 등록 건.
 * SID 는 분할정산에서 정산 대상이 되는 셀러 식별자다(가맹점 MID 하위).
 */
export type SidStatus = "received" | "reviewing" | "approved" | "rejected";

export interface Sid {
  id: string;
  /** 가맹점 ID (MID) */
  mid: string;
  /** 셀러 식별자 */
  sellerId: string;
  /** 법인명 */
  corpName: string;
  /** 대표자명 */
  ceoName: string;
  /** 진행 상태 */
  status: SidStatus;
  /** 최초접수일 (YYYY-MM-DD) */
  receivedAt: string;
  /** 최종수정일 (YYYY-MM-DD) */
  updatedAt: string;
  /** MID 생성 여부 — 미생성이면 'MID 생성' 액션 노출 */
  midCreated: boolean;
}

export const SID_STATUS_LABEL: Record<SidStatus, string> = {
  received: "접수완료",
  reviewing: "심사중",
  approved: "승인",
  rejected: "반려",
};
