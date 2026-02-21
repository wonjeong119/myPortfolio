import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from 'recharts';
import { TrendingUp, CheckSquare, ListTodo } from 'lucide-react';
import { useEffect, useState } from 'react';

import styles from './hero-panel.module.css';

import { authFetchJson } from '../api';

interface ChartData {
  month: string;
  value: number;
}

interface HeroData {
  chartData: ChartData[];
  weeklyTasks: number;
  weeklyTasksDiff: number;
  completedTasksThisWeek: number;
  remainingTasks: number;
  remainingTasksDiff: number;
  trendPercentage: string;
}

export default function HeroPanel() {
  const [data, setData] = useState<HeroData | null>(null);

  useEffect(() => {
    authFetchJson<HeroData>('/api/main/hero')
      .then((result) => setData(result))
      .catch((err) => console.error('Failed to fetch hero data:', err));
  }, []);

  const chartData = data?.chartData || [];
  const weeklyTasks = data?.weeklyTasks || 0;
  const completedTasksThisWeek = data?.completedTasksThisWeek || 0;
  const remainingTasks = data?.remainingTasks || 0;
  const remainingTasksDiff = data?.remainingTasksDiff || 0;
  const trendPercentage = data?.trendPercentage || '+0%';

  return (
    <div className={styles.wrapper}>
      <div className={styles.grid}>
        {/* Left side - Quick Stats */}
        <div className={styles.left}>
          <div>
            <h1 className={styles.title}>나의 프로젝트 현황</h1>
          </div>

          <div className={styles.cards}>
            <div className={styles.statCard}>
              <div className={styles.statRow}>
                <div className={styles.iconBox}>
                  <CheckSquare className={styles.icon} />
                </div>

                <div className={styles.statBody}>
                  <p className={styles.statLabel}>이번 주 작업</p>
                  <p className={styles.statValue}>{weeklyTasks}개</p>
                  <p className={styles.statSub}>지난주 {completedTasksThisWeek}개</p>
                </div>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statRow}>
                <div className={styles.iconBox}>
                  <ListTodo className={styles.icon} />
                </div>

                <div className={styles.statBody}>
                  <p className={styles.statLabel}>남은 작업수</p>
                  <p className={styles.statValue}>{remainingTasks}개</p>
                  {/*<p className={`${styles.statSub} ${styles.subGood}`}>
                    {remainingTasksDiff >= 0 ? '↑' : '↓'} {Math.abs(remainingTasksDiff)}개 {remainingTasksDiff >= 0 ? '증가' : '감소'}
                  </p>*/}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Middle - Chart */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <div>
              <h3 className={styles.chartTitle}>활동 추이</h3>
              <p className={styles.chartSub}>최근 6개월 작업 건수 증가</p>
            </div>

            <div className={styles.trend}>
              <TrendingUp className={styles.trendIcon} />
              <span className={styles.trendText}>{trendPercentage}</span>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ffffff" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ffffff" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="month" stroke="rgba(255,255,255,0.6)" tick={{ fontSize: 12 }} />
              <YAxis stroke="rgba(255,255,255,0.6)" tick={{ fontSize: 12 }} />

              {/* Tooltip은 Recharts 특성상 inline이 제일 안전 */}
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255,255,255,0.95)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#1f2937',
                  fontSize: '12px',
                }}
              />

              <Area
                type="monotone"
                dataKey="value"
                stroke="#ffffff"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorValue)"
              >
                <LabelList dataKey="value" position="top" fill="#ffffff" fontSize={12} offset={10} />
              </Area>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

