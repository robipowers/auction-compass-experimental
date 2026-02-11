import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { KnowledgeArticle, AMTGlossaryTerm } from '@/types/knowledge';

interface KnowledgeContextType {
  // Sidebar state
  isSidebarOpen: boolean;
  currentArticle: KnowledgeArticle | null;
  openSidebar: (article?: KnowledgeArticle) => void;
  closeSidebar: () => void;
  
  // Glossary cache
  glossaryTerms: AMTGlossaryTerm[];
  setGlossaryTerms: (terms: AMTGlossaryTerm[]) => void;
  
  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const KnowledgeContext = createContext<KnowledgeContextType | undefined>(undefined);

export function KnowledgeProvider({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentArticle, setCurrentArticle] = useState<KnowledgeArticle | null>(null);
  const [glossaryTerms, setGlossaryTerms] = useState<AMTGlossaryTerm[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const openSidebar = useCallback((article?: KnowledgeArticle) => {
    if (article) {
      setCurrentArticle(article);
    }
    setIsSidebarOpen(true);
  }, []);

  const closeSidebar = useCallback(() => {
    setIsSidebarOpen(false);
    // Clear article after animation
    setTimeout(() => setCurrentArticle(null), 300);
  }, []);

  return (
    <KnowledgeContext.Provider
      value={{
        isSidebarOpen,
        currentArticle,
        openSidebar,
        closeSidebar,
        glossaryTerms,
        setGlossaryTerms,
        searchQuery,
        setSearchQuery,
      }}
    >
      {children}
    </KnowledgeContext.Provider>
  );
}

export function useKnowledge() {
  const context = useContext(KnowledgeContext);
  if (context === undefined) {
    throw new Error('useKnowledge must be used within a KnowledgeProvider');
  }
  return context;
}
