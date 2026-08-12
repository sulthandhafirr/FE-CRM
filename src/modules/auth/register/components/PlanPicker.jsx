import PlanCard from "./PlanCard";
import { PLANS } from "../plans";

export default function PlanPicker({ value, onChange, prices }) {
  return (
    <div style={gridStyle}>
      {PLANS.map((item) => (
        <PlanCard
          key={item.id}
          item={item}
          prices={prices}
          selected={value === item.id}
          onSelect={() => onChange(item.id)}
        />
      ))}
    </div>
  );
}

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: 12,
  marginTop: 10,
  marginBottom: 16,
};
