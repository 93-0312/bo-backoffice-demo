import { Button } from "@/shared/ui";

/**
 * DownloadButton — 페이지 헤더 우측의 다운로드 액션(초록).
 * Figma 의 상단 우측 '다운로드' 버튼 톤을 재현.
 *
 * (이 위젯에 있던 FilterBar/DateRangeField 는 스키마 기반 widgets/filter-bar 로
 *  대체되어 제거됨 — 남은 것은 이 버튼뿐.)
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
