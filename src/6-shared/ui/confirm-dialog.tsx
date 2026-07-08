import { type ReactNode } from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "bo-ui-kit";

/**
 * ConfirmDialog — "제목 + 메시지 + 확인/취소" 확인창의 공통 껍데기 (shared/ui).
 *
 * 킷 Dialog 프리미티브를 조립해 만든 표현 전용 컴포넌트. 도메인은 모른다 — 무엇을
 * 확인하는지(텍스트)와 확인 시 무엇을 할지(onConfirm)는 호출측이 주입한다.
 *
 * - 간단한 확인창: open/title/description/onConfirm 만 넘기면 끝(확인 후 자동 닫힘).
 * - 비동기 행위(삭제·환불 등): closeOnConfirm={false} + loading/error 를 호출측이 제어.
 *   (이 경우 feature 안에서 쓰며, 성공 시 호출측이 onOpenChange(false) 로 닫는다.)
 */
export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  /** 본문 메시지 */
  description?: ReactNode;
  confirmLabel?: ReactNode;
  cancelLabel?: ReactNode;
  /** 확인 버튼 톤 — 파괴적 동작이면 "destructive" */
  tone?: "default" | "destructive";
  onConfirm?: () => void;
  /** 확인 클릭 후 자동으로 닫을지 (기본 true). 비동기 제어 시 false 로 두고 직접 닫는다. */
  closeOnConfirm?: boolean;
  /** 진행 중 상태 — 버튼 비활성 + 라벨 대체 */
  loading?: boolean;
  /** 에러 메시지 — 있으면 본문에 Alert 로 표시 */
  error?: ReactNode;
  /** 확인만 있는 알림형(취소 버튼 숨김) */
  hideCancel?: boolean;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "확인",
  cancelLabel = "취소",
  tone = "default",
  onConfirm,
  closeOnConfirm = true,
  loading = false,
  error,
  hideCancel = false,
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm?.();
    if (closeOnConfirm) onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} role="alertdialog">
      <DialogContent className="w-full max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        {error && (
          <DialogBody className="pb-2">
            <Alert type="error" title={error} />
          </DialogBody>
        )}

        <DialogFooter>
          {!hideCancel && (
            <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={loading}>
              {cancelLabel}
            </Button>
          )}
          <Button
            variant={tone === "destructive" ? "destructive" : "default"}
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? "처리 중…" : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
