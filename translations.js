/* ─────────────────────────────────────────────────────────────
   translations.js
   Vanilla JS i18n — nested object structure so objNavigate works.
   Usage: t('nav.work'), applyTranslations('de')
   ───────────────────────────────────────────────────────────── */

const translations = {
  en: {
    nav: {
      work: 'Work',
      capabilities: 'Capabilities',
      recognition: 'Recognition',
      contact: 'Contact',
    },
    hero: {
      award: 'Best Paper, ACM-SAC 2026',
      headline: 'Machine learning that ships.',
      sub: '5+ years deploying deep learning from cloud pipelines to microcontrollers.',
      cta: { work: 'See the work', email: 'Get in touch' },
      availability: 'Open to work \u00b7 Remote worldwide \u00b7 Hybrid EU',
    },
    stat: [
      { label: 'Ship-detection accuracy on-device' },
      { label: 'Years across research and industry' },
      { label: 'Peer-reviewed venues incl. NeurIPS & SenSys' },
      { label: 'Clouds in production: AWS, Azure, GCP' },
    ],
    thesis: {
      lead: 'Most ML never leaves the notebook. <strong>Mine runs where it matters:</strong> on constrained hardware, at scale, in production.',
      body: 'I work at the seam between deep-learning research and shipped systems: compressing models for microcontrollers, building reliable RAG pipelines, and deploying across AWS, Azure and GCP.',
    },
    work: {
      title: 'Selected work',
      0: { title: 'Ship detection on a microcontroller', desc: 'Deep-learning model for acoustic ship classification, compressed and deployed on a resource-constrained microcontroller. Full inference at the edge, no cloud required.', metric: { label: 'accuracy on-device' } },
      1: { title: 'Railroad safety in adverse weather', desc: 'Object-detection system built for reliability in low-visibility, high-risk conditions. A missed detection here has real-world cost.', metric: { value: 'Real-time', label: 'low-visibility object detection' } },
      2: { title: 'RAG systems for faster processing', desc: 'Retrieval-augmented generation pipelines that cut end-to-end processing time while keeping answers grounded in source documents.', metric: { label: 'processing time' } },
      3: { title: 'Multi-cloud migration, zero data loss', desc: "Led migration of Pakistan\u2019s largest telecom to AWS, Azure and GCP. Automated the data-verification pipeline with CI/CD, Docker, and Kubernetes.", metric: { label: 'faster verification with zero data loss' } },
      4: { title: 'One model, any device', desc: 'Reusable CNN frameworks designed for the resource-constrained world. The same architecture scales from server to sensor.', metric: { label: 'ELT integrity gain' } },
      5: { title: 'NLP and medical imaging', desc: 'Fine-tuned BERT over 10k medical documents for citation retrieval, processed 80M+ records, and built a COVID-19 X-ray classifier.', metric: { label: 'BERT citation retrieval' } },
    },
    cap: {
      title: 'Capabilities',
      0: { title: 'Edge & On-Device ML' },
      1: { title: 'Deep Learning & LLMs' },
      2: { title: 'Cloud, Data & MLOps' },
    },
    rec: {
      title: 'Recognition',
      award: { label: 'Best Paper Award', venue: 'ACM Symposium on Applied Computing, 2026', desc: 'For deploying an accurate deep-learning ship-detection model on a resource-constrained microcontroller.' },
      venues: { label: 'Peer-reviewed at' },
      certs: { label: 'Certifications', 0: 'Deep Learning: Neural Networks & Hyperparameter Tuning', 1: 'Microsoft Certified: Azure Fundamentals', 2: 'Cloud Computing: Core Concepts & Application Migration' },
    },
    exp: {
      title: 'Experience',
      0: { when: 'Mar 2023 - Present', role: 'Research Engineer, Data Science', org: 'Kiel University, Distributed Systems Lab', loc: 'Germany', desc: 'Deploying deep learning on resource-constrained devices. Award-winning on-device ship detection, railway-safety vision, and scalable CNN frameworks.' },
      1: { when: 'Sep 2021 - Mar 2023', role: 'Software Engineer I to II', org: 'Teradata', loc: 'Pakistan', desc: 'Designed data pipelines for a national telecom migration to AWS, Azure and GCP with zero data loss. Automated data verification (45% faster) and built ELT pipelines with CI/CD.' },
      2: { when: 'Aug 2019 - Sep 2021', role: 'Research Engineer, Data Science', org: 'Information Technology University', loc: 'Pakistan', desc: 'NLP and medical-imaging research: BERT citation retrieval (0.80 F1), 80M-record processing pipelines, and a COVID-19 X-ray classifier (94% precision, 95% recall).' },
      footer: { education: '<strong>Education:</strong> MS Data Science, ITU \u00b7 BS Computer Science, FAST-NUCES', languages: '<strong>Languages:</strong> English (professional), Urdu (native), German (elementary)' },
    },
    contact: {
      headline: "Let's build ML that ships.",
      sub: 'Open to ML Engineer, Data Scientist, Applied Scientist and Edge AI roles, remote worldwide, or hybrid in the EU.',
    },
    footer: { role: 'ML Engineer', backtop: 'Back to top' },
  },

  de: {
    nav: {
      work: 'Projekte',
      capabilities: 'Kompetenzen',
      recognition: 'Auszeichnungen',
      contact: 'Kontakt',
    },
    hero: {
      award: 'Best Paper, ACM-SAC 2026',
      headline: 'Machine Learning, das liefert.',
      sub: 'Mehr als 5 Jahre Erfahrung: von Cloud-Pipelines bis hin zu Mikrocontrollern.',
      cta: { work: 'Projekte ansehen', email: 'Kontakt aufnehmen' },
      availability: 'Offen f\u00fcr neue Stellen \u00b7 Remote weltweit \u00b7 Hybrid EU',
    },
    stat: [
      { label: 'Erkennungsgenauigkeit auf dem Ger\u00e4t' },
      { label: 'Jahre in Forschung und Industrie' },
      { label: 'Peer-reviewed-Ver\u00f6ffentlichungen u.\u00a0a. bei NeurIPS' },
      { label: 'Clouds im Produktionseinsatz: AWS, Azure, GCP' },
    ],
    thesis: {
      lead: 'Die meisten ML-Modelle verlassen das Notebook nie. <strong>Meins l\u00e4uft dort, wo es gebraucht wird:</strong> auf eingeschr\u00e4nkter Hardware, in gro\u00dfem Ma\u00dfstab, im Produktionsbetrieb.',
      body: 'Ich arbeite an der Schnittstelle zwischen Deep-Learning-Forschung und produktionsreifen Systemen: Modellkomprimierung f\u00fcr Mikrocontroller, zuverl\u00e4ssige RAG-Pipelines und Deployment auf AWS, Azure und GCP.',
    },
    work: {
      title: 'Ausgew\u00e4hlte Projekte',
      0: { title: 'Schiffserkennung auf einem Mikrocontroller', desc: 'Deep-Learning-Modell zur akustischen Schiffsklassifikation, komprimiert und auf einem ressourcenbeschr\u00e4nkten Mikrocontroller eingesetzt. Vollst\u00e4ndige Inferenz am Rand des Netzwerks, ohne Cloud-Anbindung.', metric: { label: 'Genauigkeit auf dem Ger\u00e4t' } },
      1: { title: 'Bahnsicherheit bei schlechter Sicht', desc: 'Objekterkennungssystem f\u00fcr den zuverl\u00e4ssigen Einsatz unter geringer Sichtweite und in risikoreichen Umgebungen. Ein verpasstes Objekt hat reale Konsequenzen.', metric: { value: 'Echtzeit', label: 'Objekterkennung bei schlechter Sicht' } },
      2: { title: 'RAG-Systeme f\u00fcr schnellere Verarbeitung', desc: 'Retrieval-Augmented-Generation-Pipelines, die die End-to-End-Verarbeitungszeit verk\u00fcrzen und Antworten gleichzeitig eng an Quelldokumenten ausrichten.', metric: { label: 'Verarbeitungszeit' } },
      3: { title: 'Multi-Cloud-Migration ohne Datenverlust', desc: 'Leitung der Migration des gr\u00f6\u00dften pakistanischen Telekommunikationsunternehmens auf AWS, Azure und GCP. Automatisierung der Datenverifizierungspipeline mit CI/CD, Docker und Kubernetes.', metric: { label: 'schnellere Verifizierung ohne Datenverlust' } },
      4: { title: 'Ein Modell, jedes Ger\u00e4t', desc: 'Wiederverwendbare CNN-Frameworks f\u00fcr die ressourcenbeschr\u00e4nkte Praxis. Dieselbe Architektur skaliert vom Server bis zum Sensor.', metric: { label: 'ELT-Integrit\u00e4tsgewinn' } },
      5: { title: 'NLP und medizinische Bildgebung', desc: 'Fine-Tuning von BERT auf 10.000 medizinischen Dokumenten f\u00fcr Zitatretrieval, Verarbeitung von mehr als 80 Millionen Datens\u00e4tzen und ein COVID-19-R\u00f6ntgen-Klassifikator.', metric: { label: 'BERT-Zitatretrieval' } },
    },
    cap: {
      title: 'Kompetenzen',
      0: { title: 'Edge & Ger\u00e4te-ML' },
      1: { title: 'Deep Learning & LLMs' },
      2: { title: 'Cloud, Daten & MLOps' },
    },
    rec: {
      title: 'Auszeichnungen',
      award: { label: 'Best Paper Award', venue: 'ACM Symposium on Applied Computing, 2026', desc: 'F\u00fcr den Einsatz eines pr\u00e4zisen Deep-Learning-Modells zur Schiffserkennung auf einem ressourcenbeschr\u00e4nkten Mikrocontroller.' },
      venues: { label: 'Ver\u00f6ffentlicht bei' },
      certs: { label: 'Zertifizierungen', 0: 'Deep Learning: Neuronale Netze und Hyperparameter-Tuning', 1: 'Microsoft Certified: Azure Fundamentals', 2: 'Cloud Computing: Grundlagen und Anwendungsmigration' },
    },
    exp: {
      title: 'Erfahrung',
      0: { when: 'Mrz. 2023 \u2013 Heute', role: 'Research Engineer, Data Science', org: 'Universit\u00e4t Kiel, Lehrstuhl f\u00fcr Verteilte Systeme', loc: 'Deutschland', desc: 'Einsatz von Deep Learning auf ressourcenbeschr\u00e4nkten Ger\u00e4ten. Preisgekr\u00f6nte On-Device-Schiffserkennung, Sicherheitssystem f\u00fcr den Schienenverkehr und skalierbare CNN-Frameworks.' },
      1: { when: 'Sep. 2021 \u2013 Mrz. 2023', role: 'Software Engineer I bis II', org: 'Teradata', loc: 'Pakistan', desc: 'Entwicklung von Datenpipelines f\u00fcr die Migration des gr\u00f6\u00dften pakistanischen Telekommunikationsunternehmens auf AWS, Azure und GCP ohne Datenverlust. Automatisierung der Datenverifizierung (45\u00a0% schneller) und Aufbau von ELT-Pipelines mit CI/CD.' },
      2: { when: 'Aug. 2019 \u2013 Sep. 2021', role: 'Research Engineer, Data Science', org: 'Information Technology University', loc: 'Pakistan', desc: 'Forschung zu NLP und medizinischer Bildgebung: BERT-Zitatretrieval (0,80\u00a0F1), Pipelines f\u00fcr mehr als 80\u00a0Millionen Datens\u00e4tze und ein COVID-19-R\u00f6ntgen-CNN (94\u00a0% Pr\u00e4zision, 95\u00a0% Recall).' },
      footer: { education: '<strong>Ausbildung:</strong> M.Sc. Data Science, ITU \u00b7 B.Sc. Informatik, FAST-NUCES', languages: '<strong>Sprachen:</strong> Englisch (professionell), Urdu (Muttersprache), Deutsch (Grundkenntnisse)' },
    },
    contact: {
      headline: 'ML bauen, das wirklich liefert.',
      sub: 'Offen f\u00fcr Stellen als ML-Ingenieur, Data Scientist, Applied Scientist oder Edge-AI-Spezialist, remote weltweit oder hybrid in der EU.',
    },
    footer: { role: 'ML-Ingenieur', backtop: 'Nach oben' },
  },
};

/* ── Object-path navigation ─────────────────────────────────── */
function objNavigate(obj, path) {
  try {
    return path.split('.').reduce((o, k) => o[k], obj);
  } catch {
    return undefined;
  }
}

/* ── Core lookup ────────────────────────────────────────────── */
function t(key) {
  const lang = window.__lang || 'en';
  const val = objNavigate(translations[lang], key)
           ?? objNavigate(translations.en, key)
           ?? key;
  return val;
}

/* ── Geo-default from timezone ──────────────────────────────── */
function geoDefaultLang() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (/^Europe\/(Berlin|Vienna|Zurich|Busingen)$/.test(tz)) return 'de';
  } catch {}
  return 'en';
}

/* ── Apply all data-i18n elements ───────────────────────────── */
function applyTranslations(lang) {
  window.__lang = lang;
  document.documentElement.lang = lang;
  localStorage.setItem('lang', lang);

  document.querySelectorAll('[data-i18n]').forEach(function(el) {
    var key = el.getAttribute('data-i18n');
    var val = t(key);
    if (typeof val !== 'string') return; // skip missing keys

    if (val.indexOf('<') !== -1) {
      // Safe HTML (bold tags only)
      el.innerHTML = val;
    } else {
      // Plain text — set textContent directly, preserving child elements
      // by only touching the element's own text, not its children
      // We do this by setting innerText on a temporary span then copying
      // But simplest: just use textContent if no child elements, innerHTML otherwise
      var hasChildElements = el.querySelector('*') !== null;
      if (hasChildElements) {
        // Only update the FIRST non-empty text node — never all of them,
        // or elements with <br> or inline elements will duplicate the string.
        var firstTextNode = Array.from(el.childNodes).find(function(n) {
          return n.nodeType === Node.TEXT_NODE && n.textContent.trim();
        });
        if (firstTextNode) firstTextNode.textContent = val;
      } else {
        el.textContent = val;
      }
    }
  });

  // Page title
  document.title = lang === 'de'
    ? 'Momin Ali \u2014 ML-Ingenieur | Edge AI, TinyML & Produktions-ML'
    : 'Momin Ali \u2014 ML Engineer | Edge AI, TinyML & Production ML';

  // Lang switcher active state
  document.querySelectorAll('.lang-link').forEach(function(a) {
    var isActive = a.getAttribute('lang') === lang;
    a.classList.toggle('lang-active', isActive);
    a.setAttribute('aria-current', isActive ? 'true' : 'false');
  });
  document.querySelectorAll('.mobile-lang a').forEach(function(a) {
    var isActive = a.dataset.lang === lang;
    a.classList.toggle('lang-active', isActive);
  });
}

/* ── Init ───────────────────────────────────────────────────── */
(function() {
  var saved = localStorage.getItem('lang');
  var lang  = (saved === 'en' || saved === 'de') ? saved : geoDefaultLang();
  window.__lang = lang;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { applyTranslations(lang); });
  } else {
    applyTranslations(lang);
  }
})();