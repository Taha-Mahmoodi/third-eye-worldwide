/*
 * Emits a <script type="application/ld+json"> tag with a JSON payload.
 * Safe in server components; renders inline without executing JS.
 */
export default function JsonLd({ data }) {
  if (!data) return null;
  const json = JSON.stringify(data);
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
