// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface Step { title?: string; desc?: string; [key: string]: any }
export default function StepItem({ step }: { step?: Step }) {
  const { title = '', desc = '' } = step || {};
  return (
    <div className="vol-step">
      <div>
        <h4>{title}</h4>
        <p>{desc}</p>
      </div>
    </div>
  );
}
