
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BookOpen, Search, Star, Calendar, Copy, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PromptLibraryProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SavedPrompt {
  id: string;
  questTitle: string;
  prompt: string;
  score: number;
  date: string;
  feedback: {
    score: number;
    strengths: string[];
    improvements: string[];
    recommendedPrompt: string;
  };
}

const PromptLibrary: React.FC<PromptLibraryProps> = ({ isOpen, onClose }) => {
  const [savedPrompts, setSavedPrompts] = useState<SavedPrompt[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPrompt, setSelectedPrompt] = useState<SavedPrompt | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadSavedPrompts();
    }
  }, [isOpen]);

  const loadSavedPrompts = () => {
    const saved = localStorage.getItem('promptLibrary');
    if (saved) {
      setSavedPrompts(JSON.parse(saved));
    }
  };

  const deletePrompt = (id: string) => {
    const updated = savedPrompts.filter(p => p.id !== id);
    setSavedPrompts(updated);
    localStorage.setItem('promptLibrary', JSON.stringify(updated));
    setSelectedPrompt(null);
    toast({
      title: "프롬프트 삭제됨",
      description: "선택한 프롬프트가 삭제되었습니다.",
    });
  };

  const copyPrompt = (prompt: string) => {
    navigator.clipboard.writeText(prompt);
    toast({
      title: "복사 완료",
      description: "프롬프트가 클립보드에 복사되었습니다.",
    });
  };

  const filteredPrompts = savedPrompts.filter(prompt =>
    prompt.questTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prompt.prompt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-purple-600 bg-purple-100';
    if (score >= 80) return 'text-success-600 bg-success-100';
    if (score >= 70) return 'text-pink-600 bg-pink-100';
    return 'text-gray-600 bg-gray-100';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-wisdom-600" />
            프롬프트 저장소
          </DialogTitle>
          <DialogDescription>
            작성한 프롬프트들을 저장하고 관리할 수 있습니다
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-1 gap-6 min-h-0">
          {/* Left Panel - Prompt List */}
          <div className="w-1/2 flex flex-col">
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="프롬프트 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3">
              {filteredPrompts.length === 0 ? (
                <Card className="text-center py-8">
                  <CardContent>
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">
                      {searchTerm ? '검색 결과가 없습니다' : '저장된 프롬프트가 없습니다'}
                    </p>
                    <p className="text-sm text-gray-400 mt-2">
                      퀘스트를 완료하면 프롬프트가 자동으로 저장됩니다
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredPrompts.map((prompt) => (
                  <Card 
                    key={prompt.id} 
                    className={`cursor-pointer card-hover ${selectedPrompt?.id === prompt.id ? 'ring-2 ring-magic-500' : ''}`}
                    onClick={() => setSelectedPrompt(prompt)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium">{prompt.questTitle}</CardTitle>
                        <Badge className={`${getScoreColor(prompt.score)} border-0`}>
                          {prompt.score}점
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="h-3 w-3" />
                        {new Date(prompt.date).toLocaleDateString('ko-KR')}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {prompt.prompt}
                      </p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Right Panel - Prompt Detail */}
          <div className="w-1/2 flex flex-col">
            {selectedPrompt ? (
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">{selectedPrompt.questTitle}</h3>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyPrompt(selectedPrompt.prompt)}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      복사
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deletePrompt(selectedPrompt.id)}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      삭제
                    </Button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4">
                  {/* Score Card */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">평가 결과</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-magic-600">
                            {selectedPrompt.score}
                          </div>
                          <div className="text-sm text-gray-500">점수</div>
                        </div>
                        <div className="flex items-center gap-2">
                          {selectedPrompt.score >= 90 ? (
                            <Star className="h-5 w-5 text-purple-500" />
                          ) : selectedPrompt.score >= 80 ? (
                            <Star className="h-5 w-5 text-success-500" />
                          ) : (
                            <Star className="h-5 w-5 text-gray-400" />
                          )}
                          <span className="text-sm text-gray-600">
                            {new Date(selectedPrompt.date).toLocaleDateString('ko-KR')}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Original Prompt */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">작성한 프롬프트</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-gray-700 whitespace-pre-wrap">
                          {selectedPrompt.prompt}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Strengths */}
                  <Card className="border-success-200 bg-success-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base text-success-700">잘한 점</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {selectedPrompt.feedback.strengths.map((strength, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-success-500 rounded-full mt-2 flex-shrink-0" />
                            <span className="text-success-700 text-sm">{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Improvements */}
                  <Card className="border-pink-200 bg-pink-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base text-pink-700">개선할 점</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {selectedPrompt.feedback.improvements.map((improvement, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-pink-500 rounded-full mt-2 flex-shrink-0" />
                            <span className="text-pink-700 text-sm">{improvement}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Recommended Prompt */}
                  <Card className="border-magic-200 bg-magic-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base text-magic-700">추천 프롬프트</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-white p-4 rounded-lg border">
                        <p className="text-gray-700 text-sm italic">
                          {selectedPrompt.feedback.recommendedPrompt}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">프롬프트를 선택해주세요</p>
                  <p className="text-sm text-gray-400 mt-2">
                    왼쪽에서 프롬프트를 클릭하면 상세 내용을 볼 수 있습니다
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PromptLibrary;
