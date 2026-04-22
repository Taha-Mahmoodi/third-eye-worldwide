import HtmlContent from '@/components/HtmlContent';
import { getContent } from '@/lib/cms/db';
import { renderHome } from '@/lib/pages/home';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const content = await getContent();
  return <HtmlContent html={renderHome(content)} />;
}
