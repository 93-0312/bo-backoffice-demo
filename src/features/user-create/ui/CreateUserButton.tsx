import { useState, type FormEvent } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Field,
  Input,
  Select,
  IconPlus,
} from "@/shared/ui";
import { ApiError } from "@/shared/api";
import {
  createUser,
  USER_ROLE_LABEL,
  type CreateUserInput,
  type UserRole,
  type User,
} from "@/entities/user";

/**
 * CreateUserButton — "사용자 추가하기" 행위(feature).
 *
 * 킷 Dialog(합성형) + Select 로 만든 모달 폼. 모달 열림/폼 상태/검증/제출을 캡슐화하고,
 * 데이터 생성은 entities/user.createUser 로 위임한다. 성공하면 onCreated 로 상위(page)에 알린다.
 */
const ROLE_OPTIONS = (Object.keys(USER_ROLE_LABEL) as UserRole[]).map((r) => ({
  value: r,
  label: USER_ROLE_LABEL[r],
}));

export function CreateUserButton({ onCreated }: { onCreated?: (user: User) => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CreateUserInput>({ name: "", email: "", role: "staff" });
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function reset() {
    setForm({ name: "", email: "", role: "staff" });
    setError(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.name.trim() || !form.email.trim()) {
      setError("이름과 이메일을 입력하세요.");
      return;
    }
    setPending(true);
    try {
      const created = await createUser(form);
      reset();
      setOpen(false);
      onCreated?.(created);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "생성에 실패했습니다.");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <Button icon={<IconPlus />} onClick={() => setOpen(true)}>
        사용자 추가
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-full max-w-md">
          <DialogHeader>
            <DialogTitle>새 사용자 추가</DialogTitle>
            <DialogDescription>
              초대 메일이 발송되며 상태는 '초대됨'으로 생성됩니다.
            </DialogDescription>
          </DialogHeader>

          <form id="create-user-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Field label="이름" htmlFor="cu-name" required>
              <Input
                id="cu-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="홍길동"
              />
            </Field>
            <Field label="이메일" htmlFor="cu-email" required error={error ?? undefined}>
              <Input
                id="cu-email"
                type="email"
                value={form.email}
                invalid={!!error}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="user@example.com"
              />
            </Field>
            <Field label="역할" htmlFor="cu-role">
              <Select
                id="cu-role"
                options={ROLE_OPTIONS}
                value={form.role}
                onValueChange={(v) => setForm({ ...form, role: v as UserRole })}
              />
            </Field>
          </form>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)} type="button">
              취소
            </Button>
            <Button type="submit" form="create-user-form" disabled={pending}>
              {pending ? "추가 중…" : "추가"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
