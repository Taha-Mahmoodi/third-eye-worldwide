import { getContent, visibleSorted } from '@/lib/cms/db';
import RichText from '@/components/RichText';
import Subnav from '@/components/site/Subnav';
import DocCard from '@/components/documents/DocCard';
import FilterableBlogGrid from '@/components/documents/FilterableBlogGrid';
import NewsletterForm from '@/components/documents/NewsletterForm';
import FeaturedStory from '@/components/documents/FeaturedStory';
import { pageMetadata, readSeoOverrides } from '@/lib/seo';


export async function generateMetadata() {
  const content = await getContent();
  const o = readSeoOverrides(content, '/documents');
  const d = content?.documents || {};
  return pageMetadata({
    title: o.title || 'Documents — Third Eye Worldwide',
    description: o.description || d.heroSub || 'Blogs, stories, and long-form writing from the TEWW team and community.',
    path: '/documents',
    image: o.image,
    noindex: o.noindex,
  });
}

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function BlogsTab({ blogs, cats }) {
  return (
    <>
      <section className="section">
        <div className="section-inner">
          <FilterableBlogGrid blogs={blogs} cats={cats} />
        </div>
      </section>
      <section className="section section-alt">
        <div className="section-inner">
          <NewsletterForm />
        </div>
      </section>
    </>
  );
}

function StoriesTab({ stories, fs }) {
  return (
    <section className="section">
      <div className="section-inner">
        <div className="section-heading left" style={{ maxWidth: 720, marginBottom: 32 }}>
          <div className="section-eyebrow">Stories</div>
          <h2 className="section-title">Voices from our community</h2>
          <p className="section-subtitle">
            Real people, real independence. These are the stories that remind us why the work matters.
          </p>
        </div>

        <FeaturedStory fs={fs} />

        <h3 className="stories-list-heading">More stories</h3>
        {stories.length > 0 ? (
          <div className="doc-grid">
            {stories.map((s) => <DocCard key={s.id || s.title} doc={s} defaultKind="story" />)}
          </div>
        ) : (
          <p style={{ color: 'var(--fg-muted)' }}>No stories yet.</p>
        )}

        {stories.length > 6 ? (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 48 }}>
            <button type="button" className="btn-secondary">Load more stories</button>
          </div>
        ) : null}
      </div>
    </section>
  );
}

export default async function DocumentsPage() {
  const content = await getContent();
  const d = content?.documents || {};
  const blogs = visibleSorted(d.blogs || []);
  const stories = visibleSorted(d.stories || []);
  const fs = d.featuredStory || {};
  const cats = Array.from(new Set(blogs.map((b) => b.cat).filter(Boolean)));

  return (
    <>
      <div className="page-hero">
        <div className="page-hero-inner">
          <div className="section-eyebrow">{d.heroEyebrow || 'Documents'}</div>
          <RichText as="h1" html={d.heroTitle || 'Read deeper.'} />
          {d.heroSub ? <p>{d.heroSub}</p> : null}
        </div>
      </div>

      <Subnav
        page="documents"
        ariaLabel="Documents sections"
        defaultTab="blogs"
        tabs={[
          { id: 'blogs', label: 'Blogs', content: <BlogsTab blogs={blogs} cats={cats} /> },
          { id: 'stories', label: 'Stories', content: <StoriesTab stories={stories} fs={fs} /> },
        ]}
      />
    </>
  );
}
