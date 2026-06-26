import { Button, Select, IconChevronRight, type SelectOption } from "@/shared/ui";
import { cn } from "@/shared/lib";

/**
 * Pagination — 리스트 화면 공통 푸터 (widget).
 *
 * Figma "N 내역 중 a ~ b 표시 · 10개씩 보기 · < 1 2 >" 를 재현한 페이지네이션.
 * 상태(page/pageSize)는 page 가 소유하고 변경만 emit 한다(제어 컴포넌트).
 */
const PAGE_SIZE_OPTIONS: SelectOption[] = [
  { value: "10", label: "10개씩 보기" },
  { value: "25", label: "25개씩 보기" },
  { value: "50", label: "50개씩 보기" },
];

export interface PaginationProps {
  total: number;
  page: number; // 1-based
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export function Pagination({
  total,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(total, page * pageSize);

  return (
    <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border px-4 py-3">
      <span className="text-xs text-muted-foreground">
        {total} 내역 중 {start} ~ {end} 표시
      </span>
      <Select
        options={PAGE_SIZE_OPTIONS}
        value={String(pageSize)}
        onValueChange={(v) => onPageSizeChange(Number(v))}
        className="w-32"
      />
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          icon={<IconChevronRight className="rotate-180" />}
          aria-label="이전 페이지"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        />
        {Array.from({ length: pageCount }).map((_, i) => {
          const p = i + 1;
          return (
            <Button
              key={p}
              size="sm"
              variant={p === page ? "default" : "ghost"}
              className={cn("min-w-8", p === page && "font-semibold")}
              onClick={() => onPageChange(p)}
            >
              {p}
            </Button>
          );
        })}
        <Button
          variant="ghost"
          size="sm"
          icon={<IconChevronRight />}
          aria-label="다음 페이지"
          disabled={page >= pageCount}
          onClick={() => onPageChange(page + 1)}
        />
      </div>
    </div>
  );
}
