import { Routes, Route } from "react-router-dom";
import { ROUTES } from "@/shared/config";
import { AppLayout } from "@/app/layout/AppLayout";
import { PopupLayout } from "@/app/layout/PopupLayout";
import { ProtectedRoute } from "./ProtectedRoute";
import { LoginPage } from "@/pages/login";
import { DashboardPage } from "@/pages/dashboard";
import { DashboardRenewalPage } from "@/pages/dashboard-renewal";
import { DashboardRenewal2Page } from "@/pages/dashboard-renewal2";
import { UsersPage } from "@/pages/users";
import { ProductsPage } from "@/pages/products";
import { OrdersPage } from "@/pages/orders";
import { TransactionsPage } from "@/pages/transactions";
import { TransactionDetailPage } from "@/pages/transaction-detail";
import { PgTransactionsPage } from "@/pages/pg-transactions";
import { PgTransactionDetailPage } from "@/pages/pg-transaction-detail";
import { SidListPage } from "@/pages/settlement/sids";
import { SellerTransactionsPage } from "@/pages/settlement/transactions";
import { SellerTransactionDetailPage } from "@/pages/settlement/transaction-detail";
import { SettlementListPage } from "@/pages/settlement/list";
import { SettingsPage } from "@/pages/settings";
import { NotFoundPage } from "@/pages/not-found";

/**
 * AppRoutes — 라우트 테이블 (app/routing).
 *
 * 공개 라우트(/login)와 보호 라우트(레이아웃 + 인증 가드)를 나눈다.
 * 각 화면은 pages 의 Public API 에서만 가져온다(슬라이스 내부 직접 import 금지).
 */
export function AppRoutes() {
  return (
    <Routes>
      <Route path={ROUTES.login} element={<LoginPage />} />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path={ROUTES.dashboard} element={<DashboardRenewalPage />} />
        <Route path={ROUTES.dashboardRenewal2} element={<DashboardRenewal2Page />} />
        <Route path={ROUTES.dashboardLegacy} element={<DashboardPage />} />
        <Route path={ROUTES.users} element={<UsersPage />} />
        <Route path={ROUTES.products} element={<ProductsPage />} />
        <Route path={ROUTES.orders} element={<OrdersPage />} />
        <Route path={ROUTES.transactions} element={<TransactionsPage />} />
        <Route path={ROUTES.transactionDetail()} element={<TransactionDetailPage />} />
        <Route path={ROUTES.pgTransactions} element={<PgTransactionsPage />} />
        <Route path={ROUTES.sidList} element={<SidListPage />} />
        <Route path={ROUTES.sellerTransactions} element={<SellerTransactionsPage />} />
        <Route path={ROUTES.sellerTransactionDetail()} element={<SellerTransactionDetailPage />} />
        {/* 같은 컴포넌트를 두 라우트가 쓰므로 key 로 전환 시 리마운트(필터 저장 키 분리) */}
        <Route path={ROUTES.settlementList} element={<SettlementListPage key="list" />} />
        <Route path={ROUTES.smeSettlements} element={<SettlementListPage key="sme" sme />} />
        <Route path={ROUTES.settings} element={<SettingsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* 팝업(새 창) 전용 — 사이드바·헤더 없이 본문만. 인증 가드는 동일 적용. */}
      <Route
        element={
          <ProtectedRoute>
            <PopupLayout />
          </ProtectedRoute>
        }
      >
        <Route path={ROUTES.pgTransactionDetail()} element={<PgTransactionDetailPage />} />
      </Route>
    </Routes>
  );
}
