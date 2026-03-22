import { useId, useMemo } from "react";
import { cn } from "@/utils/cn";

function buildPath(points) {
  if (points.length === 0) return "";
  if (points.length === 1) {
    const p = points[0];
    return `M ${p.x} ${p.y}`;
  }

  // Smooth curve (Catmull–Rom -> Bezier)
  const d = [];
  d.push(`M ${points[0].x} ${points[0].y}`);

  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[i - 1] || points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;

    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;

    d.push(`C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`);
  }

  return d.join(" ");
}

export default function LineChart({
  data = [],
  className,
  stroke = "#6aa200",
  strokeWidth = 2.5,
  fillOpacity = 0.16,
}) {
  const gradientId = useId().replace(/[^a-zA-Z0-9_-]/g, "");

  const { linePath, areaPath } = useMemo(() => {
    const values = Array.isArray(data) ? data.map((v) => Number(v) || 0) : [];
    if (values.length === 0) return { linePath: "", areaPath: "" };

    const viewWidth = 100;
    const viewHeight = 40;
    const padX = 2;
    const padY = 3;
    const innerW = viewWidth - padX * 2;
    const innerH = viewHeight - padY * 2;

    const max = Math.max(...values, 0);
    const min = Math.min(...values, 0);
    const range = max - min || 1;

    const points = values.map((value, idx) => {
      const x = values.length === 1 ? viewWidth / 2 : padX + (idx / (values.length - 1)) * innerW;
      const y = padY + (1 - (value - min) / range) * innerH;
      return { x: Number(x.toFixed(3)), y: Number(y.toFixed(3)) };
    });

    const lp = buildPath(points);
    const baselineY = padY + innerH;
    const ap = lp
      ? `${lp} L ${points[points.length - 1].x} ${baselineY} L ${points[0].x} ${baselineY} Z`
      : "";

    return { linePath: lp, areaPath: ap };
  }, [data]);

  return (
    <div className={cn("w-full", className)}>
      <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="w-full h-full">
        <defs>
          <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={stroke} stopOpacity={fillOpacity} />
            <stop offset="100%" stopColor={stroke} stopOpacity="0" />
          </linearGradient>
        </defs>

        {areaPath && <path d={areaPath} fill={`url(#${gradientId})`} />}
        {linePath && (
          <path
            d={linePath}
            fill="none"
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        )}
      </svg>
    </div>
  );
}
