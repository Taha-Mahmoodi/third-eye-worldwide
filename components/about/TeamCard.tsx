import Image from 'next/image';
import { isSafeImageUrl } from '@/lib/utils';

/*
 * Team-member card. `member` shape (CMS):
 * { initials, bg, name, role, bio, img, visible, order }.
 *
 * Photos render via next/image in `fill` mode so the framework
 * generates srcset/AVIF + lazy-loads them. The parent .team-photo
 * already has `position: relative; overflow: hidden` so fill works.
 * URLs go through isSafeImageUrl first to keep CMS-pasted strings
 * from sneaking through as untrusted origins.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface TeamMember { initials?: string; bg?: string; name?: string; role?: string; bio?: string; img?: string; [key: string]: any }
export default function TeamCard({ member }: { member?: TeamMember }) {
  const { initials = 'TE', bg = 'bg-1', name = '', role = '', bio = '', img = '' } = member || {};
  const safeImg = isSafeImageUrl(img) ? img : '';
  return (
    <div className="team-card">
      <div className={`team-photo ${bg}${safeImg ? ' has-img' : ''}`}>
        {safeImg ? (
          <Image
            className="team-photo-img"
            src={safeImg}
            alt={`Portrait of ${name}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : null}
        <span className="initials" aria-hidden={safeImg ? 'true' : 'false'}>{initials}</span>
      </div>
      <h4>{name}</h4>
      <div className="role">{role}</div>
      <p className="bio">{bio}</p>
    </div>
  );
}
