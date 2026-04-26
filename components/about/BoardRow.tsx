/*
 * Board-member row shown inside the Governance card on /about#team.
 * `member` shape (CMS): { name, title, visible, order }.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface Member { name?: string; title?: string; [key: string]: any }
export default function BoardRow({ member }: { member?: Member }) {
  const { name = '', title = '' } = member || {};
  const initials = name.split(' ').map((w: string) => w[0] || '').slice(0, 2).join('');
  return (
    <div className="board-row">
      <div className="board-row-left">
        <div className="board-avatar" aria-hidden="true">{initials}</div>
        <div>
          <div className="board-name">{name}</div>
          <div className="board-title">{title}</div>
        </div>
      </div>
      <i className="ph ph-arrow-up-right" aria-hidden="true"></i>
    </div>
  );
}
