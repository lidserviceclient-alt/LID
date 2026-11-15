import Badge from "../ui/Badge.jsx";
import { DELIVERY, DIRECTION, HANDLING } from "../../pages/contact/contactUtils.js";

export function HandlingBadge({ status }) {
  const s = HANDLING[status];
  return s ? <Badge label={s.label} variant={s.variant} /> : null;
}

export function DeliveryBadge({ status }) {
  const s = DELIVERY[status] || { label: status || "-", variant: "neutral" };
  return <Badge label={s.label} variant={s.variant} />;
}

export function DirectionBadge({ direction }) {
  const label = DIRECTION[direction]?.label || "Envoyé";
  return <Badge label={label} variant={direction === "INBOUND" ? "secondary" : "outline"} />;
}
