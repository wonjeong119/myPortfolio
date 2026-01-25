import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Calendar, CheckCircle2, TrendingUp } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';

// 월별 완료 작업 데이터
const monthlyData = [
  { month: '1월', completed: 12 },
  { month: '2월', completed: 8 },
  { month: '3월', completed: 15 },
  { month: '4월', completed: 10 },
  { month: '5월', completed: 18 },
  { month: '6월', completed: 14 },
];

// 주별 완료 작업 데이터 (최근 8주)
const weeklyData = [
  { week: '1주차', completed: 5 },
  { week: '2주차', completed: 3 },
  { week: '3주차', completed: 7 },
  { week: '4주차', completed: 4 },
  { week: '5주차', completed: 6 },
  { week: '6주차', completed: 8 },
  { week: '7주차', completed: 5 },
  { week: '8주차', completed: 9 },
];

// 일별 완료 작업 데이터 (최근 7일)
const dailyData = [
  { day: '월', completed: 2 },
  { day: '화', completed: 3 },
  { day: '수', completed: 1 },
  { day: '목', completed: 4 },
  { day: '금', completed: 3 },
  { day: '토', completed: 0 },
  { day: '일', completed: 1 },
];

// 프로젝트별 완료 작업 비율
const projectData = [
  { name: '포트폴리오 웹사이트', value: 35, color: '#3b82f6' },
  { name: 'React 대시보드', value: 28, color: '#8b5cf6' },
  { name: 'REST API 서버', value: 22, color: '#10b981' },
  { name: '모바일 앱 프로토타입', value: 15, color: '#f59e0b' },
];

// 우선순위별 완료 작업
const priorityData = [
  { priority: '높음', completed: 18, color: '#ef4444' },
  { priority: '중간', completed: 25, color: '#f59e0b' },
  { priority: '낮음', completed: 12, color: '#10b981' },
];

// 최근 완료한 작업 목록
const recentCompletedTasks = [
  {
    id: '1',
    title: '홈페이지 디자인 완성',
    project: '포트폴리오 웹사이트',
    completedAt: '2026-01-20',
    priority: 'high',
  },
  {
    id: '2',
    title: '대시보드 레이아웃 설계',
    project: 'React 대시보드',
    completedAt: '2026-01-19',
    priority: 'medium',
  },
  {
    id: '3',
    title: 'API 문서 작성',
    project: 'REST API 서버',
    completedAt: '2026-01-18',
    priority: 'high',
  },
  {
    id: '4',
    title: '테스트 코드 작성',
    project: 'React 대시보드',
    completedAt: '2026-01-17',
    priority: 'medium',
  },
  {
    id: '5',
    title: '반응형 레이아웃 구현',
    project: '포트폴리오 웹사이트',
    completedAt: '2026-01-16',
    priority: 'low',
  },
];

export default function AnalyticsView() {
  const [timeRange, setTimeRange] = useState<'daily' | 'weekly' | 'monthly'>('weekly');

  const getChartData = () => {
    switch (timeRange) {
      case 'daily':
        return dailyData;
      case 'weekly':
        return weeklyData;
      case 'monthly':
        return monthlyData;
      default:
        return weeklyData;
    }
  };

  const getTimeLabel = () => {
    switch (timeRange) {
      case 'daily':
        return '일별';
      case 'weekly':
        return '주별';
      case 'monthly':
        return '월별';
      default:
        return '주별';
    }
  };

  const getTotalCompleted = () => {
    const data = getChartData();
    return data.reduce((sum, item) => sum + item.completed, 0);
  };

  const getAverageCompleted = () => {
    const data = getChartData();
    return Math.round(data.reduce((sum, item) => sum + item.completed, 0) / data.length);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high':
        return '높음';
      case 'medium':
        return '중간';
      case 'low':
        return '낮음';
      default:
        return priority;
    }
  };

  return (
    <div className="h-full px-6 py-6 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">분석</h1>
          <p className="text-gray-600 mt-1">작업 완료 현황과 생산성을 분석하세요</p>
        </div>
        <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">일별</SelectItem>
            <SelectItem value="weekly">주별</SelectItem>
            <SelectItem value="monthly">월별</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
            <CheckCircle2 className="w-4 h-4" />
            총 완료 작업
          </div>
          <div className="text-2xl font-bold text-gray-900">{getTotalCompleted()}</div>
          <div className="text-xs text-gray-500 mt-1">{getTimeLabel()} 기준</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
            <TrendingUp className="w-4 h-4" />
            평균 완료 작업
          </div>
          <div className="text-2xl font-bold text-blue-600">{getAverageCompleted()}</div>
          <div className="text-xs text-gray-500 mt-1">기간당 평균</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600 mb-1">완료율</div>
          <div className="text-2xl font-bold text-green-600">78%</div>
          <div className="text-xs text-gray-500 mt-1">전체 작업 대비</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600 mb-1">생산성 점수</div>
          <div className="text-2xl font-bold text-purple-600">92</div>
          <div className="text-xs text-green-600 mt-1">↑ 12% 증가</div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {/* 완료 작업 추이 차트 */}
        <div className="col-span-2 bg-white rounded-lg border border-gray-200 p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            완료 작업 추이 ({getTimeLabel()})
          </h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={getChartData()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey={timeRange === 'daily' ? 'day' : timeRange === 'weekly' ? 'week' : 'month'}
                tick={{ fontSize: 12 }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="completed" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 프로젝트별 완료 비율 */}
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">프로젝트별 완료</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={projectData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {projectData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {projectData.map((project) => (
              <div key={project.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: project.color }}
                  />
                  <span className="text-gray-700 text-xs">{project.name}</span>
                </div>
                <span className="text-gray-900 font-medium">{project.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 우선순위별 완료 & 최근 완료 작업 */}
      <div className="grid grid-cols-3 gap-4">
        {/* 우선순위별 완료 작업 */}
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">우선순위별 완료</h2>
          <div className="space-y-4">
            {priorityData.map((item) => (
              <div key={item.priority}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{item.priority}</span>
                  <span className="text-sm font-bold text-gray-900">{item.completed}개</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: `${(item.completed / 55) * 100}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 최근 완료한 작업 */}
        <div className="col-span-2 bg-white rounded-lg border border-gray-200 p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">최근 완료한 작업</h2>
          <div className="space-y-3">
            {recentCompletedTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-gray-900">{task.title}</span>
                  </div>
                  <div className="text-xs text-gray-600 ml-6">{task.project}</div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className={getPriorityColor(task.priority)}>
                    {getPriorityLabel(task.priority)}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    {task.completedAt}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
