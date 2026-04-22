import HtmlContent from '@/components/HtmlContent';
import { getContent } from '@/lib/cms/db';
import { renderVolunteers } from '@/lib/pages/volunteers';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Volunteer — Third Eye Worldwide' };

export default async function VolunteersPage() {
  const content = await getContent();
  return <HtmlContent html={renderVolunteers(content)} />;
}
