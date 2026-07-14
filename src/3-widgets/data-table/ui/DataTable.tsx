import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Skeleton,
  Checkbox,
  Button,
  IconChevronRight,
  IconList,
} from "@/shared/ui";
import { cn } from "@/shared/lib";

/**
 * DataTable<T> — 범용 데이터 테이블 (widget).
 *
 * "도메인 무관" 하게 컬럼 정의(columns)와 행 데이터(rows)만 받아 그린다.
 * 로딩 스켈레톤·빈 상태를 내장해, 각 page 가 매번 다시 구현하지 않도록 한다.
 * 어떤 컬럼을 보여줄지는 page 가 결정(entities 의 표현 컴포넌트를 render 에 끼움).
 *
 * 정렬(sort)·행 선택(selection) 모두 "제어 컴포넌트" 로 동작한다 — 상태는
 * page 가 소유하고 DataTable 은 UI 를 그리고 변경을 emit 할 뿐이다.
 *  - 정렬: sortKey 가 있는 컬럼에만 화살표. 실제 정렬은 클라이언트(`applySort`)든
 *    서버(query 파라미터)든 page 가 선택한다.
 *  - 선택: `selectable` + `selectedKeys`/`onSelectionChange` 를 주면 맨 앞에
 *    체크박스 컬럼이 생긴다. 헤더 체크박스는 "현재 rows(=현재 페이지)" 기준의
 *    전체선택/부분선택이다.
 *  - 넓은 표: `stickyHeader`+`maxHeight` 로 헤더 고정 세로 스크롤을, Column.fixed
 *    로 좌/우 컬럼 고정을 켠다(고정 컬럼은 Column.width 로 폭을 알려줘야 정렬됨).
 *  - 컬럼 폭은 헤더 우측 경계를 드래그해 조절할 수 있다(내부 state, 세션 한정 —
 *    새로고침하면 Column.width 로 되돌아간다). 고정 컬럼을 리사이즈하면 이어지는
 *    고정 컬럼들의 sticky offset 도 함께 재계산된다.
 */
export type SortDirection = "asc" | "desc";

export interface SortState {
  /** 정렬 기준 컬럼 식별자 (Column.sortKey 와 매칭) */
  key: string;
  direction: SortDirection;
}

export interface Column<T> {
  /** 헤더 라벨 */
  header: string;
  /** 셀 렌더러 */
  cell: (row: T) => ReactNode;
  /**
   * 컬럼 식별자. 숨김 상태를 storageKey 로 저장할 때 이 값으로 컬럼을 구분한다.
   * 없으면 header 로 대체 — header 가 비었거나 중복되는 컬럼은 저장 안정성을 위해 지정 권장.
   */
  id?: string;
  className?: string;
  align?: "left" | "right" | "center";
  /** 지정하면 이 컬럼은 정렬 가능해진다(헤더 클릭 → onSortChange emit). */
  sortKey?: string;
  /** 클라이언트 정렬(applySort)이 쓸 비교값. 없으면 서버 정렬 전용으로 본다. */
  sortAccessor?: (row: T) => string | number | null | undefined;
  /** 컬럼 폭(px) 초기값 — 사용자가 드래그로 조절 가능. 고정 컬럼(fixed)은 오프셋 계산을 위해 반드시 지정해야 한다. */
  width?: number;
  /** 가로 스크롤 시 좌/우로 고정. offset 은 width 로 자동 계산. */
  fixed?: "left" | "right";
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  getRowKey: (row: T) => string;
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  /** 현재 정렬 상태(제어형). null = 정렬 없음. */
  sort?: SortState | null;
  /** 헤더 클릭 시 다음 정렬 상태를 emit. 없으면 정렬 UI 자체가 비활성. */
  onSortChange?: (next: SortState | null) => void;
  /** 맨 앞 체크박스 컬럼을 켠다(선택엔 onSelectionChange 도 필요). */
  selectable?: boolean;
  /** 선택된 행 key 목록(제어형, getRowKey 기준). */
  selectedKeys?: string[];
  /** 선택 변경 시 다음 key 목록을 emit. */
  onSelectionChange?: (keys: string[]) => void;
  /** 헤더를 세로 스크롤 시 상단 고정(maxHeight 와 함께 써야 스크롤이 생김). */
  stickyHeader?: boolean;
  /** 본문 세로 스크롤 상한(px 또는 CSS 길이). 지정 시 스크롤 컨테이너가 생긴다. */
  maxHeight?: number | string;
  /**
   * 표 우상단 "컬럼" 토글(숨기기/보이기) 버튼 노출. 기본 true.
   * false 로 주면 토글 자체가 사라진다(모든 컬럼 항상 표시).
   */
  columnToggle?: boolean;
  /**
   * 숨김 컬럼 상태를 localStorage 에 테이블 단위로 저장할 키.
   * 지정 시 `bo-dt-hidden:<storageKey>` 로 저장 → 새로고침/재방문에도 유지된다.
   * 없으면 세션 한정(새로고침하면 초기화). 페이지마다 다른 값을 줘야 서로 간섭하지 않는다.
   */
  storageKey?: string;
}

const alignClass = {
  left: "text-left",
  right: "text-right",
  center: "text-center",
} as const;

/** 선택 체크박스 컬럼 폭(px) — w-10. 좌측 고정 오프셋 계산의 시작점. */
const SELECT_COL_W = 40;

/** 숨김 컬럼 상태 localStorage 키 접두사(테이블별 storageKey 와 결합). */
const HIDDEN_STORE_PREFIX = "bo-dt-hidden:";

/** 드래그 리사이즈 시 컬럼이 줄어들 수 있는 최소 폭(px) — 리사이즈 핸들 히트 영역만큼만 확보하고,
 * 내용이 더 넓으면 셀에서 말줄임(ellipsis)으로 처리한다. */
const MIN_COL_WIDTH = 32;

type FixedInfo = { side: "left" | "right"; offset: number };

/**
 * 고정 컬럼별 sticky 오프셋을 미리 계산한다.
 * 좌측 고정은 앞선 고정 컬럼 폭의 누적(+선택 컬럼)이, 우측 고정은 뒤쪽부터의 누적이 offset.
 */
function getFixedInfos<T>(
  columns: Column<T>[],
  selectionFixed: boolean,
  getWidth: (index: number) => number | undefined,
  isHidden: (index: number) => boolean,
): (FixedInfo | undefined)[] {
  const infos: (FixedInfo | undefined)[] = columns.map(() => undefined);
  let left = selectionFixed ? SELECT_COL_W : 0;
  columns.forEach((c, i) => {
    if (isHidden(i)) return; // 숨긴 컬럼은 스택에서 빠지므로 offset 에 반영하지 않는다.
    if (c.fixed === "left") {
      infos[i] = { side: "left", offset: left };
      left += getWidth(i) ?? 0;
    }
  });
  let right = 0;
  for (let i = columns.length - 1; i >= 0; i--) {
    if (isHidden(i)) continue;
    if (columns[i].fixed === "right") {
      infos[i] = { side: "right", offset: right };
      right += getWidth(i) ?? 0;
    }
  }
  return infos;
}

/** 정렬 3단계 토글: (없음|다른컬럼) → asc → desc → 없음 */
function nextSort(
  key: string,
  current: SortState | null | undefined,
): SortState | null {
  if (!current || current.key !== key) return { key, direction: "asc" };
  if (current.direction === "asc") return { key, direction: "desc" };
  return null;
}

/**
 * 클라이언트 정렬 헬퍼 — page 가 rows 를 직접 정렬할 때 쓴다.
 * sortAccessor 가 있는 컬럼만 대상. 문자열은 로케일 비교, 숫자는 수치 비교.
 * 원본 배열을 변형하지 않는다(복사 후 정렬).
 */
export function applySort<T>(
  rows: T[],
  sort: SortState | null | undefined,
  columns: Column<T>[],
): T[] {
  if (!sort) return rows;
  const col = columns.find((c) => c.sortKey === sort.key);
  if (!col?.sortAccessor) return rows;
  const accessor = col.sortAccessor;
  const dir = sort.direction === "asc" ? 1 : -1;

  return [...rows].sort((a, b) => {
    const av = accessor(a);
    const bv = accessor(b);
    // null/undefined 는 항상 뒤로.
    if (av == null && bv == null) return 0;
    if (av == null) return 1;
    if (bv == null) return -1;
    if (typeof av === "number" && typeof bv === "number")
      return (av - bv) * dir;
    return String(av).localeCompare(String(bv), "ko") * dir;
  });
}

export function DataTable<T>({
  columns,
  rows,
  getRowKey,
  loading,
  emptyMessage = "데이터가 없습니다.",
  onRowClick,
  sort,
  onSortChange,
  selectable,
  selectedKeys,
  onSelectionChange,
  stickyHeader,
  maxHeight,
  columnToggle = true,
  storageKey,
}: DataTableProps<T>) {
  const selecting = !!selectable && !!onSelectionChange;
  const selectedSet = new Set(selectedKeys ?? []);
  const pageKeys = rows.map(getRowKey);
  const selectedOnPage = pageKeys.filter((k) => selectedSet.has(k));
  const allChecked =
    pageKeys.length > 0 && selectedOnPage.length === pageKeys.length;
  const someChecked = selectedOnPage.length > 0 && !allChecked;

  // 컬럼 식별 키 — 저장/숨김 판별의 기준. id 우선, 없으면 header, 그것도 비면 인덱스.
  const colKey = (col: Column<T>, i: number) =>
    col.id ?? (col.header || `__col_${i}`);

  // 숨긴 컬럼 key 집합. storageKey 가 있으면 localStorage 에 테이블 단위로 저장한다.
  const [hiddenKeys, setHiddenKeys] = useState<string[]>(() => {
    if (!storageKey) return [];
    try {
      const raw = localStorage.getItem(HIDDEN_STORE_PREFIX + storageKey);
      return raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      return [];
    }
  });
  useEffect(() => {
    if (!storageKey) return;
    try {
      localStorage.setItem(
        HIDDEN_STORE_PREFIX + storageKey,
        JSON.stringify(hiddenKeys),
      );
    } catch {
      /* 무시 */
    }
  }, [storageKey, hiddenKeys]);

  const hiddenSet = new Set(hiddenKeys);
  const isHidden = (i: number) => hiddenSet.has(colKey(columns[i], i));
  const visibleCount = columns.reduce((n, _, i) => n + (isHidden(i) ? 0 : 1), 0);
  const colCount = visibleCount + (selecting ? 1 : 0);

  const toggleColumn = (key: string) => {
    setHiddenKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  // 컬럼 폭(px) — 초기값은 Column.width, 드래그로 리사이즈하면 여기 반영된다.
  const [colWidths, setColWidths] = useState<(number | undefined)[]>(() =>
    columns.map((c) => c.width),
  );
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 컬럼 개수가 바뀔 때만(다른 컬럼 셋) 리셋
  useEffect(() => {
    setColWidths(columns.map((c) => c.width));
  }, [columns.length]);

  const thRefs = useRef<(HTMLTableCellElement | null)[]>([]);
  const resizingRef = useRef<{
    index: number;
    startX: number;
    startWidth: number;
  } | null>(null);

  const handleResizeMove = useCallback((e: MouseEvent) => {
    const r = resizingRef.current;
    if (!r) return;
    const next = Math.max(MIN_COL_WIDTH, r.startWidth + (e.clientX - r.startX));
    setColWidths((prev) => {
      const next2 = [...prev];
      next2[r.index] = next;
      return next2;
    });
  }, []);

  const handleResizeEnd = useCallback(() => {
    resizingRef.current = null;
    document.body.style.cursor = "";
    document.removeEventListener("mousemove", handleResizeMove);
    document.removeEventListener("mouseup", handleResizeEnd);
  }, [handleResizeMove]);

  const handleResizeStart = useCallback(
    (e: ReactMouseEvent<HTMLDivElement>, index: number) => {
      e.preventDefault();
      e.stopPropagation();
      const startWidth =
        colWidths[index] ?? thRefs.current[index]?.offsetWidth ?? 150;
      resizingRef.current = { index, startX: e.clientX, startWidth };
      document.body.style.cursor = "col-resize";
      document.addEventListener("mousemove", handleResizeMove);
      document.addEventListener("mouseup", handleResizeEnd);
    },
    [colWidths, handleResizeMove, handleResizeEnd],
  );

  // 언마운트 시 드래그 도중이었다면 전역 리스너 정리.
  useEffect(() => {
    return () => {
      document.removeEventListener("mousemove", handleResizeMove);
      document.removeEventListener("mouseup", handleResizeEnd);
    };
  }, [handleResizeMove, handleResizeEnd]);

  /**
   * 리사이즈 핸들 더블클릭 → 컬럼을 그 열의 가장 넓은 콘텐츠에 딱 맞춘다.
   * 대상 열의 셀에서 폭 제약(width/min/max)을 잠깐 풀어 max-content 폭을 읽는다.
   * 이때 표가 w-full(100%)이라 남는 공간이 있으면 제약 푼 열이 그 슬랙을 전부
   * 먹어버리므로, 측정 동안 표 자체도 콘텐츠 폭(auto)으로 줄여 슬랙을 없앤다.
   */
  const handleAutoFit = useCallback(
    (index: number) => {
      const th = thRefs.current[index];
      const table = th?.closest("table") as HTMLTableElement | null;
      if (!th || !table) return;
      // DOM 상 컬럼 인덱스 = 선택 컬럼(있으면 1) + index 앞의 "보이는" 컬럼 수.
      // (숨긴 컬럼은 렌더되지 않아 DOM 위치가 밀리므로 원본 index 를 그대로 못 쓴다)
      const domCol =
        (selecting ? 1 : 0) +
        columns.slice(0, index).reduce((n, _, j) => n + (isHidden(j) ? 0 : 1), 0);
      const cells = Array.from(table.querySelectorAll("tr"))
        .map((tr) => tr.children[domCol] as HTMLElement | undefined)
        .filter((c): c is HTMLElement => !!c);
      if (!cells.length) return;

      const saved = cells.map(
        (c) => [c.style.width, c.style.minWidth, c.style.maxWidth] as const,
      );
      const savedTableWidth = table.style.width;
      // 표를 콘텐츠 폭으로 축소(슬랙 제거) + 대상 열 제약 해제 → 실제 max-content 만 남는다.
      table.style.width = "auto";
      cells.forEach((c) => {
        c.style.width = "auto";
        c.style.minWidth = "0";
        c.style.maxWidth = "none";
      });
      // getBoundingClientRect 읽기가 동기 리플로우를 강제해 방금 푼 폭이 반영된다.
      const natural = Math.ceil(th.getBoundingClientRect().width) + 1; // 여유 1px
      table.style.width = savedTableWidth;
      cells.forEach((c, i) => {
        [c.style.width, c.style.minWidth, c.style.maxWidth] = saved[i];
      });

      setColWidths((prev) => {
        const next = [...prev];
        next[index] = Math.max(MIN_COL_WIDTH, natural);
        return next;
      });
    },
    // isHidden/columns 는 매 렌더 새로 만들어지므로 hiddenKeys·columns 를 직접 의존한다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selecting, columns, hiddenKeys],
  );

  // 고정 컬럼: 선택 컬럼도 좌측 고정이 하나라도 있으면 함께 왼쪽에 붙인다.
  const selectionFixed = selecting && columns.some((c) => c.fixed === "left");
  const fixedInfos = getFixedInfos(
    columns,
    selectionFixed,
    (i) => colWidths[i],
    isHidden,
  );

  /** 컬럼 셀(th/td)의 인라인 style — width/고정 위치/z-index 를 합친다. */
  const cellStyle = (
    index: number,
    info: FixedInfo | undefined,
    header: boolean,
  ): CSSProperties | undefined => {
    const width = colWidths[index];
    const style: CSSProperties = {};
    if (width != null) {
      // min/max 로 폭을 못박아야 내용이 길어도 table-layout: auto 가 컬럼을 다시
      // 늘리지 않는다 — 리사이즈로 좁힌 폭보다 내용이 길면 셀에서 말줄임 처리된다.
      style.width = width;
      style.minWidth = width;
      style.maxWidth = width;
    }
    if (info) {
      style.position = "sticky";
      style[info.side] = info.offset;
      style.zIndex = header ? 30 : 10; // 헤더+고정(코너)이 가장 위
    }
    if (header && stickyHeader) {
      style.position = "sticky";
      style.top = 0;
      if (!info) style.zIndex = 20;
    }
    return Object.keys(style).length ? style : undefined;
  };

  /**
   * 고정/스티키 셀 배경·구분선 class.
   * 스크롤되는 내용이 비쳐 보이지 않도록 불투명 배경이 필요한데, Card 표면과
   * 똑같이 보이도록 `bg-card`(라이트=흰색·다크=카드색)를 쓴다 — 별도 색으로 뜨지 않음.
   */
  const fixedClass = (info: FixedInfo | undefined, header: boolean) =>
    cn(
      (info || (header && stickyHeader)) && "bg-card",
      info?.side === "left" && "border-r border-border",
      info?.side === "right" && "border-l border-border",
    );

  /** 선택 컬럼(체크박스)용 style/class — 좌측 고정 + 스티키 헤더 조합 처리. */
  const selCellStyle = (header: boolean): CSSProperties | undefined => {
    const style: CSSProperties = {};
    if (selectionFixed) {
      style.position = "sticky";
      style.left = 0;
      style.zIndex = header && stickyHeader ? 30 : 10;
    }
    if (header && stickyHeader) {
      style.position = "sticky";
      style.top = 0;
      if (!selectionFixed) style.zIndex = 20;
    }
    return Object.keys(style).length ? style : undefined;
  };
  const selCellClass = (header: boolean) =>
    cn(
      "w-10",
      (selectionFixed || (header && stickyHeader)) && "bg-card",
      selectionFixed && "border-r border-border",
    );

  const toggleAll = () => {
    if (!onSelectionChange) return;
    const base = selectedKeys ?? [];
    if (allChecked) {
      // 현재 페이지 key 만 제거(다른 페이지 선택은 유지)
      onSelectionChange(
        base.filter((k) => !selectedSet.has(k) || !pageKeys.includes(k)),
      );
    } else {
      // 현재 페이지 key 를 합집합으로 추가
      onSelectionChange([...new Set([...base, ...pageKeys])]);
    }
  };

  const toggleRow = (key: string) => {
    if (!onSelectionChange) return;
    const base = selectedKeys ?? [];
    onSelectionChange(
      selectedSet.has(key) ? base.filter((k) => k !== key) : [...base, key],
    );
  };

  return (
    <>
      {/* 데스크톱/태블릿(md↑): 표. 모바일에선 숨기고 카드로 대체. */}
      <div className="hidden md:block">
        {columnToggle && (
          <div className="mb-2 mr-2 mt-2 flex justify-end">
            <ColumnToggle
              columns={columns}
              colKey={colKey}
              hiddenSet={hiddenSet}
              visibleCount={visibleCount}
              onToggle={toggleColumn}
            />
          </div>
        )}
        <Table maxHeight={maxHeight}>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {selecting && (
                <TableHead
                  className={selCellClass(true)}
                  style={selCellStyle(true)}
                >
                  <Checkbox
                    checked={allChecked || someChecked}
                    indeterminate={someChecked}
                    onCheckedChange={toggleAll}
                    aria-label="전체 선택"
                  />
                </TableHead>
              )}
              {columns.map((col, i) => {
                if (isHidden(i)) return null;
                const sortable = !!col.sortKey && !!onSortChange;
                const active = sortable && sort?.key === col.sortKey;
                const info = fixedInfos[i];
                return (
                  <TableHead
                    key={i}
                    ref={(el) => {
                      thRefs.current[i] = el;
                    }}
                    aria-sort={
                      active
                        ? sort!.direction === "asc"
                          ? "ascending"
                          : "descending"
                        : undefined
                    }
                    style={cellStyle(i, info, true)}
                    className={cn(
                      "relative overflow-hidden whitespace-nowrap",
                      col.align && alignClass[col.align],
                      fixedClass(info, true),
                      col.className,
                    )}
                  >
                    {sortable ? (
                      <button
                        type="button"
                        onClick={() =>
                          onSortChange!(nextSort(col.sortKey!, sort))
                        }
                        className={cn(
                          "flex w-full min-w-0 items-center gap-1 transition-colors hover:text-foreground",
                          col.align === "right" && "flex-row-reverse",
                          active && "text-foreground",
                        )}
                      >
                        <span className="min-w-0 truncate">{col.header}</span>
                        <SortIndicator
                          direction={active ? sort!.direction : undefined}
                        />
                      </button>
                    ) : (
                      <span className="block truncate">{col.header}</span>
                    )}
                    <div
                      onMouseDown={(e) => handleResizeStart(e, i)}
                      onDoubleClick={() => handleAutoFit(i)}
                      className="group absolute right-0 top-0 z-10 h-full w-3 cursor-col-resize touch-none select-none"
                      role="separator"
                      aria-orientation="vertical"
                      aria-label={`${col.header} 컬럼 너비 조절`}
                      title="드래그: 너비 조절 · 더블클릭: 콘텐츠에 맞춤"
                    >
                      <div className="absolute right-0 top-1/2 h-3/5 w-px -translate-y-1/2 bg-border transition-colors group-hover:w-1 group-hover:bg-primary" />
                    </div>
                  </TableHead>
                );
              })}
              {/*
                필러 열 — 남는 가로 폭을 흡수한다. 이게 없으면 w-full 표가 슬랙을
                실제 컬럼에 억지로 분배해(table-layout:auto 에선 max-width 도 무시),
                리사이즈·자동맞춤으로 지정한 폭이 화면에서 늘어나 보인다.
                컬럼이 컨테이너를 꽉 채우거나 넘치면 폭 0 이라 티가 나지 않는다.
              */}
              <TableHead
                aria-hidden
                className={cn("w-auto p-0", stickyHeader && "bg-card")}
                style={
                  stickyHeader
                    ? { position: "sticky", top: 0, zIndex: 20 }
                    : undefined
                }
              />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <SkeletonRows cols={colCount} />
            ) : rows.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={colCount + 1 /* 필러 열까지 포함해 전체 폭에 걸친다 */}
                  className="py-12 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => {
                const key = getRowKey(row);
                return (
                  <TableRow
                    key={key}
                    data-selected={
                      selecting && selectedSet.has(key) ? "" : undefined
                    }
                    className={cn(
                      onRowClick && "cursor-pointer",
                      selecting && selectedSet.has(key) && "bg-muted/50",
                    )}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                  >
                    {selecting && (
                      <TableCell
                        className={selCellClass(false)}
                        style={selCellStyle(false)}
                        // 체크박스 클릭이 행 클릭(onRowClick)으로 번지지 않도록 차단
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Checkbox
                          checked={selectedSet.has(key)}
                          onCheckedChange={() => toggleRow(key)}
                          aria-label="행 선택"
                        />
                      </TableCell>
                    )}
                    {columns.map((col, i) => {
                      if (isHidden(i)) return null;
                      const info = fixedInfos[i];
                      return (
                        <TableCell
                          key={i}
                          style={cellStyle(i, info, false)}
                          className={cn(
                            "overflow-hidden whitespace-nowrap",
                            col.align && alignClass[col.align],
                            fixedClass(info, false),
                            col.className,
                          )}
                        >
                          <div className="truncate">{col.cell(row)}</div>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* 모바일(md 미만): 같은 columns 를 "라벨:값" 카드로 재활용해 렌더(숨긴 컬럼 제외) */}
      <div className="flex flex-col gap-3 p-3 md:hidden">
        <MobileCards
          columns={columns.filter((_, i) => !isHidden(i))}
          rows={rows}
          getRowKey={getRowKey}
          loading={loading}
          emptyMessage={emptyMessage}
          onRowClick={onRowClick}
          selecting={selecting}
          selectedSet={selectedSet}
          toggleRow={toggleRow}
        />
      </div>
    </>
  );
}

/**
 * ColumnToggle — 표 우상단 "컬럼" 버튼 + 체크박스 드롭다운.
 * 체크를 끄면 그 컬럼을 숨긴다(부모의 onToggle 로 emit). 마지막 1개는 못 끄게 막아 빈 표를 방지.
 * 킷에 팝오버 프리미티브가 없어 얇은 커스텀 드롭다운으로 구현한다(바깥 클릭 시 닫힘).
 */
function ColumnToggle<T>({
  columns,
  colKey,
  hiddenSet,
  visibleCount,
  onToggle,
}: {
  columns: Column<T>[];
  colKey: (col: Column<T>, i: number) => string;
  hiddenSet: Set<string>;
  visibleCount: number;
  onToggle: (key: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <Button
        type="button"
        variant="outline"
        size="sm"
        icon={<IconList className="size-4" />}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        컬럼 {visibleCount}/{columns.length}
      </Button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 z-40 mt-1 max-h-72 w-52 overflow-y-auto rounded-radius-md border border-border bg-card p-1 shadow-lg"
        >
          {columns.map((col, i) => {
            const key = colKey(col, i);
            const label = col.header || `컬럼 ${i + 1}`;
            const checked = !hiddenSet.has(key);
            // 마지막 남은 1개는 못 끄게 막는다(모든 컬럼이 사라지는 것 방지).
            const lockLast = checked && visibleCount === 1;
            return (
              <label
                key={i}
                className={cn(
                  "flex items-center gap-2 rounded-radius-sm px-2 py-1.5 text-sm",
                  lockLast
                    ? "cursor-not-allowed opacity-50"
                    : "cursor-pointer hover:bg-muted",
                )}
              >
                <Checkbox
                  checked={checked}
                  disabled={lockLast}
                  onCheckedChange={() => {
                    if (!lockLast) onToggle(key);
                  }}
                  aria-label={`${label} 표시`}
                />
                <span className="truncate">{label}</span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * 모바일 카드 뷰 — 좁은 화면에서 표 대신 행을 카드로 쌓는다.
 * Column 의 header(라벨)+cell(값)을 그대로 재활용하므로 page 는 추가 정의가 필요 없다.
 * header 가 빈 컬럼(액션 등)은 라벨 없이 값만 하단에 그린다.
 */
function MobileCards<T>({
  columns,
  rows,
  getRowKey,
  loading,
  emptyMessage,
  onRowClick,
  selecting,
  selectedSet,
  toggleRow,
}: {
  columns: Column<T>[];
  rows: T[];
  getRowKey: (row: T) => string;
  loading?: boolean;
  emptyMessage: string;
  onRowClick?: (row: T) => void;
  selecting: boolean;
  selectedSet: Set<string>;
  toggleRow: (key: string) => void;
}) {
  if (loading) {
    return (
      <>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-radius-md border border-border p-3">
            <Skeleton className="mb-2 h-4 w-1/3 rounded-radius-sm" />
            <Skeleton className="mb-2 h-4 w-2/3 rounded-radius-sm" />
            <Skeleton className="h-4 w-1/2 rounded-radius-sm" />
          </div>
        ))}
      </>
    );
  }

  if (rows.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </p>
    );
  }

  return (
    <>
      {rows.map((row) => {
        const key = getRowKey(row);
        const selected = selecting && selectedSet.has(key);
        return (
          <div
            key={key}
            onClick={onRowClick ? () => onRowClick(row) : undefined}
            className={cn(
              "rounded-radius-md border border-border p-3",
              onRowClick && "cursor-pointer",
              selected && "border-primary/40 bg-muted/50",
            )}
          >
            {selecting && (
              <div
                className="mb-2 flex justify-end"
                onClick={(e) => e.stopPropagation()}
              >
                <Checkbox
                  checked={selected}
                  onCheckedChange={() => toggleRow(key)}
                  aria-label="행 선택"
                />
              </div>
            )}
            {columns.map((col, i) =>
              col.header ? (
                <div key={i} className="flex flex-col gap-0.5 py-1">
                  <span className="text-xs text-muted-foreground">
                    {col.header}
                  </span>
                  <span className="text-sm">{col.cell(row)}</span>
                </div>
              ) : (
                // 라벨 없는 컬럼(액션 등) — 값만, 클릭 버블링 차단
                <div
                  key={i}
                  className="pt-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  {col.cell(row)}
                </div>
              ),
            )}
          </div>
        );
      })}
    </>
  );
}

/** 헤더 정렬 표시 — 위/아래 캐럿 중 활성 방향을 강조(antd 의 sort 캐럿과 유사). */
function SortIndicator({ direction }: { direction?: SortDirection }) {
  return (
    <span className="inline-flex flex-col leading-[0]">
      <IconChevronRight
        className={cn(
          "size-3 -rotate-90",
          direction === "asc" ? "text-foreground" : "text-muted-foreground/40",
        )}
      />
      <IconChevronRight
        className={cn(
          "-mt-1 size-3 rotate-90",
          direction === "desc" ? "text-foreground" : "text-muted-foreground/40",
        )}
      />
    </span>
  );
}

function SkeletonRows({ cols }: { cols: number }) {
  return (
    <>
      {Array.from({ length: 5 }).map((_, r) => (
        <TableRow key={r} className="hover:bg-transparent">
          {Array.from({ length: cols }).map((__, c) => (
            <TableCell key={c}>
              <Skeleton className="h-4 w-full max-w-[160px] rounded-radius-sm" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}
