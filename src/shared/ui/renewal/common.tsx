import styled from 'styled-components';
import { t } from "./tokens";

export const Card = styled.section`
  background: ${t.color.cardBg};
  border-radius: ${t.radius.card}px;
  padding: 24px 26px 26px;
  min-width: 0;
  font-family: ${t.font.family};
`;

export const CardHeader = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: 36px;
`;

export const CardTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  line-height: 24px;
  color: ${t.color.textStrong};
  letter-spacing: -0.01em;
`;

export const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  color: ${t.color.textMuted};
  font-size: 12px;
`;

export const MetaText = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: ${t.color.textFaint};
`;

export const GhostButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border: 1px solid ${t.color.border};
  border-radius: ${t.radius.chip}px;
  background: ${t.color.cardBg};
  color: ${t.color.textStrong};
  font-family: ${t.font.family};
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover {
    background: ${t.color.pageBg};
  }
`;

/** Inline chart legend — "| Amount  Unit: 10,000 KRW  | Count  Unit: 100 TXs" */
export const UnitLegend = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 18px;
  font-size: 12px;
  color: ${t.color.textFaint};
`;

export const UnitLegendItem = styled.span<{ $color: string }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;

  &::before {
    content: '';
    width: 2px;
    height: 14px;
    border-radius: 1px;
    background: ${(p) => p.$color};
  }

  b {
    font-weight: 600;
    color: ${t.color.textStrong};
  }
`;

export const TooltipCard = styled.div`
  background: ${t.color.cardBg};
  border: 1px solid rgba(15, 23, 43, 0.06);
  border-radius: ${t.radius.tooltip}px;
  box-shadow: ${t.shadow.tooltip};
  padding: 14px 16px;
  min-width: 148px;
  font-family: ${t.font.family};
`;

export const TooltipTitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-bottom: 10px;
  margin-bottom: 10px;
  border-bottom: 1px solid ${t.color.divider};
  font-size: 13px;
  font-weight: 600;
  color: ${t.color.textStrong};
`;

export const TooltipRow = styled.div`
  & + & {
    margin-top: 10px;
  }
`;

export const TooltipRowLabel = styled.div`
  font-size: 11px;
  color: ${t.color.textFaint};
  margin-bottom: 2px;
`;

export const TooltipRowValue = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  font-size: 14px;
  font-weight: 600;
  color: ${t.color.textStrong};

  small {
    font-size: 10px;
    font-weight: 500;
    color: ${t.color.textDisabled};
  }
`;
