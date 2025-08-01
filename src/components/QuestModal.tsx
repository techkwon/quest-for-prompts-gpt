import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Target, Wand2, Star, CheckCircle, XCircle, ArrowRight, Lightbulb, Trophy, BookOpen, Heart, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Quest {
  id: string;
  title: string;
  description: string;
  problems: Problem[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
}

interface Problem {
  id: string;
  question: string;
  context: string;
  hints: string[];
  evaluationCriteria: {
    clarity: string;
    specificity: string;
    context: string;
    creativity: string;
  };
  sampleAnswer: string;
  maxScore: number;
}

interface QuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (score: number, experience: number) => void;
  userLevel: number;
}

const QuestModal: React.FC<QuestModalProps> = ({ isOpen, onClose, onComplete, userLevel }) => {
  const [currentQuest, setCurrentQuest] = useState<Quest | null>(null);
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [userPrompt, setUserPrompt] = useState('');
  const [feedback, setFeedback] = useState<any>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [questStarted, setQuestStarted] = useState(false);
  const [problemScores, setProblemScores] = useState<number[]>([]);
  const [showHints, setShowHints] = useState(false);
  const { toast } = useToast();

  const [availableQuests, setAvailableQuests] = useState<Quest[]>([]);

  useEffect(() => {
    // 모달이 열릴 때마다 퀘스트 초기화
    if (isOpen) {
      generateQuest();
      setProblemScores([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (currentQuest) {
      setUserPrompt('');
      setFeedback(null);
      setCurrentProblemIndex(0);
      setProblemScores([]);
    }
  }, [currentQuest]);

  const generateQuest = () => {
    const filteredQuests = quests.filter(quest => {
      if (userLevel <= 3) return quest.difficulty === 'beginner';
      if (userLevel <= 7) return quest.difficulty !== 'advanced';
      return true;
    });
    
    const selectedQuests = [];
    while (selectedQuests.length < 3 && filteredQuests.length > 0) {
      const randomIndex = Math.floor(Math.random() * filteredQuests.length);
      const selectedQuest = filteredQuests.splice(randomIndex, 1)[0];
      selectedQuests.push(selectedQuest);
    }
    
    setAvailableQuests(selectedQuests);
    
    if (selectedQuests.length > 0) {
      setCurrentQuest(selectedQuests[0]);
      setQuestStarted(true);
    } else {
      toast({
        title: "😭 퀘스트 부족!",
        description: "현재 레벨에 맞는 퀘스트가 없습니다. 레벨을 올려주세요!",
      });
      handleClose();
    }
  };

  const evaluatePrompt = (prompt: string, problem: Problem): number => {
    let score = 0;
    const lowerPrompt = prompt.toLowerCase();
    const lowerQuestion = problem.question.toLowerCase();
    const lowerContext = problem.context.toLowerCase();
    
    // 문제나 맥락을 그대로 복사했는지 확인 (0점 처리)
    const questionSimilarity = calculateSimilarity(lowerPrompt, lowerQuestion);
    const contextSimilarity = calculateSimilarity(lowerPrompt, lowerContext);
    
    if (questionSimilarity > 0.7 || contextSimilarity > 0.5) {
      return 0; // 문제를 그대로 복사한 경우 0점
    }
    
    // 기본 점수 (프롬프트가 비어있지 않으면)
    if (prompt.trim().length > 10) {
      score += 20;
    }
    
    // 명확성 평가 (질문이나 요청이 명확한가?)
    if (lowerPrompt.includes('해주세요') || lowerPrompt.includes('만들어') || 
        lowerPrompt.includes('제안') || lowerPrompt.includes('설명') ||
        lowerPrompt.includes('도움') || lowerPrompt.includes('방법')) {
      score += 20;
    }
    
    // 구체성 평가 (구체적인 상황이나 조건이 명시되어 있는가?)
    if (lowerPrompt.includes('학년') || lowerPrompt.includes('수학') || 
        lowerPrompt.includes('영어') || lowerPrompt.includes('과학') ||
        lowerPrompt.includes('학생') || lowerPrompt.includes('교실') ||
        lowerPrompt.includes('수업')) {
      score += 20;
    }
    
    // 맥락성 평가 (교육 상황이나 배경이 설명되어 있는가?)
    if (lowerPrompt.includes('동기') || lowerPrompt.includes('흥미') || 
        lowerPrompt.includes('참여') || lowerPrompt.includes('학습') ||
        lowerPrompt.includes('교육') || lowerPrompt.includes('지도')) {
      score += 20;
    }
    
    // 창의성 평가 (구체적인 방법이나 개수를 요청하는가?)
    if (lowerPrompt.match(/\d+가지|\d+개|단계|방법|예시|활동/) ||
        lowerPrompt.includes('게임') || lowerPrompt.includes('놀이') ||
        lowerPrompt.includes('재미') || lowerPrompt.includes('창의')) {
      score += 20;
    }
    
    // 보너스 점수 (길이와 상세함)
    if (prompt.length > 100) {
      score += 10;
    }
    if (prompt.length > 200) {
      score += 10;
    }
    
    return Math.min(score, problem.maxScore);
  };

  const calculateSimilarity = (text1: string, text2: string): number => {
    const words1 = text1.split(/\s+/);
    const words2 = text2.split(/\s+/);
    const commonWords = words1.filter(word => word.length > 2 && words2.includes(word));
    return commonWords.length / Math.max(words1.length, words2.length);
  };

  const generateStrengths = (prompt: string, score: number): string[] => {
    const strengths = [];
    const lowerPrompt = prompt.toLowerCase();
    
    if (score >= 80) {
      strengths.push("프롬프트가 명확하고 구체적으로 작성되었습니다.");
      if (lowerPrompt.includes('학년') || lowerPrompt.includes('학생')) {
        strengths.push("대상 학생에 대한 구체적인 정보를 포함했습니다.");
      }
      if (lowerPrompt.match(/\d+가지|\d+개/)) {
        strengths.push("구체적인 개수를 명시하여 명확한 요청을 했습니다.");
      }
    } else if (score >= 60) {
      strengths.push("프롬프트의 기본 구조가 양호합니다.");
      if (lowerPrompt.includes('해주세요') || lowerPrompt.includes('제안')) {
        strengths.push("정중하고 명확한 요청 표현을 사용했습니다.");
      }
    } else if (score >= 40) {
      strengths.push("기본적인 요청 의도는 파악할 수 있습니다.");
    } else {
      strengths.push("프롬프트 작성을 시도해주셔서 좋습니다.");
    }
    
    return strengths;
  };

  const generateImprovements = (prompt: string, score: number): string[] => {
    const improvements = [];
    const lowerPrompt = prompt.toLowerCase();
    
    if (!lowerPrompt.includes('학년') && !lowerPrompt.includes('학생')) {
      improvements.push("대상 학생의 학년이나 특성을 명시해보세요.");
    }
    
    if (!lowerPrompt.match(/\d+가지|\d+개|단계/)) {
      improvements.push("구체적인 개수나 단계를 요청해보세요 (예: 3가지 방법).");
    }
    
    if (!lowerPrompt.includes('상황') && !lowerPrompt.includes('배경')) {
      improvements.push("구체적인 상황이나 배경을 설명해보세요.");
    }
    
    if (prompt.length < 50) {
      improvements.push("더 자세하고 구체적으로 설명해보세요.");
    }
    
    if (score < 60) {
      improvements.push("AI가 이해하기 쉽도록 명확한 문장으로 작성해보세요.");
    }
    
    return improvements.slice(0, 3); // 최대 3개의 개선점만 제시
  };

  const generateEnhancedPrompt = (prompt: string, problem: Problem): string => {
    // 개선된 프롬프트 생성 로직 (AI 모델 활용)
    return problem.sampleAnswer;
  };

  const generateTips = (score: number): string[] => {
    const tips = [];
    if (score < 60) {
      tips.push("AI에게 역할을 부여하여 더 자연스러운 답변을 유도하세요.");
      tips.push("AI가 답변 형식을 지정하도록 요청해보세요.");
    } else {
      tips.push("AI에게 긍정적인 피드백을 제공하여 동기를 부여하세요.");
    }
    return tips;
  };

  const calculateExperience = (averageScore: number): number => {
    let experience = 40;
    if (averageScore >= 90) {
      experience = 60;
    } else if (averageScore >= 80) {
      experience = 50;
    }
    return experience;
  };

  const handleClose = () => {
    setQuestStarted(false);
    setCurrentQuest(null);
    setUserPrompt('');
    setFeedback(null);
    setCurrentProblemIndex(0);
    setProblemScores([]);
    onClose();
  };

  const handleSubmitPrompt = async () => {
    if (!userPrompt.trim() || !currentQuest) return;
    
    setIsEvaluating(true);
    
    // 실제 평가 로직 시뮬레이션
    setTimeout(() => {
      const currentProblem = currentQuest.problems[currentProblemIndex];
      const score = evaluatePrompt(userPrompt, currentProblem);
      const newFeedback = {
        score,
        maxScore: currentProblem.maxScore,
        strengths: generateStrengths(userPrompt, score),
        improvements: generateImprovements(userPrompt, score),
        enhancedPrompt: generateEnhancedPrompt(userPrompt, currentProblem),
        tips: generateTips(score)
      };
      
      setFeedback(newFeedback);
      setProblemScores(prev => [...prev, score]);
      setIsEvaluating(false);
    }, 2000);
  };

  const handleNextProblem = () => {
    if (currentProblemIndex < currentQuest!.problems.length - 1) {
      setCurrentProblemIndex(prev => prev + 1);
      setUserPrompt('');
      setFeedback(null);
      setShowHints(false);
    } else {
      // 퀘스트 완료
      const totalScore = problemScores.reduce((sum, score) => sum + score, 0);
      const averageScore = Math.round(totalScore / problemScores.length);
      const experience = calculateExperience(averageScore);
      
      // 완료된 퀘스트 저장
      const completedQuest = {
        id: Date.now(),
        questTitle: currentQuest!.title,
        score: averageScore,
        completedAt: new Date().toISOString(),
        problems: currentQuest!.problems.length
      };
      
      const savedPrompts = JSON.parse(localStorage.getItem('promptLibrary') || '[]');
      savedPrompts.push(completedQuest);
      localStorage.setItem('promptLibrary', JSON.stringify(savedPrompts));
      
      onComplete(averageScore, experience);
      handleClose();
    }
  };

  const quests: Quest[] = [
    {
      id: 'basic-ai-chat-1',
      title: 'AI 대화 기초',
      description: 'AI와 효과적으로 대화하는 기본 방법을 배워보세요',
      difficulty: 'beginner',
      category: 'AI 기초',
      problems: [
        {
          id: 'simple-question',
          question: '간단한 질문하기',
          context: '초등학교 5학년 학생이 AI에게 과학 숙제에 대해 질문을 하려고 합니다. "태양계"라는 주제로 AI가 이해하기 쉽게 설명해줄 수 있는 프롬프트를 작성해주세요.',
          hints: [
            '학생의 학년을 명시해보세요',
            '구체적인 주제(태양계)를 포함해보세요',
            '설명 방식을 요청해보세요'
          ],
          evaluationCriteria: {
            clarity: '질문이 명확하고 이해하기 쉬운가?',
            specificity: '학년과 주제가 구체적으로 명시되어 있는가?',
            context: '학습 목적이 명확한가?',
            creativity: '효과적인 설명 방식을 요청하는가?'
          },
          sampleAnswer: '초등학교 5학년 학생이 이해할 수 있도록 태양계의 8개 행성을 순서대로 설명해주세요. 각 행성의 특징을 재미있는 비유를 사용해서 설명해주세요.',
          maxScore: 100
        },
        {
          id: 'story-request',
          question: '창작 이야기 요청하기',
          context: '유치원생들을 위한 동화를 AI에게 부탁하려고 합니다. 동물이 주인공인 짧은 이야기를 만들어달라는 프롬프트를 작성해주세요.',
          hints: [
            '대상 연령을 명시해보세요',
            '주인공과 소재를 구체적으로 요청해보세요',
            '이야기의 길이나 교훈을 포함해보세요'
          ],
          evaluationCriteria: {
            clarity: '요청사항이 명확한가?',
            specificity: '연령대와 주제가 구체적인가?',
            context: '유치원생에게 적합한 내용인가?',
            creativity: '흥미로운 요소를 포함하는가?'
          },
          sampleAnswer: '유치원생(5-7세)을 위한 토끼가 주인공인 5분 분량의 동화를 만들어주세요. 친구와의 우정에 대한 교훈이 담긴 따뜻하고 재미있는 이야기여야 합니다.',
          maxScore: 100
        },
        {
          id: 'homework-help',
          question: '숙제 도움 요청하기',
          context: '중학교 1학년 학생이 수학 숙제를 하다가 모르는 문제가 생겼습니다. AI에게 문제 해결 방법을 단계적으로 설명해달라는 프롬프트를 작성해주세요.',
          hints: [
            '학년과 과목을 명시해보세요',
            '설명 방식(단계적)을 요청해보세요',
            '이해하기 쉬운 방법을 부탁해보세요'
          ],
          evaluationCriteria: {
            clarity: '도움 요청이 명확한가?',
            specificity: '학년과 과목이 구체적인가?',
            context: '학습 목적이 분명한가?',
            creativity: '효과적인 학습 방법을 요청하는가?'
          },
          sampleAnswer: '중학교 1학년 학생이 이해할 수 있도록 일차방정식 문제 풀이 과정을 단계별로 설명해주세요. 각 단계마다 왜 그렇게 하는지 이유도 함께 설명해주세요.',
          maxScore: 100
        }
      ]
    },
    {
      id: 'classroom-management-2',
      title: '교실 관리 도우미',
      description: '학급 운영에 도움이 되는 AI 활용법을 배워보세요',
      difficulty: 'beginner',
      category: '교실 관리',
      problems: [
        {
          id: 'student-motivation',
          question: '학습 동기가 낮은 학생들을 위한 AI 도우미 만들기',  
          context: '중학교 2학년 수학 시간에 학습 동기가 낮아 수업 참여도가 떨어지는 학생들이 있습니다. 이들이 수학에 흥미를 가질 수 있도록 도와줄 AI 도우미를 위한 프롬프트를 작성해주세요.',
          hints: [
            '학생의 연령과 학년을 명시해보세요',
            '구체적인 과목(수학)과 상황을 포함해보세요', 
            '동기부여 방법을 구체적으로 요청해보세요'
          ],
          evaluationCriteria: {
            clarity: '요청사항이 명확하고 이해하기 쉬운가?',
            specificity: '학년, 과목, 상황이 구체적으로 명시되어 있는가?',
            context: '교실 상황과 학생 특성이 잘 설명되어 있는가?',
            creativity: '창의적이고 실용적인 접근법을 요청하고 있는가?'
          },
          sampleAnswer: '중학교 2학년 수학 수업에서 학습 동기가 낮은 학생들의 흥미를 높이기 위한 게임화된 학습 방법을 3가지 제안해주세요. 각 방법은 일상생활과 연결된 실용적인 예시를 포함하고, 학생들이 성취감을 느낄 수 있는 단계별 목표를 제시해주세요.',
          maxScore: 100
        },
        {
          id: 'behavior-management',
          question: '수업 시간 산만한 학생 관리법',
          context: '초등학교 4학년 교실에서 몇몇 학생들이 수업 시간에 자주 떠들거나 딴짓을 하여 다른 학생들의 학습을 방해합니다. 이런 상황을 개선할 수 있는 AI 어시스턴트를 위한 프롬프트를 작성하세요.',
          hints: [
            '구체적인 행동 문제를 명시해보세요',
            '긍정적인 해결 방안을 요청해보세요',
            '예방책과 대응책을 모두 포함해보세요'
          ],
          evaluationCriteria: {
            clarity: '문제 상황과 해결 방향이 명확한가?',
            specificity: '학생 연령과 구체적 행동이 명시되어 있는가?',
            context: '교실 환경과 영향을 고려했는가?',
            creativity: '다양하고 실용적인 접근법을 요청하는가?'
          },
          sampleAnswer: '초등학교 4학년 교실에서 수업 중 떠드는 학생들을 관리하기 위한 긍정적 행동 지원 전략을 5가지 제안해주세요. 각 전략은 예방적 접근과 즉시 대응 방법을 포함하고, 학생들의 자기조절 능력을 기를 수 있는 방법이어야 합니다.',
          maxScore: 100
        },
        {
          id: 'parent-communication',
          question: '학부모 소통 개선하기',
          context: '초등학교 3학년 담임교사로서 학부모와의 소통을 개선하고 싶습니다. 학생의 학교생활과 학습 상황을 효과적으로 전달할 수 있는 AI 소통 도우미를 위한 프롬프트를 작성하세요.',
          hints: [
            '소통의 목적을 명확히 해보세요',
            '전달할 내용의 종류를 구체적으로 명시해보세요',
            '긍정적이고 건설적인 소통 방식을 요청해보세요'
          ],
          evaluationCriteria: {
            clarity: '소통 목적이 명확한가?',
            specificity: '학년과 소통 내용이 구체적인가?',
            context: '학부모의 관심사를 고려했는가?',
            creativity: '효과적인 소통 방법을 요청하는가?'
          },
          sampleAnswer: '초등학교 3학년 학부모에게 자녀의 학교생활 적응 상황과 학습 진도를 긍정적이고 구체적으로 전달하는 방법을 5가지 제안해주세요. 각 방법은 학부모의 우려를 해소하고 가정에서의 지원 방안도 포함해야 합니다.',
          maxScore: 100
        }
      ]
    },
    {
      id: 'creative-writing-3',
      title: '창의적 글쓰기 지도',
      description: '학생들의 창의성을 키우는 글쓰기 활동을 만들어보세요',
      difficulty: 'beginner',
      category: '창의 교육',
      problems: [
        {
          id: 'story-prompt',
          question: '상상력을 키우는 이야기 만들기',
          context: '초등학교 6학년 학생들의 창의적 글쓰기 능력을 향상시키고 싶습니다. 학생들이 흥미를 가질 수 있는 이야기 소재와 글쓰기 가이드를 제공하는 AI 튜터를 위한 프롬프트를 작성하세요.',
          hints: [
            '학생들의 학년과 관심사를 고려해보세요',
            '창의적 사고를 유도하는 질문을 포함해보세요',
            '단계별 글쓰기 과정을 요청해보세요'
          ],
          evaluationCriteria: {
            clarity: '글쓰기 목표가 명확한가?',
            specificity: '학년과 활동 내용이 구체적인가?',
            context: '창의성 개발에 적합한가?',
            creativity: '흥미로운 접근법을 요청하는가?'
          },
          sampleAnswer: '초등학교 6학년 학생들이 "미래의 학교"를 주제로 상상력 넘치는 이야기를 쓸 수 있도록 3단계 글쓰기 가이드를 만들어주세요. 각 단계마다 창의적 사고를 자극하는 질문과 구체적인 작성 방법을 포함해주세요.',
          maxScore: 100
        }
      ]
    },
    {
      id: 'lesson-plan-2',
      title: '맞춤형 수업 계획',
      description: '학생 수준별 맞춤 수업 계획을 짜보세요',
      difficulty: 'intermediate',
      category: '수업 계획',
      problems: [
        {
          id: 'differentiated-instruction',
          question: '수준별 맞춤 학습 계획',
          context: '고등학교 1학년 영어 수업에서 학생들의 영어 실력이 매우 다양합니다. 학생들의 수준에 맞춰 개별 학습 목표를 설정하고, 맞춤형 학습 활동을 제안하는 AI 튜터를 위한 프롬프트를 작성하세요.',
          hints: [
            '학생들의 수준을 세 단계로 나누어 보세요 (예: 초급, 중급, 고급)',
            '각 수준별 학습 목표를 구체적으로 설정하세요',
            'AI 튜터가 각 수준에 맞는 학습 활동을 제안하도록 요청하세요'
          ],
          evaluationCriteria: {
            clarity: '요청사항이 명확하고 이해하기 쉬운가?',
            specificity: '학생 수준별 학습 목표가 구체적으로 명시되어 있는가?',
            context: '학생들의 영어 실력 수준이 다양하다는 점을 명확히 언급했는가?',
            creativity: 'AI 튜터가 창의적이고 실용적인 학습 활동을 제안하도록 요청하고 있는가?'
          },
          sampleAnswer: '고등학교 1학년 영어 수업에서 학생들의 영어 실력을 초급, 중급, 고급의 세 단계로 나누고, 각 수준별로 개별 학습 목표를 설정하고, 맞춤형 학습 활동을 3가지씩 제안하는 AI 튜터를 만들어주세요. AI 튜터는 각 학생의 학습 진도를 추적하고, 필요에 따라 추가적인 학습 자료를 제공해야 합니다.',
          maxScore: 100
        },
        {
          id: 'interactive-science',
          question: '실험 중심 과학 수업 설계',
          context: '중학교 3학년 화학 단원에서 학생들이 직접 실험을 통해 학습할 수 있는 수업을 계획하고 있습니다. 안전하면서도 흥미로운 실험 활동을 제안하고 지도할 수 있는 AI 실험 도우미를 위한 프롬프트를 작성하세요.',
          hints: [
            '실험 안전 수칙을 포함해보세요',
            '단계별 실험 절차를 요청해보세요',
            '실험 결과 해석 방법을 포함해보세요'
          ],
          evaluationCriteria: {
            clarity: '실험 목표와 절차가 명확한가?',
            specificity: '화학 단원과 안전 요구사항이 구체적인가?',
            context: '중학생 수준에 적합한 난이도인가?',
            creativity: '흥미롭고 교육적인 실험을 요청하는가?'
          },
          sampleAnswer: '중학교 3학년 화학 수업에서 산염기 반응을 주제로 한 안전한 실험 3가지를 설계하고, 각 실험의 준비물, 안전 수칙, 단계별 절차, 예상 결과, 교육적 의미를 상세히 설명해주세요. 학생들이 실험 과정에서 과학적 사고력을 기를 수 있는 질문들도 포함해주세요.',
          maxScore: 100
        }
      ]
    },
    {
      id: 'assessment-design-3',
      title: '창의적 평가 설계',
      description: '학생 참여형 평가 방법으로 수업을 혁신하세요',
      difficulty: 'advanced',
      category: '평가 설계',
      problems: [
        {
          id: 'innovative-assessment',
          question: '학생 참여형 평가 방법',
          context: '고등학교 2학년 과학 수업에서 학생들의 참여를 유도하고, 창의성을 평가할 수 있는 새로운 평가 방법을 도입하려고 합니다. 학생들이 직접 참여하여 평가 과정을 즐기고, 동료 학생들과 협력하여 학습할 수 있는 평가 방식을 설계하는 AI 평가 전문가를 위한 프롬프트를 작성하세요.',
          hints: [
            '학생들이 평가 과정에 직접 참여하는 방식을 구체적으로 제시하세요',
            '학생들의 창의성을 평가할 수 있는 기준을 명확하게 설정하세요',
            '동료 평가, 자기 평가, 프로젝트 발표 등 다양한 평가 요소를 활용하세요'
          ],
          evaluationCriteria: {
            clarity: '요청사항이 명확하고 이해하기 쉬운가?',
            specificity: '학생 참여 방식과 창의성 평가 기준이 구체적으로 명시되어 있는가?',
            context: '학생 참여를 유도하고 창의성을 평가해야 한다는 점을 명확히 언급했는가?',
            creativity: 'AI 평가 전문가가 창의적이고 혁신적인 평가 방식을 제안하도록 요청하고 있는가?'
          },
          sampleAnswer: '고등학교 2학년 과학 수업에서 학생들이 팀을 이루어 과학 프로젝트를 수행하고, 프로젝트 결과물을 발표하는 평가 방식을 설계해주세요. 학생들은 동료 평가, 자기 평가, 교사 평가를 통해 점수를 받게 되며, 창의성, 협동심, 문제 해결 능력, 발표 능력 등을 평가 기준으로 활용합니다. AI 평가 전문가는 학생들이 평가 과정에 적극적으로 참여하고, 서로 협력하여 학습할 수 있도록 평가 도구와 가이드라인을 제공해야 합니다.',
          maxScore: 100
        }
      ]
    },
    {
      id: 'digital-literacy-4',
      title: 'AI 시대 디지털 리터러시',
      description: '학생들의 AI 활용 능력을 기르는 수업을 설계하세요',
      difficulty: 'beginner',
      category: '디지털 교육',
      problems: [
        {
          id: 'ai-prompt-education',
          question: '학생용 AI 프롬프트 교육',
          context: '고등학교 1학년 학생들에게 AI를 올바르게 활용하는 방법을 가르치려고 합니다. 특히 효과적인 프롬프트 작성법을 교육하여 학습 도구로서 AI를 활용할 수 있도록 지도하는 AI 교육 전문가를 위한 프롬프트를 작성하세요.',
          hints: [
            '학생들의 수준에 맞는 AI 활용법을 포함하세요',
            '윤리적 AI 사용법을 강조하세요',
            '실습 활동을 포함한 단계별 교육을 요청하세요'
          ],
          evaluationCriteria: {
            clarity: 'AI 교육 목표와 방법이 명확한가?',
            specificity: '프롬프트 작성 기법이 구체적으로 제시되는가?',
            context: '고등학생 수준에 적합한 내용인가?',
            creativity: '실용적이고 윤리적인 AI 활용을 강조하는가?'
          },
          sampleAnswer: '고등학교 1학년 학생들을 대상으로 AI 프롬프트 작성의 기초부터 고급 기법까지 단계별로 교육하는 4주차 커리큘럼을 설계해주세요. 각 주차별로 이론 설명, 실습 활동, 윤리적 사용법을 포함하고, 학생들이 학습에 AI를 효과적으로 활용할 수 있는 구체적인 예시를 제공해주세요.',
          maxScore: 100
        },
        {
          id: 'coding-basics',
          question: '초보자를 위한 프로그래밍 입문',
          context: '중학교 2학년 학생들에게 처음으로 프로그래밍을 가르치려고 합니다. 스크래치나 블록 코딩을 활용하여 논리적 사고력을 기르고, 컴퓨팅 사고력을 개발할 수 있는 AI 코딩 튜터를 위한 프롬프트를 작성하세요.',
          hints: [
            '연령에 적합한 프로그래밍 도구를 선택하세요',
            '단계별 학습 계획을 포함하세요',
            '재미있는 프로젝트 활동을 요청하세요'
          ],
          evaluationCriteria: {
            clarity: '학습 목표와 교육 방법이 명확한가?',
            specificity: '사용할 도구와 교육 과정이 구체적인가?',
            context: '중학생 수준에 적합한 난이도인가?',
            creativity: '흥미로운 프로젝트와 활동을 포함하는가?'
          },
          sampleAnswer: '중학교 2학년 학생들을 위한 스크래치 기반 프로그래밍 입문 과정을 8주간 설계해주세요. 각 주차별로 핵심 개념, 실습 프로젝트, 창의적 과제를 포함하고, 학생들이 간단한 게임이나 애니메이션을 만들 수 있도록 단계별 가이드를 제공해주세요.',
          maxScore: 100
        }
      ]
    },
    {
      id: 'inclusive-education-5',
      title: '포용적 교육 설계',
      description: '모든 학생이 참여할 수 있는 수업을 만들어보세요',
      difficulty: 'intermediate',
      category: '포용교육',
      problems: [
        {
          id: 'special-needs-support',
          question: '특수교육 대상 학생 지원',
          context: '일반 학급에 발달장애가 있는 학생이 통합되어 수업을 받고 있습니다. 이 학생이 다른 학생들과 함께 의미 있는 학습 경험을 할 수 있도록 지원하는 AI 보조교사를 위한 프롬프트를 작성하세요.',
          hints: [
            '개별 맞춤형 지원 방법을 포함하세요',
            '다른 학생들과의 상호작용을 고려하세요',
            '구체적인 교수법을 요청하세요'
          ],
          evaluationCriteria: {
            clarity: '지원 목표와 방법이 명확한가?',
            specificity: '발달장애 학생의 특성을 고려했는가?',
            context: '통합교육 환경을 이해하고 있는가?',
            creativity: '포용적이고 효과적인 교수법을 요청하는가?'
          },
          sampleAnswer: '일반 학급에 통합된 발달장애 학생을 위한 개별화 교육 지원 계획을 수립해주세요. 학생의 강점과 어려움을 파악하고, 수업 참여를 높이는 교수적 수정사항, 또래와의 협력 활동, 평가 방법의 조정을 포함한 종합적인 지원 전략을 제시해주세요.',
          maxScore: 100
        }
      ]
    },
    {
      id: 'steam-education-6',
      title: 'STEAM 융합교육',
      description: '과학, 기술, 공학, 예술, 수학을 융합한 창의적 수업을 설계하세요',
      difficulty: 'advanced',
      category: 'STEAM',
      problems: [
        {
          id: 'environmental-project',
          question: '환경보호 융합 프로젝트',
          context: '고등학교에서 환경보호를 주제로 한 STEAM 프로젝트를 진행하려고 합니다. 학생들이 과학적 지식, 기술적 해결책, 예술적 표현을 모두 활용하여 환경 문제를 해결하는 창의적 프로젝트를 설계하는 AI STEAM 코디네이터를 위한 프롬프트를 작성하세요.',
          hints: [
            '5개 영역의 융합 방법을 구체적으로 제시하세요',
            '실제 환경 문제와 연결하세요',
            '학생 주도적 활동을 강조하세요'
          ],
          evaluationCriteria: {
            clarity: '프로젝트 목표와 진행 방식이 명확한가?',
            specificity: 'STEAM 각 영역의 역할이 구체적인가?',
            context: '환경보호 주제가 잘 반영되어 있는가?',
            creativity: '창의적이고 실현 가능한 프로젝트인가?'
          },
          sampleAnswer: '고등학생들이 팀을 이루어 지역 환경 문제를 선정하고, 과학적 조사, 기술적 해결책 개발, 공학적 프로토타입 제작, 예술적 홍보물 제작, 수학적 데이터 분석을 통해 종합적인 환경보호 캠페인을 기획하는 12주간의 STEAM 프로젝트를 설계해주세요.',
          maxScore: 100
        }
      ]
    }
  ];

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-purple-50 via-pink-50 to-magic-50 border-0 rounded-3xl shadow-2xl">
        <DialogHeader className="border-b border-purple-100 pb-4 mb-6">
          <DialogTitle className="flex items-center gap-3 text-2xl font-bold">
            <div className="w-10 h-10 bg-gradient-to-r from-magic-300 to-purple-300 rounded-full flex items-center justify-center">
              <Target className="h-6 w-6 text-white" />
            </div>
            <span className="bg-gradient-to-r from-magic-500 to-purple-500 bg-clip-text text-transparent">
              {!questStarted ? '프롬프트 퀘스트' : currentQuest?.title}
            </span>
            {questStarted && (
              <Badge className="bg-gradient-to-r from-magic-300 to-purple-300 text-gray-700 border-0 rounded-full px-3 py-1">
                레벨 {userLevel}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        {!questStarted ? (
          <div className="space-y-6">
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-gradient-to-r from-magic-300 to-purple-300 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Wand2 className="h-10 w-10 text-white animate-pulse" />
              </div>
              <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-magic-500 to-purple-500 bg-clip-text text-transparent">
                랜덤 퀘스트 3개에 도전하세요!
              </h3>
              <p className="text-gray-500 mb-6 text-lg flex items-center justify-center gap-2">
                <Heart className="h-5 w-5 text-pink-300" />
                문제 하나씩 풀고 피드백을 받아 실력을 향상시킬 수 있습니다
                <Heart className="h-5 w-5 text-pink-300" />
              </p>
              <Button 
                onClick={generateQuest}
                className="bg-gradient-to-r from-magic-300 to-purple-300 hover:from-magic-400 hover:to-purple-400 text-gray-700 hover:text-white px-8 py-3 rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
              >
                <Sparkles className="h-5 w-5 mr-2" />
                퀘스트 시작하기
              </Button>
            </div>

            <Card className="bg-gradient-to-r from-magic-50 to-purple-50 border-0 rounded-2xl shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-magic-600">
                  <BookOpen className="h-5 w-5" />
                  사용 가능한 퀘스트 미리보기:
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {quests.slice(0, 6).map((quest, index) => (
                  <div key={quest.id} className="flex items-center justify-between p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-all">
                    <div>
                      <div className="font-semibold text-gray-700 flex items-center gap-2">
                        <div className="w-2 h-2 bg-gradient-to-r from-magic-300 to-purple-300 rounded-full"></div>
                        {quest.title}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">{quest.description}</div>
                    </div>
                    <Badge 
                      className={`${
                        quest.difficulty === 'beginner' ? 'bg-success-200 hover:bg-success-300 text-success-700' : 
                        quest.difficulty === 'intermediate' ? 'bg-wisdom-200 hover:bg-wisdom-300 text-wisdom-700' : 
                        'bg-magic-200 hover:bg-magic-300 text-magic-700'
                      } border-0 rounded-full px-3 py-1`}
                    >
                      {quest.difficulty === 'beginner' ? '초급' : 
                       quest.difficulty === 'intermediate' ? '중급' : '고급'}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        ) : currentQuest && (
          <div className="space-y-6">
            {/* Progress Bar */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">
                  문제 {currentProblemIndex + 1} / {currentQuest.problems.length}
                </span>
                <span className="text-sm text-gray-500">
                  {problemScores.length > 0 && `평균: ${Math.round(problemScores.reduce((a, b) => a + b, 0) / problemScores.length)}점`}
                </span>
              </div>
              <Progress 
                value={((currentProblemIndex) / currentQuest.problems.length) * 100} 
                className="h-3 bg-gray-100 rounded-full overflow-hidden"
              />
            </div>

            {/* Current Problem */}
            <Card className="bg-gradient-to-br from-white to-magic-50 border-0 rounded-2xl shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-magic-600">
                  <div className="w-8 h-8 bg-gradient-to-r from-magic-300 to-purple-300 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {currentProblemIndex + 1}
                  </div>
                  {currentQuest.problems[currentProblemIndex].question}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                  <p className="text-gray-600 leading-relaxed">
                    {currentQuest.problems[currentProblemIndex].context}
                  </p>
                </div>

                {!showHints ? (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowHints(true)}
                    className="border-magic-200 text-magic-600 hover:bg-magic-50 bg-white rounded-xl"
                  >
                    <Lightbulb className="h-4 w-4 mr-2" />
                    힌트 보기
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-magic-600 flex items-center gap-2">
                      <Lightbulb className="h-4 w-4" />
                      힌트:
                    </h4>
                    <ul className="space-y-2">
                      {currentQuest.problems[currentProblemIndex].hints.map((hint, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-gray-500">
                          <span className="w-5 h-5 bg-magic-100 rounded-full flex items-center justify-center text-magic-600 text-xs font-bold mt-0.5 flex-shrink-0">
                            {index + 1}
                          </span>
                          {hint}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Prompt Input */}
            <Card className="bg-white border-0 rounded-2xl shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg text-gray-700">프롬프트 작성하기</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={userPrompt}
                  onChange={(e) => setUserPrompt(e.target.value)}
                  placeholder="AI에게 요청할 프롬프트를 작성해주세요..."
                  className="min-h-32 border-gray-100 rounded-xl focus:border-magic-300 focus:ring-magic-300 bg-white"
                  disabled={isEvaluating || !!feedback}
                />
                
                {!feedback && (
                  <Button 
                    onClick={handleSubmitPrompt}
                    disabled={isEvaluating || !userPrompt.trim()}
                    className="w-full bg-gradient-to-r from-magic-300 to-purple-300 hover:from-magic-400 hover:to-purple-400 text-gray-700 hover:text-white rounded-xl py-3 font-semibold shadow-lg hover:shadow-xl transition-all"
                  >
                    {isEvaluating ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-gray-700 border-t-transparent rounded-full animate-spin"></div>
                        평가 중...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4" />
                        프롬프트 제출하기
                      </div>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Feedback Section */}
            {feedback && (
              <Card className="bg-gradient-to-br from-white to-success-50 border-0 rounded-2xl shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      feedback.score >= 80 ? 'bg-success-200' : feedback.score >= 60 ? 'bg-wisdom-200' : 'bg-pink-200'
                    }`}>
                      {feedback.score >= 80 ? 
                        <CheckCircle className="h-6 w-6 text-success-600" /> : 
                        <XCircle className="h-6 w-6 text-pink-600" />
                      }
                    </div>
                    <span className="text-gray-700">
                      채점 결과: {feedback.score}점 / {feedback.maxScore}점
                    </span>
                    {feedback.score >= 80 && (
                      <Badge className="bg-success-200 text-success-700 border-0 rounded-full px-3 py-1">
                        우수!
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* 강점 */}
                  <div className="p-4 bg-gradient-to-r from-success-50 to-magic-50 rounded-xl border border-success-100">
                    <h4 className="font-semibold text-success-600 mb-2 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      잘한 점:
                    </h4>
                    <ul className="space-y-1">
                      {feedback.strengths.map((strength: string, index: number) => (
                        <li key={index} className="text-success-500 text-sm">• {strength}</li>
                      ))}
                    </ul>
                  </div>

                  {/* 개선점 */}
                  {feedback.improvements.length > 0 && (
                    <div className="p-4 bg-gradient-to-r from-wisdom-50 to-pink-50 rounded-xl border border-wisdom-100">
                      <h4 className="font-semibold text-wisdom-600 mb-2 flex items-center gap-2">
                        <Lightbulb className="h-4 w-4" />
                        개선할 점:
                      </h4>
                      <ul className="space-y-1">
                        {feedback.improvements.map((improvement: string, index: number) => (
                          <li key={index} className="text-wisdom-500 text-sm">• {improvement}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* 개선된 프롬프트 */}
                  <div className="p-4 bg-gradient-to-r from-magic-50 to-purple-50 rounded-xl border border-magic-100">
                    <h4 className="font-semibold text-magic-600 mb-2 flex items-center gap-2">
                      <Wand2 className="h-4 w-4" />
                      개선된 프롬프트 예시:
                    </h4>
                    <p className="text-magic-500 text-sm bg-white p-3 rounded-lg border border-magic-100 italic">
                      "{feedback.enhancedPrompt}"
                    </p>
                  </div>

                  {/* 팁 */}
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                    <h4 className="font-semibold text-purple-600 mb-2 flex items-center gap-2">
                      <Trophy className="h-4 w-4" />
                      프롬프트 작성 팁:
                    </h4>
                    <ul className="space-y-1">
                      {feedback.tips.map((tip: string, index: number) => (
                        <li key={index} className="text-purple-500 text-sm">💡 {tip}</li>
                      ))}
                    </ul>
                  </div>

                  <Button 
                    onClick={handleNextProblem}
                    className="w-full bg-gradient-to-r from-magic-300 to-purple-300 hover:from-magic-400 hover:to-purple-400 text-gray-700 hover:text-white rounded-xl py-3 font-semibold shadow-lg hover:shadow-xl transition-all"
                  >
                    {currentProblemIndex < currentQuest.problems.length - 1 ? (
                      <div className="flex items-center gap-2">
                        다음 문제로
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4" />
                        퀘스트 완료하기
                      </div>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default QuestModal;
