import { createContext, useContext, useEffect, type ReactNode } from "react";
import { useLocalStorage } from "@/shared/hooks";

/**
 * 테마(라이트/다크) — shared/theme.
 *
 * 왜 shared 인가? 테마는 "비즈니스 로직"이 아니라 도메인과 무관한 UI 인프라다.
 * shared 에 두면 app(Provider 마운트) 도, features/theme-toggle(토글 액션) 도
 * **위→아래** 방향으로 안전하게 가져다 쓸 수 있다. (feature→app 같은 역방향 회피)
 */
export type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  toggle: () => void;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useLocalStorage<Theme>("bo-theme", "light");

  // .dark 클래스를 <html> 에 토글 → 토큰(CSS 변수)이 다크 값으로 전환된다.
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <ThemeContext.Provider value={{ theme, toggle, setTheme }}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme 는 <ThemeProvider> 안에서만 사용할 수 있습니다.");
  return ctx;
}
