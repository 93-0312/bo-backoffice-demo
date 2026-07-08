import React, { useMemo, useState } from "react";
import styled from "styled-components";
import {
  Card,
  CardHeader,
  CardTitle,
  TooltipCard,
  TooltipRow,
  TooltipRowLabel,
  TooltipRowValue,
  TooltipTitleRow,
  UnitLegend,
  UnitLegendItem,
} from "@/shared/ui/renewal";
import { t } from "@/shared/ui/renewal";
import { PeriodKey, TransactionTrendData } from "@/entities/dashboard-renewal";
import { useContainerWidth } from "@/shared/hooks";

/* ── Figma spec (node 97:10690 › Chart, 2026-07-02 revision) ────────
 * Amount: single blue bar per slot — 40px wide, top corners r4,
 *         gradient #8EC5FF→#2B7FFF
 * Count:  yellow polyline #FFBA00 2px (corner smoothing r10),
 *         markers Ø8 white fill + yellow stroke,
 *         area under line #FFF085→#FFFFFF
 * plot 292px · 8 gridline rows · y-labels both sides (#0f172b/50%)
 * ─────────────────────────────────────────────────────────────────── */
const PLOT_H = 292;
const ROWS = 8;
const BAR_W = 40;
const LINE_SMOOTH = 10;
const MARKER_R = 4;
const LABEL_H = 34;
const Y_LABEL_W = 44;

const Segmented = styled.div`
  display: inline-flex;
  padding: 2px;
  border-radius: ${t.radius.pill}px;
  background: ${t.color.tileBg};
`;

const SegmentBtn = styled.button<{ $active: boolean }>`
  border: 0;
  padding: 8px 16px;
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

const ChartWrap = styled.div`
  position: relative;
  margin-top: 20px;
`;

const TipHolder = styled.div`
  position: absolute;
  transform: translate(-50%, -100%);
  padding-bottom: 10px;
  pointer-events: none;
  z-index: 3;
`;

const fmt = (n: number) => n.toLocaleString("en-US");

/** round the axis max up to 1/2/2.5/5 × 10^k so tick labels stay clean */
const niceMax = (v: number) => {
  if (v <= 0) return ROWS;
  const raw = v / ROWS;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const step = [1, 2, 2.5, 5, 10].find((s) => s * mag >= raw) || 10;
  return step * mag * ROWS;
};

/** rect with only the top corners rounded (Figma rectangleCornerRadii [4,4,0,0]) */
const topRoundedRect = (
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) => {
  const rr = Math.min(r, h, w / 2);
  return [
    `M ${x} ${y + h}`,
    `L ${x} ${y + rr}`,
    `Q ${x} ${y} ${x + rr} ${y}`,
    `L ${x + w - rr} ${y}`,
    `Q ${x + w} ${y} ${x + w} ${y + rr}`,
    `L ${x + w} ${y + h}`,
    "Z",
  ].join(" ");
};

interface Pt {
  x: number;
  y: number;
}

/**
 * Polyline through the points with each corner smoothed by a quadratic curve
 * (Figma vector corner-radius 10). Offsets are clamped to half the shorter
 * adjacent segment so short segments don't overshoot.
 */
const smoothedLinePath = (pts: Pt[], radius: number) => {
  if (pts.length < 2) return "";
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const prev = pts[i - 1];
    const cur = pts[i];
    const next = pts[i + 1];
    const inLen = Math.hypot(cur.x - prev.x, cur.y - prev.y);
    const outLen = Math.hypot(next.x - cur.x, next.y - cur.y);
    const r = Math.min(radius, inLen / 2, outLen / 2);
    const inX = cur.x - ((cur.x - prev.x) / inLen) * r;
    const inY = cur.y - ((cur.y - prev.y) / inLen) * r;
    const outX = cur.x + ((next.x - cur.x) / outLen) * r;
    const outY = cur.y + ((next.y - cur.y) / outLen) * r;
    d += ` L ${inX} ${inY} Q ${cur.x} ${cur.y} ${outX} ${outY}`;
  }
  d += ` L ${pts[pts.length - 1].x} ${pts[pts.length - 1].y}`;
  return d;
};

interface Props {
  data: TransactionTrendData;
}

const TransactionStatusCard: React.FC<Props> = ({ data }) => {
  const [period, setPeriod] = useState<PeriodKey>("7d");
  const [hover, setHover] = useState<number | null>(null);
  const [wrapRef, width] = useContainerWidth<HTMLDivElement>();

  const points = period === "7d" ? data.recent7d : data.recent6m;

  const scale = useMemo(() => {
    const amountMax = niceMax(
      Math.max(0, ...points.map((p) => p.amount / 10000)),
    );
    // over-scale the count axis ×1.5 so the line sits in the lower ~2/3 of the
    // plot, matching the Figma proportions (line peaks at ~70% height)
    const countMax = niceMax(
      Math.max(0, ...points.map((p) => p.count / 100)) * 1.5,
    );
    return { amountMax, countMax };
  }, [points]);

  const plotW = Math.max(0, width - Y_LABEL_W * 2);
  const slotW = points.length > 0 ? plotW / points.length : 0;
  const svgH = PLOT_H + LABEL_H;

  const yFor = (ratio: number) => PLOT_H * (1 - ratio);
  const gridYs = Array.from({ length: ROWS + 1 }, (_, i) => yFor(i / ROWS));

  const linePts: Pt[] = useMemo(
    () =>
      points.map((p, i) => ({
        x: Y_LABEL_W + slotW * i + slotW / 2,
        y: yFor(scale.countMax > 0 ? p.count / 100 / scale.countMax : 0),
      })),
    [points, slotW, scale],
  );

  const areaPath = useMemo(() => {
    if (linePts.length < 2) return "";
    return (
      smoothedLinePath(linePts, LINE_SMOOTH) +
      ` L ${linePts[linePts.length - 1].x} ${PLOT_H}` +
      ` L ${linePts[0].x} ${PLOT_H} Z`
    );
  }, [linePts]);

  const hovered = hover !== null ? points[hover] : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction status</CardTitle>
        <Segmented>
          <SegmentBtn $active={period === "7d"} onClick={() => setPeriod("7d")}>
            Recent 7D
          </SegmentBtn>
          <SegmentBtn $active={period === "6m"} onClick={() => setPeriod("6m")}>
            Recent 6M
          </SegmentBtn>
        </Segmented>
      </CardHeader>

      <UnitLegend style={{ marginTop: 16 }}>
        <UnitLegendItem $color={t.color.blue500}>
          <b>Amount</b> {data.amountUnitLabel}
        </UnitLegendItem>
        <UnitLegendItem $color={t.color.yellow}>
          <b>Count</b> {data.countUnitLabel}
        </UnitLegendItem>
      </UnitLegend>

      <ChartWrap ref={wrapRef}>
        {width > 0 && (
          <svg
            width={width}
            height={svgH}
            role="img"
            aria-label="Transaction status chart"
          >
            <defs>
              <linearGradient id="dr-ts-blue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={t.gradient.barBlue[0]} />
                <stop offset="100%" stopColor={t.gradient.barBlue[1]} />
              </linearGradient>
              <linearGradient id="dr-ts-area" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor={t.gradient.lineArea[0]}
                  stopOpacity="0.55"
                />
                <stop
                  offset="100%"
                  stopColor={t.gradient.lineArea[1]}
                  stopOpacity="0"
                />
              </linearGradient>
            </defs>

            {/* count area sits behind the bars (Figma z-order: area → bars → line) */}
            {areaPath && <path d={areaPath} fill="url(#dr-ts-area)" />}

            {/* gridlines + y labels (both sides) */}
            {gridYs.map((y, i) => {
              const amountTick = (scale.amountMax / ROWS) * i;
              const countTick = (scale.countMax / ROWS) * i;
              return (
                <g key={i}>
                  <line
                    x1={Y_LABEL_W}
                    x2={Y_LABEL_W + plotW}
                    y1={y}
                    y2={y}
                    stroke={t.color.divider}
                  />
                  <text
                    x={Y_LABEL_W - 8}
                    y={y + 4}
                    textAnchor="end"
                    fontSize="11"
                    fontFamily={t.font.family}
                    fill={t.color.textFaint}
                  >
                    {fmt(amountTick)}
                  </text>
                  <text
                    x={Y_LABEL_W + plotW + 8}
                    y={y + 4}
                    textAnchor="start"
                    fontSize="11"
                    fontFamily={t.font.family}
                    fill={t.color.textFaint}
                  >
                    {fmt(countTick)}
                  </text>
                </g>
              );
            })}

            {/* amount bars */}
            {points.map((p, i) => {
              const cx = Y_LABEL_W + slotW * i + slotW / 2;
              const bh =
                scale.amountMax > 0
                  ? (p.amount / 10000 / scale.amountMax) * PLOT_H
                  : 0;
              const dim = hover !== null && hover !== i;
              return (
                <g
                  key={i}
                  opacity={dim ? 0.45 : 1}
                  style={{ transition: "opacity 0.15s" }}
                >
                  {bh > 0 && (
                    <path
                      d={topRoundedRect(
                        cx - BAR_W / 2,
                        yFor(bh / PLOT_H),
                        BAR_W,
                        bh,
                        4,
                      )}
                      fill="url(#dr-ts-blue)"
                    />
                  )}
                  <text
                    x={cx}
                    y={PLOT_H + 24}
                    textAnchor="middle"
                    fontSize="11"
                    fontFamily={t.font.family}
                    fill={t.color.textFaint}
                  >
                    {p.label}
                  </text>
                </g>
              );
            })}

            {/* count line + markers above the bars */}
            {linePts.length >= 2 && (
              <path
                d={smoothedLinePath(linePts, LINE_SMOOTH)}
                fill="none"
                stroke={t.color.yellow}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
            {linePts.map((pt, i) => (
              <circle
                key={i}
                cx={pt.x}
                cy={pt.y}
                r={MARKER_R}
                fill={t.color.cardBg}
                stroke={t.color.yellow}
                strokeWidth="2"
              />
            ))}

            {/* hover hit areas on top of everything */}
            {points.map((_, i) => (
              <rect
                key={i}
                x={Y_LABEL_W + slotW * i}
                y={0}
                width={slotW}
                height={PLOT_H}
                fill="transparent"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
              />
            ))}
          </svg>
        )}

        {hovered && hover !== null && (
          <TipHolder
            style={{
              left: Y_LABEL_W + slotW * hover + slotW / 2,
              top: yFor(
                scale.amountMax > 0
                  ? hovered.amount / 10000 / scale.amountMax
                  : 0,
              ),
            }}
          >
            <TooltipCard>
              <TooltipTitleRow>{hovered.label}</TooltipTitleRow>
              <TooltipRow>
                <TooltipRowLabel>Amount</TooltipRowLabel>
                <TooltipRowValue>
                  {fmt(hovered.amount)} <small>KRW</small>
                </TooltipRowValue>
              </TooltipRow>
              <TooltipRow>
                <TooltipRowLabel>Count</TooltipRowLabel>
                <TooltipRowValue>
                  {fmt(hovered.count)} <small>TXs</small>
                </TooltipRowValue>
              </TooltipRow>
            </TooltipCard>
          </TipHolder>
        )}
      </ChartWrap>
    </Card>
  );
};

export default TransactionStatusCard;
