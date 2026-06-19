import type { ComponentType, SVGProps } from "react";
import {
  IconDashboard,
  IconUsers,
  IconProducts,
  IconOrders,
  IconSettings,
} from "@/shared/ui/icons";
import { ROUTES } from "./routes";

/**
 * 사이드바 내비게이션 정의 (shared/config).
 *
 * "데이터로서의 메뉴 구성"이라 config 에 둔다. widgets/app-sidebar 가 이걸 읽어 렌더만 한다
 * (구성과 표현의 분리). 새 페이지가 생기면 여기 한 줄만 추가하면 메뉴에 노출된다.
 */
export interface NavItem {
  label: string;
  to: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  /** end=true 면 정확히 일치할 때만 active (루트 "/" 용) */
  end?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "대시보드", to: ROUTES.dashboard, icon: IconDashboard, end: true },
  { label: "사용자", to: ROUTES.users, icon: IconUsers },
  { label: "상품", to: ROUTES.products, icon: IconProducts },
  { label: "주문", to: ROUTES.orders, icon: IconOrders },
  { label: "설정", to: ROUTES.settings, icon: IconSettings },
];
