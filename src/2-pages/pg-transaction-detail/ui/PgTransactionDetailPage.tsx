import { type ReactNode } from "react";
import { useParams } from "react-router-dom";
import { Card, Button, Skeleton } from "@/shared/ui";
import { formatNumber } from "@/shared/lib";
import { Descriptions, type DescriptionItem } from "@/widgets/descriptions";
import {
  usePgTransactionDetailQuery,
  PgTransactionStatusBadge,
  type PgTransactionGroupItem,
} from "@/entities/pg-transaction";

/**
 * PgTransactionDetailPage — 라우트 `/pg-transactions/:tid` (page, 새 창/PopupLayout).
 *
 * 구 BO `GET /admin/transaction/detail` 응답(그룹 헤더 + 본문 + 리펀드 플래그)을 그대로 렌더.
 * ⚠️ 리뉴얼 시 API 개수·키가 바뀔 수 있음 — 그때 매핑만 조정한다.
 */

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

const isEmpty = (x: unknown) => x === undefined || x === null || x === "";
const v = (value: ReactNode) =>
  isEmpty(value) ? <span className="text-muted-foreground">-</span> : value;
const money = (n?: number, currency?: string) =>
  n === undefined || n === null ? "" : `${formatNumber(n)}${currency ? ` ${currency}` : ""}`;
const dateOnly = (s?: string) => (s ? s.split(" ")[0] : "");

/** 거래 이력 헤더 표 컬럼 (transactGroupList 요소 기준) */
const HEADER_COLS: { header: string; cell: (g: PgTransactionGroupItem) => ReactNode }[] = [
  { header: "거래번호 (TID)", cell: (g) => <span className="font-mono text-xs text-primary">{g.transactId}</span> },
  { header: "거래일시", cell: (g) => g.transactDate },
  { header: "가맹점ID (MID)", cell: (g) => g.merchantId },
  { header: "MID명", cell: (g) => g.merchantName },
  { header: "주문번호", cell: (g) => <span className="font-mono text-xs">{g.transactOrderId}</span> },
  { header: "결제유형", cell: (g) => g.transactTypeName },
  { header: "결과", cell: (g) => <PgTransactionStatusBadge status={g.transactStatusName} /> },
  { header: "통화", cell: (g) => g.transactProcessCurrency },
  { header: "금액", cell: (g) => <span className="tabular-nums">{formatNumber(g.transactProcessAmount)}</span> },
  { header: "지역", cell: (g) => g.regionDisplayName },
  { header: "결제방식", cell: (g) => g.methodDisplayName },
  { header: "결제수단", cell: (g) => g.transactSchemeName },
  { header: "카드번호", cell: (g) => v(g.transactCardNo) },
  { header: "카드 소유자", cell: (g) => v(g.transactCardHolder) },
  { header: "고객 ID", cell: (g) => <span className="font-mono text-xs">{g.customerId}</span> },
];

export function PgTransactionDetailPage() {
  const { tid = "" } = useParams();
  const { data: res, isLoading } = usePgTransactionDetailQuery(tid);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!res) {
    return (
      <Card>
        <div className="p-8 text-center text-sm text-muted-foreground">
          거래를 찾을 수 없습니다. (TID: {tid || "없음"})
        </div>
      </Card>
    );
  }

  const groups = res.transactGroupList ?? [];
  const d = res.transactDetails ?? {};
  const check = res.transactCheck;
  const holder = (d.transactCardHolder ?? "").trim();
  const country = d.transactCountryName ?? "";

  const 거래정보: DescriptionItem[] = [
    { label: "가맹점ID (MID)", value: v(d.merchantId) },
    { label: "MID명", value: v(d.merchantName) },
    { label: "거래번호 (TID)", value: <span className="font-mono text-xs">{d.transactId}</span> },
    { label: "거래일시", value: v(d.transactPartnerDatetime) },
    { label: "상품", value: v(d.transactProductName) },
    { label: "금액", value: v(money(d.transactPartnerAmount, d.transactPartnerCurrency)) },
    { label: "주문번호", value: v(d.transactOrderId) },
    { label: "잔액", value: v(money(d.remainPartnerAmount, d.transactPartnerCurrency)) },
    { label: "통화", value: v(d.transactPartnerCurrency) },
    { label: "결제유형", value: v(d.transactType) },
    {
      label: "결과",
      value: d.transactStatusName ? (
        <PgTransactionStatusBadge status={d.transactStatusName} />
      ) : (
        v("")
      ),
    },
    { label: "차지백 접수 사유", value: v(check?.transactChargeback ? "Y" : "") },
    { label: "거래 결과 메세지", value: v(d.transactResultMessage), full: true },
  ];

  const 구매자정보: DescriptionItem[] = [
    { label: "결제방식", value: v(d.methodName) },
    { label: "결제수단", value: v(d.transactSchemeName) },
    { label: "카드 소유자 (유입국가)", value: v(country ? `${holder} (${country})`.trim() : holder) },
    { label: "카드번호", value: v(d.transactCardNo) },
    { label: "할부결제 여부", value: v(d.installmentMonths && d.installmentMonths !== "00" ? "Y" : "N") },
    { label: "할부 개월 수", value: v(d.installmentMonths) },
    { label: "인증결제 유형", value: v(d.transactSecureDisplayName ?? d.transactSecureType) },
    { label: "청구명", value: v(d.merchantDescriptor1) },
    { label: "카드 단말기 ID", value: v(d.cardTerminalId) },
    { label: "고객 ID", value: v(d.customerId) },
  ];

  const 요청응답: DescriptionItem[] = [
    { label: "순번", value: v(d.transactId) },
    { label: "프로세서 명", value: v(d.partnerName) },
    { label: "리다이렉트 URL", value: v(d.transactRedirectUrl) },
    { label: "인증코드", value: v(d.transactApprovalNo) },
    { label: "요청 시간", value: v(d.transactRequestDatetime) },
    { label: "요청 URL", value: v(d.transactRequestUrl) },
    { label: "응답 코드", value: v(d.transactResultCode) },
    { label: "응답 시간", value: v(d.transactPartnerDatetime) },
    { label: "매입 통화", value: v(d.transactPartnerCurrency) },
    { label: "매입 금액", value: v(money(d.transactPartnerAmount, d.transactPartnerCurrency)) },
    { label: "복합 금액(머니)", value: v(money(d.appMoneyAmt, d.transactPartnerCurrency)) },
    { label: "복합 금액(카드)", value: v(money(d.appCardAmt, d.transactPartnerCurrency)) },
  ];

  const refund: DescriptionItem[] = [
    {
      label: "Refund Date (period)",
      value: v(`${dateOnly(d.transactPartnerDatetime)} (${d.refundPeriod ?? 0})`),
      full: true,
    },
    { label: "Refund", value: v(check?.transactRefund ? "Y" : "N") },
    { label: "Partial Refund", value: v(d.partialCcUse ?? "N") },
  ];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-lg font-semibold">거래 상세내역</h1>

      {/* 거래 이력 (그룹 헤더 표) + 액션 */}
      <section className="flex flex-col gap-2">
        <SectionTitle>거래 이력</SectionTitle>
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full min-w-max text-sm">
              <thead>
                <tr className="border-b border-border bg-muted">
                  {HEADER_COLS.map((c) => (
                    <th key={c.header} className="whitespace-nowrap px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                      {c.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {groups.map((g, i) => (
                  <tr key={g.transactId + i} className="border-b border-border last:border-0 bg-primary/[0.03]">
                    {HEADER_COLS.map((c) => (
                      <td key={c.header} className="whitespace-nowrap px-3 py-2.5">
                        {c.cell(g)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <div className="flex justify-end gap-2">
          <Button size="sm" className="bg-success text-success-foreground hover:bg-success/90">
            매출전표
          </Button>
          <Button size="sm">로그</Button>
          <Button size="sm" disabled={!d.webHookLogExists}>
            웹훅 로그
          </Button>
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
