import React, { useState } from 'react';
import styled from 'styled-components';
import {
  Card,
  CardHeader,
  CardTitle,
  GhostButton,
  HeaderRight,
  MetaText,
  TooltipCard,
  TooltipRow,
  TooltipRowLabel,
  TooltipRowValue,
  TooltipTitleRow,
  UnitLegend,
  UnitLegendItem,
} from "@/shared/ui/renewal";
import { t } from "@/shared/ui/renewal";
import { CountryStat, TopCountriesData } from "@/entities/dashboard-renewal";
import { IconCalendar, IconDownload } from "@/shared/ui/renewal";

const Charts = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 48px;
  margin-top: 24px;
`;

const ChartCol = styled.div`
  min-width: 0;
`;

const Row = styled.div`
  position: relative;
  display: flex;
  align-items: flex-end;
  gap: 14px;
  padding: 10px 0 12px;
`;

const Rank = styled.span`
  width: 12px;
  flex: none;
  font-size: 11px;
  color: ${t.color.textFaint};
  align-self: center;
`;

const BarZone = styled.div`
  flex: 1 1 0;
  min-width: 0;
`;

const CountryName = styled.div`
  font-size: 12px;
  font-weight: 500;
  color: ${t.color.textBody};
  margin-bottom: 6px;
`;

const Track = styled.div`
  height: 8px;
  border-radius: ${t.radius.pill}px;
`;

const Fill = styled.div<{ $w: number; $gradient?: string }>`
  height: 100%;
  width: ${(p) => p.$w}%;
  border-radius: ${t.radius.pill}px;
  background: ${(p) => p.$gradient || t.color.track};
  transition: width 0.4s ease;
`;

const GridBg = styled.div<{ $ticks: number }>`
  position: absolute;
  inset: 0 0 26px 26px;
  background-image: repeating-linear-gradient(
    to right,
    ${t.color.divider} 0,
    ${t.color.divider} 1px,
    transparent 1px,
    transparent calc(100% / ${(p) => p.$ticks})
  );
  background-position: right;
  pointer-events: none;
`;

const Body = styled.div`
  position: relative;
`;

const Axis = styled.div`
  display: flex;
  justify-content: space-between;
  padding-left: 26px;
  margin-top: 8px;
  font-size: 11px;
  color: ${t.color.textFaint};
`;

const RankBadge = styled.span`
  padding: 2px 8px;
  border-radius: ${t.radius.badge}px;
  background: ${t.color.chipSelectedBg};
  color: ${t.color.blue600};
  font-size: 11px;
  font-weight: 600;
`;

const HoverTip = styled.div`
  position: absolute;
  left: 40%;
  top: -8px;
  z-index: 3;
`;

const gradients = {
  blue: `linear-gradient(90deg, ${t.gradient.barBlue[1]} 0%, ${t.gradient.barBlue[0]} 100%)`,
  yellow: `linear-gradient(90deg, ${t.gradient.barYellow[1]} 0%, ${t.gradient.barYellow[0]} 100%)`,
};

const ordinal = (n: number) => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

const fmt = (n: number) => n.toLocaleString('en-US');

interface ListProps {
  items: CountryStat[];
  metric: 'amount' | 'count';
  max: number;
  tickCount: number;
  accent: 'blue' | 'yellow';
}

const CountryList: React.FC<ListProps> = ({ items, metric, max, tickCount, accent }) => {
  const [hover, setHover] = useState<number | null>(null);
  const ticks = Array.from({ length: tickCount + 1 }, (_, i) => Math.round((max / tickCount) * i));

  return (
    <ChartCol>
      <Body>
        <GridBg $ticks={tickCount} />
        {items.map((c, i) => (
          <Row
            key={c.name}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
          >
            <Rank>{i + 1}</Rank>
            <BarZone>
              <CountryName>{c.name}</CountryName>
              <Track>
                <Fill
                  $w={(c[metric] / max) * 100}
                  $gradient={i === 0 ? gradients[accent] : undefined}
                />
              </Track>
            </BarZone>
            {hover === i && (
              <HoverTip>
                <TooltipCard>
                  <TooltipTitleRow>
                    {c.name}
                    <RankBadge>{ordinal(i + 1)}</RankBadge>
                  </TooltipTitleRow>
                  <TooltipRow>
                    <TooltipRowLabel>Amount</TooltipRowLabel>
                    <TooltipRowValue>
                      {fmt(c.rawAmount)} <small>KRW</small>
                    </TooltipRowValue>
                  </TooltipRow>
                  <TooltipRow>
                    <TooltipRowLabel>Count</TooltipRowLabel>
                    <TooltipRowValue>
                      {fmt(c.rawCount)} <small>TXs</small>
                    </TooltipRowValue>
                  </TooltipRow>
                </TooltipCard>
              </HoverTip>
            )}
          </Row>
        ))}
      </Body>
      <Axis>
        {ticks.map((v) => (
          <span key={v}>{v}</span>
        ))}
      </Axis>
    </ChartCol>
  );
};

interface Props {
  data: TopCountriesData;
  onDownload?: () => void;
}

const TopCountriesCard: React.FC<Props> = ({ data, onDownload }) => {
  const maxAmount = Math.max(...data.byAmount.map((c) => c.amount));
  const maxCount = Math.max(...data.byCount.map((c) => c.count));
  // round the axis max up to a clean step
  const axisMax = (v: number) => Math.ceil(v / 50) * 50;
  const axisMaxCount = (v: number) => Math.ceil(v / 5) * 5;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top 5 Countries</CardTitle>
        <HeaderRight>
          <MetaText>
            <IconCalendar />
            Last updated {data.lastUpdated}
          </MetaText>
          <GhostButton onClick={onDownload}>
            <IconDownload />
            Download File
          </GhostButton>
        </HeaderRight>
      </CardHeader>

      <UnitLegend style={{ marginTop: 14 }}>
        <UnitLegendItem $color={t.color.blue600}>
          <b>Amount</b> {data.amountUnitLabel}
        </UnitLegendItem>
        <UnitLegendItem $color={t.color.yellow}>
          <b>Count</b> {data.countUnitLabel}
        </UnitLegendItem>
      </UnitLegend>

      <Charts>
        <CountryList
          items={data.byAmount}
          metric="amount"
          max={axisMax(maxAmount)}
          tickCount={10}
          accent="blue"
        />
        <CountryList
          items={data.byCount}
          metric="count"
          max={axisMaxCount(maxCount)}
          tickCount={10}
          accent="yellow"
        />
      </Charts>
    </Card>
  );
};

export default TopCountriesCard;
