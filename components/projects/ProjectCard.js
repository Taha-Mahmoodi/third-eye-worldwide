/*
 * Card that renders a single project in the /projects grid.
 * CMS shape: { id, icon, title, desc, tag, visible, order }.
 */
export default function ProjectCard({ project }) {
  const { icon, title, desc, tag } = project || {};
  return (
    <div className="prog-card">
      <div className="prog-icon">
        <i className={`ph ${icon || 'ph-star'}`} aria-hidden="true"></i>
      </div>
      <div className="prog-content">
        <h3>{title || ''}</h3>
        <p>{desc || ''}</p>
        {tag ? <span className="prog-tag">{tag}</span> : null}
      </div>
    </div>
  );
}
