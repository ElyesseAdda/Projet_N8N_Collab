# Structure Projet & Bonnes Pratiques – Zonia Platform

> **Objectif** : Ce document est la reference unique pour tout developpeur ou IA qui intervient sur le projet.
> Il decrit l'arborescence, les conventions de nommage, le systeme de design (UI Kit),
> et la marche a suivre pas-a-pas pour creer un nouveau composant, une nouvelle feature,
> une nouvelle page ou un nouveau hook.

---

## 1. Arborescence du projet

```
mon-portail/src/
│
├── App.jsx                         # Routeur principal (React Router v7)
├── main.jsx                        # Point d'entree React
├── index.css                       # Reset CSS global
│
├── config/
│   └── constants.js                # URLs webhook, noms de tables Supabase, config upload
│
├── lib/
│   └── supabase.js                 # Client Supabase (singleton)
│
├── styles/
│   └── variables.css               # Design tokens CSS (couleurs, tailles, espacements)
│
├── utils/
│   ├── formatting.js               # Labels colonnes, formatage cellules, formatDate()
│   └── session.js                  # generateSessionId()
│
├── hooks/
│   ├── useChat.js                  # Logique chat (messages, envoi, scroll)
│   ├── useDocuments.js             # Chargement docs Supabase + realtime
│   └── useFileUpload.js            # Drag & drop + upload Drive
│
├── components/
│   ├── ProtectedRoute.jsx          # Guard d'authentification
│   ├── ui/                         # ★ UI KIT – composants atomiques reutilisables
│   │   ├── index.js                #   Barrel export (toujours importer depuis ici)
│   │   ├── Spinner.jsx + .css      #   Spinner (size: sm | md | lg)
│   │   ├── Button.jsx  + .css      #   Bouton (variant: primary | ghost | icon)
│   │   ├── Input.jsx   + .css      #   Input / Textarea (as: text | textarea)
│   │   ├── SearchInput.jsx + .css  #   Combo icone Search + input
│   │   ├── Card.jsx    + .css      #   Wrapper glassmorphism
│   │   ├── Modal.jsx   + .css      #   Overlay + panneau centre
│   │   ├── StatusMessage.jsx + .css#   Etats loading / error / empty
│   │   ├── Badge.jsx   + .css      #   Badge colore
│   │   ├── ZoniaLogo.jsx           #   Logo Z SVG (pas de CSS propre)
│   │   └── ZoniaAvatar.jsx + .css  #   Avatar rond gradient
│   └── (autres composants globaux non lies a une feature)
│
├── features/                       # ★ FEATURES – modules metier autonomes
│   ├── chat/
│   │   ├── index.js                #   Barrel export
│   │   ├── ChatPanel.jsx + .css    #   Composant presentationnel principal
│   │   └── components/             #   Sous-composants internes
│   │       ├── ChatFileItem.jsx
│   │       └── DocumentRow.jsx
│   ├── tableaux/
│   │   ├── index.js
│   │   ├── MesTableauxPanel.jsx + .css
│   │   ├── TableauCard.jsx
│   │   ├── TableauDetailSection.jsx + .css
│   │   ├── tableauHelpers.jsx
│   │   └── components/
│   │       └── EnrichModal.jsx
│   └── sidebar/
│       ├── index.js
│       └── Sidebar.jsx + .css
│
└── pages/                          # ★ PAGES – une entree = une route
    ├── ZoniaProject/
    │   ├── index.js                #   Barrel export
    │   ├── ZoniaProject.jsx        #   Orchestrateur (hooks + features)
    │   └── ZoniaProject.css
    ├── Dashboard/
    │   ├── index.js
    │   ├── Dashboard.jsx + .css
    ├── Login/
    │   ├── index.js
    │   ├── Login.jsx + .css
    └── Vitrine/
        ├── index.js
        └── Vitrine.jsx + .css
```

---

## 2. Roles de chaque dossier

| Dossier | Contient | Regle d'or |
|---|---|---|
| `config/` | Constantes, URLs, noms de tables | **Jamais de logique**, uniquement des valeurs exportees |
| `lib/` | Clients externes (Supabase, etc.) | Un fichier = un service, exporte un singleton |
| `styles/` | Variables CSS globales (tokens) | Toute nouvelle couleur/taille = variable ici |
| `utils/` | Fonctions pures sans etat React | Pas de hooks, pas de JSX, pas d'imports React |
| `hooks/` | Custom hooks partages entre features | Un hook = un fichier, prefixe `use` |
| `components/ui/` | Composants atomiques sans logique metier | Acceptent des **props de variation**, zero connaissance du domaine |
| `components/` (racine) | Composants globaux (ProtectedRoute, etc.) | Seulement si utilise dans 2+ pages sans etre "atomique" |
| `features/` | Modules metier (chat, tableaux, sidebar) | Chaque feature est autonome, importe depuis `ui/` et `hooks/` |
| `pages/` | Composants-pages lies a une route | Orchestrent les features et hooks, ne contiennent pas de logique metier lourde |

---

## 3. Le systeme de Design (UI Kit)

### 3.1 Design Tokens (`styles/variables.css`)

```css
:root {
  --chat-cyan:    #19E4FA;      /* Couleur principale */
  --chat-gold:    #FFD700;      /* Accent / hover */
  --chat-slate-900: #0f172a;    /* Background le plus sombre */
  --chat-slate-800: #1e293b;
  --chat-slate-700: #334155;    /* Bordures principales */
  --chat-slate-600: #475569;
  --chat-slate-500: #64748b;    /* Texte secondaire */
  --chat-slate-400: #94a3b8;
  --chat-slate-300: #cbd5e1;    /* Texte principal clair */
}
```

**Regle** : Ne jamais ecrire de couleur en dur dans un fichier CSS feature.
Toujours utiliser `var(--chat-xxx)`.
Si une nouvelle couleur est necessaire, l'ajouter dans `variables.css` d'abord.

### 3.2 Composants UI disponibles

Toujours importer depuis le barrel :
```jsx
import { Button, Input, Spinner, StatusMessage, Card, Modal, Badge, SearchInput, ZoniaLogo, ZoniaAvatar } from '../../components/ui';
// ou '../components/ui' selon la profondeur
```

#### Spinner
```jsx
<Spinner size="sm" />   // 14px
<Spinner size="md" />   // 20px (defaut)
<Spinner size="lg" />   // 24px
```

#### Button
```jsx
<Button variant="primary">Envoyer</Button>
<Button variant="ghost" icon={<X size={16} />}>Annuler</Button>
<Button variant="icon" icon={<X size={18} />} />
<Button variant="primary" loading>En cours...</Button>
// Props : variant (primary|ghost|icon), size (sm|md), loading, disabled, icon, type
```

#### Input
```jsx
<Input placeholder="Texte..." />                          // input text
<Input as="textarea" rows={4} placeholder="Message..." /> // textarea
// Props : as (text|textarea), size (sm|md), + tous les props HTML natifs
// Supporte ref via React.forwardRef
```

#### SearchInput
```jsx
<SearchInput value={query} onChange={handleChange} placeholder="Rechercher..." size="sm" />
// Props : value, onChange, placeholder, size (sm|md)
```

#### Card
```jsx
<Card>Contenu statique</Card>
<Card variant="interactive" selected={isActive} onClick={handleClick}>Carte cliquable</Card>
// Props : variant (default|interactive), selected, + spread HTML
```

#### Modal
```jsx
<Modal isOpen={show} onClose={handleClose} title="Mon titre" icon={<Sparkles />} loading={isSaving}>
  <p>Contenu du modal</p>
</Modal>
// Props : isOpen, onClose, title, icon, loading, className
```

#### StatusMessage
```jsx
<StatusMessage type="loading" message="Chargement..." />
<StatusMessage type="error" message={errorMsg} />
<StatusMessage type="empty" message="Aucun resultat" />
// Props : type (loading|error|empty), message, children
```

#### Badge
```jsx
<Badge variant="cyan">12</Badge>
<Badge variant="gold">Premium</Badge>
// Props : variant (default|cyan|gold|green|red)
```

#### ZoniaLogo
```jsx
<ZoniaLogo size={32} strokeColor="white" circleColor="#FFD700" />
```

#### ZoniaAvatar
```jsx
<ZoniaAvatar />
<ZoniaAvatar loading />
// Props : loading (pulse animation), className
```

---

## 4. Marche a suivre : Creer un nouveau composant UI

> Quand : tu veux ajouter un element reutilisable sans logique metier (ex: Tooltip, Toggle, Select).

### Etapes

1. **Creer le fichier JSX** dans `components/ui/NomComposant.jsx`
2. **Creer le fichier CSS** dans `components/ui/NomComposant.css`
3. **Ajouter l'export** dans `components/ui/index.js`
4. **Convention de nommage CSS** : prefixer toutes les classes par `ui-nomcomposant`
   ```css
   .ui-toggle { ... }
   .ui-toggle--active { ... }
   .ui-toggle__label { ... }
   ```
5. **Props obligatoires** : toujours accepter `className` pour permettre des overrides
6. **Documentation** : ajouter un JSDoc au-dessus du composant

### Template

```jsx
// components/ui/Toggle.jsx
import React from 'react';
import './Toggle.css';

/**
 * Description du composant.
 * @param {boolean} checked
 * @param {function} onChange
 * @param {string} className
 */
const Toggle = ({ checked = false, onChange, className = '' }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    className={`ui-toggle ${checked ? 'ui-toggle--active' : ''} ${className}`}
    onClick={() => onChange?.(!checked)}
  >
    <span className="ui-toggle__thumb" />
  </button>
);

export default Toggle;
```

```css
/* components/ui/Toggle.css */
.ui-toggle {
  /* Utiliser var(--chat-xxx) pour les couleurs */
  background: var(--chat-slate-600);
  border: none;
  border-radius: 9999px;
  width: 2.5rem;
  height: 1.25rem;
  position: relative;
  cursor: pointer;
  transition: background 0.2s;
}
.ui-toggle--active { background: var(--chat-cyan); }
.ui-toggle__thumb { /* ... */ }
```

```js
// components/ui/index.js – ajouter la ligne :
export { default as Toggle } from './Toggle';
```

---

## 5. Marche a suivre : Creer une nouvelle Feature

> Quand : tu veux ajouter un module metier (ex: "contacts", "analytics", "settings").

### Etapes

1. **Creer le dossier** `features/ma-feature/`
2. **Creer les fichiers** :
   ```
   features/ma-feature/
   ├── index.js                # Barrel export
   ├── MaFeaturePanel.jsx      # Composant principal
   ├── MaFeaturePanel.css      # Styles specifiques a la feature
   └── components/             # Sous-composants internes (optionnel)
       └── FeatureItem.jsx
   ```
3. **Barrel export** (`index.js`) :
   ```js
   export { default as MaFeaturePanel } from './MaFeaturePanel';
   ```
4. **Importer les composants UI** depuis le kit :
   ```jsx
   import { Button, StatusMessage, Card, SearchInput } from '../../components/ui';
   ```
5. **Importer les hooks partages** si necessaire :
   ```jsx
   import { useDocuments } from '../../hooks/useDocuments';
   ```
6. **Importer les constantes** :
   ```jsx
   import { TABLE_XXX } from '../../config/constants';
   ```

### Regles

- **Ne jamais recreer** un spinner, un bouton, un input, un etat loading/error/empty.
  Utiliser les composants de `components/ui/`.
- **Ne jamais ecrire de couleur en dur** dans le CSS feature.
  Utiliser `var(--chat-xxx)`.
- **Le CSS de la feature** ne contient que les styles de **layout et positionnement**
  specifiques a la feature (grilles, paddings, flex, overrides de taille).
- **Pas de logique metier lourde dans le JSX**. Extraire dans un hook ou un helper.

### Template

```jsx
// features/contacts/ContactsPanel.jsx
import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseAvailable } from '../../lib/supabase';
import { TABLE_CONTACT_SOCIETY } from '../../config/constants';
import { SearchInput, StatusMessage, Card } from '../../components/ui';
import ContactItem from './components/ContactItem';
import './ContactsPanel.css';

const ContactsPanel = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // charger les contacts...
  }, []);

  return (
    <div className="contacts-panel">
      <div className="contacts-header">
        <h2>Contacts</h2>
        <SearchInput value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      </div>

      {loading && <StatusMessage type="loading" message="Chargement des contacts..." />}
      {error && <StatusMessage type="error" message={error} />}
      {!loading && !error && contacts.length === 0 && (
        <StatusMessage type="empty" message="Aucun contact" />
      )}

      {!loading && !error && contacts.length > 0 && (
        <div className="contacts-grid">
          {contacts.map((c) => (
            <Card key={c.id} variant="interactive">
              <ContactItem contact={c} />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContactsPanel;
```

---

## 6. Marche a suivre : Creer une nouvelle Page

> Quand : tu veux ajouter une route (ex: `/settings`, `/analytics`).

### Etapes

1. **Creer le dossier** `pages/MaPage/`
2. **Creer les fichiers** :
   ```
   pages/MaPage/
   ├── index.js          # Barrel export
   ├── MaPage.jsx        # Composant-page (orchestrateur)
   └── MaPage.css        # Styles de layout de la page
   ```
3. **Barrel export** :
   ```js
   export { default } from './MaPage';
   ```
4. **Ajouter la route** dans `App.jsx` :
   ```jsx
   import MaPage from './pages/MaPage';
   // ...
   <Route path="/ma-page" element={<MaPage />} />
   ```
5. **Le composant-page** orchestre les hooks et features. Il ne contient pas
   de logique metier complexe. Pattern a suivre : voir `ZoniaProject.jsx`.

### Template

```jsx
// pages/MaPage/MaPage.jsx
import React, { useState } from 'react';
import { Sidebar } from '../../features/sidebar';
import { MaFeaturePanel } from '../../features/ma-feature';
import '../../styles/variables.css';
import './MaPage.css';

function MaPage() {
  const [activeSection, setActiveSection] = useState('ma-feature');

  return (
    <div className="app-layout">
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      <main className="app-main">
        <div className="app-content">
          <MaFeaturePanel />
        </div>
      </main>
    </div>
  );
}

export default MaPage;
```

---

## 7. Marche a suivre : Creer un nouveau Custom Hook

> Quand : tu veux extraire de la logique avec etat reutilisable (ex: useContacts, useNotifications).

### Etapes

1. **Creer le fichier** `hooks/useMonHook.js` (pas `.jsx` sauf si retourne du JSX)
2. **Prefixe** : toujours `use` + PascalCase
3. **Exporter** en named export :
   ```js
   export function useContacts() { ... }
   ```
4. **JSDoc** : documenter les parametres et le retour

### Template

```js
// hooks/useContacts.js
import { useState, useEffect } from 'react';
import { supabase, isSupabaseAvailable } from '../lib/supabase';
import { TABLE_CONTACT_SOCIETY } from '../config/constants';

/**
 * Hook pour charger et gerer les contacts.
 * @returns {{ contacts: Array, loading: boolean, error: string|null, reload: function }}
 */
export function useContacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadContacts = async () => {
    if (!isSupabaseAvailable() || !supabase) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase.from(TABLE_CONTACT_SOCIETY).select('*');
      if (err) throw err;
      setContacts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('[Supabase] Erreur chargement contacts:', err);
      setError(err?.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadContacts(); }, []);

  return { contacts, loading, error, reload: loadContacts };
}
```

---

## 8. Marche a suivre : Ajouter une constante ou URL

1. Ouvrir `config/constants.js`
2. Ajouter la constante avec un commentaire de section
3. Importer dans le fichier qui en a besoin :
   ```js
   import { MA_CONSTANTE } from '../../config/constants';
   ```
4. **Ne jamais ecrire d'URL ou de nom de table en dur** dans un composant

---

## 9. Marche a suivre : Ajouter une fonction utilitaire

1. Identifier si c'est une **fonction pure** (pas de state React, pas de JSX)
2. Si oui → `utils/monFichier.js`
3. Si la fonction contient du JSX → fichier `.jsx` dans `features/xxx/` en tant que helper
4. Exporter en named export

---

## 10. Conventions de nommage

| Element | Convention | Exemple |
|---|---|---|
| Composant React | PascalCase | `ChatPanel.jsx`, `StatusMessage.jsx` |
| Fichier CSS | Meme nom que le composant | `ChatPanel.css` |
| Classes CSS (UI Kit) | `ui-composant`, `ui-composant--variante`, `ui-composant__element` | `ui-btn--primary`, `ui-spinner--lg` |
| Classes CSS (Feature) | `feature-element` (kebab-case) | `chat-sidebar`, `tableaux-grid` |
| Hook | `use` + PascalCase | `useChat.js`, `useFileUpload.js` |
| Constante | UPPER_SNAKE_CASE | `WEBHOOK_URL`, `TABLE_TABLEAU` |
| Fonction utilitaire | camelCase | `formatDate()`, `getColumnLabel()` |
| Dossier feature | kebab-case | `features/chat/`, `features/tableaux/` |
| Dossier page | PascalCase | `pages/ZoniaProject/`, `pages/Login/` |
| Barrel export | `index.js` | Toujours present dans chaque dossier feature et page |

---

## 11. Regles CSS strictes

1. **Variables** : toujours `var(--chat-xxx)` pour les couleurs, jamais de valeur en dur
2. **Glassmorphism standard** :
   ```css
   background: rgba(30, 41, 59, 0.6);
   backdrop-filter: blur(24px);
   -webkit-backdrop-filter: blur(24px);
   border: 1px solid rgba(255, 255, 255, 0.06);
   border-radius: 1rem;
   ```
   → Utiliser le composant `<Card>` au lieu de re-ecrire ce pattern
3. **Spinner** : ne jamais ecrire `@keyframes spin` → utiliser `<Spinner />`
4. **Etats loading/error/empty** : ne jamais re-coder → utiliser `<StatusMessage />`
5. **Boutons** : ne jamais re-styler de zero → utiliser `<Button />` avec la bonne variante
6. **Inputs** : ne jamais re-styler de zero → utiliser `<Input />` ou `<SearchInput />`
7. **Override local** : si un composant UI necessite un ajustement positionnel
   dans une feature, passer `className` et ecrire l'override dans le CSS de la feature :
   ```jsx
   <SearchInput className="ma-feature-search" />
   ```
   ```css
   /* dans MaFeature.css */
   .ma-feature-search { position: sticky; top: 0; }
   ```

---

## 12. Checklist avant de terminer une modification

- [ ] Aucune couleur en dur dans les fichiers CSS (utiliser les variables)
- [ ] Aucun spinner/bouton/input/loading/error re-code (utiliser le UI Kit)
- [ ] Barrel export (`index.js`) mis a jour si nouveau composant/feature
- [ ] Route ajoutee dans `App.jsx` si nouvelle page
- [ ] Constantes dans `config/constants.js` (pas d'URL en dur)
- [ ] Build `npx vite build` passe sans erreur
- [ ] Fichiers `.jsx` si le contenu utilise du JSX (pas `.js`)

---

## 13. Recapitulatif des imports types

```jsx
// ── UI Kit (composants atomiques) ──────────────────────────────
import { Button, Input, Spinner, StatusMessage, Card, Modal, Badge, SearchInput, ZoniaLogo, ZoniaAvatar } from '../../components/ui';

// ── Config ─────────────────────────────────────────────────────
import { WEBHOOK_URL, TABLE_TABLEAU } from '../../config/constants';

// ── Librairies externes ────────────────────────────────────────
import { supabase, isSupabaseAvailable } from '../../lib/supabase';

// ── Hooks partages ─────────────────────────────────────────────
import { useChat } from '../../hooks/useChat';

// ── Features (via barrel) ──────────────────────────────────────
import { ChatPanel } from '../../features/chat';
import { MesTableauxPanel, TableauDetailSection } from '../../features/tableaux';
import { Sidebar } from '../../features/sidebar';

// ── Utils ──────────────────────────────────────────────────────
import { formatDate, getColumnLabel } from '../../utils/formatting';

// ── Styles ─────────────────────────────────────────────────────
import '../../styles/variables.css';
import './MonComposant.css';

// ── Icones (lucide-react) ──────────────────────────────────────
import { Search, Send, X, Sparkles } from 'lucide-react';
```

> **Ordre des imports** : React → librairies externes → config/lib → hooks → features → components/ui → utils → CSS → icones
