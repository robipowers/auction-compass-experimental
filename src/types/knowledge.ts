// Knowledge Base Types

export interface KnowledgeTopic {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
  sort_order: number;
  created_at: string;
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  slug: string;
  topic_id: string | null;
  content: string;
  excerpt: string | null;
  read_time_minutes: number;
  version: number;
  updated_at: string;
  created_at: string;
  // Joined fields
  topic?: KnowledgeTopic;
}

export interface KnowledgeReadingHistory {
  id: string;
  user_id: string;
  article_id: string;
  article_version: number;
  read_at: string;
}

export interface KnowledgeBookmark {
  id: string;
  user_id: string;
  article_id: string;
  created_at: string;
  // Joined fields
  article?: KnowledgeArticle;
}

export interface KnowledgeNote {
  id: string;
  user_id: string;
  article_id: string;
  note_text: string;
  created_at: string;
  updated_at: string;
}

export interface AMTGlossaryTerm {
  id: string;
  term: string;
  definition: string;
  article_id: string | null;
  created_at: string;
}

// Extended types for UI
export interface ArticleWithMeta extends KnowledgeArticle {
  isRead?: boolean;
  isBookmarked?: boolean;
  hasNotes?: boolean;
  notes?: KnowledgeNote[];
}

export interface TopicWithArticleCount extends KnowledgeTopic {
  articleCount: number;
}

// Sidebar state
export interface KnowledgeSidebarState {
  isOpen: boolean;
  currentArticle: KnowledgeArticle | null;
  searchQuery: string;
}

// Reading progress
export interface ReadingProgress {
  totalArticles: number;
  articlesRead: number;
  progressPercent: number;
  currentStreak: number;
  articlesReadThisWeek: number;
}
