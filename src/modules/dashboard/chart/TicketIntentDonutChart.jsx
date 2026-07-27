import { useTranslation } from "react-i18next";
import { INTENT_LABELS } from "../../ticket/ticket.schema";
import DonutChart from "./DonutChart";

const INTENT_COLORS = [
  "#EF4444", "#F59E0B", "#3B82F6", "#10B981",
  "#8B5CF6", "#EC4899", "#14B8A6", "#9CA3AF",
];

const getIntentLabel = (intentKey) => {
  if (intentKey === "Unclassified") return "Unclassified";
  return INTENT_LABELS[intentKey] ?? intentKey;
};

export default function TicketIntentDonutChart({ ticketByIntent, loading, height }) {
  const { t } = useTranslation();

  const entries = Object.entries(ticketByIntent ?? {});
  const data = entries.map(([intent], i) => ({
    label: getIntentLabel(intent),
    value: Number(ticketByIntent?.[intent] ?? 0),
    color: INTENT_COLORS[i % INTENT_COLORS.length],
  }));

  return (
    <DonutChart
      title={t("pages.dashboard.ticketIntent")}
      subtitle={t("pages.dashboard.donutSubtitle")}
      data={data}
      loading={loading}
      emptyMessage={t("pages.dashboard.noTicketIntentData")}
      height={height}
    />
  );
}
