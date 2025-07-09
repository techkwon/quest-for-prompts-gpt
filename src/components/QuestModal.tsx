
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
    
    // 채점 기준에 따라 점수 부여
    if (prompt.includes(problem.evaluationCriteria.clarity)) {
      score += 25;
    }
    if (prompt.includes(problem.evaluationCriteria.specificity)) {
      score += 25;
    }
    if (prompt.includes(problem.evaluationCriteria.context)) {
      score += 25;
    }
    if (prompt.includes(problem.evaluationCriteria.creativity)) {
      score += 25;
    }
    
    // 추가적인 평가 로직 (AI 모델 활용)
    // ...
    
    return Math.min(score, problem.maxScore); // 최대 점수 제한
  };

  const generateStrengths = (prompt: string, score: number): string[] => {
    const strengths = [];
    if (score >= 80) {
      strengths.push("프롬프트가 명확하고 구체적입니다.");
      strengths.push("창의적인 접근 방식이 돋보입니다.");
    } else if (score >= 60) {
      strengths.push("프롬프트가 전반적으로 양호합니다.");
    } else {
      strengths.push("개선할 여지가 있습니다. 힌트를 참고해보세요.");
    }
    return strengths;
  };

  const generateImprovements = (prompt: string, score: number): string[] => {
    const improvements = [];
    if (score < 80) {
      improvements.push("프롬프트의 명확성을 높여보세요.");
      improvements.push("구체적인 상황 설정을 추가해보세요.");
    }
    if (score < 60) {
      improvements.push("AI가 이해하기 쉽도록 문장을 다듬어보세요.");
    }
    return improvements;
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
      id: 'classroom-management-1',
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
