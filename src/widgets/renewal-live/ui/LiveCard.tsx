import styled from "styled-components";
import { Card, CardHeader, CardTitle, GhostButton, HeaderRight, t } from "@/shared/ui/renewal";

/**
 * LiveCard — 외부 라이브 스트림 임베드 카드 (widgets/renewal-live/ui).
 * 리뉴얼 카드 셸 안에 16:9 iframe 을 띄운다. 어떤 주소를 띄울지는 page 가 주입.
 */
const LiveBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px;
  border-radius: ${t.radius.pill}px;
  background: rgba(231, 0, 11, 0.08);
  color: ${t.color.red};
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;

  &::before {
    content: "";
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: ${t.color.red};
  }
`;

const Frame = styled.div`
  position: relative;
  margin: 20px auto 0;
  width: 100%;
  max-width: 960px;
  aspect-ratio: 16 / 9;
  background: #0f172b;
  border-radius: ${t.radius.tile}px;
  overflow: hidden;

  iframe {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    border: 0;
  }
`;

export interface LiveCardProps {
  title: string;
  /** iframe 으로 임베드할 주소 */
  src: string;
  /** "새 창에서 보기" 링크 (기본: src) */
  href?: string;
}

export function LiveCard({ title, src, href }: LiveCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
          {title}
          <LiveBadge>LIVE</LiveBadge>
        </CardTitle>
        <HeaderRight>
          <GhostButton onClick={() => window.open(href ?? src, "_blank", "noopener")}>
            새 창에서 보기
          </GhostButton>
        </HeaderRight>
      </CardHeader>
      <Frame>
        <iframe
          src={src}
          title={title}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          // top-level 이동(frame busting)만 막고, 로그인 시도는 팝업으로 열리게 허용.
          // 단, 네이버 로그인 페이지는 X-Frame-Options: SAMEORIGIN 이라 iframe "안"에서는
          // 절대 안 뜨고, SameSite 쿠키 정책 때문에 로그인해도 iframe 이 세션을 인식하지
          // 못할 수 있다(브라우저 정책 의존). 확실한 경로는 "새 창에서 보기".
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-modals allow-presentation"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </Frame>
    </Card>
  );
}
