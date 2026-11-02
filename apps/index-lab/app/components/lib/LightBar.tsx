/** LightBar: barra de avance con una luz que la recorre. Solo depende de React y light-bar.css. */
import type { CSSProperties, JSX } from "react";
import "./light-bar.css";

export type LightBarTone = "live" | "negotiable";

export type LightBarProps = {
  /** Cuánto se llena, de 0 a 1. */
  value?: number;
  tone?: LightBarTone;
  /** Alto en px (9 en la carta). */
  height?: number;
  /** Segundos que tarda la luz en cruzar. */
  speed?: number;
  /** Puntas redondeadas (para usarla suelta, fuera de la carta). */
  rounded?: boolean;
  /** Con texto, se anuncia como barra de progreso; sin texto es decorativa. */
  label?: string;
  className?: string;
};

export function LightBar({ value = 1, tone = "live", height = 9, speed = 1.8, rounded = false, label, className = "" }: LightBarProps): JSX.Element {
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100);
  const a11y = label
    ? { role: "progressbar", "aria-label": label, "aria-valuenow": pct, "aria-valuemin": 0, "aria-valuemax": 100 }
    : { "aria-hidden": true };
  return (
    <span className={`vlb vlb--${tone}${rounded ? " vlb--rounded" : ""}${className ? ` ${className}` : ""}`} {...a11y}
      style={{ "--vlb-h": `${height}px`, "--vlb-speed": `${speed}s` } as CSSProperties}>
      <i style={{ width: `${pct}%` }} />
    </span>
  );
}

export default LightBar;
