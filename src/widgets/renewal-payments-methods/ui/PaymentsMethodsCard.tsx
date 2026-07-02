import React, { useMemo, useRef, useState } from 'react';
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
} from "@/shared/ui/renewal";
import { t } from "@/shared/ui/renewal";
import { PaymentGroup, PaymentsMethodsData } from "@/entities/dashboard-renewal";
import { IconCalendar, IconChevronRight, IconDownload, IconInfo } from "@/shared/ui/renewal";

/* ── Figma spec (node 148:29057 › Chart › Plot area) ────────────────
 * half-donut, sweep 180° (9 o'clock → 3 o'clock), outer Ø279
 * segment thickness shrinks per rank: innerRadius ratio 0.70 + 0.05·i (max 0.97)
 * palette: #51A2FF #FFBA00 #7C86FF #C27AFF #FF6467 #FFDF20 #9AE600 #00D5BE
 * center label: group name (#0f172b/50%) + share% (#1D293D, 20px/700)
 * legend bullet: 8×8 rounded square
 * ─────────────────────────────────────────────────────────────────── */
const OUTER_R = 139.5;
const VIEW_W = 320;
const VIEW_H = 158;
const GAP_DEG = 2;
const MIN_DEG = 3;

const ChipsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
`;

const ChipsScroll = styled.div`
  display: flex;
  gap: 10px;
  overflow-x: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const Chip = styled.button<{ $selected: boolean }>`
  flex: none;
  padding: 9px 16px;
  border-radius: ${t.radius.chip}px;
  border: 1px solid ${(p) => (p.$selected ? t.color.chipSelectedBorder : t.color.border)};
  background: ${(p) => (p.$selected ? t.color.chipSelectedBg : t.color.cardBg)};
  color: ${(p) => (p.$selected ? t.color.blue600 : t.color.textStrong)};
  font-family: ${t.font.family};
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: ${(p) => (p.$selected ? t.color.chipSelectedBg : t.color.chipBg)};
  }
`;

const ScrollBtn = styled.button`
  flex: none;
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid ${t.color.border};
  border-radius: ${t.radius.chip}px;
  background: ${t.color.cardBg};
  color: ${t.color.textMuted};
  cursor: pointer;

  &:hover {
    background: ${t.color.pageBg};
  }
`;

const UnitNote = styled.div`
  text-align: right;
  margin-top: 14px;
  font-size: 12px;
  color: ${t.color.textFaint};
`;

const Groups = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 48px;
  margin-top: 8px;
`;

const GroupCol = styled.div`
  min-width: 0;
`;

const DonutWrap = styled.div`
  position: relative;
  max-width: ${VIEW_W}px;
  margin: 0 auto;
`;

const DonutCenter = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  text-align: center;
  pointer-events: none;
`;

const DonutLabel = styled.div`
  font-size: 13px;
  color: ${t.color.textFaint};
`;

const DonutShare = styled.div`
  margin-top: 2px;
  font-family: ${t.font.numeric};
  font-size: 20px;
  font-weight: 700;
  color: ${t.color.textStrong};
`;

const TipHolder = styled.div`
  position: absolute;
  transform: translate(-50%, -100%);
  padding-bottom: 8px;
  pointer-events: none;
  z-index: 3;
`;

const LegendGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 22px 16px;
  margin-top: 22px;
`;

const LegendItem = styled.div`
  min-width: 0;
`;

const LegendName = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: ${t.color.textFaint};

  svg {
    color: rgba(69, 85, 108, 0.3);
    flex: none;
  }
`;

const Bullet = styled.span<{ $color: string }>`
  flex: none;
  width: 8px;
  height: 8px;
  border-radius: 2px;
  background: ${(p) => p.$color};
`;

const LegendValue = styled.div`
  margin-top: 6px;
  padding-left: 14px;
  font-family: ${t.font.numeric};
  font-size: 16px;
  font-weight: 700;
  color: ${t.color.textStrong};
`;

const RatioBadge = styled.span`
  padding: 2px 8px;
  border-radius: ${t.radius.badge}px;
  background: ${t.color.chipSelectedBg};
  color: ${t.color.blue600};
  font-size: 12px;
  font-weight: 600;
`;

const fmt = (n: number) => n.toLocaleString('en-US');
const rad = (deg: number) => (deg * Math.PI) / 180;

interface Segment {
  startDeg: number; // 0 = 9 o'clock, 180 = 3 o'clock
  endDeg: number;
  innerR: number;
  midDeg: number;
}

/**
 * Distributes segments across the 180° sweep proportionally to their ratio
 * (normalized to the actual sum, so API data doesn't need to add up to 100).
 * Tiny segments are guaranteed MIN_DEG so they stay visible.
 */
const computeSegments = (ratios: number[]): Segment[] => {
  const total = ratios.reduce((a, b) => a + (b > 0 ? b : 0), 0);
  if (total <= 0) return [];
  const gaps = GAP_DEG * Math.max(0, ratios.length - 1);
  const usable = 180 - gaps;
  let deg = ratios.map((r) => (Math.max(0, r) / total) * usable);
  // enforce minimum visible angle, stealing from the largest segment
  const largest = deg.indexOf(Math.max(...deg));
  deg = deg.map((d, i) => (i === largest ? d : Math.max(d, MIN_DEG)));
  const overflow = deg.reduce((a, b) => a + b, 0) - usable;
  deg[largest] = Math.max(MIN_DEG, deg[largest] - overflow);

  let cursor = 0;
  return deg.map((d, i) => {
    const startDeg = cursor;
    const endDeg = cursor + d;
    cursor = endDeg + GAP_DEG;
    return {
      startDeg,
      endDeg,
      midDeg: (startDeg + endDeg) / 2,
      innerR: OUTER_R * Math.min(0.97, 0.7 + 0.05 * i),
    };
  });
};

/** annular sector path; angles in degrees where 0°=9 o'clock, 180°=3 o'clock */
const sectorPath = (startDeg: number, endDeg: number, innerR: number) => {
  const cx = VIEW_W / 2;
  const cy = VIEW_H - 2;
  const pt = (deg: number, r: number) => {
    const a = rad(180 + deg); // SVG angle: 180°=9 o'clock, sweeping over the top
    return `${cx + r * Math.cos(a)} ${cy + r * Math.sin(a)}`;
  };
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return [
    `M ${pt(startDeg, OUTER_R)}`,
    `A ${OUTER_R} ${OUTER_R} 0 ${large} 1 ${pt(endDeg, OUTER_R)}`,
    `L ${pt(endDeg, innerR)}`,
    `A ${innerR} ${innerR} 0 ${large} 0 ${pt(startDeg, innerR)}`,
    'Z',
  ].join(' ');
};

const DonutGroup: React.FC<{ group: PaymentGroup }> = ({ group }) => {
  const [hover, setHover] = useState<number | null>(null);

  const segments = useMemo(
    () => computeSegments(group.methods.map((m) => m.ratio)),
    [group.methods],
  );

  const hoveredMethod = hover !== null ? group.methods[hover] : null;
  const hoveredSeg = hover !== null ? segments[hover] : null;

  const tipPos = (seg: Segment) => {
    const a = rad(180 + seg.midDeg);
    const r = (OUTER_R + seg.innerR) / 2;
    return {
      left: VIEW_W / 2 + r * Math.cos(a),
      top: VIEW_H - 2 + r * Math.sin(a),
    };
  };

  return (
    <GroupCol>
      <DonutWrap>
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          width="100%"
          role="img"
          aria-label={`${group.label} ${group.share}%`}
        >
          {segments.map((seg, i) => (
            <path
              key={i}
              d={sectorPath(seg.startDeg, seg.endDeg, seg.innerR)}
              fill={t.chartPalette[i % t.chartPalette.length]}
              opacity={hover !== null && hover !== i ? 0.4 : 1}
              style={{ transition: 'opacity 0.15s', cursor: 'pointer' }}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            />
          ))}
        </svg>
        <DonutCenter>
          <DonutLabel>{group.label}</DonutLabel>
          <DonutShare>{group.share}%</DonutShare>
        </DonutCenter>
        {hoveredMethod && hoveredSeg && (
          <TipHolder style={tipPos(hoveredSeg)}>
            <TooltipCard>
              <TooltipTitleRow>
                {hoveredMethod.name}
                <RatioBadge>{hoveredMethod.ratio}%</RatioBadge>
              </TooltipTitleRow>
              <TooltipRow>
                <TooltipRowLabel>Amount</TooltipRowLabel>
                <TooltipRowValue>
                  {fmt(hoveredMethod.amount)} <small>KRW</small>
                </TooltipRowValue>
              </TooltipRow>
              <TooltipRow>
                <TooltipRowLabel>Count</TooltipRowLabel>
                <TooltipRowValue>
                  {fmt(hoveredMethod.count)} <small>TXs</small>
                </TooltipRowValue>
              </TooltipRow>
            </TooltipCard>
          </TipHolder>
        )}
      </DonutWrap>

      <LegendGrid>
        {group.methods.map((m, i) => (
          <LegendItem key={i}>
            <LegendName>
              <Bullet $color={t.chartPalette[i % t.chartPalette.length]} />
              {m.name}
              <IconInfo size={12} />
            </LegendName>
            <LegendValue>{m.ratio}%</LegendValue>
          </LegendItem>
        ))}
      </LegendGrid>
    </GroupCol>
  );
};

interface Props {
  data: PaymentsMethodsData;
  onDownload?: () => void;
}

const PaymentsMethodsCard: React.FC<Props> = ({ data, onDownload }) => {
  const [selected, setSelected] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const current = useMemo(() => data.countries[selected] || data.countries[0], [data, selected]);

  const scrollRight = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: 280, behavior: 'smooth' });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payments Methods</CardTitle>
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

      <ChipsRow>
        <ChipsScroll ref={scrollRef}>
          {data.countries.map((c, i) => (
            <Chip key={c.country} $selected={i === selected} onClick={() => setSelected(i)}>
              {c.country}
            </Chip>
          ))}
        </ChipsScroll>
        <ScrollBtn aria-label="Scroll countries" onClick={scrollRight}>
          <IconChevronRight />
        </ScrollBtn>
      </ChipsRow>

      <UnitNote>Unit (%)</UnitNote>

      <Groups>
        {current.groups.map((g) => (
          <DonutGroup key={g.key} group={g} />
        ))}
      </Groups>
    </Card>
  );
};

export default PaymentsMethodsCard;
