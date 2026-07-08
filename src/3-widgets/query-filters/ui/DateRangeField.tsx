import { cn } from "@/shared/lib";

/**
 * DateRangeField — "Select date ~ Select date" 날짜 범위 입력 (widget).
 * 킷에 DatePicker 가 없어 네이티브 date input 을 킷 Input 토큰으로 감싸 만든다.
 */
export interface DateRange {
  from: string;
  to: string;
}

const inputCls =
  "h-8 rounded-radius border border-input bg-card px-2 text-sm text-foreground outline-none focus-visible:border-disabled/30 focus-visible:ring-[3px] focus-visible:ring-disabled/[0.07]";

export function DateRangeField({
  value,
  onChange,
  disabled,
}: {
  value: DateRange;
  onChange: (next: DateRange) => void;
  disabled?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-2", disabled && "opacity-50")}>
      <input
        type="date"
        className={inputCls}
        value={value.from}
        disabled={disabled}
        onChange={(e) => onChange({ ...value, from: e.target.value })}
        aria-label="시작일"
      />
      <span className="text-muted-foreground">~</span>
      <input
        type="date"
        className={inputCls}
        value={value.to}
        disabled={disabled}
        onChange={(e) => onChange({ ...value, to: e.target.value })}
        aria-label="종료일"
      />
    </div>
  );
}
