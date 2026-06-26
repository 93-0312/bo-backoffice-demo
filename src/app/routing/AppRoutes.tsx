import { Routes, Route } from "react-router-dom";
import { ROUTES } from "@/shared/config";
import { AppLayout } from "@/app/layout/AppLayout";
import { ProtectedRoute } from "./ProtectedRoute";
import { LoginPage } from "@/pages/login";
import { DashboardPage } from "@/pages/dashboard";
import { UsersPage } from "@/pages/users";
import { ProductsPage } from "@/pages/products";
import { OrdersPage } from "@/pages/orders";
import { TransactionsPage } from "@/pages/transactions";
import { TransactionDetailPage } from "@/pages/transaction-detail";
import { SidListPage } from "@/pages/settlement-sids";
import { SellerTransactionsPage } from "@/pages/settlement-transactions";
import { SettlementListPage } from "@/pages/settlement-list";
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
        <Route path={ROUTES.dashboard} element={<DashboardPage />} />
        <Route path={ROUTES.users} element={<UsersPage />} />
        <Route path={ROUTES.products} element={<ProductsPage />} />
        <Route path={ROUTES.orders} element={<OrdersPage />} />
        <Route path={ROUTES.transactions} element={<TransactionsPage />} />
        <Route path={ROUTES.transactionDetail()} element={<TransactionDetailPage />} />
        <Route path={ROUTES.sidList} element={<SidListPage />} />
        <Route path={ROUTES.sellerTransactions} element={<SellerTransactionsPage />} />
        <Route path={ROUTES.settlementList} element={<SettlementListPage />} />
        <Route path={ROUTES.smeSettlements} element={<SettlementListPage sme />} />
        <Route path={ROUTES.settings} element={<SettingsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
