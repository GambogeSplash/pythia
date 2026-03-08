/**
 * Venue brand icons for prediction market platforms.
 * Based on each platform's official brand marks.
 */

interface IconProps {
  className?: string;
  size?: number;
}

/** Polymarket — asterisk/starburst mark (white lines on dark, from official brand) */
export function PolymarketIcon({ className = "", size = 16 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 500 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="500" height="500" rx="14" fill="currentColor" fillOpacity="0.12" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M229.93 404.121V84.033h17.245v320.088H229.93Z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M24.56 283.806l440.718-24.851.982 17.05L25.539 300.856l-.979-17.05Z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M236.148 271.779l157.613-50.437 5.301 16.252-157.612 50.436-5.302-16.251Z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M230.667 288.892l58.715-132.146 15.785 6.879-58.718 132.146-15.782-6.879Z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M146.045 221.815l223.516 109.477-7.646 15.309-223.513-109.478 7.643-15.308Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** Kalshi — stylized "K" lettermark */
export function KalshiIcon({ className = "", size = 16 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="24" height="24" rx="6" fill="currentColor" fillOpacity="0.12" />
      <path
        d="M8 5v14M8 12l8-7M8 12l8 7"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Limitless — infinity/lemniscate mark */
export function LimitlessIcon({ className = "", size = 16 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="24" height="24" rx="6" fill="currentColor" fillOpacity="0.12" />
      <path
        d="M5.5 12c0-1.5 1.2-3 3-3s3 1.5 3 3-1.2 3-3 3-3-1.5-3-3Zm7 0c0-1.5 1.2-3 3-3s3 1.5 3 3-1.2 3-3 3-3-1.5-3-3Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Opinion Labs — beaker/lab icon */
export function OpinionLabsIcon({ className = "", size = 16 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="24" height="24" rx="6" fill="currentColor" fillOpacity="0.12" />
      <path
        d="M9 3v5.586l-4.293 4.293A2 2 0 005 14.293V18a2 2 0 002 2h10a2 2 0 002-2v-3.707a2 2 0 00-.586-1.414L15 8.586V3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M9 3h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M7 15h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

/** Myriad — "M" geometric mark */
export function MyriadIcon({ className = "", size = 16 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="24" height="24" rx="6" fill="currentColor" fillOpacity="0.12" />
      <path
        d="M5 19V7l7 6 7-6v12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Lookup map for dynamic usage */
export const VenueIcon: Record<string, React.FC<IconProps>> = {
  Polymarket: PolymarketIcon,
  Kalshi: KalshiIcon,
  "Opinion Labs": OpinionLabsIcon,
  Limitless: LimitlessIcon,
  Myriad: MyriadIcon,
};
