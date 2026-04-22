import HtmlContent from '@/components/HtmlContent';
import { getContent } from '@/lib/cms/db';
import { renderMedia } from '@/lib/pages/media';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Media — Third Eye Worldwide' };

export default async function MediaPage() {
  const content = await getContent();
  return <HtmlContent html={renderMedia(content)} />;
}
