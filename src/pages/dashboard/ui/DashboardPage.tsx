import { Card, CardHeader, CardTitle, CardContent, Meter, IconUsers, IconOrders, IconProducts } from "@/shared/ui";
import { formatCurrency, formatNumber } from "@/shared/lib";
import { PageHeader } from "@/widgets/page-header";
import { StatCard } from "@/widgets/stat-card";
import { RecentOrders } from "@/widgets/recent-orders";

/**
 * DashboardPage — 라우트 `/` (page).
 *
 * 여러 widget(StatCard·RecentOrders)과 shared(Meter)를 한 화면으로 조립한다.
 * page 는 데이터 표시값을 결정하고 배치만 한다 — KPI 카드/리스트의 내부 구현은 widget 몫.
 */
export function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="대시보드" description="오늘의 주요 지표 요약입니다." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="오늘 매출" value={formatCurrency(8240000)} delta={12} icon={IconOrders} />
        <StatCard label="신규 사용자" value={formatNumber(128)} delta={4} icon={IconUsers} />
        <StatCard label="판매 상품" value={formatNumber(64)} delta={-3} icon={IconProducts} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentOrders />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>리소스 사용량</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            {/* 킷의 Meter 컴포넌트를 그대로 사용 (shared) */}
            <Meter label="스토리지" value={68} showLabels showSecondaryLabel />
            <Meter label="API 호출" value={42} showLabels showSecondaryLabel />
            <Meter label="대역폭" value={87} showLabels showSecondaryLabel />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
