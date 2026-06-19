import { Button, IconSun, IconMoon } from "@/shared/ui";
import { useTheme } from "@/shared/theme";

/**
 * ThemeToggle — "다크모드 전환하기" 라는 사용자 행위(feature).
 *
 * 상태(theme)는 shared/theme 가 소유하고, 이 feature 는 그걸 토글하는 액션 UI만 제공한다.
 * widgets/app-header 가 이 feature 를 조립해 헤더에 배치한다.
 *
 * 주의: 설치된 킷(npm 0.1.0)의 Button 은 size="icon" 이 없으므로 아이콘은
 *       icon 슬롯으로 넣고 size="md" 를 쓴다(min-w-8 로 정사각 버튼이 된다).
 */
export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";
  return (
    <Button
      variant="ghost"
      size="md"
      onClick={toggle}
      aria-label={isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}
      title={isDark ? "라이트 모드" : "다크 모드"}
      icon={isDark ? <IconSun /> : <IconMoon />}
    />
  );
}
