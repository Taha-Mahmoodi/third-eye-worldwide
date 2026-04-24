import RichText from '@/components/RichText';

/*
 * Single stat tile inside the mission "about-visual" panel.
 * `stat` shape: { number, label, visible, order } — number may be rich HTML.
 */
export default function MissionStat({ stat }) {
  const { number, label } = stat || {};
  return (
    <div className="about-stat">
      <RichText as="div" className="n" html={number} />
      <div className="l">{label}</div>
    </div>
  );
}
