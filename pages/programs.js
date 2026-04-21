function renderPrograms() {
  return `
  <div class="page-hero">
    <div class="page-hero-inner">
      <div class="section-eyebrow">Programs</div>
      <h1>Twelve programs. <em>One goal.</em></h1>
      <p>From assistive software to grassroots training, every program is designed for real-world independence. Every tool is free at point of use.</p>
    </div>
  </div>

  <section class="section">
    <div class="section-inner">
      <div class="prog-grid">
        <div class="prog-card">
          <div class="prog-icon"><i class="ph ph-speaker-high"></i></div>
          <div class="prog-content">
            <h3>TEWW Screen Reader</h3>
            <p>Our flagship open-source screen reader supports all major platforms and 40+ languages. Designed from the ground up by and for visually impaired users.</p>
            <span class="prog-tag">Software · Free</span>
          </div>
        </div>
        <div class="prog-card">
          <div class="prog-icon"><i class="ph ph-magnifying-glass"></i></div>
          <div class="prog-content">
            <h3>Visual Magnifier Pro</h3>
            <p>Adaptive screen magnification with AI-enhanced edge detection, custom contrast modes, and cursor tracking for low-vision users.</p>
            <span class="prog-tag">Software · Free</span>
          </div>
        </div>
        <div class="prog-card">
          <div class="prog-icon"><i class="ph ph-map-pin"></i></div>
          <div class="prog-content">
            <h3>Navigation Aid</h3>
            <p>GPS and indoor positioning with real-time audio guidance. Partners with public transit systems in 12 cities to provide blind-friendly route data.</p>
            <span class="prog-tag">App · Free</span>
          </div>
        </div>
        <div class="prog-card">
          <div class="prog-icon"><i class="ph ph-chalkboard-teacher"></i></div>
          <div class="prog-content">
            <h3>Digital Access Training</h3>
            <p>Hands-on 4-week bootcamp teaching screen reader use, smartphone navigation, and online safety to newly visually impaired adults.</p>
            <span class="prog-tag">Training · Community</span>
          </div>
        </div>
        <div class="prog-card">
          <div class="prog-icon"><i class="ph ph-device-mobile"></i></div>
          <div class="prog-content">
            <h3>Device Lending Library</h3>
            <p>Provides smartphones pre-configured with our tools to users in low-income settings. 18,000+ devices distributed since 2019.</p>
            <span class="prog-tag">Hardware · Subsidised</span>
          </div>
        </div>
        <div class="prog-card">
          <div class="prog-icon"><i class="ph ph-code"></i></div>
          <div class="prog-content">
            <h3>Open Source Grants</h3>
            <p>Annual grants for developers building accessible tools. Funded 63 projects across 28 countries, reaching 400K+ beneficiaries.</p>
            <span class="prog-tag">Grants · Open</span>
          </div>
        </div>
        <div class="prog-card">
          <div class="prog-icon"><i class="ph ph-book-open"></i></div>
          <div class="prog-content">
            <h3>Audiolibrary Project</h3>
            <p>A free, human-narrated library of 14,000 educational and cultural texts in 22 languages — free to stream, free to download.</p>
            <span class="prog-tag">Content · Free</span>
          </div>
        </div>
        <div class="prog-card">
          <div class="prog-icon"><i class="ph ph-graduation-cap"></i></div>
          <div class="prog-content">
            <h3>Access Scholars</h3>
            <p>Full scholarships for visually impaired students pursuing STEM and design degrees. 180 scholars funded since 2018.</p>
            <span class="prog-tag">Education · Funded</span>
          </div>
        </div>
        <div class="prog-card">
          <div class="prog-icon"><i class="ph ph-briefcase"></i></div>
          <div class="prog-content">
            <h3>Workforce Pathway</h3>
            <p>Employer partnerships that match trained TEWW users to accessibility-mature companies. 1,200+ placements to date.</p>
            <span class="prog-tag">Employment · Program</span>
          </div>
        </div>
        <div class="prog-card">
          <div class="prog-icon"><i class="ph ph-eye"></i></div>
          <div class="prog-content">
            <h3>Prevention & Screening</h3>
            <p>Mobile clinics deliver vision screenings in rural and underserved areas — 220,000 people screened since 2020.</p>
            <span class="prog-tag">Health · Partnered</span>
          </div>
        </div>
        <div class="prog-card">
          <div class="prog-icon"><i class="ph ph-buildings"></i></div>
          <div class="prog-content">
            <h3>Accessible Civic Tech</h3>
            <p>We partner with city and national governments to make public services — ballots, tax filings, benefits — usable for everyone.</p>
            <span class="prog-tag">Civic · Partnered</span>
          </div>
        </div>
        <div class="prog-card">
          <div class="prog-icon"><i class="ph ph-translate"></i></div>
          <div class="prog-content">
            <h3>TEWW Translator Guild</h3>
            <p>Our volunteer network of 240+ native speakers localises every interface, guide, and audio file we publish.</p>
            <span class="prog-tag">Localisation · Open</span>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="cta-band">
    <div class="cta-inner">
      <h2>Support a program.</h2>
      <p>Every program is funded by people like you. Pick one to sponsor, or let us direct your gift to where it's needed most.</p>
      <div style="display:flex;gap:14px;flex-wrap:wrap;justify-content:center;">
        <button class="btn-accent" onclick="goto('donate')"><i class="ph-fill ph-heart"></i> Donate Now</button>
        <button class="btn-secondary" onclick="goto('volunteers')">Volunteer</button>
      </div>
    </div>
  </section>`;
}
