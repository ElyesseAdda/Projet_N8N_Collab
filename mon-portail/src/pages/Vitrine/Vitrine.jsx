import React, { useState } from 'react';
// L'import externe est supprimé pour éviter l'erreur de compilation dans l'environnement de prévisualisation
// import './Vitrine.css'; 
import { 
  Menu, ArrowRight, Mail, ClipboardCheck, Compass, PenLine, RefreshCw,
  Layers, Workflow, FileSearch, Cable, Send, X, HelpCircle, Shield,
  FileText as FileTextIcon, Check, MessageSquare, Users, LayoutGrid, Plus
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
    title: 'Audit et analyse des besoins',
    text: 'Nous observons vos flux, vos irritants et le résultat attendu, avant de proposer quoi que ce soit.',
    stat: '60–70 %',
    statLabel: 'du temps de travail est déjà automatisable',
    evidence: 'Part des activités des salariés que l’IA générative et les outils actuels peuvent prendre en charge. L’audit identifie lesquelles, chez vous.',
    source: 'McKinsey Global Institute, 2023',
  },
  {
    n: '02',
    icon: <PenLine />,
    title: 'Proposition et mise en place',
    text: 'Nous présentons la solution qui correspond au périmètre, puis nous la construisons et la déployons.',
    stat: '+15 %',
    statLabel: 'de demandes traitées par heure',
    evidence: 'Jusqu’à +30 % pour les équipes les moins expérimentées. Nous automatisons vos flux réels, pas un outil générique.',
    source: 'Brynjolfsson, Li et Raymond, QJE, 5 172 agents, 2025',
  },
  {
    n: '03',
    icon: <Compass />,
    title: 'Suivi des performances et formation',
    text: 'Nous formons votre équipe à l’outil, puis nous mesurons ce qu’il change : temps, fiabilité, adoption.',
    stat: '3,6 h',
    statLabel: 'gagnées par semaine, sur les seuls e-mails',
    evidence: 'Soit 31 % de temps en moins pour les utilisateurs réguliers. Le suivi mesure votre gain réel, chiffres à l’appui.',
    source: 'Microsoft Research / Harvard, 7 137 salariés, 2025',
  },
  {
    n: '04',
    icon: <RefreshCw />,
    title: 'Maintenance et amélioration',
    text: 'Nous corrigeons et faisons évoluer l’outil quand vos flux changent, pour que le gain dure.',
    stat: '73 %',
    statLabel: 'des entreprises utilisent l’IA pour gagner du temps',
    evidence: 'Mais 53 % plafonnent ensuite faute d’expertise. C’est cet écart que l’accompagnement comble.',
    source: 'Insee, enquête TIC 2025',
  },
];

const BEFORE_AFTER = [
  {
    task: 'Relances de devis',
    before: 'Relancés un par un, à la main. Certains finissent oubliés.',
    after: 'Chaque relance part au bon moment. Vous êtes alerté dès que le client répond.',
  },
  {
    task: 'Saisie de documents',
    before: 'Factures et bons de commande recopiés dans le tableur ou le logiciel.',
    after: 'Les informations sont lues et classées automatiquement. Vous n’avez qu’à valider.',
  },
  {
    task: 'E-mails entrants',
    before: 'La boîte est triée à la main, les demandes urgentes se perdent.',
    after: 'Chaque e-mail est trié, résumé et transmis à la bonne personne.',
  },
];

const TIME_GAIN_RATE = 0.31;
const WORKED_WEEKS = 45;

const TimeCalculator = () => {
  const [people, setPeople] = useState(5);
  const [hours, setHours] = useState(10);
  const yearlyHours = Math.round(people * hours * TIME_GAIN_RATE * WORKED_WEEKS);
  const workDays = Math.round(yearlyHours / 7);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xl lg:sticky lg:top-28">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500 mb-2">Votre estimation</p>
      <h3 className="text-2xl font-bold text-slate-950 mb-8">Combien de temps pourriez-vous récupérer ?</h3>

      <div className="space-y-7">
        <label className="block">
          <div className="flex justify-between items-baseline mb-3">
            <span className="text-sm font-semibold text-slate-700">Personnes concernées</span>
            <span className="text-lg font-extrabold text-slate-950">{people}</span>
          </div>
          <input type="range" min="1" max="50" value={people} onChange={(e) => setPeople(Number(e.target.value))} className="w-full accent-[#0891B2] cursor-pointer" />
        </label>
        <label className="block">
          <div className="flex justify-between items-baseline mb-3">
            <span className="text-sm font-semibold text-slate-700">Heures de tâches répétitives, par personne et par semaine</span>
            <span className="text-lg font-extrabold text-slate-950 whitespace-nowrap pl-3">{hours} h</span>
          </div>
          <input type="range" min="1" max="30" value={hours} onChange={(e) => setHours(Number(e.target.value))} className="w-full accent-[#0891B2] cursor-pointer" />
        </label>
      </div>

      <div className="mt-8 rounded-2xl bg-gradient-to-br from-slate-50 to-[#ECFEFF] border border-slate-100 p-6">
        <p className="text-sm text-slate-600">Temps récupérable par an</p>
        <div className="text-5xl font-extrabold tracking-tight text-gradient leading-tight mt-1">{yearlyHours.toLocaleString('fr-FR')} h</div>
        <p className="text-sm font-semibold text-slate-900 mt-1">soit environ {workDays.toLocaleString('fr-FR')} jours de travail</p>
      </div>

      <p className="text-[11px] text-slate-400 mt-4 leading-relaxed">
        Estimation prudente : 31 % de temps gagné sur 45 semaines travaillées (Microsoft Research / Harvard, 2025). L’audit chiffre votre cas réel.
      </p>

      <a href="#contact" className="mt-6 w-full px-6 py-4 bg-slate-950 hover:bg-[#0891B2] text-white rounded-full font-bold shadow-[0_12px_30px_-12px_rgba(15,23,42,0.55)] transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2">
        Vérifier mon estimation en audit <ArrowRight className="w-5 h-5" />
      </a>
    </div>
  );
};

const WHY_CUSTOM = [
  {
    stat: '50 %',
    label: 'des budgets IA partent dans les ventes et le marketing',
    text: 'Pourtant, les retours les plus rapides viennent souvent du back-office : facturation, saisie, documents, commandes.',
    source: 'MIT NANDA, The GenAI Divide, 2025',
    href: 'https://mlq.ai/media/quarterly_decks/v0.1_State_of_AI_in_Business_2025_Report.pdf',
  },
  {
    stat: '3,7 €',
    label: 'rapportés pour 1 € investi dans l’IA générative',
    text: 'Retour moyen déclaré par plus de 4 000 décideurs. Les entreprises les plus avancées atteignent 10,3 €.',
    source: 'IDC pour Microsoft, 2024',
    href: 'https://info.microsoft.com/ww-landing-business-opportunity-of-ai.html',
  },
  {
    stat: '89 %',
    label: 'des salariés plus satisfaits de leur travail',
    text: 'Après avoir été équipés d’outils d’automatisation. Moins de tâches rébarbatives, plus de temps pour le métier.',
    source: 'Salesforce, 773 utilisateurs, 2021',
    href: 'https://www.salesforce.com/news/stories/new-salesforce-research-links-lower-stress-levels-and-business-automation/',
  },
];

const SOLUTIONS = [
  {
    icon: <Workflow />,
    title: 'Automatisation ciblée',
    desc: 'Un flux de bout en bout - relances, pièces, planning - sans refaire tout le système.',
    tone: 'cyan',
  },
  {
    icon: <Layers />,
    title: 'Application métier',
    desc: 'Un outil interne dédié à votre façon de travailler : clients, interventions, suivi, documents.',
    tone: 'gold',
  },
  {
    icon: <FileSearch />,
    title: 'Connaissance documentaire',
    desc: 'Vos procédures et dossiers deviennent interrogeables. Une brique possible, jamais le produit vendu seul.',
    tone: 'cyan',
  },
  {
    icon: <Cable />,
    title: 'Connexion à l’existant',
    desc: 'Mails, agendas, tableurs, facturation : on relie ce que vous utilisez déjà quand c’est utile.',
    tone: 'gold',
  },
];

const CATALOG = [
  {
    icon: <FileSearch />,
    title: 'Recherche dans vos documents',
    price: '8 000 €',
    pricePrefix: 'à partir de',
    desc: 'Posez une question, obtenez la réponse tirée de vos propres fichiers (contrats, procédures, devis, notices).',
    tone: 'cyan',
  },
  {
    icon: <MessageSquare />,
    title: 'Chatbot',
    price: '5 000 €',
    pricePrefix: 'à partir de',
    desc: 'Répond à vos clients ou à vos équipes à toute heure, avec les informations de votre entreprise.',
    tone: 'gold',
  },
  {
    icon: <Users />,
    title: 'Gestion des leads',
    price: '3 000 €',
    pricePrefix: 'à partir de',
    desc: 'Vous cherchez de nouveaux clients ? Nous complétons chaque contact (poste, entreprise, coordonnées vérifiées) pour que vous contactiez les bonnes personnes, avec le bon message.',
    tone: 'cyan',
  },
  {
    icon: <Mail />,
    title: 'Gestion des mails',
    price: '2 500 €',
    pricePrefix: 'à partir de',
    desc: 'Tri, classement et réponses préparées : votre boîte de réception se remplit moins vite.',
    tone: 'gold',
  },
  {
    icon: <LayoutGrid />,
    title: 'ERP de gestion',
    price: '6 000 €',
    pricePrefix: 'à partir de',
    desc: 'Devis, facturation, suivi, documents : un logiciel complet déjà éprouvé, adapté à votre métier.',
    tone: 'cyan',
  },
  {
    icon: <Plus />,
    title: 'Un autre besoin ?',
    price: 'Sur devis',
    desc: 'Application web ou mobile, formation de vos équipes, automatisation spécifique : nous la concevons avec vous.',
    tone: 'gold',
  },
];

const AUDITS = [
  {
    id: 'flash',
    title: 'Audit Flash',
    price: '600 €',
    duration: '1 jour',
    idealFor: 'Une tâche précise vous fait perdre du temps.',
    points: ['Un processus passé au crible', 'Les gains possibles chiffrés', 'Une recommandation claire : quoi automatiser, ou pas'],
  },
  {
    id: 'standard',
    title: 'Audit Standard',
    price: '1 800 à 2 400 €',
    duration: '3 à 4 jours',
    idealFor: 'Plusieurs équipes ressaisissent les mêmes informations.',
    points: ['Plusieurs processus cartographiés', 'Entretiens avec les personnes qui font le travail', 'Feuille de route priorisée'],
    featured: true,
  },
  {
    id: 'approfondi',
    title: 'Audit Approfondi',
    price: 'Sur devis',
    duration: 'Selon le projet',
    idealFor: 'Vos outils actuels ne suivent plus votre activité.',
    points: ['Toute l’activité analysée, équipe par équipe', 'Architecture cible et lots de déploiement', 'Cahier des charges prêt à chiffrer'],
  },
];

const SOLUTION_OFFERS = [
  {
    id: 'catalogue',
    title: 'Modules du catalogue',
    price: '2 500 €',
    pricePrefix: 'à partir de',
    desc: 'Recherche dans vos documents, chatbot, leads, mails, ERP : vous choisissez les modules dont vous avez besoin.',
    example: 'Les tarifs de chaque module sont détaillés dans le catalogue.',
    featured: true,
  },
  {
    id: 'sur-mesure',
    title: 'Projet sur mesure',
    desc: 'Application web ou mobile, IA et formation des équipes, besoin spécifique.',
    example: 'Conçu avec vous, chiffré après l’audit.',
  },
];

const SUBSCRIPTION_TIERS = [
  { size: 'Outil simple', price: '250 €' },
  { size: 'Outil standard', price: '500 €' },
  { size: 'ERP ou plusieurs outils', price: '900 € et +' },
];

const FORMULA_OPTIONS = [
  ...AUDITS.map((a) => a.title),
  ...CATALOG.map((item) => item.title),
  'Projet sur mesure',
  'Évolution technologique',
  'Je ne sais pas encore',
];

const GUIDE_SCOPE = [
  { id: 'un', label: 'Une seule tâche', audit: 'flash' },
  { id: 'plusieurs', label: 'Plusieurs processus', audit: 'standard' },
  { id: 'tout', label: 'Toute l’activité', audit: 'approfondi' },
];

const GUIDE_NEED = [
  { id: 'auto', label: 'Automatiser une tâche', solution: 'catalogue' },
  { id: 'app', label: 'Un outil pour l’équipe', solution: 'sur-mesure' },
  { id: 'erp', label: 'Un logiciel de gestion complet', solution: 'catalogue' },
];

const ChoiceGroup = ({ label, options, value, onChange }) => (
  <div>
    <p className="text-sm font-semibold text-slate-700 mb-3">{label}</p>
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onChange(option.id)}
          className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${value === option.id ? 'bg-slate-950 text-white border-slate-950' : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'}`}
        >
          {option.label}
        </button>
      ))}
    </div>
  </div>
);

const FormulaGuide = ({ onChoose }) => {
  const [scope, setScope] = useState('un');
  const [need, setNeed] = useState('auto');
  const audit = AUDITS.find((a) => a.id === GUIDE_SCOPE.find((s) => s.id === scope).audit);
  const solution = SOLUTION_OFFERS.find((s) => s.id === GUIDE_NEED.find((n) => n.id === need).solution);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
      <div className="space-y-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500 mb-2">Quelle formule pour vous ?</p>
          <h3 className="text-2xl font-bold text-slate-950">Deux questions, une recommandation.</h3>
        </div>
        <ChoiceGroup label="Que voulez-vous améliorer ?" options={GUIDE_SCOPE} value={scope} onChange={setScope} />
        <ChoiceGroup label="De quoi avez-vous besoin ?" options={GUIDE_NEED} value={need} onChange={setNeed} />
      </div>
      <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-[#ECFEFF] border border-slate-100 p-6">
        <p className="text-sm text-slate-600">Nous vous recommandons</p>
        <div className="mt-3 space-y-3">
          <div className="flex items-baseline justify-between gap-4">
            <span className="font-bold text-slate-950">1. {audit.title}</span>
            <span className="text-sm font-semibold text-slate-700 whitespace-nowrap">{audit.price} HT</span>
          </div>
          <div className="flex items-baseline justify-between gap-4">
            <span className="font-bold text-slate-950">2. {solution.title}</span>
            <span className="text-sm font-semibold text-slate-700 whitespace-nowrap">
              {solution.price ? `${solution.pricePrefix ? `${solution.pricePrefix} ` : ''}${solution.price} HT` : 'sur devis'}
            </span>
          </div>
        </div>
        <p className="text-xs text-[#0E7490] font-semibold mt-4">Le coût de l’audit est déduit de la solution si vous poursuivez avec Zonia.</p>
        <a
          href="#contact"
          onClick={() => onChoose(audit.title)}
          className="mt-5 w-full px-6 py-3 bg-slate-950 hover:bg-[#0891B2] text-white rounded-full font-bold transition-all flex items-center justify-center gap-2"
        >
          Démarrer par l’{audit.title} <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
};

const PriceCard = ({ title, price, pricePrefix, priceSuffix, meta, children, featured, onChoose }) => (
  <article className={`h-full flex flex-col rounded-2xl border p-6 bg-white shadow-[0_16px_40px_-28px_rgba(15,23,42,0.45)] transition-all hover:-translate-y-1 ${featured ? 'border-slate-950 ring-1 ring-slate-950' : 'border-slate-200 hover:border-[#19E4FA]/60'}`}>
    <div className="flex items-center justify-between gap-3 mb-3">
      <h4 className="text-lg font-bold text-slate-950">{title}</h4>
      {meta && <span className="text-xs font-semibold text-slate-500 bg-slate-100 rounded-full px-3 py-1 whitespace-nowrap">{meta}</span>}
    </div>
    {price && (
      <div className="mb-4">
        {pricePrefix && <span className="text-sm text-slate-500 mr-1">{pricePrefix}</span>}
        <span className="text-3xl font-extrabold tracking-tight text-gradient">{price}</span>
        <span className="text-sm text-slate-500 ml-1">{priceSuffix}</span>
      </div>
    )}
    <div className="flex-1">{children}</div>
    <a
      href="#contact"
      onClick={() => onChoose(title)}
      className={`mt-6 text-center rounded-full px-4 py-3 text-sm font-bold transition-colors ${featured ? 'bg-slate-950 text-white hover:bg-[#0891B2]' : 'border border-slate-950 text-slate-950 hover:bg-slate-950 hover:text-white'}`}
    >
      Choisir cette formule
    </a>
  </article>
);

const ZoniaLogo = ({ size = 40, strokeColor = 'white' }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <path d="M 25 25 H 75 L 25 75 H 75 L 25 25 Z" stroke={strokeColor} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CatalogCard = ({ icon, title, desc, price, pricePrefix, tone, onChoose }) => {
  const gold = tone === 'gold';
  const quoted = price === 'Sur devis';
  return (
    <article className="h-full flex flex-col bg-white p-6 rounded-2xl border border-slate-200 shadow-[0_16px_40px_-28px_rgba(15,23,42,0.45)] hover:border-[#19E4FA] hover:-translate-y-1 transition-all duration-300">
      <div className="flex items-start justify-between gap-3 mb-5">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border flex-shrink-0 ${gold ? 'bg-[#FFD700]/20 border-[#EAB308]/40' : 'bg-[#19E4FA]/15 border-[#19E4FA]/30'}`}>
          {React.cloneElement(icon, { className: `w-6 h-6 ${gold ? 'text-[#A16207]' : 'text-[#0E7490]'}` })}
        </div>
        <p className="text-right leading-tight">
          {pricePrefix && <span className="block text-xs font-medium text-slate-500">{pricePrefix}</span>}
          <span className={`font-extrabold tracking-tight text-slate-950 ${quoted ? 'text-base' : 'text-lg'}`}>{price}</span>
        </p>
      </div>
      <h3 className="text-lg font-bold text-slate-950 mb-2">{title}</h3>
      <p className="text-slate-600 text-sm leading-relaxed flex-1">{desc}</p>
      <a href="#contact" onClick={() => onChoose(title)} className="mt-5 text-sm font-bold text-[#0E7490] hover:text-slate-950 inline-flex items-center gap-1">
        Choisir ce module <ArrowRight className="w-4 h-4" />
      </a>
    </article>
  );
};

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
              <a href="#methode" className="text-sm font-medium text-slate-700 hover:text-slate-950 transition-colors">Vos gains</a>
              <a href="#solutions" className="text-sm font-medium text-slate-700 hover:text-slate-950 transition-colors">Solutions</a>
              <a href="#catalogue" className="text-sm font-medium text-slate-700 hover:text-slate-950 transition-colors">Catalogue</a>
              <a href="#pourquoi" className="text-sm font-medium text-slate-700 hover:text-slate-950 transition-colors">Pourquoi nous</a>
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
            <a href="#methode" onClick={close} className="block text-center text-slate-950 border border-slate-950 hover:bg-slate-950 hover:text-white px-4 py-3 rounded-full text-sm font-medium">Vos gains</a>
            <a href="#solutions" onClick={close} className="block text-center text-slate-950 border border-slate-950 hover:bg-slate-950 hover:text-white px-4 py-3 rounded-full text-sm font-medium">Solutions</a>
            <a href="#catalogue" onClick={close} className="block text-center text-slate-950 border border-slate-950 hover:bg-slate-950 hover:text-white px-4 py-3 rounded-full text-sm font-medium">Catalogue</a>
            <a href="#pourquoi" onClick={close} className="block text-center text-slate-950 border border-slate-950 hover:bg-slate-950 hover:text-white px-4 py-3 rounded-full text-sm font-medium">Pourquoi nous</a>
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

const EMPTY_FORM = { name: '', company: '', email: '', formula: 'Je ne sais pas encore', need: '' };

const Vitrine = () => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [openModal, setOpenModal] = useState(null);

  const setField = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }));
  };

  const chooseFormula = (title) => setForm((current) => ({ ...current, formula: title }));

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
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-950 tracking-tight mb-6 leading-tight">Moins de tâches répétitives.<br/><span className="text-gradient">Plus de temps pour votre métier.</span></h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-slate-600">Relances, saisies, e-mails, dossiers : Zonia automatise ce qui ralentit votre équipe, avec des outils IA construits sur mesure pour votre entreprise. On commence par un audit, vous gardez la main.</p>
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <a href="#contact" className="px-8 py-4 bg-slate-950 hover:bg-[#0891B2] text-white rounded-full font-bold text-lg shadow-[0_12px_30px_-12px_rgba(15,23,42,0.55)] transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2">Demander un audit <ArrowRight className="w-5 h-5" /></a>
            <a href="#formules" className="px-8 py-4 bg-white hover:bg-slate-50 text-slate-900 rounded-full font-bold text-lg border border-slate-200 hover:border-slate-300 transition-all hover:-translate-y-0.5">Voir les formules</a>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-20 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0E7490] mb-3">Notre processus</p>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-950">4 étapes, des gains mesurables</h2>
          <p className="mt-3 max-w-2xl mx-auto text-slate-600">Chaque étape s’appuie sur des résultats observés en entreprise, pas sur des promesses.</p>
        </div>
        <div className="max-w-6xl mx-auto mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {METHOD_STEPS.map((step) => (
            <div key={step.n} className="group h-full flex flex-col bg-white rounded-2xl border border-slate-200 p-5 text-left shadow-[0_16px_40px_-28px_rgba(15,23,42,0.45)] transition-all hover:-translate-y-1 hover:border-[#19E4FA]/60">
              <div className="flex items-center justify-between mb-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ECFEFF] text-[#0E7490] [&>svg]:h-5 [&>svg]:w-5">{step.icon}</span>
                <span className="text-xs font-bold tracking-[0.18em] text-slate-400">ÉTAPE {step.n}</span>
              </div>
              <h3 className="text-base font-bold text-slate-950 mb-2 leading-snug min-h-[2.75rem]">{step.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed lg:min-h-[5.75rem]">{step.text}</p>
              <div className="flex-1 flex flex-col pt-5">
                <div className="flex-1 rounded-xl bg-gradient-to-br from-slate-50 to-[#ECFEFF] border border-slate-100 p-4">
                  <div className="text-4xl font-extrabold tracking-tight text-gradient leading-none">{step.stat}</div>
                  <p className="text-sm font-semibold text-slate-900 mt-2 leading-snug">{step.statLabel}</p>
                  <p className="text-xs text-slate-600 leading-relaxed mt-2">{step.evidence}</p>
                  <p className="text-[11px] text-slate-400 mt-3">{step.source}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="max-w-3xl mx-auto mt-6 text-center text-xs text-slate-500 leading-relaxed">
          Sources : <a className="underline hover:text-slate-800" href="https://www.mckinsey.com/capabilities/mckinsey-digital/our-insights/the-economic-potential-of-generative-ai-the-next-productivity-frontier" target="_blank" rel="noopener noreferrer">McKinsey</a>, <a className="underline hover:text-slate-800" href="https://www.insee.fr/fr/statistiques/9025878" target="_blank" rel="noopener noreferrer">Insee</a>, <a className="underline hover:text-slate-800" href="https://www.nber.org/papers/w31161" target="_blank" rel="noopener noreferrer">NBER / QJE</a>, <a className="underline hover:text-slate-800" href="https://arxiv.org/abs/2504.11436" target="_blank" rel="noopener noreferrer">Microsoft Research / Harvard</a>.
        </p>
      </section>
      <section id="methode" className="scroll-mt-24 py-20 relative z-10 bg-white/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-10">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0E7490] mb-3">Concrètement</p>
            <h2 className="text-3xl md:text-5xl font-bold text-slate-950 mb-6">Ce qui change dans votre semaine.</h2>
            <p className="text-slate-600 text-lg">Trois exemples de tâches que nous automatisons le plus souvent.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-start">
            <div>
              <div className="space-y-4">
                {BEFORE_AFTER.map((item) => (
                  <div key={item.task} className="bg-white rounded-2xl border border-slate-200 p-5">
                    <h3 className="font-bold text-slate-950 mb-3">{item.task}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-[11px] font-bold tracking-[0.16em] text-slate-400 mb-1">AVANT</p>
                        <p className="text-sm text-slate-500 leading-relaxed">{item.before}</p>
                      </div>
                      <div className="rounded-xl bg-[#ECFEFF] border border-[#19E4FA]/40 p-3">
                        <p className="text-[11px] font-bold tracking-[0.16em] text-[#0E7490] mb-1">APRÈS</p>
                        <p className="text-sm text-slate-800 leading-relaxed">{item.after}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-4">Exemples types. L’audit détermine ce qui s’applique à vos flux.</p>
            </div>
            <TimeCalculator />
          </div>
        </div>
      </section>
      <section id="solutions" className="scroll-mt-24 py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0E7490] mb-3">Après l’audit</p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-950 mb-4">La solution suit le métier</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">Chaque chantier est écrit pour vous, à partir de ce que l’audit a mis en évidence.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {SOLUTIONS.map((item) => (
              <ServiceCard key={item.title} {...item} />
            ))}
          </div>
        </div>
      </section>
      <section id="pourquoi" className="scroll-mt-24 py-24 relative z-10 bg-white/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
            <div className="lg:col-span-2">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0E7490] mb-3">Pourquoi le sur-mesure</p>
              <div className="text-7xl md:text-8xl font-extrabold tracking-tight leading-none text-gradient">95 %</div>
              <p className="text-xl md:text-2xl font-bold text-slate-950 mt-4 leading-snug">des entreprises n’obtiennent aucun résultat mesurable de leurs projets d’IA.</p>
              <p className="text-slate-600 mt-4 leading-relaxed">La différence ne vient pas de l’outil, mais de son intégration dans vos processus. Un assistant générique ne connaît ni vos règles, ni vos logiciels, ni vos clients. C’est précisément ce que nous construisons.</p>
              <a href="https://mlq.ai/media/quarterly_decks/v0.1_State_of_AI_in_Business_2025_Report.pdf" target="_blank" rel="noopener noreferrer" className="inline-block text-[11px] text-slate-400 hover:text-slate-700 underline mt-4">MIT NANDA, The GenAI Divide, 2025</a>
            </div>
            <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {WHY_CUSTOM.map((item) => (
                <div key={item.stat} className="h-full flex flex-col bg-white rounded-2xl border border-slate-200 p-5 shadow-[0_16px_40px_-28px_rgba(15,23,42,0.45)] transition-all hover:-translate-y-1 hover:border-[#19E4FA]/60">
                  <div className="text-4xl font-extrabold tracking-tight text-gradient leading-none">{item.stat}</div>
                  <p className="text-sm font-semibold text-slate-900 mt-3 leading-snug">{item.label}</p>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">{item.text}</p>
                  <a href={item.href} target="_blank" rel="noopener noreferrer" className="mt-auto pt-4 text-[11px] text-slate-400 hover:text-slate-700 underline">{item.source}</a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section id="catalogue" className="scroll-mt-24 py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0E7490] mb-3">Catalogue</p>
            <h2 className="text-3xl md:text-5xl font-bold text-slate-950 mb-4">Le catalogue Zonia</h2>
            <p className="text-slate-600 text-lg">Des modules prêts à l’emploi, réunis dans une seule interface. Vous choisissez uniquement ceux dont vous avez besoin.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CATALOG.map((item) => (
              <CatalogCard key={item.title} {...item} onChoose={chooseFormula} />
            ))}
          </div>
          <div className="mt-8 rounded-2xl border border-[#FFD700]/50 bg-[#FFFBEB] p-6 md:p-8 flex gap-4 items-start">
            <span className="flex items-center justify-center w-11 h-11 rounded-xl bg-white border border-[#EAB308]/40 flex-shrink-0">
              <ZoniaLogo size={26} strokeColor="#A16207" />
            </span>
            <p className="text-slate-800 leading-relaxed">
              <span className="font-bold text-slate-950">Une seule interface pour tout.</span> Les modules partagent les mêmes données : vous commencez par celui qui vous fait gagner le plus de temps, puis vous ajoutez les autres quand vous le souhaitez.
            </p>
          </div>
          <p className="mt-6 text-xs text-slate-500 leading-relaxed max-w-3xl">
            Tarifs indicatifs, hors taxes, modifiables selon les besoins de votre projet. Le coût de l’audit est déduit si vous poursuivez avec Zonia.
          </p>
        </div>
      </section>
      <section id="formules" className="scroll-mt-24 py-24 relative z-10 bg-white/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-10">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0E7490] mb-3">Formules</p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-950 mb-4">Choisissez votre point de départ</h2>
            <p className="text-slate-600 text-lg">Tarifs indicatifs, hors taxes. Ils sont modifiables selon les besoins de votre projet : chaque projet fait l’objet d’un devis.</p>
          </div>

          <FormulaGuide onChoose={chooseFormula} />

          <div className="mt-16 flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-6">
            <div>
              <p className="text-xs font-bold tracking-[0.18em] text-slate-400 mb-1">ÉTAPE 1</p>
              <h3 className="text-2xl font-bold text-slate-950">Commencer par un audit</h3>
            </div>
            <span className="self-start md:self-auto text-sm font-semibold text-[#0E7490] bg-[#ECFEFF] border border-[#19E4FA]/40 rounded-full px-4 py-2">Déduit si vous poursuivez avec Zonia</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {AUDITS.map((audit) => (
              <PriceCard key={audit.id} title={audit.title} price={audit.price} priceSuffix={audit.price === 'Sur devis' ? undefined : 'HT'} meta={audit.duration} featured={audit.featured} onChoose={chooseFormula}>
                <p className="text-sm text-slate-600 mb-4"><span className="font-semibold text-slate-900">Idéal si :</span> {audit.idealFor}</p>
                <ul className="space-y-2">
                  {audit.points.map((point) => (
                    <li key={point} className="flex gap-2 text-sm text-slate-700">
                      <Check className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#0E7490]" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </PriceCard>
            ))}
          </div>

          <div className="mt-16 mb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <p className="text-xs font-bold tracking-[0.18em] text-slate-400 mb-1">ÉTAPE 2</p>
              <h3 className="text-2xl font-bold text-slate-950">Construire votre solution</h3>
              <p className="text-slate-600 mt-2 max-w-2xl">Les modules du catalogue partent de 2 500 € HT. Un besoin hors catalogue est chiffré sur devis. L’audit précise le périmètre, et son coût est déduit si vous poursuivez.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 md:justify-end md:max-w-md">
              <span className="w-full md:text-right text-xs font-semibold text-slate-500">Ce qui fait varier le prix :</span>
              {['Nombre de flux', 'Outils à connecter', 'Volume traité', 'Formation des équipes'].map((factor) => (
                <span key={factor} className="text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-full px-3 py-1.5">{factor}</span>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {SOLUTION_OFFERS.map((offer) => (
              <PriceCard key={offer.id} title={offer.title} price={offer.price} pricePrefix={offer.pricePrefix} priceSuffix={offer.price ? 'HT' : undefined} meta={offer.price ? undefined : 'Sur devis'} featured={offer.featured} onChoose={chooseFormula}>
                <p className="text-sm text-slate-600 leading-relaxed">{offer.desc}</p>
                <p className="text-xs text-slate-500 mt-3 italic">{offer.example}</p>
              </PriceCard>
            ))}
          </div>

          <div className="mt-16 rounded-2xl border border-slate-200 bg-white p-6 md:p-8 grid grid-cols-1 lg:grid-cols-5 gap-6 items-center">
            <div className="lg:col-span-2">
              <p className="text-xs font-bold tracking-[0.18em] text-slate-400 mb-1">ÉTAPE 3 · EN OPTION</p>
              <h3 className="text-2xl font-bold text-slate-950 mb-2">Les mises à jour technologiques</h3>
              <p className="text-slate-600 text-sm leading-relaxed">Inclus dans chaque solution : un outil 100 % fonctionnel, la correction des bugs et l’amélioration de vos processus. L’abonnement couvre les mises à jour quand l’outil doit évoluer.</p>
            </div>
            <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {SUBSCRIPTION_TIERS.map((tier) => (
                <a key={tier.size} href="#contact" onClick={() => chooseFormula('Évolution technologique')} className="rounded-xl bg-slate-50 border border-slate-100 hover:border-[#19E4FA]/60 p-4 transition-colors">
                  <p className="text-xs font-semibold text-slate-500">{tier.size}</p>
                  <p className="mt-1"><span className="text-2xl font-extrabold tracking-tight text-gradient">{tier.price}</span><span className="text-sm text-slate-500"> HT / mois</span></p>
                </a>
              ))}
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              ['Audit déduit', 'Son coût est déduit de votre solution si vous poursuivez avec Zonia.'],
              ['Données en Europe', 'Hébergement européen, traitement conforme au RGPD.'],
              ['Vous êtes propriétaire', 'L’outil livré et ses données vous appartiennent.'],
            ].map(([title, text]) => (
              <div key={title} className="flex gap-3">
                <Shield className="w-5 h-5 mt-0.5 flex-shrink-0 text-[#0E7490]" />
                <div>
                  <p className="font-bold text-slate-950 text-sm">{title}</p>
                  <p className="text-sm text-slate-600">{text}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-6 text-xs text-slate-400">Prix hors taxes. Les coûts d’API et de licences logicielles sont facturés directement au client. Les travaux hors forfait sont sur devis.</p>
        </div>
      </section>
      <section id="contact" className="scroll-mt-24 py-20 relative z-10">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-white rounded-3xl p-8 md:p-12 border border-slate-200 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#19E4FA] via-white to-[#FFD700]"></div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-950 mb-3">Parlons de votre premier processus</h2>
            <p className="text-slate-600 mb-8">Décrivez la tâche qui coûte le plus de temps à votre équipe. Nous revenons avec une proposition d’audit qui chiffre ce que son automatisation vous ferait gagner, avant tout engagement.</p>
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
                  {FORMULA_OPTIONS.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
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
              <p className="sm:col-span-2 text-center text-xs text-slate-500">Réponse sous 24h ouvrées. Le devis de la solution est établi après l’audit.</p>
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
                  Trois audits (Flash à 600 € HT, Standard de 1 800 à 2 400 € HT, Approfondi sur devis),
                  puis les modules du catalogue à partir de 2 500 € HT, ou un projet sur mesure.
                  Le coût de l’audit est déduit de la solution si vous poursuivez avec Zonia.
                </p>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-4">
                <h4 className="font-bold text-white mb-2">Combien de temps prend un projet ?</h4>
                <p className="text-sm text-slate-300">
                  Le calendrier se fixe après l’audit. Un module du catalogue est plus court qu’un projet sur mesure
                  ou un ERP, qui se livre par lots.
                </p>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-4">
                <h4 className="font-bold text-white mb-2">Que se passe-t-il après la livraison ?</h4>
                <p className="text-sm text-slate-300">
                  Chaque solution inclut un outil fonctionnel, la correction des bugs et l’amélioration de vos processus.
                  Les mises à jour technologiques sont en option, de 250 € à 900 € HT et plus par mois selon l’outil.
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