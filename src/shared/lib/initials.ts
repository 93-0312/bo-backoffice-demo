/**
 * 이름 → 이니셜 (shared/lib).
 * 킷 Avatar 의 `fallback`(이미지 없을 때 표시) 에 넣을 글자를 만든다. 도메인 무관 순수 함수.
 */
export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
