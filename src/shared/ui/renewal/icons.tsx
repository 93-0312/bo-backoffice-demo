import React from 'react';

interface IconProps {
  size?: number;
  color?: string;
  style?: React.CSSProperties;
}

const base = (size: number): React.SVGProps<SVGSVGElement> => ({
  width: size,
  height: size,
  viewBox: '0 0 16 16',
  fill: 'none',
  xmlns: 'http://www.w3.org/2000/svg',
});

export const IconRows: React.FC<IconProps> = ({ size = 14, color = 'currentColor', style }) => (
  <svg {...base(size)} style={style}>
    <rect x="2" y="3" width="12" height="3.6" rx="1" stroke={color} strokeWidth="1.3" />
    <rect x="2" y="9.4" width="12" height="3.6" rx="1" stroke={color} strokeWidth="1.3" />
  </svg>
);

export const IconCalendar: React.FC<IconProps> = ({ size = 14, color = 'currentColor', style }) => (
  <svg {...base(size)} style={style}>
    <rect x="2" y="3" width="12" height="11" rx="1.5" stroke={color} strokeWidth="1.3" />
    <path d="M2 6.5H14" stroke={color} strokeWidth="1.3" />
    <path d="M5.5 1.5V4M10.5 1.5V4" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);

export const IconTrendArrow: React.FC<IconProps & { down?: boolean }> = ({
  size = 12,
  color = 'currentColor',
  down,
  style,
}) => (
  <svg
    {...base(size)}
    style={{ transform: down ? 'scaleY(-1)' : undefined, ...style }}
  >
    <path
      d="M4 12L12 4M12 4H6M12 4V10"
      stroke={color}
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const IconDownload: React.FC<IconProps> = ({ size = 14, color = 'currentColor', style }) => (
  <svg {...base(size)} style={style}>
    <path
      d="M8 2.5V10M8 10L5 7M8 10L11 7"
      stroke={color}
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M2.5 11.5V13H13.5V11.5" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);

export const IconInfo: React.FC<IconProps> = ({ size = 13, color = 'currentColor', style }) => (
  <svg {...base(size)} style={style}>
    <circle cx="8" cy="8" r="6" stroke={color} strokeWidth="1.2" />
    <path d="M8 7.2V11" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
    <circle cx="8" cy="5" r="0.9" fill={color} />
  </svg>
);

export const IconChevronRight: React.FC<IconProps> = ({
  size = 14,
  color = 'currentColor',
  style,
}) => (
  <svg {...base(size)} style={style}>
    <path
      d="M6 3.5L10.5 8L6 12.5"
      stroke={color}
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const IconChevronDown: React.FC<IconProps> = ({
  size = 14,
  color = 'currentColor',
  style,
}) => (
  <svg {...base(size)} style={style}>
    <path
      d="M3.5 6L8 10.5L12.5 6"
      stroke={color}
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
