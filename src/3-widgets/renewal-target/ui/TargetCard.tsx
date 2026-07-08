import React, { useState } from 'react';
import styled from 'styled-components';
import { Card, CardHeader, CardTitle } from "@/shared/ui/renewal";
import { t } from "@/shared/ui/renewal";
import { TargetData } from "@/entities/dashboard-renewal";
import { IconInfo } from "@/shared/ui/renewal";

const Desc = styled.p`
  margin: 0;
  padding-left: 16px;
  border-left: 1px solid ${t.color.border};
  font-size: 11px;
  line-height: 14px;
  color: ${t.color.textFaint};
  max-width: 300px;
`;

const GaugeWrap = styled.div`
  position: relative;
  width: 320px;
  max-width: 100%;
  margin: 26px auto 10px;
`;

const GaugeLabels = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 2px 12px 0;
  font-size: 11px;
  color: ${t.color.textFaint};
`;

const CenterBlock = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 6px;
  text-align: center;
`;

const RateText = styled.div`
  font-family: ${t.font.numeric};
  font-size: 34px;
  font-weight: 700;
  color: ${t.color.blue500};
  letter-spacing: -0.01em;
`;

const RefText = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-top: 6px;
  font-size: 11px;
  color: ${t.color.textFaint};
`;

const InfoButton = styled.button`
  border: 0;
  padding: 0;
  background: none;
  display: inline-flex;
  color: ${t.color.textFaint};
  cursor: pointer;

  &:hover {
    color: ${t.color.textStrong};
  }
`;

const Bubble = styled.div`
  position: absolute;
  left: 50%;
  bottom: calc(100% + 12px);
  transform: translateX(-50%);
  padding: 12px 18px;
  background: ${t.color.cardBg};
  border-radius: ${t.radius.card}px;
  box-shadow: ${t.shadow.tooltip};
  font-size: 13px;
  font-weight: 500;
  line-height: 20px;
  color: ${t.color.textStrong};
  white-space: nowrap;
  z-index: 2;

  &::after {
    content: '';
    position: absolute;
    left: 50%;
    top: 100%;
    transform: translateX(-50%);
    border: 7px solid transparent;
    border-top-color: ${t.color.cardBg};
  }
`;

const Tiles = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-top: 24px;
`;

const Tile = styled.div`
  background: ${t.color.tileBg};
  border-radius: ${t.radius.tile}px;
  padding: 16px;
`;

const TileValue = styled.div`
  font-family: ${t.font.numeric};
  font-size: 18px;
  font-weight: 600;
  color: ${t.color.textStrong};
`;

const TileLabel = styled.div`
  margin-top: 10px;
  font-size: 11px;
  line-height: 14px;
  color: ${t.color.textFaint};
`;

/* ── Figma spec: flat (butt) arc ends, value arc drawn over the full track ── */
const GAUGE_R = 134;
const GAUGE_SW = 26;

/** arc path along the top semicircle; 0°=left end, 180°=right end */
const gaugeArc = (startDeg: number, endDeg: number) => {
  const cx = 160;
  const cy = 158;
  const pt = (deg: number) => {
    const a = ((180 + deg) * Math.PI) / 180;
    return `${cx + GAUGE_R * Math.cos(a)} ${cy + GAUGE_R * Math.sin(a)}`;
  };
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${pt(startDeg)} A ${GAUGE_R} ${GAUGE_R} 0 ${large} 1 ${pt(endDeg)}`;
};

const Gauge: React.FC<{ value: number }> = ({ value }) => {
  const clamped = Math.max(0, Math.min(100, value));
  const valueDeg = (clamped / 100) * 180;
  return (
    <svg viewBox="0 0 320 172" width="100%" role="img" aria-label={`Achieved ${clamped}%`}>
      <defs>
        <linearGradient id="dr-gauge" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={t.gradient.gauge[0]} />
          <stop offset="100%" stopColor={t.gradient.gauge[1]} />
        </linearGradient>
      </defs>
      <path
        d={gaugeArc(0, 180)}
        fill="none"
        stroke={t.color.track}
        strokeWidth={GAUGE_SW}
        strokeLinecap="butt"
      />
      {valueDeg > 0 && (
        <path
          d={gaugeArc(0, valueDeg)}
          fill="none"
          stroke="url(#dr-gauge)"
          strokeWidth={GAUGE_SW}
          strokeLinecap="butt"
        />
      )}
    </svg>
  );
};

interface Props {
  data: TargetData;
  /** 'side' = right-rail card, 'wide' = full-width row (HideSection variant) */
  variant?: 'side' | 'wide';
}

const TargetCard: React.FC<Props> = ({ data, variant = 'side' }) => {
  const [showBubble, setShowBubble] = useState(false);
  const wide = variant === 'wide';

  return (
    <Card>
      <CardHeader style={{ justifyContent: 'flex-start', gap: 16 }}>
        <CardTitle>Target</CardTitle>
        <Desc>Targets are based on the highest transaction amount from the last 6 months.</Desc>
      </CardHeader>

      <GaugeWrap style={wide ? { width: 380, marginTop: 40 } : undefined}>
        <Gauge value={data.achievedRate} />
        <CenterBlock>
          {showBubble && (
            <Bubble>
              {data.remainingDisplay} left
              <br />
              to reach your goal.
            </Bubble>
          )}
          <RateText>{data.achievedRate}%</RateText>
          <RefText>
            Ref. Year-Month {data.refYearMonth}
            <InfoButton
              aria-label="What is this target?"
              onMouseEnter={() => setShowBubble(true)}
              onMouseLeave={() => setShowBubble(false)}
              onFocus={() => setShowBubble(true)}
              onBlur={() => setShowBubble(false)}
            >
              <IconInfo />
            </InfoButton>
          </RefText>
        </CenterBlock>
        <GaugeLabels>
          <span>0</span>
          <span>100%</span>
        </GaugeLabels>
      </GaugeWrap>

      <Tiles style={wide ? { maxWidth: 760, margin: '34px auto 0' } : undefined}>
        <Tile>
          <TileValue>{data.avgAmount6m}</TileValue>
          <TileLabel>
            Avg. Transaction
            <br />
            Amount (6M)
          </TileLabel>
        </Tile>
        <Tile>
          <TileValue>{data.yesterdayVolume}</TileValue>
          <TileLabel>
            Yesterday's
            <br />
            Volume
          </TileLabel>
        </Tile>
        <Tile>
          <TileValue>{data.averageDailyVolume}</TileValue>
          <TileLabel>
            Average Daily
            <br />
            Volume (ADV)
          </TileLabel>
        </Tile>
      </Tiles>
    </Card>
  );
};

export default TargetCard;
