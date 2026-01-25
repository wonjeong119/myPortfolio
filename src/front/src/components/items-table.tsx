import { MoreVertical, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const items = [
  {
    id: 1,
    name: '포트폴리오 웹사이트',
    category: 'Frontend',
    status: 'completed',
    assignee: '김민수',
    progress: 100,
    dueDate: '2026-01-15',
    priority: 'high',
  },
  {
    id: 2,
    name: 'React 대시보드 구축',
    category: 'Frontend',
    status: 'in-progress',
    assignee: '이지은',
    progress: 75,
    dueDate: '2026-01-25',
    priority: 'high',
  },
  {
    id: 3,
    name: 'REST API 서버 개발',
    category: 'Backend',
    status: 'in-progress',
    assignee: '박서준',
    progress: 60,
    dueDate: '2026-01-28',
    priority: 'high',
  },
  {
    id: 4,
    name: '블로그 플랫폼',
    category: 'Fullstack',
    status: 'in-progress',
    assignee: '최수지',
    progress: 45,
    dueDate: '2026-02-10',
    priority: 'medium',
  },
  {
    id: 5,
    name: 'UI 컴포넌트 라이브러리',
    category: 'Design',
    status: 'pending',
    assignee: '정우성',
    progress: 20,
    dueDate: '2026-02-15',
    priority: 'medium',
  },
  {
    id: 6,
    name: '모바일 앱 프로토타입',
    category: 'Mobile',
    status: 'pending',
    assignee: '강동원',
    progress: 15,
    dueDate: '2026-02-20',
    priority: 'low',
  },
];

const getStatusBadge = (status: string) => {
  const styles = {
    completed: 'bg-green-100 text-green-700 border-green-200',
    'in-progress': 'bg-blue-100 text-blue-700 border-blue-200',
    pending: 'bg-gray-100 text-gray-700 border-gray-200',
  };

  const icons = {
    completed: CheckCircle,
    'in-progress': Clock,
    pending: AlertCircle,
  };

  const labels = {
    completed: '완료',
    'in-progress': '진행중',
    pending: '대기',
  };

  const Icon = icons[status as keyof typeof icons];

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${styles[status as keyof typeof styles]}`}>
      <Icon className="w-3 h-3" />
      {labels[status as keyof typeof labels]}
    </span>
  );
};

const getPriorityBadge = (priority: string) => {
  const styles = {
    high: 'text-red-700',
    medium: 'text-yellow-700',
    low: 'text-gray-700',
  };

  const labels = {
    high: '높음',
    medium: '중간',
    low: '낮음',
  };

  return (
    <span className={`text-sm font-medium ${styles[priority as keyof typeof styles]}`}>
      {labels[priority as keyof typeof labels]}
    </span>
  );
};

export default function ItemsTable() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col" style={{ maxHeight: 'calc(100vh - 520px)' }}>
      <div className="px-6 py-3 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">프로젝트 목록</h2>
            <p className="text-sm text-gray-600">전체 {items.length}개의 프로젝트</p>
          </div>
          <div className="flex items-center gap-2">
            <select className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500">
              <option>전체 상태</option>
              <option>완료</option>
              <option>진행중</option>
              <option>대기</option>
            </select>
            <select className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500">
              <option>전체 우선순위</option>
              <option>높음</option>
              <option>중간</option>
              <option>낮음</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-auto flex-1">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100 sticky top-0">
            <tr>
              <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                프로젝트명
              </th>
              <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                카테고리
              </th>
              <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                상태
              </th>
              <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                진행률
              </th>
              <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                마감일
              </th>
              <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                우선순위
              </th>
              <th className="px-6 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                작업
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-3 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{item.name}</div>
                </td>
                <td className="px-6 py-3 whitespace-nowrap">
                  <span className="text-sm text-gray-600">{item.category}</span>
                </td>
                <td className="px-6 py-3 whitespace-nowrap">
                  {getStatusBadge(item.status)}
                </td>
                <td className="px-6 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 w-20">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600">{item.progress}%</span>
                  </div>
                </td>
                <td className="px-6 py-3 whitespace-nowrap">
                  <span className="text-sm text-gray-600">{item.dueDate}</span>
                </td>
                <td className="px-6 py-3 whitespace-nowrap">
                  {getPriorityBadge(item.priority)}
                </td>
                <td className="px-6 py-3 whitespace-nowrap text-right">
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}