import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, Send, CheckCircle, XCircle, Lightbulb, Target, Star, ArrowRight, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (score: number, experience: number) => void;
  userLevel: number;
}

interface Quest {
  id: string;
  title: string;
  description: string;
  scenario: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  requiredLevel: number;
}

interface Feedback {
  score: number;
  strengths: string[];
  improvements: string[];
  recommendedPrompt: string;
  explanation: string;
}

const allQuests: Quest[] = [
  // 레벨 1 퀘스트 (초급)
  {
    id: '1-1',
    title: '산만한 학생 대응',
    description: '수업 중 계속 태블릿으로 게임을 하는 학생을 도와주세요',
    scenario: '학생 A는 매 수업시간마다 태블릿으로 게임을 합니다. 다른 학생들에게도 영향을 주고 있어 대책이 필요합니다. AI가 이 상황을 해결할 수 있도록 적절한 프롬프트를 작성해주세요.',
    difficulty: 'easy',
    category: '학급 관리',
    requiredLevel: 1
  },
  {
    id: '1-2',
    title: '수업 참여 독려',
    description: '조용한 학생들의 수업 참여를 높이고 싶습니다',
    scenario: '우리 반 학생들은 대부분 조용하고 발표를 꺼려합니다. 수업 중 질문을 해도 대답하는 학생이 거의 없어서 일방적인 강의가 되고 있습니다. AI가 이런 상황을 개선할 방법을 제안하도록 프롬프트를 작성해주세요.',
    difficulty: 'easy',
    category: '수업 참여',
    requiredLevel: 1
  },
  {
    id: '1-3',
    title: '숙제 미제출 학생',
    description: '숙제를 자주 안 해오는 학생에 대한 지도 방안이 필요합니다',
    scenario: '학생 B는 거의 매일 숙제를 안 해옵니다. 부모님께 연락해도 일시적으로만 개선되고 다시 원래대로 돌아갑니다. AI가 이 학생을 동기부여할 수 있는 방법을 제안하도록 프롬프트를 작성해주세요.',
    difficulty: 'easy',
    category: '학습 지도',
    requiredLevel: 1
  },
  
  // 레벨 2 퀘스트 (중급)
  {
    id: '2-1',
    title: '학부모 상담 준비',
    description: '학부모와의 상담을 위한 자료를 준비해야 합니다',
    scenario: '다음 주에 학부모 상담이 예정되어 있습니다. 학생의 학습 상황과 개선 방안에 대해 구체적이고 건설적인 이야기를 나누고 싶습니다. AI가 상담 내용을 준비할 수 있도록 프롬프트를 작성해주세요.',
    difficulty: 'medium',
    category: '상담 및 소통',
    requiredLevel: 2
  },
  {
    id: '2-2',
    title: '학급 갈등 해결',
    description: '학생들 간의 갈등을 중재해야 하는 상황입니다',
    scenario: '최근 학급에서 두 그룹 간의 갈등이 생겼습니다. 서로 말을 하지 않고 수업 분위기도 좋지 않습니다. 이 상황을 중재하고 학급 분위기를 개선할 수 있는 방법을 AI가 제안하도록 프롬프트를 작성해주세요.',
    difficulty: 'medium',
    category: '학급 관리',
    requiredLevel: 2
  },
  {
    id: '2-3',
    title: '개별 학습 계획',
    description: '학습 부진 학생을 위한 맞춤형 학습 계획이 필요합니다',
    scenario: '학생 C는 기초 학력이 부족하여 수업을 따라오기 어려워합니다. 다른 학생들과의 학습 격차가 점점 벌어지고 있어 개별적인 지도가 필요한 상황입니다. AI가 이 학생만의 학습 계획을 세우도록 프롬프트를 작성해주세요.',
    difficulty: 'medium',
    category: '학습 지도',
    requiredLevel: 2
  },
  
  // 레벨 3 퀘스트 (고급)
  {
    id: '3-1',
    title: '창의적 수업 활동 기획',
    description: '지루한 수업을 흥미롭게 만들 방법이 필요합니다',
    scenario: '이번 주 과학 시간에 \'물질의 상태 변화\'를 다룰 예정입니다. 학생들이 지루해하지 않고 적극적으로 참여할 수 있는 창의적인 활동을 기획하고 싶습니다. AI가 도움을 줄 수 있도록 프롬프트를 작성해주세요.',
    difficulty: 'hard',
    category: '수업 설계',
    requiredLevel: 3
  },
  {
    id: '3-2',
    title: '융합 교육 프로그램',
    description: '여러 과목을 연계한 융합 수업을 설계해야 합니다',
    scenario: '다음 달에 \'환경 보호\'를 주제로 한 융합 수업을 진행할 예정입니다. 과학, 사회, 국어, 미술 등 여러 과목을 연계하여 의미 있는 프로젝트를 만들고 싶습니다. AI가 구체적인 융합 교육 프로그램을 설계하도록 프롬프트를 작성해주세요.',
    difficulty: 'hard',
    category: '수업 설계',
    requiredLevel: 3
  },
  {
    id: '3-3',
    title: '학급 문화 개선',
    description: '학급의 전반적인 문화와 분위기를 개선해야 합니다',
    scenario: '우리 학급은 경쟁이 치열하고 협력보다는 개인주의적인 분위기입니다. 학생들이 서로 도우며 함께 성장할 수 있는 긍정적인 학급 문화를 만들고 싶습니다. AI가 학급 문화 개선을 위한 종합적인 계획을 제안하도록 프롬프트를 작성해주세요.',
    difficulty: 'hard',
    category: '학급 관리',
    requiredLevel: 3
  }
];

const QuestModal: React.FC<QuestModalProps> = ({ isOpen, onClose, onComplete, userLevel }) => {
  const [availableQuests, setAvailableQuests] = useState<Quest[]>([]);
  const [selectedQuests, setSelectedQuests] = useState<Quest[]>([]);
  const [currentQuestIndex, setCurrentQuestIndex] = useState(0);
  const [userPrompts, setUserPrompts] = useState<string[]>(['', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [step, setStep] = useState<'select' | 'progress' | 'feedback'>('select');
  const [totalScore, setTotalScore] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      // 사용자 레벨에 맞는 퀘스트 필터링
      const userQuests = allQuests.filter(quest => quest.requiredLevel <= userLevel);
      setAvailableQuests(userQuests);
      resetQuest();
    }
  }, [isOpen, userLevel]);

  const resetQuest = () => {
    setStep('select');
    setSelectedQuests([]);
    setCurrentQuestIndex(0);
    setUserPrompts(['', '', '']);
    setFeedback([]);
    setTotalScore(0);
  };

  const selectRandomQuests = () => {
    const shuffled = [...availableQuests].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 3);
    setSelectedQuests(selected);
    setStep('progress');
  };

  const submitPrompt = async () => {
    if (!userPrompts[currentQuestIndex].trim()) return;

    setIsLoading(true);

    try {
      // Simulate API call to ChatGPT for evaluation
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulated feedback based on prompt quality
      const currentQuest = selectedQuests[currentQuestIndex];
      const mockFeedback: Feedback = {
        score: Math.floor(Math.random() * 30) + 70, // 70-100 range
        strengths: [
          '상황 설명이 명확합니다',
          '구체적인 맥락을 제공했습니다',
          '실행 가능한 해결책을 요청했습니다'
        ],
        improvements: [
          '학생의 개별 특성을 더 구체적으로 명시하면 좋겠습니다',
          '원하는 결과를 더 명확히 제시해보세요',
          '단계적 접근 방법을 요청해보세요'
        ],
        recommendedPrompt: `${currentQuest.title}에 대한 개선된 프롬프트: "${currentQuest.scenario}에서 구체적이고 단계적인 해결 방안을 3가지 제시해주세요. 각 방안별로 실행 방법과 예상 효과도 함께 설명해주세요."`,
        explanation: '좋은 프롬프트는 상황, 목표, 제약조건을 명확히 제시하고 구체적인 결과물을 요청합니다.'
      };

      const newFeedback = [...feedback, mockFeedback];
      setFeedback(newFeedback);
      setTotalScore(prev => prev + mockFeedback.score);

      // 다음 문제로 이동 또는 완료
      if (currentQuestIndex < 2) {
        setCurrentQuestIndex(prev => prev + 1);
      } else {
        // 모든 문제 완료 - 결과 저장
        const finalScore = totalScore + mockFeedback.score;
        selectedQuests.forEach((quest, index) => {
          const savedPrompts = JSON.parse(localStorage.getItem('promptLibrary') || '[]');
          savedPrompts.push({
            id: Date.now().toString() + `-${index}`,
            questTitle: quest.title,
            prompt: userPrompts[index],
            score: newFeedback[index]?.score || 0,
            date: new Date().toISOString(),
            feedback: newFeedback[index]
          });
          localStorage.setItem('promptLibrary', JSON.stringify(savedPrompts));
        });
        
        setStep('feedback');
      }

    } catch (error) {
      toast({
        title: "오류가 발생했습니다",
        description: "다시 시도해주세요.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const completeQuest = () => {
    const finalScore = totalScore;
    const averageScore = Math.round(finalScore / 3);
    const experience = averageScore >= 90 ? 180 : averageScore >= 80 ? 150 : 120;
    onComplete(finalScore, experience);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-success-500';
      case 'medium': return 'bg-yellow-500';
      case 'hard': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '초급';
      case 'medium': return '중급';
      case 'hard': return '고급';
      default: return '일반';
    }
  };

  const updatePrompt = (value: string) => {
    const newPrompts = [...userPrompts];
    newPrompts[currentQuestIndex] = value;
    setUserPrompts(newPrompts);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-magic-600" />
            프롬프트 퀘스트 - 레벨 {userLevel}
          </DialogTitle>
          <DialogDescription>
            3개의 문제를 연속으로 풀어 레벨업하세요! (사용 가능한 퀘스트: {availableQuests.length}개)
          </DialogDescription>
        </DialogHeader>

        {step === 'select' && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">랜덤 퀘스트 3개에 도전하세요!</h3>
              <p className="text-gray-600 mb-4">레벨 {userLevel}에서 도전할 수 있는 퀘스트들로구성됩니다</p>
              <Button onClick={selectRandomQuests} className="magic-gradient text-white">
                <Target className="h-4 w-4 mr-2" />
                퀘스트 3개 선택하기
              </Button>
            </div>

            <div className="grid gap-4">
              <h4 className="font-medium text-gray-700">사용 가능한 퀘스트 미리보기:</h4>
              {availableQuests.slice(0, 6).map((quest) => (
                <Card key={quest.id} className="opacity-75">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base">{quest.title}</CardTitle>
                        <CardDescription>{quest.description}</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline">{quest.category}</Badge>
                        <Badge className={`${getDifficultyColor(quest.difficulty)} text-white`}>
                          {getDifficultyLabel(quest.difficulty)}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        )}

        {step === 'progress' && selectedQuests.length > 0 && (
          <div className="space-y-6">
            {/* Progress Indicator */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">진행 상황:</span>
                <div className="flex gap-2">
                  {[0, 1, 2].map((index) => (
                    <div
                      key={index}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        index < currentQuestIndex
                          ? 'bg-success-500 text-white'
                          : index === currentQuestIndex
                          ? 'bg-magic-500 text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {index + 1}
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-sm text-gray-500">
                문제 {currentQuestIndex + 1}/3
              </div>
            </div>

            {/* Current Quest */}
            <Card className="bg-magic-50 border-magic-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-magic-600" />
                  {selectedQuests[currentQuestIndex]?.title}
                </CardTitle>
                <div className="flex gap-2">
                  <Badge variant="outline">{selectedQuests[currentQuestIndex]?.category}</Badge>
                  <Badge className={`${getDifficultyColor(selectedQuests[currentQuestIndex]?.difficulty)} text-white`}>
                    {getDifficultyLabel(selectedQuests[currentQuestIndex]?.difficulty)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{selectedQuests[currentQuestIndex]?.scenario}</p>
              </CardContent>
            </Card>

            {/* Prompt Input */}
            <div>
              <label className="block text-sm font-medium mb-2">
                이 상황에 대한 AI 프롬프트를 작성해주세요
              </label>
              <Textarea
                value={userPrompts[currentQuestIndex]}
                onChange={(e) => updatePrompt(e.target.value)}
                placeholder="예: 이 상황에서 구체적이고 실행 가능한 해결 방법을 단계별로 제시해주세요..."
                className="min-h-[150px] resize-none"
              />
              <div className="text-sm text-gray-500 mt-2">
                {userPrompts[currentQuestIndex].length}/500자
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={resetQuest}
              >
                처음으로
              </Button>
              <Button 
                onClick={submitPrompt}
                disabled={!userPrompts[currentQuestIndex].trim() || isLoading}
                className="magic-gradient text-white flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    AI가 평가 중...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    {currentQuestIndex < 2 ? '다음 문제로' : '완료하기'}
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {step === 'feedback' && (
          <div className="space-y-6">
            {/* Total Score Display */}
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-6xl font-bold text-magic-600 mb-2">
                  {totalScore}
                </div>
                <div className="text-xl text-gray-600 mb-4">점 / 300점</div>
                <div className="text-lg text-gray-500 mb-4">
                  평균: {Math.round(totalScore / 3)}점
                </div>
                <Progress value={(totalScore / 300) * 100} className="mb-4" />
                <div className="flex items-center justify-center gap-2">
                  {totalScore >= 270 ? (
                    <>
                      <Star className="h-5 w-5 text-yellow-500" />
                      <span className="text-yellow-600 font-medium">완벽합니다!</span>
                    </>
                  ) : totalScore >= 240 ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-success-500" />
                      <span className="text-success-600 font-medium">훌륭합니다!</span>
                    </>
                  ) : (
                    <>
                      <Lightbulb className="h-5 w-5 text-yellow-500" />
                      <span className="text-yellow-600 font-medium">잘했어요!</span>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Individual Quest Results */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">문제별 결과</h3>
              {selectedQuests.map((quest, index) => (
                <Card key={quest.id} className="border-l-4 border-l-magic-500">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{quest.title}</CardTitle>
                      <div className="text-2xl font-bold text-magic-600">
                        {feedback[index]?.score || 0}점
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-gray-600 mb-2">
                      <strong>내가 작성한 프롬프트:</strong>
                    </div>
                    <div className="bg-gray-50 p-3 rounded mb-3 text-sm">
                      {userPrompts[index]}
                    </div>
                    {feedback[index] && (
                      <div className="text-sm">
                        <strong>피드백:</strong> {feedback[index].explanation}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={resetQuest}
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                다시 도전하기
              </Button>
              <Button 
                onClick={completeQuest}
                className="magic-gradient text-white flex-1"
              >
                퀘스트 완료하기
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default QuestModal;
