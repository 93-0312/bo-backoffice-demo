import { useState } from "react";
import { Button, ConfirmDialog, IconTrash } from "@/shared/ui";
import { ApiError } from "@/shared/api";
import { deleteUser } from "@/entities/user";

/**
 * DeleteUserButton — "사용자 삭제하기" 행위(feature).
 *
 * 위험 동작이라 확인을 거친다. 확인창 껍데기는 shared/ui.ConfirmDialog 를 재사용하고,
 * 이 feature 는 삭제 행위(비동기 진행/에러 제어)만 소유한다. 삭제 자체는
 * entities/user.deleteUser 로 위임. 성공 시에만 닫으므로 closeOnConfirm={false}.
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
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="사용자 삭제"
        description={`'${userName}' 님을 삭제할까요? 이 작업은 되돌릴 수 없습니다.`}
        tone="destructive"
        confirmLabel="삭제"
        closeOnConfirm={false}
        loading={pending}
        error={error}
        onConfirm={handleConfirm}
      />
    </>
  );
}
