export function CvBand({ cvUrl }: { cvUrl: string }) {
  return (
    <section className="cv" aria-label="CV" data-section="cv" data-reveal>
      <div>
        <h2 className="display">Curriculum Vitae</h2>
        <p>Experience, education, awards and tools in one file.</p>
      </div>
      <div className="cta">
        <a className="btn primary" href={cvUrl} download>
          Download CV ↓
        </a>
        <a className="btn" href="#experience">
          Read online
        </a>
      </div>
    </section>
  );
}
