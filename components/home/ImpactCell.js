import RichText from '@/components/RichText';

export default function ImpactCell({ stat }) {
  const { number, label } = stat || {};
  return (
    <div className="hi-cell">
      <RichText as="div" className="hi-n" html={number} />
      <div className="hi-l">{label}</div>
    </div>
  );
}
