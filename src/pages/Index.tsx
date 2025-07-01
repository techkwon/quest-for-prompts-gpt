
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Sparkles, BookOpen, Trophy, Star, Wand2, GraduationCap, Target, Users, Medal, Crown, Zap, Flame, Heart, Smile } from 'lucide-react';
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
  streak: number;
  maxStreak: number;
  averageScore: number;
  achievements: string[];
}

const Index = () => {
  const [userProgress, setUserProgress] = useState<UserProgress>({
    level: 1,
    experience: 0,
    experienceToNext: 200,
    title: "GPT 초보자",
    completedQuests: 0,
    totalScore: 0,
    streak: 0,
    maxStreak: 0,
    averageScore: 0,
    achievements: []
  });

  const [showQuestModal, setShowQuestModal] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const { toast } = useToast();

  const progressPercentage = (userProgress.experience / userProgress.experienceToNext) * 100;

  const handleStartQuest = () => {
    setShowQuestModal(true);
  };

  const checkAchievements = (newProgress: UserProgress) => {
    const newAchievements = [];
    
    // 점수 기반 칭호
    if (newProgress.averageScore >= 95 && !newProgress.achievements.includes('완벽주의자')) {
      newAchievements.push('완벽주의자');
    }
    if (newProgress.averageScore >= 90 && !newProgress.achievements.includes('고수')) {
      newAchievements.push('고수');
    }
    if (newProgress.averageScore >= 80 && !newProgress.achievements.includes('숙련자')) {
      newAchievements.push('숙련자');
    }
    
    // 연속 성공 칭호
    if (newProgress.maxStreak >= 10 && !newProgress.achievements.includes('연속 마스터')) {
      newAchievements.push('연속 마스터');
    }
    if (newProgress.maxStreak >= 5 && !newProgress.achievements.includes('연속 도전자')) {
      newAchievements.push('연속 도전자');
    }
    
    // 퀘스트 완료 칭호
    if (newProgress.completedQuests >= 50 && !newProgress.achievements.includes('퀘스트 마니아')) {
      newAchievements.push('퀘스트 마니아');
    }
    if (newProgress.completedQuests >= 20 && !newProgress.achievements.includes('퀘스트 열정가')) {
      newAchievements.push('퀘스트 열정가');
    }
    if (newProgress.completedQuests >= 5 && !newProgress.achievements.includes('퀘스트 도전자')) {
      newAchievements.push('퀘스트 도전자');
    }
    
    // 레벨 칭호
    if (newProgress.level >= 10 && !newProgress.achievements.includes('전설의 마법사')) {
      newAchievements.push('전설의 마법사');
    }
    if (newProgress.level >= 5 && !newProgress.achievements.includes('마스터 마법사')) {
      newAchievements.push('마스터 마법사');
    }
    
    return newAchievements;
  };

  const handleQuestComplete = (score: number, experience: number) => {
    setUserProgress(prev => {
      const newExp = prev.experience + experience;
      const newLevel = newExp >= prev.experienceToNext ? prev.level + 1 : prev.level;
      const newCompletedQuests = prev.completedQuests + 1;
      const newTotalScore = prev.totalScore + score;
      const newAverageScore = Math.round(newTotalScore / newCompletedQuests);
      
      // 연속 성공 계산 (80점 이상을 성공으로 간주)
      const newStreak = score >= 80 ? prev.streak + 1 : 0;
      const newMaxStreak = Math.max(prev.maxStreak, newStreak);
      
      const newProgress = {
        ...prev,
        experience: newExp >= prev.experienceToNext ? newExp - prev.experienceToNext : newExp,
        level: newLevel,
        completedQuests: newCompletedQuests,
        totalScore: newTotalScore,
        averageScore: newAverageScore,
        streak: newStreak,
        maxStreak: newMaxStreak,
        experienceToNext: newLevel > prev.level ? 250 + (newLevel * 50) : prev.experienceToNext
      };
      
      // 새로운 칭호 확인
      const newAchievements = checkAchievements(newProgress);
      if (newAchievements.length > 0) {
        newProgress.achievements = [...prev.achievements, ...newAchievements];
        toast({
          title: "🏆 새로운 칭호 획득!",
          description: `${newAchievements.join(', ')} 칭호를 획득했습니다!`,
        });
      }
      
      if (newLevel > prev.level) {
        toast({
          title: "🎉 레벨 업!",
          description: `축하합니다! 레벨 ${newLevel}이 되셨습니다!`,
        });
      }
      
      if (newStreak > 0 && newStreak % 3 === 0) {
        toast({
          title: "🔥 연속 성공!",
          description: `${newStreak}회 연속 성공! 대단합니다!`,
        });
      }
      
      return newProgress;
    });
    setShowQuestModal(false);
  };

  const levelTitles = [
    "GPT 초보자", "AI 탐험가", "프롬프트 견습생", "교실 마법사", "AI 장인", 
    "프롬프트 마스터", "AI 전문가", "마법사 멘토", "AI 구루", "전설의 마법사"
  ];

  useEffect(() => {
    setUserProgress(prev => ({
      ...prev,
      title: levelTitles[Math.min(prev.level - 1, levelTitles.length - 1)]
    }));
  }, [userProgress.level]);

  // 저장된 활동 불러오기
  const getRecentActivities = () => {
    const savedPrompts = JSON.parse(localStorage.getItem('promptLibrary') || '[]');
    return savedPrompts.slice(-3).reverse(); // 최근 3개만 표시
  };

  const recentActivities = getRecentActivities();

  const getStreakColor = (streak: number) => {
    if (streak >= 10) return 'text-red-300';
    if (streak >= 5) return 'text-orange-300';
    if (streak >= 3) return 'text-pink-300';
    return 'text-gray-400';
  };

  const getAverageScoreColor = (score: number) => {
    if (score >= 95) return 'text-purple-400';
    if (score >= 90) return 'text-blue-400';
    if (score >= 80) return 'text-green-400';
    if (score >= 70) return 'text-pink-300';
    return 'text-gray-400';
  };

  return (
    <div className="min-h-screen p-3 md:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <div className="flex items-center justify-center gap-2 md:gap-3 mb-3 md:mb-4">
            <Wand2 className="h-6 w-6 md:h-8 md:w-8 text-magic-400 animate-pulse" />
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold sparkle-text">
              Prompt Quest
            </h1>
            <Sparkles className="h-6 w-6 md:h-8 md:w-8 text-magic-400 animate-sparkle" />
          </div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Heart className="h-4 w-4 text-pink-300" />
            <p className="text-lg md:text-xl text-gray-500">교실의 마법사 되기</p>
            <Heart className="h-4 w-4 text-pink-300" />
          </div>
          <p className="text-sm md:text-base text-gray-400 px-4">AI 프롬프트 작성을 게임처럼 재미있게 배워보세요!</p>
        </div>

        {/* User Progress Card */}
        <Card className="mb-6 md:mb-8 bg-gradient-to-r from-magic-200 via-magic-300 to-purple-200 text-gray-700 card-hover shadow-xl rounded-2xl border-0">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:justify-between">
              <div className="flex items-center gap-3 text-center sm:text-left">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-white/30 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <GraduationCap className="h-6 w-6 md:h-8 md:w-8" />
                </div>
                <div>
                  <CardTitle className="text-xl md:text-2xl font-bold">{userProgress.title}</CardTitle>
                  <CardDescription className="text-gray-600 text-sm md:text-base">
                    레벨 {userProgress.level} • {userProgress.completedQuests}개 퀘스트 완료
                  </CardDescription>
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold flex items-center gap-1">
                  <Star className="h-5 w-5 md:h-6 md:w-6 text-yellow-300" />
                  {userProgress.totalScore}
                </div>
                <div className="text-gray-600 text-sm">총 점수</div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>경험치</span>
                <span>{userProgress.experience}/{userProgress.experienceToNext}</span>
              </div>
              <div className="relative">
                <Progress value={progressPercentage} className="bg-white/30 h-3 rounded-full overflow-hidden" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse rounded-full" />
              </div>
            </div>
            
            {/* 새로운 통계 섹션 */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 pt-4 border-t border-white/30">
              <div className="text-center p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <div className={`text-xl md:text-2xl font-bold ${getAverageScoreColor(userProgress.averageScore)}`}>
                  {userProgress.completedQuests > 0 ? userProgress.averageScore : 0}
                </div>
                <div className="text-gray-600 text-xs md:text-sm">평균 점수</div>
              </div>
              <div className="text-center p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <div className={`text-xl md:text-2xl font-bold flex items-center justify-center gap-1 ${getStreakColor(userProgress.streak)}`}>
                  <Flame className="h-4 w-4 md:h-5 md:w-5" />
                  {userProgress.streak}
                </div>
                <div className="text-gray-600 text-xs md:text-sm">연속 성공</div>
              </div>
              <div className="text-center p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <div className="text-xl md:text-2xl font-bold text-pink-300 flex items-center justify-center gap-1">
                  <Trophy className="h-4 w-4 md:h-5 md:w-5" />
                  {userProgress.maxStreak}
                </div>
                <div className="text-gray-600 text-xs md:text-sm">최고 연속</div>
              </div>
              <div className="text-center p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <div className="text-xl md:text-2xl font-bold text-purple-300 flex items-center justify-center gap-1">
                  <Crown className="h-4 w-4 md:h-5 md:w-5" />
                  {userProgress.achievements.length}
                </div>
                <div className="text-gray-600 text-xs md:text-sm">획득 칭호</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          <Card className="card-hover cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl border-0 bg-gradient-to-br from-magic-50 to-magic-100" onClick={handleStartQuest}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-magic-300 rounded-xl flex items-center justify-center shadow-lg">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg text-magic-600">새로운 퀘스트</CardTitle>
                  <CardDescription className="text-magic-500">실제 교실 상황으로 연습하기</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-gradient-to-r from-magic-300 to-purple-300 text-gray-700 hover:from-magic-400 hover:to-purple-400 hover:text-white rounded-xl font-semibold py-3 shadow-lg hover:shadow-xl transition-all">
                <Zap className="h-4 w-4 mr-2" />
                퀘스트 시작하기
              </Button>
            </CardContent>
          </Card>

          <Card className="card-hover cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl border-0 bg-gradient-to-br from-wisdom-50 to-wisdom-100" onClick={() => setShowLibrary(true)}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-wisdom-300 rounded-xl flex items-center justify-center shadow-lg">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg text-wisdom-600">프롬프트 저장소</CardTitle>
                  <CardDescription className="text-wisdom-500">내가 작성한 프롬프트 모음</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full border-wisdom-200 text-wisdom-600 hover:bg-wisdom-50 rounded-xl font-semibold py-3 shadow-md hover:shadow-lg transition-all">
                <Smile className="h-4 w-4 mr-2" />
                저장소 열기
              </Button>
            </CardContent>
          </Card>

          <Card className="card-hover cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl border-0 bg-gradient-to-br from-success-50 to-success-100 md:col-span-2 lg:col-span-1" onClick={() => setShowAchievements(!showAchievements)}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-success-300 rounded-xl flex items-center justify-center shadow-lg">
                  <Trophy className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg text-success-600">성취 및 칭호</CardTitle>
                  <CardDescription className="text-success-500">획득한 업적 확인하기</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {userProgress.achievements.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {userProgress.achievements.slice(0, 2).map((achievement, index) => (
                      <Badge key={index} variant="secondary" className="bg-success-100 text-success-700 rounded-full px-3 py-1">
                        <Crown className="h-3 w-3 mr-1" />
                        {achievement}
                      </Badge>
                    ))}
                    {userProgress.achievements.length > 2 && (
                      <Badge variant="outline" className="text-xs rounded-full border-success-200 text-success-600">
                        +{userProgress.achievements.length - 2}개 더
                      </Badge>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-success-500">퀘스트를 완료하여 칭호를 획득하세요!</p>
                )}
                <Button variant="ghost" size="sm" className="w-full mt-2 text-success-600 hover:bg-success-50 rounded-xl">
                  {showAchievements ? '숨기기' : '모든 칭호 보기'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 칭호 상세 보기 */}
        {showAchievements && userProgress.achievements.length > 0 && (
          <Card className="mb-6 md:mb-8 shadow-lg rounded-2xl border-0 bg-gradient-to-r from-success-50 to-magic-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-success-600">
                <Medal className="h-5 w-5" />
                획득한 모든 칭호
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {userProgress.achievements.map((achievement, index) => (
                  <Badge key={index} variant="secondary" className="bg-success-100 text-success-700 p-3 justify-center rounded-xl font-medium shadow-md">
                    <Trophy className="h-4 w-4 mr-2" />
                    {achievement}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Activity */}
        <Card className="shadow-lg rounded-2xl border-0 bg-gradient-to-br from-white to-magic-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-magic-600">
              <Sparkles className="h-5 w-5" />
              최근 활동
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivities.length > 0 ? (
              <div className="space-y-3 md:space-y-4">
                {recentActivities.map((activity: any, index: number) => (
                  <div key={activity.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gradient-to-r from-success-50 to-magic-50 rounded-xl shadow-sm">
                    <div className="mb-2 sm:mb-0">
                      <div className="font-medium text-gray-700 flex items-center gap-2">
                        <Star className="h-4 w-4 text-magic-400" />
                        {activity.questTitle} 퀘스트 완료
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {activity.score}점 획득 • {activity.score >= 90 ? 60 : activity.score >= 80 ? 50 : 40} 경험치
                        {activity.score >= 80 && <span className="text-pink-300 ml-2">🔥 성공!</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-start sm:self-center">
                      <Badge 
                        className={`${
                          activity.score >= 90 ? 'bg-purple-300 hover:bg-purple-400' : 
                          activity.score >= 80 ? 'bg-success-300 hover:bg-success-400' : 
                          'bg-gray-300 hover:bg-gray-400'
                        } text-white rounded-full px-3 py-1 font-semibold shadow-md`}
                      >
                        {activity.score}점
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 md:py-12">
                <div className="w-20 h-20 bg-magic-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="h-10 w-10 text-magic-300" />
                </div>
                <p className="text-gray-500 font-medium mb-2">아직 완료한 퀘스트가 없습니다.</p>
                <p className="text-sm text-gray-400">첫 퀘스트를 시작해보세요!</p>
                <Button 
                  onClick={handleStartQuest}
                  className="mt-4 bg-gradient-to-r from-magic-300 to-purple-300 text-gray-700 hover:from-magic-400 hover:to-purple-400 hover:text-white rounded-xl px-6 py-2 shadow-lg hover:shadow-xl transition-all"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  퀘스트 시작하기
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <QuestModal 
        isOpen={showQuestModal} 
        onClose={() => setShowQuestModal(false)}
        onComplete={handleQuestComplete}
        userLevel={userProgress.level}
      />
      
      <PromptLibrary 
        isOpen={showLibrary} 
        onClose={() => setShowLibrary(false)}
      />
    </div>
  );
};

export default Index;
