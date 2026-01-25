import { useState } from 'react';
import { Plus, Trash2, Edit2, FileText, Tag, Calendar, Download, Upload, Filter, File } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';

interface Document {
  id: string;
  projectId: string;
  title: string;
  description: string;
  type: 'spec' | 'design' | 'guide' | 'api' | 'other';
  fileName: string;
  fileSize: number;
  fileType: string;
  fileData?: string;
  createdAt: string;
  updatedAt: string;
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

const initialDocuments: Document[] = [
  {
    id: '1',
    projectId: '1',
    title: '포트폴리오 디자인 시스템',
    description: 'Figma 디자인 파일 및 컴포넌트 가이드',
    type: 'design',
    fileName: 'design-system.pdf',
    fileSize: 2457600,
    fileType: 'application/pdf',
    createdAt: '2026-01-10',
    updatedAt: '2026-01-20',
  },
  {
    id: '2',
    projectId: '1',
    title: '기술 스택 문서',
    description: 'React, TypeScript, Tailwind CSS 사용 가이드',
    type: 'guide',
    fileName: 'tech-stack-guide.docx',
    fileSize: 1024000,
    fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    createdAt: '2026-01-12',
    updatedAt: '2026-01-18',
  },
  {
    id: '3',
    projectId: '2',
    title: '대시보드 요구사항 명세',
    description: '기능 요구사항 및 화면 구성 명세서',
    type: 'spec',
    fileName: 'dashboard-requirements.pdf',
    fileSize: 3145728,
    fileType: 'application/pdf',
    createdAt: '2026-01-08',
    updatedAt: '2026-01-15',
  },
  {
    id: '4',
    projectId: '2',
    title: 'UI/UX 가이드라인',
    description: '대시보드 UI 컴포넌트 사용 가이드',
    type: 'guide',
    fileName: 'ui-ux-guidelines.pdf',
    fileSize: 1843200,
    fileType: 'application/pdf',
    createdAt: '2026-01-14',
    updatedAt: '2026-01-22',
  },
  {
    id: '5',
    projectId: '3',
    title: 'REST API 명세서',
    description: 'API 엔드포인트 및 요청/응답 스키마',
    type: 'api',
    fileName: 'api-specification.json',
    fileSize: 524288,
    fileType: 'application/json',
    createdAt: '2026-01-05',
    updatedAt: '2026-01-19',
  },
  {
    id: '6',
    projectId: '3',
    title: '데이터베이스 스키마',
    description: 'DB 테이블 구조 및 관계도',
    type: 'spec',
    fileName: 'database-schema.sql',
    fileSize: 307200,
    fileType: 'application/sql',
    createdAt: '2026-01-07',
    updatedAt: '2026-01-16',
  },
];

export default function DocumentsView() {
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [newDocument, setNewDocument] = useState<Partial<Document>>({
    title: '',
    description: '',
    projectId: '',
    type: 'guide',
    fileName: '',
    fileSize: 0,
    fileType: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [editSelectedFile, setEditSelectedFile] = useState<File | null>(null);

  const filteredDocuments =
    selectedProjectId === 'all'
      ? documents
      : documents.filter((doc) => doc.projectId === selectedProjectId);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setNewDocument({
        ...newDocument,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
      });
    }
  };

  const handleEditFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && editingDocument) {
      setEditSelectedFile(file);
      setEditingDocument({
        ...editingDocument,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
      });
    }
  };

  const handleAddDocument = () => {
    if (!newDocument.title || !newDocument.projectId || !newDocument.fileName) {
      return;
    }

    const now = new Date().toISOString().split('T')[0];
    const document: Document = {
      id: Date.now().toString(),
      title: newDocument.title,
      description: newDocument.description || '',
      projectId: newDocument.projectId,
      type: newDocument.type as 'spec' | 'design' | 'guide' | 'api' | 'other',
      fileName: newDocument.fileName,
      fileSize: newDocument.fileSize || 0,
      fileType: newDocument.fileType || '',
      createdAt: now,
      updatedAt: now,
    };

    setDocuments([...documents, document]);
    setIsAddDialogOpen(false);
    setSelectedFile(null);
    setNewDocument({
      title: '',
      description: '',
      projectId: '',
      type: 'guide',
      fileName: '',
      fileSize: 0,
      fileType: '',
    });
  };

  const handleEditDocument = () => {
    if (!editingDocument || !editingDocument.title || !editingDocument.projectId || !editingDocument.fileName) {
      return;
    }

    const updatedDoc = {
      ...editingDocument,
      updatedAt: new Date().toISOString().split('T')[0],
    };

    setDocuments(documents.map((doc) => (doc.id === editingDocument.id ? updatedDoc : doc)));
    setIsEditDialogOpen(false);
    setEditingDocument(null);
    setEditSelectedFile(null);
  };

  const handleDeleteDocument = (id: string) => {
    setDocuments(documents.filter((doc) => doc.id !== id));
  };

  const handleDownload = (document: Document) => {
    // 실제 환경에서는 서버에서 파일을 다운로드하지만, 
    // 여기서는 시뮬레이션으로 파일 다운로드를 표시
    const blob = new Blob(['파일 내용 샘플'], { type: document.fileType });
    const url = window.URL.createObjectURL(blob);
    const link = window.document.createElement('a');
    link.href = url;
    link.download = document.fileName;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const openEditDialog = (document: Document) => {
    setEditingDocument({ ...document });
    setEditSelectedFile(null);
    setIsEditDialogOpen(true);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'spec':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'design':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'guide':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'api':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'other':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'spec':
        return '명세서';
      case 'design':
        return '디자인';
      case 'guide':
        return '가이드';
      case 'api':
        return 'API';
      case 'other':
        return '기타';
      default:
        return type;
    }
  };

  const getProjectName = (projectId: string) => {
    return projects.find((p) => p.id === projectId)?.name || '알 수 없음';
  };

  return (
    <div className="h-full px-6 py-6 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">문서</h1>
          <p className="text-gray-600 mt-1">프로젝트별 문서를 관리하고 공유하세요</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              새 문서
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>새 문서 추가</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="add-doc-title">문서 제목 *</Label>
                <Input
                  id="add-doc-title"
                  placeholder="문서 제목을 입력하세요"
                  value={newDocument.title}
                  onChange={(e) => setNewDocument({ ...newDocument, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="add-doc-project">프로젝트 *</Label>
                  <Select
                    value={newDocument.projectId}
                    onValueChange={(value) => setNewDocument({ ...newDocument, projectId: value })}
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
                  <Label htmlFor="add-doc-type">문서 유형</Label>
                  <Select
                    value={newDocument.type}
                    onValueChange={(value) =>
                      setNewDocument({ ...newDocument, type: value as any })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="spec">명세서</SelectItem>
                      <SelectItem value="design">디자인</SelectItem>
                      <SelectItem value="guide">가이드</SelectItem>
                      <SelectItem value="api">API</SelectItem>
                      <SelectItem value="other">기타</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="add-doc-file">파일 첨부 *</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="add-doc-file"
                    type="file"
                    onChange={handleFileSelect}
                    className="cursor-pointer"
                  />
                </div>
                {selectedFile && (
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                    <File className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700">{selectedFile.name}</span>
                    <span className="text-xs text-gray-500">({formatFileSize(selectedFile.size)})</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="add-doc-description">설명</Label>
                <Textarea
                  id="add-doc-description"
                  placeholder="문서 설명을 입력하세요"
                  rows={3}
                  value={newDocument.description}
                  onChange={(e) => setNewDocument({ ...newDocument, description: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                취소
              </Button>
              <Button onClick={handleAddDocument} className="bg-blue-600 hover:bg-blue-700">
                추가
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats & Filter */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600">전체 문서</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{filteredDocuments.length}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600">명세서</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">
            {filteredDocuments.filter((d) => d.type === 'spec').length}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600">가이드</div>
          <div className="text-2xl font-bold text-green-600 mt-1">
            {filteredDocuments.filter((d) => d.type === 'guide').length}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600">API 문서</div>
          <div className="text-2xl font-bold text-orange-600 mt-1">
            {filteredDocuments.filter((d) => d.type === 'api').length}
          </div>
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

      {/* Documents Grid */}
      {/*<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">*/}
      <div className="grid grid-cols-2 lg:grid-cols-2 gap-4">
        {filteredDocuments.map((document) => (
          <div
            key={document.id}
            className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-5 h-5 text-gray-600" />
                  <h3 className="font-semibold text-lg text-gray-900">{document.title}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={getTypeColor(document.type)}>
                    {getTypeLabel(document.type)}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => openEditDialog(document)}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleDeleteDocument(document.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{document.description}</p>

            <div className="space-y-2 mb-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Tag className="w-4 h-4" />
                <span>{getProjectName(document.projectId)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <File className="w-4 h-4" />
                <span className="flex-1 truncate">{document.fileName}</span>
                <span className="text-xs text-gray-500">({formatFileSize(document.fileSize)})</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>최종 수정: {document.updatedAt}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-200">
              <Button
                onClick={() => handleDownload(document)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                size="sm"
              >
                <Download className="w-4 h-4 mr-2" />
                다운로드
              </Button>
            </div>
          </div>
        ))}
      </div>

      {filteredDocuments.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">문서가 없습니다. 새 문서를 추가해보세요!</p>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>문서 수정</DialogTitle>
          </DialogHeader>
          {editingDocument && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-doc-title">문서 제목 *</Label>
                <Input
                  id="edit-doc-title"
                  placeholder="문서 제목을 입력하세요"
                  value={editingDocument.title}
                  onChange={(e) => setEditingDocument({ ...editingDocument, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-doc-project">프로젝트 *</Label>
                  <Select
                    value={editingDocument.projectId}
                    onValueChange={(value) =>
                      setEditingDocument({ ...editingDocument, projectId: value })
                    }
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
                  <Label htmlFor="edit-doc-type">문서 유형</Label>
                  <Select
                    value={editingDocument.type}
                    onValueChange={(value) =>
                      setEditingDocument({ ...editingDocument, type: value as any })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="spec">명세서</SelectItem>
                      <SelectItem value="design">디자인</SelectItem>
                      <SelectItem value="guide">가이드</SelectItem>
                      <SelectItem value="api">API</SelectItem>
                      <SelectItem value="other">기타</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-doc-file">파일 변경 (선택사항)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="edit-doc-file"
                    type="file"
                    onChange={handleEditFileSelect}
                    className="cursor-pointer"
                  />
                </div>
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                  <File className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-700">{editingDocument.fileName}</span>
                  <span className="text-xs text-gray-500">({formatFileSize(editingDocument.fileSize)})</span>
                </div>
                {editSelectedFile && (
                  <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
                    <Upload className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-blue-700">새 파일: {editSelectedFile.name}</span>
                    <span className="text-xs text-blue-600">({formatFileSize(editSelectedFile.size)})</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-doc-description">설명</Label>
                <Textarea
                  id="edit-doc-description"
                  placeholder="문서 설명을 입력하세요"
                  rows={3}
                  value={editingDocument.description}
                  onChange={(e) =>
                    setEditingDocument({ ...editingDocument, description: e.target.value })
                  }
                />
              </div>
            </div>
          )}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleEditDocument} className="bg-blue-600 hover:bg-blue-700">
              저장
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}