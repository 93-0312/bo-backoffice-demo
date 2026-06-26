import { useState } from "react";
import { Button } from "@/shared/ui";
import { SellerRefundModal } from "./SellerRefundModal";

/**
 * RefundButton — 거래내역 행에서 환불 모달을 여는 진입점 (feature).
 * 행의 TID 를 받아 해당 TID 의 STID 들을 환불 대상으로 모달에 넘긴다.
 */
export function RefundButton({ tid, onRefunded }: { tid: string; onRefunded?: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        size="xs"
        variant="ghost"
        className="border-transparent bg-warning/10 text-warning-foreground hover:bg-warning/20"
        onClick={() => setOpen(true)}
      >
        환불
      </Button>
      <SellerRefundModal tid={tid} open={open} onClose={() => setOpen(false)} onRefunded={onRefunded} />
    </>
  );
}
