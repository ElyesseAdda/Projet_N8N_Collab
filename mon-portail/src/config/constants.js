// ─── Webhook URLs ─────────────────────────────────────────────────────────────
export const WEBHOOK_URL =
  'https://zoniahub.fr/n8n/webhook/zonia-router';

export const ENRICH_WEBHOOK_URL =
  'https://zoniahub.fr/n8n/webhook/3d7f7894-ba69-45dc-96b4-b27d4e04ca25';

// ─── Supabase table names ─────────────────────────────────────────────────────
export const TABLE_DOCUMENT_METADATA = 'document_metadata';
export const TABLE_TABLEAU = 'tableau';
export const TABLE_TABLEAU_TEST = 'tableau_test';
export const TABLE_CONTACT_SOCIETY = 'contact_society';

// ─── Foreign key columns ──────────────────────────────────────────────────────
export const FK_COLUMN = 'table_id'; // tableau_test.table_id → tableau parent
export const FK_CONTACT_TO_SOCIETY = 'table_id'; // contact_society.table_id → tableau_test.id

// ─── Time tracking ───────────────────────────────────────────────────────────
export const TABLE_TIME_SAVED_ACTIONS = 'time_saved_actions';

// ─── Upload ───────────────────────────────────────────────────────────────────
export const UPLOAD_DRIVE_URL = '/api/upload-drive';
export const ACCEPTED_FILE_TYPES = '.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt';
