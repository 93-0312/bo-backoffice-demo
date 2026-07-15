import { useCallback, useMemo, useRef, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

/**
 * 필터 상태 레이어 (widgets/filter-bar/model).
 *
 * FilterBar(UI)와 독립적인 "값" 관리 훅. page 는 이 훅으로 필터 상태를 소유하고,
 * FilterBar 에는 values/onChange 만 넘긴다(제어 컴포넌트 — DataTable 과 동일 철학).
 *
 *  - 유지 방식(persist)은 메뉴(페이지)마다 선택한다:
 *      "url"     — ?search=…&period.from=… 반영. 새로고침·뒤로가기·링크 공유 유지.
 *      "storage" — localStorage(bo-filters:<storageKey>) 저장. 새로고침엔 유지되지만
 *                  URL 은 깨끗하고 공유는 안 됨(운영자 개인의 상용 필터에 적합).
 *      "memory"  — 모듈 메모리(Map) 저장. 같은 세션 안에서 메뉴를 떠났다 돌아오면
 *                  복원되고, 새로고침하면 초기화(기존 BO 의 방문 탭 동작과 동일).
 *      "none"    — (기본) 컴포넌트 상태만. 새로고침하면 defaults 로 초기화.
 *  - 디바운스(debounceKeys): 검색어처럼 타이핑마다 조회하면 안 되는 키만 지연 반영.
 *    `values`(입력용 즉시값)와 `debouncedValues`(조회용)를 분리해 돌려준다.
 *  - defaults 는 마운트 시점에 고정된다(리터럴로 넘겨도 안전).
 */

/** 기간 값 — 직렬화 가능하도록 "YYYY-MM-DD" 문자열만 쓴다(서버 파라미터와 동일 포맷). */
export interface DateRangeValue {
  from: string | null;
  to: string | null;
}

export type FilterValue = string | boolean | DateRangeValue | null;
export type FilterValues = Record<string, FilterValue>;

function isRange(v: FilterValue): v is DateRangeValue {
  return typeof v === "object" && v !== null && "from" in v && "to" in v;
}

function valueEquals(a: FilterValue, b: FilterValue): boolean {
  if (isRange(a) && isRange(b)) return a.from === b.from && a.to === b.to;
  return a === b;
}

/**
 * values → URLSearchParams 항목. 기본값과 같은 키는 생략해 URL 을 깨끗하게 유지한다.
 * boolean 은 "1", 기간은 `${key}.from` / `${key}.to` 두 파라미터로 편다.
 */
export function serializeFilters(
  values: FilterValues,
  defaults: FilterValues,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(values)) {
    if (valueEquals(value, defaults[key])) continue;
    if (isRange(value)) {
      if (value.from) out[`${key}.from`] = value.from;
      if (value.to) out[`${key}.to`] = value.to;
    } else if (typeof value === "boolean") {
      if (value) out[key] = "1";
    } else if (value != null && value !== "") {
      out[key] = value;
    }
  }
  return out;
}

/**
 * URLSearchParams → values. 각 키의 "모양"은 defaults 의 타입을 따른다
 * (boolean 기본값이면 "1"/"true" 를 boolean 으로, 기간 기본값이면 .from/.to 를 조립).
 */
export function parseFilters<T extends FilterValues>(
  params: URLSearchParams,
  defaults: T,
): T {
  const out: FilterValues = { ...defaults };
  for (const [key, def] of Object.entries(defaults)) {
    if (isRange(def)) {
      const from = params.get(`${key}.from`);
      const to = params.get(`${key}.to`);
      if (from !== null || to !== null) {
        out[key] = { from: from || null, to: to || null };
      }
    } else if (typeof def === "boolean") {
      const raw = params.get(key);
      if (raw !== null) out[key] = raw === "1" || raw === "true";
    } else {
      const raw = params.get(key);
      if (raw !== null) out[key] = raw;
    }
  }
  return out as T;
}

/** 새로고침 시 필터 유지 방식 — 메뉴(페이지)마다 선택한다. */
export type FilterPersistMode = "url" | "storage" | "memory" | "none";

/** persist:"storage" 의 localStorage 키 접두사(테이블 storageKey 와 동일한 관례). */
const FILTER_STORE_PREFIX = "bo-filters:";

/**
 * persist:"memory" 저장소 — 모듈 스코프 Map 이라 라우트 이동(언마운트)에는 살아남고,
 * 새로고침하면 JS 메모리와 함께 사라진다. 저장 포맷은 storage 와 동일한 평면 레코드.
 */
const memoryStore = new Map<string, Record<string, string>>();

/** persist:"memory" 저장값 전체 삭제 — 테스트 격리·로그아웃 시 사용. */
export function clearFilterMemory() {
  memoryStore.clear();
}

export interface UseFiltersOptions<T extends FilterValues> {
  defaults: T;
  /**
   * 유지 방식: "url"(쿼리 반영 — 새로고침+공유 유지) / "storage"(localStorage —
   * 새로고침만 유지, URL 깨끗) / "memory"(세션 내 재방문 유지, 새로고침 초기화)
   * / "none"(기본 — 새로고침 시 초기화).
   */
  persist?: FilterPersistMode;
  /** persist:"storage"/"memory" 저장 키(페이지마다 고유하게). 없으면 저장 안 함. */
  storageKey?: string;
  /** 이 키들만 debouncedValues 반영을 지연(검색어 등). */
  debounceKeys?: (keyof T)[];
  debounceMs?: number;
}

export function useFilters<T extends FilterValues>({
  defaults,
  persist = "none",
  storageKey,
  debounceKeys = [],
  debounceMs = 300,
}: UseFiltersOptions<T>) {
  // defaults 는 마운트 시 고정 — 매 렌더 새 리터럴이 와도 초기값만 쓴다.
  const defaultsRef = useRef(defaults);
  const [searchParams, setSearchParams] = useSearchParams();
  const storeKey = storageKey ? FILTER_STORE_PREFIX + storageKey : null;

  const [values, setValues] = useState<T>(() => {
    const base = defaultsRef.current;
    if (persist === "url") return parseFilters(searchParams, base);
    if (persist === "storage" && storeKey) {
      try {
        const raw = localStorage.getItem(storeKey);
        // 저장 포맷은 serializeFilters 의 평면 레코드 — URLSearchParams 로 감싸 파서를 재사용.
        if (raw) return parseFilters(new URLSearchParams(JSON.parse(raw)), base);
      } catch {
        /* 손상된 저장값은 무시하고 defaults 로 */
      }
    }
    if (persist === "memory" && storeKey) {
      const record = memoryStore.get(storeKey);
      if (record) return parseFilters(new URLSearchParams(record), base);
    }
    return base;
  });

  // persist:"url" — values → URL (기본값은 생략). 다른 파라미터(reason 등)는 건드리지 않는다.
  useEffect(() => {
    if (persist !== "url") return;
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        for (const key of Object.keys(defaultsRef.current)) {
          next.delete(key);
          next.delete(`${key}.from`);
          next.delete(`${key}.to`);
        }
        for (const [k, v] of Object.entries(serializeFilters(values, defaultsRef.current))) {
          next.set(k, v);
        }
        return next;
      },
      { replace: true },
    );
  }, [values, persist, setSearchParams]);

  // persist:"storage" — values → localStorage (전부 기본값이면 키 자체를 지운다).
  useEffect(() => {
    if (persist !== "storage" || !storeKey) return;
    try {
      const record = serializeFilters(values, defaultsRef.current);
      if (Object.keys(record).length === 0) localStorage.removeItem(storeKey);
      else localStorage.setItem(storeKey, JSON.stringify(record));
    } catch {
      /* 무시 */
    }
  }, [values, persist, storeKey]);

  // persist:"memory" — values → 모듈 Map (전부 기본값이면 키를 지운다).
  useEffect(() => {
    if (persist !== "memory" || !storeKey) return;
    const record = serializeFilters(values, defaultsRef.current);
    if (Object.keys(record).length === 0) memoryStore.delete(storeKey);
    else memoryStore.set(storeKey, record);
  }, [values, persist, storeKey]);

  // 디바운스 대상 키만 지연 미러링 → debouncedValues 로 합성.
  const debounceSubset = useMemo(() => {
    const sub: FilterValues = {};
    for (const k of debounceKeys) sub[k as string] = values[k as string];
    return sub;
    // debounceKeys 는 리터럴 상수 전제(길이만 의존해 불필요한 재계산 방지).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values, debounceKeys.length]);

  const [delayedSubset, setDelayedSubset] = useState(debounceSubset);
  useEffect(() => {
    const id = setTimeout(() => setDelayedSubset(debounceSubset), debounceMs);
    return () => clearTimeout(id);
  }, [debounceSubset, debounceMs]);

  const debouncedValues = useMemo(
    () => ({ ...values, ...delayedSubset }) as T,
    [values, delayedSubset],
  );

  const setValue = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  const reset = useCallback(() => setValues(defaultsRef.current), []);

  const isDirty = useMemo(
    () =>
      Object.keys(defaultsRef.current).some(
        (k) => !valueEquals(values[k], defaultsRef.current[k]),
      ),
    [values],
  );

  return { values, debouncedValues, setValue, reset, isDirty };
}
