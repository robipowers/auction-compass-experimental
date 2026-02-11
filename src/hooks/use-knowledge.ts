import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  KnowledgeTopic, 
  KnowledgeArticle, 
  KnowledgeBookmark,
  KnowledgeNote,
  AMTGlossaryTerm,
  TopicWithArticleCount 
} from '@/types/knowledge';
import { mockTopics, mockArticles, mockGlossary } from '@/data/knowledgeData';

// Use mock data as fallback when database isn't available
const USE_MOCK_DATA = true;

// Fetch all topics with article counts
export function useKnowledgeTopics() {
  return useQuery({
    queryKey: ['knowledge-topics'],
    queryFn: async (): Promise<TopicWithArticleCount[]> => {
      if (USE_MOCK_DATA) {
        return mockTopics;
      }
      
      const { data: topics, error } = await supabase
        .from('knowledge_topics')
        .select('*')
        .order('sort_order');
      
      if (error) throw error;
      
      const { data: articles } = await supabase
        .from('knowledge_articles')
        .select('topic_id');
      
      const counts: Record<string, number> = {};
      articles?.forEach(a => {
        if (a.topic_id) {
          counts[a.topic_id] = (counts[a.topic_id] || 0) + 1;
        }
      });
      
      return (topics || []).map(t => ({
        ...t,
        articleCount: counts[t.id] || 0
      }));
    }
  });
}

// Fetch articles by topic
export function useKnowledgeArticles(topicSlug?: string) {
  return useQuery({
    queryKey: ['knowledge-articles', topicSlug],
    queryFn: async (): Promise<KnowledgeArticle[]> => {
      if (USE_MOCK_DATA) {
        if (topicSlug) {
          const topic = mockTopics.find(t => t.slug === topicSlug);
          return mockArticles.filter(a => a.topic_id === topic?.id);
        }
        return mockArticles;
      }
      
      let query = supabase
        .from('knowledge_articles')
        .select(`*, topic:knowledge_topics(*)`)
        .order('created_at', { ascending: false });
      
      if (topicSlug) {
        const { data: topic } = await supabase
          .from('knowledge_topics')
          .select('id')
          .eq('slug', topicSlug)
          .single();
        
        if (topic) {
          query = query.eq('topic_id', topic.id);
        }
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  });
}

// Fetch single article by slug
export function useKnowledgeArticle(slug: string) {
  return useQuery({
    queryKey: ['knowledge-article', slug],
    queryFn: async (): Promise<KnowledgeArticle | null> => {
      if (USE_MOCK_DATA) {
        return mockArticles.find(a => a.slug === slug) || null;
      }
      
      const { data, error } = await supabase
        .from('knowledge_articles')
        .select(`*, topic:knowledge_topics(*)`)
        .eq('slug', slug)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!slug
  });
}

// Search articles
export function useKnowledgeSearch(query: string) {
  return useQuery({
    queryKey: ['knowledge-search', query],
    queryFn: async (): Promise<KnowledgeArticle[]> => {
      if (!query.trim()) return [];
      
      if (USE_MOCK_DATA) {
        const q = query.toLowerCase();
        return mockArticles.filter(a => 
          a.title.toLowerCase().includes(q) || 
          a.content.toLowerCase().includes(q) ||
          a.excerpt?.toLowerCase().includes(q)
        );
      }
      
      const { data, error } = await supabase
        .from('knowledge_articles')
        .select(`*, topic:knowledge_topics(*)`)
        .or(`title.ilike.%${query}%,content.ilike.%${query}%,excerpt.ilike.%${query}%`)
        .limit(10);
      
      if (error) throw error;
      return data || [];
    },
    enabled: query.length >= 2
  });
}

// Fetch glossary terms
export function useGlossaryTerms() {
  return useQuery({
    queryKey: ['glossary-terms'],
    queryFn: async (): Promise<AMTGlossaryTerm[]> => {
      if (USE_MOCK_DATA) {
        return mockGlossary;
      }
      
      const { data, error } = await supabase
        .from('amt_glossary')
        .select('*')
        .order('term');
      
      if (error) throw error;
      return data || [];
    }
  });
}

// User bookmarks (mock: use localStorage)
export function useBookmarks() {
  return useQuery({
    queryKey: ['knowledge-bookmarks'],
    queryFn: async (): Promise<KnowledgeBookmark[]> => {
      if (USE_MOCK_DATA) {
        const stored = localStorage.getItem('knowledge_bookmarks');
        return stored ? JSON.parse(stored) : [];
      }
      
      const { data, error } = await supabase
        .from('knowledge_bookmarks')
        .select(`*, article:knowledge_articles(*)`)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });
}

export function useToggleBookmark() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ articleId, isBookmarked }: { articleId: string; isBookmarked: boolean }) => {
      if (USE_MOCK_DATA) {
        const stored = localStorage.getItem('knowledge_bookmarks');
        let bookmarks: KnowledgeBookmark[] = stored ? JSON.parse(stored) : [];
        
        if (isBookmarked) {
          bookmarks = bookmarks.filter(b => b.article_id !== articleId);
        } else {
          bookmarks.push({
            id: `bk-${Date.now()}`,
            user_id: 'local',
            article_id: articleId,
            created_at: new Date().toISOString()
          });
        }
        localStorage.setItem('knowledge_bookmarks', JSON.stringify(bookmarks));
        return;
      }
      
      if (isBookmarked) {
        await supabase.from('knowledge_bookmarks').delete().eq('article_id', articleId);
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');
        await supabase.from('knowledge_bookmarks').insert({ article_id: articleId, user_id: user.id });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-bookmarks'] });
    }
  });
}

// User notes (mock: use localStorage)
export function useArticleNotes(articleId: string) {
  return useQuery({
    queryKey: ['knowledge-notes', articleId],
    queryFn: async (): Promise<KnowledgeNote[]> => {
      if (USE_MOCK_DATA) {
        const stored = localStorage.getItem('knowledge_notes');
        const notes: KnowledgeNote[] = stored ? JSON.parse(stored) : [];
        return notes.filter(n => n.article_id === articleId);
      }
      
      const { data, error } = await supabase
        .from('knowledge_notes')
        .select('*')
        .eq('article_id', articleId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!articleId
  });
}

export function useAddNote() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ articleId, noteText }: { articleId: string; noteText: string }) => {
      if (USE_MOCK_DATA) {
        const stored = localStorage.getItem('knowledge_notes');
        const notes: KnowledgeNote[] = stored ? JSON.parse(stored) : [];
        notes.push({
          id: `note-${Date.now()}`,
          user_id: 'local',
          article_id: articleId,
          note_text: noteText,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        localStorage.setItem('knowledge_notes', JSON.stringify(notes));
        return;
      }
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      await supabase.from('knowledge_notes').insert({ article_id: articleId, user_id: user.id, note_text: noteText });
    },
    onSuccess: (_, { articleId }) => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-notes', articleId] });
    }
  });
}

// Reading history (mock: use localStorage)
export function useReadingHistory() {
  return useQuery({
    queryKey: ['reading-history'],
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        const stored = localStorage.getItem('reading_history');
        return stored ? JSON.parse(stored) : [];
      }
      
      const { data, error } = await supabase
        .from('knowledge_reading_history')
        .select(`*, article:knowledge_articles(*)`)
        .order('read_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ articleId, version }: { articleId: string; version: number }) => {
      if (USE_MOCK_DATA) {
        const stored = localStorage.getItem('reading_history');
        let history = stored ? JSON.parse(stored) : [];
        if (!history.find((h: any) => h.article_id === articleId)) {
          history.push({
            id: `rh-${Date.now()}`,
            user_id: 'local',
            article_id: articleId,
            article_version: version,
            read_at: new Date().toISOString()
          });
          localStorage.setItem('reading_history', JSON.stringify(history));
        }
        return;
      }
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from('knowledge_reading_history').upsert({ 
        article_id: articleId, user_id: user.id, article_version: version 
      }, { onConflict: 'user_id,article_id,article_version' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reading-history'] });
    }
  });
}
