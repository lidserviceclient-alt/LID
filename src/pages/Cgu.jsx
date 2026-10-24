import { useEffect, useMemo, useRef, useState } from "react";
import PageSEO from "@/components/PageSEO";
import { motion, useReducedMotion } from "framer-motion";
import { useAppConfig } from "@/features/appConfig/useAppConfig.js";
import { LEGAL_INFO, FOOTNOTES, buildArticles } from "@/assets/data/cgu.js";

const FONTS_HREF = "";

function useDocumentFonts() {
  useEffect(() => {
    if (document.getElementById("cgv-fonts")) return;
    const link = document.createElement("link");
    link.id = "cgv-fonts";
    link.rel = "stylesheet";
    link.href = FONTS_HREF;
    document.head.appendChild(link);
  }, []);
}

const FootnoteRef = ({ id }) => (
  <sup className="mx-px">
    <a
      href={`#fn-${id}`}
      id={`fnref-${id}`}
      aria-label={`Voir la note ${id}`}
      className="rounded px-[3px] py-px font-mono text-[0.62rem] font-semibold text-[var(--cgv-gold)] no-underline ring-1 ring-[var(--cgv-gold)]/40 transition-colors hover:bg-[var(--cgv-gold)]/10"
    >
      {id}
    </a>
  </sup>
);

// ---------------------------------------------------------------------------
// renderParagraph
// Un "paragraph" peut prendre 3 formes :
//  - une chaîne simple
//  - un tableau de segments (string | { fn }) -> rendu inline avec appels de note
//  - un objet { subtitle, text } -> sous-titre + texte (ex: Article 5.1 / 5.2)
// ---------------------------------------------------------------------------
const renderParagraph = (paragraph) => {
  if (typeof paragraph === "string") {
    return paragraph;
  }

  if (Array.isArray(paragraph)) {
    return paragraph.map((segment, i) =>
      typeof segment === "string" ? (
        <span key={i}>{segment}</span>
      ) : (
        <FootnoteRef key={i} id={segment.fn} />
      )
    );
  }

  if (paragraph && typeof paragraph === "object" && "text" in paragraph) {
    return (
      <>
        {paragraph.subtitle && (
          <strong className="mb-1 block font-semibold text-[var(--cgv-ink)]">
            {paragraph.subtitle}
          </strong>
        )}
        {renderParagraph(paragraph.text)}
      </>
    );
  }

  return null;
};

const Seal = () => (
  <div className="flex items-center justify-center w-[10%]">
    <img src="/imgs/badge.png" alt="Badge" className="w-full h-full" />
  </div>
);

// ---------------------------------------------------------------------------
// Article
// ---------------------------------------------------------------------------
const Article = ({ index, title, paragraphs = [], list, paragraphsAfterList = [], setRef }) => {
  const num = String(index + 1).padStart(2, "0");
  const label = title.split(" : ")[1] || title;
  const id = `article-${index + 1}`;

  return (
    <section id={id} ref={(el) => setRef(id, el)} className="scroll-mt-28 border-t border-[var(--cgv-rule)] py-9 first:border-t-0 first:pt-0">
      <div className="mb-3 flex items-baseline gap-3">
        <span className=" text-xs font-medium tracking-widest text-gray-500">
          ARTICLE. {num}
        </span>
        <h2 className=" text-xl font-semibold leading-snug text-[var(--cgv-ink)] sm:text-[1.4rem]">
          {label}
        </h2>
      </div>
      <div className="space-y-4 text-[0.95rem] leading-[1.75] text-[var(--cgv-ink)]/80">
        {paragraphs.map((p, i) => (
          <p key={i}>{renderParagraph(p)}</p>
        ))}
        {list && (
          <ul className="space-y-2.5 border-l-2 border-[var(--cgv-gold)]/30 pl-5">
            {list.map((item, i) => (
              <li key={i}>{renderParagraph(item)}</li>
            ))}
          </ul>
        )}
        {paragraphsAfterList.map((p, i) => (
          <p key={`after-${i}`}>{renderParagraph(p)}</p>
        ))}
      </div>
    </section>
  );
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function Terms() {
  useDocumentFonts();
  const { data: appConfig } = useAppConfig();
  const legalEmail = appConfig?.contactEmail || "";
  const dpoEmail = appConfig?.dpoEmail || legalEmail;
  const prefersReducedMotion = useReducedMotion();

  const articles = useMemo(
    () => buildArticles({ legalEmail, dpoEmail, legal: LEGAL_INFO }),
    [legalEmail, dpoEmail]
  );

  const sectionRefs = useRef(new Map());
  const setRef = (id, el) => {
    if (el) sectionRefs.current.set(id, el);
    else sectionRefs.current.delete(id);
  };

  const [activeId, setActiveId] = useState("article-1");

  useEffect(() => {
    const els = Array.from(sectionRefs.current.values());
    if (!els.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-15% 0px -70% 0px", threshold: 0 }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [articles]);

  return (
    <div
      id="cgv-page"
      className="min-h-screen  pb-20 pt-20 px-4 sm:px-6 lg:px-8"
    >
      <style>{`
        #cgv-page{
          --cgv-ink:#182A22; --cgv-paper:#F5F1E6; --cgv-forest:#000;
          --cgv-gold:#A97D2F; --cgv-rule:rgba(70, 70, 70, 0.08); --cgv-card:#FFF;
        }
        .dark #cgv-page{
          --cgv-ink:#ECE7DA; --cgv-paper:#0E1712; --cgv-forest:#5FBE93;
          --cgv-gold:#D9B268; --cgv-rule:rgba(48, 136, 23, 0.65); --cgv-card:#141E19;
        }
      `}</style>

      <PageSEO
        title="Conditions générales de vente"
        description="Conditions générales de vente de la marketplace LID, applicables en République de Côte d'Ivoire et dans l'espace UEMOA/CEDEAO."
        canonical="/terms"
      />

      <div className="mx-auto max-w-6xl">
        {/* Letterhead */}
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10 flex flex-col items-start gap-6 border-b border-[var(--cgv-rule)] pb-10 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-[var(--cgv-forest)]">
              Acte contractuel LID
            </p>
            <h1 className=" text-3xl font-semibold leading-tight text-[var(--cgv-ink)] sm:text-4xl">
              Conditions Générales d'Utilisation
            </h1>
            <p className="mt-3 max-w-xl text-sm text-[var(--cgv-ink)]/65">
              Applicables en République de Côte d&apos;Ivoire et, le cas échéant, dans l&apos;espace UEMOA/CEDEAO.
            </p>
            <p className="mt-1 font-mono text-xs text-[var(--cgv-ink)]/50">
              Dernière mise à jour : {LEGAL_INFO.updateDate}
            </p>
          </div>
          <Seal />
        </motion.div>

        {/* Mobile ToC */}
        <details className="mb-8 rounded-2xl border border-[var(--cgv-rule)] bg-[var(--cgv-card)] p-4 lg:hidden">
          <summary className="cursor-pointer font-mono text-xs uppercase tracking-widest text-[var(--cgv-forest)]">
            Sommaire — {articles.length} articles
          </summary>
          <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            {articles.map((a, i) => (
              <li key={a.title}>
                <a href={`#article-${i + 1}`} className="text-green-500/75 hover:text-green-500">
                  <span className="mr-1.5 font-mono text-gray-500">{String(i + 1).padStart(2, "0")}</span>
                  {a.title.split(" : ")[1]}
                </a>
              </li>
            ))}
          </ul>
        </details>

        <div className="lg:grid lg:grid-cols-[240px_1fr] lg:gap-14">
          {/* Sticky sidebar ToC */}
          <nav className="sticky top-24 hidden h-fit max-h-[calc(100vh-8rem)] overflow-y-auto pr-2 lg:block">
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-[var(--cgv-forest)]">
              Sommaire
            </p>
            <ol className="space-y-1 border-l border-[var(--cgv-rule)]">
              {articles.map((a, i) => {
                const id = `article-${i + 1}`;
                const isActive = activeId === id;
                return (
                  <li key={a.title}>
                    <a
                      href={`#${id}`}
                      className={`-ml-px block border-l-2 py-1.5 pl-4 text-sm leading-snug transition-colors ${
                        isActive
                          ? "border-green-500 text-[var(--cgv-ink)]"
                          : "border-transparent text-[var(--cgv-ink)]/50 hover:text-gray-500/80"
                      }`}
                    >
                      <span className="mr-2 font-mono text-xs text-gray-500">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {a.title.split(" : ")[1]}
                    </a>
                  </li>
                );
              })}
              <li>
                <a
                  href="#sources"
                  className="-ml-px block border-l-2 border-transparent py-1.5 pl-4 text-sm text-[var(--cgv-ink)]/50 hover:text-[var(--cgv-ink)]/80"
                >
                  <span className="mr-2 font-mono text-xs text-green-500">§</span>
                  Sources &amp; références
                </a>
              </li>
            </ol>
          </nav>

          {/* Main content */}
          <div className="rounded-3xl border border-[var(--cgv-rule)] bg-[var(--cgv-card)] px-6 py-8 sm:px-10 sm:py-10">
            {articles.map((article, i) => (
              <Article key={article.title} index={i} {...article} setRef={setRef} />
            ))}

            {/* Footnotes / sources */}
            <section id="sources" className="scroll-mt-24 border-t border-[var(--cgv-rule)] pt-9">
              <p className="mb-5 font-mono text-xs uppercase tracking-widest text-[var(--cgv-forest)]">
                Sources &amp; références
              </p>
              <ol className="space-y-4">
                {FOOTNOTES.map((note) => (
                  <li key={note.id} id={`fn-${note.id}`} className="scroll-mt-24 text-wrap flex text-sm leading-relaxed">
                    <span className="mr-2 font-mono text-gray-500">[{note.id}]</span>
                    <a
                      href={note.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-[var(--cgv-ink)]/85 underline decoration-green-500/40 underline-offset-2 hover:text-green-500"
                    >
                      {note.label}
                    </a>
                    <span className="text-gray-500/45"> — {note.source}</span>
                  </li>
                ))}
              </ol>
            </section>

            {/* Contact / seal card */}
            <div className="mt-12 rounded-2xl border border-[var(--cgv-gold)]/30 bg-[var(--cgv-forest)]/[0.06] p-6 text-center sm:p-8">
              <p className="text-left text-xs uppercase tracking-widest text-[var(--cgv-forest)]">
                Contact
              </p>
              <p className=" text-left mt-3 text-sm text-[var(--cgv-ink)]/75">
                Pour toute question relative à ces conditions, contactez-nous à{" "}
                <a href={`mailto:${LEGAL_INFO.mail}`} className="font-medium text-[var(--cgv-forest)] hover:underline">
                  {LEGAL_INFO.mail}
                </a>
                {LEGAL_INFO.telephone && (
                  <>
                    {" "}ou au{" "}
                    <a
                      href={`tel:${LEGAL_INFO.telephone.replace(/\s/g, "")}`}
                      className="font-medium text-[var(--cgv-forest)] hover:underline"
                    >
                      {LEGAL_INFO.telephone}
                    </a>
                  </>
                )}
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}