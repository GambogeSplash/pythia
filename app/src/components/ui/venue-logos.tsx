export function PolymarketLogo({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <img
      src="/venues/polymarket.png"
      alt="Polymarket"
      width={size}
      height={size}
      className={`rounded-[6px] ${className}`}
    />
  );
}

export function KalshiLogo({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <img
      src="/venues/kalshi.png"
      alt="Kalshi"
      width={size}
      height={size}
      className={`rounded-[6px] ${className}`}
    />
  );
}

export function OpinionLabsLogo({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <img
      src="/venues/opinionlabs.png"
      alt="Opinion Labs"
      width={size}
      height={size}
      className={`rounded-[6px] ${className}`}
    />
  );
}

export function LimitlessLogo({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <img
      src="/venues/limitless.png"
      alt="Limitless"
      width={size}
      height={size}
      className={`rounded-[6px] ${className}`}
    />
  );
}

export function MyriadLogo({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <img
      src="/venues/myriad.png"
      alt="Myriad"
      width={size}
      height={size}
      className={`rounded-[6px] ${className}`}
    />
  );
}

export function ForecastExLogo({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <img
      src="/venues/forecastex.png"
      alt="ForecastEx"
      width={size}
      height={size}
      className={`rounded-[6px] ${className}`}
    />
  );
}

export function RobinhoodLogo({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <img
      src="/venues/robinhood.png"
      alt="Robinhood"
      width={size}
      height={size}
      className={`rounded-[6px] ${className}`}
    />
  );
}

export const VENUE_LOGOS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  polymarket: PolymarketLogo,
  kalshi: KalshiLogo,
  "opinion-labs": OpinionLabsLogo,
  limitless: LimitlessLogo,
  myriad: MyriadLogo,
  forecastex: ForecastExLogo,
  "robinhood-kalshi": RobinhoodLogo,
};
