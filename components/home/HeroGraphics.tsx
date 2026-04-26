/*
 * Decorative rings + eye SVG behind the home hero. Pure presentation;
 * carries aria-hidden so screen readers skip it.
 */
export default function HeroGraphics({ liveLabel }: { liveLabel?: string }) {
  return (
    <div className="hero-graphics" aria-hidden="true">
      <svg className="hg-rings" viewBox="0 0 400 400" fill="none" stroke="currentColor" strokeWidth="1">
        <circle cx="200" cy="200" r="80" />
        <circle cx="200" cy="200" r="130" />
        <circle cx="200" cy="200" r="180" strokeDasharray="4 8" />
      </svg>
      <svg className="hg-eye" viewBox="0 0 220 257.57" fill="currentColor">
        <path d="M212.24,8.45c-5.74-5.63-13.38-8.45-22.94-8.45H0v57.17c13.39-5.17,28.43-8.08,44.32-8.08,32.4,0,61.24,12.06,79.89,30.85,3.56,3.59,3.56,9.32,0,12.9-18.65,18.79-47.49,30.86-79.89,30.86-5.32,0-10.54-.33-15.64-.96-10.14-1.24-19.77-3.69-28.68-7.13v108.45c0,9.77,2.86,17.47,8.6,23.11,5.74,5.63,13.38,8.45,22.94,8.45h189.29v-57.17c-13.4,5.17-28.43,8.08-44.32,8.08-32.4,0-61.25-12.06-79.89-30.85-3.56-3.59-3.56-9.32,0-12.9,18.64-18.79,47.49-30.86,79.89-30.86,5.32,0,10.54.33,15.64.96,10.13,1.24,19.76,3.69,28.68,7.13V31.55c0-9.77-2.86-17.48-8.6-23.11Z" />
      </svg>
      <div className="hg-dots"></div>
      <span className="hg-line l1"></span>
      <span className="hg-line l2"></span>
      {liveLabel ? (
        <span className="hg-live"><span className="dot"></span> {liveLabel}</span>
      ) : null}
    </div>
  );
}
