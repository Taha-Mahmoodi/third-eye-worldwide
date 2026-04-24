import HtmlContent from '@/components/HtmlContent';
import { getContent } from '@/lib/cms/db';
import { renderProjects } from '@/lib/pages/projects';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Projects — Third Eye Worldwide' };

export default async function ProjectsPage() {
  const content = await getContent();
  return <HtmlContent html={renderProjects(content)} />;
}
