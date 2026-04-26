import RichText from '@/components/RichText';

interface Stat { number?: string; label?: string }
export default function ImpactCell({ stat }: { stat?: Stat }) {
  const { number, label } = stat || {};
  return (
    <div className="hi-cell">
      <RichText as="div" className="hi-n" html={number} />
      <div className="hi-l">{label}</div>
    </div>
  );
}
