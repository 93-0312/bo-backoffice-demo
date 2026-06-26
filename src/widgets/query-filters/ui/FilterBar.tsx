import type { ReactNode } from "react";
import { Button } from "@/shared/ui";

/**
 * FilterBar — 리스트 화면 상단 검색/필터 영역 (widget).
 *
 * Figma 의 필터 바(날짜 범위 + 드롭다운 + 내용 입력)를 감싸는 레이아웃 래퍼.
 * 구체적인 필터 컨트롤은 page 가 children 으로 주입한다(화면마다 다르므로).
 * 우측에 검색/초기화 액션을 노출한다.
 */
export function FilterBar({
  children,
  onSearch,
  onReset,
  note,
}: {
  children: ReactNode;
  onSearch?: () => void;
  onReset?: () => void;
  /** 예: "최대 검색가능 기간: 1개월" */
  note?: string;
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-border bg-muted/30 p-4">
      <div className="flex flex-wrap items-center gap-2">{children}</div>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground">{note}</span>
        <div className="flex gap-2">
          {onReset && (
            <Button variant="outline" size="sm" onClick={onReset}>
              초기화
            </Button>
          )}
          {onSearch && (
            <Button size="sm" onClick={onSearch}>
              검색
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * ListActions — 페이지 헤더 우측의 다운로드 액션(초록).
 * Figma 의 상단 우측 '다운로드' 버튼 톤을 재현.
 */
export function DownloadButton({ onClick }: { onClick?: () => void }) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="border-transparent bg-success/10 text-success-foreground hover:bg-success/20"
      onClick={onClick}
    >
      다운로드
    </Button>
  );
}
