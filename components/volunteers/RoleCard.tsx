interface Role { icon?: string; title?: string; desc?: string; tag1?: string; tag2?: string }
export default function RoleCard({ role }: { role?: Role }) {
  const { icon = 'ph-hand-heart', title = '', desc = '', tag1, tag2 } = role || {};
  return (
    <div className="role-card">
      <div className="role-icon"><i className={`ph ${icon}`} aria-hidden="true"></i></div>
      <h4>{title}</h4>
      <p>{desc}</p>
      <div className="role-tags">
        {tag1 ? <span className="role-tag">{tag1}</span> : null}
        {tag2 ? <span className="role-tag">{tag2}</span> : null}
      </div>
    </div>
  );
}
