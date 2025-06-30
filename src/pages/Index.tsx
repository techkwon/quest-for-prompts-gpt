
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Sparkles, BookOpen, Trophy, Star, Wand2, GraduationCap, Target, Users } from 'lucide-react';
import QuestModal from '@/components/QuestModal';
import PromptLibrary from '@/components/PromptLibrary';
import { useToast } from '@/hooks/use-toast';

interface UserProgress {
  level: number;
  experience: number;
  experienceToNext: number;
  title: string;
  completedQuests: number;
  totalScore: number;
}

const Index = () => {
  const [userProgress, setUserProgress] = useState<UserProgress>({
    level: 1,
    experience: 120,
    experienceToNext: 200,
    title: "GPT 초보자",
    completedQuests: 3,
    totalScore: 245
  });

  const [showQuestModal, setShowQuestModal] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const { toast } = useToast();

  const progressPercentage = (userProgress.experience / userProgress.experienceToNext) * 100;

  const handleStartQuest = () => {
    setShowQuestModal(true);
  };

  const handleQuestComplete = (score: number, experience: number) => {
    setUserProgress(prev => {
      const newExp = prev.experience + experience;
      const newLevel = newExp >= prev.experienceToNext ? prev.level + 1 : prev.level;
      
      if (newLevel > prev.level) {
        toast({
          title: "🎉 레벨 업!",
          description: `축하합니다! 레벨 ${newLevel}이 되셨습니다!`,
        });
      }
      
      return {
        ...prev,
        experience: newExp >= prev.experienceToNext ? newExp - prev.experienceToNext : newExp,
        level: newLevel,
        completedQuests: prev.completedQuests + 1,
        totalScore: prev.totalScore + score,
        experienceToNext: newLevel > prev.level ? 250 + (newLevel * 50) : prev.experienceToNext
      };
    });
    setShowQuestModal(false);
  };

  const levelTitles = [
    "GPT 초보자", "AI 탐험가", "프롬프트 견습생", "교실 마법사", "AI 장인", "프롬프트 마스터"
  ];

  useEffect(() => {
    setUserProgress(prev => ({
      ...prev,
      title: levelTitles[Math.min(prev.level - 1, levelTitles.length - 1)]
    }));
  }, [userProgress.level]);

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Wand2 className="h-8 w-8 text-magic-600" />
            <h1 className="text-4xl md:text-5xl font-bold sparkle-text">
              Prompt Quest
            </h1>
            <Sparkles className="h-8 w-8 text-magic-600 animate-sparkle" />
          </div>
          <p className="text-xl text-gray-600 mb-2">교실의 마법사 되기</p>
          <p className="text-gray-500">AI 프롬프트 작성을 게임처럼 재미있게 배워보세요!</p>
        </div>

        {/* User Progress Card */}
        <Card className="mb-8 magic-gradient text-white card-hover">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <GraduationCap className="h-8 w-8" />
                </div>
                <div>
                  <CardTitle className="text-2xl">{userProgress.title}</CardTitle>
                  <CardDescription className="text-white/80">
                    레벨 {userProgress.level} • {userProgress.completedQuests}개 퀘스트 완료
                  </CardDescription>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">{userProgress.totalScore}</div>
                <div className="text-white/80">총 점수</div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>경험치</span>
                <span>{userProgress.experience}/{userProgress.experienceToNext}</span>
              </div>
              <Progress value={progressPercentage} className="bg-white/20" />
            </div>
          </CardContent>
        </Card>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="card-hover cursor-pointer" onClick={handleStartQuest}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-magic-100 rounded-lg flex items-center justify-center">
                  <Target className="h-6 w-6 text-magic-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">새로운 퀘스트</CardTitle>
                  <CardDescription>실제 교실 상황으로 연습하기</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button className="w-full magic-gradient text-white hover:opacity-90">
                퀘스트 시작하기
              </Button>
            </CardContent>
          </Card>

          <Card className="card-hover cursor-pointer" onClick={() => setShowLibrary(true)}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-wisdom-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-wisdom-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">프롬프트 저장소</CardTitle>
                  <CardDescription>내가 작성한 프롬프트 모음</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full border-wisdom-200 text-wisdom-600 hover:bg-wisdom-50">
                저장소 열기
              </Button>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
                  <Trophy className="h-6 w-6 text-success-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">성취 및 칭호</CardTitle>
                  <CardDescription>획득한 업적 확인하기</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="bg-magic-100 text-magic-700">
                  <Star className="h-3 w-3 mr-1" />
                  첫 퀘스트
                </Badge>
                <Badge variant="secondary" className="bg-wisdom-100 text-wisdom-700">
                  <Users className="h-3 w-3 mr-1" />
                  교실 도우미
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-magic-600" />
              최근 활동
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-success-50 rounded-lg">
                <div>
                  <div className="font-medium">산만한 학생 대응 퀘스트 완료</div>
                  <div className="text-sm text-gray-500">85점 획득 • 50 경험치</div>
                </div>
                <Badge className="bg-success-500 text-white">완료</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-wisdom-50 rounded-lg">
                <div>
                  <div className="font-medium">학부모 상담 준비 퀘스트 완료</div>
                  <div className="text-sm text-gray-500">92점 획득 • 60 경험치</div>
                </div>
                <Badge className="bg-wisdom-500 text-white">완료</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-magic-50 rounded-lg">
                <div>
                  <div className="font-medium">수업 자료 생성 퀘스트 완료</div>
                  <div className="text-sm text-gray-500">78점 획득 • 40 경험치</div>
                </div>
                <Badge className="bg-magic-500 text-white">완료</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <QuestModal 
        isOpen={showQuestModal} 
        onClose={() => setShowQuestModal(false)}
        onComplete={handleQuestComplete}
      />
      
      <PromptLibrary 
        isOpen={showLibrary} 
        onClose={() => setShowLibrary(false)}
      />
    </div>
  );
};

export default Index;
