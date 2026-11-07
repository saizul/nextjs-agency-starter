/** Decorative hero art: a browser window with a rising chart and an automation node. Pure SVG. */
export function HeroIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 520 400"
      className={className}
      role="img"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="hero-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6366f1" />
          <stop offset="1" stopColor="#22d3ee" />
        </linearGradient>
        <linearGradient id="hero-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6366f1" stopOpacity=".35" />
          <stop offset="1" stopColor="#6366f1" stopOpacity="0" />
        </linearGradient>
      </defs>
      <circle cx="430" cy="70" r="70" fill="url(#hero-g)" opacity=".18" />
      <circle cx="60" cy="340" r="50" fill="url(#hero-g)" opacity=".18" />
      <rect
        x="40"
        y="50"
        width="400"
        height="280"
        rx="18"
        fill="var(--bg)"
        stroke="var(--border)"
        strokeWidth="2"
      />
      <path d="M40 90h400" stroke="var(--border)" strokeWidth="2" />
      <circle cx="64" cy="70" r="6" fill="#f87171" />
      <circle cx="84" cy="70" r="6" fill="#fbbf24" />
      <circle cx="104" cy="70" r="6" fill="#34d399" />
      <rect x="64" y="112" width="120" height="14" rx="7" fill="var(--border)" />
      <rect x="64" y="136" width="200" height="10" rx="5" fill="var(--border)" opacity=".7" />
      <path
        d="M64 290 L130 250 L196 262 L262 200 L328 215 L394 150 L416 140 V300 H64Z"
        fill="url(#hero-area)"
      />
      <path
        d="M64 290 L130 250 L196 262 L262 200 L328 215 L394 150 L416 140"
        fill="none"
        stroke="url(#hero-g)"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="416" cy="140" r="8" fill="#6366f1" />
      <g transform="translate(330 250)">
        <rect width="170" height="110" rx="16" fill="var(--brand-solid)" />
        <circle cx="34" cy="38" r="12" fill="#fff" />
        <circle cx="136" cy="38" r="12" fill="#fff" opacity=".7" />
        <circle cx="85" cy="78" r="12" fill="#fff" opacity=".85" />
        <path
          d="M46 38h78M42 48l36 22M128 48l-36 22"
          stroke="#fff"
          strokeWidth="3"
          strokeLinecap="round"
          opacity=".8"
        />
      </g>
    </svg>
  );
}
