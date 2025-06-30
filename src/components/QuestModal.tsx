
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, Send, CheckCircle, XCircle, Lightbulb, Target, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (score: number, experience: number) => void;
}

interface Quest {
  id: string;
  title: string;
  description: string;
  scenario: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
}

interface Feedback {
  score: number;
  strengths: string[];
  improvements: string[];
  recommendedPrompt: string;
  explanation: string;
}

const quests: Quest[] = [
  {
    id: '1',
    title: '산만한 학생 대응',
    description: '수업 중 계속 태블릿으로 게임을 하는 학생을 도와주세요',
    scenario: '학생 A는 매 수업시간마다 태블릿으로 게임을 합니다. 다른 학생들에게도 영향을 주고 있어 대책이 필요합니다. AI가 이 상황을 해결할 수 있도록 적절한 프롬프트를 작성해주세요.',
    difficulty: 'easy',
    category: '학급 관리'
  },
  {
    id: '2',
    title: '학부모 상담 준비',
    description: '학부모와의 상담을 위한 자료를 준비해야 합니다',
    scenario: '다음 주에 학부모 상담이 예정되어 있습니다. 학생의 학습 상황과 개선 방안에 대해 구체적이고 건설적인 이야기를 나누고 싶습니다. AI가 상담 내용을 준비할 수 있도록 프롬프트를 작성해주세요.',
    difficulty: 'medium',
    category: '상담 및 소통'
  },
  {
    id: '3',
    title: '창의적 수업 활동 기획',
    description: '지루한 수업을 흥미롭게 만들 방법이 필요합니다',
    scenario: '이번 주 과학 시간에 \'물질의 상태 변화\'를 다룰 예정입니다. 학생들이 지루해하지 않고 적극적으로 참여할 수 있는 창의적인 활동을 기획하고 싶습니다. AI가 도움을 줄 수 있도록 프롬프트를 작성해주세요.',
    difficulty: 'hard',
    category: '수업 설계'
  }
];

const QuestModal: React.FC<QuestModalProps> = ({ isOpen, onClose, onComplete }) => {
  const [currentQuest, setCurrentQuest] = useState<Quest | null>(null);
  const [userPrompt, setUserPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [step, setStep] = useState<'select' | 'write' | 'feedback'>('select');
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setStep('select');
      setCurrentQuest(null);
      setUserPrompt('');
      setFeedback(null);
    }
  }, [isOpen]);

  const selectQuest = (quest: Quest) => {
    setCurrentQuest(quest);
    setStep('write');
  };

  const submitPrompt = async () => {
    if (!userPrompt.trim() || !currentQuest) return;

    setIsLoading(true);

    try {
      // Simulate API call to ChatGPT for evaluation
      // In real implementation, this would be an actual API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulated feedback based on prompt quality
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
        recommendedPrompt: `${currentQuest.title}에 대한 개선된 프롬프트: "${currentQuest.scenario}에서 게임을 좋아하는 A학생의 특성을 활용하여 수업 참여도를 높을 수 있는 구체적이고 단계적인 전략을 3가지 제시해주세요. 각 전략별로 실행 방법과 예상 효과도 함께 설명해주세요."`,
        explanation: '좋은 프롬프트는 상황, 목표, 제약조건을 명확히 제시하고 구체적인 결과물을 요청합니다.'
      };

      setFeedback(mockFeedback);
      setStep('feedback');

      // Save prompt to local storage
      const savedPrompts = JSON.parse(localStorage.getItem('promptLibrary') || '[]');
      savedPrompts.push({
        id: Date.now().toString(),
        questTitle: currentQuest.title,
        prompt: userPrompt,
        score: mockFeedback.score,
        date: new Date().toISOString(),
        feedback: mockFeedback
      });
      localStorage.setItem('promptLibrary', JSON.stringify(savedPrompts));

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
    if (feedback) {
      const experience = feedback.score >= 90 ? 60 : feedback.score >= 80 ? 50 : 40;
      onComplete(feedback.score, experience);
    }
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-magic-600" />
            프롬프트 퀘스트
          </DialogTitle>
          <DialogDescription>
            실제 교실 상황을 바탕으로 AI 프롬프트 작성 실력을 향상시켜보세요
          </DialogDescription>
        </DialogHeader>

        {step === 'select' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">퀘스트를 선택하세요</h3>
            <div className="grid gap-4">
              {quests.map((quest) => (
                <Card key={quest.id} className="cursor-pointer card-hover" onClick={() => selectQuest(quest)}>
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

        {step === 'write' && currentQuest && (
          <div className="space-y-6">
            <Card className="bg-magic-50 border-magic-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-magic-600" />
                  {currentQuest.title}
                </CardTitle>
                <div className="flex gap-2">
                  <Badge variant="outline">{currentQuest.category}</Badge>
                  <Badge className={`${getDifficultyColor(currentQuest.difficulty)} text-white`}>
                    {getDifficultyLabel(currentQuest.difficulty)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{currentQuest.scenario}</p>
              </CardContent>
            </Card>

            <div>
              <label className="block text-sm font-medium mb-2">
                이 상황에 대한 AI 프롬프트를 작성해주세요
              </label>
              <Textarea
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                placeholder="예: 게임을 좋아하는 A학생이 수업에 집중할 수 있도록 도와주는 구체적인 방법을 알려주세요..."
                className="min-h-[150px] resize-none"
              />
              <div className="text-sm text-gray-500 mt-2">
                {userPrompt.length}/500자
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setStep('select')}
              >
                뒤로가기
              </Button>
              <Button 
                onClick={submitPrompt}
                disabled={!userPrompt.trim() || isLoading}
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
                    프롬프트 제출하기
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {step === 'feedback' && feedback && currentQuest && (
          <div className="space-y-6">
            {/* Score Display */}
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-6xl font-bold text-magic-600 mb-2">
                  {feedback.score}
                </div>
                <div className="text-xl text-gray-600 mb-4">점 / 100점</div>
                <Progress value={feedback.score} className="mb-4" />
                <div className="flex items-center justify-center gap-2">
                  {feedback.score >= 90 ? (
                    <>
                      <Star className="h-5 w-5 text-yellow-500" />
                      <span className="text-yellow-600 font-medium">훌륭합니다!</span>
                    </>
                  ) : feedback.score >= 80 ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-success-500" />
                      <span className="text-success-600 font-medium">잘했습니다!</span>
                    </>
                  ) : (
                    <>
                      <Lightbulb className="h-5 w-5 text-yellow-500" />
                      <span className="text-yellow-600 font-medium">개선할 점이 있어요</span>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Detailed Feedback */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="border-success-200 bg-success-50">
                <CardHeader>
                  <CardTitle className="text-success-700 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    잘한 점
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {feedback.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-success-500 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-success-700">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-yellow-200 bg-yellow-50">
                <CardHeader>
                  <CardTitle className="text-yellow-700 flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    개선할 점
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {feedback.improvements.map((improvement, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-yellow-700">{improvement}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Recommended Prompt */}
            <Card className="border-magic-200 bg-magic-50">
              <CardHeader>
                <CardTitle className="text-magic-700 flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  추천 프롬프트 예시
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-white p-4 rounded-lg border">
                  <p className="text-gray-700 italic">{feedback.recommendedPrompt}</p>
                </div>
                <p className="text-magic-600 mt-3 text-sm">{feedback.explanation}</p>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => {
                  setStep('write');
                  setFeedback(null);
                }}
              >
                다시 시도하기
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
