import { useMemo, useEffect, useState } from 'react';
import { Plus, Trash2, Calendar, Tag, AlertCircle, Edit2 } from 'lucide-react';
import { authFetchJson } from '../api';

import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';

import styles from './projects-view.module.css';

type Priority = 'high' | 'medium' | 'low';
type Status = 'active' | 'completed' | 'on-hold';

interface Project {
  id: number;
  name: string;
  category: string;
  priority: Priority;
  status: Status;
  deadline: string; // yyyy-mm-dd
  description: string;
  progress: number;
}

interface ProjectUpsertRequest {
  name: string;
  category: string;
  priority: Priority;
  status: Status;
  deadline: string;
  description: string;
  progress: number;
}

const API_BASE = '/api/projects';

async function apiGet<T>(url: string): Promise<T> {
  return authFetchJson<T>(url);
}

async function apiPost(url: string, body: unknown): Promise<void> {
  await authFetchJson(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

async function apiPut(url: string, body: unknown): Promise<void> {
  await authFetchJson(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

async function apiDelete(url: string): Promise<void> {
  await authFetchJson(url, { method: 'DELETE' });
}

export default function ProjectsView() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // 수정 모드 여부 (null이면 신규)
  const [editingId, setEditingId] = useState<number | null>(null);

  // 로딩/에러 상태
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [form, setForm] = useState<Partial<ProjectUpsertRequest>>({
    name: '',
    category: '',
    priority: 'medium',
    status: 'active',
    deadline: '',
    description: '',
    progress: 0,
  });

  // 최초 로딩: GET /api/projects
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        setErrorMsg(null);
        const data = await apiGet<Project[]>(API_BASE);
        if (!mounted) return;
        setProjects(data);
      } catch (e: any) {
        if (!mounted) return;
        setErrorMsg(e?.message ?? '프로젝트를 불러오지 못했습니다.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const resetForm = () => {
    setForm({
      name: '',
      category: '',
      priority: 'medium',
      status: 'active',
      deadline: '',
      description: '',
      progress: 0,
    });
    setEditingId(null);
  };

  const openCreate = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEdit = (p: Project) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      category: p.category,
      priority: p.priority,
      status: p.status,
      deadline: p.deadline,
      description: p.description ?? '',
      progress: p.progress ?? 0,
    });
    setIsDialogOpen(true);
  };

  // 신규/수정 공용 저장
  const handleSave = async () => {
    const missing: string[] = [];
    if (!form.name?.trim()) missing.push('프로젝트명');
    if (!form.category?.trim()) missing.push('카테고리');
    if (!form.deadline) missing.push('마감일');

    if (missing.length > 0) {
      alert(`필수값을 입력해주세요: ${missing.join(', ')}`);
      return;
    }

    const payload: ProjectUpsertRequest = {
      name: form.name!.trim(),
      category: form.category!.trim(),
      priority: (form.priority ?? 'medium') as Priority,
      status: (form.status ?? 'active') as Status,
      deadline: form.deadline!,
      description: (form.description ?? '').trim(),
      progress: Number.isFinite(form.progress as number) ? (form.progress as number) : 0,
    };

    try {
      setErrorMsg(null);

      if (editingId == null) {
        // ✅ 신규: POST /api/projects
        await apiPost(API_BASE, payload);
      } else {
        // ✅ 수정: PUT /api/projects/{id}
        await apiPut(`${API_BASE}/${editingId}`, payload);
      }

      const refreshed = await apiGet<Project[]>(API_BASE);
      setProjects(refreshed);

      setIsDialogOpen(false);
      resetForm();
    } catch (e: any) {
      setErrorMsg(e?.message ?? '저장에 실패했습니다.');
    }
  };

  // 삭제: DELETE /api/projects/{id}
  const handleDeleteProject = async (id: number) => {
    const ok = window.confirm('정말 삭제할까요?');
    if (!ok) return;

    try {
      setErrorMsg(null);
      await apiDelete(`${API_BASE}/${id}`);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (e: any) {
      setErrorMsg(e?.message ?? '프로젝트 삭제에 실패했습니다.');
    }
  };

  const priorityClass = (priority: Project['priority']) => {
    switch (priority) {
      case 'high':
        return styles.badgePriorityHigh;
      case 'medium':
        return styles.badgePriorityMedium;
      case 'low':
        return styles.badgePriorityLow;
    }
  };

  const statusClass = (status: Project['status']) => {
    switch (status) {
      case 'active':
        return styles.badgeStatusActive;
      case 'completed':
        return styles.badgeStatusCompleted;
      case 'on-hold':
        return styles.badgeStatusOnHold;
    }
  };

  const priorityLabel = (priority: Project['priority']) => {
    switch (priority) {
      case 'high':
        return '높음';
      case 'medium':
        return '중간';
      case 'low':
        return '낮음';
    }
  };

  const statusLabel = (status: Project['status']) => {
    switch (status) {
      case 'active':
        return '진행 중';
      case 'completed':
        return '완료';
      case 'on-hold':
        return '보류';
    }
  };

  const stats = useMemo(() => {
    const total = projects.length;
    const active = projects.filter((p) => p.status === 'active').length;
    const completed = projects.filter((p) => p.status === 'completed').length;
    const high = projects.filter((p) => p.priority === 'high').length;
    return { total, active, completed, high };
  }, [projects]);

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>프로젝트</h1>
          <p className={styles.subtitle}>모든 프로젝트를 관리하고 추적하세요</p>

          {loading && <p className={styles.subtitle}>불러오는 중...</p>}
          {errorMsg && (
            <p className={styles.subtitle} style={{ color: 'crimson' }}>
              {errorMsg}
            </p>
          )}
        </div>

        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}
        >
          {/* ✅ 기존 UI 유지: 버튼 스타일 동일. 클릭 시 신규 오픈 */}
          <DialogTrigger asChild>
            <Button className={styles.addButton} onClick={openCreate}>
              <Plus className={styles.iconSm} />
              새 프로젝트
            </Button>
          </DialogTrigger>

          <DialogContent className={styles.dialogContent}>
            <DialogHeader>
              <DialogTitle>{editingId == null ? '새 프로젝트 추가' : '프로젝트 수정'}</DialogTitle>
            </DialogHeader>

            <div className={styles.form}>
              <div className={styles.formBlock}>
                <Label htmlFor="project-name">프로젝트명 *</Label>
                <Input
                  id="project-name"
                  placeholder="프로젝트 이름을 입력하세요"
                  value={form.name ?? ''}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div className={styles.formGrid2}>
                <div className={styles.formBlock}>
                  <Label htmlFor="project-category">카테고리 *</Label>
                  <Input
                    id="project-category"
                    placeholder="예: Web Development"
                    value={form.category ?? ''}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  />
                </div>

                <div className={styles.formBlock}>
                  <Label htmlFor="project-deadline">마감일 *</Label>
                  <Input
                    id="project-deadline"
                    type="date"
                    value={form.deadline ?? ''}
                    onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                  />
                </div>
              </div>

              <div className={styles.formGrid2}>
                <div className={styles.formBlock}>
                  <Label htmlFor="project-priority">우선순위</Label>
                  <Select
                    value={(form.priority ?? 'medium') as Priority}
                    onValueChange={(value) => setForm({ ...form, priority: value as Priority })}
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

                <div className={styles.formBlock}>
                  <Label htmlFor="project-status">상태</Label>
                  <Select
                    value={(form.status ?? 'active') as Status}
                    onValueChange={(value) => setForm({ ...form, status: value as Status })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">진행 중</SelectItem>
                      <SelectItem value="completed">완료</SelectItem>
                      <SelectItem value="on-hold">보류</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className={styles.formBlock}>
                <Label htmlFor="project-description">설명</Label>
                <Textarea
                  id="project-description"
                  placeholder="프로젝트 설명을 입력하세요"
                  rows={3}
                  value={form.description ?? ''}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div className={styles.formBlock}>
                <Label htmlFor="project-progress">진행률 (%) - 자동 계산</Label>
                <Input
                  id="project-progress"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="0"
                  value={0}
                  disabled
                />
              </div>
            </div>

            <div className={styles.dialogFooter}>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                취소
              </Button>
              <Button onClick={handleSave} className={styles.confirmButton}>
                {editingId == null ? '추가' : '저장'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>전체 프로젝트</div>
          <div className={styles.statValue}>{stats.total}</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statLabel}>진행 중</div>
          <div className={`${styles.statValue} ${styles.statValueBlue}`}>{stats.active}</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statLabel}>완료</div>
          <div className={`${styles.statValue} ${styles.statValueGreen}`}>{stats.completed}</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statLabel}>높은 우선순위</div>
          <div className={`${styles.statValue} ${styles.statValueRed}`}>{stats.high}</div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className={styles.projectsGrid}>
        {projects.map((project) => (
          <div key={project.id} className={styles.projectCard}>
            <div className={styles.projectTop}>
              <div className={styles.projectTopLeft}>
                <h3 className={styles.projectName}>{project.name}</h3>

                <div className={styles.badgeRow}>
                  <Badge
                    variant="outline"
                    className={`${styles.badgeBase} ${priorityClass(project.priority)}`}
                  >
                    <AlertCircle className={styles.iconXs} />
                    {priorityLabel(project.priority)}
                  </Badge>

                  <Badge
                    variant="outline"
                    className={`${styles.badgeBase} ${statusClass(project.status)}`}
                  >
                    {statusLabel(project.status)}
                  </Badge>
                </div>
              </div>

              {/* ✅ 수정 + 삭제 버튼 */}
              <div style={{ display: 'flex', gap: 8 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={styles.deleteButton}
                  onClick={() => openEdit(project)}
                  aria-label="프로젝트 수정"
                >
                  <Edit2 className={styles.iconSmOnly} />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className={styles.deleteButton}
                  onClick={() => handleDeleteProject(project.id)}
                  aria-label="프로젝트 삭제"
                >
                  <Trash2 className={styles.iconSmOnly} />
                </Button>
              </div>
            </div>

            <p className={styles.description}>{project.description}</p>

            <div className={styles.meta}>
              <div className={styles.metaRow}>
                <Tag className={styles.iconSmOnly} />
                <span>{project.category}</span>
              </div>
              <div className={styles.metaRow}>
                <Calendar className={styles.iconSmOnly} />
                <span>마감: {project.deadline}</span>
              </div>
            </div>

            <div className={styles.progressWrap}>
              <div className={styles.progressHeader}>
                <span className={styles.progressLabel}>진행률</span>
                <span className={styles.progressValue}>{project.progress}%</span>
              </div>
              <div className={styles.progressTrack}>
                <div className={styles.progressFill} style={{ width: `${project.progress}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {!loading && projects.length === 0 && (
        <div className={styles.empty}>
          <p className={styles.emptyText}>프로젝트가 없습니다. 새 프로젝트를 추가해보세요!</p>
        </div>
      )}
    </div>
  );
}
