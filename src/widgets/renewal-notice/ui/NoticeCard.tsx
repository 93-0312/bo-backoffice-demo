import React from 'react';
import styled from 'styled-components';
import { Card, CardHeader, CardTitle } from "@/shared/ui/renewal";
import { t } from "@/shared/ui/renewal";
import { NoticeBadge, NoticeItem } from "@/entities/dashboard-renewal";
import { IconChevronRight } from "@/shared/ui/renewal";

const ViewMore = styled.button`
  border: 0;
  background: none;
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-family: ${t.font.family};
  font-size: 12px;
  color: ${t.color.textFaint};
  cursor: pointer;

  &:hover {
    color: ${t.color.textStrong};
  }
`;

const List = styled.ul`
  list-style: none;
  margin: 8px 0 0;
  padding: 0;
`;

const RowItem = styled.li`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px 2px;
  border-bottom: 1px solid ${t.color.divider};
  font-size: 14px;
  color: ${t.color.textStrong};
  cursor: pointer;

  &:last-child {
    border-bottom: 0;
  }

  &:hover {
    background: ${t.color.pageBg};
  }
`;

const badgeStyle: Record<NoticeBadge, { color: string; bg: string; label: string }> = {
  alert: { color: t.color.red, bg: 'rgba(231, 0, 11, 0.06)', label: 'Alert' },
  system: { color: t.color.green, bg: 'rgba(16, 185, 129, 0.08)', label: 'System' },
  new: { color: t.color.blue600, bg: 'rgba(21, 93, 252, 0.07)', label: 'New' },
};

const Badge = styled.span<{ $badge: NoticeBadge }>`
  flex: none;
  padding: 3px 8px;
  border-radius: ${t.radius.badge}px;
  font-size: 11px;
  font-weight: 600;
  color: ${(p) => badgeStyle[p.$badge].color};
  background: ${(p) => badgeStyle[p.$badge].bg};
`;

const Title = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

interface Props {
  items: NoticeItem[];
  onMore?: () => void;
  onItemClick?: (item: NoticeItem) => void;
}

const NoticeCard: React.FC<Props> = ({ items, onMore, onItemClick }) => (
  <Card>
    <CardHeader>
      <CardTitle>Notice</CardTitle>
      <ViewMore onClick={onMore}>
        View more <IconChevronRight size={12} />
      </ViewMore>
    </CardHeader>
    <List>
      {items.slice(0, 7).map((n) => (
        <RowItem key={n.id} onClick={() => onItemClick && onItemClick(n)}>
          {n.badge && <Badge $badge={n.badge}>{badgeStyle[n.badge].label}</Badge>}
          <Title>{n.title}</Title>
        </RowItem>
      ))}
    </List>
  </Card>
);

export default NoticeCard;
