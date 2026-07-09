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
 * 거래내역 조회 요청 파라미터(구 BO 계약의 실사용 부분집합).
 * 실제 API 는 startDate/endDate/각종 필터 코드까지 받지만, 데모에서 쓰는 것만 노출한다.
 */
export interface PgTransactionListParams {
  startDate?: string;
  endDate?: string;
  /** 거래유형 (SALE/REFUND ...) */
  type?: string;
  /** 상태 필터 (SUCCESS/PENDING ...) — 서버 파라미터명은 result */
  result?: string;
  /** 결제수단(scheme) 필터 */
  schemeCd?: string;
  /** 통합 검색(가맹점명·주문번호·거래번호·고객ID) */
  search?: string;
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
 * 거래 상세(구 BO `/transactionList/{tid}` 화면) 데이터.
 * 목록 필드 + 상세 화면에만 있는 필드들. 값 연동은 이후 단계 — 지금은 레이아웃/필드 구조용.
 */
export interface PgTransactionDetail extends PgTransaction {
  // 거래 정보
  productName?: string; // 상품
  balance?: number; // 잔액
  chargebackReason?: string; // 차지백 접수 사유
  resultMessage?: string; // 거래 결과 메세지
  creditCardReceipt?: string; // 신용카드 전표
  // 구매자 정보
  inflowCountry?: string; // 카드 소유자 유입국가
  installmentYn?: string; // 할부결제 여부
  installmentMonths?: string; // 할부 개월 수
  authPaymentType?: string; // 인증결제 유형
  billingName?: string; // 청구명
  cardTerminalId?: string; // 카드 단말기 ID
  // 요청/응답 정보
  seq?: string; // 순번
  processorName?: string; // 프로세서 명
  redirectUrl?: string; // 리다이렉트 URL
  authCode?: string; // 인증코드
  requestedAt?: string; // 요청 시간
  requestUrl?: string; // 요청 URL
  responseCode?: string; // 응답 코드
  respondedAt?: string; // 응답 시간
  tdsPartner?: string; // 3Ds 파트너
  acquireCurrency?: string; // 매입 통화
  acquireAmount?: number; // 매입 금액
  mixedAmountMoney?: number; // 복합 금액(머니)
  mixedAmountCard?: number; // 복합 금액(카드)
  // Refund
  refundDatePeriod?: string; // Refund Date (period)
  refundYn?: string; // Refund
  partialRefundYn?: string; // Partial Refund
}
