import RichText from '@/components/RichText';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface Stat { number?: string; label?: string; [key: string]: any }
export default function ImpactCell({ stat }: { stat?: Stat }) {
  const { number, label } = stat || {};
  return (
    <div className="hi-cell">
      <RichText as="div" className="hi-n" html={number} />
      <div className="hi-l">{label}</div>
    </div>
  );
}
