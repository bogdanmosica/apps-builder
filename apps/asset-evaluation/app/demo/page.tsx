'use client';

import { useState, useEffect } from 'react';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { Card, CardContent } from '@workspace/ui/components/card';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@workspace/ui/components/sheet';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@workspace/ui/components/collapsible';
import {
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Star,
  CheckCircle,
  AlertTriangle,
  Camera,
  FileText,
  ArrowRight,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

// Demo Data Model
interface Question {
  id: string;
  text: string;
  grade: 'A' | 'B' | 'C' | 'D';
  weight: number;
  rationale: string;
  evidence?: 'foto' | 'doc';
}

interface Chapter {
  id: string;
  name: string;
  score: number;
  answered: number;
  total: number;
  questions: Question[];
}

interface DemoProperty {
  id: string;
  title: string;
  yearBuilt: number;
  areaSqm: number;
  locationType: string;
}

interface DemoScoring {
  globalScore: number;
  stars: number;
  issues: {
    warnings: number;
    dangers: number;
  };
}

// Component Props
interface ChapterAccordionProps {
  chapters: Chapter[];
  expandedChapters: Set<string>;
  onToggleChapter: (chapterId: string) => void;
  onQuestionSelect: (question: Question, chapterId: string) => void;
}

interface QuestionRowProps {
  question: Question;
  chapterId: string;
  onSelect: (question: Question, chapterId: string) => void;
}

interface QuestionSheetProps {
  question: Question | null;
  chapterId: string;
  isOpen: boolean;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
}

interface ScoreChipProps {
  value: number;
  showStars?: boolean;
}

interface StatusChipsProps {
  issues: {
    warnings: number;
    dangers: number;
  };
}

interface PrimaryCTAProps {
  onClick: () => void;
  className?: string;
}

// Utility Functions
const getGradeColor = (grade: 'A' | 'B' | 'C' | 'D'): string => {
  const colorMap = {
    A: 'bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))]',
    B: 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]',
    C: 'bg-[hsl(var(--warning))] text-[hsl(var(--warning-foreground))]',
    D: 'bg-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))]'
  };
  return colorMap[grade];
};

const getGradeNumeric = (grade: 'A' | 'B' | 'C' | 'D'): number => {
  const gradeMap = { A: 1.0, B: 0.75, C: 0.5, D: 0 };
  return gradeMap[grade];
};

const trackEvent = (eventName: string, payload: any) => {
  console.log(`Analytics: ${eventName}`, payload);
};

// Score Chip Component
function ScoreChip({ value, showStars = true }: ScoreChipProps) {
  const renderStars = (score: number) => {
    const stars = [];
    const fullStars = Math.floor(score);
    const hasHalf = score % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
      } else if (i === fullStars && hasHalf) {
        stars.push(<Star key={i} className="h-4 w-4 fill-yellow-400/50 text-yellow-400" />);
      } else {
        stars.push(<Star key={i} className="h-4 w-4 text-gray-300" />);
      }
    }
    return stars;
  };

  return (
    <div className="flex items-center gap-2">
      {showStars && (
        <div className="flex items-center gap-1">
          {renderStars(Math.round(value * 2) / 2)}
        </div>
      )}
      <Badge variant="secondary" className="text-sm px-2 py-1">
        {value.toFixed(1)}/5
      </Badge>
    </div>
  );
}

// Status Chips Component
function StatusChips({ issues }: StatusChipsProps) {
  return (
    <div className="flex items-center gap-2">
      {issues.warnings > 0 && (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 text-xs">
          <AlertTriangle className="h-3 w-3 mr-1" />
          {issues.warnings} Warning{issues.warnings !== 1 ? 's' : ''}
        </Badge>
      )}
      {issues.dangers > 0 && (
        <Badge variant="destructive" className="text-xs">
          <AlertTriangle className="h-3 w-3 mr-1" />
          {issues.dangers} Issue{issues.dangers !== 1 ? 's' : ''}
        </Badge>
      )}
      {issues.warnings === 0 && issues.dangers === 0 && (
        <Badge variant="default" className="bg-green-100 text-green-700 text-xs">
          <CheckCircle className="h-3 w-3 mr-1" />
          All Good
        </Badge>
      )}
    </div>
  );
}

// Primary CTA Component
function PrimaryCTA({ onClick, className = '' }: PrimaryCTAProps) {
  return (
    <Button
      onClick={onClick}
      className={`bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 text-[hsl(var(--primary-foreground))] ${className}`}
    >
      Try the Real Checklist
      <ArrowRight className="ml-2 h-4 w-4" />
    </Button>
  );
}

// Question Row Component
function QuestionRow({ question, chapterId, onSelect }: QuestionRowProps) {
  return (
    <button
      onClick={() => onSelect(question, chapterId)}
      className="w-full p-4 text-left hover:bg-[hsl(var(--accent))] transition-colors focus-visible:ring-2 ring-[hsl(var(--ring))] rounded-lg"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 mr-4">
          <div className="flex items-center gap-3 mb-2">
            <Badge className={`text-xs px-2 py-1 ${getGradeColor(question.grade)}`}>
              {question.grade}
            </Badge>
            <Badge variant="outline" className="text-xs">
              Weight: {(question.weight * 100).toFixed(0)}%
            </Badge>
            {question.evidence && (
              <Badge variant="outline" className="text-xs">
                {question.evidence === 'foto' ? (
                  <><Camera className="h-3 w-3 mr-1" />Photo</>
                ) : (
                  <><FileText className="h-3 w-3 mr-1" />Doc</>
                )}
              </Badge>
            )}
          </div>
          <p className="text-sm font-medium text-[hsl(var(--foreground))] mb-1">
            {question.text}
          </p>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            {question.rationale}
          </p>
        </div>
        <ChevronRight className="h-4 w-4 text-[hsl(var(--muted-foreground))] flex-shrink-0" />
      </div>
    </button>
  );
}

// Question Sheet Component
function QuestionSheet({ question, chapterId, isOpen, onClose, onPrev, onNext }: QuestionSheetProps) {
  if (!question) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent 
        side="bottom" 
        className="h-[85vh] rounded-t-lg"
        role="dialog"
        aria-modal="true"
      >
        <SheetHeader>
          <SheetTitle className="text-left text-lg">
            Question Details
          </SheetTitle>
          <SheetDescription className="sr-only">
            Detailed information about the selected question
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6 space-y-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Badge className={`text-sm px-3 py-1 ${getGradeColor(question.grade)}`}>
                Grade {question.grade}
              </Badge>
              <Badge variant="outline" className="text-sm">
                Weight: {(question.weight * 100).toFixed(0)}%
              </Badge>
              {question.evidence && (
                <Badge variant="outline" className="text-sm">
                  {question.evidence === 'foto' ? (
                    <><Camera className="h-4 w-4 mr-2" />Photo Evidence</>
                  ) : (
                    <><FileText className="h-4 w-4 mr-2" />Document Evidence</>
                  )}
                </Badge>
              )}
            </div>
            <h3 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-3">
              {question.text}
            </h3>
            <p className="text-[hsl(var(--muted-foreground))] mb-4">
              {question.rationale}
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-[hsl(var(--foreground))] mb-2">
                Score Calculation
              </h4>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                Grade {question.grade} ({getGradeNumeric(question.grade).toFixed(2)}) × Weight {(question.weight * 100).toFixed(0)}% = {(getGradeNumeric(question.grade) * question.weight * 5).toFixed(2)} points
              </p>
            </div>

            <div>
              <h4 className="font-medium text-[hsl(var(--foreground))] mb-2">
                Evaluation Guidelines
              </h4>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                This assessment considers long-term impact and maintenance costs. 
                Grade A indicates excellent condition with minimal future investment needed.
              </p>
            </div>

            {question.evidence && (
              <div>
                <h4 className="font-medium text-[hsl(var(--foreground))] mb-2">
                  Supporting Evidence
                </h4>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  {question.evidence === 'foto' 
                    ? 'Photographic evidence has been attached to support this assessment.'
                    : 'Documentation is available to verify this evaluation.'
                  }
                </p>
              </div>
            )}
          </div>

          {(onPrev || onNext) && (
            <div className="flex justify-between pt-4 border-t border-[hsl(var(--border))]">
              <Button 
                variant="outline" 
                onClick={onPrev}
                disabled={!onPrev}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button 
                variant="outline" 
                onClick={onNext}
                disabled={!onNext}
                className="flex items-center gap-2"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Chapter Accordion Component
function ChapterAccordion({ chapters, expandedChapters, onToggleChapter, onQuestionSelect }: ChapterAccordionProps) {
  return (
    <div className="space-y-3">
      {chapters.map((chapter) => (
        <Card key={chapter.id} className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-lg">
          <Collapsible 
            open={expandedChapters.has(chapter.id)}
            onOpenChange={() => onToggleChapter(chapter.id)}
          >
            <CollapsibleTrigger 
              className="w-full p-4 text-left hover:bg-[hsl(var(--accent))] transition-colors focus-visible:ring-2 ring-[hsl(var(--ring))] rounded-lg"
              aria-expanded={expandedChapters.has(chapter.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 mr-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-[hsl(var(--foreground))]">
                      {chapter.name}
                    </h3>
                    <Badge variant="outline" className="text-sm">
                      {chapter.score.toFixed(1)}/5
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm text-[hsl(var(--muted-foreground))] mb-2">
                    <span>{chapter.answered}/{chapter.total} answered</span>
                    <span>{Math.round((chapter.answered / chapter.total) * 100)}% complete</span>
                  </div>
                  <div className="w-full bg-[hsl(var(--secondary))] rounded-full h-2">
                    <div
                      className="bg-[hsl(var(--primary))] h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(chapter.score / 5) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="flex-shrink-0">
                  {expandedChapters.has(chapter.id) ? (
                    <ChevronUp className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
                  )}
                </div>
              </div>
            </CollapsibleTrigger>
            
            <CollapsibleContent>
              <div className="px-4 pb-4 space-y-2">
                {chapter.questions.map((question) => (
                  <QuestionRow
                    key={question.id}
                    question={question}
                    chapterId={chapter.id}
                    onSelect={onQuestionSelect}
                  />
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      ))}
    </div>
  );
}

// Demo Data
const demoProperty: DemoProperty = {
  id: 'demo-001',
  title: '3BR New Build — Periurban',
  yearBuilt: 2022,
  areaSqm: 120,
  locationType: 'periurban'
};

const demoChapters: Chapter[] = [
  {
    id: 'utilities',
    name: 'Utilități',
    score: 4.6,
    answered: 7,
    total: 9,
    questions: [
      {
        id: 'u-01',
        text: 'Terenul este racordat la apă potabilă?',
        grade: 'A',
        weight: 0.15,
        rationale: 'Conductă prezentă, presiune adecvată.',
        evidence: 'foto'
      },
      {
        id: 'u-02',
        text: 'Branșament gaz existent și funcțional?',
        grade: 'B',
        weight: 0.15,
        rationale: 'Branșament prezent, contor nou, PIF în curs.'
      },
      {
        id: 'u-03',
        text: 'Canalizare conectată la rețeaua publică?',
        grade: 'B',
        weight: 0.10,
        rationale: 'Rețea pe stradă, racord programat.',
        evidence: 'doc'
      },
      {
        id: 'u-04',
        text: 'Rețea electrică cu putere suficientă?',
        grade: 'A',
        weight: 0.20,
        rationale: 'Branșament 380V, contor digital nou.'
      },
      {
        id: 'u-05',
        text: 'Internet fibră optică disponibil?',
        grade: 'A',
        weight: 0.05,
        rationale: 'Furnizori multipli, viteză garantată 1Gbps.'
      },
      {
        id: 'u-06',
        text: 'Sistem de încălzire centralizată?',
        grade: 'C',
        weight: 0.15,
        rationale: 'Nu există, necesită sistem propriu.'
      },
      {
        id: 'u-07',
        text: 'Evacuare ape pluviale funcțională?',
        grade: 'B',
        weight: 0.10,
        rationale: 'Sistem prezent, necesită verificări periodice.'
      }
    ]
  },
  {
    id: 'structure',
    name: 'Structură',
    score: 4.3,
    answered: 6,
    total: 8,
    questions: [
      {
        id: 's-01',
        text: 'Pereți structurali conform proiectului?',
        grade: 'A',
        weight: 0.20,
        rationale: 'Conformitate verificată vizual.'
      },
      {
        id: 's-02',
        text: 'Infiltrații vizibile la subsol?',
        grade: 'A',
        weight: 0.10,
        rationale: 'Nicio urmă de umezeală.',
        evidence: 'foto'
      },
      {
        id: 's-03',
        text: 'Fisuri în pereții exteriori?',
        grade: 'A',
        weight: 0.15,
        rationale: 'Suprafețe în stare perfectă.'
      },
      {
        id: 's-04',
        text: 'Fundația și soclu în stare bună?',
        grade: 'B',
        weight: 0.25,
        rationale: 'Mici defecte cosmetice, structură solidă.'
      },
      {
        id: 's-05',
        text: 'Acoperișul fără probleme?',
        grade: 'B',
        weight: 0.20,
        rationale: 'Țiglă în stare bună, jgheaburi funcționale.'
      },
      {
        id: 's-06',
        text: 'Instalații înglobate conform normelor?',
        grade: 'A',
        weight: 0.10,
        rationale: 'Trase conform proiectului, certificat ANRE.'
      }
    ]
  },
  {
    id: 'climate',
    name: 'Eficiență energetică',
    score: 3.9,
    answered: 5,
    total: 7,
    questions: [
      {
        id: 'e-01',
        text: 'Izolație acoperiș ≥ 20 cm?',
        grade: 'C',
        weight: 0.15,
        rationale: 'Estimat 15–18 cm.'
      },
      {
        id: 'e-02',
        text: 'Ferestre tripan cu rupere termică?',
        grade: 'B',
        weight: 0.10,
        rationale: 'Tripan pe fațade principale.'
      },
      {
        id: 'e-03',
        text: 'Izolație termică pereți exteriori?',
        grade: 'B',
        weight: 0.20,
        rationale: 'Polistiren 10cm, executie corectă.'
      },
      {
        id: 'e-04',
        text: 'Sistem ventilație cu recuperare căldură?',
        grade: 'D',
        weight: 0.15,
        rationale: 'Lipsește, doar ventilație naturală.'
      },
      {
        id: 'e-05',
        text: 'Certificat energetic clasa A sau B?',
        grade: 'C',
        weight: 0.25,
        rationale: 'Clasa C confirmată prin audit.'
      }
    ]
  }
];

const demoScoring: DemoScoring = {
  globalScore: 4.2,
  stars: 4.0,
  issues: {
    warnings: 2,
    dangers: 0
  }
};

// Main Demo Screen Component
export default function DemoPage() {
  const router = useRouter();
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(
    new Set(['utilities'])
  );
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [selectedChapterId, setSelectedChapterId] = useState<string>('');
  const [isQuestionSheetOpen, setIsQuestionSheetOpen] = useState(false);
  const [showFooterCTA, setShowFooterCTA] = useState(true);

  useEffect(() => {
    trackEvent('demo_open', { 
      source: 'route',
      isMobile: window.innerWidth < 768
    });
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = window.innerHeight;
      const scrollPercentage = scrollTop / (scrollHeight - clientHeight);
      
      // Hide footer CTA when user is near the end (80%+)
      setShowFooterCTA(scrollPercentage < 0.8);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleToggleChapter = (chapterId: string) => {
    const newExpanded = new Set(expandedChapters);
    if (newExpanded.has(chapterId)) {
      newExpanded.delete(chapterId);
    } else {
      newExpanded.add(chapterId);
    }
    setExpandedChapters(newExpanded);

    trackEvent('demo_chapter_view', { 
      chapterId, 
      chapterName: demoChapters.find(c => c.id === chapterId)?.name,
      isExpanded: newExpanded.has(chapterId),
      isMobile: window.innerWidth < 768
    });
  };

  const handleQuestionSelect = (question: Question, chapterId: string) => {
    setSelectedQuestion(question);
    setSelectedChapterId(chapterId);
    setIsQuestionSheetOpen(true);

    trackEvent('demo_question_view', { 
      questionId: question.id,
      chapterId,
      grade: question.grade,
      isMobile: window.innerWidth < 768
    });
  };

  const handleBack = () => {
    router.back();
  };

  const handlePrimaryCTA = () => {
    trackEvent('demo_primary_cta_click', { 
      globalScore: demoScoring.globalScore,
      isMobile: window.innerWidth < 768,
      location: 'header'
    });
    // Navigate to actual evaluation flow
    router.push('/evaluation');
  };

  const handleFooterCTA = () => {
    trackEvent('demo_primary_cta_click', { 
      globalScore: demoScoring.globalScore,
      isMobile: window.innerWidth < 768,
      location: 'footer'
    });
    // Navigate to actual evaluation flow
    router.push('/evaluation');
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      {/* Header (sticky) */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-[hsl(var(--border))] px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold text-[hsl(var(--foreground))]">
                Interactive Property Evaluation Demo
              </h1>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                {demoProperty.title} • {demoProperty.yearBuilt} • {demoProperty.areaSqm}m² • {demoProperty.locationType}
              </p>
            </div>
          </div>
          <PrimaryCTA onClick={handlePrimaryCTA} className="hidden sm:flex" />
        </div>
      </header>

      {/* Summary Strip (sticky) */}
      <div className="sticky top-[80px] z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm text-[hsl(var(--secondary-foreground))] px-4 py-3 border-b border-[hsl(var(--border))]">
        <div className="flex items-center gap-4 overflow-x-auto">
          <ScoreChip value={demoScoring.globalScore} />
          <StatusChips issues={demoScoring.issues} />
          <span className="text-xs text-[hsl(var(--muted-foreground))] whitespace-nowrap">
            Demo data
          </span>
        </div>
      </div>

      {/* Content (scroll area) */}
      <main className="px-4 py-6">
        <ChapterAccordion
          chapters={demoChapters}
          expandedChapters={expandedChapters}
          onToggleChapter={handleToggleChapter}
          onQuestionSelect={handleQuestionSelect}
        />
        
        {/* Final CTA */}
        <div className="mt-8 p-6 bg-gradient-to-r from-[hsl(var(--card))] to-[hsl(var(--accent))] rounded-lg border border-[hsl(var(--border))]">
          <div className="text-center space-y-4">
            <h2 className="text-xl font-bold text-[hsl(var(--foreground))]">
              Ready to evaluate your property?
            </h2>
            <p className="text-[hsl(var(--muted-foreground))]">
              This demo shows just a fraction of our full evaluation system. Get detailed insights, photo uploads, family collaboration, and more.
            </p>
            <PrimaryCTA onClick={handleFooterCTA} className="w-full sm:w-auto" />
          </div>
        </div>
      </main>

      {/* Footer CTA (sticky, conditional) */}
      {showFooterCTA && (
        <div className="sticky bottom-0 z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-t border-[hsl(var(--border))] p-4 sm:hidden">
          <PrimaryCTA onClick={handleFooterCTA} className="w-full" />
        </div>
      )}

      {/* Question Sheet */}
      <QuestionSheet
        question={selectedQuestion}
        chapterId={selectedChapterId}
        isOpen={isQuestionSheetOpen}
        onClose={() => setIsQuestionSheetOpen(false)}
      />
    </div>
  );
}
