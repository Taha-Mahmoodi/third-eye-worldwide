/*
 * Team-member card. `member` shape (CMS):
 * { initials, bg, name, role, bio, img, visible, order }.
 */
export default function TeamCard({ member }) {
  const { initials = 'TE', bg = 'bg-1', name = '', role = '', bio = '', img = '' } = member || {};
  return (
    <div className="team-card">
      <div className={`team-photo ${bg}${img ? ' has-img' : ''}`}>
        {img ? (
          <img className="team-photo-img" src={img} alt={`Portrait of ${name}`} loading="lazy" />
        ) : null}
        <span className="initials" aria-hidden={img ? 'true' : 'false'}>{initials}</span>
      </div>
      <h4>{name}</h4>
      <div className="role">{role}</div>
      <p className="bio">{bio}</p>
    </div>
  );
}
