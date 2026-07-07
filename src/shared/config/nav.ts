import type { ComponentType, SVGProps } from "react";
import {
  IconDashboard,
  IconUsers,
  IconProducts,
  IconOrders,
  IconReceipt,
  IconList,
  IconCoin,
  IconBuilding,
  IconSettings,
} from "@/shared/ui/icons";
import { ROUTES } from "./routes";

/**
 * 사이드바 내비게이션 정의 (shared/config).
 *
 * 메뉴를 "그룹"으로 묶어 데이터로 둔다(분할정산 등 도메인 섹션 표현).
 * widgets/app-sidebar 가 이 구조를 읽어 그룹 헤더 + 항목으로 렌더만 한다.
 */
export interface NavItem {
  label: string;
  to: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  end?: boolean;
}

export interface NavGroup {
  /** 그룹 헤더 (없으면 헤더 없이 항목만) */
  title?: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    items: [
      {
        label: "대시보드",
        to: ROUTES.dashboard,
        icon: IconDashboard,
        end: true,
      },
      {
        label: "대시보드 (변형 B)",
        to: ROUTES.dashboardRenewal2,
        icon: IconDashboard,
      },
      {
        label: "기존 대시보드",
        to: ROUTES.dashboardLegacy,
        icon: IconDashboard,
      },
    ],
  },
  {
    title: "운영",
    items: [
      { label: "사용자", to: ROUTES.users, icon: IconUsers },
      { label: "상품", to: ROUTES.products, icon: IconProducts },
      { label: "주문", to: ROUTES.orders, icon: IconOrders },
      { label: "거래", to: ROUTES.transactions, icon: IconReceipt },
    ],
  },
  {
    title: "분할정산",
    items: [
      { label: "SID 리스트", to: ROUTES.sidList, icon: IconList },
      { label: "거래내역", to: ROUTES.sellerTransactions, icon: IconReceipt },
      { label: "정산 리스트", to: ROUTES.settlementList, icon: IconCoin },
      { label: "영중소 정산서", to: ROUTES.smeSettlements, icon: IconBuilding },
    ],
  },
  {
    items: [{ label: "설정", to: ROUTES.settings, icon: IconSettings }],
  },
];
