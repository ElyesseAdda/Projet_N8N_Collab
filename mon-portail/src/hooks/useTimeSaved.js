import { useState, useMemo, useCallback } from 'react';

// ╔══════════════════════════════════════════════════════════════════════════════
// ║ ROADMAP — Branchement Supabase (3 étapes)
// ║
// ║ ÉTAPE 1 — Créer la table dans Supabase :
// ║
// ║   CREATE TABLE time_saved_actions (
// ║     id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
// ║     user_id     UUID REFERENCES auth.users(id) NOT NULL,
// ║     type        TEXT NOT NULL,          -- clé ACTION_TYPES (ex: 'MAIL_PREFILL')
// ║     label       TEXT NOT NULL,          -- libellé affiché (ex: 'Pré-remplissage mail')
// ║     minutes_saved INTEGER NOT NULL,     -- temps économisé estimé en minutes
// ║     metadata    JSONB DEFAULT '{}',     -- contexte libre (id du mail, du fichier…)
// ║     created_at  TIMESTAMPTZ DEFAULT now()
// ║   );
// ║
// ║   -- Index pour les requêtes filtrées par mois/année
// ║   CREATE INDEX idx_time_saved_user_date
// ║     ON time_saved_actions (user_id, created_at DESC);
// ║
// ║   -- RLS : chaque utilisateur ne voit que ses propres actions
// ║   ALTER TABLE time_saved_actions ENABLE ROW LEVEL SECURITY;
// ║   CREATE POLICY "Users see own actions"
// ║     ON time_saved_actions FOR SELECT
// ║     USING (auth.uid() = user_id);
// ║   CREATE POLICY "Users insert own actions"
// ║     ON time_saved_actions FOR INSERT
// ║     WITH CHECK (auth.uid() = user_id);
// ║
// ║ ÉTAPE 2 — Remplacer MOCK_ACTIONS dans ce hook :
// ║
// ║   - Supprimer generateMockActions() et MOCK_ACTIONS
// ║   - Ajouter un state : const [actions, setActions] = useState([]);
// ║   - Ajouter un useEffect qui fetch depuis Supabase :
// ║
// ║     useEffect(() => {
// ║       if (!isSupabaseAvailable() || !supabase) return;
// ║       const load = async () => {
// ║         const { data, error } = await supabase
// ║           .from(TABLE_TIME_SAVED_ACTIONS)
// ║           .select('*')
// ║           .order('created_at', { ascending: false });
// ║         if (!error) setActions(data || []);
// ║       };
// ║       load();
// ║     }, []);
// ║
// ║   - Imports nécessaires :
// ║     import { useEffect } from 'react';
// ║     import { supabase, isSupabaseAvailable } from '../lib/supabase';
// ║     import { TABLE_TIME_SAVED_ACTIONS } from '../config/constants';
// ║
// ║ ÉTAPE 3 — Logger les actions depuis chaque feature :
// ║
// ║   Créer un helper utils/logTimeSaved.js :
// ║
// ║     import { supabase, isSupabaseAvailable } from '../lib/supabase';
// ║     import { TABLE_TIME_SAVED_ACTIONS } from '../config/constants';
// ║
// ║     export async function logTimeSaved(type, label, minutesSaved, metadata = {}) {
// ║       if (!isSupabaseAvailable() || !supabase) return;
// ║       const { data: { user } } = await supabase.auth.getUser();
// ║       if (!user) return;
// ║       await supabase.from(TABLE_TIME_SAVED_ACTIONS).insert({
// ║         user_id: user.id,
// ║         type,
// ║         label,
// ║         minutes_saved: minutesSaved,
// ║         metadata,
// ║       });
// ║     }
// ║
// ║   Puis appeler logTimeSaved() aux endroits suivants :
// ║
// ║     • features/mail/MailPanel.jsx
// ║       → après envoi d'un mail pré-rempli par l'IA :
// ║         logTimeSaved('MAIL_PREFILL', 'Pré-remplissage mail', 8, { mailId })
// ║       → après génération d'une réponse IA :
// ║         logTimeSaved('MAIL_REPLY', 'Réponse mail IA', 12, { mailId })
// ║
// ║     • features/chat/ChatPanel.jsx
// ║       → après chaque réponse utile de Zonia :
// ║         logTimeSaved('CHAT_ASSIST', 'Assistance chat', 6, { sessionId })
// ║
// ║     • hooks/useFileUpload.js
// ║       → après upload réussi sur le Drive :
// ║         logTimeSaved('DRIVE_UPLOAD', 'Gestion Drive', 5, { fileName })
// ║
// ║     • features/tableaux/MesTableauxPanel.jsx
// ║       → après création automatique d'une tâche :
// ║         logTimeSaved('TASK_CREATE', 'Création tâche', 3, { tableauId })
// ║       → après enrichissement de données :
// ║         logTimeSaved('ENRICHMENT', 'Enrichissement données', 15, { tableauId })
// ║
// ╚══════════════════════════════════════════════════════════════════════════════

// ─── Types d'actions Zonia et temps estimé (en minutes) ────────────────────
const ACTION_TYPES = {
  MAIL_PREFILL: { label: 'Pré-remplissage mail', avgMinutes: 8 },
  MAIL_REPLY:   { label: 'Réponse mail IA',      avgMinutes: 12 },
  DRIVE_UPLOAD: { label: 'Gestion Drive',         avgMinutes: 5 },
  TASK_CREATE:  { label: 'Création tâche',        avgMinutes: 3 },
  ENRICHMENT:   { label: 'Enrichissement données', avgMinutes: 15 },
  CHAT_ASSIST:  { label: 'Assistance chat',       avgMinutes: 6 },
};

// ─── Données mockées (à remplacer par Supabase) ───────────────────────────
function generateMockActions() {
  const now = new Date();
  const actions = [];

  const types = Object.keys(ACTION_TYPES);

  for (let monthOffset = 0; monthOffset < 6; monthOffset++) {
    const date = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);
    const actionsPerMonth = monthOffset === 0
      ? 28 + Math.floor(Math.random() * 10)
      : 15 + Math.floor(Math.random() * 20);

    for (let i = 0; i < actionsPerMonth; i++) {
      const day = 1 + Math.floor(Math.random() * 28);
      const type = types[Math.floor(Math.random() * types.length)];
      const variance = 0.7 + Math.random() * 0.6;

      actions.push({
        id: `mock-${monthOffset}-${i}`,
        type,
        label: ACTION_TYPES[type].label,
        minutesSaved: Math.round(ACTION_TYPES[type].avgMinutes * variance),
        createdAt: new Date(date.getFullYear(), date.getMonth(), day).toISOString(),
      });
    }
  }

  return actions;
}

const MOCK_ACTIONS = generateMockActions();

/**
 * Hook de comptage du temps économisé par Zonia.
 * Retourne les heures/minutes économisées filtrables par mois/année.
 * Utilise des données mockées pour le moment — préparé pour Supabase.
 *
 * @returns {{
 *   totalMinutes: number,
 *   hours: number,
 *   remainingMinutes: number,
 *   actionCount: number,
 *   byType: Object,
 *   selectedMonth: number,
 *   selectedYear: number,
 *   setSelectedMonth: function,
 *   setSelectedYear: function,
 *   availableMonths: Array<{month: number, year: number, label: string}>,
 * }}
 */
export function useTimeSaved() {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  // TODO: Remplacer par un fetch Supabase (table TIME_SAVED_ACTIONS)
  const actions = MOCK_ACTIONS;

  const filtered = useMemo(() => {
    return actions.filter((a) => {
      const d = new Date(a.createdAt);
      return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    });
  }, [actions, selectedMonth, selectedYear]);

  const totalMinutes = useMemo(
    () => filtered.reduce((sum, a) => sum + a.minutesSaved, 0),
    [filtered]
  );

  const byType = useMemo(() => {
    const map = {};
    for (const a of filtered) {
      if (!map[a.type]) {
        map[a.type] = { label: a.label, count: 0, minutes: 0 };
      }
      map[a.type].count += 1;
      map[a.type].minutes += a.minutesSaved;
    }
    return map;
  }, [filtered]);

  const availableMonths = useMemo(() => {
    const set = new Set();
    const result = [];
    for (const a of actions) {
      const d = new Date(a.createdAt);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (!set.has(key)) {
        set.add(key);
        result.push({
          month: d.getMonth(),
          year: d.getFullYear(),
          label: d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
        });
      }
    }
    result.sort((a, b) => b.year - a.year || b.month - a.month);
    return result;
  }, [actions]);

  const setFilter = useCallback((month, year) => {
    setSelectedMonth(month);
    setSelectedYear(year);
  }, []);

  return {
    totalMinutes,
    hours: Math.floor(totalMinutes / 60),
    remainingMinutes: totalMinutes % 60,
    actionCount: filtered.length,
    byType,
    selectedMonth,
    selectedYear,
    setSelectedMonth,
    setSelectedYear,
    setFilter,
    availableMonths,
  };
}
