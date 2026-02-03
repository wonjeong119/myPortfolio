import { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2, Edit2, Calendar, Tag, Filter } from 'lucide-react';

import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';

import styles from './tasks-view.module.css';

type Priority = 'high' | 'medium' | 'low';

interface Task {
  projectId: number;
  taskId: number;
  title: string;
  description: string;
  completed: boolean;
  priority: Priority;
  deadline: string;
  createdAt: string;
  updatedAt: string;
}

interface Project {
  id: string; // Select value로 쓰기 위해 string 유지
  name: string;
}

const API_BASE = 'http://localhost:8080/api/projects';

async function apiFetch<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, init);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `HTTP ${res.status}`);
  }
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) return undefined as T;
  return res.json() as Promise<T>;
}

async function fetchProjectsSimple(): Promise<Project[]> {
  const data = await apiFetch<Array<{ id: number; name: string }>>(`${API_BASE}`);
  return (data || []).map((p) => ({ id: String(p.id), name: p.name }));
}

async function fetchTasks(projectId: number): Promise<Task[]> {
  return apiFetch<Task[]>(`${API_BASE}/${projectId}/tasks`);
}

async function createTask(
    projectId: number,
    body: { title: string; description?: string; priority: Priority; deadline: string }
): Promise<Task> {
  return apiFetch<Task>(`${API_BASE}/${projectId}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

async function updateTask(
    projectId: number,
    taskId: number,
    body: { title: string; description?: string; priority: Priority; deadline: string; completed: boolean }
): Promise<Task> {
  return apiFetch<Task>(`${API_BASE}/${projectId}/tasks/${taskId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

async function toggleTask(projectId: number, taskId: number): Promise<Task> {
  return apiFetch<Task>(`${API_BASE}/${projectId}/tasks/${taskId}/toggle`, { method: 'PATCH' });
}

async function deleteTask(projectId: number, taskId: number): Promise<void> {
  await apiFetch<void>(`${API_BASE}/${projectId}/tasks/${taskId}`, { method: 'DELETE' });
}

async function fetchAllTasks(): Promise<Task[]> {
  return apiFetch<Task[]>(`http://localhost:8080/api/tasks`);
}

export default function TasksView() {
  // ✅ 프로젝트: 하드코딩 제거 → API 로딩
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [projectsError, setProjectsError] = useState('');

  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [newTask, setNewTask] = useState<{
    title: string;
    description: string;
    projectId: string;
    priority: Priority;
    deadline: string;
  }>({
    title: '',
    description: '',
    projectId: '',
    priority: 'medium',
    deadline: '',
  });

  // ✅ 컴포넌트 처음 뜰 때 프로젝트 목록 로드
  useEffect(() => {
    let cancelled = false;

    setProjectsLoading(true);
    setProjectsError('');

    fetchProjectsSimple()
        .then((list) => {
          if (cancelled) return;
          setProjects(list);
        })
        .catch((e: any) => {
          if (cancelled) return;
          setProjectsError(`프로젝트 목록 조회 실패: ${e?.message || '오류'}`);
          setProjects([]);
        })
        .finally(() => {
          if (cancelled) return;
          setProjectsLoading(false);
        });

    return () => {
      cancelled = true;
    };
  }, []);

  const selectedProjectIdNumber = useMemo(() => {
    if (selectedProjectId === 'all') return null;
    const n = Number(selectedProjectId);
    return Number.isFinite(n) ? n : null;
  }, [selectedProjectId]);

  // ✅ 프로젝트 선택에 따라 서버에서 Task 로드
  useEffect(() => {
    setErrorMsg('');

    if (selectedProjectId === 'all') {
      setLoading(true);
      fetchAllTasks()
          .then((data) => setTasks(Array.isArray(data) ? data : []))
          .catch((e: any) => {
            setErrorMsg(`작업 조회 실패: ${e?.message || '알 수 없는 오류'}`);
            setTasks([]);
          })
          .finally(() => setLoading(false));
      return;
    }

    const projectId = selectedProjectIdNumber;
    if (projectId == null) {
      setTasks([]);
      return;
    }

    let cancelled = false;

    setLoading(true);
    fetchTasks(projectId)
        .then((data) => {
          if (cancelled) return;
          setTasks(Array.isArray(data) ? data : []);
        })
        .catch((e: any) => {
          if (cancelled) return;
          setErrorMsg(`작업 조회 실패: ${e?.message || '알 수 없는 오류'}`);
          setTasks([]);
        })
        .finally(() => {
          if (cancelled) return;
          setLoading(false);
        });

    return () => {
      cancelled = true;
    };
  }, [selectedProjectId, selectedProjectIdNumber]);

  const filteredTasks =
      selectedProjectId === 'all'
          ? tasks
          : tasks.filter((task) => String(task.projectId) === selectedProjectId);

  const handleAddTask = async () => {
    setErrorMsg('');

    if (!newTask.title || !newTask.projectId || !newTask.deadline) return;

    const projectId = Number(newTask.projectId);
    if (!Number.isFinite(projectId)) return;

    try {
      setLoading(true);

      const created = await createTask(projectId, {
        title: newTask.title,
        description: newTask.description || '',
        priority: newTask.priority,
        deadline: newTask.deadline,
      });

      setTasks((prev) => [...prev, created]);

      setIsAddDialogOpen(false);
      setNewTask({
        title: '',
        description: '',
        projectId: '',
        priority: 'medium',
        deadline: '',
      });
    } catch (e: any) {
      setErrorMsg(`작업 생성 실패: ${e?.message || '알 수 없는 오류'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEditTask = async () => {
    setErrorMsg('');

    if (!editingTask || !editingTask.title || !editingTask.deadline) return;

    try {
      setLoading(true);

      const updated = await updateTask(editingTask.projectId, editingTask.taskId, {
        title: editingTask.title,
        description: editingTask.description || '',
        priority: editingTask.priority,
        deadline: editingTask.deadline,
        completed: editingTask.completed,
      });

      setTasks((prev) =>
          prev.map((t) =>
              t.projectId === updated.projectId && t.taskId === updated.taskId ? updated : t
          )
      );

      setIsEditDialogOpen(false);
      setEditingTask(null);
    } catch (e: any) {
      setErrorMsg(`작업 수정 실패: ${e?.message || '알 수 없는 오류'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (task: Task) => {
    setErrorMsg('');

    try {
      setLoading(true);
      await deleteTask(task.projectId, task.taskId);

      setTasks((prev) =>
          prev.filter((t) => !(t.projectId === task.projectId && t.taskId === task.taskId))
      );
    } catch (e: any) {
      setErrorMsg(`작업 삭제 실패: ${e?.message || '알 수 없는 오류'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleComplete = async (task: Task) => {
    setErrorMsg('');
    try {
      const updated = await toggleTask(task.projectId, task.taskId);
      setTasks((prev) =>
          prev.map((t) =>
              t.projectId === updated.projectId && t.taskId === updated.taskId ? updated : t
          )
      );
    } catch (e: any) {
      setErrorMsg(`완료 처리 실패: ${e?.message || '알 수 없는 오류'}`);
    }
  };

  const openEditDialog = (task: Task) => {
    setEditingTask({ ...task });
    setIsEditDialogOpen(true);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return styles.priorityHigh;
      case 'medium':
        return styles.priorityMedium;
      case 'low':
        return styles.priorityLow;
      default:
        return styles.priorityDefault;
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

  const getProjectName = (projectId: number | string) => {
    return projects.find((p) => p.id === String(projectId))?.name || '알 수 없음';
  };

  const completedCount = filteredTasks.filter((t) => t.completed).length;
  const totalCount = filteredTasks.length;
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>작업</h1>
            <p className={styles.subtitle}>프로젝트별 작업을 관리하고 추적하세요</p>

            {projectsError && (
                <p style={{ marginTop: 8, color: '#b91c1c', fontSize: 14 }}>{projectsError}</p>
            )}
            {errorMsg && <p style={{ marginTop: 8, color: '#b91c1c', fontSize: 14 }}>{errorMsg}</p>}

            {(projectsLoading || loading) && (
                <p style={{ marginTop: 6, color: '#6b7280', fontSize: 12 }}>로딩 중...</p>
            )}
          </div>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className={styles.primaryButton}>
                <Plus className={styles.icon16} />
                새 작업
              </Button>
            </DialogTrigger>

            <DialogContent className={styles.dialogContent}>
              <DialogHeader>
                <DialogTitle>새 작업 추가</DialogTitle>
              </DialogHeader>

              <div className={styles.formBody}>
                <div className={styles.field}>
                  <Label htmlFor="add-task-title">작업명 *</Label>
                  <Input
                      id="add-task-title"
                      placeholder="작업 제목을 입력하세요"
                      value={newTask.title}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  />
                </div>

                <div className={styles.grid2}>
                  <div className={styles.field}>
                    <Label htmlFor="add-task-project">프로젝트 *</Label>
                    <Select
                        value={newTask.projectId}
                        onValueChange={(value) => setNewTask({ ...newTask, projectId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={projectsLoading ? '불러오는 중...' : '프로젝트 선택'} />
                      </SelectTrigger>
                      <SelectContent>
                        {projects.map((project) => (
                            <SelectItem key={project.id} value={project.id}>
                              {project.name}
                            </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className={styles.field}>
                    <Label htmlFor="add-task-deadline">마감일 *</Label>
                    <Input
                        id="add-task-deadline"
                        type="date"
                        value={newTask.deadline}
                        onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
                    />
                  </div>
                </div>

                <div className={styles.field}>
                  <Label htmlFor="add-task-priority">우선순위</Label>
                  <Select
                      value={newTask.priority}
                      onValueChange={(value) => setNewTask({ ...newTask, priority: value as Priority })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">높음</SelectItem>
                      <SelectItem value="medium">중간</SelectItem>
                      <SelectItem value="low">낮음</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className={styles.field}>
                  <Label htmlFor="add-task-description">설명</Label>
                  <Textarea
                      id="add-task-description"
                      placeholder="작업 설명을 입력하세요"
                      rows={3}
                      value={newTask.description}
                      onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  />
                </div>
              </div>

              <div className={styles.dialogActions}>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  취소
                </Button>
                <Button onClick={handleAddTask} className={styles.primaryButton}>
                  추가
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats & Filter */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>전체 작업</div>
            <div className={styles.statValue}>{filteredTasks.length}</div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statLabel}>완료</div>
            <div className={`${styles.statValue} ${styles.statGreen}`}>{completedCount}</div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statLabel}>진행 중</div>
            <div className={`${styles.statValue} ${styles.statBlue}`}>
              {filteredTasks.length - completedCount}
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statLabel}>진행률</div>
            <div className={`${styles.statValue} ${styles.statPurple}`}>{progressPercentage}%</div>
          </div>

          <div className={styles.statCard}>
            <Label htmlFor="project-filter" className={styles.filterLabel}>
              <Filter className={styles.icon16} />
              프로젝트 필터
            </Label>
            <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
              <SelectTrigger id="project-filter" className={styles.filterTrigger}>
                <SelectValue placeholder={projectsLoading ? '불러오는 중...' : undefined} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tasks List */}
        <div className={styles.tableCard}>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead className={styles.thead}>
              <tr>
                <th className={styles.thCheckbox}>
                  <span className={styles.srOnly}>완료</span>
                </th>
                <th className={styles.th}>작업명</th>
                <th className={styles.th}>프로젝트</th>
                <th className={styles.th}>우선순위</th>
                <th className={styles.th}>마감일</th>
                <th className={styles.thActions}>작업</th>
              </tr>
              </thead>

              <tbody className={styles.tbody}>
              {filteredTasks.map((task) => (
                  <tr key={`${task.projectId}-${task.taskId}`} className={styles.row}>
                    <td className={styles.td}>
                      <Checkbox
                          checked={task.completed}
                          onCheckedChange={() => handleToggleComplete(task)}
                          className={styles.checkbox}
                      />
                    </td>

                    <td className={styles.td}>
                      <div>
                        <div className={task.completed ? styles.taskTitleDone : styles.taskTitle}>
                          {task.title}
                        </div>
                        {task.description && <div className={styles.taskDesc}>{task.description}</div>}
                      </div>
                    </td>

                    <td className={styles.td}>
                      <div className={styles.projectCell}>
                        <Tag className={styles.icon16} />
                        {getProjectName(task.projectId)}
                      </div>
                    </td>

                    <td className={styles.td}>
                      <Badge variant="outline" className={getPriorityColor(task.priority)}>
                        {getPriorityLabel(task.priority)}
                      </Badge>
                    </td>

                    <td className={styles.td}>
                      <div className={styles.deadlineCell}>
                        <Calendar className={styles.icon16} />
                        {task.deadline}
                      </div>
                    </td>

                    <td className={styles.td}>
                      <div className={styles.actions}>
                        <Button
                            variant="ghost"
                            size="sm"
                            className={styles.actionBtn}
                            onClick={() => openEditDialog(task)}
                        >
                          <Edit2 className={styles.icon16} />
                        </Button>

                        <Button
                            variant="ghost"
                            size="sm"
                            className={`${styles.actionBtn} ${styles.deleteBtn}`}
                            onClick={() => handleDeleteTask(task)}
                        >
                          <Trash2 className={styles.icon16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
              ))}
              </tbody>
            </table>
          </div>

          {filteredTasks.length === 0 && (
              <div className={styles.empty}>
                <p className={styles.emptyText}>
                  {selectedProjectId === 'all'
                      ? '프로젝트를 선택하면 작업이 표시됩니다.'
                      : '작업이 없습니다. 새 작업을 추가해보세요!'}
                </p>
              </div>
          )}
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className={styles.dialogContent}>
            <DialogHeader>
              <DialogTitle>작업 수정</DialogTitle>
            </DialogHeader>

            {editingTask && (
                <div className={styles.formBody}>
                  <div className={styles.field}>
                    <Label htmlFor="edit-task-title">작업명 *</Label>
                    <Input
                        id="edit-task-title"
                        placeholder="작업 제목을 입력하세요"
                        value={editingTask.title}
                        onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                    />
                  </div>

                  <div className={styles.grid2}>
                    <div className={styles.field}>
                      <Label htmlFor="edit-task-project">프로젝트 *</Label>
                      <Select value={String(editingTask.projectId)} disabled>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {projects.map((project) => (
                              <SelectItem key={project.id} value={project.id}>
                                {project.name}
                              </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className={styles.field}>
                      <Label htmlFor="edit-task-deadline">마감일 *</Label>
                      <Input
                          id="edit-task-deadline"
                          type="date"
                          value={editingTask.deadline}
                          onChange={(e) => setEditingTask({ ...editingTask, deadline: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className={styles.field}>
                    <Label htmlFor="edit-task-priority">우선순위</Label>
                    <Select
                        value={editingTask.priority}
                        onValueChange={(value) => setEditingTask({ ...editingTask, priority: value as Priority })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">높음</SelectItem>
                        <SelectItem value="medium">중간</SelectItem>
                        <SelectItem value="low">낮음</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className={styles.field}>
                    <Label htmlFor="edit-task-description">설명</Label>
                    <Textarea
                        id="edit-task-description"
                        placeholder="작업 설명을 입력하세요"
                        rows={3}
                        value={editingTask.description}
                        onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                    />
                  </div>

                  <div className={styles.completedRow}>
                    <Checkbox
                        id="edit-task-completed"
                        checked={editingTask.completed}
                        onCheckedChange={(checked) =>
                            setEditingTask({ ...editingTask, completed: checked as boolean })
                        }
                    />
                    <Label htmlFor="edit-task-completed" className={styles.completedLabel}>
                      작업 완료
                    </Label>
                  </div>
                </div>
            )}

            <div className={styles.dialogActions}>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                취소
              </Button>
              <Button onClick={handleEditTask} className={styles.primaryButton}>
                저장
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
  );
}