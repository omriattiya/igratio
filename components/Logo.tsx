type LogoProps = {
  className?: string;
};

export function Logo({ className = "size-8" }: LogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="100 120 300 240"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id="header-logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="50%" stopColor="#2dd4bf" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
      </defs>

      <g transform="translate(0, -20)">
        <line x1="180" y1="320" x2="320" y2="160" stroke="url(#header-logo-grad)" strokeWidth="20" strokeLinecap="round" />
        <path d="M 185 240 L 185 185" stroke="url(#header-logo-grad)" strokeWidth="18" strokeLinecap="round" fill="none" />
        <path d="M 150 200 L 185 165 L 220 200" stroke="url(#header-logo-grad)" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <line x1="155" y1="240" x2="215" y2="240" stroke="url(#header-logo-grad)" strokeWidth="16" strokeLinecap="round" />
        <path d="M 315 240 L 315 295" stroke="url(#header-logo-grad)" strokeWidth="18" strokeLinecap="round" fill="none" />
        <path d="M 280 280 L 315 315 L 350 280" stroke="url(#header-logo-grad)" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <line x1="285" y1="240" x2="345" y2="240" stroke="url(#header-logo-grad)" strokeWidth="16" strokeLinecap="round" />
      </g>
    </svg>
  );
}
