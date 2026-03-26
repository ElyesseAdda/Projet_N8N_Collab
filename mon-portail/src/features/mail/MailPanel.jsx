import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Mail, Eye, Sparkles, Inbox } from 'lucide-react';
import { Card, SearchInput, Badge, Button } from '../../components/ui';
import MailFolderTabs, { FOLDERS as DEFAULT_FOLDERS } from './components/MailFolderTabs';
import MailListItem from './components/MailListItem';
import MailDetailView from './components/MailDetailView';
import MailAIDraft from './components/MailAIDraft';
import MailMiniChat from './components/MailMiniChat';
import MailThreadHistory from './components/MailThreadHistory';
import ComposeMailModal from './components/ComposeMailModal';
import './MailPanel.css';

/* ═══════════════════════════════════════════════════════════════════════════
   DONNEES DE DEMONSTRATION — seront remplacees par Supabase + webhook IA
   ═══════════════════════════════════════════════════════════════════════════ */

const MOCK_MAILS = [
  {
    id: 'mail-1',
    mailbox: 'recus',
    folder: 'a-faire',
    sender: 'Alice Martin',
    email: 'alice.martin@entreprise.com',
    subject: 'Relance devis Projet Alpha',
    preview: 'Bonjour, je reviens vers vous concernant le devis envoyé la semaine dernière…',
    body: 'Bonjour,\n\nJe reviens vers vous concernant le devis envoyé la semaine dernière pour le Projet Alpha.\nPourriez-vous me confirmer votre accord sur les termes proposés ?\n\nNous aimerions lancer la phase de développement dès la semaine prochaine.\n\nCordialement,\nAlice Martin\nDirectrice de projet',
    date: '09:12',
    fullDate: 'Mardi 25 Mars 2026 — 09:12',
    unread: true,
    hasDraft: true,
    attachments: [
      { id: 'att-1', name: 'Devis_Alpha_v2.pdf', size: '245 Ko' },
    ],
  },
  {
    id: 'mail-2',
    mailbox: 'recus',
    folder: 'transferer',
    sender: 'Thomas Durand',
    email: 'thomas.d@fournisseur.fr',
    subject: 'Nouvelle grille tarifaire 2026',
    preview: 'Veuillez trouver ci-joint notre nouvelle grille tarifaire…',
    body: 'Bonjour,\n\nVeuillez trouver ci-joint notre nouvelle grille tarifaire applicable à compter du 1er avril 2026.\n\nN\'hésitez pas à revenir vers nous pour toute question.\n\nCordialement,\nThomas Durand\nService Commercial',
    date: 'Hier',
    fullDate: 'Lundi 24 Mars 2026 — 14:30',
    unread: false,
    hasDraft: true,
    attachments: [
      { id: 'att-2', name: 'Grille_2026.xlsx', size: '128 Ko' },
    ],
  },
  {
    id: 'mail-3',
    mailbox: 'recus',
    folder: 'facture',
    sender: 'Comptabilité SoftCorp',
    email: 'compta@softcorp.io',
    subject: 'Facture #2026-0142',
    preview: 'Votre facture du mois de mars est disponible…',
    body: 'Bonjour,\n\nVotre facture #2026-0142 d\'un montant de 4 800,00 € TTC est disponible en pièce jointe.\n\nDate d\'échéance : 15 Avril 2026.\n\nCordialement,\nService Comptabilité — SoftCorp',
    date: 'Lun',
    fullDate: 'Lundi 24 Mars 2026 — 08:45',
    unread: true,
    hasDraft: true,
    attachments: [
      { id: 'att-3', name: 'Facture_2026-0142.pdf', size: '312 Ko' },
    ],
  },
  {
    id: 'mail-4',
    mailbox: 'archives',
    folder: 'contrat',
    sender: 'Cabinet Légal Partenaire',
    email: 'juridique@cabinet-legal.fr',
    subject: 'Contrat de prestation — signature requise',
    preview: 'Le contrat est prêt pour signature électronique…',
    body: 'Bonjour,\n\nLe contrat de prestation de service est finalisé.\nMerci de bien vouloir procéder à la signature électronique via le lien sécurisé ci-dessous.\n\nDate limite : 28 Mars 2026.\n\nCordialement,\nCabinet Légal Partenaire',
    date: 'Ven',
    fullDate: 'Vendredi 21 Mars 2026 — 16:20',
    unread: false,
    hasDraft: false,
    attachments: [
      { id: 'att-4', name: 'Contrat_Prestation_2026.pdf', size: '520 Ko' },
    ],
  },
  {
    id: 'mail-5',
    mailbox: 'spam',
    folder: 'document',
    sender: 'Marie Leroy - RH',
    email: 'marie.leroy@entreprise.com',
    subject: 'Demande de justificatif de domicile',
    preview: 'Dans le cadre de la mise à jour de votre dossier…',
    body: 'Bonjour,\n\nDans le cadre de la mise à jour annuelle de votre dossier RH, merci de nous fournir un justificatif de domicile de moins de 3 mois.\n\nVous pouvez le déposer via le portail ou répondre à ce mail.\n\nCordialement,\nMarie Leroy\nService RH',
    date: 'Jeu',
    fullDate: 'Jeudi 20 Mars 2026 — 11:05',
    unread: true,
    hasDraft: true,
    attachments: [],
  },
  {
    id: 'mail-6',
    mailbox: 'envoyes',
    folder: 'a-faire',
    sender: 'Julien Moreau',
    email: 'julien.m@client.com',
    subject: 'Retour sur la maquette V3',
    preview: 'Quelques ajustements demandés sur la page d\'accueil…',
    body: 'Bonjour,\n\nAprès relecture de la maquette V3, voici nos retours :\n- Agrandir le hero section\n- Changer la couleur d\'accroche\n- Ajouter une section témoignages\n\nMerci pour le travail réalisé !\n\nJulien Moreau',
    date: 'Mer',
    fullDate: 'Mercredi 19 Mars 2026 — 17:50',
    unread: false,
    hasDraft: true,
    attachments: [
      { id: 'att-6', name: 'Maquette_V3_retours.png', size: '1.2 Mo' },
    ],
  },
];

const MOCK_DRAFTS = {
  'mail-1': {
    to: 'alice.martin@entreprise.com',
    subject: 'Re: Relance devis Projet Alpha',
    body: 'Bonjour Alice,\n\nMerci pour votre relance. Je confirme que nous avons bien validé les termes du devis pour le Projet Alpha.\n\nNous sommes disponibles pour démarrer la phase de développement dès lundi prochain.\n\nJe vous envoie en pièce jointe le planning prévisionnel mis à jour.\n\nCordialement,',
  },
  'mail-2': {
    to: 'thomas.d@fournisseur.fr',
    subject: 'Re: Nouvelle grille tarifaire 2026',
    body: 'Bonjour Thomas,\n\nBien reçu, merci pour l\'envoi de la nouvelle grille.\nJe transmets au service achat pour analyse. Nous reviendrons vers vous d\'ici fin de semaine.\n\nCordialement,',
  },
  'mail-3': {
    to: 'compta@softcorp.io',
    subject: 'Re: Facture #2026-0142',
    body: 'Bonjour,\n\nBien reçu. La facture a été transmise à notre service comptabilité pour traitement.\nLe paiement sera effectué avant la date d\'échéance.\n\nCordialement,',
  },
  'mail-5': {
    to: 'marie.leroy@entreprise.com',
    subject: 'Re: Demande de justificatif de domicile',
    body: 'Bonjour Marie,\n\nVous trouverez ci-joint le justificatif de domicile demandé (facture EDF de février 2026).\n\nN\'hésitez pas si d\'autres documents sont nécessaires.\n\nCordialement,',
  },
  'mail-6': {
    to: 'julien.m@client.com',
    subject: 'Re: Retour sur la maquette V3',
    body: 'Bonjour Julien,\n\nMerci pour ces retours détaillés. Nous prenons bien note des 3 points :\n1. Hero section plus grande\n2. Nouvelle couleur d\'accroche\n3. Section témoignages\n\nNous vous envoyons la V4 d\'ici mercredi.\n\nCordialement,',
  },
};

const MOCK_DRIVE_FILES = [
  { id: 'drive-1', name: 'Planning_Projet_Alpha.xlsx', size: '89 Ko' },
  { id: 'drive-2', name: 'Justificatif_domicile_022026.pdf', size: '1.4 Mo' },
  { id: 'drive-3', name: 'Presentation_Q1_2026.pptx', size: '3.2 Mo' },
  { id: 'drive-4', name: 'CGV_2026.pdf', size: '156 Ko' },
  { id: 'drive-5', name: 'Budget_previsionnel.xlsx', size: '210 Ko' },
];

const MOCK_THREAD = [
  { id: 'th-1', author: 'Alice Martin', date: '18 Mars — 10:30', preview: 'Bonjour, voici le devis initial pour le Projet Alpha…' },
  { id: 'th-2', author: 'Moi', date: '19 Mars — 09:15', preview: 'Merci Alice, quelques ajustements nécessaires sur les postes 3 et 5…' },
  { id: 'th-3', author: 'Alice Martin', date: '20 Mars — 14:45', preview: 'Voici la version révisée avec les modifications demandées…' },
  { id: 'th-4', author: 'Alice Martin', date: '25 Mars — 09:12', preview: 'Relance — avez-vous pu valider ?' },
];

const MAILBOX_FILTERS = [
  { id: 'recus', label: 'Recus' },
  { id: 'non-lus', label: 'Non lus' },
  { id: 'envoyes', label: 'Envoyes' },
  { id: 'brouillons', label: 'Brouillons' },
  { id: 'spam', label: 'Spam' },
  { id: 'archives', label: 'Archives' },
];

/* ═══════════════════════════════════════════════════════════════════════════ */

const MailPanel = () => {
  const [activeFolder, setActiveFolder] = useState('tout');
  const [selectedMailId, setSelectedMailId] = useState('mail-1');
  const [activeMailbox, setActiveMailbox] = useState('recus');
  const [searchQuery, setSearchQuery] = useState('');
  const [folders, setFolders] = useState(DEFAULT_FOLDERS);
  const [viewMode, setViewMode] = useState('received');
  const [drafts, setDrafts] = useState(MOCK_DRAFTS);
  const [selectedDriveFiles, setSelectedDriveFiles] = useState(['drive-1']);
  const [driveFiles, setDriveFiles] = useState(MOCK_DRIVE_FILES);
  const [classifiedAttachmentIds, setClassifiedAttachmentIds] = useState([]);
  const [classifiedAttachmentPaths, setClassifiedAttachmentPaths] = useState({});
  const [threadExpanded, setThreadExpanded] = useState(false);
  const [viewTransition, setViewTransition] = useState(false);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [chatPrefillContext, setChatPrefillContext] = useState(null);
  const [chatPrefillToken, setChatPrefillToken] = useState(0);
  const viewContentRef = useRef(null);

  const folderCounts = useMemo(() => {
    const counts = Object.fromEntries(folders.map((folder) => [folder.id, 0]));
    MOCK_MAILS.forEach((m) => {
      counts[m.folder] = (counts[m.folder] || 0) + 1;
    });
    counts.tout = MOCK_MAILS.length;
    return counts;
  }, [folders]);

  const mailboxCounts = useMemo(
    () =>
      MAILBOX_FILTERS.reduce((acc, mailbox) => {
        acc[mailbox.id] = mailbox.id === 'brouillons'
          ? MOCK_MAILS.filter((mail) => mail.hasDraft).length
          : mailbox.id === 'non-lus'
            ? MOCK_MAILS.filter((mail) => mail.unread).length
          : MOCK_MAILS.filter((mail) => mail.mailbox === mailbox.id).length;
        return acc;
      }, {}),
    []
  );

  const mailboxTotalCount = useMemo(
    () => Object.values(mailboxCounts).reduce((sum, count) => sum + count, 0),
    [mailboxCounts]
  );

  const filteredMails = useMemo(() => {
    let list = activeMailbox === 'brouillons'
      ? MOCK_MAILS.filter((m) => m.hasDraft)
      : activeMailbox === 'non-lus'
        ? MOCK_MAILS.filter((m) => m.unread)
      : MOCK_MAILS.filter((m) => m.mailbox === activeMailbox);
    list = activeFolder === 'tout' ? list : list.filter((m) => m.folder === activeFolder);
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (m) =>
          m.sender.toLowerCase().includes(q) ||
          m.subject.toLowerCase().includes(q) ||
          m.preview.toLowerCase().includes(q)
      );
    }
    return list;
  }, [activeMailbox, activeFolder, searchQuery]);

  const selectedMail = MOCK_MAILS.find((m) => m.id === selectedMailId) || null;
  const currentDraft = selectedMailId ? drafts[selectedMailId] || null : null;

  const handleViewSwitch = (mode) => {
    if (mode === viewMode) return;
    setViewTransition(true);
    setTimeout(() => {
      setViewMode(mode);
      setViewTransition(false);
    }, 150);
  };

  const handleDraftChange = (newDraft) => {
    setDrafts((prev) => ({ ...prev, [selectedMailId]: newDraft }));
  };

  const handleFileToggle = (fileId) => {
    setSelectedDriveFiles((prev) =>
      prev.includes(fileId) ? prev.filter((id) => id !== fileId) : [...prev, fileId]
    );
  };

  const handleClassifyAttachmentToDrive = (mailId, attachment) => {
    if (!attachment?.id) return;
    if (classifiedAttachmentIds.includes(attachment.id)) return;
    const mail = MOCK_MAILS.find((item) => item.id === mailId);
    const senderSlug = (mail?.sender || 'contact')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const targetPath = `/Drive/Mails/${mail?.mailbox || 'recus'}/${mail?.folder || 'general'}/${senderSlug}/${attachment.name}`;

    setClassifiedAttachmentIds((prev) => [...prev, attachment.id]);
    setClassifiedAttachmentPaths((prev) => ({
      ...prev,
      [attachment.id]: targetPath,
    }));
    setDriveFiles((prev) => {
      const alreadyExists = prev.some((file) => file.id === attachment.id);
      if (alreadyExists) return prev;
      return [...prev, { id: attachment.id, name: attachment.name, size: attachment.size }];
    });

    // FUTURE INTEGRATION NOTE:
    // Ici on branchera l'appel backend/Supabase pour classer physiquement le fichier
    // dans le bon chemin Drive (ex: mailbox/folder/contact/date), avec:
    // 1) resolution du dossier cible
    // 2) upload/deplacement reelle de la piece jointe
    // 3) persistence des metadonnees (mailId, attachmentId, chemin, timestamp)
    // 4) gestion d'erreur + rollback UI si l'operation echoue
    console.log('Classement Drive simulé:', { mailId, attachment });
  };

  const handleQuickAction = (mailId, action) => {
    if (action === 'send-to-chat') {
      const mail = MOCK_MAILS.find((item) => item.id === mailId);
      if (!mail) return;
      setChatPrefillContext({
        contact: mail.sender,
        dateTime: mail.fullDate,
        subject: mail.subject,
      });
      setChatPrefillToken((value) => value + 1);
      return;
    }
    console.log(`Quick action: ${action} on ${mailId}`);
  };

  const handleCreateFolder = (label) => {
    const baseId = label
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40) || `section-${Date.now()}`;

    let uniqueId = baseId;
    let i = 1;
    while (folders.some((folder) => folder.id === uniqueId)) {
      uniqueId = `${baseId}-${i}`;
      i += 1;
    }

    const newFolder = {
      id: uniqueId,
      label,
      icon: Inbox,
      badgeVariant: 'default',
    };

    setFolders((prev) => [...prev, newFolder]);
    return uniqueId;
  };

  const handleRenameFolder = (folderId, newLabel) => {
    setFolders((prev) =>
      prev.map((folder) => (folder.id === folderId ? { ...folder, label: newLabel } : folder))
    );
  };

  const handleSend = () => {
    alert('Envoi simulé — sera connecté à Supabase + webhook');
  };

  const handleRegenerate = () => {
    alert('Régénération IA simulée — sera connecté au webhook IA');
  };

  const handleCreateMessage = () => {
    setIsComposeOpen(true);
  };

  return (
    <section className="mail-panel">
      <header className="mail-panel-header">
        <div className="mail-panel-header-left">
          <Mail size={20} className="mail-panel-header-icon" />
          <div>
            <div className="mail-panel-title-row">
              <h2 className="mail-panel-title">Mes Mails</h2>
              {mailboxTotalCount > 0 && (
                <Badge variant="cyan" className="mail-panel-unread-badge">
                  {mailboxTotalCount} au total
                </Badge>
              )}
            </div>
            <div className="mail-panel-subtitle">Tri automatique • Réponses assistées</div>
          </div>
        </div>
        <div className="mail-mailbox-filters mail-mailbox-filters--header">
          {MAILBOX_FILTERS.map((mailbox) => (
            <button
              key={mailbox.id}
              type="button"
              className={`mail-mailbox-filter-btn ${activeMailbox === mailbox.id ? 'mail-mailbox-filter-btn--active' : ''}`}
              onClick={() => setActiveMailbox(mailbox.id)}
            >
              <span>{mailbox.label}</span>
              <Badge variant={activeMailbox === mailbox.id ? 'cyan' : 'default'} className="mail-mailbox-filter-badge">
                {mailboxCounts[mailbox.id] || 0}
              </Badge>
            </button>
          ))}
        </div>
      </header>

      <div className="mail-body">
        <Card className="mail-col mail-col--left">
          <MailFolderTabs
            folders={folders}
            activeFolder={activeFolder}
            onFolderChange={setActiveFolder}
            folderCounts={folderCounts}
            onCreateFolder={handleCreateFolder}
            onRenameFolder={handleRenameFolder}
          />
          <div className="mail-list-search-wrap">
            <SearchInput
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un mail..."
              size="sm"
            />
          </div>
          <div className="mail-list-scroll">
            {filteredMails.length === 0 && (
              <div className="mail-list-empty">Aucun mail dans ce dossier</div>
            )}
            {filteredMails.map((mail) => (
              <MailListItem
                key={mail.id}
                mail={mail}
                isSelected={mail.id === selectedMailId}
                onClick={() => { setSelectedMailId(mail.id); setViewMode('received'); }}
                onQuickAction={handleQuickAction}
              />
            ))}
          </div>
          <div className="mail-list-compose-bar">
            <Button
              variant="primary"
              className="mail-list-compose-btn"
              onClick={handleCreateMessage}
            >
              Nouveau message
            </Button>
          </div>
        </Card>

        <Card className="mail-col mail-col--center">
          {selectedMail ? (
            <>
              <div className="mail-view-toggle">
                <button
                  type="button"
                  className={`mail-view-toggle-btn ${viewMode === 'received' ? 'mail-view-toggle-btn--active' : ''}`}
                  onClick={() => handleViewSwitch('received')}
                >
                  <Eye size={14} />
                  Mail reçu
                </button>
                <button
                  type="button"
                  className={`mail-view-toggle-btn ${viewMode === 'draft' ? 'mail-view-toggle-btn--active' : ''}`}
                  onClick={() => handleViewSwitch('draft')}
                  disabled={!currentDraft}
                >
                  <Sparkles size={14} />
                  Réponse Zonia
                  {!currentDraft && <span className="mail-view-toggle-na">—</span>}
                </button>
              </div>

              <div className={`mail-center-layout ${threadExpanded ? 'mail-center-layout--history-open' : ''}`}>
                <div
                  ref={viewContentRef}
                  className={`mail-center-scroll ${viewTransition ? 'mail-center-scroll--transitioning' : ''}`}
                >
                  {viewMode === 'received' ? (
                    <MailDetailView
                      mail={selectedMail}
                      classifiedAttachmentIds={classifiedAttachmentIds}
                      classifiedAttachmentPaths={classifiedAttachmentPaths}
                      onClassifyAttachment={handleClassifyAttachmentToDrive}
                    />
                  ) : (
                    currentDraft && (
                      <MailAIDraft
                        draft={currentDraft}
                        onDraftChange={handleDraftChange}
                        driveFiles={driveFiles}
                        suggestedFiles={selectedMail?.attachments || []}
                        selectedFiles={selectedDriveFiles}
                        onFileToggle={handleFileToggle}
                        onSend={handleSend}
                        onRegenerate={handleRegenerate}
                      />
                    )
                  )}
                </div>

                <div className="mail-center-history">
                  <MailThreadHistory
                    thread={MOCK_THREAD}
                    isExpanded={threadExpanded}
                    onToggle={() => setThreadExpanded((v) => !v)}
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="mail-center-empty">
              <div className="mail-center-empty-icon">
                <Inbox size={48} />
              </div>
              <p className="mail-center-empty-title">Sélectionnez un mail</p>
              <p className="mail-center-empty-desc">
                Choisissez un mail dans la liste pour consulter son contenu et la réponse IA suggérée
              </p>
            </div>
          )}
        </Card>
      </div>

      <div className="mail-bottom-chat-wrap">
        <MailMiniChat prefillContext={chatPrefillContext} prefillToken={chatPrefillToken} />
      </div>

      <ComposeMailModal
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
      />
    </section>
  );
};

export default MailPanel;
