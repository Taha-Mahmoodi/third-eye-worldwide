/*
 * Team-member card. `member` shape (CMS):
 * { initials, bg, name, role, bio, img, visible, order }.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface TeamMember { initials?: string; bg?: string; name?: string; role?: string; bio?: string; img?: string; [key: string]: any }
export default function TeamCard({ member }: { member?: TeamMember }) {
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
