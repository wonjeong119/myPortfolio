import { FolderOpen, CheckSquare, Clock, ListTodo } from 'lucide-react';
import { useEffect, useState } from 'react';
import styles from './summary-cards.module.css';
import { authFetchJson } from '../api';

interface SummaryData {
  ongoingProjectsValue: string;
  ongoingProjectsTrend: string;
  ongoingProjectsDesc: string;
  completedProjectsValue: string;
  completedProjectsTrend: string;
  completedProjectsDesc: string;
  completedTasksValue: string;
  completedTasksTrend: string;
  completedTasksDesc: string;
  remainingTasksValue: string;
  remainingTasksTrend: string;
  remainingTasksDesc: string;
}

type Variant = 'blue' | 'green' | 'purple' | 'orange';

export default function SummaryCards() {
  const [data, setData] = useState<SummaryData | null>(null);

  useEffect(() => {
    authFetchJson<SummaryData>('/api/main/summary')
      .then((result) => setData(result))
      .catch((err) => console.error('Failed to fetch summary:', err));
  }, []);

  const summaryCards = data
    ? [
      {
        id: 1,
        icon: FolderOpen,
        title: '진행 중인 프로젝트',
        value: data.ongoingProjectsValue,
        description: data.ongoingProjectsDesc,
        variant: 'blue' as Variant,
        trend: data.ongoingProjectsTrend,
      },
      {
        id: 2,
        icon: CheckSquare,
        title: '이번 달 완료한 프로젝트',
        value: data.completedProjectsValue,
        description: data.completedProjectsDesc,
        variant: 'green' as Variant,
        trend: data.completedProjectsTrend,
      },
      {
        id: 3,
        icon: ListTodo,
        title: '완료한 작업',
        value: data.completedTasksValue,
        description: data.completedTasksDesc,
        variant: 'purple' as Variant,
        trend: data.completedTasksTrend,
      },
      {
        id: 4,
        icon: Clock,
        title: '남은 작업',
        value: data.remainingTasksValue,
        description: data.remainingTasksDesc,
        variant: 'orange' as Variant,
        trend: data.remainingTasksTrend,
      },
    ]
    : [];

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h2 className={styles.title}>활동 요약</h2>
        <p className={styles.subtitle}>나의 프로젝트 활동을 한눈에 확인하세요</p>
      </div>

      <div className={styles.grid}>
        {summaryCards.map((item) => {
          const Icon = item.icon;
          const variant = item.variant;

          return (
            <div key={item.id} className={styles.card}>
              <div className={styles.topRow}>
                <div className={styles.left}>
                  <div className={`${styles.iconBox} ${styles[`iconBox_${variant}`]}`}>
                    <Icon className={`${styles.icon} ${styles[`icon_${variant}`]}`} />
                  </div>

                  <span className={styles.cardTitle}>{item.title}</span>
                </div>

                <div className={styles.trend}>
                  <span>{item.trend}</span>
                </div>
              </div>

              <div className={styles.body}>
                <p className={styles.value}>{item.value}</p>
                <p className={styles.desc}>{item.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
