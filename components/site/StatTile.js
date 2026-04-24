import RichText from '@/components/RichText';

/*
 * Reusable stat tile (about mission panel, volunteers stats, …).
 * `stat` shape: { number, label } — number may contain rich markup.
 */
export default function StatTile({ stat }) {
  const { number, label } = stat || {};
  return (
    <div className="about-stat">
      <RichText as="div" className="n" html={number} />
      <div className="l">{label}</div>
    </div>
  );
}
