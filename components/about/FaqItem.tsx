import RichText from '@/components/RichText';

/*
 * Single FAQ entry. Uses native <details>/<summary> for zero-JS open/close.
 * `item` shape: { num, question, body } — question and body may contain
 * trusted CMS-authored HTML.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface FaqEntry { num?: string; question?: string; body?: string; [key: string]: any }
export default function FaqItem({ item }: { item?: FaqEntry }) {
  const { num, question, body } = item || {};
  return (
    <details className="faq-item">
      <summary>
        <div className="faq-num">{num || ''}</div>
        <RichText as="div" className="faq-q" html={question} />
        <div className="faq-chev"><i className="ph-bold ph-plus" aria-hidden="true"></i></div>
      </summary>
      <RichText as="div" className="faq-panel" html={body} />
    </details>
  );
}
