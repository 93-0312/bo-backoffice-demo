import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  SegmentedControl,
  Input,
  Checkbox,
  Button,
  Alert,
  Spinner,
  IconSearch,
} from "@/shared/ui";
import { cn, formatNumber } from "@/shared/lib";
import { ApiError } from "@/shared/api";
import {
  fetchStidsByTid,
  refundStids,
  type SellerTransaction,
} from "@/entities/seller-transaction";

/**
 * SellerRefundModal — "환불하기" (features/seller-refund).
 *
 * 기획서 동작 재현:
 *  - 전체환불 / 개별 환불(부분) 분기
 *  - 개별: STID 체크 → 환불 금액 입력(환불 가능 금액 초과 시 보정) → 전액 버튼 → 합계 버튼
 *  - 환불하기 → 확인 단계("실행 후 취소 불가") → 환불 API
 *  - 예외: 환불 대상 STID 가 없으면 "셀러 거래내역이 들어와야 환불이 가능합니다."
 *
 * 단일 Dialog 안에서 form → confirm 단계를 전환한다(포털 중첩 회피).
 */
export function SellerRefundModal({
  tid,
  open,
  onClose,
  onRefunded,
}: {
  tid: string;
  open: boolean;
  onClose: () => void;
  onRefunded?: () => void;
}) {
  const [rows, setRows] = useState<SellerTransaction[] | null>(null);
  const [mode, setMode] = useState<"all" | "partial">("all");
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [amounts, setAmounts] = useState<Record<string, number>>({});
  const [search, setSearch] = useState("");
  const [step, setStep] = useState<"form" | "confirm">("form");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setRows(null);
    setMode("all");
    setChecked({});
    setAmounts({});
    setSearch("");
    setStep("form");
    setError(null);
    fetchStidsByTid(tid).then(setRows);
  }, [open, tid]);

  const refundable = useMemo(() => (rows ?? []).filter((r) => r.refundableAmount > 0), [rows]);
  const currency = rows?.[0]?.currency ?? "KRW";

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return refundable;
    return refundable.filter(
      (r) =>
        r.stid.toLowerCase().includes(q) ||
        r.sellerName.toLowerCase().includes(q) ||
        r.productName.toLowerCase().includes(q),
    );
  }, [refundable, search]);

  const selectedRows = refundable.filter((r) => checked[r.stid]);
  const partialSum = selectedRows.reduce((acc, r) => acc + (amounts[r.stid] ?? 0), 0);
  const allSum = refundable.reduce((acc, r) => acc + r.refundableAmount, 0);
  const sum = mode === "all" ? allSum : partialSum;
  const count = mode === "all" ? refundable.length : selectedRows.filter((r) => (amounts[r.stid] ?? 0) > 0).length;
  const canSubmit = count > 0 && sum > 0;

  function toggle(r: SellerTransaction, on: boolean) {
    setChecked((c) => ({ ...c, [r.stid]: on }));
    if (on && amounts[r.stid] == null) {
      setAmounts((a) => ({ ...a, [r.stid]: r.refundableAmount }));
    }
  }
  function setAmount(r: SellerTransaction, raw: string) {
    const n = Math.min(Number(raw.replace(/[^\d]/g, "")) || 0, r.refundableAmount);
    setAmounts((a) => ({ ...a, [r.stid]: n }));
  }

  async function submit() {
    setPending(true);
    setError(null);
    try {
      const items =
        mode === "all"
          ? refundable.map((r) => ({ stid: r.stid, amount: r.refundableAmount }))
          : selectedRows.map((r) => ({ stid: r.stid, amount: amounts[r.stid] ?? 0 })).filter((i) => i.amount > 0);
      await refundStids(tid, items);
      onClose();
      onRefunded?.();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "환불에 실패했습니다.");
      setStep("form");
    } finally {
      setPending(false);
    }
  }

  const blocked = rows !== null && refundable.length === 0;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()} role="alertdialog">
      <DialogContent className="flex max-h-[85vh] w-full max-w-lg flex-col">
        <DialogHeader>
          <DialogTitle>{step === "confirm" ? "환불을 실행할까요?" : "환불하기"}</DialogTitle>
        </DialogHeader>

        {rows === null ? (
          <div className="grid h-40 place-items-center">
            <Spinner size="lg" />
          </div>
        ) : blocked ? (
          <>
            <Alert type="error" title="환불 처리를 진행할 수 없습니다">
              셀러 거래내역이 들어와야 환불이 가능합니다.
            </Alert>
            <DialogFooter>
              <Button variant="ghost" onClick={onClose}>
                닫기
              </Button>
            </DialogFooter>
          </>
        ) : step === "confirm" ? (
          <>
            <p className="text-sm text-muted-foreground">
              선택한 <b className="text-foreground">{count}</b>개 / 총{" "}
              <b className="text-foreground">{formatNumber(sum)}.00 {currency}</b> 환불을 실행합니다.
              <br />
              실행 후 취소할 수 없습니다.
            </p>
            {error && <Alert type="error" title={error} className="mt-2" />}
            <DialogFooter>
              <Button variant="ghost" onClick={() => setStep("form")} disabled={pending}>
                취소
              </Button>
              <Button onClick={submit} disabled={pending}>
                {pending ? "처리 중…" : "환불하기"}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            {/* 기본 정보 */}
            <div className="flex items-center justify-between rounded-radius-lg bg-muted px-3 py-2.5 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">거래번호 (TID)</p>
                <p className="font-mono">{tid}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">환불 가능 잔액</p>
                <p className="font-semibold">
                  {formatNumber(allSum)}.00 <span className="text-xs font-normal">{currency}</span>
                </p>
              </div>
            </div>

            <SegmentedControl
              className="w-full"
              options={[
                { value: "all", label: "전체환불" },
                { value: "partial", label: "개별 환불" },
              ]}
              value={mode}
              onValueChange={(v) => setMode(v as "all" | "partial")}
            />

            {mode === "all" ? (
              <Alert type="info" title="전체 거래 금액이 환불됩니다">
                조정이 필요하면 부분환불(개별 환불)을 이용하세요.
              </Alert>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <Input
                    leftIcon={<IconSearch />}
                    placeholder="셀러명 · STID · 상품명 검색"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    containerClassName="flex-1"
                  />
                  <span className="shrink-0 text-xs text-muted-foreground">
                    선택 <b className="text-primary">{selectedRows.length}</b> / {refundable.length}
                  </span>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto rounded-radius-lg border border-border">
                  {visible.map((r) => {
                    const on = !!checked[r.stid];
                    return (
                      <div key={r.stid} className={cn("border-b border-border p-3", on && "bg-primary/[0.03]")}>
                        <div className="flex items-center gap-3">
                          <Checkbox checked={on} onCheckedChange={(v) => toggle(r, v)} />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{r.stid}</p>
                            <p className="truncate text-xs text-muted-foreground">
                              {r.productName} ({r.sellerName})
                            </p>
                          </div>
                          <div className="text-right text-sm">
                            <p className="tabular-nums">{formatNumber(r.amount)}.00</p>
                            <p className="text-xs text-primary tabular-nums">
                              환불가능 {formatNumber(r.refundableAmount)}.00
                            </p>
                          </div>
                        </div>
                        {on && (
                          <div className="mt-2 flex items-center gap-2 pl-8">
                            <Input
                              value={amounts[r.stid] != null ? formatNumber(amounts[r.stid]) : ""}
                              onChange={(e) => setAmount(r, e.target.value)}
                              suffix={currency}
                              inputMode="numeric"
                              className="text-right"
                              containerClassName="flex-1"
                            />
                            <Button size="sm" variant="outline" onClick={() => setAmount(r, String(r.refundableAmount))}>
                              전액
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {visible.length === 0 && (
                    <p className="p-6 text-center text-sm text-muted-foreground">검색 결과가 없습니다.</p>
                  )}
                </div>
              </>
            )}

            <DialogFooter>
              <Button size="lg" className="w-full" disabled={!canSubmit} onClick={() => setStep("confirm")}>
                {count}개 총 {formatNumber(sum)}.00 {currency} 환불하기
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
