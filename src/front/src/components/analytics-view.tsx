import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Calendar, CheckCircle2, TrendingUp, ListTodo, ClipboardList } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';

import styles from './analytics-view.module.css';

// --- Types ---
interface AnalyticsSummary {
  totalTasks: number;
  completedTasks: number;
  remainingTasks: number;
  completionRate: number;
}

interface ChartData {
  label: string;
  value: number;
}

interface ProjectStat {
  projectName: string;
  completedCount: number;
  totalCount: number;
  completionRate: number;
}

interface PriorityStat {
  priority: string;
  count: number;
}

interface TaskResponse {
  projectId: number;
  taskId: number;
  title: string;
  description: string;
  completed: boolean;
  priority: string;
  deadline: string;
  createdAt: string;
  updatedAt: string;
}

type TimeRange = 'daily' | 'weekly' | 'monthly';

// --- API Helper ---
const API_BASE = 'http://localhost:8080/api/analytics';

async function apiFetch<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, init);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export default function AnalyticsView() {
  const [timeRange, setTimeRange] = useState<TimeRange>('weekly');

  const [summary, setSummary] = useState<AnalyticsSummary>({
    totalTasks: 0,
    completedTasks: 0,
    remainingTasks: 0,
    completionRate: 0,
  });

  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [projectStats, setProjectStats] = useState<ProjectStat[]>([]);
  const [priorityStats, setPriorityStats] = useState<PriorityStat[]>([]);
  const [recentTasks, setRecentTasks] = useState<TaskResponse[]>([]);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // 1. Initial Load of Summary, Projects, Priorities, Recent Tasks
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        const [sum, projects, priorities, recents] = await Promise.all([
          apiFetch<AnalyticsSummary>(`${API_BASE}/summary`),
          apiFetch<ProjectStat[]>(`${API_BASE}/projects`),
          apiFetch<PriorityStat[]>(`${API_BASE}/priorities`),
          apiFetch<TaskResponse[]>(`${API_BASE}/recent`),
        ]);

        setSummary(sum);
        setProjectStats(projects);
        setPriorityStats(priorities);
        setRecentTasks(recents);
      } catch (e: any) {
        setErrorMsg(`데이터 로딩 실패: ${e?.message || '오류'}`);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // 2. Load Chart Data when timeRange changes
  useEffect(() => {
    const loadChartData = async () => {
      try {
        let data: ChartData[] = [];
        if (timeRange === 'daily') {
          data = await apiFetch<ChartData[]>(`${API_BASE}/daily`);
        } else if (timeRange === 'weekly') {
          data = await apiFetch<ChartData[]>(`${API_BASE}/weekly`);
        } else {
          data = await apiFetch<ChartData[]>(`${API_BASE}/monthly`);
        }
        setChartData(data);
      } catch (e: any) {
        console.error("Chart data loading failed", e);
      }
    };

    loadChartData();
  }, [timeRange]);

  const getTimeLabel = () => {
    switch (timeRange) {
      case 'daily': return '일별';
      case 'weekly': return '주별';
      case 'monthly': return '월별';
      default: return '주별';
    }
  };

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case 'high': return styles.badgeHigh;
      case 'medium': return styles.badgeMedium;
      case 'low': return styles.badgeLow;
      default: return styles.badgeDefault;
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return '높음';
      case 'medium': return '중간';
      case 'low': return '낮음';
      default: return priority;
    }
  };

  const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];
  const PRIORITY_COLORS: Record<string, string> = {
    high: '#ef4444',
    medium: '#f59e0b',
    low: '#10b981',
  };

  return (
    <div className={styles.wrapper}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleWrap}>
          <h1 className={styles.title}>분석</h1>
          <p className={styles.subtitle}>작업 완료 현황과 생산성을 분석하세요</p>
        </div>

        <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
          <SelectTrigger className={styles.timeSelect}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">일별 (최근 7일)</SelectItem>
            <SelectItem value="weekly">주별 (최근 8주)</SelectItem>
            <SelectItem value="monthly">월별 (올해)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading && <p className="text-sm text-gray-500 mb-4">데이터 불러오는 중...</p>}
      {errorMsg && <p className="text-sm text-red-500 mb-4">{errorMsg}</p>}

      {/* Stats */}
      <div className={styles.statsGrid}>
        <div className={styles.card}>
          <div className={styles.cardLabel}>
            <ClipboardList className="w-4 h-4" />
            총 작업
          </div>
          <div className={styles.cardValue}>{summary.totalTasks}</div>
          <div className={styles.cardHint}>전체 등록된 작업</div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardLabel}>
            <CheckCircle2 className="w-4 h-4" />
            완료된 작업
          </div>
          <div className={`${styles.cardValue} ${styles.valueBlue}`}>{summary.completedTasks}</div>
          <div className={styles.cardHint}>전체 완료</div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardLabel}>
            <ListTodo className="w-4 h-4" />
            남은 작업
          </div>
          <div className={`${styles.cardValue} ${styles.valueOrange}`}>{summary.remainingTasks}</div>
          <div className={styles.cardHint}>진행 중</div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardLabel}>
            <TrendingUp className="w-4 h-4" />
            완료율
          </div>
          <div className={`${styles.cardValue} ${styles.valueGreen}`}>{summary.completionRate}%</div>
          <div className={styles.cardHint}>전체 대비 완료</div>
        </div>
      </div>

      {/* Charts Row */}
      <div className={styles.chartsGrid}>
        <div className={`${styles.card} ${styles.colSpan2}`}>
          <h2 className={styles.sectionTitle}>완료 작업 추이 ({getTimeLabel()})</h2>

          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="label"
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
              <Bar dataKey="value" name="완료 수" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className={styles.card}>
          <h2 className={styles.sectionTitle}>프로젝트별 완료율</h2>

          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={projectStats}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={5}
                dataKey="completionRate"
                nameKey="projectName"
              >
                {projectStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>

          <div className={styles.legendList}>
            {projectStats.slice(0, 5).map((project, index) => (
              <div key={project.projectName} className={styles.legendRow}>
                <div className={styles.legendLeft}>
                  <div className={styles.legendDot} style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className={styles.legendName}>{project.projectName}</span>
                </div>
                <span className={styles.legendValue}>{project.completionRate}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className={styles.bottomGrid}>
        <div className={styles.card}>
          <h2 className={styles.sectionTitle}>우선순위별 완료 분포</h2>

          <div className={styles.priorityList}>
            {priorityStats.map((item) => (
              <div key={item.priority}>
                <div className={styles.priorityHeader}>
                  <span className={styles.priorityName}>{getPriorityLabel(item.priority)}</span>
                  <span className={styles.priorityCount}>{item.count}개</span>
                </div>

                <div className={styles.progressTrack}>
                  <div
                    className={styles.progressFill}
                    style={{
                      width: `${Math.min((item.count / summary.completedTasks) * 100, 100)}%`,
                      backgroundColor: PRIORITY_COLORS[item.priority] || '#999',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={`${styles.card} ${styles.colSpan2}`}>
          <h2 className={styles.sectionTitle}>최근 완료한 작업</h2>

          <div className={styles.recentList}>
            {recentTasks.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">완료된 작업이 없습니다.</p>
            ) : (
              recentTasks.map((task) => (
                <div key={`${task.projectId}-${task.taskId}`} className={styles.recentItem}>
                  <div className={styles.recentLeft}>
                    <div className={styles.recentTitleRow}>
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span className={styles.recentTitle}>{task.title}</span>
                    </div>
                    {/* We don't have project name in TaskResponse easily unless we join or fetch projects map.
                              For now, we can hide it or show ID, or update backend to return project name in TaskResponse.
                              Let's assume backend update or generic placeholders for now.
                              Wait, I can use the same logic as tasks-view if I had the project list.
                           */}
                    <div className={styles.recentProject}>Project #{task.projectId}</div>
                  </div>

                  <div className={styles.recentRight}>
                    <Badge variant="outline" className={getPriorityBadgeClass(task.priority)}>
                      {getPriorityLabel(task.priority)}
                    </Badge>

                    <div className={styles.dateRow}>
                      <Calendar className="w-3 h-3" />
                      {task.updatedAt ? new Date(task.updatedAt).toLocaleDateString() : '-'}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}