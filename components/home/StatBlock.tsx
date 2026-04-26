import RichText from '@/components/RichText';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface Stat { number?: string; label?: string; [key: string]: any }
export default function StatBlock({ stat }: { stat?: Stat }) {
  const { number, label } = stat || {};
  return (
    <div className="stat-block">
      <RichText as="span" className="num" html={number} />
      <span className="lbl">{label}</span>
    </div>
  );
}
