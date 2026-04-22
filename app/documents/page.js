import HtmlContent from '@/components/HtmlContent';
import { getContent } from '@/lib/cms/db';
import { renderDocuments } from '@/lib/pages/documents';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Documents — Third Eye Worldwide' };

export default async function DocumentsPage() {
  const content = await getContent();
  return <HtmlContent html={renderDocuments(content)} />;
}
