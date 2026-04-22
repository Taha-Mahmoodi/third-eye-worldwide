import HtmlContent from '@/components/HtmlContent';
import { getContent } from '@/lib/cms/db';
import { renderPrograms } from '@/lib/pages/programs';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Programs — Third Eye Worldwide' };

export default async function ProgramsPage() {
  const content = await getContent();
  return <HtmlContent html={renderPrograms(content)} />;
}
