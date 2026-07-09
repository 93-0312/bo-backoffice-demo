import { useEffect, useState, type ReactNode } from "react";
import { useParams } from "react-router-dom";
import { Card, Button, Skeleton } from "@/shared/ui";
import { formatNumber } from "@/shared/lib";
import { Descriptions, type DescriptionItem } from "@/widgets/descriptions";
import {
  fetchPgTransactionDetail,
  PgTransactionStatusBadge,
  type PgTransactionDetail,
} from "@/entities/pg-transaction";

/**
 * PgTransactionDetailPage — 라우트 `/pg-transactions/:tid` (page).
 *
 * 구 BO `/transactionList/{tid}` 상세 화면의 레이아웃/필드 구조. 목록에서 거래번호를
 * 새 창으로 열어 진입한다. 값 연동은 이후 단계 — 상세 전용 필드는 빈 슬롯으로 구조만 잡는다.
 */

/** 섹션 제목 (ⓘ + 라벨) */
function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
      <span className="grid size-4 place-items-center rounded-full bg-foreground text-[10px] font-bold text-background">
        i
      </span>
      {children}
    </h2>
  );
}

/** 빈 값은 옅게 '-' 로 표시 */
const v = (value: ReactNode) =>
  value === undefined || value === null || value === "" ? (
    <span className="text-muted-foreground">-</span>
  ) : (
    value
  );

const money = (n?: number, currency?: string) =>
  n === undefined ? "" : `${formatNumber(n)}${currency ? ` ${currency}` : ""}`;

/** 거래 이력 헤더 표(단일 행) 컬럼 */
const HEADER_COLS: { header: string; cell: (d: PgTransactionDetail) => ReactNode }[] = [
  { header: "거래번호 (TID)", cell: (d) => <span className="font-mono text-xs text-primary">{d.transactId}</span> },
  { header: "거래일시", cell: (d) => d.transactDate },
  { header: "가맹점ID (MID)", cell: (d) => d.merchantId },
  { header: "MID명", cell: (d) => d.merchantName },
  { header: "주문번호", cell: (d) => <span className="font-mono text-xs">{d.transactOrderId}</span> },
  { header: "결제유형", cell: (d) => d.transactTypeName },
  { header: "결과", cell: (d) => <PgTransactionStatusBadge status={d.transactStatusName} /> },
  { header: "통화", cell: (d) => d.transactProcessCurrency },
  { header: "금액", cell: (d) => <span className="tabular-nums">{formatNumber(d.transactProcessAmount)}</span> },
  { header: "지역", cell: (d) => d.transCountryNm },
  { header: "결제방식", cell: (d) => d.methodDisplayName },
  { header: "결제수단", cell: (d) => d.transactSchemeName },
  { header: "카드번호", cell: (d) => v(d.transactCardNo) },
  { header: "카드 소유자", cell: (d) => v(d.transactCardHolder) },
  { header: "고객 ID", cell: (d) => <span className="font-mono text-xs">{d.customerId}</span> },
];

export function PgTransactionDetailPage() {
  const { tid = "" } = useParams();
  const [detail, setDetail] = useState<PgTransactionDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetchPgTransactionDetail(tid).then((d) => {
      if (!alive) return;
      setDetail(d);
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, [tid]);

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!detail) {
    return (
      <Card>
        <div className="p-8 text-center text-sm text-muted-foreground">
          거래를 찾을 수 없습니다. (TID: {tid || "없음"})
        </div>
      </Card>
    );
  }

  const d = detail;

  const 거래정보: DescriptionItem[] = [
    { label: "가맹점ID (MID)", value: v(d.merchantId) },
    { label: "MID명", value: v(d.merchantName) },
    { label: "거래번호 (TID)", value: <span className="font-mono text-xs">{d.transactId}</span> },
    { label: "거래일시", value: v(d.transactDate) },
    { label: "상품", value: v(d.productName) },
    { label: "금액", value: v(money(d.transactProcessAmount, d.transactProcessCurrency)) },
    { label: "주문번호", value: v(d.transactOrderId) },
    { label: "잔액", value: v(money(d.balance, d.transactProcessCurrency)) },
    { label: "통화", value: v(d.transactProcessCurrency) },
    { label: "결제유형", value: v(d.transactTypeName) },
    { label: "결과", value: <PgTransactionStatusBadge status={d.transactStatusName} /> },
    { label: "차지백 접수 사유", value: v(d.chargebackReason) },
    { label: "거래 결과 메세지", value: v(d.resultMessage) },
    { label: "신용카드 전표", value: v(d.creditCardReceipt) },
  ];

  const 구매자정보: DescriptionItem[] = [
    { label: "결제방식", value: v(d.methodDisplayName) },
    { label: "결제수단", value: v(d.transactSchemeName) },
    { label: "카드 소유자 (유입국가)", value: v(d.transactCardHolder ?? d.inflowCountry) },
    { label: "카드번호", value: v(d.transactCardNo) },
    { label: "할부결제 여부", value: v(d.installmentYn) },
    { label: "할부 개월 수", value: v(d.installmentMonths) },
    { label: "인증결제 유형", value: v(d.authPaymentType) },
    { label: "청구명", value: v(d.billingName) },
    { label: "카드 단말기 ID", value: v(d.cardTerminalId) },
    { label: "고객 ID", value: v(d.customerId) },
  ];

  const 요청응답: DescriptionItem[] = [
    { label: "순번", value: v(d.seq) },
    { label: "프로세서 명", value: v(d.processorName) },
    { label: "리다이렉트 URL", value: v(d.redirectUrl) },
    { label: "인증코드", value: v(d.authCode) },
    { label: "요청 시간", value: v(d.requestedAt) },
    { label: "요청 URL", value: v(d.requestUrl) },
    { label: "응답 코드", value: v(d.responseCode) },
    { label: "응답 시간", value: v(d.respondedAt) },
    { label: "3Ds 파트너", value: v(d.tdsPartner) },
    { label: "", value: "" },
    { label: "매입 통화", value: v(d.acquireCurrency) },
    { label: "매입 금액", value: v(money(d.acquireAmount, d.acquireCurrency)) },
    { label: "복합 금액(머니)", value: v(money(d.mixedAmountMoney, d.transactProcessCurrency)) },
    { label: "복합 금액(카드)", value: v(money(d.mixedAmountCard, d.transactProcessCurrency)) },
  ];

  const refund: DescriptionItem[] = [
    { label: "Refund Date (period)", value: v(d.refundDatePeriod), full: true },
    { label: "Refund", value: v(d.refundYn) },
    { label: "Partial Refund", value: v(d.partialRefundYn) },
  ];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-lg font-semibold">거래 상세내역</h1>

      {/* 거래 이력 (단일 행 헤더 표) + 액션 */}
      <section className="flex flex-col gap-2">
        <SectionTitle>거래 이력</SectionTitle>
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full min-w-max text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  {HEADER_COLS.map((c) => (
                    <th key={c.header} className="whitespace-nowrap px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                      {c.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="bg-primary/[0.04]">
                  {HEADER_COLS.map((c) => (
                    <td key={c.header} className="whitespace-nowrap px-3 py-2.5">
                      {c.cell(d)}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
        <div className="flex justify-end gap-2">
          <Button size="sm" className="bg-success text-success-foreground hover:bg-success/90">
            매출전표
          </Button>
          <Button size="sm">로그</Button>
          <Button size="sm">웹훅 로그</Button>
        </div>
      </section>

      <section>
        <SectionTitle>거래 정보</SectionTitle>
        <Descriptions items={거래정보} />
      </section>

      <section>
        <SectionTitle>구매자 정보</SectionTitle>
        <Descriptions items={구매자정보} />
      </section>

      <section>
        <SectionTitle>요청 / 응답 정보</SectionTitle>
        <Descriptions items={요청응답} />
      </section>

      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <SectionTitle>Refund Info</SectionTitle>
          <Button size="sm" variant="outline">
            변경
          </Button>
        </div>
        <Descriptions items={refund} />
      </section>
    </div>
  );
}
