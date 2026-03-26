import React, { useState, useEffect, useRef } from 'react';
// L'import externe est supprimé pour éviter l'erreur de compilation dans l'environnement de prévisualisation
// import './Vitrine.css'; 
import { 
  Menu, ArrowRight, Mail, CalendarClock, Bot, FileCheck, 
  Database, Sparkles, Clock, Infinity, TrendingUp, FileText, 
  FileBarChart, FileSpreadsheet, Zap, User, Search, Check, 
  AlertCircle, Send, X, HelpCircle, Shield, FileText as FileTextIcon
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
    background: radial-gradient(circle, rgba(25, 228, 250, 0.15) 0%, rgba(15, 23, 42, 0) 70%);
    border-radius: 50%;
    pointer-events: none;
    z-index: 0;
  }

  /* Text Gradient Animation - Gold -> Cyan -> Gold */
  .text-gradient {
    background: linear-gradient(to right, #FFD700, #19E4FA, #FFD700);
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

// --- DONNÉES DE LA DÉMO RAG ---
const DEMO_SCENARIOS = {
  finance: {
    id: 'finance',
    fileName: 'Factures_Oct.pdf',
    fileType: 'pdf-blue',
    query: "Quel est le total des factures fournisseurs pour Octobre ?",
    response: (
      <span>
        D'après le fichier <span className="text-[#19E4FA] font-medium bg-[#19E4FA]/10 px-1 rounded">Factures_Oct.pdf</span>, le total des factures fournisseurs s'élève à <strong>14 250,00 €</strong>.
      </span>
    ),
    widget: (
      <div className="bg-slate-800 rounded-lg p-3 border border-slate-600 mt-2 text-xs font-mono animate-fade-in">
        <div className="flex justify-between text-slate-500 mb-1 border-b border-slate-700 pb-1"><span>Poste</span><span>Montant</span></div>
        <div className="flex justify-between text-slate-300 py-1"><span>Hébergement Web</span><span>1 200 €</span></div>
        <div className="flex justify-between text-slate-300 py-1"><span>Licences Logiciels</span><span>4 500 €</span></div>
        <div className="flex justify-between text-slate-300 py-1"><span>Prestataires</span><span>8 550 €</span></div>
        <div className="flex justify-between text-[#FFD700] font-bold pt-2 border-t border-slate-700 mt-1"><span>TOTAL</span><span>14 250 €</span></div>
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
        Le document <span className="text-[#FFD700] font-medium bg-[#FFD700]/10 px-1 rounded">Procédure_RH.pdf</span> stipule que le télétravail doit être validé 48h à l'avance.
      </span>
    ),
    widget: (
      <div className="bg-slate-800 rounded-lg p-3 border border-slate-600 mt-2 text-xs animate-fade-in">
        <div className="text-slate-500 uppercase font-bold mb-2 text-[10px]">Conditions Requises</div>
        <ul className="space-y-1 text-slate-300">
          <li className="flex items-center gap-2"><Check className="w-3 h-3 text-[#19E4FA]" /> Validation Manager</li>
          <li className="flex items-center gap-2"><Check className="w-3 h-3 text-[#19E4FA]" /> VPN Configuré</li>
          <li className="flex items-center gap-2"><AlertCircle className="w-3 h-3 text-[#FFD700]" /> Jours: Mar / Jeu</li>
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
        Le fichier <span className="text-[#19E4FA] font-medium bg-[#19E4FA]/10 px-1 rounded">Stock_Q4.xlsx</span> indique qu'il reste <strong>12 unités</strong>.
      </span>
    ),
    widget: (
      <div className="bg-slate-800 rounded-lg p-3 border border-slate-600 mt-2 text-xs animate-fade-in">
        <div className="flex items-center justify-between mb-2">
          <span className="text-slate-400">Référence</span>
          <span className="text-white font-mono">MON-27-4K</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2 mb-1">
          <div className="bg-[#19E4FA] h-2 rounded-full" style={{ width: '20%' }}></div>
        </div>
        <div className="flex justify-between text-[10px]">
          <span className="text-[#FFD700] font-bold">Niveau Bas (12)</span>
          <span className="text-slate-500">Seuil: 15</span>
        </div>
      </div>
    )
  }
};

const ZoniaLogo = ({ size = 40, circleSize = 5 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <path d="M 25 25 H 75 L 25 75 H 75 L 25 25 Z" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="50" cy="50" r={circleSize} fill="#FFD700" />
  </svg>
);

const ZoniaAvatar = () => (
  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#FFD700] to-[#19E4FA] flex-shrink-0 flex items-center justify-center shadow-lg">
    <svg width="20" height="20" viewBox="0 0 100 100" fill="none">
        <path d="M 25 25 H 75 L 25 75 H 75 L 25 25 Z" stroke="black" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="50" cy="50" r="8" fill="black" />
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
      <div className="absolute inset-0 bg-[#19E4FA] blur-[120px] opacity-10 rounded-full"></div>
      <div className="relative bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-700 overflow-hidden shadow-2xl h-[550px] md:h-[500px] flex text-left font-sans flex-col md:flex-row">
        <div className="w-full md:w-64 bg-slate-900/80 border-b md:border-b-0 md:border-r border-slate-700 p-4 flex flex-col gap-4 overflow-y-auto">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 hidden md:block">Base de Connaissances</div>
          <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
            <FileItem icon={<FileText className="w-4 h-4 text-red-400" />} bg="bg-red-500/20" name="Procédure_RH.pdf" info="1.2 MB • Hier" isActive={activeScenario === 'rh'} isScanning={activeScenario === 'rh' && isProcessing} onClick={() => setActiveScenario('rh')} />
            <FileItem icon={<FileBarChart className="w-4 h-4 text-blue-400" />} bg="bg-blue-500/20" name="Factures_Oct.pdf" info="840 KB • 2h" isActive={activeScenario === 'finance'} isScanning={activeScenario === 'finance' && isProcessing} onClick={() => setActiveScenario('finance')} />
            <FileItem icon={<FileSpreadsheet className="w-4 h-4 text-green-400" />} bg="bg-green-500/20" name="Stock_Q4.xlsx" info="2.4 MB • 1j" isActive={activeScenario === 'stock'} isScanning={activeScenario === 'stock' && isProcessing} onClick={() => setActiveScenario('stock')} />
          </div>
          <div className="mt-auto p-3 bg-slate-800 rounded-lg border border-slate-700 hidden md:block">
            <div className="flex items-center gap-2 text-[#FFD700] text-xs font-bold mb-1"><Zap className="w-3 h-3" /> Zonia RAG Engine</div>
            <div className="text-[10px] text-slate-400">Cliquez sur un fichier pour tester</div>
          </div>
        </div>
        <div className="flex-1 bg-slate-800/50 p-6 flex flex-col relative">
          <div className="flex items-center justify-between pb-4 border-b border-slate-700 mb-4">
            <div className="flex items-center gap-3">
              <ZoniaAvatar />
              <div><div className="text-sm font-bold text-white">Assistant Zonia</div><div className="text-xs text-[#19E4FA] flex items-center gap-1 font-medium"><span className="w-1.5 h-1.5 bg-[#19E4FA] rounded-full shadow-[0_0_5px_#19E4FA]"></span> En ligne</div></div>
            </div>
            <div className="text-xs text-slate-500">v2.4.0</div>
          </div>
          <div ref={chatContainerRef} className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-slate-700">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-3 msg-enter ${msg.type === 'user' ? 'flex-row-reverse' : ''}`}>
                {msg.type === 'user' ? <div className="w-8 h-8 rounded-full bg-slate-600 flex-shrink-0 flex items-center justify-center text-white"><User className="w-4 h-4" /></div> : <ZoniaAvatar />}
                <div className={`p-3 text-sm max-w-[85%] shadow-lg ${msg.type === 'user' ? 'bg-[#19E4FA] text-slate-900 font-medium rounded-2xl rounded-tr-none shadow-lg shadow-[#19E4FA]/20' : 'bg-slate-700/50 text-slate-300 rounded-2xl rounded-tl-none border border-slate-600'}`}>
                  {msg.content}{msg.widget}
                  {msg.type === 'ai' && msg.widget && (<div className="mt-3 flex gap-2"><button className="text-xs bg-slate-600 hover:bg-slate-500 px-3 py-1.5 rounded-full transition-colors">Voir source</button><button className="text-xs bg-slate-600 hover:bg-slate-500 px-3 py-1.5 rounded-full transition-colors">Exporter</button></div>)}
                </div>
              </div>
            ))}
            {isProcessing && (<div className="flex gap-3 msg-enter"><ZoniaAvatar /><div className="flex items-center gap-2 text-xs text-[#FFD700] mt-2"><Search className="w-3 h-3 animate-spin" /><span>Analyse en cours...</span></div></div>)}
            <div ref={chatEndRef} />
          </div>
          <div className="mt-4 pt-4 border-t border-slate-700 relative">
            <input type="text" disabled placeholder="Cliquez sur un fichier à gauche..." className="w-full bg-slate-900/50 border border-slate-600 rounded-xl px-4 py-3 text-slate-400 text-sm focus:outline-none cursor-not-allowed opacity-70" />
            <button className="absolute right-3 top-6 text-[#FFD700]"><Send className="w-4 h-4" /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

const FileItem = ({ icon, bg, name, info, isActive, isScanning, onClick }) => (
  <div onClick={onClick} className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer min-w-[200px] md:min-w-0 ${isScanning ? 'file-scan overflow-hidden relative' : ''} ${isActive ? 'bg-[#FFD700]/5 border-[#FFD700]' : 'border-slate-700/50 hover:bg-slate-800'}`}>
    <div className={`${bg} p-2 rounded relative z-10`}>{icon}</div>
    <div className="relative z-10"><div className={`text-sm font-medium ${isActive ? 'text-white' : 'text-slate-300'}`}>{name}</div><div className="text-[10px] text-slate-500">{info}</div></div>
  </div>
);

const ServiceCard = ({ icon, title, desc, bgClass, iconClass }) => (
  <div className="glass-card bg-gradient-to-br from-slate-800/60 to-slate-900/80 p-8 rounded-2xl border border-slate-700/50 hover:border-[#FFD700] hover:-translate-y-1 transition-all duration-300 group hover:shadow-[0_10px_30px_-10px_rgba(255,215,0,0.15)]">
    <div className={`w-14 h-14 ${bgClass} rounded-xl flex items-center justify-center mb-6 group-hover:bg-opacity-100 transition-colors`}>
      {React.cloneElement(icon, { className: `w-7 h-7 ${iconClass} group-hover:text-white` })}
    </div>
    <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
    <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
  </div>
);

const BenefitItem = ({ icon, title, desc }) => (
  <div className="flex gap-4">
    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#19E4FA]/10 flex items-center justify-center border border-[#19E4FA]/30">
      {React.cloneElement(icon, { className: "text-[#19E4FA] w-6 h-6" })}
    </div>
    <div><h4 className="text-white font-bold text-lg">{title}</h4><p className="text-slate-400 text-sm">{desc}</p></div>
  </div>
);

const Navbar = () => (
  <nav className="fixed w-full left-0 right-0 z-50 glass-panel border-b border-white/5">
    <div className="w-full px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-20">
        <div className="flex items-center gap-3"><ZoniaLogo /><span className="text-xl font-bold tracking-[0.2em] text-white">ZONIA</span></div>
        <div className="hidden md:block">
          <div className="ml-10 flex items-baseline space-x-8">
            <a href="#services" className="text-slate-300 hover:text-[#FFD700] transition-colors px-3 py-2 rounded-md text-sm font-medium">Solutions</a>
            <a href="#benefits" className="text-slate-300 hover:text-[#FFD700] transition-colors px-3 py-2 rounded-md text-sm font-medium">Avantages IA</a>
            <a href="#contact" className="bg-[#19E4FA] hover:bg-[#FFD700] text-slate-900 px-5 py-2.5 rounded-lg text-sm font-bold transition-all hover:scale-105 shadow-[0_0_20px_-5px_rgba(25,228,250,0.5)] hover:shadow-[0_0_20px_-5px_rgba(255,215,0,0.5)]">Démarrer un projet</a>
          </div>
        </div>
        <div className="md:hidden"><button className="text-gray-300 hover:text-white focus:outline-none p-2"><Menu className="w-6 h-6" /></button></div>
      </div>
    </div>
  </nav>
);

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

const Vitrine = () => {
  console.log('Vitrine: Composant rendu');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [openModal, setOpenModal] = useState(null); // 'legal', 'privacy', 'support', null

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
    <div className="bg-slate-900 text-slate-200 min-h-screen selection:bg-[#FFD700] selection:text-slate-900 overflow-x-hidden">
      {/* Intégration des styles via une balise style */}
      <style>{cssStyles}</style>

      <div className="fixed inset-0 bg-grid pointer-events-none z-0" />
      <div className="glow-blob top-[-200px] left-[-200px]" />
      <div className="glow-blob bottom-[-200px] right-[-200px]" style={{ background: 'radial-gradient(circle, rgba(255, 215, 0, 0.05) 0%, rgba(15, 23, 42, 0) 70%)' }} />
      <Navbar />
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-4 z-10">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border border-[#FFD700]/30 text-[#FFD700] text-sm font-medium mb-8">
            <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FFD700] opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-[#FFD700]"></span></span>
            Automatisation sur mesure pour entreprises
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-6 leading-tight">Libérez votre potentiel,<br/><span className="text-gradient">automatisez le reste.</span></h1>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-slate-400">Zonia conçoit des outils d'IA personnalisés pour traiter vos emails, gérer vos documents et piloter votre service client.</p>
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <a href="#contact" className="px-8 py-4 bg-[#19E4FA] hover:bg-[#FFD700] text-slate-900 rounded-xl font-bold text-lg shadow-[0_0_20px_-5px_rgba(25,228,250,0.5)] hover:shadow-[0_0_20px_-5px_rgba(255,215,0,0.5)] transition-all hover:-translate-y-1 flex items-center justify-center gap-2">Audit Gratuit <ArrowRight className="w-5 h-5" /></a>
            <a href="#services" className="px-8 py-4 glass-panel hover:bg-white/5 text-white rounded-xl font-bold text-lg border border-white/10 hover:border-[#FFD700]/50 hover:text-[#FFD700] transition-all hover:-translate-y-1">Nos Services</a>
          </div>
          <RagDemo />
        </div>
      </section>
      <section id="services" className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16"><h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Nos Solutions Intelligentes</h2><p className="text-slate-400 max-w-2xl mx-auto">Nous déployons des briques technologiques adaptées à vos flux de travail existants.</p></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ServiceCard icon={<Mail />} title="Traitement d'Emails IA" desc="Analyse, tri et réponse automatique aux emails entrants. Détecte les urgences et prépare les brouillons." bgClass="bg-[#19E4FA]/10 group-hover:bg-[#19E4FA] border border-[#19E4FA]/20" iconClass="text-[#19E4FA] group-hover:text-slate-900" />
            <ServiceCard icon={<CalendarClock />} title="Prise de RDV Automatisée" desc="Synchronisation intelligente avec vos agendas. Vos clients réservent sans friction, sans allers-retours." bgClass="bg-[#FFD700]/10 group-hover:bg-[#FFD700] border border-[#FFD700]/20" iconClass="text-[#FFD700] group-hover:text-slate-900" />
            <ServiceCard icon={<Bot />} title="Chatbot de Commande" desc="Assistant virtuel capable de guider l'achat, vérifier les stocks et valider les commandes 24/7." bgClass="bg-[#19E4FA]/10 group-hover:bg-[#19E4FA] border border-[#19E4FA]/20" iconClass="text-[#19E4FA] group-hover:text-slate-900" />
            <ServiceCard icon={<FileCheck />} title="Envoi Auto de Documents" desc="Génération et envoi automatique des factures à votre comptable et aux clients." bgClass="bg-[#FFD700]/10 group-hover:bg-[#FFD700] border border-[#FFD700]/20" iconClass="text-[#FFD700] group-hover:text-slate-900" />
            <ServiceCard icon={<Database />} title="Système RAG Documentaire" desc="&quot;Parlez&quot; à votre Drive. Notre IA indexe vos PDF et docs techniques pour répondre instantanément." bgClass="bg-[#19E4FA]/10 group-hover:bg-[#19E4FA] border border-[#19E4FA]/20" iconClass="text-[#19E4FA] group-hover:text-slate-900" />
            <div className="glass-card bg-transparent border-dashed border-slate-600 p-8 rounded-2xl hover:border-[#FFD700] transition-colors group">
              <div className="w-14 h-14 bg-slate-800 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#FFD700] transition-colors"><Sparkles className="w-7 h-7 text-slate-300 group-hover:text-slate-900" /></div>
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#FFD700] transition-colors">Solution Sur Mesure</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Vous avez un besoin spécifique ? Nous auditons vos processus pour créer l'outil parfait.</p>
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
                <BenefitItem icon={<Clock />} title="Gain de Temps Massif" desc="Économisez entre 1h et 3h par jour sur la saisie de données." />
                <BenefitItem icon={<Infinity />} title="Service Client 24/7" desc="Ne ratez plus aucune opportunité. Vos chatbots répondent aux prospects instantanément." />
                <BenefitItem icon={<TrendingUp />} title="Fiabilité & Scalabilité" desc="Zéro erreur de saisie. Capacité à traiter 1000 demandes simultanément sans surcoût." />
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-[#FFD700] to-[#19E4FA] rounded-2xl blur-lg opacity-20"></div>
              <div className="relative bg-slate-800/60 backdrop-blur-xl rounded-2xl p-8 border border-slate-600">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-800/50 p-6 rounded-xl text-center border border-slate-700"><div className="text-4xl font-bold text-[#19E4FA] mb-2">+40%</div><div className="text-xs uppercase tracking-wider text-slate-400">De Productivité</div></div>
                  <div className="bg-slate-800/50 p-6 rounded-xl text-center border border-slate-700"><div className="text-4xl font-bold text-[#FFD700] mb-2">0</div><div className="text-xs uppercase tracking-wider text-slate-400">Email perdu</div></div>
                  <div className="bg-slate-800/50 p-6 rounded-xl text-center col-span-2 border border-slate-700"><div className="text-4xl font-bold text-white mb-2">ROI &lt; 3 mois</div><div className="text-xs uppercase tracking-wider text-slate-400">Retour sur investissement moyen</div></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section id="contact" className="py-20 relative z-10">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="glass-panel rounded-3xl p-10 md:p-16 border border-[#FFD700]/30 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#FFD700] to-transparent"></div>
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
                  className="w-full bg-slate-900/80 border border-slate-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-[#19E4FA] outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed" 
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
                className="w-full bg-[#19E4FA] hover:bg-[#FFD700] text-slate-900 font-bold py-4 rounded-lg transition-all text-lg shadow-[0_0_20px_-5px_rgba(25,228,250,0.5)] hover:shadow-[0_0_20px_-5px_rgba(255,215,0,0.5)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
            <div className="flex items-center gap-2 mb-4 md:mb-0"><ZoniaLogo size={30} circleSize={5} /><span className="text-xl font-bold tracking-widest text-white">ZONIA</span></div>
            <div className="flex space-x-6 text-slate-400 text-sm">
              <button onClick={() => setOpenModal('legal')} className="hover:text-[#FFD700] transition-colors">Mentions Légales</button>
              <button onClick={() => setOpenModal('privacy')} className="hover:text-[#FFD700] transition-colors">Politique de Confidentialité</button>
              <button onClick={() => setOpenModal('support')} className="hover:text-[#FFD700] transition-colors">Support</button>
            </div>
          </div>
          <div className="text-center text-slate-600 text-xs">&copy; 2024 Zonia Systems. Tous droits réservés.          </div>
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
                <h4 className="font-bold text-white mb-2">Comment puis-je demander une démonstration ?</h4>
                <p className="text-sm text-slate-300">
                  Utilisez le formulaire de contact sur la page d'accueil ou envoyez-nous un email à 
                  <a href="mailto:zonia.ai.pro@gmail.com" className="text-[#19E4FA] hover:underline ml-1">zonia.ai.pro@gmail.com</a>. 
                  Nous vous répondrons sous 24h ouvrées.
                </p>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-4">
                <h4 className="font-bold text-white mb-2">Quels types de solutions proposez-vous ?</h4>
                <p className="text-sm text-slate-300">
                  Nous proposons des solutions d'automatisation sur mesure : traitement d'emails IA, chatbots, 
                  systèmes RAG documentaires, prise de rendez-vous automatisée, et bien plus. 
                  Consultez notre section "Solutions" pour plus de détails.
                </p>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-4">
                <h4 className="font-bold text-white mb-2">Combien de temps prend l'implémentation ?</h4>
                <p className="text-sm text-slate-300">
                  Le délai dépend de la complexité de votre projet. Pour une solution standard, comptez 2 à 4 semaines. 
                  Pour des projets sur mesure, nous établissons un planning personnalisé lors de l'audit initial.
                </p>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-4">
                <h4 className="font-bold text-white mb-2">Proposez-vous un support après l'installation ?</h4>
                <p className="text-sm text-slate-300">
                  Oui, nous proposons différents niveaux de support : maintenance, formation, et assistance technique. 
                  Contactez-nous pour connaître nos offres de support.
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