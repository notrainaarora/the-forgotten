/**
 * The Forgotten mark: the shield from the Great Seal of the United States,
 * simplified. A navy chief with three stars over red-and-white pales.
 */
export function LogoMark({ size = 26, title }: { size?: number; title?: string }) {
  const w = (size * 24) / 28;
  const shield = "M1 1h22v13.5C23 21 17.8 25.4 12 27 6.2 25.4 1 21 1 14.5z";
  const starPath = (cx: number, cy: number, r: number) => {
    const pts = [];
    for (let i = 0; i < 10; i++) {
      const rad = i % 2 === 0 ? r : r * 0.4;
      const a = (Math.PI / 5) * i - Math.PI / 2;
      pts.push(`${(cx + rad * Math.cos(a)).toFixed(2)},${(cy + rad * Math.sin(a)).toFixed(2)}`);
    }
    return pts.join(" ");
  };
  const id = `tf-shield-${size}`;
  return (
    <svg width={w} height={size} viewBox="0 0 24 28" role={title ? "img" : undefined} aria-hidden={title ? undefined : true} aria-label={title}>
      <defs><clipPath id={id}><path d={shield} /></clipPath></defs>
      <g clipPath={`url(#${id})`}>
        <rect x="0" y="0" width="24" height="28" fill="#fffdf9" />
        {[0, 2, 4, 6].map((i) => (
          <rect key={i} x={1 + i * (22 / 7)} y="0" width={22 / 7} height="28" fill="var(--red, #c1272d)" />
        ))}
        <rect x="0" y="0" width="24" height="9.5" fill="var(--navy, #14254a)" />
        {[6, 12, 18].map((cx) => <polygon key={cx} points={starPath(cx, 5.4, 2.6)} fill="#fffdf9" />)}
      </g>
      <path d={shield} fill="none" stroke="var(--navy, #14254a)" strokeWidth="1.4" />
    </svg>
  );
}

/** A full American flag (13 stripes, 50 stars), drawn in the site palette. */
export function Flag({ className, style }: { className?: string; style?: React.CSSProperties }) {
  const W = 1235, H = 650, stripeH = H / 13, cantonW = 494, cantonH = stripeH * 7;
  const stars: [number, number][] = [];
  for (let row = 0; row < 9; row++) {
    const cols = row % 2 === 0 ? 6 : 5;
    for (let c = 0; c < cols; c++) {
      const x = row % 2 === 0 ? cantonW / 12 + (c * cantonW) / 6 : cantonW / 6 + (c * cantonW) / 6;
      const y = cantonH / 10 + (row * cantonH) / 10;
      stars.push([x, y]);
    }
  }
  const r = 18.5;
  const star = (cx: number, cy: number) => {
    const pts = [];
    for (let i = 0; i < 10; i++) {
      const rad = i % 2 === 0 ? r : r * 0.382;
      const a = (Math.PI / 5) * i - Math.PI / 2;
      pts.push(`${(cx + rad * Math.cos(a)).toFixed(1)},${(cy + rad * Math.sin(a)).toFixed(1)}`);
    }
    return pts.join(" ");
  };
  return (
    <svg className={className} style={style} viewBox={`0 0 ${W} ${H}`} role="img" aria-label="American flag" preserveAspectRatio="xMidYMid meet">
      <rect width={W} height={H} fill="var(--white, #fffdf9)" />
      {Array.from({ length: 7 }, (_, i) => (
        <rect key={i} y={i * 2 * stripeH} width={W} height={stripeH} fill="var(--red, #c8102e)" />
      ))}
      <rect width={cantonW} height={cantonH} fill="var(--navy, #14254a)" />
      {stars.map(([x, y], i) => <polygon key={i} points={star(x, y)} fill="var(--white, #fffdf9)" />)}
    </svg>
  );
}
