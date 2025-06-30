
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
  // 레벨 1 퀘스트 (초급) - 30개
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
  {
    id: '1-4',
    title: '급식 시간 소음',
    description: '급식 시간에 너무 시끄러운 상황을 개선해야 합니다',
    scenario: '급식 시간마다 교실이 너무 시끄러워서 옆 반에서 항의가 들어옵니다. 학생들이 자연스럽게 목소리를 낮출 수 있는 방법이 필요합니다.',
    difficulty: 'easy',
    category: '학급 관리',
    requiredLevel: 1
  },
  {
    id: '1-5',
    title: '준비물 안 가져오는 학생',
    description: '매번 준비물을 빼먹는 학생을 도와주세요',
    scenario: '학생 C는 매번 준비물을 빼먹습니다. 미술 시간에 색연필, 과학 시간에 실험 도구 등 필요한 물건을 항상 가져오지 않아 수업에 참여하기 어려워합니다.',
    difficulty: 'easy',
    category: '학습 지도',
    requiredLevel: 1
  },
  {
    id: '1-6',
    title: '청소 시간 참여 독려',
    description: '청소를 대충 하는 학생들을 지도해야 합니다',
    scenario: '청소 시간에 일부 학생들이 대충 하거나 아예 하지 않으려고 합니다. 모든 학생이 책임감을 가지고 청소에 참여할 수 있는 방법이 필요합니다.',
    difficulty: 'easy',
    category: '학급 관리',
    requiredLevel: 1
  },
  {
    id: '1-7',
    title: '수업 중 떠드는 학생',
    description: '수업 중 친구와 계속 떠드는 학생을 지도해야 합니다',
    scenario: '학생 D는 수업 중에 옆 친구와 계속 떠듭니다. 주의를 줘도 잠깐만 조용해지고 다시 떠들기 시작합니다.',
    difficulty: 'easy',
    category: '학급 관리',
    requiredLevel: 1
  },
  {
    id: '1-8',
    title: '책을 읽지 않는 학생',
    description: '독서 시간에 책을 읽지 않으려는 학생을 도와주세요',
    scenario: '독서 시간에 학생 E는 책을 읽지 않고 멍하니 앉아있거나 딴짓을 합니다. 책에 대한 흥미를 불러일으킬 방법이 필요합니다.',
    difficulty: 'easy',
    category: '학습 지도',
    requiredLevel: 1
  },
  {
    id: '1-9',
    title: '지각하는 학생',
    description: '매일 지각하는 학생의 습관을 고쳐주고 싶습니다',
    scenario: '학생 F는 거의 매일 지각합니다. 1교시 수업이 시작된 후에 들어와서 수업 분위기를 해치고 있습니다.',
    difficulty: 'easy',
    category: '학급 관리',
    requiredLevel: 1
  },
  {
    id: '1-10',
    title: '운동장 활동 참여',
    description: '체육 시간에 참여하지 않으려는 학생을 독려해야 합니다',
    scenario: '체육 시간에 학생 G는 항상 구석에 앉아서 참여하지 않으려고 합니다. 운동을 싫어한다고 하지만 건강을 위해 참여가 필요합니다.',
    difficulty: 'easy',
    category: '수업 참여',
    requiredLevel: 1
  },
  {
    id: '1-11',
    title: '발표 거부 학생',
    description: '발표를 절대 하지 않으려는 학생을 도와주세요',
    scenario: '학생 H는 발표를 시키면 절대 하지 않으려고 합니다. 극도로 부끄러워하며 울기까지 합니다.',
    difficulty: 'easy',
    category: '수업 참여',
    requiredLevel: 1
  },
  {
    id: '1-12',
    title: '친구 관계 어려움',
    description: '친구들과 어울리지 못하는 학생을 도와주세요',
    scenario: '학생 I는 혼자 지내는 시간이 많고 친구들과 어울리지 못합니다. 쉬는 시간에도 혼자 앉아있는 경우가 많습니다.',
    difficulty: 'easy',
    category: '학급 관리',
    requiredLevel: 1
  },
  {
    id: '1-13',
    title: '과제 품질 향상',
    description: '과제를 대충 하는 학생의 성의를 높이고 싶습니다',
    scenario: '학생 J는 과제를 해오기는 하지만 항상 대충 합니다. 성의없이 몇 줄만 적어오거나 그림을 대충 그려옵니다.',
    difficulty: 'easy',
    category: '학습 지도',
    requiredLevel: 1
  },
  {
    id: '1-14',
    title: '수업 자료 분실',
    description: '수업 자료를 자주 잃어버리는 학생을 도와주세요',
    scenario: '학생 K는 배부한 학습지나 교재를 자주 잃어버립니다. 중요한 자료를 관리하는 방법을 알려줘야 합니다.',
    difficulty: 'easy',
    category: '학습 지도',
    requiredLevel: 1
  },
  {
    id: '1-15',
    title: '집중력 부족 학생',
    description: '수업 중 집중을 못하는 학생을 도와주세요',
    scenario: '학생 L은 수업 중에 집중을 못하고 자주 딴생각을 합니다. 5분도 집중하지 못하고 다른 곳을 보거나 멍하니 있습니다.',
    difficulty: 'easy',
    category: '학습 지도',
    requiredLevel: 1
  },
  {
    id: '1-16',
    title: '화장실 자주 가는 학생',
    description: '수업 중 화장실을 자주 가려는 학생을 지도해야 합니다',
    scenario: '학생 M은 매 수업시간마다 화장실을 가려고 합니다. 실제로 급한 것인지 수업을 빠지려는 것인지 판단이 어렵습니다.',
    difficulty: 'easy',
    category: '학급 관리',
    requiredLevel: 1
  },
  {
    id: '1-17',
    title: '도구 정리 안하는 학생',
    description: '수업 후 도구를 정리하지 않는 학생을 지도해야 합니다',
    scenario: '미술이나 과학 수업 후에 학생 N은 도구를 정리하지 않고 그냥 둡니다. 다음 수업에 영향을 주고 있습니다.',
    difficulty: 'easy',
    category: '학급 관리',
    requiredLevel: 1
  },
  {
    id: '1-18',
    title: '급식 편식 학생',
    description: '급식을 편식하는 학생을 지도해야 합니다',
    scenario: '학생 O는 급식을 매우 편식합니다. 먹지 않는 음식이 많아서 영양 불균형이 걱정됩니다.',
    difficulty: 'easy',
    category: '학급 관리',
    requiredLevel: 1
  },
  {
    id: '1-19',
    title: '복도 뛰는 학생',
    description: '복도에서 뛰는 학생을 지도해야 합니다',
    scenario: '학생 P는 쉬는 시간마다 복도에서 뛰어다닙니다. 다른 학생들과 부딪힐 위험이 있어 안전사고가 걱정됩니다.',
    difficulty: 'easy',
    category: '학급 관리',
    requiredLevel: 1
  },
  {
    id: '1-20',
    title: '교실 뒷정리 참여',
    description: '교실 뒷정리에 참여하지 않는 학생을 지도해야 합니다',
    scenario: '하교 전 교실 뒷정리 시간에 학생 Q는 자리에 앉아서 기다리기만 합니다. 모든 학생이 함께 참여해야 하는데 혼자만 빠집니다.',
    difficulty: 'easy',
    category: '학급 관리',
    requiredLevel: 1
  },
  {
    id: '1-21',
    title: '수업 준비 안하는 학생',
    description: '수업 준비를 미리 하지 않는 학생을 지도해야 합니다',
    scenario: '수업이 시작될 때마다 학생 R은 책가방을 뒤져서 교과서를 찾습니다. 미리 준비하는 습관을 길러주고 싶습니다.',
    difficulty: 'easy',
    category: '학습 지도',
    requiredLevel: 1
  },
  {
    id: '1-22',
    title: '실험 참여 소극적 학생',
    description: '과학 실험에 소극적인 학생을 도와주세요',
    scenario: '과학 실험 시간에 학생 S는 항상 뒤로 물러서서 구경만 합니다. 직접 실험에 참여하려 하지 않습니다.',
    difficulty: 'easy',
    category: '수업 참여',
    requiredLevel: 1
  },
  {
    id: '1-23',
    title: '모둠 활동 기여도',
    description: '모둠 활동에서 기여하지 않는 학생을 지도해야 합니다',
    scenario: '모둠 활동 시간에 학생 T는 다른 학생들이 하는 것을 지켜보기만 합니다. 자신의 역할을 다하지 않아 모둠원들이 불만을 가집니다.',
    difficulty: 'easy',
    category: '수업 참여',
    requiredLevel: 1
  },
  {
    id: '1-24',
    title: '교실 환경 관리',
    description: '교실을 어지럽히는 학생을 지도해야 합니다',
    scenario: '학생 U는 자신의 자리 주변을 항상 어지럽혀 놓습니다. 휴지, 지우개 가루, 연필 부스러기 등이 바닥에 떨어져 있습니다.',
    difficulty: 'easy',
    category: '학급 관리',
    requiredLevel: 1
  },
  {
    id: '1-25',
    title: '질문 안하는 학생',
    description: '모르는 것이 있어도 질문하지 않는 학생을 도와주세요',
    scenario: '학생 V는 이해하지 못하는 내용이 있어도 절대 질문을 하지 않습니다. 모르는 것을 부끄러워하는 것 같습니다.',
    difficulty: 'easy',
    category: '학습 지도',
    requiredLevel: 1
  },
  {
    id: '1-26',
    title: '놀이 시간 독점',
    description: '쉬는 시간에 놀이기구를 독점하는 학생을 지도해야 합니다',
    scenario: '쉬는 시간에 학생 W는 놀이기구를 혼자서 계속 사용하려고 합니다. 다른 학생들이 기다려도 양보하지 않습니다.',
    difficulty: 'easy',
    category: '학급 관리',
    requiredLevel: 1
  },
  {
    id: '1-27',
    title: '필기 안하는 학생',
    description: '수업 중 필기를 하지 않는 학생을 지도해야 합니다',
    scenario: '학생 X는 수업 중에 필기를 전혀 하지 않습니다. 공책이 항상 비어있어서 복습할 때 어려움이 있을 것 같습니다.',
    difficulty: 'easy',
    category: '학습 지도',
    requiredLevel: 1
  },
  {
    id: '1-28',
    title: '음식 반입 학생',
    description: '교실에 음식을 가져오는 학생을 지도해야 합니다',
    scenario: '학생 Y는 자주 교실에 과자나 음료를 가져옵니다. 수업 중에 먹으려고 하거나 친구들과 나눠먹어서 수업 분위기를 해칩니다.',
    difficulty: 'easy',
    category: '학급 관리',
    requiredLevel: 1
  },
  {
    id: '1-29',
    title: '소극적 학생 격려',
    description: '매사에 소극적인 학생을 격려하고 싶습니다',
    scenario: '학생 Z는 모든 활동에 소극적입니다. 자신감이 부족해 보이고 "못할 것 같다", "어려울 것 같다"는 말을 자주 합니다.',
    difficulty: 'easy',
    category: '학습 지도',
    requiredLevel: 1
  },
  {
    id: '1-30',
    title: '규칙 어기는 학생',
    description: '교실 규칙을 자주 어기는 학생을 지도해야 합니다',
    scenario: '학생 AA는 교실에서 정한 규칙을 자주 어깁니다. 자리에서 일어나거나, 큰 소리로 말하거나, 순서를 지키지 않습니다.',
    difficulty: 'easy',
    category: '학급 관리',
    requiredLevel: 1
  },

  // 레벨 2 퀘스트 (중급) - 30개
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
  {
    id: '2-4',
    title: '학습 동기 부족 학생',
    description: '공부에 흥미를 잃은 학생을 다시 동기부여해야 합니다',
    scenario: '중간고사 이후 학생 D의 학습 의욕이 현저히 떨어졌습니다. 성적이 생각보다 낮게 나와서 포기하는 모습을 보입니다. 다시 의욕을 불러일으킬 방법이 필요합니다.',
    difficulty: 'medium',
    category: '학습 지도',
    requiredLevel: 2
  },
  {
    id: '2-5',
    title: '교실 내 왕따 문제',
    description: '한 학생이 소외되는 상황을 해결해야 합니다',
    scenario: '최근에 학생 E가 다른 학생들로부터 소외되고 있습니다. 직접적인 괴롭힘은 아니지만 대화에서 배제되고 모둠 활동에서도 함께 하려 하지 않습니다.',
    difficulty: 'medium',
    category: '학급 관리',
    requiredLevel: 2
  },
  {
    id: '2-6',
    title: '과제 표절 학생',
    description: '다른 학생의 과제를 베끼는 학생을 지도해야 합니다',
    scenario: '학생 F가 숙제를 다른 학생 것을 베껴서 제출하는 것을 발견했습니다. 이런 일이 반복되고 있어 근본적인 해결책이 필요합니다.',
    difficulty: 'medium',
    category: '학습 지도',
    requiredLevel: 2
  },
  {
    id: '2-7',
    title: '수업 방해 학생',
    description: '의도적으로 수업을 방해하는 학생을 지도해야 합니다',
    scenario: '학생 G는 수업 중에 의도적으로 방해하는 행동을 합니다. 이상한 소리를 내거나 엉뚱한 질문을 해서 다른 학생들의 집중을 방해합니다.',
    difficulty: 'medium',
    category: '학급 관리',
    requiredLevel: 2
  },
  {
    id: '2-8',
    title: '학부모 민원 대응',
    description: '학부모의 과도한 요구에 대응해야 합니다',
    scenario: '한 학부모가 자녀의 성적이 낮다며 다른 학생들과의 비교를 요구하고, 특별한 배려를 해달라고 합니다. 적절한 대응 방법이 필요합니다.',
    difficulty: 'medium',
    category: '상담 및 소통',
    requiredLevel: 2
  },
  {
    id: '2-9',
    title: '학습 속도 차이',
    description: '학습 속도가 다른 학생들을 동시에 지도해야 합니다',
    scenario: '같은 반에서 학습 속도가 매우 다른 학생들이 있습니다. 빠른 학생들은 지루해하고, 느린 학생들은 따라오지 못해 어려워합니다.',
    difficulty: 'medium',
    category: '학습 지도',
    requiredLevel: 2
  },
  {
    id: '2-10',
    title: '학급 내 파벌',
    description: '학급 내에 여러 파벌이 생겨서 해결해야 합니다',
    scenario: '학급 내에 몇 개의 그룹이 형성되어 서로 경쟁하고 대립하는 상황입니다. 학급 전체의 화합이 필요합니다.',
    difficulty: 'medium',
    category: '학급 관리',
    requiredLevel: 2
  },
  {
    id: '2-11',
    title: '특수 학생 통합',
    description: '특수교육 대상 학생의 학급 적응을 도와야 합니다',
    scenario: '새로 전학 온 특수교육 대상 학생이 학급에 적응하는 데 어려움을 겪고 있습니다. 다른 학생들과 자연스럽게 어울릴 수 있도록 도와야 합니다.',
    difficulty: 'medium',
    category: '학급 관리',
    requiredLevel: 2
  },
  {
    id: '2-12',
    title: '학습 부정행위',
    description: '시험 중 부정행위를 한 학생을 지도해야 합니다',
    scenario: '중간고사에서 학생 H가 커닝을 하는 것을 발견했습니다. 성적에 대한 압박감 때문인 것 같지만 반드시 지도가 필요합니다.',
    difficulty: 'medium',
    category: '학습 지도',
    requiredLevel: 2
  },
  {
    id: '2-13',
    title: '가정 문제 학생',
    description: '가정 문제로 어려움을 겪는 학생을 지원해야 합니다',
    scenario: '학생 I의 가정에 경제적 어려움이 있어서 학습에 영향을 주고 있습니다. 준비물이나 참고서 구입에 어려움을 겪고 있습니다.',
    difficulty: 'medium',
    category: '상담 및 소통',
    requiredLevel: 2
  },
  {
    id: '2-14',
    title: '리더십 부족',
    description: '학급 임원의 리더십 부족 문제를 해결해야 합니다',
    scenario: '학급 회장이 리더십을 발휘하지 못하고 있습니다. 다른 학생들이 따르지 않아서 학급 운영에 어려움이 있습니다.',
    difficulty: 'medium',
    category: '학급 관리',
    requiredLevel: 2
  },
  {
    id: '2-15',
    title: '진로 고민 학생',
    description: '진로에 대해 고민이 많은 학생을 상담해야 합니다',
    scenario: '학생 J는 자신의 진로에 대해 매우 불안해합니다. 무엇을 잘하는지 모르겠다고 하며 미래에 대한 걱정이 많습니다.',
    difficulty: 'medium',
    category: '상담 및 소통',
    requiredLevel: 2
  },
  {
    id: '2-16',
    title: '학급 규칙 재정립',
    description: '학급 규칙을 다시 정립해야 하는 상황입니다',
    scenario: '기존 학급 규칙이 잘 지켜지지 않고 있습니다. 학생들과 함께 새로운 규칙을 만들고 이를 정착시켜야 합니다.',
    difficulty: 'medium',
    category: '학급 관리',
    requiredLevel: 2
  },
  {
    id: '2-17',
    title: '학습 습관 개선',
    description: '잘못된 학습 습관을 가진 학생을 지도해야 합니다',
    scenario: '학생 K는 항상 벼락치기로 공부합니다. 평소에는 공부하지 않다가 시험 직전에만 하려고 해서 성적이 불안정합니다.',
    difficulty: 'medium',
    category: '학습 지도',
    requiredLevel: 2
  },
  {
    id: '2-18',
    title: '교우 관계 갈등',
    description: '친했던 두 학생 사이의 갈등을 해결해야 합니다',
    scenario: '평소 친했던 학생 L과 M이 큰 싸움을 한 후 서로 말을 하지 않고 있습니다. 학급 분위기에도 영향을 주고 있어 중재가 필요합니다.',
    difficulty: 'medium',
    category: '학급 관리',
    requiredLevel: 2
  },
  {
    id: '2-19',
    title: '학습 의욕 상실',
    description: '갑자기 학습 의욕을 잃은 학생을 도와야 합니다',
    scenario: '평소 열심히 하던 학생 N이 갑자기 학습 의욕을 잃었습니다. 무기력해 보이고 과제도 하지 않으려고 합니다.',
    difficulty: 'medium',
    category: '학습 지도',
    requiredLevel: 2
  },
  {
    id: '2-20',
    title: '학부모 과보호',
    description: '과보호하는 학부모와 소통해야 합니다',
    scenario: '학부모가 자녀를 지나치게 보호하려고 합니다. 아이가 스스로 해결할 수 있는 일에도 개입하려고 해서 학생의 자립심 발달에 방해가 됩니다.',
    difficulty: 'medium',
    category: '상담 및 소통',
    requiredLevel: 2
  },
  {
    id: '2-21',
    title: '수업 준비 부족',
    description: '수업 준비가 부족한 상황을 개선해야 합니다',
    scenario: '최근 수업 준비 시간이 부족해서 수업의 질이 떨어지고 있습니다. 효율적인 수업 준비 방법이 필요합니다.',
    difficulty: 'medium',
    category: '수업 설계',
    requiredLevel: 2
  },
  {
    id: '2-22',
    title: '학습 평가 개선',
    description: '학습 평가 방법을 개선해야 합니다',
    scenario: '현재 평가 방법이 학생들의 실력을 제대로 측정하지 못하는 것 같습니다. 더 공정하고 효과적인 평가 방법이 필요합니다.',
    difficulty: 'medium',
    category: '학습 지도',
    requiredLevel: 2
  },
  {
    id: '2-23',
    title: '학급 행사 기획',
    description: '학급 행사를 성공적으로 기획해야 합니다',
    scenario: '다음 달 학급 행사를 준비해야 합니다. 모든 학생이 참여할 수 있고 의미 있는 행사를 만들고 싶습니다.',
    difficulty: 'medium',
    category: '학급 관리',
    requiredLevel: 2
  },
  {
    id: '2-24',
    title: '학습 환경 개선',
    description: '교실 학습 환경을 개선해야 합니다',
    scenario: '교실 환경이 학습에 적합하지 않습니다. 소음, 온도, 조명 등 여러 요소를 개선해서 더 나은 학습 환경을 만들어야 합니다.',
    difficulty: 'medium',
    category: '학급 관리',
    requiredLevel: 2
  },
  {
    id: '2-25',
    title: '동기 부여 전략',
    description: '학습 동기가 부족한 학생들을 위한 전략이 필요합니다',
    scenario: '학급 전체적으로 학습 동기가 낮습니다. 학생들이 적극적으로 참여하고 자기주도적으로 학습할 수 있도록 동기를 부여해야 합니다.',
    difficulty: 'medium',
    category: '학습 지도',
    requiredLevel: 2
  },
  {
    id: '2-26',
    title: '학습 차별화',
    description: '개별 학생의 수준에 맞는 차별화된 학습이 필요합니다',
    scenario: '학생들의 학습 수준이 다양합니다. 각자의 수준에 맞는 과제와 활동을 제공해서 모든 학생이 성장할 수 있도록 해야 합니다.',
    difficulty: 'medium',
    category: '학습 지도',
    requiredLevel: 2
  },
  {
    id: '2-27',
    title: '학부모 협력',
    description: '학부모와의 협력 관계를 강화해야 합니다',
    scenario: '일부 학부모들이 학교 교육에 무관심하거나 비협조적입니다. 가정과 학교가 함께 협력할 수 있는 방안이 필요합니다.',
    difficulty: 'medium',
    category: '상담 및 소통',
    requiredLevel: 2
  },
  {
    id: '2-28',
    title: '학급 소통 개선',
    description: '학급 내 소통을 개선해야 합니다',
    scenario: '학생들 간의 소통이 원활하지 않습니다. 서로의 의견을 존중하고 건설적으로 대화할 수 있는 문화를 만들어야 합니다.',
    difficulty: 'medium',
    category: '학급 관리',
    requiredLevel: 2
  },
  {
    id: '2-29',
    title: '창의성 개발',
    description: '학생들의 창의성을 개발해야 합니다',
    scenario: '학생들이 획일적인 사고를 하는 경향이 있습니다. 다양한 관점에서 생각하고 창의적으로 문제를 해결할 수 있는 능력을 기르고 싶습니다.',
    difficulty: 'medium',
    category: '학습 지도',
    requiredLevel: 2
  },
  {
    id: '2-30',
    title: '학급 문화 조성',
    description: '긍정적인 학급 문화를 조성해야 합니다',
    scenario: '학급 분위기가 전체적으로 소극적이고 개별적입니다. 서로 도우며 함께 성장하는 협력적인 학급 문화를 만들고 싶습니다.',
    difficulty: 'medium',
    category: '학급 관리',
    requiredLevel: 2
  },

  // 레벨 3 퀘스트 (고급) - 30개
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
  },
  {
    id: '3-4',
    title: '프로젝트 기반 학습',
    description: '장기 프로젝트를 통한 학습을 설계해야 합니다',
    scenario: '한 학기 동안 진행할 대규모 프로젝트를 기획하고 있습니다. 학생들이 자기주도적으로 학습하면서 실제 문제를 해결하는 경험을 제공하고 싶습니다.',
    difficulty: 'hard',
    category: '수업 설계',
    requiredLevel: 3
  },
  {
    id: '3-5',
    title: '디지털 시민성 교육',
    description: '올바른 디지털 사용 교육을 설계해야 합니다',
    scenario: '학생들의 디지털 기기 사용이 늘어나면서 디지털 에티켓과 올바른 사용법에 대한 교육이 필요합니다. 체계적인 디지털 시민성 교육 프로그램이 필요합니다.',
    difficulty: 'hard',
    category: '수업 설계',
    requiredLevel: 3
  },
  {
    id: '3-6',
    title: '학습자 중심 교육',
    description: '학생 중심의 수업을 설계해야 합니다',
    scenario: '기존의 교사 중심 수업에서 벗어나 학생들이 주도적으로 참여하는 수업을 만들고 싶습니다. 학생들의 흥미와 수준을 고려한 맞춤형 교육과정이 필요합니다.',
    difficulty: 'hard',
    category: '수업 설계',
    requiredLevel: 3
  },
  {
    id: '3-7',
    title: '다문화 교육 통합',
    description: '다문화 학생들을 위한 통합 교육을 설계해야 합니다',
    scenario: '학급에 다양한 문화적 배경을 가진 학생들이 있습니다. 문화적 다양성을 존중하면서도 모든 학생이 함께 어울릴 수 있는 교육 환경을 만들어야 합니다.',
    difficulty: 'hard',
    category: '학급 관리',
    requiredLevel: 3
  },
  {
    id: '3-8',
    title: '미래 역량 교육',
    description: '4차 산업혁명 시대에 필요한 역량을 기르는 교육이 필요합니다',
    scenario: '창의성, 비판적 사고, 협업, 소통 등 미래 사회에 필요한 핵심 역량을 기를 수 있는 교육과정을 설계해야 합니다.',
    difficulty: 'hard',
    category: '수업 설계',
    requiredLevel: 3
  },
  {
    id: '3-9',
    title: '개별화 교육 시스템',
    description: '각 학생의 특성에 맞는 개별화 교육 시스템이 필요합니다',
    scenario: '학생 개개인의 학습 스타일, 속도, 관심사가 모두 다릅니다. 각자의 특성에 맞는 맞춤형 교육을 제공할 수 있는 시스템을 구축해야 합니다.',
    difficulty: 'hard',
    category: '학습 지도',
    requiredLevel: 3
  },
  {
    id: '3-10',
    title: '학교-지역사회 연계',
    description: '지역사회와 연계한 교육 프로그램을 개발해야 합니다',
    scenario: '학교 교육을 지역사회와 연결하여 더 실질적이고 의미 있는 학습 경험을 제공하고 싶습니다. 지역의 자원을 활용한 교육 프로그램이 필요합니다.',
    difficulty: 'hard',
    category: '수업 설계',
    requiredLevel: 3
  },
  {
    id: '3-11',
    title: '학습 데이터 분석',
    description: '학생 데이터를 분석하여 교육 효과를 높이고 싶습니다',
    scenario: '학생들의 학습 데이터를 체계적으로 수집하고 분석하여 개별 학생의 학습 패턴을 파악하고 맞춤형 지도를 하고 싶습니다.',
    difficulty: 'hard',
    category: '학습 지도',
    requiredLevel: 3
  },
  {
    id: '3-12',
    title: '역량 기반 평가',
    description: '지식뿐만 아니라 역량을 평가하는 시스템이 필요합니다',
    scenario: '단순한 지식 암기가 아닌 학생들의 실제 역량을 평가할 수 있는 새로운 평가 시스템을 개발해야 합니다.',
    difficulty: 'hard',
    category: '학습 지도',
    requiredLevel: 3
  },
  {
    id: '3-13',
    title: '학습 공동체 구축',
    description: '학생들 간의 학습 공동체를 구축해야 합니다',
    scenario: '학생들이 서로 가르치고 배우는 학습 공동체를 만들고 싶습니다. 동료 학습을 통해 더 깊이 있는 학습이 이루어지도록 해야 합니다.',
    difficulty: 'hard',
    category: '학급 관리',
    requiredLevel: 3
  },
  {
    id: '3-14',
    title: '혁신적 교수법 도입',
    description: '새로운 교수법을 도입하여 교육 효과를 높이고 싶습니다',
    scenario: '플립 러닝, 게임 기반 학습, VR/AR 활용 등 혁신적인 교수법을 수업에 도입하여 학생들의 학습 동기와 효과를 높이고 싶습니다.',
    difficulty: 'hard',
    category: '수업 설계',
    requiredLevel: 3
  },
  {
    id: '3-15',
    title: '글로벌 교육 프로그램',
    description: '국제적 감각을 기를 수 있는 교육 프로그램이 필요합니다',
    scenario: '학생들이 글로벌 시대에 필요한 국제적 감각과 다문화 이해 능력을 기를 수 있는 교육 프로그램을 설계해야 합니다.',
    difficulty: 'hard',
    category: '수업 설계',
    requiredLevel: 3
  },
  {
    id: '3-16',
    title: '창업 교육 프로그램',
    description: '학생들의 기업가 정신을 기르는 교육이 필요합니다',
    scenario: '학생들이 미래 사회에서 필요한 기업가 정신과 혁신적 사고를 기를 수 있는 창업 교육 프로그램을 개발해야 합니다.',
    difficulty: 'hard',
    category: '수업 설계',
    requiredLevel: 3
  },
  {
    id: '3-17',
    title: '지속가능발전 교육',
    description: '지속가능한 미래를 위한 교육 프로그램이 필요합니다',
    scenario: '환경, 사회, 경제의 지속가능성을 고려한 교육을 통해 학생들이 미래 사회의 책임감 있는 시민으로 성장할 수 있도록 해야 합니다.',
    difficulty: 'hard',
    category: '수업 설계',
    requiredLevel: 3
  },
  {
    id: '3-18',
    title: '인공지능 활용 교육',
    description: 'AI를 활용한 교육 방법을 개발해야 합니다',
    scenario: '인공지능 기술을 교육에 효과적으로 활용하여 개별 맞춤형 학습과 효율적인 교육 관리를 실현하고 싶습니다.',
    difficulty: 'hard',
    category: '수업 설계',
    requiredLevel: 3
  },
  {
    id: '3-19',
    title: '메타인지 교육',
    description: '학생들의 메타인지 능력을 기르는 교육이 필요합니다',
    scenario: '학생들이 자신의 학습 과정을 객관적으로 인식하고 조절할 수 있는 메타인지 능력을 기르는 교육 프로그램을 개발해야 합니다.',
    difficulty: 'hard',
    category: '학습 지도',
    requiredLevel: 3
  },
  {
    id: '3-20',
    title: '심리적 안전감 조성',
    description: '학급 내 심리적 안전감을 조성해야 합니다',
    scenario: '모든 학생이 안전하고 편안하게 학습할 수 있는 환경을 만들고 싶습니다. 실수를 두려워하지 않고 자유롭게 의견을 표현할 수 있는 분위기가 필요합니다.',
    difficulty: 'hard',
    category: '학급 관리',
    requiredLevel: 3
  },
  {
    id: '3-21',
    title: '학습자 주도 평가',
    description: '학생들이 스스로 평가하고 성찰할 수 있는 시스템이 필요합니다',
    scenario: '학생들이 자신의 학습을 스스로 평가하고 개선 방향을 찾을 수 있는 자기주도적 평가 시스템을 구축해야 합니다.',
    difficulty: 'hard',
    category: '학습 지도',
    requiredLevel: 3
  },
  {
    id: '3-22',
    title: '교육과정 재구성',
    description: '학생 중심으로 교육과정을 재구성해야 합니다',
    scenario: '국가 교육과정을 바탕으로 하되, 우리 학급 학생들의 특성과 요구에 맞게 교육과정을 재구성하여 더 의미 있는 학습을 제공하고 싶습니다.',
    difficulty: 'hard',
    category: '수업 설계',
    requiredLevel: 3
  },
  {
    id: '3-23',
    title: '학습 네트워크 구축',
    description: '학교 밖 학습 네트워크를 구축해야 합니다',
    scenario: '학교 교육의 한계를 넘어서 다양한 기관과 전문가들과의 네트워크를 구축하여 학생들에게 더 풍부한 학습 기회를 제공하고 싶습니다.',
    difficulty: 'hard',
    category: '수업 설계',
    requiredLevel: 3
  },
  {
    id: '3-24',
    title: '학습 동기 이론 적용',
    description: '학습 동기 이론을 실제 교육에 적용해야 합니다',
    scenario: '자기결정이론, 목표설정이론 등 학습 동기에 관한 이론들을 실제 교실 상황에 적용하여 학생들의 내재적 동기를 높이고 싶습니다.',
    difficulty: 'hard',
    category: '학습 지도',
    requiredLevel: 3
  },
  {
    id: '3-25',
    title: '교육 연구 수행',
    description: '교실 상황을 개선하기 위한 교육 연구를 수행해야 합니다',
    scenario: '우리 학급의 교육 문제를 체계적으로 분석하고 해결책을 찾기 위한 실행연구를 계획하고 수행하고 싶습니다.',
    difficulty: 'hard',
    category: '수업 설계',
    requiredLevel: 3
  },
  {
    id: '3-26',
    title: '교사 전문성 개발',
    description: '교사로서의 전문성을 지속적으로 개발해야 합니다',
    scenario: '변화하는 교육 환경에 맞춰 교사로서의 전문성을 지속적으로 개발하고 성장할 수 있는 방안을 모색해야 합니다.',
    difficulty: 'hard',
    category: '수업 설계',
    requiredLevel: 3
  },
  {
    id: '3-27',
    title: '학교 혁신 주도',
    description: '학교 전체의 교육 혁신을 주도해야 합니다',
    scenario: '우리 학급에서의 성공 사례를 바탕으로 학교 전체의 교육 혁신을 이끌어 나가고 싶습니다. 동료 교사들과 협력하여 변화를 만들어야 합니다.',
    difficulty: 'hard',
    category: '학급 관리',
    requiredLevel: 3
  },
  {
    id: '3-28',
    title: '교육 정책 제안',
    description: '현장 경험을 바탕으로 교육 정책을 제안해야 합니다',
    scenario: '교실 현장에서의 경험을 바탕으로 더 나은 교육을 위한 정책을 제안하고 싶습니다. 실질적이고 현실적인 교육 개선 방안이 필요합니다.',
    difficulty: 'hard',
    category: '수업 설계',
    requiredLevel: 3
  },
  {
    id: '3-29',
    title: '미래 교육 설계',
    description: '미래 사회를 위한 교육 모델을 설계해야 합니다',
    scenario: '급변하는 미래 사회에 대비하여 새로운 교육 패러다임을 설계하고 실험해보고 싶습니다. 혁신적인 교육 모델이 필요합니다.',
    difficulty: 'hard',
    category: '수업 설계',
    requiredLevel: 3
  },
  {
    id: '3-30',
    title: '교육 철학 구현',
    description: '자신만의 교육 철학을 구현해야 합니다',
    scenario: '오랜 교육 경험을 바탕으로 정립한 교육 철학을 실제 교실에서 구현하고 싶습니다. 일관된 교육 신념을 바탕으로 한 교육 실천이 필요합니다.',
    difficulty: 'hard',
    category: '수업 설계',
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
