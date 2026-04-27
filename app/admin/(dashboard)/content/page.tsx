import { getContent } from '@/lib/cms/db';
import ContentEditor from '@/components/admin/ContentEditor';

export const dynamic = 'force-dynamic';

/*
 * Content editor — server component fetches the live content document
 * and hands it to the client editor. The editor stores its draft in
 * local state and PUTs to /api/cms/data on publish.
 *
 * If getContent() throws (DB unreachable), the route's error.tsx
 * boundary catches it (CMS-2). On a clean nullish result we hand an
 * empty object so the editor still renders an empty surface to start
 * from.
 */
export default async function ContentEditorPage() {
  const content = (await getContent()) ?? {};
  return <ContentEditor initialContent={content as Record<string, unknown>} />;
}
