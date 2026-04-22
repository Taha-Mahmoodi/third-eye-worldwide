import HtmlContent from '@/components/HtmlContent';
import { getContent } from '@/lib/cms/db';
import { renderDonate } from '@/lib/pages/donate';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Donate — Third Eye Worldwide' };

export default async function DonatePage() {
  const content = await getContent();
  return <HtmlContent html={renderDonate(content)} />;
}
