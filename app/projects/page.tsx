import Link from 'next/link';
import { Enhance } from '@/components/ref/Enhance';
import { Fa } from '@/components/ref/Fa';
import { ProjectsLightbox } from '@/components/ref/ProjectsLightbox';
import { RefImg, refImage } from '@/components/ref/RefImg';
import { RefShell } from '@/components/ref/RefShell';
import { projectBlocks } from '@/content/ref/projects';
import { allRefProducts, fullAndZoom } from '@/lib/ref-catalog';
import { pageMetadata } from '@/lib/ref-seo';
import '@/styles/ref/projects.css';

export const metadata = pageMetadata('projects', '/projects');

export default function ProjectsPage() {
  return (
    <RefShell
      bundle="projects"
      bodyClass="showroom-theme page-projects"
      nav="projects"
      tab="projects"
      footer="content-p"
    >
      <Enhance />
      <ProjectsLightbox
        images={projectBlocks.flatMap((b) =>
          b.images.map((img) => ({ src: fullAndZoom(refImage(img.src)).full, alt: img.alt })),
        )}
      />
      <section className="hero">
        <div className="glass-text-panel hero-copy">
          <h1>
            Our Happy <span>Clients</span>
          </h1>
        </div>
      </section>

      <section className="projects-section">
        {projectBlocks.map((b) => (
          <article key={b.id} className="project-block" id={b.id}>
            <header className="project-block-header">
              <RefImg className="project-block-logo" src={b.logo} alt={b.logoAlt} sizes="120px" />
              <div>
                {/* Reference title markup: the second word(s) in a gold <span>. */}
                <h2 className="project-block-title" dangerouslySetInnerHTML={{ __html: b.titleHtml }} />
                <p className="project-block-note">{b.note}</p>
              </div>
            </header>
            <div className="project-block-grid">
              {b.images.map((img) => (
                <div key={img.src} className="project-item">
                  <RefImg src={img.src} alt={img.alt} sizes="(min-width: 1025px) 25vw, 50vw" />
                  <div className="project-overlay">
                    <Fa name="search-plus" />
                  </div>
                </div>
              ))}
            </div>
            <StonesUsed projectId={b.id} />
          </article>
        ))}
      </section>

      <section className="cta-section reveal">
        <div className="cta-content">
          <h2>
            Ready to Start Your <span>Project?</span>
          </h2>
          <p>Let us help you transform your space with premium stone craftsmanship.</p>
          <div className="cta-actions">
            <Link className="btn btn-primary" href="/contact">
              Get Started Today
            </Link>
          </div>
        </div>
      </section>
    </RefShell>
  );
}

/**
 * "Stones used" on a project: the stones whose business-confirmed `used_in_projects` names it
 * (content/stone-attributes.json). Rendered only when there is at least one.
 */
function StonesUsed({ projectId }: { projectId: string }) {
  const stones = allRefProducts().filter((p) => p.usedInProjects.includes(projectId));
  if (!stones.length) return null;
  return (
    <div className="sk-stones-used">
      <h3>Stones used</h3>
      <ul>
        {stones.map((s) => (
          <li key={s.id}>
            <Link href={`/${s.collection}#stone=${s.id}`} prefetch={false}>
              {s.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
