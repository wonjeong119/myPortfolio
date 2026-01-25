import { useMemo, useState } from 'react';
import { Plus, Trash2, Calendar, Tag, AlertCircle } from 'lucide-react';

import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';

import styles from './projects-view.module.css';

interface Project {
  id: string;
  name: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  status: 'active' | 'completed' | 'on-hold';
  deadline: string;
  description: string;
  progress: number;
}

const initialProjects: Project[] = [
  {
    id: '1',
    name: '포트폴리오 웹사이트',
    category: 'Web Development',
    priority: 'high',
    status: 'active',
    deadline: '2026-02-15',
    description: '개인 포트폴리오 웹사이트 제작',
    progress: 75,
  },
  {
    id: '2',
    name: 'React 대시보드',
    category: 'Web Development',
    priority: 'medium',
    status: 'active',
    deadline: '2026-03-01',
    description: '관리자용 대시보드 구축',
    progress: 60,
  },
  {
    id: '3',
    name: 'REST API 서버',
    category: 'Backend',
    priority: 'high',
    status: 'active',
    deadline: '2026-02-28',
    description: 'Node.js 기반 REST API 개발',
    progress: 40,
  },
  {
    id: '4',
    name: '모바일 앱 프로토타입',
    category: 'Mobile',
    priority: 'low',
    status: 'on-hold',
    deadline: '2026-04-15',
    description: 'React Native 앱 프로토타입',
    progress: 20,
  },
];

export default function ProjectsView() {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newProject, setNewProject] = useState<Partial<Project>>({
    name: '',
    category: '',
    priority: 'medium',
    status: 'active',
    deadline: '',
    description: '',
    progress: 0,
  });

  const handleAddProject = () => {
    if (!newProject.name || !newProject.category || !newProject.deadline) return;

    const project: Project = {
      id: Date.now().toString(),
      name: newProject.name,
      category: newProject.category,
      priority: newProject.priority as 'high' | 'medium' | 'low',
      status: newProject.status as 'active' | 'completed' | 'on-hold',
      deadline: newProject.deadline,
      description: newProject.description || '',
      progress: newProject.progress || 0,
    };

    setProjects((prev) => [...prev, project]);
    setIsDialogOpen(false);
    setNewProject({
      name: '',
      category: '',
      priority: 'medium',
      status: 'active',
      deadline: '',
      description: '',
      progress: 0,
    });
  };

  const handleDeleteProject = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
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
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className={styles.addButton}>
                <Plus className={styles.iconSm} />
                새 프로젝트
              </Button>
            </DialogTrigger>

            <DialogContent className={styles.dialogContent}>
              <DialogHeader>
                <DialogTitle>새 프로젝트 추가</DialogTitle>
              </DialogHeader>

              <div className={styles.form}>
                <div className={styles.formBlock}>
                  <Label htmlFor="project-name">프로젝트명 *</Label>
                  <Input
                      id="project-name"
                      placeholder="프로젝트 이름을 입력하세요"
                      value={newProject.name}
                      onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  />
                </div>

                <div className={styles.formGrid2}>
                  <div className={styles.formBlock}>
                    <Label htmlFor="project-category">카테고리 *</Label>
                    <Input
                        id="project-category"
                        placeholder="예: Web Development"
                        value={newProject.category}
                        onChange={(e) => setNewProject({ ...newProject, category: e.target.value })}
                    />
                  </div>

                  <div className={styles.formBlock}>
                    <Label htmlFor="project-deadline">마감일 *</Label>
                    <Input
                        id="project-deadline"
                        type="date"
                        value={newProject.deadline}
                        onChange={(e) => setNewProject({ ...newProject, deadline: e.target.value })}
                    />
                  </div>
                </div>

                <div className={styles.formGrid2}>
                  <div className={styles.formBlock}>
                    <Label htmlFor="project-priority">우선순위</Label>
                    <Select
                        value={newProject.priority}
                        onValueChange={(value) =>
                            setNewProject({ ...newProject, priority: value as Project['priority'] })
                        }
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
                        value={newProject.status}
                        onValueChange={(value) =>
                            setNewProject({ ...newProject, status: value as Project['status'] })
                        }
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
                      value={newProject.description}
                      onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  />
                </div>

                <div className={styles.formBlock}>
                  <Label htmlFor="project-progress">진행률 (%)</Label>
                  <Input
                      id="project-progress"
                      type="number"
                      min="0"
                      max="100"
                      placeholder="0"
                      value={newProject.progress}
                      onChange={(e) => setNewProject({ ...newProject, progress: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className={styles.dialogFooter}>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  취소
                </Button>
                <Button onClick={handleAddProject} className={styles.confirmButton}>
                  추가
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
                      <Badge variant="outline" className={`${styles.badgeBase} ${priorityClass(project.priority)}`}>
                        <AlertCircle className={styles.iconXs} />
                        {priorityLabel(project.priority)}
                      </Badge>

                      <Badge variant="outline" className={`${styles.badgeBase} ${statusClass(project.status)}`}>
                        {statusLabel(project.status)}
                      </Badge>
                    </div>
                  </div>

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

        {projects.length === 0 && (
            <div className={styles.empty}>
              <p className={styles.emptyText}>프로젝트가 없습니다. 새 프로젝트를 추가해보세요!</p>
            </div>
        )}
      </div>
  );
}