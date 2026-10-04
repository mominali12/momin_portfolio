/* ─────────────────────────────────────────────────────────────
   translations.js
   Vanilla JS i18n following the pattern from:
   https://medium.com/@mihura.ian/translations-in-vanilla-javascript-c942c2095170

   Usage in HTML:  <span data-i18n="key">fallback</span>
   Usage in JS:    t('key')
   Language stored in localStorage under 'lang'.
   Geo-default: 'de' for DE/AT/CH (detected from browser timezone),
                'en' for everyone else.
   ───────────────────────────────────────────────────────────── */

const translations = {
  en: {
    /* NAV */
    'nav.work':         'Work',
    'nav.capabilities': 'Capabilities',
    'nav.recognition':  'Recognition',
    'nav.contact':      'Contact',

    /* HERO */
    'hero.award':        'Best Paper, ACM-SAC 2026',
    'hero.headline':     'Machine learning\nthat ships.',
    'hero.sub':          '5+ years deploying deep learning from cloud pipelines to microcontrollers.',
    'hero.cta.work':     'See the work',
    'hero.cta.email':    'Get in touch',
    'hero.availability': 'Open to work \u00b7 Remote worldwide \u00b7 Hybrid EU',

    /* STATS */
    'stat.0.label': 'Ship-detection accuracy on-device',
    'stat.1.label': 'Years across research and industry',
    'stat.2.label': 'Peer-reviewed venues incl. NeurIPS & SenSys',
    'stat.3.label': 'Clouds in production: AWS, Azure, GCP',

    /* THESIS */
    'thesis.lead': 'Most ML never leaves the notebook. <strong>Mine runs where it matters:</strong> on constrained hardware, at scale, in production.',
    'thesis.body': 'I work at the seam between deep-learning research and shipped systems: compressing models for microcontrollers, building reliable RAG pipelines, and deploying across AWS, Azure and GCP.',

    /* WORK */
    'work.title': 'Selected work',
    'work.0.title': 'Ship detection on a microcontroller',
    'work.0.desc':  'Deep-learning model for acoustic ship classification, compressed and deployed on a resource-constrained microcontroller. Full inference at the edge, no cloud required.',
    'work.0.metric.label': 'accuracy on-device',
    'work.1.title': 'Railroad safety in adverse weather',
    'work.1.desc':  'Object-detection system built for reliability in low-visibility, high-risk conditions. A missed detection here has real-world cost.',
    'work.1.metric.value': 'Real-time',
    'work.1.metric.label': 'low-visibility object detection',
    'work.2.title': 'RAG systems for faster processing',
    'work.2.desc':  'Retrieval-augmented generation pipelines that cut end-to-end processing time while keeping answers grounded in source documents.',
    'work.2.metric.label': 'processing time',
    'work.3.title': 'Multi-cloud migration, zero data loss',
    'work.3.desc':  "Led migration of Pakistan's largest telecom to AWS, Azure and GCP. Automated the data-verification pipeline with CI/CD, Docker, and Kubernetes.",
    'work.3.metric.label': 'faster verification with zero data loss',
    'work.4.title': 'One model, any device',
    'work.4.desc':  'Reusable CNN frameworks designed for the resource-constrained world. The same architecture scales from server to sensor.',
    'work.4.metric.label': 'ELT integrity gain',
    'work.5.title': 'NLP and medical imaging',
    'work.5.desc':  'Fine-tuned BERT over 10k medical documents for citation retrieval, processed 80M+ records, and built a COVID-19 X-ray classifier.',
    'work.5.metric.label': 'BERT citation retrieval',

    /* CAPABILITIES */
    'cap.title':    'Capabilities',
    'cap.0.title':  'Edge & On-Device ML',
    'cap.1.title':  'Deep Learning & LLMs',
    'cap.2.title':  'Cloud, Data & MLOps',

    /* RECOGNITION */
    'rec.title':        'Recognition',
    'rec.award.label':  'Best Paper Award',
    'rec.award.venue':  'ACM Symposium on Applied Computing, 2026',
    'rec.award.desc':   'For deploying an accurate deep-learning ship-detection model on a resource-constrained microcontroller.',
    'rec.venues.label': 'Peer-reviewed at',
    'rec.certs.label':  'Certifications',
    'rec.cert.0':       'Deep Learning: Neural Networks & Hyperparameter Tuning',
    'rec.cert.1':       'Microsoft Certified: Azure Fundamentals',
    'rec.cert.2':       'Cloud Computing: Core Concepts & Application Migration',

    /* EXPERIENCE */
    'exp.title': 'Experience',
    'exp.0.when':  'Mar 2023 - Present',
    'exp.0.role':  'Research Engineer, Data Science',
    'exp.0.org':   'Kiel University, Distributed Systems Lab',
    'exp.0.loc':   'Germany',
    'exp.0.desc':  'Deploying deep learning on resource-constrained devices. Award-winning on-device ship detection, railway-safety vision, and scalable CNN frameworks.',
    'exp.1.when':  'Sep 2021 - Mar 2023',
    'exp.1.role':  'Software Engineer I to II',
    'exp.1.org':   'Teradata',
    'exp.1.loc':   'Pakistan',
    'exp.1.desc':  'Designed data pipelines for a national telecom migration to AWS, Azure and GCP with zero data loss. Automated data verification (45% faster) and built ELT pipelines with CI/CD.',
    'exp.2.when':  'Aug 2019 - Sep 2021',
    'exp.2.role':  'Research Engineer, Data Science',
    'exp.2.org':   'Information Technology University',
    'exp.2.loc':   'Pakistan',
    'exp.2.desc':  'NLP and medical-imaging research: BERT citation retrieval (0.80 F1), 80M-record processing pipelines, and a COVID-19 X-ray classifier (94% precision, 95% recall).',
    'exp.footer.education': '<strong>Education:</strong> MS Data Science, ITU \u00b7 BS Computer Science, FAST-NUCES',
    'exp.footer.languages': '<strong>Languages:</strong> English (professional), Urdu (native), German (elementary)',

    /* CONTACT */
    'contact.headline': "Let's build ML that ships.",
    'contact.sub':      'Open to ML Engineer, Data Scientist, Applied Scientist and Edge AI roles, remote worldwide, or hybrid in the EU.',

    /* FOOTER */
    'footer.role':    'ML Engineer',
    'footer.backtop': 'Back to top',
  },

  de: {
    /* NAV */
    'nav.work':         'Projekte',
    'nav.capabilities': 'Kompetenzen',
    'nav.recognition':  'Auszeichnungen',
    'nav.contact':      'Kontakt',

    /* HERO */
    'hero.award':        'Best Paper, ACM-SAC 2026',
    'hero.headline':     'Machine Learning,\ndas liefert.',
    'hero.sub':          'Mehr als 5 Jahre Erfahrung: von Cloud-Pipelines bis hin zu Mikrocontrollern.',
    'hero.cta.work':     'Projekte ansehen',
    'hero.cta.email':    'Kontakt aufnehmen',
    'hero.availability': 'Offen f\u00fcr neue Stellen \u00b7 Remote weltweit \u00b7 Hybrid EU',

    /* STATS */
    'stat.0.label': 'Erkennungsgenauigkeit auf dem Ger\u00e4t',
    'stat.1.label': 'Jahre in Forschung und Industrie',
    'stat.2.label': 'Peer-reviewed-Ver\u00f6ffentlichungen u.\u00a0a. bei NeurIPS',
    'stat.3.label': 'Clouds im Produktionseinsatz: AWS, Azure, GCP',

    /* THESIS */
    'thesis.lead': 'Die meisten ML-Modelle verlassen das Notebook nie. <strong>Meins l\u00e4uft dort, wo es gebraucht wird:</strong> auf eingeschr\u00e4nkter Hardware, in gro\u00dfem Ma\u00dfstab, im Produktionsbetrieb.',
    'thesis.body': 'Ich arbeite an der Schnittstelle zwischen Deep-Learning-Forschung und produktionsreifen Systemen: Modellkomprimierung f\u00fcr Mikrocontroller, zuverl\u00e4ssige RAG-Pipelines und Deployment auf AWS, Azure und GCP.',

    /* WORK */
    'work.title': 'Ausgew\u00e4hlte Projekte',
    'work.0.title': 'Schiffserkennung auf einem Mikrocontroller',
    'work.0.desc':  'Deep-Learning-Modell zur akustischen Schiffsklassifikation, komprimiert und auf einem ressourcenbeschr\u00e4nkten Mikrocontroller eingesetzt. Vollst\u00e4ndige Inferenz am Rand des Netzwerks, ohne Cloud-Anbindung.',
    'work.0.metric.label': 'Genauigkeit auf dem Ger\u00e4t',
    'work.1.title': 'Bahnsicherheit bei schlechter Sicht',
    'work.1.desc':  'Objekterkennungssystem f\u00fcr den zuverl\u00e4ssigen Einsatz unter geringer Sichtweite und in risikoreichen Umgebungen. Ein verpasstes Objekt hat reale Konsequenzen.',
    'work.1.metric.value': 'Echtzeit',
    'work.1.metric.label': 'Objekterkennung bei schlechter Sicht',
    'work.2.title': 'RAG-Systeme f\u00fcr schnellere Verarbeitung',
    'work.2.desc':  'Retrieval-Augmented-Generation-Pipelines, die die End-to-End-Verarbeitungszeit verk\u00fcrzen und Antworten gleichzeitig eng an Quelldokumenten ausrichten.',
    'work.2.metric.label': 'Verarbeitungszeit',
    'work.3.title': 'Multi-Cloud-Migration ohne Datenverlust',
    'work.3.desc':  'Leitung der Migration des gr\u00f6\u00dften pakistanischen Telekommunikationsunternehmens auf AWS, Azure und GCP. Automatisierung der Datenverifizierungspipeline mit CI/CD, Docker und Kubernetes.',
    'work.3.metric.label': 'schnellere Verifizierung ohne Datenverlust',
    'work.4.title': 'Ein Modell, jedes Ger\u00e4t',
    'work.4.desc':  'Wiederverwendbare CNN-Frameworks f\u00fcr die ressourcenbeschr\u00e4nkte Praxis. Dieselbe Architektur skaliert vom Server bis zum Sensor.',
    'work.4.metric.label': 'ELT-Integrit\u00e4tsgewinn',
    'work.5.title': 'NLP und medizinische Bildgebung',
    'work.5.desc':  'Fine-Tuning von BERT auf 10.000 medizinischen Dokumenten f\u00fcr Zitatretrieval, Verarbeitung von mehr als 80 Millionen Datens\u00e4tzen und ein COVID-19-R\u00f6ntgen-Klassifikator.',
    'work.5.metric.label': 'BERT-Zitatretrieval',

    /* CAPABILITIES */
    'cap.title':   'Kompetenzen',
    'cap.0.title': 'Edge & Ger\u00e4te-ML',
    'cap.1.title': 'Deep Learning & LLMs',
    'cap.2.title': 'Cloud, Daten & MLOps',

    /* RECOGNITION */
    'rec.title':        'Auszeichnungen',
    'rec.award.label':  'Best Paper Award',
    'rec.award.venue':  'ACM Symposium on Applied Computing, 2026',
    'rec.award.desc':   'F\u00fcr den Einsatz eines pr\u00e4zisen Deep-Learning-Modells zur Schiffserkennung auf einem ressourcenbeschr\u00e4nkten Mikrocontroller.',
    'rec.venues.label': 'Ver\u00f6ffentlicht bei',
    'rec.certs.label':  'Zertifizierungen',
    'rec.cert.0':       'Deep Learning: Neuronale Netze und Hyperparameter-Tuning',
    'rec.cert.1':       'Microsoft Certified: Azure Fundamentals',
    'rec.cert.2':       'Cloud Computing: Grundlagen und Anwendungsmigration',

    /* EXPERIENCE */
    'exp.title': 'Erfahrung',
    'exp.0.when':  'Mrz. 2023 \u2013 Heute',
    'exp.0.role':  'Research Engineer, Data Science',
    'exp.0.org':   'Universit\u00e4t Kiel, Lehrstuhl f\u00fcr Verteilte Systeme',
    'exp.0.loc':   'Deutschland',
    'exp.0.desc':  'Einsatz von Deep Learning auf ressourcenbeschr\u00e4nkten Ger\u00e4ten. Preisgekr\u00f6nte On-Device-Schiffserkennung, Sicherheitssystem f\u00fcr den Schienenverkehr und skalierbare CNN-Frameworks.',
    'exp.1.when':  'Sep. 2021 \u2013 Mrz. 2023',
    'exp.1.role':  'Software Engineer I bis II',
    'exp.1.org':   'Teradata',
    'exp.1.loc':   'Pakistan',
    'exp.1.desc':  'Entwicklung von Datenpipelines f\u00fcr die Migration des gr\u00f6\u00dften pakistanischen Telekommunikationsunternehmens auf AWS, Azure und GCP ohne Datenverlust. Automatisierung der Datenverifizierung (45\u00a0% schneller) und Aufbau von ELT-Pipelines mit CI/CD.',
    'exp.2.when':  'Aug. 2019 \u2013 Sep. 2021',
    'exp.2.role':  'Research Engineer, Data Science',
    'exp.2.org':   'Information Technology University',
    'exp.2.loc':   'Pakistan',
    'exp.2.desc':  'Forschung zu NLP und medizinischer Bildgebung: BERT-Zitatretrieval (0,80\u00a0F1), Pipelines f\u00fcr mehr als 80\u00a0Millionen Datens\u00e4tze und ein COVID-19-R\u00f6ntgen-CNN (94\u00a0% Pr\u00e4zision, 95\u00a0% Recall).',
    'exp.footer.education': '<strong>Ausbildung:</strong> M.Sc. Data Science, ITU \u00b7 B.Sc. Informatik, FAST-NUCES',
    'exp.footer.languages': '<strong>Sprachen:</strong> Englisch (professionell), Urdu (Muttersprache), Deutsch (Grundkenntnisse)',

    /* CONTACT */
    'contact.headline': 'ML bauen, das wirklich liefert.',
    'contact.sub':      'Offen f\u00fcr Stellen als ML-Ingenieur, Data Scientist, Applied Scientist oder Edge-AI-Spezialist, remote weltweit oder hybrid in der EU.',

    /* FOOTER */
    'footer.role':    'ML-Ingenieur',
    'footer.backtop': 'Nach oben',
  },
};

/* ── Object-path navigation (handles nested keys like 'work.0.title') ── */
function objNavigate(obj, path) {
  try {
    return path.split('.').reduce((o, k) => o[k], obj);
  } catch {
    return undefined;
  }
}

/* ── Core lookup function ────────────────────────────────────────────── */
function t(key) {
  const lang = window.__lang || 'en';
  const value = objNavigate(translations[lang], key)
             ?? objNavigate(translations['en'], key)  // fallback to EN
             ?? key;                                   // fallback to key itself
  return value;
}

/* ── Detect geo-default language from browser timezone ──────────────── */
function geoDefaultLang() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    // German-speaking timezones: Europe/Berlin, Europe/Vienna, Europe/Zurich
    if (/^Europe\/(Berlin|Vienna|Zurich|Busingen)$/.test(tz)) return 'de';
  } catch {}
  return 'en';
}

/* ── Apply translations to the DOM ──────────────────────────────────── */
function applyTranslations(lang) {
  window.__lang = lang;
  document.documentElement.lang = lang;
  localStorage.setItem('lang', lang);

  // Update all data-i18n elements
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key   = el.getAttribute('data-i18n');
    const value = t(key);
    // Some values contain safe HTML (bold tags) — use innerHTML for those
    if (value.includes('<')) {
      el.innerHTML = value;
    } else if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      el.placeholder = value;
    } else {
      // Preserve child elements (icons, SVGs) — only update text nodes
      const textNodes = [...el.childNodes].filter(n => n.nodeType === Node.TEXT_NODE);
      if (textNodes.length) {
        // Replace first text node, handle newlines as <br>
        textNodes[0].textContent = value.replace(/\\n/g, '\n');
      } else {
        el.textContent = value;
      }
    }
  });

  // Update html lang attribute and page title
  if (lang === 'de') {
    document.title = 'Momin Ali \u2014 ML-Ingenieur | Edge AI, TinyML & Produktions-ML';
  } else {
    document.title = 'Momin Ali \u2014 ML Engineer | Edge AI, TinyML & Production ML';
  }

  // Update lang switcher active state
  document.querySelectorAll('.lang-link').forEach(a => {
    const isActive = a.getAttribute('lang') === lang;
    a.classList.toggle('lang-active', isActive);
    a.setAttribute('aria-current', isActive ? 'true' : 'false');
  });
  document.querySelectorAll('.mobile-lang a').forEach(a => {
    const href = a.getAttribute('href') || '';
    const isActive = href === '#' + lang || a.dataset.lang === lang;
    a.classList.toggle('lang-active', isActive);
  });
}

/* ── Init: read saved lang, fall back to geo-default ────────────────── */
(function initI18n() {
  const saved = localStorage.getItem('lang');
  const lang  = (saved === 'en' || saved === 'de') ? saved : geoDefaultLang();
  window.__lang = lang;

  // Apply immediately (before DOMContentLoaded if possible)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => applyTranslations(lang));
  } else {
    applyTranslations(lang);
  }
})();
