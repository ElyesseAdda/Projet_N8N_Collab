import React, { useState, useEffect, useRef } from 'react';
// L'import externe est supprimé pour éviter l'erreur de compilation dans l'environnement de prévisualisation
// import './Vitrine.css'; 
import { 
  Menu, ArrowRight, Mail, CalendarClock, Bot, FileCheck, 
  Database, Sparkles, Clock, Infinity, TrendingUp, FileText, 
  FileBarChart, FileSpreadsheet, Zap, User, Search, Check, 
  AlertCircle, Send 
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
    background-size: 60px 60px;
    background-image: 
      linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  }

  /* Glow Blobs */
  .glow-blob {
    position: absolute;
    width: 800px;
    height: 800px;
    background: radial-gradient(circle, rgba(6, 182, 212, 0.1) 0%, rgba(15, 23, 42, 0) 70%);
    border-radius: 50%;
    pointer-events: none;
    z-index: 0;
  }

  /* Text Gradient Animation */
  .text-gradient {
    background: linear-gradient(to right, #fff, #06b6d4, #fff);
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
    background: linear-gradient(90deg, transparent, rgba(6, 182, 212, 0.4), transparent);
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

// --- DONNÉES DE LA DÉMO RAG ---
const DEMO_SCENARIOS = {
  finance: {
    id: 'finance',
    fileName: 'Factures_Oct.pdf',
    fileType: 'pdf-blue',
    query: "Quel est le total des factures fournisseurs pour Octobre ?",
    response: (
      <span>
        D'après le fichier <span className="text-blue-400 font-medium bg-blue-400/10 px-1 rounded">Factures_Oct.pdf</span>, le total des factures fournisseurs s'élève à <strong>14 250,00 €</strong>.
      </span>
    ),
    widget: (
      <div className="bg-slate-800 rounded-lg p-3 border border-slate-600 mt-2 text-xs font-mono animate-fade-in">
        <div className="flex justify-between text-slate-500 mb-1 border-b border-slate-700 pb-1"><span>Poste</span><span>Montant</span></div>
        <div className="flex justify-between text-slate-300 py-1"><span>Hébergement Web</span><span>1 200 €</span></div>
        <div className="flex justify-between text-slate-300 py-1"><span>Licences Logiciels</span><span>4 500 €</span></div>
        <div className="flex justify-between text-slate-300 py-1"><span>Prestataires</span><span>8 550 €</span></div>
        <div className="flex justify-between text-cyan-300 font-bold pt-2 border-t border-slate-700 mt-1"><span>TOTAL</span><span>14 250 €</span></div>
      </div>
    )
  },
  rh: {
    id: 'rh',
    fileName: 'Procédure_RH.pdf',
    fileType: 'pdf-red',
    query: "Quelle est la procédure pour demander du télétravail ?",
    response: (
      <span>
        Le document <span className="text-red-400 font-medium bg-red-400/10 px-1 rounded">Procédure_RH.pdf</span> stipule que le télétravail doit être validé 48h à l'avance par le manager.
      </span>
    ),
    widget: (
      <div className="bg-slate-800 rounded-lg p-3 border border-slate-600 mt-2 text-xs animate-fade-in">
        <div className="text-slate-500 uppercase font-bold mb-2 text-[10px]">Conditions Requises</div>
        <ul className="space-y-1 text-slate-300">
          <li className="flex items-center gap-2"><Check className="w-3 h-3 text-green-400" /> Validation Manager (Email/Slack)</li>
          <li className="flex items-center gap-2"><Check className="w-3 h-3 text-green-400" /> VPN Configuré</li>
          <li className="flex items-center gap-2"><AlertCircle className="w-3 h-3 text-orange-400" /> Jours autorisés : Mar / Jeu</li>
        </ul>
      </div>
    )
  },
  stock: {
    id: 'stock',
    fileName: 'Stock_Q4.xlsx',
    fileType: 'xls-green',
    query: "Quel est le niveau de stock pour les écrans 27 pouces ?",
    response: (
      <span>
        Le fichier <span className="text-green-400 font-medium bg-green-400/10 px-1 rounded">Stock_Q4.xlsx</span> indique qu'il reste <strong>12 unités</strong> en stock principal.
      </span>
    ),
    widget: (
      <div className="bg-slate-800 rounded-lg p-3 border border-slate-600 mt-2 text-xs animate-fade-in">
        <div className="flex items-center justify-between mb-2">
          <span className="text-slate-400">Référence</span>
          <span className="text-white font-mono">MON-27-4K</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2 mb-1">
          <div className="bg-orange-500 h-2 rounded-full" style={{ width: '20%' }}></div>
        </div>
        <div className="flex justify-between text-[10px]">
          <span className="text-orange-400 font-bold">Niveau Bas (12)</span>
          <span className="text-slate-500">Seuil alerte: 15</span>
        </div>
        <div className="mt-2 pt-2 border-t border-slate-700 text-center text-slate-400">
          Prochaine livraison : <span className="text-white">15/11/2024</span>
        </div>
      </div>
    )
  }
};

const ZoniaLogo = ({ size = 40, circleSize = 4 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <path d="M 25 25 H 75 L 25 75 H 75 L 25 25 Z" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="50" cy="50" r={circleSize} fill="#06b6d4" />
  </svg>
);

const ZoniaAvatar = () => (
  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex-shrink-0 flex items-center justify-center">
    <svg width="20" height="20" viewBox="0 0 100 100" fill="none">
        <path d="M 25 25 H 75 L 25 75 H 75 L 25 25 Z" stroke="white" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="50" cy="50" r="8" fill="white" />
    </svg>
  </div>
);

const RagDemo = () => {
  const [activeScenario, setActiveScenario] = useState('finance');
  const [messages, setMessages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const chatEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  };

  useEffect(() => {
    setMessages([{ 
      type: 'system', 
      content: "Bonjour ! Je suis connecté à votre base documentaire. Quelle information recherchez-vous aujourd'hui ?" 
    }]);
    
    const scenario = DEMO_SCENARIOS[activeScenario];
    if (!scenario) return;

    const timers = [];
    timers.push(setTimeout(() => {
      setMessages(prev => [...prev, { type: 'user', content: scenario.query }]);
      scrollToBottom();
    }, 800));

    timers.push(setTimeout(() => {
      setIsProcessing(true);
      scrollToBottom();
    }, 1800));

    timers.push(setTimeout(() => {
      setIsProcessing(false);
      setMessages(prev => [...prev, { 
        type: 'ai', 
        content: scenario.response, 
        widget: scenario.widget 
      }]);
      scrollToBottom();
    }, 3500));

    return () => timers.forEach(clearTimeout);
  }, [activeScenario]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isProcessing]);

  return (
    <div className="mt-20 relative max-w-5xl mx-auto">
      <div className="absolute inset-0 bg-cyan-500 blur-[100px] opacity-20 rounded-full"></div>
      <div className="relative bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-700 overflow-hidden shadow-2xl h-[550px] md:h-[500px] flex text-left font-sans flex-col md:flex-row">
        <div className="w-full md:w-64 bg-slate-900/80 border-b md:border-b-0 md:border-r border-slate-700 p-4 flex flex-col gap-4 overflow-y-auto">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 hidden md:block">Base de Connaissances</div>
          <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
            <FileItem icon={<FileText className="w-4 h-4 text-red-400" />} bg="bg-red-500/20" name="Procédure_RH.pdf" info="1.2 MB • Hier" isActive={activeScenario === 'rh'} isScanning={activeScenario === 'rh' && isProcessing} onClick={() => setActiveScenario('rh')} />
            <FileItem icon={<FileBarChart className="w-4 h-4 text-blue-400" />} bg="bg-blue-500/20" name="Factures_Oct.pdf" info="840 KB • 2h" isActive={activeScenario === 'finance'} isScanning={activeScenario === 'finance' && isProcessing} onClick={() => setActiveScenario('finance')} />
            <FileItem icon={<FileSpreadsheet className="w-4 h-4 text-green-400" />} bg="bg-green-500/20" name="Stock_Q4.xlsx" info="2.4 MB • 1j" isActive={activeScenario === 'stock'} isScanning={activeScenario === 'stock' && isProcessing} onClick={() => setActiveScenario('stock')} />
          </div>
          <div className="mt-auto p-3 bg-cyan-900/20 rounded-lg border border-cyan-500/20 hidden md:block">
            <div className="flex items-center gap-2 text-cyan-300 text-xs font-bold mb-1"><Zap className="w-3 h-3" /> Zonia RAG Engine</div>
            <div className="text-[10px] text-cyan-400/70">Cliquez sur un fichier pour tester</div>
          </div>
        </div>
        <div className="flex-1 bg-slate-800/50 p-6 flex flex-col relative">
          <div className="flex items-center justify-between pb-4 border-b border-slate-700 mb-4">
            <div className="flex items-center gap-3">
              <ZoniaAvatar />
              <div><div className="text-sm font-bold text-white">Assistant Zonia</div><div className="text-xs text-green-400 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span> En ligne</div></div>
            </div>
            <div className="text-xs text-slate-500">v2.4.0</div>
          </div>
          <div ref={chatContainerRef} className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-slate-700">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-3 msg-enter ${msg.type === 'user' ? 'flex-row-reverse' : ''}`}>
                {msg.type === 'user' ? <div className="w-8 h-8 rounded-full bg-slate-600 flex-shrink-0 flex items-center justify-center text-white"><User className="w-4 h-4" /></div> : <ZoniaAvatar />}
                <div className={`p-3 text-sm max-w-[85%] shadow-lg ${msg.type === 'user' ? 'bg-cyan-600 text-white rounded-2xl rounded-tr-none shadow-cyan-900/20' : 'bg-slate-700/50 text-slate-300 rounded-2xl rounded-tl-none border border-slate-600'}`}>
                  {msg.content}{msg.widget}
                  {msg.type === 'ai' && msg.widget && (<div className="mt-3 flex gap-2"><button className="text-xs bg-slate-600 hover:bg-slate-500 px-3 py-1.5 rounded-full transition-colors">Voir source</button><button className="text-xs bg-slate-600 hover:bg-slate-500 px-3 py-1.5 rounded-full transition-colors">Exporter</button></div>)}
                </div>
              </div>
            ))}
            {isProcessing && (<div className="flex gap-3 msg-enter"><ZoniaAvatar /><div className="flex items-center gap-2 text-xs text-slate-400 mt-2"><Search className="w-3 h-3 animate-spin" /><span>Analyse du document en cours...</span></div></div>)}
            <div ref={chatEndRef} />
          </div>
          <div className="mt-4 pt-4 border-t border-slate-700 relative">
            <input type="text" disabled placeholder="Cliquez sur un fichier à gauche..." className="w-full bg-slate-900/50 border border-slate-600 rounded-xl px-4 py-3 text-slate-400 text-sm focus:outline-none cursor-not-allowed opacity-70" />
            <button className="absolute right-3 top-6 text-slate-500"><Send className="w-4 h-4" /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

const FileItem = ({ icon, bg, name, info, isActive, isScanning, onClick }) => (
  <div onClick={onClick} className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer min-w-[200px] md:min-w-0 ${isScanning ? 'file-scan overflow-hidden relative' : ''} ${isActive ? 'bg-cyan-500/20 border-cyan-500/60' : 'border-slate-700/50 hover:bg-slate-800'}`}>
    <div className={`${bg} p-2 rounded relative z-10`}>{icon}</div>
    <div className="relative z-10"><div className={`text-sm font-medium ${isActive ? 'text-white' : 'text-slate-300'}`}>{name}</div><div className="text-[10px] text-slate-500">{info}</div></div>
  </div>
);

const ServiceCard = ({ icon, title, desc, bgClass, iconClass }) => (
  <div className="glass-card bg-gradient-to-br from-slate-800/60 to-slate-900/80 p-8 rounded-2xl border border-slate-700/50 hover:border-cyan-500/50 hover:-translate-y-2 transition-all duration-300 group">
    <div className={`w-14 h-14 ${bgClass} rounded-xl flex items-center justify-center mb-6 group-hover:bg-opacity-100 transition-colors`}>
      {React.cloneElement(icon, { className: `w-7 h-7 ${iconClass} group-hover:text-white` })}
    </div>
    <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
    <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
  </div>
);

const BenefitItem = ({ icon, title, desc }) => (
  <div className="flex gap-4">
    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-cyan-900/30 flex items-center justify-center border border-cyan-500/20">
      {React.cloneElement(icon, { className: "text-cyan-400 w-6 h-6" })}
    </div>
    <div><h4 className="text-white font-bold text-lg">{title}</h4><p className="text-slate-400 text-sm">{desc}</p></div>
  </div>
);

const Navbar = () => (
  <nav className="fixed w-full left-0 right-0 z-50 bg-slate-900/40 backdrop-blur-xl border-b border-white/5">
    <div className="w-full px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-20">
        <div className="flex items-center gap-3"><ZoniaLogo /><span className="text-xl font-bold tracking-[0.2em] text-white">ZONIA</span></div>
        <div className="hidden md:block">
          <div className="ml-10 flex items-baseline space-x-8">
            <a href="#services" className="text-slate-300 hover:text-cyan-400 transition-colors px-3 py-2 rounded-md text-sm font-medium">Solutions</a>
            <a href="#benefits" className="text-slate-300 hover:text-cyan-400 transition-colors px-3 py-2 rounded-md text-sm font-medium">Avantages IA</a>
            <a href="#contact" className="bg-white text-slate-900 hover:bg-cyan-50 px-5 py-2.5 rounded-lg text-sm font-bold transition-transform hover:scale-105">Démarrer un projet</a>
          </div>
        </div>
        <div className="md:hidden"><button className="text-gray-300 hover:text-white focus:outline-none p-2"><Menu className="w-6 h-6" /></button></div>
      </div>
    </div>
  </nav>
);

const Vitrine = () => {
  console.log('Vitrine: Composant rendu');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    
    if (!email || !email.includes('@')) {
      setMessage({ type: 'error', text: 'Veuillez entrer un email valide' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage({ type: 'success', text: data.message || 'Votre demande a été envoyée avec succès. Nous vous répondrons sous 24h ouvrées.' });
        setEmail('');
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
    <div className="bg-slate-900 text-slate-200 min-h-screen selection:bg-cyan-500 selection:text-white overflow-x-hidden">
      {/* Intégration des styles via une balise style */}
      <style>{cssStyles}</style>

      <div className="fixed inset-0 bg-grid pointer-events-none z-0" />
      <div className="glow-blob top-[-200px] left-[-200px]" />
      <div className="glow-blob bottom-[-200px] right-[-200px] opacity-50" />
      <Navbar />
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-4 z-10">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/40 backdrop-blur border border-cyan-500/30 text-cyan-300 text-sm font-medium mb-8">
            <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span></span>
            Automatisation sur mesure pour entreprises
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-6 leading-tight">Libérez votre potentiel,<br/><span className="text-gradient">automatisez le reste.</span></h1>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-slate-400">Zonia conçoit des outils d'IA personnalisés pour traiter vos emails, gérer vos documents et piloter votre service client.</p>
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <a href="#contact" className="px-8 py-4 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-cyan-900/40 transition-all hover:-translate-y-1 flex items-center justify-center gap-2">Audit Gratuit <ArrowRight className="w-5 h-5" /></a>
            <a href="#services" className="px-8 py-4 bg-slate-800/40 hover:bg-white/5 backdrop-blur text-white rounded-xl font-bold text-lg border border-white/10 transition-all hover:-translate-y-1">Nos Services</a>
          </div>
          <RagDemo />
        </div>
      </section>
      <section id="services" className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16"><h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Nos Solutions Intelligentes</h2><p className="text-slate-400 max-w-2xl mx-auto">Nous déployons des briques technologiques adaptées à vos flux de travail existants.</p></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ServiceCard icon={<Mail />} title="Traitement d'Emails IA" desc="Analyse, tri et réponse automatique aux emails entrants. Détecte les urgences." bgClass="bg-cyan-900/50 group-hover:bg-cyan-600" iconClass="text-cyan-300" />
            <ServiceCard icon={<CalendarClock />} title="Prise de RDV Automatisée" desc="Synchronisation intelligente avec vos agendas. Réservation sans friction." bgClass="bg-blue-900/50 group-hover:bg-blue-600" iconClass="text-blue-300" />
            <ServiceCard icon={<Bot />} title="Chatbot de Commande" desc="Assistant virtuel pour guider l'achat et vérifier les stocks 24/7." bgClass="bg-sky-900/50 group-hover:bg-sky-600" iconClass="text-sky-300" />
            <ServiceCard icon={<FileCheck />} title="Envoi Auto de Documents" desc="Génération et envoi automatique des factures à votre comptable." bgClass="bg-emerald-900/50 group-hover:bg-emerald-600" iconClass="text-emerald-300" />
            <ServiceCard icon={<Database />} title="Système RAG Documentaire" desc="Interrogez votre Drive. Indexation PDF et docs techniques temps réel." bgClass="bg-orange-900/50 group-hover:bg-orange-600" iconClass="text-orange-300" />
            <div className="glass-card bg-transparent border-dashed border-slate-600 p-8 rounded-2xl hover:border-white transition-colors group">
              <div className="w-14 h-14 bg-slate-800 rounded-xl flex items-center justify-center mb-6 group-hover:bg-white transition-colors"><Sparkles className="w-7 h-7 text-slate-300 group-hover:text-slate-900" /></div>
              <h3 className="text-xl font-bold text-white mb-3">Solution Sur Mesure</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Besoin spécifique ? Nous auditons vos processus pour créer l'outil parfait.</p>
            </div>
          </div>
        </div>
      </section>
      <section id="benefits" className="py-24 relative overflow-hidden z-10 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Pourquoi déléguer les tâches secondaires à l'IA ?</h2>
              <p className="text-slate-400 text-lg mb-8">L'automatisation ne remplace pas l'humain, elle le libère. Concentrez-vous sur la stratégie.</p>
              <div className="space-y-6">
                <BenefitItem icon={<Clock />} title="Gain de Temps Massif" desc="Économisez entre 1h et 3h par jour et par employé sur la saisie de données." />
                <BenefitItem icon={<Infinity />} title="Service Client 24/7" desc="Ne ratez plus aucune opportunité, même la nuit et le week-end." />
                <BenefitItem icon={<TrendingUp />} title="Fiabilité & Scalabilité" desc="Zéro erreur de saisie. Traitez 10 ou 1000 demandes sans surcoût." />
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl blur-lg opacity-30"></div>
              <div className="relative bg-slate-800/60 backdrop-blur-xl rounded-2xl p-8 border border-slate-600">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-800/50 p-6 rounded-xl text-center"><div className="text-4xl font-bold text-cyan-400 mb-2">+40%</div><div className="text-xs uppercase tracking-wider text-slate-400">De Productivité</div></div>
                  <div className="bg-slate-800/50 p-6 rounded-xl text-center"><div className="text-4xl font-bold text-blue-400 mb-2">0</div><div className="text-xs uppercase tracking-wider text-slate-400">Email perdu</div></div>
                  <div className="bg-slate-800/50 p-6 rounded-xl text-center col-span-2"><div className="text-4xl font-bold text-white mb-2">ROI &lt; 3 mois</div><div className="text-xs uppercase tracking-wider text-slate-400">Retour sur investissement moyen</div></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section id="contact" className="py-20 relative z-10">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="bg-slate-800/40 backdrop-blur rounded-3xl p-10 md:p-16 border border-cyan-500/30 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Prêt à digitaliser votre avenir ?</h2>
            <p className="text-slate-300 mb-10 text-lg">Discutons de vos challenges. Nous vous proposerons une démonstration adaptée.</p>
            <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Email Professionnel</label>
                <input 
                  type="email" 
                  placeholder="contact@entreprise.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="w-full bg-slate-900/80 border border-slate-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-cyan-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed" 
                  required
                />
              </div>
              {message.text && (
                <div className={`p-3 rounded-lg text-sm ${
                  message.type === 'success' 
                    ? 'bg-green-500/20 border border-green-500/50 text-green-300' 
                    : 'bg-red-500/20 border border-red-500/50 text-red-300'
                }`}>
                  {message.text}
                </div>
              )}
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-white text-slate-900 font-bold py-4 rounded-lg hover:bg-cyan-50 transition-colors text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></span>
                    Envoi en cours...
                  </>
                ) : (
                  'Demander mon audit gratuit'
                )}
              </button>
              <p className="text-center text-xs text-slate-500 mt-4">Réponse sous 24h ouvrées.</p>
            </form>
          </div>
        </div>
      </section>
      <footer className="border-t border-slate-800 bg-slate-900 pt-16 pb-8 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <div className="flex items-center gap-2 mb-4 md:mb-0"><ZoniaLogo size={30} circleSize={3} /><span className="text-xl font-bold tracking-widest text-white">ZONIA</span></div>
            <div className="flex space-x-6 text-slate-400 text-sm"><a href="#" className="hover:text-white transition-colors">Mentions Légales</a><a href="#" className="hover:text-white transition-colors">Politique de Confidentialité</a><a href="#" className="hover:text-white transition-colors">Support</a></div>
          </div>
          <div className="text-center text-slate-600 text-xs">&copy; 2024 Zonia Systems. Tous droits réservés. Designed by AI.</div>
        </div>
      </footer>
    </div>
  );
};

export default Vitrine;