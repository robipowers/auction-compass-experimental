// Updated Knowledge.tsx with Glossary and Learning Path tabs
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  BookOpen, 
  Bookmark, 
  History, 
  Clock,
  ChevronRight,
  CheckCircle,
  ArrowLeft,
  GraduationCap,
  BookText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  useKnowledgeTopics, 
  useKnowledgeArticles, 
  useKnowledgeSearch,
  useBookmarks,
  useReadingHistory,
  useMarkAsRead
} from '@/hooks/use-knowledge';
import { KnowledgeArticle, KnowledgeTopic } from '@/types/knowledge';
import { cn } from '@/lib/utils';
import { GlossaryTab, LearningPathTab, PremiumArticleView, TopicIcon } from '@/components/knowledge';

type FilterTab = 'all' | 'bookmarked' | 'history';
type MainTab = 'articles' | 'glossary' | 'learning';

export default function Knowledge() {
  const navigate = useNavigate();
  const [mainTab, setMainTab] = useState<MainTab>('articles');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeArticle | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<FilterTab>('all');

  const { data: topics = [], isLoading: topicsLoading } = useKnowledgeTopics();
  const { data: articles = [], isLoading: articlesLoading } = useKnowledgeArticles(
    selectedTopic ?? undefined
  );
  const { data: searchResults = [] } = useKnowledgeSearch(searchQuery);
  const { data: bookmarks = [] } = useBookmarks();
  const { data: readingHistory = [] } = useReadingHistory();
  const markAsRead = useMarkAsRead();

  // Get bookmarked article IDs
  const bookmarkedIds = new Set(bookmarks.map(b => b.article_id));
  const readArticleIds = new Set(readingHistory.map(h => h.article_id));

  // Filter articles based on tab
  const displayedArticles = 
    searchQuery.length >= 2 ? searchResults :
    filterTab === 'bookmarked' ? articles.filter(a => bookmarkedIds.has(a.id)) :
    filterTab === 'history' ? articles.filter(a => readArticleIds.has(a.id)) :
    articles;

  // Calculate reading progress
  const totalArticles = articles.length;
  const readCount = articles.filter(a => readArticleIds.has(a.id)).length;
  const progressPercent = totalArticles > 0 ? Math.round((readCount / totalArticles) * 100) : 0;

  const handleArticleClick = (article: KnowledgeArticle) => {
    setSelectedArticle(article);
    markAsRead.mutate({ articleId: article.id, version: article.version });
  };

  const handleLearningPathArticleClick = (articleSlug: string) => {
    // Find article by slug and switch to articles tab
    const article = articles.find(a => a.slug === articleSlug);
    if (article) {
      setMainTab("articles");
      setSelectedArticle(article);
      markAsRead.mutate({ articleId: article.id, version: article.version });
    }
  };

  const handleBackToList = () => {
    setSelectedArticle(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Left Sidebar - Topics (only show for Articles tab) */}
        {mainTab === 'articles' && (
          <div className="hidden md:flex w-64 flex-col border-r border-border bg-card/50">
            <div className="p-4 border-b border-border">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Topics
              </h2>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">
                <button
                  onClick={() => setSelectedTopic(null)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                    !selectedTopic 
                      ? "bg-primary/15 text-primary font-medium" 
                      : "text-muted-foreground hover:bg-secondary"
                  )}
                >
                  <TopicIcon slug="all" isSelected={!selectedTopic} />
                  <span>All Articles</span>
                </button>
                {topics.map((topic) => (
                  <button
                    key={topic.id}
                    onClick={() => setSelectedTopic(topic.slug)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                      selectedTopic === topic.slug
                        ? "bg-primary/15 text-primary font-medium"
                        : "text-muted-foreground hover:bg-secondary"
                    )}
                  >
                    <TopicIcon slug={topic.slug} name={topic.name} isSelected={selectedTopic === topic.slug} />
                    <span className="flex-1 text-left">{topic.name}</span>
                    <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                      {topic.articleCount}
                    </Badge>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-10">
            <div className="flex items-center justify-between gap-4 mb-4">
              {selectedArticle ? (
                <Button 
                  variant="ghost" 
                  onClick={handleBackToList}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to articles
                </Button>
              ) : (
                <h1 className="text-xl md:text-2xl font-bold">Knowledge Base</h1>
              )}
              
              {/* Progress Badge */}
              <div className="flex items-center gap-2">
                <Badge 
                  variant="outline" 
                  className="gap-1.5 cursor-pointer hover:bg-secondary"
                >
                  <CheckCircle className="h-3.5 w-3.5 text-primary" />
                  {progressPercent}% Complete
                </Badge>
              </div>
            </div>

            {!selectedArticle && (
              <>
                {/* Main Tabs */}
                <Tabs value={mainTab} onValueChange={(v) => setMainTab(v as MainTab)} className="mb-4">
                  <TabsList>
                    <TabsTrigger value="articles" className="gap-1.5">
                      <BookOpen className="h-4 w-4" />
                      Articles
                    </TabsTrigger>
                    <TabsTrigger value="glossary" className="gap-1.5">
                      <BookText className="h-4 w-4" />
                      Glossary
                    </TabsTrigger>
                    <TabsTrigger value="learning" className="gap-1.5">
                      <GraduationCap className="h-4 w-4" />
                      Learning Path
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                {/* Search + Filters (Articles only) */}
                {mainTab === 'articles' && (
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="relative flex-1 max-w-full sm:max-w-md">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search articles..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    <Tabs value={filterTab} onValueChange={(v) => setFilterTab(v as FilterTab)}>
                      <TabsList className="w-full sm:w-auto">
                        <TabsTrigger value="all" className="gap-1 flex-1 sm:flex-none">
                          <BookOpen className="h-4 w-4" />
                          <span className="hidden sm:inline">All</span>
                        </TabsTrigger>
                        <TabsTrigger value="bookmarked" className="gap-1 flex-1 sm:flex-none">
                          <Bookmark className="h-4 w-4" />
                          <span className="hidden sm:inline">Bookmarked</span>
                        </TabsTrigger>
                        <TabsTrigger value="history" className="gap-1 flex-1 sm:flex-none">
                          <History className="h-4 w-4" />
                          <span className="hidden sm:inline">History</span>
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Content Area */}
          <ScrollArea className="flex-1">
            <div className="p-3 md:p-6 pb-24 md:pb-6">
              {selectedArticle ? (
                <PremiumArticleView article={selectedArticle} />
              ) : mainTab === 'glossary' ? (
                <GlossaryTab />
              ) : mainTab === 'learning' ? (
                <LearningPathTab onArticleClick={handleLearningPathArticleClick} />
              ) : (
                <ArticleGrid 
                  articles={displayedArticles}
                  bookmarkedIds={bookmarkedIds}
                  readIds={readArticleIds}
                  onArticleClick={handleArticleClick}
                  isLoading={articlesLoading}
                />
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}

// Article Grid Component
function ArticleGrid({ 
  articles, 
  bookmarkedIds,
  readIds,
  onArticleClick,
  isLoading
}: { 
  articles: KnowledgeArticle[];
  bookmarkedIds: Set<string>;
  readIds: Set<string>;
  onArticleClick: (article: KnowledgeArticle) => void;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-secondary rounded w-3/4 mb-3" />
              <div className="h-3 bg-secondary rounded w-full mb-2" />
              <div className="h-3 bg-secondary rounded w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No articles found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {articles.map((article) => (
        <Card 
          key={article.id}
          className="cursor-pointer hover:border-primary/50 transition-colors group"
          onClick={() => onArticleClick(article)}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                {article.title}
              </h3>
              <div className="flex gap-1 shrink-0">
                {bookmarkedIds.has(article.id) && (
                  <Bookmark className="h-4 w-4 text-yellow-500 fill-current" />
                )}
                {readIds.has(article.id) && (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
              </div>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {article.excerpt}
            </p>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {article.read_time_minutes} min
              </span>
              <ChevronRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Article View Component
function ArticleView({ article }: { article: KnowledgeArticle }) {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-3">{article.title}</h1>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {article.read_time_minutes} min read
          </span>
          {article.topic && (
            <Badge variant="secondary">{article.topic.name}</Badge>
          )}
        </div>
      </div>

      <div className="prose prose-invert prose-lg max-w-none">
        <div 
          className="whitespace-pre-wrap text-foreground/90 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: formatMarkdown(article.content) }}
        />
      </div>
    </div>
  );
}

function formatMarkdown(content: string): string {
  return content
    .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mt-8 mb-4 text-foreground">$1</h1>')
    .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold mt-6 mb-3 text-foreground">$1</h2>')
    .replace(/^### (.*$)/gm, '<h3 class="text-lg font-medium mt-5 mb-2 text-foreground">$1</h3>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^- (.*$)/gm, '<li class="ml-4 list-disc text-foreground/90">$1</li>')
    .replace(/^\d+\. (.*$)/gm, '<li class="ml-4 list-decimal text-foreground/90">$1</li>')
    .replace(/\n\n/g, '</p><p class="mt-4 text-foreground/90">')
    .replace(/^(.+)$/gm, '<p class="mt-4 text-foreground/90">$1</p>');
}
