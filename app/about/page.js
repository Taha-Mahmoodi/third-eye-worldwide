import HtmlContent from '@/components/HtmlContent';
import { getContent } from '@/lib/cms/db';
import { renderAbout } from '@/lib/pages/about';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'About — Third Eye Worldwide' };

export default async function AboutPage() {
  const content = await getContent();
  return <HtmlContent html={renderAbout(content)} />;
}
