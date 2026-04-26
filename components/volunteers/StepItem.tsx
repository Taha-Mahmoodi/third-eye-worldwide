interface Step { title?: string; desc?: string }
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
