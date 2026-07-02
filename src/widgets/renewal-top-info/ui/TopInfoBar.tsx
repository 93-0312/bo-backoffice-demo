import React from 'react';
import styled from 'styled-components';
import { t } from "@/shared/ui/renewal";
import { TopInfoData } from "@/entities/dashboard-renewal";
import { IconCalendar, IconChevronDown, IconRows, IconTrendArrow } from "@/shared/ui/renewal";

const Bar = styled.div`
  display: flex;
  align-items: stretch;
  padding: 26px 26px 30px;
  font-family: ${t.font.family};
`;

const Stat = styled.div`
  flex: 1 1 0;
  min-width: 0;

  & + & {
    border-left: 1px solid ${t.color.border};
    padding-left: 40px;
  }
`;

const StatLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 500;
  color: ${t.color.textFaint};
`;

const StatValue = styled.div`
  margin-top: 10px;
  font-family: ${t.font.numeric};
  font-size: 26px;
  font-weight: 600;
  line-height: 34px;
  color: ${t.color.textStrong};
  letter-spacing: -0.01em;

  small {
    font-size: 15px;
    font-weight: 600;
    color: ${t.color.textMuted};
  }
`;

const MoM = styled.div<{ $up: boolean }>`
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: ${t.color.textFaint};

  b {
    font-weight: 700;
    color: ${t.color.textStrong};
  }

  svg {
    color: ${(p) => (p.$up ? t.color.greenDark : t.color.red)};
  }
`;

const RightCol = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
`;

const SelectWrap = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;

  svg {
    position: absolute;
    right: 12px;
    pointer-events: none;
    color: ${t.color.textMuted};
  }
`;

const CurrencySelect = styled.select`
  appearance: none;
  padding: 8px 34px 8px 14px;
  border: 1px solid ${t.color.border};
  border-radius: ${t.radius.chip}px;
  background: ${t.color.cardBg};
  font-family: ${t.font.family};
  font-size: 12px;
  font-weight: 500;
  color: ${t.color.textStrong};
  cursor: pointer;

  &:focus {
    outline: 2px solid ${t.color.blue400};
    outline-offset: 1px;
  }
`;

const LastUpdate = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: ${t.color.textFaint};
`;

interface Props {
  data: TopInfoData;
  onCurrencyChange?: (currency: string) => void;
}

const TopInfoBar: React.FC<Props> = ({ data, onCurrencyChange }) => (
  <Bar>
    <Stat>
      <StatLabel>
        <IconRows />
        Monthly Transaction Volume
      </StatLabel>
      <StatValue>
        {data.monthlyVolumeDisplay}
        {data.monthlyVolumeDecimals ? <small>.{data.monthlyVolumeDecimals}</small> : null}
      </StatValue>
      <MoM $up={data.volumeMoM >= 0}>
        MoM <b>{Math.abs(data.volumeMoM)}%</b>
        <IconTrendArrow down={data.volumeMoM < 0} />
      </MoM>
    </Stat>

    <Stat>
      <StatLabel>
        <IconRows />
        Monthly Transaction Count
      </StatLabel>
      <StatValue>
        {data.monthlyCountDisplay}
        {data.monthlyCountDecimals ? <small>,{data.monthlyCountDecimals}</small> : null}
      </StatValue>
      <MoM $up={data.countMoM >= 0}>
        MoM <b>{Math.abs(data.countMoM)}%</b>
        <IconTrendArrow down={data.countMoM < 0} />
      </MoM>
    </Stat>

    <RightCol>
      <SelectWrap>
        <CurrencySelect
          value={data.currency}
          onChange={(e) => onCurrencyChange && onCurrencyChange(e.target.value)}
        >
          {data.currencies.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </CurrencySelect>
        <IconChevronDown />
      </SelectWrap>
      <LastUpdate>
        <IconCalendar />
        Last update: {data.lastUpdate}
      </LastUpdate>
    </RightCol>
  </Bar>
);

export default TopInfoBar;
