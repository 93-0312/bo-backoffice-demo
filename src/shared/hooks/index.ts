/**
 * shared/hooks — 도메인과 무관한 범용 훅.
 *
 * "비즈니스 로직"이 들어가면 안 된다(그건 features/entities). 여기 있는 건
 * 어떤 앱에 옮겨 붙여도 그대로 동작하는 UI/유틸 훅뿐이다.
 */
import { useCallback, useEffect, useRef, useState } from "react";

/** boolean 토글 헬퍼. [value, toggle, set] */
export function useToggle(initial = false) {
  const [value, setValue] = useState(initial);
  const toggle = useCallback(() => setValue((v) => !v), []);
  return [value, toggle, setValue] as const;
}

/** 값이 ms 동안 안정되면 반영되는 디바운스 값 (검색 입력 등). */
export function useDebouncedValue<T>(value: T, ms = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(id);
  }, [value, ms]);
  return debounced;
}

/** media query 매칭 여부 (반응형 분기). */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(
    () => typeof window !== "undefined" && window.matchMedia(query).matches,
  );
  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener("change", handler);
    setMatches(mql.matches);
    return () => mql.removeEventListener("change", handler);
  }, [query]);
  return matches;
}

/** localStorage 동기화 state. 테마/사이드바 접힘 등 가벼운 영속 상태에. */
export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* 무시 */
    }
  }, [key, value]);
  return [value, setValue] as const;
}
