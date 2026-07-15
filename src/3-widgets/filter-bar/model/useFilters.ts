import { useCallback, useMemo, useRef, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

/**
 * 필터 상태 레이어 (widgets/filter-bar/model).
 *
 * FilterBar(UI)와 독립적인 "값" 관리 훅. page 는 이 훅으로 필터 상태를 소유하고,
 * FilterBar 에는 values/onChange 만 넘긴다(제어 컴포넌트 — DataTable 과 동일 철학).
 *
 *  - URL 동기화(syncUrl): 필터를 ?search=…&period.from=… 으로 반영해
 *    새로고침·뒤로가기·링크 공유에도 조회 조건이 유지된다(기본값은 URL 에서 생략).
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

export interface UseFiltersOptions<T extends FilterValues> {
  defaults: T;
  /** 필터를 URL 쿼리에 반영(새로고침/공유/뒤로가기 유지). 기본 false. */
  syncUrl?: boolean;
  /** 이 키들만 debouncedValues 반영을 지연(검색어 등). */
  debounceKeys?: (keyof T)[];
  debounceMs?: number;
}

export function useFilters<T extends FilterValues>({
  defaults,
  syncUrl = false,
  debounceKeys = [],
  debounceMs = 300,
}: UseFiltersOptions<T>) {
  // defaults 는 마운트 시 고정 — 매 렌더 새 리터럴이 와도 초기값만 쓴다.
  const defaultsRef = useRef(defaults);
  const [searchParams, setSearchParams] = useSearchParams();

  const [values, setValues] = useState<T>(() =>
    syncUrl ? parseFilters(searchParams, defaultsRef.current) : defaultsRef.current,
  );

  // values → URL (기본값은 생략). 다른 파라미터(reason 등)는 건드리지 않는다.
  useEffect(() => {
    if (!syncUrl) return;
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
  }, [values, syncUrl, setSearchParams]);

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
