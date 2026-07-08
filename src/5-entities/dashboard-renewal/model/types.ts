/**
 * 리뉴얼 대시보드 도메인 타입 (entities/dashboard-renewal/model).
 *
 * Figma "BO_Design_리뉴얼" 기획 기준의 지표 데이터 모양.
 * 화면 배치(벤토 레이아웃)는 도메인이 아니므로 pages/dashboard-renewal/model 에 있다.
 */
export type PeriodKey = "7d" | "6m";

export interface TrendPoint {
  /** x축 라벨: mm/dd(7d) 또는 yy.mm(6m). 7d 마지막 포인트는 "Today" 로 표기 */
  label: string;
  /** 원화 금액 원본 — 툴팁에 노출 */
  amount: number;
  /** 거래 건수 원본 — 툴팁에 노출 */
  count: number;
}

export interface TopInfoData {
  monthlyVolumeDisplay: string; // e.g. "$10.078"
  monthlyVolumeDecimals?: string; // e.g. "73"
  volumeMoM: number; // %
  monthlyCountDisplay: string; // e.g. "10"
  monthlyCountDecimals?: string; // e.g. "000"
  countMoM: number; // %
  lastUpdate: string; // e.g. "Today"
  currencies: string[];
  currency: string;
}

export interface TargetData {
  /** 최근 6개월 최고 거래액 대비 달성률 0–100 */
  achievedRate: number;
  refYearMonth: string; // e.g. "2026.01"
  remainingDisplay: string; // e.g. "$2,410,000"
  avgAmount6m: string;
  yesterdayVolume: string;
  averageDailyVolume: string;
}

export interface CountryStat {
  name: string;
  amount: number; // 단위: 10,000 KRW
  count: number; // 단위: 100 TXs
  rawAmount: number;
  rawCount: number;
}

export type NoticeBadge = "alert" | "system" | "new";

export interface NoticeItem {
  id: string | number;
  badge?: NoticeBadge;
  title: string;
}

export interface PaymentMethodStat {
  name: string;
  ratio: number; // 그룹 내 %
  amount: number;
  count: number;
}

export interface PaymentGroup {
  key: string;
  label: string; // "Credit Card" | "Payment & Transfer"
  share: number; // 전체 대비 %
  methods: PaymentMethodStat[];
}

export interface PaymentsCountryData {
  country: string;
  groups: PaymentGroup[];
}

export interface TransactionTrendData {
  amountUnitLabel: string; // "Unit: 10,000 KRW"
  countUnitLabel: string; // "Unit: 100 TXs"
  recent7d: TrendPoint[];
  recent6m: TrendPoint[];
}

export interface TopCountriesData {
  lastUpdated: string; // "yyyy.mm.dd-1"
  amountUnitLabel: string;
  countUnitLabel: string;
  byAmount: CountryStat[];
  byCount: CountryStat[];
}

export interface PaymentsMethodsData {
  lastUpdated: string;
  countries: PaymentsCountryData[];
}

export interface DashboardRenewalData {
  topInfo: TopInfoData;
  trend: TransactionTrendData;
  target: TargetData;
  topCountries: TopCountriesData;
  notices: NoticeItem[];
  payments: PaymentsMethodsData;
}
