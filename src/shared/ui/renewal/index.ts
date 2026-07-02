/**
 * shared/ui/renewal — BO 리뉴얼 대시보드 디자인 킷 (Figma "BO_Design_리뉴얼" 토큰).
 *
 * 도메인을 모르는 표현 재료만 둔다: 디자인 토큰(t), 카드 셸, 툴팁, 범례, 아이콘.
 * bo-ui-kit(Tailwind)과 달리 styled-components 기반 — 리뉴얼 시안의 픽셀 값을
 * 그대로 옮기기 위한 별도 킷이므로 기존 shared/ui 와 섞지 않는다.
 */
export { t } from "./tokens";
export type { Tokens } from "./tokens";
export {
  Card,
  CardHeader,
  CardTitle,
  HeaderRight,
  MetaText,
  GhostButton,
  UnitLegend,
  UnitLegendItem,
  TooltipCard,
  TooltipTitleRow,
  TooltipRow,
  TooltipRowLabel,
  TooltipRowValue,
} from "./common";
export {
  IconRows,
  IconCalendar,
  IconTrendArrow,
  IconDownload,
  IconInfo,
  IconChevronRight,
  IconChevronDown,
} from "./icons";
