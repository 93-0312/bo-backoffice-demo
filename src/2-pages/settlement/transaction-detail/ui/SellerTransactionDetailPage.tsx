import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, Button, Spinner } from "@/shared/ui";
import { ROUTES } from "@/shared/config";
import { formatNumber } from "@/shared/lib";
import { PageHeader } from "@/widgets/page-header";
import { DataTable, type Column } from "@/widgets/data-table";
import { Descriptions } from "@/widgets/descriptions";
import { SellerRefundModal } from "@/features/seller-refund";
import {
  useStidsByTidQuery,
  SellerTxTypeBadge,
  SellerTxStateBadge,
  type SellerTransaction,
} from "@/entities/seller-transaction";

/**
 * SellerTransactionDetailPage — "분할정산 거래 상세 내역" (page).
 *
 * 거래내역(목록)에서 행을 클릭해 진입한다. 한 TID 에 묶인 STID 거래를 보여주고,
 * 헤더의 **환불** 버튼으로 환불 모달(features/seller-refund)을 연다.
 * (환불은 목록 테이블이 아니라 이 상세 화면에서 진행한다.)
 */
export function SellerTransactionDetailPage() {
  const { tid = "" } = useParams();
  const [refundOpen, setRefundOpen] = useState(false);

  const { data, isLoading, refetch } = useStidsByTidQuery(tid);
  const rows: SellerTransaction[] = data ?? [];
  // 환불(feature mutation) 후 재조회
  const load = () => void refetch();

  if (isLoading) {
    return (
      <div className="grid min-h-[40vh] place-items-center">
        <Spinner size="lg" />
      </div>
    );
  }
  if (rows.length === 0) {
    return (
      <div className="grid min-h-[40vh] place-items-center text-center">
        <div className="flex flex-col items-center gap-3">
          <p className="text-sm text-muted-foreground">거래를 찾을 수 없습니다. ({tid})</p>
          <Link to={ROUTES.sellerTransactions}>
            <Button variant="outline">거래내역으로</Button>
          </Link>
        </div>
      </div>
    );
  }

  const head = rows[0];
  const currency = head.currency;
  const totalAmount = rows.reduce((a, r) => a + r.amount, 0);
  const refundableTotal = rows.reduce((a, r) => a + r.refundableAmount, 0);

  const columns: Column<SellerTransaction>[] = [
    { header: "STID", cell: (r) => <span className="font-mono text-sm text-primary">{r.stid}</span> },
    { header: "거래일시", cell: (r) => <span className="text-sm">{r.transactedAt}</span> },
    { header: "SID", cell: (r) => <span className="text-sm">{r.sid}</span> },
    { header: "셀러명", cell: (r) => <span className="text-sm">{r.sellerName}</span> },
    { header: "상품명", cell: (r) => <span className="text-sm">{r.productName}</span> },
    { header: "결제 유형", cell: (r) => <SellerTxTypeBadge type={r.type} /> },
    { header: "상태", cell: (r) => <SellerTxStateBadge state={r.state} /> },
    { header: "통화", cell: (r) => <span className="text-sm">{r.currency}</span> },
    { header: "금액", align: "right", cell: (r) => <span className="text-sm tabular-nums">{formatNumber(r.amount)}.00</span> },
    {
      header: "환불 가능 금액",
      align: "right",
      cell: (r) => (
        <span className="text-sm tabular-nums text-primary">{formatNumber(r.refundableAmount)}.00</span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="분할정산 거래 상세 내역"
        description={`거래번호 ${head.tid}`}
        actions={
          <Button
            disabled={refundableTotal <= 0}
            onClick={() => setRefundOpen(true)}
          >
            환불
          </Button>
        }
      />

      <Card>
        <div className="border-b border-border p-4 text-sm font-semibold">거래 정보</div>
        <div className="p-4">
          <Descriptions
            items={[
              { label: "거래번호 (TID)", value: <span className="font-mono">{head.tid}</span> },
              { label: "거래일시", value: head.transactedAt },
              { label: "가맹점ID", value: head.mid },
              { label: "가맹점명", value: <span className="text-primary">{head.midName}</span> },
              { label: "통화", value: currency },
              { label: "총 거래 금액", value: <b className="tabular-nums">{formatNumber(totalAmount)}.00</b> },
              {
                label: "환불 가능 잔액",
                value: <span className="text-primary tabular-nums">{formatNumber(refundableTotal)}.00 {currency}</span>,
              },
              { label: "STID 건수", value: `${rows.length}건` },
            ]}
          />
        </div>
      </Card>

      <Card>
        <div className="border-b border-border p-4 text-sm font-semibold">STID 거래 내역</div>
        <DataTable columns={columns} rows={rows} getRowKey={(r) => r.id} />
      </Card>

      <SellerRefundModal
        tid={tid}
        open={refundOpen}
        onClose={() => setRefundOpen(false)}
        onRefunded={load}
      />
    </div>
  );
}
