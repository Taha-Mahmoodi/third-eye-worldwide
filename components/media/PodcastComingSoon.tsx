import PodcastGuestForm from '@/components/media/PodcastGuestForm';

/*
 * Shown on /media#podcasts while the show is in pre-production.
 * Reads { name, desc, guestCopy, guestEmail } from content.media.podcastShow.
 */
interface ShowMeta { name?: string; desc?: string; guestCopy?: string; guestEmail?: string }
export default function PodcastComingSoon({ show }: { show?: ShowMeta }) {
  const {
    name = 'The Third Eye Podcast',
    desc = 'Coming soon — stories of blind and low-vision innovators, in their own voices.',
    guestCopy = 'Want to share your story with your community? Record a 60-second pitch, or email us.',
    guestEmail = 'guest@teww.org',
  } = show || {};

  return (
    <div className="pod-coming-soon">
      <div className="pod-coming-soon-intro">
        <div className="pod-coming-soon-badge">
          <span className="pod-coming-soon-dot" aria-hidden="true"></span>
          Coming soon
        </div>
        <h2 className="pod-coming-soon-title">{name}</h2>
        <p className="pod-coming-soon-desc">{desc}</p>
      </div>
      <div className="pod-coming-soon-form">
        <h3 id="pod-guest-heading" className="pod-coming-soon-form-title">Be a guest on season one</h3>
        <p className="pod-coming-soon-form-desc">{guestCopy}</p>
        <PodcastGuestForm guestEmail={guestEmail} />
      </div>
    </div>
  );
}
