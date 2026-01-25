import { useState } from 'react';
import { Plus, Trash2, Edit2, Calendar, Tag, Filter } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';

interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  deadline: string;
  createdAt: string;
}

interface Project {
  id: string;
  name: string;
}

const projects: Project[] = [
  { id: '1', name: '포트폴리오 웹사이트' },
  { id: '2', name: 'React 대시보드' },
  { id: '3', name: 'REST API 서버' },
  { id: '4', name: '모바일 앱 프로토타입' },
];

const initialTasks: Task[] = [
  {
    id: '1',
    projectId: '1',
    title: '홈페이지 디자인 완성',
    description: 'Figma에서 홈페이지 최종 디자인 확정',
    completed: true,
    priority: 'high',
    deadline: '2026-01-20',
    createdAt: '2026-01-15',
  },
  {
    id: '2',
    projectId: '1',
    title: 'React 컴포넌트 구현',
    description: '헤더, 푸터, 메인 섹션 컴포넌트 개발',
    completed: false,
    priority: 'high',
    deadline: '2026-01-25',
    createdAt: '2026-01-16',
  },
  {
    id: '3',
    projectId: '2',
    title: '대시보드 레이아웃 설계',
    description: '3단 레이아웃 구조 설계 및 구현',
    completed: true,
    priority: 'medium',
    deadline: '2026-01-18',
    createdAt: '2026-01-10',
  },
  {
    id: '4',
    projectId: '2',
    title: '차트 컴포넌트 통합',
    description: 'Recharts 라이브러리로 차트 구현',
    completed: false,
    priority: 'medium',
    deadline: '2026-01-28',
    createdAt: '2026-01-12',
  },
  {
    id: '5',
    projectId: '3',
    title: 'API 엔드포인트 설계',
    description: 'RESTful API 엔드포인트 명세 작성',
    completed: false,
    priority: 'high',
    deadline: '2026-01-24',
    createdAt: '2026-01-14',
  },
];

export default function TasksView() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: '',
    description: '',
    projectId: '',
    priority: 'medium',
    deadline: '',
    completed: false,
  });

  const filteredTasks =
    selectedProjectId === 'all'
      ? tasks
      : tasks.filter((task) => task.projectId === selectedProjectId);

  const handleAddTask = () => {
    if (!newTask.title || !newTask.projectId || !newTask.deadline) {
      return;
    }

    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      description: newTask.description || '',
      projectId: newTask.projectId,
      priority: newTask.priority as 'high' | 'medium' | 'low',
      deadline: newTask.deadline,
      completed: false,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setTasks([...tasks, task]);
    setIsAddDialogOpen(false);
    setNewTask({
      title: '',
      description: '',
      projectId: '',
      priority: 'medium',
      deadline: '',
      completed: false,
    });
  };

  const handleEditTask = () => {
    if (!editingTask || !editingTask.title || !editingTask.projectId || !editingTask.deadline) {
      return;
    }

    setTasks(tasks.map((task) => (task.id === editingTask.id ? editingTask : task)));
    setIsEditDialogOpen(false);
    setEditingTask(null);
  };

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const handleToggleComplete = (id: string) => {
    setTasks(
      tasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task))
    );
  };

  const openEditDialog = (task: Task) => {
    setEditingTask({ ...task });
    setIsEditDialogOpen(true);
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

  const getProjectName = (projectId: string) => {
    return projects.find((p) => p.id === projectId)?.name || '알 수 없음';
  };

  const completedCount = filteredTasks.filter((t) => t.completed).length;
  const totalCount = filteredTasks.length;
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="h-full px-6 py-6 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">작업</h1>
          <p className="text-gray-600 mt-1">프로젝트별 작업을 관리하고 추적하세요</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              새 작업
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>새 작업 추가</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="add-task-title">작업명 *</Label>
                <Input
                  id="add-task-title"
                  placeholder="작업 제목을 입력하세요"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="add-task-project">프로젝트 *</Label>
                  <Select
                    value={newTask.projectId}
                    onValueChange={(value) => setNewTask({ ...newTask, projectId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="프로젝트 선택" />
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

                <div className="space-y-2">
                  <Label htmlFor="add-task-deadline">마감일 *</Label>
                  <Input
                    id="add-task-deadline"
                    type="date"
                    value={newTask.deadline}
                    onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="add-task-priority">우선순위</Label>
                <Select
                  value={newTask.priority}
                  onValueChange={(value) =>
                    setNewTask({ ...newTask, priority: value as 'high' | 'medium' | 'low' })
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

              <div className="space-y-2">
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
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                취소
              </Button>
              <Button onClick={handleAddTask} className="bg-blue-600 hover:bg-blue-700">
                추가
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats & Filter */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600">전체 작업</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{filteredTasks.length}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600">완료</div>
          <div className="text-2xl font-bold text-green-600 mt-1">{completedCount}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600">진행 중</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">
            {filteredTasks.length - completedCount}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600">진행률</div>
          <div className="text-2xl font-bold text-purple-600 mt-1">{progressPercentage}%</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <Label htmlFor="project-filter" className="text-sm text-gray-600 flex items-center gap-2">
            <Filter className="w-4 h-4" />
            프로젝트 필터
          </Label>
          <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
            <SelectTrigger id="project-filter" className="mt-2">
              <SelectValue />
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
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="w-12 px-4 py-3 text-left">
                  <span className="sr-only">완료</span>
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">작업명</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">프로젝트</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">우선순위</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">마감일</th>
                <th className="w-24 px-4 py-3 text-right text-sm font-medium text-gray-700">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTasks.map((task) => (
                <tr key={task.id} className="hover:bg-gray-50 group">
                  <td className="px-4 py-4">
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={() => handleToggleComplete(task.id)}
                      className="w-5 h-5"
                    />
                  </td>
                  <td className="px-4 py-4">
                    <div>
                      <div
                        className={`font-medium ${
                          task.completed
                            ? 'line-through text-gray-500'
                            : 'text-gray-900'
                        }`}
                      >
                        {task.title}
                      </div>
                      {task.description && (
                        <div className="text-sm text-gray-500 mt-1 line-clamp-1">
                          {task.description}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Tag className="w-4 h-4" />
                      {getProjectName(task.projectId)}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <Badge variant="outline" className={getPriorityColor(task.priority)}>
                      {getPriorityLabel(task.priority)}
                    </Badge>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      {task.deadline}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => openEditDialog(task)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteTask(task.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTasks.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">작업이 없습니다. 새 작업을 추가해보세요!</p>
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>작업 수정</DialogTitle>
          </DialogHeader>
          {editingTask && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-task-title">작업명 *</Label>
                <Input
                  id="edit-task-title"
                  placeholder="작업 제목을 입력하세요"
                  value={editingTask.title}
                  onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-task-project">프로젝트 *</Label>
                  <Select
                    value={editingTask.projectId}
                    onValueChange={(value) => setEditingTask({ ...editingTask, projectId: value })}
                  >
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

                <div className="space-y-2">
                  <Label htmlFor="edit-task-deadline">마감일 *</Label>
                  <Input
                    id="edit-task-deadline"
                    type="date"
                    value={editingTask.deadline}
                    onChange={(e) => setEditingTask({ ...editingTask, deadline: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-task-priority">우선순위</Label>
                <Select
                  value={editingTask.priority}
                  onValueChange={(value) =>
                    setEditingTask({
                      ...editingTask,
                      priority: value as 'high' | 'medium' | 'low',
                    })
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

              <div className="space-y-2">
                <Label htmlFor="edit-task-description">설명</Label>
                <Textarea
                  id="edit-task-description"
                  placeholder="작업 설명을 입력하세요"
                  rows={3}
                  value={editingTask.description}
                  onChange={(e) =>
                    setEditingTask({ ...editingTask, description: e.target.value })
                  }
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-task-completed"
                  checked={editingTask.completed}
                  onCheckedChange={(checked) =>
                    setEditingTask({ ...editingTask, completed: checked as boolean })
                  }
                />
                <Label htmlFor="edit-task-completed" className="cursor-pointer">
                  작업 완료
                </Label>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleEditTask} className="bg-blue-600 hover:bg-blue-700">
              저장
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
