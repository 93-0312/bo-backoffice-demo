import { useEffect, useState } from "react";
import styled from "styled-components";
import { t } from "@/shared/ui/renewal";
import { fetchDashboardRenewal, type DashboardRenewalData } from "@/entities/dashboard-renewal";
import { TopInfoBar } from "@/widgets/renewal-top-info";
import { TransactionStatusCard } from "@/widgets/renewal-transaction-status";
import { TargetCard } from "@/widgets/renewal-target";
import { TopCountriesCard } from "@/widgets/renewal-top-countries";
import { NoticeCard } from "@/widgets/renewal-notice";
import { PaymentsMethodsCard } from "@/widgets/renewal-payments-methods";
import { LAYOUTS, type Variant, type WidgetId } from "../model/layout";

/**
 * DashboardRenewal2Page — 라우트 `/dashboard-renewal-2` (page).
 *
 * 리뉴얼 대시보드의 A/B 변형. 배치 정의(LAYOUTS)는 model 에 있고, page 는 어떤 variant 를
 * 쓸지 고른다. variant 선택은 이 페이지의 로컬 UI 상태(useState)로 둔다 — 토글 하나뿐이라
 * 아직 model 훅으로 뺄 필요 없다. URL 동기화/영속화가 붙으면 그때 model 로 승격.
 */
const Root = styled.div`
  font-family: ${t.font.family};
  color: ${t.color.textStrong};
  background: ${t.color.pageBg};
  margin: -24px;
  min-height: calc(100% + 48px);
`;

const Toolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  padding: 0 26px 16px;
`;

const ToolbarLabel = styled.span`
  font-size: 12px;
  color: ${t.color.textFaint};
`;

const Segmented = styled.div`
  display: inline-flex;
  padding: 2px;
  border-radius: ${t.radius.pill}px;
  background: ${t.color.tileBg};
`;

const SegmentBtn = styled.button<{ $active: boolean }>`
  border: 0;
  padding: 8px 18px;
  border-radius: ${t.radius.pill}px;
  font-family: ${t.font.family};
  font-size: 12px;
  font-weight: ${(p) => (p.$active ? 600 : 500)};
  color: ${(p) => (p.$active ? t.color.textStrong : t.color.textFaint)};
  background: ${(p) => (p.$active ? t.color.cardBg : "transparent")};
  box-shadow: ${(p) => (p.$active ? t.shadow.segment : "none")};
  cursor: pointer;
  transition: all 0.15s ease;
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

export function DashboardRenewal2Page({ variant: initialVariant = "B" }: { variant?: Variant }) {
  const [data, setData] = useState<DashboardRenewalData | null>(null);
  const [variant, setVariant] = useState<Variant>(initialVariant);

  useEffect(() => {
    let alive = true;
    fetchDashboardRenewal().then((d) => alive && setData(d));
    return () => {
      alive = false;
    };
  }, []);

  if (!data) return null;

  const layout = LAYOUTS[variant];

  const renderWidget = (id: WidgetId, position: "main" | "side") => {
    switch (id) {
      case "transactionStatus":
        return <TransactionStatusCard data={data.trend} />;
      case "target":
        return <TargetCard data={data.target} variant={position === "main" ? "wide" : "side"} />;
      case "topCountries":
        return <TopCountriesCard data={data.topCountries} />;
      case "notice":
        return <NoticeCard items={data.notices} />;
      case "paymentsMethods":
        return <PaymentsMethodsCard data={data.payments} />;
      default:
        return null;
    }
  };

  return (
    <Root>
      <TopInfoBar data={data.topInfo} />
      <Toolbar>
        <ToolbarLabel>레이아웃</ToolbarLabel>
        <Segmented role="tablist" aria-label="레이아웃 변형 선택">
          {(["A", "B"] as const).map((v) => (
            <SegmentBtn
              key={v}
              role="tab"
              aria-selected={variant === v}
              $active={variant === v}
              onClick={() => setVariant(v)}
            >
              {v}안
            </SegmentBtn>
          ))}
        </Segmented>
      </Toolbar>
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
