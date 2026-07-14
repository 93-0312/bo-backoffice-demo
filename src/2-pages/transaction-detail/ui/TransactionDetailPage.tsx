import { type ReactNode } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, Button, Spinner } from "@/shared/ui";
import { ROUTES } from "@/shared/config";
import { formatNumber } from "@/shared/lib";
import { PageHeader } from "@/widgets/page-header";
import { DataTable, type Column } from "@/widgets/data-table";
import { Descriptions } from "@/widgets/descriptions";
import {
  useTransactionQuery,
  TransactionResultBadge,
  PAYMENT_TYPE_LABEL,
  type Transaction,
  type StidTx,
} from "@/entities/transaction";

/**
 * TransactionDetailPage — 라우트 `/transactions/:id` (page).
 *
 * 결제 백오피스의 "거래 상세 내역" 화면을 FSD로 조립한다:
 *  거래 이력(widgets/data-table, 1행) · STID 거래 내역(data-table) ·
 *  거래 정보 / 구매자 정보(widgets/descriptions). 데이터는 entities/transaction.
 */
export function TransactionDetailPage() {
  const { id = "" } = useParams();
  const { data: tx, isLoading } = useTransactionQuery(id);

  if (isLoading) {
    return (
      <div className="grid min-h-[40vh] place-items-center">
        <Spinner size="lg" />
      </div>
    );
  }
  if (!tx) {
    return (
      <div className="grid min-h-[40vh] place-items-center text-center">
        <div className="flex flex-col items-center gap-3">
          <p className="text-sm text-muted-foreground">거래를 찾을 수 없습니다. ({id})</p>
          <Link to={ROUTES.transactions}>
            <Button variant="outline">거래 목록으로</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="거래 상세 내역"
        description={`거래번호 ${tx.tid}`}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="border-transparent bg-success/10 text-success-foreground hover:bg-success/20"
            >
              매출전표
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="border-transparent bg-warning/10 text-warning-foreground hover:bg-warning/20"
            >
              차지백
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="border-transparent bg-info/10 text-info-foreground hover:bg-info/20"
            >
              환불
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="border-transparent bg-info/10 text-info-foreground hover:bg-info/20"
            >
              로그
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="border-transparent bg-info/10 text-info-foreground hover:bg-info/20"
            >
              웹훅 로그
            </Button>
          </div>
        }
      />

      {/* 거래 이력 */}
      <Section title="거래 이력">
        <DataTable
          storageKey="transaction-detail-history"
          columns={historyColumns}
          rows={[tx]}
          getRowKey={(t) => t.id}
        />
      </Section>

      {/* STID 거래 내역 */}
      <Section title="STID 거래 내역">
        <DataTable
          storageKey="transaction-detail-stids"
          columns={stidColumns}
          rows={tx.stids}
          getRowKey={(s) => s.stid}
          emptyMessage="하위 STID 거래가 없습니다."
        />
      </Section>

      {/* 거래 정보 */}
      <Section title="거래 정보">
        <Descriptions
          items={[
            { label: "가맹점ID (MID)", value: tx.mid },
            { label: "MID명", value: <span className="text-primary">{tx.midName}</span> },
            { label: "거래번호 (TID)", value: <span className="font-mono">{tx.tid}</span> },
            { label: "거래일시", value: tx.transactedAt },
            { label: "상품", value: tx.product || "-" },
            { label: "금액", value: <b className="tabular-nums">{formatNumber(tx.amount)}.00</b> },
            { label: "주문번호", value: tx.orderNo },
            { label: "잔액", value: <span className="text-primary tabular-nums">{formatNumber(tx.balance)}.00</span> },
            { label: "통화", value: tx.currency },
            { label: "결제유형", value: PAYMENT_TYPE_LABEL[tx.paymentType] },
            { label: "결과", value: <TransactionResultBadge result={tx.result} /> },
            { label: "차지백 접수 사유", value: tx.chargebackReason || "-" },
            { label: "거래 결과 메시지", value: tx.resultMessage, full: true },
            { label: "신용카드 전표", value: tx.creditSlip || "-", full: true },
          ]}
        />
      </Section>

      {/* 구매자 정보 */}
      <Section title="구매자 정보">
        <Descriptions
          items={[
            { label: "결제방식", value: tx.payMethod },
            { label: "결제수단", value: tx.payInstrument },
            { label: "카드 소유자", value: tx.cardHolder || "-" },
            { label: "카드번호", value: tx.cardNo || "-" },
            { label: "할부결제 여부", value: tx.installment ? "Y" : "N" },
            { label: "할부 개월 수", value: tx.installmentMonths },
            { label: "인증결제 여부", value: tx.authPay ? "Y" : "N" },
            { label: "청구번호", value: <span className="text-primary">{tx.billingName}</span> },
            { label: "카드 단말기 ID", value: tx.terminalId || "-" },
            { label: "고객ID", value: tx.customerId || "-" },
          ]}
        />
      </Section>
    </div>
  );
}

/** ⓘ 아이콘 + 제목을 가진 섹션 카드 (이 페이지 전용 표현). */
function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card>
      <div className="flex items-center gap-1.5 border-b border-border p-4">
        <span className="grid size-4 place-items-center rounded-radius-full bg-primary text-[10px] font-bold text-primary-foreground">
          i
        </span>
        <h2 className="text-sm font-semibold">{title}</h2>
      </div>
      <div className="p-4">{children}</div>
    </Card>
  );
}

const historyColumns: Column<Transaction>[] = [
  { header: "거래번호 (TID)", cell: (t) => <span className="font-mono text-sm text-destructive-foreground">{t.tid}</span> },
  { header: "거래일시", cell: (t) => <span className="whitespace-nowrap text-sm">{t.transactedAt}</span> },
  { header: "가맹점ID", cell: (t) => <span className="text-sm">{t.mid}</span> },
  { header: "MID명", cell: (t) => <span className="whitespace-nowrap text-sm text-primary">{t.midName}</span> },
  { header: "주문번호", cell: (t) => <span className="text-sm">{t.orderNo}</span> },
  { header: "결제유형", cell: (t) => <span className="text-sm">{PAYMENT_TYPE_LABEL[t.paymentType]}</span> },
  { header: "결과", cell: (t) => <TransactionResultBadge result={t.result} /> },
  { header: "통화", cell: (t) => <span className="text-sm">{t.currency}</span> },
  { header: "금액", align: "right", cell: (t) => <span className="whitespace-nowrap text-sm font-medium tabular-nums">{formatNumber(t.amount)}.00</span> },
  { header: "차액", align: "right", cell: (t) => <span className="text-sm tabular-nums text-muted-foreground">{formatNumber(t.diff)}.00</span> },
  { header: "결제방식", cell: (t) => <span className="whitespace-nowrap text-sm">{t.payMethod}</span> },
  { header: "결제수단", cell: (t) => <span className="whitespace-nowrap text-sm">{t.payInstrument}</span> },
];

const stidColumns: Column<StidTx>[] = [
  { header: "STID", cell: (s) => <span className="font-mono text-sm text-primary">{s.stid}</span> },
  { header: "거래일시", cell: (s) => <span className="whitespace-nowrap text-sm">{s.transactedAt}</span> },
  { header: "SID", cell: (s) => <span className="text-sm">{s.sid}</span> },
  { header: "셀러명", cell: (s) => <span className="text-sm">{s.sellerName}</span> },
  { header: "상품명", cell: (s) => <span className="text-sm">{s.productName}</span> },
  { header: "결제 유형", cell: (s) => <TransactionResultBadge result={s.result} /> },
  { header: "통화", cell: (s) => <span className="text-sm">{s.currency}</span> },
  { header: "금액", align: "right", cell: (s) => <span className="text-sm tabular-nums">{formatNumber(s.amount)}.00</span> },
  { header: "잔액", align: "right", cell: (s) => <span className="text-sm tabular-nums">{formatNumber(s.balance)}.00</span> },
];
