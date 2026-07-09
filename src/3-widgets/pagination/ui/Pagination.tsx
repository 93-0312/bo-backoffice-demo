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

/**
 * 노출할 페이지 번호 목록을 만든다 — `1 … 4 5 6 … 20` 처럼 생략 처리.
 * (전부 렌더링하면 페이지가 많을 때 버튼이 수십 개 깔리므로)
 *
 * 규칙: 첫/끝 페이지는 항상, 현재 페이지 좌우 `siblings`(기본 1) 개까지 보이고,
 * 그 사이 간격이 벌어지면 "…"(ellipsis) 로 접는다.
 */
export function getPageItems(
  page: number,
  pageCount: number,
  siblings = 1,
): (number | "ellipsis")[] {
  // 생략해도 이득이 없을 만큼 적으면(첫+끝+양쪽 sibling+ellipsis 2개) 전부 보여준다.
  if (pageCount <= siblings * 2 + 5) {
    return Array.from({ length: pageCount }, (_, i) => i + 1);
  }

  // 항상 보이는 번호: 첫/끝 + 현재 좌우 sibling.
  const left = Math.max(page - siblings, 1);
  const right = Math.min(page + siblings, pageCount);
  const shown = new Set<number>([1, pageCount]);
  for (let p = left; p <= right; p++) shown.add(p);

  const sorted = [...shown].sort((a, b) => a - b);
  const items: (number | "ellipsis")[] = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0) {
      const gap = sorted[i] - sorted[i - 1];
      // 간격이 정확히 1페이지면 "…" 대신 그 번호를 보여준다(… 가 한 칸만 가리는 낭비 방지).
      if (gap === 2) items.push(sorted[i - 1] + 1);
      else if (gap > 2) items.push("ellipsis");
    }
    items.push(sorted[i]);
  }
  return items;
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
        {getPageItems(page, pageCount).map((item, i) =>
          item === "ellipsis" ? (
            <span
              key={`ellipsis-${i}`}
              className="min-w-8 select-none text-center text-xs text-muted-foreground"
              aria-hidden="true"
            >
              …
            </span>
          ) : (
            <Button
              key={item}
              size="sm"
              variant={item === page ? "default" : "ghost"}
              className={cn("min-w-8", item === page && "font-semibold")}
              aria-current={item === page ? "page" : undefined}
              onClick={() => onPageChange(item)}
            >
              {item}
            </Button>
          ),
        )}
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
