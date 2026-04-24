import { useAppStore } from "../store/useAppStore";
import { HistoryHero } from "../components/history/HistoryHero";
import { HistoryListSection } from "../components/history/HistoryListSection";

export default function History() {
  const predictions = useAppStore((state) => state.predictions);

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <HistoryHero />
      <HistoryListSection predictions={predictions} />
    </div>
  );
}
