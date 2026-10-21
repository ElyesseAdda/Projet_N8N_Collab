import React, { useState } from 'react';
// L'import externe est supprimé pour éviter l'erreur de compilation dans l'environnement de prévisualisation
// import './Vitrine.css'; 
import { 
  Menu, ArrowRight, Mail, ClipboardCheck, Compass, PenLine, RefreshCw,
  Layers, Workflow, FileSearch, Cable, Send, X, HelpCircle, Shield,
  FileText as FileTextIcon, Check
} from 'lucide-react';

// --- STYLES CSS INTÉGRÉS ---
// Correction : Ajout de overflow-x-hidden sur le body et scroll-behavior
const cssStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;700;800&display=swap');

  html {
    scroll-behavior: smooth;
  }

  body { 
    font-family: 'Outfit', sans-serif; 
    margin: 0;
    padding: 0;
    overflow-x: hidden; /* Empêche le scroll horizontal causé par les blobs */
  }

  /* Background Grid */
  .bg-grid {
    background-size: 56px 56px;
    background-image: 
      linear-gradient(to right, rgba(15, 23, 42, 0.045) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(15, 23, 42, 0.045) 1px, transparent 1px);
  }

  .glass-panel {
    background: rgba(255, 255, 255, 0.86);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(15, 23, 42, 0.08);
    box-shadow: 0 12px 40px -24px rgba(15, 23, 42, 0.35);
  }

  .glass-card {
    background: #ffffff;
    border: 1px solid rgba(15, 23, 42, 0.08);
    box-shadow: 0 16px 40px -28px rgba(15, 23, 42, 0.45);
  }

  /* Glow Blobs */
  .glow-blob {
    position: absolute;
    width: 800px;
    height: 800px;
    background: radial-gradient(circle, rgba(25, 228, 250, 0.15) 0%, rgba(15, 23, 42, 0) 70%);
    border-radius: 50%;
    pointer-events: none;
    z-index: 0;
  }

  /* Text Gradient Animation - Gold -> Cyan -> Gold */
  .text-gradient {
    background: linear-gradient(to right, #A16207, #0E7490, #A16207);
    background-size: 200% auto;
    color: #000;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: shine 5s linear infinite;
  }

  @keyframes shine { 
    to { background-position: 200% center; } 
  }

  /* Message Animation */
  .msg-enter {
    animation: slideIn 0.5s ease-out forwards;
    opacity: 0;
    transform: translateY(10px);
  }

  @keyframes slideIn { 
    to { opacity: 1; transform: translateY(0); } 
  }

  /* File Scan Animation */
  .file-scan {
    position: relative;
    overflow: hidden;
  }

  .file-scan::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(25, 228, 250, 0.4), transparent);
    animation: scanFile 2s ease-in-out infinite;
  }

  @keyframes scanFile {
    0% { left: -100%; }
    100% { left: 200%; }
  }

  /* Fade In Utility */
  .animate-fade-in { 
    animation: fadeIn 0.3s ease-in; 
  }

  @keyframes fadeIn { 
    from { opacity: 0; } 
    to { opacity: 1; } 
  }
`;

const METHOD_STEPS = [
  {
    n: '01',
    icon: <ClipboardCheck />,
    title: 'Audit',
    text: 'Nous regardons vos flux réels : qui fait quoi, où le temps part, et ce qui peut attendre.',
  },
  {
    n: '02',
    icon: <Compass />,
    title: 'Cadrage',
    text: 'Le périmètre est écrit : ce qui est construit, ce qui est reporté, et dans quel ordre.',
  },
  {
    n: '03',
    icon: <PenLine />,
    title: 'Construction',
    text: 'L’outil est fait pour votre métier. Un assistant peut en faire partie, il n’en est pas le sujet.',
  },
  {
    n: '04',
    icon: <RefreshCw />,
    title: 'Évolution',
    text: 'Les corrections sont incluses. Les nouvelles fonctions se décident au rythme de votre activité.',
  },
];

const SOLUTIONS = [
  {
    icon: <ClipboardCheck />,
    title: 'Audit de processus',
    desc: 'Cartographie de vos flux, des irritants et des gains réalistes, avant toute ligne de devis.',
    tone: 'cyan',
  },
  {
    icon: <Layers />,
    title: 'Application métier',
    desc: 'Un outil interne dédié à votre façon de travailler : clients, interventions, suivi, documents.',
    tone: 'gold',
  },
  {
    icon: <Workflow />,
    title: 'Automatisation ciblée',
    desc: 'Un flux de bout en bout — relances, pièces, planning — sans refaire tout le système.',
    tone: 'cyan',
  },
  {
    icon: <FileSearch />,
    title: 'Connaissance documentaire',
    desc: 'Vos procédures et dossiers deviennent interrogeables. Une brique possible, jamais le produit vendu seul.',
    tone: 'gold',
  },
  {
    icon: <Cable />,
    title: 'Connexion à l’existant',
    desc: 'Mails, agendas, tableurs, facturation : on relie ce que vous utilisez déjà quand c’est utile.',
    tone: 'cyan',
  },
  {
    icon: <RefreshCw />,
    title: 'Accompagnement',
    desc: 'L’outil reste vivant. On corrige, puis on étend le périmètre seulement quand vous le décidez.',
    tone: 'gold',
  },
];

const FORMULAS = [
  {
    id: 'audit',
    eyebrow: 'Point d’entrée',
    title: 'Diagnostic',
    desc: 'On comprend le métier avant de proposer un outil. Aucun engagement de construction.',
    points: [
      'Entretien avec les personnes qui font le travail',
      'Cartographie des flux et des irritants',
      'Priorités et feuille de route',
      'Recommandation : cibler, intégrer, ou ne rien construire',
    ],
    note: 'Sans engagement de construction. S’il y a une suite, le devis vient ensuite.',
  },
  {
    id: 'ciblee',
    eyebrow: 'Un flux',
    title: 'Solution ciblée',
    desc: 'Une application ou un workflow autour d’un seul processus. Le premier outil métier, pas un système complet.',
    points: [
      'Un parcours de bout en bout',
      'Les connexions utiles à ce seul flux',
      'Prise en main de l’équipe concernée',
      'Périmètre écrit, hors sujet exclu',
    ],
    note: 'Le montant suit le nombre d’étapes et de connexions.',
  },
  {
    id: 'integree',
    eyebrow: 'Cœur de l’offre',
    title: 'Solution intégrée',
    desc: 'Un logiciel métier dédié, qui relie plusieurs processus. C’est l’entrée de gamme d’un vrai outil interne.',
    points: [
      'Plusieurs métiers dans le même outil',
      'Règles propres à votre façon de travailler',
      'Socle prévu pour évoluer',
      'Livré par lots, pas en une fois opaque',
    ],
    note: 'Le devis dépend du périmètre. Pas de forfait catalogue.',
    featured: true,
  },
  {
    id: 'plateforme',
    eyebrow: 'Besoin large',
    title: 'Plateforme métier',
    desc: 'Clients, projets, facturation et cœur d’activité dans un même environnement, construit par étapes.',
    points: [
      'Cadrage en lots successifs',
      'Livraison progressive, utilisable tôt',
      'Accompagnement au déploiement',
      'Hors ERP généraliste construit de zéro',
    ],
    note: 'Réservée aux besoins qui dépassent un seul flux. Le calendrier se fixe après l’audit.',
  },
];

const ZoniaLogo = ({ size = 40, strokeColor = 'white' }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <path d="M 25 25 H 75 L 25 75 H 75 L 25 25 Z" stroke={strokeColor} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ServiceCard = ({ icon, title, desc, tone }) => {
  const gold = tone === 'gold';
  return (
    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-[0_16px_40px_-28px_rgba(15,23,42,0.45)] hover:border-[#19E4FA] hover:-translate-y-1 transition-all duration-300">
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 border ${gold ? 'bg-[#FFD700]/20 border-[#EAB308]/40' : 'bg-[#19E4FA]/15 border-[#19E4FA]/30'}`}>
        {React.cloneElement(icon, { className: `w-7 h-7 ${gold ? 'text-[#A16207]' : 'text-[#0E7490]'}` })}
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-600 text-sm leading-relaxed">{desc}</p>
    </div>
  );
};

const FormulaCard = ({ formula, onChoose }) => (
  <article className={`flex flex-col rounded-2xl border p-7 bg-white shadow-[0_16px_40px_-28px_rgba(15,23,42,0.45)] ${formula.featured ? 'border-slate-950 ring-1 ring-slate-950' : 'border-slate-200'}`}>
    <p className={`text-xs font-bold uppercase tracking-[0.16em] mb-3 ${formula.featured ? 'text-[#0E7490]' : 'text-slate-500'}`}>{formula.eyebrow}</p>
    <h3 className="text-2xl font-bold text-slate-950 mb-3">{formula.title}</h3>
    <p className="text-sm text-slate-600 leading-relaxed mb-6">{formula.desc}</p>
    <ul className="space-y-3 mb-6 flex-1">
      {formula.points.map((point) => (
        <li key={point} className="flex gap-2 text-sm text-slate-700">
          <Check className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#0E7490]" />
          <span>{point}</span>
        </li>
      ))}
    </ul>
    <p className="text-sm font-medium text-slate-900 mb-5">{formula.note}</p>
    <a
      href="#contact"
      onClick={() => onChoose(formula.title)}
      className={`text-center rounded-full px-4 py-3 text-sm font-bold transition-colors ${formula.featured ? 'bg-slate-950 text-white hover:bg-[#0891B2]' : 'border border-slate-950 text-slate-950 hover:bg-slate-950 hover:text-white'}`}
    >
      En parler dans l’audit
    </a>
  </article>
);



const Navbar = () => {
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  return (
    <header className="fixed top-0 inset-x-0 z-50">
      <nav className="bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-[0_16px_40px_-24px_rgba(15,23,42,0.35)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-[72px]">
            <a href="#top" className="flex items-center gap-3" onClick={close}>
              <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 ring-1 ring-slate-200">
                <ZoniaLogo size={26} strokeColor="#0f172a" />
              </span>
              <span className="text-lg font-bold tracking-[0.22em] text-slate-950">ZONIA</span>
            </a>
            <div className="hidden md:flex items-center gap-8">
              <a href="#methode" className="text-sm font-medium text-slate-700 hover:text-slate-950 transition-colors">Méthode</a>
              <a href="#solutions" className="text-sm font-medium text-slate-700 hover:text-slate-950 transition-colors">Solutions</a>
              <a href="#formules" className="text-sm font-medium text-slate-700 hover:text-slate-950 transition-colors">Formules</a>
              <a href="#contact" className="bg-slate-950 text-white border border-slate-950 hover:bg-[#0891B2] hover:border-[#0891B2] px-5 py-2.5 rounded-full text-sm font-bold transition-colors">Demander un audit</a>
            </div>
            <button
              type="button"
              className="md:hidden text-slate-900 p-2 rounded-lg hover:bg-slate-100"
              aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
              aria-expanded={open}
              onClick={() => setOpen((value) => !value)}
            >
              {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
        {open && (
          <div className="md:hidden border-t border-slate-200 px-4 py-4 space-y-2">
            <a href="#methode" onClick={close} className="block text-center text-slate-950 border border-slate-950 hover:bg-slate-950 hover:text-white px-4 py-3 rounded-full text-sm font-medium">Méthode</a>
            <a href="#solutions" onClick={close} className="block text-center text-slate-950 border border-slate-950 hover:bg-slate-950 hover:text-white px-4 py-3 rounded-full text-sm font-medium">Solutions</a>
            <a href="#formules" onClick={close} className="block text-center text-slate-950 border border-slate-950 hover:bg-slate-950 hover:text-white px-4 py-3 rounded-full text-sm font-medium">Formules</a>
            <a href="#contact" onClick={close} className="block text-center bg-slate-950 text-white border border-slate-950 px-4 py-3 rounded-full text-sm font-bold">Demander un audit</a>
          </div>
        )}
      </nav>
    </header>
  );
};

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose}></div>
      <div 
        className="relative bg-slate-900 rounded-2xl border border-slate-700 max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-slate-800/90 backdrop-blur-sm border-b border-slate-700 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-700 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6 text-slate-300">
          {children}
        </div>
      </div>
    </div>
  );
};

const EMPTY_FORM = { name: '', company: '', email: '', formula: 'Diagnostic', need: '' };

const Vitrine = () => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [openModal, setOpenModal] = useState(null);

  const setField = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!form.email || !form.email.includes('@')) {
      setMessage({ type: 'error', text: 'Veuillez entrer un email valide' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage({ type: 'success', text: data.message || 'Votre demande a été envoyée. Nous vous répondrons sous 24h ouvrées.' });
        setForm(EMPTY_FORM);
      } else {
        setMessage({ type: 'error', text: data.error || 'Erreur lors de l\'envoi de la demande. Veuillez réessayer plus tard.' });
      }
    } catch (error) {
      console.error('Erreur:', error);
      setMessage({ type: 'error', text: 'Erreur de connexion au serveur. Veuillez réessayer plus tard.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    // Ajout de overflow-x-hidden ici pour protéger le scroll vertical
    <div id="top" className="relative bg-[#F4F7FB] text-slate-800 min-h-screen selection:bg-[#FFD700] selection:text-slate-900 overflow-x-hidden">
      {/* Intégration des styles via une balise style */}
      <style>{cssStyles}</style>

      <div className="fixed inset-0 bg-grid pointer-events-none z-0" />
      <div className="glow-blob top-[-200px] left-[-200px]" />
      <div className="glow-blob bottom-[-200px] right-[-200px]" style={{ background: 'radial-gradient(circle, rgba(255, 215, 0, 0.05) 0%, rgba(15, 23, 42, 0) 70%)' }} />
      <Navbar />
      <section className="relative pt-28 pb-16 lg:pt-36 lg:pb-20 px-4 z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-slate-700 text-sm font-medium mb-8 shadow-sm">
            <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#19E4FA] opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-[#0891B2]"></span></span>
            Agence IA · audit et outils métier
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-950 tracking-tight mb-6 leading-tight">D’abord l’audit.<br/><span className="text-gradient">Ensuite, votre outil.</span></h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-slate-600">Zonia étudie votre façon de travailler, puis construit la solution qui correspond à ce périmètre. Pas un assistant à brancher. Pas de prix catalogue.</p>
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <a href="#contact" className="px-8 py-4 bg-slate-950 hover:bg-[#0891B2] text-white rounded-full font-bold text-lg shadow-[0_12px_30px_-12px_rgba(15,23,42,0.55)] transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2">Demander un audit <ArrowRight className="w-5 h-5" /></a>
            <a href="#formules" className="px-8 py-4 bg-white hover:bg-slate-50 text-slate-900 rounded-full font-bold text-lg border border-slate-200 hover:border-slate-300 transition-all hover:-translate-y-0.5">Voir les formules</a>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {METHOD_STEPS.map((step) => (
            <div key={step.n} className="bg-white rounded-2xl border border-slate-200 p-5 text-left shadow-[0_16px_40px_-28px_rgba(15,23,42,0.45)]">
              <div className="text-xs font-bold tracking-[0.18em] text-[#0E7490] mb-3">{step.n}</div>
              <h2 className="text-lg font-bold text-slate-950 mb-2">{step.title}</h2>
              <p className="text-sm text-slate-600 leading-relaxed">{step.text}</p>
            </div>
          ))}
        </div>
      </section>
      <section id="methode" className="scroll-mt-24 py-20 relative z-10 bg-white/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0E7490] mb-3">Méthode</p>
              <h2 className="text-3xl md:text-5xl font-bold text-slate-950 mb-6">On cadre avant de construire.</h2>
              <p className="text-slate-600 text-lg mb-8">Un outil métier utile tient dans un périmètre tenu. L’audit dit ce qui entre dans la première version, et ce qui attendra.</p>
              <ul className="space-y-4">
                {[
                  'Le devis décrit le périmètre, le calendrier et ce qui n’est pas inclus.',
                  'Une équipe suit le projet. Vous avez un interlocuteur, pas un produit en boîte.',
                  'Nous visons l’outil accessible : précis pour votre métier, sans ERP généraliste de plusieurs années.',
                ].map((item) => (
                  <li key={item} className="flex gap-3 text-slate-700">
                    <Check className="w-5 h-5 mt-0.5 flex-shrink-0 text-[#0E7490]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xl">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500 mb-6">Ce que l’audit rend visible</p>
              <div className="space-y-5">
                {[
                  ['Le flux réel', 'Qui saisit, qui relance, où l’information se perd.'],
                  ['Le premier lot', 'Ce qui soulage l’équipe sans tout reconstruire.'],
                  ['La suite', 'Ce qui pourra s’ajouter une fois l’outil en usage.'],
                ].map(([title, text]) => (
                  <div key={title} className="border-t border-slate-200 pt-5 first:border-0 first:pt-0">
                    <h3 className="font-bold text-slate-950">{title}</h3>
                    <p className="text-sm text-slate-600 mt-1">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      <section id="solutions" className="scroll-mt-24 py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0E7490] mb-3">Après l’audit</p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-950 mb-4">La solution suit le métier</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">Chaque chantier est écrit pour vous. Un assistant peut être une brique du livrable. Il n’est pas le point de départ.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {SOLUTIONS.map((item) => (
              <ServiceCard key={item.title} {...item} />
            ))}
          </div>
        </div>
      </section>
      <section id="formules" className="scroll-mt-24 py-24 relative z-10 bg-white/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-14">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0E7490] mb-3">Formules</p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-950 mb-4">Quatre façons d’avancer, aucun prix affiché</h2>
            <p className="text-slate-600 text-lg">Le montant suit le périmètre. Après l’audit, le devis dit ce qui est construit, ce qui est reporté, et comment l’outil pourra évoluer. « Sur devis » n’est pas un prix caché : c’est l’absence de forfait qui ne correspondrait pas à votre métier.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {FORMULAS.map((formula) => (
              <FormulaCard
                key={formula.id}
                formula={formula}
                onChoose={(title) => setForm((current) => ({ ...current, formula: title }))}
              />
            ))}
          </div>
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-4 md:gap-10">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-slate-950 mb-2">L’outil continue après la livraison</h3>
              <p className="text-slate-600 text-sm leading-relaxed">Les corrections font partie de l’accompagnement. Les évolutions — un nouveau flux, un écran, une connexion — se chiffrent à part, selon le rythme que vous choisissez. Pas d’abonnement catalogue.</p>
            </div>
            <a href="#contact" onClick={() => setForm((current) => ({ ...current, formula: 'Accompagnement' }))} className="shrink-0 text-center border border-slate-950 text-slate-950 hover:bg-slate-950 hover:text-white rounded-full px-5 py-3 text-sm font-bold transition-colors">Parler de l’accompagnement</a>
          </div>
        </div>
      </section>
      <section id="contact" className="scroll-mt-24 py-20 relative z-10">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-white rounded-3xl p-8 md:p-12 border border-slate-200 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#19E4FA] via-white to-[#FFD700]"></div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-950 mb-3">Parlons de votre métier</h2>
            <p className="text-slate-600 mb-8">Décrivez le flux qui vous coûte du temps. Nous revenons avec une proposition d’audit, pas avec un prix tout fait.</p>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2" htmlFor="contact-name">Nom</label>
                <input id="contact-name" type="text" placeholder="Votre nom" value={form.name} onChange={setField('name')} disabled={loading} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-[#19E4FA] outline-none transition-all disabled:opacity-50" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2" htmlFor="contact-company">Société</label>
                <input id="contact-company" type="text" placeholder="Votre entreprise" value={form.company} onChange={setField('company')} disabled={loading} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-[#19E4FA] outline-none transition-all disabled:opacity-50" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2" htmlFor="contact-email">Email professionnel</label>
                <input id="contact-email" type="email" placeholder="contact@entreprise.com" value={form.email} onChange={setField('email')} disabled={loading} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-[#19E4FA] outline-none transition-all disabled:opacity-50" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2" htmlFor="contact-formula">Formule envisagée</label>
                <select id="contact-formula" value={form.formula} onChange={setField('formula')} disabled={loading} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-[#19E4FA] outline-none transition-all disabled:opacity-50">
                  <option>Diagnostic</option>
                  <option>Solution ciblée</option>
                  <option>Solution intégrée</option>
                  <option>Plateforme métier</option>
                  <option>Accompagnement</option>
                  <option>Je ne sais pas encore</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2" htmlFor="contact-need">Le flux à regarder</label>
                <textarea id="contact-need" rows={4} placeholder="Ex. suivi des interventions, relances clients, dossiers qui circulent par email…" value={form.need} onChange={setField('need')} disabled={loading} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-[#19E4FA] outline-none transition-all disabled:opacity-50 resize-y" />
              </div>
              {message.text && (
                <div className={`sm:col-span-2 p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
                  {message.text}
                </div>
              )}
              <button type="submit" disabled={loading} className="sm:col-span-2 bg-slate-950 hover:bg-[#0891B2] text-white font-bold py-4 rounded-full transition-all text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Envoi en cours...
                  </>
                ) : (
                  'Demander l’audit'
                )}
              </button>
              <p className="sm:col-span-2 text-center text-xs text-slate-500">Réponse sous 24h ouvrées. Aucun prix n’est fixé avant d’avoir vu le périmètre.</p>
            </form>
          </div>
        </div>
      </section>
      <footer className="border-t border-slate-200 bg-white pt-16 pb-8 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
            <div className="flex items-center gap-3"><span className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 ring-1 ring-slate-200"><ZoniaLogo size={26} strokeColor="#0f172a" /></span><span className="text-lg font-bold tracking-[0.22em] text-slate-950">ZONIA</span></div>
            <div className="flex flex-wrap justify-center gap-2 text-sm">
              <button onClick={() => setOpenModal('legal')} className="text-slate-950 border border-slate-950 hover:bg-slate-950 hover:text-white transition-colors px-4 py-2 rounded-full font-medium">Mentions Légales</button>
              <button onClick={() => setOpenModal('privacy')} className="text-slate-950 border border-slate-950 hover:bg-slate-950 hover:text-white transition-colors px-4 py-2 rounded-full font-medium">Politique de Confidentialité</button>
              <button onClick={() => setOpenModal('support')} className="text-slate-950 border border-slate-950 hover:bg-slate-950 hover:text-white transition-colors px-4 py-2 rounded-full font-medium">Support</button>
            </div>
          </div>
          <div className="text-center text-slate-500 text-xs">&copy; {new Date().getFullYear()} Zonia Systems. Tous droits réservés.</div>
        </div>
      </footer>

      {/* Modale Mentions Légales */}
      <Modal 
        isOpen={openModal === 'legal'} 
        onClose={() => setOpenModal(null)}
        title={
          <>
            <FileTextIcon className="w-6 h-6 text-[#FFD700]" />
            Mentions Légales
          </>
        }
      >
        <div className="space-y-6">
          <section>
            <h3 className="text-xl font-bold text-white mb-3">1. Informations sur l'entreprise</h3>
            <div className="space-y-2 text-sm">
              <p><strong className="text-white">Raison sociale :</strong> Zonia </p>
              <p><strong className="text-white">Forme juridique :</strong> SAS</p>
              <p><strong className="text-white">Siège social :</strong> 24 Boulevard Gay Lussac,13014 Marseille</p>
              <p><strong className="text-white">SIRET :</strong> 994 508 190 00018</p>
              <p><strong className="text-white">RCS :</strong> 994 508 190 R.C.S. Marseille</p>
              
              <p><strong className="text-white">Capital social :</strong> 1 000,00 Euros</p>
            </div>
          </section>

          <section>
            <h3 className="text-xl font-bold text-white mb-3">2. Directeur de publication</h3>
            <p className="text-sm">[ADDA ATTOU Elyesse]</p>
            <p className="text-sm">Contact : <a href="mailto:zonia.ai.pro@gmail.com" className="text-[#19E4FA] hover:underline">zonia.ai.pro@gmail.com</a></p>
          </section>

          <section>
            <h3 className="text-xl font-bold text-white mb-3">3. Hébergement</h3>
            <div className="space-y-2 text-sm">
              <p><strong className="text-white">Hébergeur :</strong> Hostinger International Ltd.</p>
              <p className="text-slate-400 text-xs ml-4">61 Lordou Vironos Street, 6023 Larnaca, Chypre</p>
              <p className="text-slate-400 text-xs ml-4">Site web : <a href="https://www.hostinger.fr" target="_blank" rel="noopener noreferrer" className="text-[#19E4FA] hover:underline">www.hostinger.fr</a></p>
            </div>
          </section>

          <section>
            <h3 className="text-xl font-bold text-white mb-3">4. Propriété intellectuelle</h3>
            <p className="text-sm mb-2">
              L'ensemble de ce site relève de la législation française et internationale sur le droit d'auteur et la propriété intellectuelle. 
              Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les représentations iconographiques et photographiques.
            </p>
            <p className="text-sm">
              La reproduction de tout ou partie de ce site sur un support électronique ou autre est formellement interdite sauf autorisation expresse du directeur de publication.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold text-white mb-3">5. Responsabilité</h3>
            <p className="text-sm mb-2">
              Les informations contenues sur ce site sont aussi précises que possible et le site est périodiquement remis à jour, 
              mais peut toutefois contenir des inexactitudes, des omissions ou des lacunes.
            </p>
            <p className="text-sm">
              Zonia Systems ne pourra être tenu responsable des dommages directs et indirects causés au matériel de l'utilisateur, 
              lors de l'accès au site, et résultant soit de l'utilisation d'un matériel ne répondant pas aux spécifications, 
              soit de l'apparition d'un bug ou d'une incompatibilité.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold text-white mb-3">6. Liens hypertextes</h3>
            <p className="text-sm">
              Le site peut contenir des liens hypertextes vers d'autres sites présents sur le réseau Internet. 
              Les liens vers ces autres ressources vous font quitter le site. Il est possible de créer un lien vers la page de présentation 
              de ce site sans autorisation expresse de l'éditeur.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold text-white mb-3">7. Droit applicable</h3>
            <p className="text-sm">
              Tout litige en relation avec l'utilisation du site est soumis au droit français. 
              Il est fait attribution exclusive de juridiction aux tribunaux compétents de [Ville du siège social].
            </p>
          </section>
        </div>
      </Modal>

      {/* Modale Politique de Confidentialité */}
      <Modal 
        isOpen={openModal === 'privacy'} 
        onClose={() => setOpenModal(null)}
        title={
          <>
            <Shield className="w-6 h-6 text-[#19E4FA]" />
            Politique de Confidentialité
          </>
        }
      >
        <div className="space-y-6">
          <section>
            <p className="text-sm mb-4">
              La présente politique de confidentialité décrit la manière dont Zonia Systems collecte, utilise et protège 
              vos informations personnelles lorsque vous utilisez notre site web et nos services.
            </p>
            <p className="text-sm text-slate-400">
              <strong className="text-white">Dernière mise à jour :</strong> {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold text-white mb-3">1. Données collectées</h3>
            <p className="text-sm mb-2">Nous collectons les informations suivantes :</p>
            <ul className="list-disc list-inside space-y-1 text-sm ml-4">
              <li><strong className="text-white">Données d'identification :</strong> nom, prénom, adresse email professionnelle</li>
              <li><strong className="text-white">Données de navigation :</strong> adresse IP, type de navigateur, pages visitées, durée de visite</li>
              <li><strong className="text-white">Données de communication :</strong> messages envoyés via les formulaires de contact</li>
              <li><strong className="text-white">Cookies :</strong> données de préférences et de session (voir section Cookies)</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-bold text-white mb-3">2. Utilisation des données</h3>
            <p className="text-sm mb-2">Vos données personnelles sont utilisées pour :</p>
            <ul className="list-disc list-inside space-y-1 text-sm ml-4">
              <li>Répondre à vos demandes de contact et de support</li>
              <li>Vous envoyer des informations sur nos services (avec votre consentement)</li>
              <li>Améliorer notre site web et nos services</li>
              <li>Assurer la sécurité et prévenir les fraudes</li>
              <li>Respecter nos obligations légales et réglementaires</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-bold text-white mb-3">3. Base légale du traitement</h3>
            <p className="text-sm">
              Le traitement de vos données personnelles est basé sur :
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm ml-4 mt-2">
              <li>Votre consentement (pour les communications marketing)</li>
              <li>L'exécution d'un contrat ou de mesures précontractuelles</li>
              <li>Notre intérêt légitime (amélioration des services, sécurité)</li>
              <li>Le respect d'obligations légales</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-bold text-white mb-3">4. Conservation des données</h3>
            <p className="text-sm">
              Vos données sont conservées pendant la durée nécessaire aux finalités pour lesquelles elles ont été collectées, 
              conformément aux obligations légales. Les données de contact sont conservées pendant 3 ans à compter du dernier contact. 
              Les données de navigation sont conservées pendant 13 mois maximum.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold text-white mb-3">5. Partage des données</h3>
            <p className="text-sm mb-2">
              Vos données personnelles ne sont pas vendues, louées ou cédées à des tiers. Elles peuvent être partagées avec :
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm ml-4">
              <li>Nos prestataires techniques (hébergement, outils d'analyse) sous contrat strict</li>
              <li>Les autorités compétentes si la loi l'exige</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-bold text-white mb-3">6. Vos droits (RGPD)</h3>
            <p className="text-sm mb-2">Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez des droits suivants :</p>
            <ul className="list-disc list-inside space-y-1 text-sm ml-4">
              <li><strong className="text-white">Droit d'accès :</strong> obtenir une copie de vos données personnelles</li>
              <li><strong className="text-white">Droit de rectification :</strong> corriger vos données inexactes</li>
              <li><strong className="text-white">Droit à l'effacement :</strong> supprimer vos données ("droit à l'oubli")</li>
              <li><strong className="text-white">Droit à la limitation :</strong> limiter le traitement de vos données</li>
              <li><strong className="text-white">Droit à la portabilité :</strong> récupérer vos données dans un format structuré</li>
              <li><strong className="text-white">Droit d'opposition :</strong> vous opposer au traitement de vos données</li>
              <li><strong className="text-white">Droit de retirer votre consentement :</strong> à tout moment</li>
            </ul>
            <p className="text-sm mt-3">
              Pour exercer ces droits, contactez-nous à : <a href="mailto:zonia.ai.pro@gmail.com" className="text-[#19E4FA] hover:underline">zonia.ai.pro@gmail.com</a>
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold text-white mb-3">7. Cookies</h3>
            <p className="text-sm mb-2">
              Notre site utilise des cookies pour améliorer votre expérience de navigation. Les cookies sont de petits fichiers texte 
              stockés sur votre appareil. Nous utilisons :
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm ml-4">
              <li><strong className="text-white">Cookies essentiels :</strong> nécessaires au fonctionnement du site</li>
              <li><strong className="text-white">Cookies analytiques :</strong> pour comprendre l'utilisation du site (avec votre consentement)</li>
            </ul>
            <p className="text-sm mt-3">
              Vous pouvez gérer vos préférences de cookies via les paramètres de votre navigateur.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold text-white mb-3">8. Sécurité</h3>
            <p className="text-sm">
              Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données personnelles 
              contre tout accès non autorisé, perte, destruction ou altération. Cependant, aucune méthode de transmission sur Internet 
              n'est totalement sécurisée.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold text-white mb-3">9. Contact</h3>
            <p className="text-sm">
              Pour toute question concernant cette politique de confidentialité ou le traitement de vos données personnelles, 
              vous pouvez nous contacter :
            </p>
            <div className="mt-3 p-4 bg-slate-800/50 rounded-lg text-sm">
              <p><strong className="text-white">Email :</strong> <a href="mailto:zonia.ai.pro@gmail.com" className="text-[#19E4FA] hover:underline">zonia.ai.pro@gmail.com</a></p>
            </div>
          </section>

          <section>
            <h3 className="text-xl font-bold text-white mb-3">10. Réclamation</h3>
            <p className="text-sm">
              Si vous estimez que vos droits ne sont pas respectés, vous avez le droit d'introduire une réclamation auprès 
              de la Commission Nationale de l'Informatique et des Libertés (CNIL) : 
              <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-[#19E4FA] hover:underline ml-1">www.cnil.fr</a>
            </p>
          </section>
        </div>
      </Modal>

      {/* Modale Support */}
      <Modal 
        isOpen={openModal === 'support'} 
        onClose={() => setOpenModal(null)}
        title={
          <>
            <HelpCircle className="w-6 h-6 text-[#FFD700]" />
            Support & Aide
          </>
        }
      >
        <div className="space-y-6">
          <section>
            <p className="text-sm mb-4">
              Notre équipe de support est là pour vous aider. Consultez les informations ci-dessous ou contactez-nous directement.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
              <Mail className="w-5 h-5 text-[#19E4FA]" />
              Contact Support
            </h3>
            <div className="bg-slate-800/50 rounded-lg p-4 space-y-3 text-sm">
              <div>
                <strong className="text-white">Email général :</strong>
                <p className="mt-1"><a href="mailto:zonia.ai.pro@gmail.com" className="text-[#19E4FA] hover:underline">zonia.ai.pro@gmail.com</a></p>
              </div>
              <div>
                <strong className="text-white">Email technique :</strong>
                <p className="mt-1"><a href="mailto:zonia.ai.pro@gmail.com" className="text-[#19E4FA] hover:underline">zonia.ai.pro@gmail.com</a></p>
              </div>
              <div>
                <strong className="text-white">Téléphone :</strong>
                <p className="mt-1">[À compléter - Numéro de téléphone]</p>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-xl font-bold text-white mb-3">Horaires de support</h3>
            <div className="bg-slate-800/50 rounded-lg p-4 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Lundi - Vendredi</span>
                  <span className="text-white font-medium">9h00 - 18h00 (CET)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Samedi - Dimanche</span>
                  <span className="text-white font-medium">Fermé</span>
                </div>
                <p className="text-xs text-slate-500 mt-3">
                  Pour les urgences critiques, contactez-nous par email. Nous répondrons dans les plus brefs délais.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-xl font-bold text-white mb-3">Questions fréquentes (FAQ)</h3>
            <div className="space-y-4">
              <div className="bg-slate-800/50 rounded-lg p-4">
                <h4 className="font-bold text-white mb-2">Comment demander un audit ?</h4>
                <p className="text-sm text-slate-300">
                  Utilisez le formulaire en bas de la page ou écrivez à
                  <a href="mailto:zonia.ai.pro@gmail.com" className="text-[#19E4FA] hover:underline ml-1">zonia.ai.pro@gmail.com</a>.
                  Nous vous répondrons sous 24h ouvrées.
                </p>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-4">
                <h4 className="font-bold text-white mb-2">Quelles formules proposez-vous ?</h4>
                <p className="text-sm text-slate-300">
                  Diagnostic, solution ciblée, solution intégrée et plateforme métier. Aucun prix n’est affiché :
                  le devis décrit le périmètre après l’audit. Un assistant peut faire partie du livrable, il n’est pas le produit.
                </p>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-4">
                <h4 className="font-bold text-white mb-2">Combien de temps prend un projet ?</h4>
                <p className="text-sm text-slate-300">
                  Le calendrier se fixe après le cadrage. Un flux ciblé est plus court qu’une plateforme métier,
                  qui se livre par lots. Nous ne partons pas sur un ERP généraliste de longue durée.
                </p>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-4">
                <h4 className="font-bold text-white mb-2">Que se passe-t-il après la livraison ?</h4>
                <p className="text-sm text-slate-300">
                  Les corrections font partie de l’accompagnement. Les évolutions se chiffrent à part,
                  selon le rythme que vous choisissez.
                </p>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-4">
                <h4 className="font-bold text-white mb-2">Vos solutions sont-elles conformes au RGPD ?</h4>
                <p className="text-sm text-slate-300">
                  Absolument. La conformité RGPD est une priorité. Toutes nos solutions respectent les réglementations 
                  en vigueur sur la protection des données personnelles.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-xl font-bold text-white mb-3">Ressources supplémentaires</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-800/50 rounded-lg p-4">
                <h4 className="font-bold text-white mb-2 text-sm">Documentation</h4>
                <p className="text-xs text-slate-400">Guides d'utilisation et tutoriels</p>
                <a href="mailto:zonia.ai.pro@gmail.com" className="text-[#19E4FA] hover:underline text-sm mt-2 inline-block">Demander l'accès →</a>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4">
                <h4 className="font-bold text-white mb-2 text-sm">Formation</h4>
                <p className="text-xs text-slate-400">Sessions de formation pour vos équipes</p>
                <a href="mailto:zonia.ai.pro@gmail.com" className="text-[#19E4FA] hover:underline text-sm mt-2 inline-block">En savoir plus →</a>
              </div>
            </div>
          </section>

          <section className="bg-gradient-to-r from-[#19E4FA]/10 to-[#FFD700]/10 rounded-lg p-4 border border-[#19E4FA]/20">
            <h3 className="font-bold text-white mb-2">Besoin d'aide immédiate ?</h3>
            <p className="text-sm text-slate-300 mb-3">
              Pour les problèmes urgents, contactez-nous directement par email avec le sujet "URGENT" 
              et nous prioriserons votre demande.
            </p>
            <a 
              href="mailto:zonia.ai.pro@gmail.com?subject=URGENT%20-%20Demande%20de%20support" 
              className="inline-flex items-center gap-2 bg-[#19E4FA] hover:bg-[#FFD700] text-slate-900 font-bold px-4 py-2 rounded-lg transition-colors text-sm"
            >
              <Send className="w-4 h-4" />
              Contacter le support
            </a>
          </section>
        </div>
      </Modal>
    </div>
  );
};

export default Vitrine;