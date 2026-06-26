import { useState } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Alert,
  IconTrash,
} from "@/shared/ui";
import { ApiError } from "@/shared/api";
import { deleteUser } from "@/entities/user";

/**
 * DeleteUserButton — "사용자 삭제하기" 행위(feature).
 *
 * 위험 동작이라 킷 Dialog(role="alertdialog")로 확인을 거친다. 비동기 진행/에러를 직접
 * 제어하려고 합성형 Dialog 를 쓴다. 삭제 자체는 entities/user.deleteUser 로 위임.
 */
export function DeleteUserButton({
  userId,
  userName,
  onDeleted,
}: {
  userId: string;
  userName: string;
  onDeleted?: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setPending(true);
    setError(null);
    try {
      await deleteUser(userId);
      setOpen(false);
      onDeleted?.(userId);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "삭제에 실패했습니다.");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        icon={<IconTrash />}
        aria-label={`${userName} 삭제`}
        onClick={() => setOpen(true)}
      />
      <Dialog open={open} onOpenChange={setOpen} role="alertdialog">
        <DialogContent className="w-full max-w-sm">
          <DialogHeader>
            <DialogTitle>사용자 삭제</DialogTitle>
            <DialogDescription>
              '{userName}' 님을 삭제할까요? 이 작업은 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          {error && (
            <DialogBody className="pb-2">
              <Alert type="error" title={error} />
            </DialogBody>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={pending}>
              취소
            </Button>
            <Button variant="destructive" onClick={handleConfirm} disabled={pending}>
              {pending ? "삭제 중…" : "삭제"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
