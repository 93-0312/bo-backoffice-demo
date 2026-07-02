import { useEffect, useState } from "react";
import styled from "styled-components";
import { t } from "@/shared/ui/renewal";
import {
  fetchDashboardRenewal,
  type DashboardRenewalData,
  type NoticeItem,
} from "@/entities/dashboard-renewal";
import { TopInfoBar } from "@/widgets/renewal-top-info";
import { TransactionStatusCard } from "@/widgets/renewal-transaction-status";
import { TargetCard } from "@/widgets/renewal-target";
import { TopCountriesCard } from "@/widgets/renewal-top-countries";
import { NoticeCard } from "@/widgets/renewal-notice";
import { PaymentsMethodsCard } from "@/widgets/renewal-payments-methods";
import { DEFAULT_LAYOUT, type LayoutRow, type WidgetId } from "../model/layout";

/**
 * DashboardRenewalPage — 라우트 `/dashboard-renewal` (page).
 *
 * 리뉴얼 대시보드(Figma "BO_Design_리뉴얼")를 구 BO 에 선적용하는 화면.
 * page 는 데이터 로딩과 벤토 배치만 담당하고, 각 카드의 내부 구현은
 * widgets/renewal-* 슬라이스 몫이다. 배치는 model/layout 의 행 배열로 제어한다.
 */
const Root = styled.div`
  font-family: ${t.font.family};
  color: ${t.color.textStrong};
  background: ${t.color.pageBg};
  margin: -24px;
  min-height: calc(100% + 48px);
`;

const Rows = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${t.layout.gap}px;
  padding: 0 26px 32px;
`;

const Row = styled.div<{ $hasSide: boolean }>`
  display: grid;
  grid-template-columns: ${(p) =>
    p.$hasSide ? `minmax(0, 1fr) ${t.layout.sideWidth}px` : "minmax(0, 1fr)"};
  gap: ${t.layout.gap}px;
  align-items: stretch;

  @media (max-width: 1280px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

export function DashboardRenewalPage({ layout = DEFAULT_LAYOUT }: { layout?: LayoutRow[] }) {
  const [data, setData] = useState<DashboardRenewalData | null>(null);

  useEffect(() => {
    let alive = true;
    fetchDashboardRenewal().then((d) => alive && setData(d));
    return () => {
      alive = false;
    };
  }, []);

  if (!data) return null;

  const handleDownload = (section: "topCountries" | "paymentsMethods") => {
    // 실서비스: 통화 매핑 엑셀 다운로드 (구 BO xlsx 유틸 연결 지점)
    console.log("[dashboard-renewal] download:", section);
  };

  const handleNoticeClick = (item: NoticeItem) => {
    console.log("[dashboard-renewal] notice:", item.id);
  };

  const renderWidget = (id: WidgetId, position: "main" | "side") => {
    switch (id) {
      case "transactionStatus":
        return <TransactionStatusCard data={data.trend} />;
      case "target":
        return <TargetCard data={data.target} variant={position === "main" ? "wide" : "side"} />;
      case "topCountries":
        return (
          <TopCountriesCard
            data={data.topCountries}
            onDownload={() => handleDownload("topCountries")}
          />
        );
      case "notice":
        return <NoticeCard items={data.notices} onItemClick={handleNoticeClick} />;
      case "paymentsMethods":
        return (
          <PaymentsMethodsCard
            data={data.payments}
            onDownload={() => handleDownload("paymentsMethods")}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Root>
      <TopInfoBar data={data.topInfo} />
      <Rows>
        {layout.map((row, i) => (
          <Row key={`${row.main}-${i}`} $hasSide={!!row.side}>
            {renderWidget(row.main, "main")}
            {row.side ? renderWidget(row.side, "side") : null}
          </Row>
        ))}
      </Rows>
    </Root>
  );
}
