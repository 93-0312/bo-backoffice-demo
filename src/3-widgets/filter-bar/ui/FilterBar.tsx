import type { ReactNode } from "react";
import { Button, Checkbox, Input, Select, IconSearch, type SelectOption } from "@/shared/ui";
import { cn } from "@/shared/lib";
import type { DateRangeValue, FilterValue, FilterValues } from "../model/useFilters";

/**
 * FilterBar — 목록 상단 필터 바 (widget).
 *
 * DataTable 의 Column<T> 처럼 "스키마(defs) 선언 → 위젯이 렌더" 방식.
 * 메뉴마다 필터 종류·개수가 달라도 배열 내용만 바꾸면 되고, 상태는 page 가
 * useFilters 로 소유한다(제어 컴포넌트). 스키마로 표현 안 되는 특수 필터는
 * type:"custom" 의 render 슬롯으로 탈출한다.
 *
 * 날짜 계열은 세 가지를 지원한다:
 *  - date      : 단일 일자 (YYYY-MM-DD)
 *  - month     : 월 선택   (YYYY-MM, 네이티브 month 입력 — 미지원 브라우저는 텍스트 폴백)
 *  - dateRange : 기간 from~to + 선택적 프리셋 칩(오늘/최근 7일…)
 */
export interface DateRangePreset {
  label: string;
  /** 클릭 시 적용할 기간을 계산해 반환(호출 시점 기준). */
  range: () => DateRangeValue;
}

export type FilterDef =
  | { type: "search"; key: string; placeholder?: string; className?: string }
  | { type: "select"; key: string; options: SelectOption[]; className?: string }
  | { type: "checkbox"; key: string; label: string }
  | { type: "date"; key: string; label?: string }
  | { type: "month"; key: string; label?: string }
  | { type: "dateRange"; key: string; presets?: DateRangePreset[] }
  | {
      type: "custom";
      key: string;
      render: (value: FilterValue, set: (value: FilterValue) => void) => ReactNode;
    };

export interface FilterBarProps<T extends FilterValues> {
  defs: FilterDef[];
  values: T;
  onChange: <K extends keyof T>(key: K, value: T[K]) => void;
  /** 있으면 값이 기본값과 다를 때(dirty) 우측에 "초기화" 버튼을 띄운다. */
  onReset?: () => void;
  dirty?: boolean;
  /** 우측에 항상 표시하는 안내 문구. 예: "최대 검색가능 기간: 1개월" */
  note?: string;
  className?: string;
}

/** 자주 쓰는 기간 프리셋 — page 에서 골라 dateRange.presets 로 넘긴다. */
export const DATE_RANGE_PRESETS = {
  today: {
    label: "오늘",
    range: () => {
      const d = toDateString(new Date());
      return { from: d, to: d };
    },
  },
  last7Days: {
    label: "최근 7일",
    range: () => {
      const now = new Date();
      const from = new Date(now);
      from.setDate(now.getDate() - 6);
      return { from: toDateString(from), to: toDateString(now) };
    },
  },
  thisMonth: {
    label: "이번 달",
    range: () => {
      const now = new Date();
      return {
        from: toDateString(new Date(now.getFullYear(), now.getMonth(), 1)),
        to: toDateString(now),
      };
    },
  },
} satisfies Record<string, DateRangePreset>;

function toDateString(d: Date): string {
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

export function FilterBar<T extends FilterValues>({
  defs,
  values,
  onChange,
  onReset,
  dirty,
  note,
  className,
}: FilterBarProps<T>) {
  const set = (key: string, value: FilterValue) =>
    onChange(key as keyof T, value as T[keyof T]);

  return (
    <div className={cn("flex flex-wrap items-center gap-2 border-b border-border p-4", className)}>
      {defs.map((def) => {
        const value = values[def.key];
        switch (def.type) {
          case "search":
            return (
              <Input
                key={def.key}
                leftIcon={<IconSearch />}
                placeholder={def.placeholder}
                value={(value as string) ?? ""}
                onChange={(e) => set(def.key, e.target.value)}
                containerClassName={cn("min-w-64 flex-1", def.className)}
              />
            );
          case "select":
            return (
              <Select
                key={def.key}
                options={def.options}
                value={(value as string) ?? ""}
                onValueChange={(v) => set(def.key, v)}
                className={cn("w-40", def.className)}
              />
            );
          case "checkbox":
            return (
              <label
                key={def.key}
                className="flex cursor-pointer select-none items-center gap-2 px-1 text-sm"
              >
                <Checkbox
                  checked={!!value}
                  onCheckedChange={(checked) => set(def.key, checked)}
                />
                {def.label}
              </label>
            );
          case "date":
            return (
              <LabeledInput key={def.key} label={def.label}>
                <Input
                  type="date"
                  value={(value as string) ?? ""}
                  onChange={(e) => set(def.key, e.target.value || null)}
                  containerClassName="w-40"
                />
              </LabeledInput>
            );
          case "month":
            return (
              <LabeledInput key={def.key} label={def.label}>
                <Input
                  type="month"
                  value={(value as string) ?? ""}
                  onChange={(e) => set(def.key, e.target.value || null)}
                  containerClassName="w-40"
                />
              </LabeledInput>
            );
          case "dateRange": {
            const range = (value ?? { from: null, to: null }) as DateRangeValue;
            return (
              <div key={def.key} className="flex flex-wrap items-center gap-1.5">
                <Input
                  type="date"
                  aria-label="시작일"
                  value={range.from ?? ""}
                  max={range.to ?? undefined}
                  onChange={(e) => set(def.key, { ...range, from: e.target.value || null })}
                  containerClassName="w-36"
                />
                <span className="text-muted-foreground">~</span>
                <Input
                  type="date"
                  aria-label="종료일"
                  value={range.to ?? ""}
                  min={range.from ?? undefined}
                  onChange={(e) => set(def.key, { ...range, to: e.target.value || null })}
                  containerClassName="w-36"
                />
                {def.presets?.map((preset) => (
                  <Button
                    key={preset.label}
                    variant="ghost"
                    size="xs"
                    onClick={() => set(def.key, preset.range())}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            );
          }
          case "custom":
            return <div key={def.key}>{def.render(value, (v) => set(def.key, v))}</div>;
        }
      })}
      {note && <span className="ml-auto text-xs text-muted-foreground">{note}</span>}
      {onReset && dirty && (
        <Button variant="ghost" size="sm" className={note ? undefined : "ml-auto"} onClick={onReset}>
          초기화
        </Button>
      )}
    </div>
  );
}

function LabeledInput({ label, children }: { label?: string; children: ReactNode }) {
  if (!label) return <>{children}</>;
  return (
    <label className="flex items-center gap-2 text-sm text-muted-foreground">
      {label}
      {children}
    </label>
  );
}
