import RichText from '@/components/RichText';

/*
 * Reusable stat tile (about mission panel, volunteers stats, …).
 * `stat` shape: { number, label } — number may contain rich markup.
 */
export interface StatTileData {
  number?: string;
  label?: string;
}

export default function StatTile({ stat }: { stat?: StatTileData }) {
  const { number, label } = stat || {};
  return (
    <div className="about-stat">
      <RichText as="div" className="n" html={number} />
      <div className="l">{label}</div>
    </div>
  );
}
