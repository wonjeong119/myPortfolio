import { FolderOpen, GitBranch, Coffee, Star } from 'lucide-react';

const summaryData = [
  {
    id: 1,
    icon: FolderOpen,
    title: '진행 중인 프로젝트',
    value: '5',
    description: '2개 마감 임박',
    bgColor: 'bg-blue-50',
    iconColor: 'text-blue-600',
    trend: '+2',
  },
  {
    id: 2,
    icon: GitBranch,
    title: '이번 달 커밋',
    value: '142',
    description: '일평균 7.1개',
    bgColor: 'bg-green-50',
    iconColor: 'text-green-600',
    trend: '+18',
  },
  {
    id: 3,
    icon: Coffee,
    title: '집중 시간',
    value: '86h',
    description: '이번 달 누적',
    bgColor: 'bg-purple-50',
    iconColor: 'text-purple-600',
    trend: '+12h',
  },
  {
    id: 4,
    icon: Star,
    title: '완료한 작업',
    value: '24',
    description: '이번 주 기준',
    bgColor: 'bg-orange-50',
    iconColor: 'text-orange-600',
    trend: '+8',
  },
];

export default function SummaryCards() {
  return (
    <div>
      <div className="mb-3">
        <h2 className="text-xl font-bold text-gray-900">활동 요약</h2>
        <p className="text-gray-600 text-sm mt-1">나의 프로젝트 활동을 한눈에 확인하세요</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryData.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 ${item.bgColor} rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${item.iconColor}`} />
                </div>
                <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                  <span>{item.trend}</span>
                </div>
              </div>
              
              <div className="space-y-1">
                <p className="text-xs text-gray-600">{item.title}</p>
                <p className="text-2xl font-bold text-gray-900">{item.value}</p>
                <p className="text-xs text-gray-500">{item.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}