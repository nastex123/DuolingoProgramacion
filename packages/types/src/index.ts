/**
 * @koda/types - Contratos y modelos compartidos entre Frontend y Backend
 */

// ==========================================
// 1. AUTENTICACIÓN Y USUARIO
// ==========================================

export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  is_premium: boolean;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  avatar_url?: string;
  document_number?: string;
  document_type?: 'CC' | 'TI' | 'CE' | 'PASSPORT';
  bio?: string;
  selected_language_id?: string;
  total_xp: number;
  level: number;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: 'Bearer';
}

// ==========================================
// 2. CURRÍCULO Y APRENDIZAJE
// ==========================================

export interface ProgrammingLanguage {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon_url: string;
  color: string;
  total_modules: number;
  is_active: boolean;
}

export interface ModuleProgress {
  id: string;
  user_id: string;
  module_id: string;
  is_unlocked: boolean;
  is_completed: boolean;
  mastery_percentage: number;
  unlocked_at?: string;
  completed_at?: string;
}

export interface SectionStars {
  id: string;
  user_id: string;
  section_id: string;
  stars_earned: number; // 1, 2 o 3 estrellas
  max_stars_earned: number;
  first_attempt_mistakes: number;
  completed_at: string;
}

export interface RoadmapModule {
  id: string;
  code: string;
  title: string;
  description: string;
  order_index: number;
  total_sections: number;
  is_unlocked: boolean;
  is_completed: boolean;
  mastery_percentage: number;
  sections: RoadmapSection[];
}

export interface RoadmapSection {
  id: string;
  code: string;
  title: string;
  order_index: number;
  total_lessons: number;
  is_unlocked: boolean;
  is_completed: boolean;
  stars_earned: number;
  max_stars_earned: number;
}

export interface RoadmapResponse {
  language: ProgrammingLanguage;
  overall_progress_percentage: number;
  total_stars_earned: number;
  max_possible_stars: number;
  current_module_id: string;
  modules: RoadmapModule[];
}

// ==========================================
// 3. LECCIONES Y PREGUNTAS
// ==========================================

export type QuestionType =
  | 'SINGLE_CHOICE'
  | 'MULTIPLE_CHOICE'
  | 'CODE_OUTPUT'
  | 'FILL_BLANK'
  | 'ORDER_BLOCKS'
  | 'MATCH_PAIRS'
  | 'BUG_HUNT'
  | 'CODE_COMPLETION'
  | 'TRUE_FALSE'
  | 'DRAG_DROP';

export interface QuestionOption {
  id: string;
  text: string;
  code_snippet?: string;
}

export interface LessonQuestion {
  id: string;
  type: QuestionType;
  prompt: string;
  code_context?: string;
  hint?: string;
  options: QuestionOption[];
}

export interface LessonDetail {
  id: string;
  section_id: string;
  title: string;
  order_index: number;
  theory_markdown: string;
  code_example: string;
  expected_output?: string;
  tip_markdown?: string;
  question: LessonQuestion;
}

export interface LessonAnswerSubmission {
  lesson_id: string;
  question_id: string;
  selected_option_ids: string[];
  input_text?: string;
  ordered_block_ids?: string[];
}

export interface LessonAnswerFeedback {
  is_correct: boolean;
  xp_earned: number;
  feedback_message: string;
  hint?: string;
  explanation?: string;
  correct_option_ids?: string[]; // Solo presente en revisiones o aciertos
  added_to_review_queue: boolean;
}

// ==========================================
// 4. CUADERNO DE ERRORES Y REPASO
// ==========================================

export interface MistakesNotebookItem {
  id: string;
  user_id: string;
  question_id: string;
  language_id: string;
  module_id: string;
  section_id: string;
  lesson_title: string;
  prompt: string;
  code_context?: string;
  error_count: number;
  is_resolved: boolean;
  created_at: string;
  last_failed_at: string;
}

// ==========================================
// 5. GAMIFICACIÓN (XP, RACHAS, LOGROS)
// ==========================================

export interface UserStreak {
  current_streak: number;
  max_streak: number;
  last_activity_date: string;
  freeze_count: number;
  is_active_today: boolean;
}

export interface Achievement {
  id: string;
  code: string;
  title: string;
  description: string;
  icon: string;
  xp_reward: number;
  is_unlocked: boolean;
  unlocked_at?: string;
}

// ==========================================
// 6. CERTIFICACIÓN
// ==========================================

export type CertificateStatus = 'valid' | 'revoked' | 'obsolete';

export interface Certificate {
  id: string;
  code: string; // ej. CQ-LUA-000001
  user_id: string;
  language_id: string;
  status: CertificateStatus;
  issued_at: string;
  holder_name: string;
  holder_document_masked: string;
  language_name: string;
  qr_payload: string;
  google_drive_file_id?: string;
  pdf_sha256?: string;
}

export interface CertificateVerificationResponse {
  is_valid: boolean;
  code: string;
  holder_name: string;
  holder_document_masked: string;
  language_name: string;
  issued_at: string;
  status: CertificateStatus;
  verification_url: string;
}
