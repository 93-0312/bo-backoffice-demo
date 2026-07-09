/**
 * Tailwind config — BO UI Kit 파운데이션 토큰을 그대로 노출.
 *
 * 이 데모(앱)의 shared 레이어에서 만드는 app-shared 컴포넌트(Card, Badge, Table …)가
 * 킷과 "같은 토큰"을 쓰도록 figma-to-react 의 설정을 동일하게 가져왔다.
 * 색은 `rgb(var(--token) / <alpha-value>)` 채널 방식 → `bg-primary/90` 등 알파 유틸 지원.
 * 실제 값은 src/app/styles/tokens.css 의 CSS 변수에서 정의(라이트/다크 전환).
 *
 * @type {import('tailwindcss').Config}
 */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "rgb(var(--background) / <alpha-value>)",
        foreground: "rgb(var(--foreground) / <alpha-value>)",
        card: {
          DEFAULT: "rgb(var(--card) / <alpha-value>)",
          foreground: "rgb(var(--card-foreground) / <alpha-value>)",
        },
        primary: {
          DEFAULT: "rgb(var(--primary) / <alpha-value>)",
          foreground: "rgb(var(--primary-foreground) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "rgb(var(--secondary) / <alpha-value>)",
          foreground: "rgb(var(--secondary-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "rgb(var(--accent) / <alpha-value>)",
          foreground: "rgb(var(--accent-foreground) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "rgb(var(--popover) / <alpha-value>)",
          foreground: "rgb(var(--popover-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "rgb(var(--muted) / <alpha-value>)",
          foreground: "rgb(var(--muted-foreground) / 0.5)",
        },
        destructive: {
          DEFAULT: "rgb(var(--destructive) / <alpha-value>)",
          foreground: "rgb(var(--destructive-foreground) / <alpha-value>)",
        },
        success: {
          DEFAULT: "rgb(var(--success) / <alpha-value>)",
          foreground: "rgb(var(--success-foreground) / <alpha-value>)",
        },
        warning: {
          DEFAULT: "rgb(var(--warning) / <alpha-value>)",
          foreground: "rgb(var(--warning-foreground) / <alpha-value>)",
        },
        info: {
          DEFAULT: "rgb(var(--info) / <alpha-value>)",
          foreground: "rgb(var(--info-foreground) / <alpha-value>)",
        },
        border: "rgb(var(--border) / 0.08)",
        input: "rgb(var(--border) / 0.08)",
        ring: "rgb(var(--ring) / <alpha-value>)",
        disabled: "rgb(var(--disabled) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["Pretendard", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      fontSize: {
        xs: ["12px", { lineHeight: "16px", letterSpacing: "0.12px" }],
        sm: ["14px", { lineHeight: "20px" }],
        base: ["16px", { lineHeight: "24px" }],
      },
      borderRadius: {
        "radius-none": "0px",
        "radius-sm": "4px",
        "radius-lg": "8px",
        radius: "10px",
        "radius-xl": "12px",
        "radius-2xl": "16px",
        "radius-full": "9999px",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        btn: "0 1px 1px rgba(38, 38, 38, 0.24), inset 0 1px 0 rgba(255, 255, 255, 0.16)",
        popover:
          "0px 10px 15px -3px rgba(0, 0, 0, 0.05), 0px 4px 6px -4px rgba(0, 0, 0, 0.05)",
      },
    },
  },
  plugins: [],
};
