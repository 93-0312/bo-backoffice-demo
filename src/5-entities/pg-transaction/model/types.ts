/**
 * PG 거래내역 도메인 타입 (entities/pg-transaction/model).
 *
 * 구 BO 의 거래내역 API(`/admin/transaction/listData`) 응답/요청 계약을 그대로 옮긴 것.
 * 필드명은 서버 응답 그대로 유지한다(매핑 레이어 없이 계약을 신뢰).
 */

/** 거래 상태 — 서버가 문자열로 내려주며, 대표값 외의 값도 올 수 있어 string 확장 */
export type PgTransactionStatus =
  | "SUCCESS"
  | "PENDING"
  | "FAILED"
  | "CANCELLED"
  | (string & {});

/** 거래내역 한 건 (응답 list[] 요소) */
export interface PgTransaction {
  rownum: number;
  transactId: string;
  transactDate: string;
  merchantId: string;
  merchantName: string;
  hostingName: string;
  transactOrderId: string;
  transactTypeName: string; // SALE / REFUND ...
  transactStatusName: PgTransactionStatus;
  transactProcessCurrency: string;
  transactProcessAmount: number;
  transactSchemeName: string; // PayPal / Visa / Master ...
  transactCardNo: string;
  transactCardHolder: string | null;
  methodDisplayName: string;
  transactRequestCurrency: string;
  transactRequestAmount: number;
  partnerTid: string | null;
  customerId: string;
  transCountryCd: string;
  transCountryNm: string;
}

/**
 * 거래내역 조회 요청 파라미터 — 구 BO listData body 계약 전체.
 * 필드명은 서버 계약 그대로(page 쪽 필터 키와의 매핑은 page 가 담당).
 */
export interface PgTransactionListParams {
  /** true 면 기간 조건 없이 전체 조회(구 BO "일자 해제" 체크박스) */
  allTime?: boolean;
  startDate?: string;
  endDate?: string;
  /** 계약법인 코드 */
  contractDataCode?: string;
  /** 영업법인 코드 */
  branchDataCode?: string;
  /** 거래유형 (SALE/REFUND ...) */
  type?: string;
  /** 상태 필터 (SUCCESS/PENDING ...) — 서버 파라미터명은 result */
  result?: string;
  /** 결제수단(scheme) 필터 */
  schemeCd?: string;
  /** 거래환경 (PC/MOBILE ...) */
  environmentType?: string;
  /** 프로세서(파트너) 코드 */
  partnerCd?: string;
  /** 통화 코드 (USD/KRW ...) */
  currencyCode?: string;
  /** 검색어를 적용할 대상 필드(구 BO "필터" 셀렉트) */
  filter?: string;
  /** 통합 검색(가맹점명·주문번호·거래번호·고객ID) */
  search?: string;
  /** UTC 오프셋(시간) — 서버 계약은 문자열, 기본 "9"(KST) */
  timeZone?: string;
  excludePayverse?: boolean;
  excludePaypalReferral?: boolean;
  page: number; // 1-based
  rows: number; // 페이지 크기
  locale?: string;
}

/** 구 BO 공통 응답 봉투 */
export interface ApiEnvelope<T> {
  status: { status: number; code: string; message: string };
  res_msg: string;
  count: number; // 필터 후 전체 건수
  totalPage: number;
  list: T[];
}

export type PgTransactionListResponse = ApiEnvelope<PgTransaction>;

/**
 * 거래 상세 응답 (구 BO `GET /admin/transaction/detail?transactId=`).
 *
 * 3덩어리: 헤더 그룹(transactGroupList) + 본문(transactDetails) + 리펀드 플래그(transactCheck).
 * 필드명은 서버 응답 그대로. ⚠️ 리뉴얼 시 API 개수·키/구성이 바뀔 수 있어 optional 로 둔다.
 */
export interface PgTransactionGroupItem {
  transactId: string;
  transactDate: string;
  merchantId: string;
  merchantName: string;
  transactOrderId: string;
  transactTypeName: string;
  transactStatusName: PgTransactionStatus;
  transactProcessCurrency: string;
  transactProcessAmount: number;
  transactSchemeName: string;
  transactCardNo: string;
  transactCardHolder: string;
  customerId: string;
  regionName: string;
  regionDisplayName: string;
  methodName: string;
  methodDisplayName: string;
  transactRequestCurrency: string;
  transactRequestAmount: number;
  countryCode: string | null;
}

export interface PgTransactionDetails {
  merchantId?: string;
  merchantName?: string;
  transactOrderId?: string;
  transactStatusName?: PgTransactionStatus;
  transactProductName?: string;
  remainPartnerAmount?: number;
  remainRequestAmount?: number;
  transactRequestAmount?: number;
  transactPartnerAmount?: number;
  transactRequestCurrency?: string;
  transactPartnerCurrency?: string;
  transactCustomerId?: string;
  transactSchemeCd?: string;
  transactSchemeName?: string;
  transactCountryName?: string;
  transactCardNo?: string;
  transactCardHolder?: string;
  transactExchangeRate?: number;
  merchantDescriptor1?: string;
  merchantPartnerCd?: string;
  merchantPartnerMid?: string;
  transactId?: string;
  transactType?: string;
  partnerName?: string;
  transactSecureType?: string;
  transactSecureDisplayName?: string | null;
  transactApprovalNo?: string;
  transactRedirectUrl?: string;
  transactRequestUrl?: string;
  transactRequestDatetime?: string;
  transactPartnerDatetime?: string;
  transactResultCode?: string;
  transactResultMessage?: string;
  installmentMonths?: string;
  cardTerminalId?: string | null;
  customerId?: string;
  method?: string;
  methodName?: string;
  secureName?: string;
  appCardAmt?: number;
  appMoneyAmt?: number;
  partialCcUse?: string;
  ccUse?: string;
  refundPeriod?: number;
  webHookLogExists?: boolean;
  payCurrCd?: string;
  transAmt?: number;
  totalPayAmt?: number;
  costAmt?: number;
  decimal?: number;
  [key: string]: unknown; // 미매핑 필드 허용(리뉴얼 대비)
}

export interface PgTransactionCheck {
  transactRefund: boolean;
  transactChargeback: boolean;
  transactReversal: boolean;
  transactGroupCnt: number;
}

export interface PgTransactionDetailResponse {
  status: { status: number; code: string; message: string };
  transactGroupList: PgTransactionGroupItem[];
  transactDetails: PgTransactionDetails;
  transactCheck: PgTransactionCheck;
}
