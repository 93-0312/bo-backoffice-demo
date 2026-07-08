/**
 * Transaction(거래) 도메인 타입 (entities/transaction/model).
 *
 * 결제 백오피스의 "거래 상세 내역" 화면을 모델링한다. 한 거래(Transaction)는
 * 결제/구매자 정보를 갖고, 그 아래에 여러 STID 하위 거래(StidTx)를 포함한다.
 */
export type TransactionResult = "SUCCESS" | "FAILED" | "PENDING";
export type PaymentType = "SALE" | "AUTH" | "REFUND" | "CAPTURE";

/** STID 단위 하위 거래 (정산 분배 등) */
export interface StidTx {
  stid: string;
  transactedAt: string;
  sid: string;
  sellerName: string;
  productName: string;
  result: TransactionResult;
  currency: string;
  amount: number;
  balance: number;
}

export interface Transaction {
  /** 라우트 식별자(application id, 예: SPF000070M) */
  id: string;
  tid: string;
  transactedAt: string;
  mid: string;
  midName: string;
  orderNo: string;
  paymentType: PaymentType;
  result: TransactionResult;
  currency: string;
  amount: number;
  balance: number;
  diff: number;
  product: string;
  resultMessage: string;
  chargebackReason?: string;
  creditSlip?: string;
  /** 구매자/결제 수단 정보 */
  payMethod: string; // 예: Mobile Wallet
  payInstrument: string; // 예: Samsung Pay
  cardHolder?: string;
  cardNo?: string;
  installment: boolean;
  installmentMonths: string;
  authPay?: boolean;
  billingName: string;
  terminalId?: string;
  customerId: string;
  /** 하위 STID 거래 목록 */
  stids: StidTx[];
}

export const PAYMENT_TYPE_LABEL: Record<PaymentType, string> = {
  SALE: "승인",
  AUTH: "인증",
  REFUND: "환불",
  CAPTURE: "매입",
};

export const TRANSACTION_RESULT_LABEL: Record<TransactionResult, string> = {
  SUCCESS: "성공",
  FAILED: "실패",
  PENDING: "대기",
};
