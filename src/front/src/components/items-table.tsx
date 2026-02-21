
import { MoreVertical, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import styles from './items-table.module.css';
import { authFetchJson } from '../api';

// API DTO Interface
interface Item {
  id: number;
  name: string;
  category: string;
  status: string;
  assignee: string;
  progress: number;
  dueDate: string;
  priority: string;
}

type Status = Item['status'];
type Priority = Item['priority'];

const getStatusBadge = (status: Status) => {
  // Match projects-view.tsx status values: active, completed, on-hold
  const icons: Record<string, any> = {
    active: Clock,
    completed: CheckCircle,
    'on-hold': AlertCircle,
  };

  const labels: Record<string, string> = {
    active: '진행 중',
    completed: '완료',
    'on-hold': '보류',
  };

  const Icon = icons[status] || AlertCircle;

  const statusClassMap: Record<string, string> = {
    active: styles.statusInProgress,
    completed: styles.statusCompleted,
    'on-hold': styles.statusPending,
  };

  const statusClass = statusClassMap[status] || styles.statusPending;

  return (
    <span className={`${styles.badgeBase} ${statusClass}`}>
      <Icon className={styles.badgeIcon} />
      {labels[status] || status}
    </span>
  );
};


const getPriorityBadge = (priority: Priority) => {
  const labels: Record<string, string> = {
    high: '높음',
    medium: '중간',
    low: '낮음',
  };

  const priorityClassMap: Record<string, string> = {
    high: styles.priorityHigh,
    medium: styles.priorityMedium,
    low: styles.priorityLow,
  };

  const priorityClass = priorityClassMap[priority] || styles.priorityLow;

  return <span className={`${styles.priorityBase} ${priorityClass}`}>{labels[priority] || priority}</span>;
};

export default function ItemsTable() {
  const [items, setItems] = useState<Item[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  useEffect(() => {
    authFetchJson<Item[]>('/api/main/items')
      .then((data) => setItems(data))
      .catch((err) => console.error('Failed to fetch items:', err));
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const statusMatch = statusFilter === 'all' || item.status === statusFilter;
      const priorityMatch = priorityFilter === 'all' || item.priority === priorityFilter;
      return statusMatch && priorityMatch;
    });
  }, [items, statusFilter, priorityFilter]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>프로젝트 목록</h2>
          <p className={styles.subtitle}>전체 {filteredItems.length}개의 프로젝트</p>
        </div>

        <div className={styles.filters}>
          <select
            className={styles.select}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">전체 상태</option>
            <option value="completed">완료</option>
            <option value="active">진행 중</option>
            <option value="on-hold">보류</option>
          </select>

          <select
            className={styles.select}
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="all">전체 우선순위</option>
            <option value="high">높음</option>
            <option value="medium">중간</option>
            <option value="low">낮음</option>
          </select>
        </div>
      </div>

      <div className={styles.tableScroll}>
        <table className={styles.table}>
          <thead className={styles.thead}>
            <tr>
              <th className={styles.th}>프로젝트명</th>
              <th className={styles.th}>카테고리</th>
              <th className={styles.th}>상태</th>
              <th className={styles.th}>진행률</th>
              <th className={styles.th}>마감일</th>
              <th className={styles.th}>우선순위</th>
              {/* <th className={`${styles.th} ${styles.thRight}`}>작업</th>*/}
            </tr>
          </thead>

          <tbody className={styles.tbody}>
            {filteredItems.map((item) => (
              <tr key={item.id} className={styles.tr}>
                <td className={styles.td}>
                  <div className={styles.name}>{item.name}</div>
                </td>

                <td className={styles.td}>
                  <span className={styles.muted}>{item.category}</span>
                </td>

                <td className={styles.td}>{getStatusBadge(item.status)}</td>

                <td className={styles.td}>
                  <div className={styles.progressRow}>
                    <div className={styles.progressTrack}>
                      <div className={styles.progressFill} style={{ width: `${item.progress}%` }} />
                    </div>
                    <span className={styles.muted}>{item.progress}%</span>
                  </div>
                </td>

                <td className={styles.td}>
                  <span className={styles.muted}>{item.dueDate}</span>
                </td>

                <td className={styles.td}>{getPriorityBadge(item.priority)}</td>

                {/*<td className={`${styles.td} ${styles.tdRight}`}>
                  <button className={styles.moreBtn} type="button" aria-label="more">
                    <MoreVertical className={styles.moreIcon} />
                  </button>
                </td>*/}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}