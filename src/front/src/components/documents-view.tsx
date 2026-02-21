import { useEffect, useState } from 'react';
import { authFetchJson, authFetch } from '../api';
import {
  Plus,
  Trash2,
  Edit2,
  FileText,
  Tag,
  Calendar,
  Download,
  Upload,
  Filter,
  File as FileIcon,
} from 'lucide-react';

import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';

import styles from './documents-view.module.css';
import * as React from "react";

// --- Types ---
interface DocumentResponse {
  id: number;
  projectId: number;
  title: string;
  description: string;
  docType: 'spec' | 'design' | 'guide' | 'api' | 'other';
  originalName: string;
  storedName: string;
  fileSize: number;
  mimeType: string;
  createdAt: string;
  updatedAt: string;
}

interface Project {
  id: string; // Select value string
  name: string;
}

// --- API Helper ---
const API_BASE = '/api';

async function apiFetch<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  return authFetchJson<T>(input, init);
}

// Simple fetch projects (Assuming existing logic or similar endpoint available)
// Using /api/projects endpoint
async function fetchProjectsSimple(): Promise<Project[]> {
  const data = await apiFetch<Array<{ id: number; name: string }>>(`${API_BASE}/projects`);
  return (data || []).map((p) => ({ id: String(p.id), name: p.name }));
}

export default function DocumentsView() {
  const [documents, setDocuments] = useState<DocumentResponse[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Edit / Add state
  const [editingDocument, setEditingDocument] = useState<DocumentResponse | null>(null);
  const [newDocument, setNewDocument] = useState<{
    title: string;
    description: string;
    projectId: string;
    docType: string;
  }>({
    title: '',
    description: '',
    projectId: '',
    docType: 'guide',
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // --- Initial Load ---
  useEffect(() => {
    fetchProjectsSimple()
      .then(setProjects)
      .catch((e) => console.error("Projects load failed", e));
  }, []);

  // --- Load Documents ---
  useEffect(() => {
    if (projects.length > 0) {
      fetchDocuments();
    }
  }, [selectedProjectId, projects]); // Re-fetch when projects loaded or selection changes

  // --- Handlers ---

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) setSelectedFile(file);
  };

  // Helper to re-fetch documents
  const fetchDocuments = async () => {
    try {
      setLoading(true);
      let docs: DocumentResponse[] = [];
      if (selectedProjectId === 'all') {
        if (projects.length > 0) {
          const promises = projects.map(p =>
            apiFetch<DocumentResponse[]>(`${API_BASE}/projects/${p.id}/documents`)
          );
          const results = await Promise.all(promises);
          docs = results.flat();
        }
      } else {
        docs = await apiFetch<DocumentResponse[]>(`${API_BASE}/projects/${selectedProjectId}/documents`);
      }
      docs.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      setDocuments(docs);
    } catch (e: any) {
      setErrorMsg(`문서 목록 로드 실패: ${e?.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDocument = async () => {
    if (!newDocument.title || !newDocument.projectId || !selectedFile) {
      alert("필수 입력 항목을 확인하세요.");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', newDocument.title);
      formData.append('description', newDocument.description || '');
      formData.append('docType', newDocument.docType);

      await authFetch(`${API_BASE}/projects/${newDocument.projectId}/documents`, {
        method: 'POST',
        body: formData,
      });

      setIsAddDialogOpen(false);
      setNewDocument({ title: '', description: '', projectId: '', docType: 'guide' });
      setSelectedFile(null);

      // Refresh without page reload
      await fetchDocuments();

    } catch (e: any) {
      alert(`업로드 실패: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEditDocument = async () => {
    if (!editingDocument) return;

    try {
      setLoading(true);
      await apiFetch(`${API_BASE}/documents/${editingDocument.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editingDocument.title,
          description: editingDocument.description,
          docType: editingDocument.docType,
        })
      });

      setIsEditDialogOpen(false);
      setEditingDocument(null);

      // Refresh without page reload
      await fetchDocuments();

    } catch (e: any) {
      alert(`수정 실패: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDocument = async (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      await apiFetch(`${API_BASE}/documents/${id}`, { method: 'DELETE' });
      setDocuments(prev => prev.filter(d => d.id !== id));
    } catch (e: any) {
      alert(`삭제 실패: ${e.message}`);
    }
  };

  const handleDownload = async (doc: DocumentResponse) => {
    try {
      const res = await authFetch(`${API_BASE}/documents/${doc.id}/download`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', doc.originalName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (e: any) {
      console.error("Download error:", e);
      alert(`다운로드 실패: ${e.message}`);
    }
  };

  // --- Helpers ---
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const getProjectName = (id: number) => {
    return projects.find((p) => Number(p.id) === id)?.name || '알 수 없음';
  };

  const getTypeBadgeClass = (type: string) => {
    switch (type) {
      case 'spec': return styles.badgeSpec;
      case 'design': return styles.badgeDesign;
      case 'guide': return styles.badgeGuide;
      case 'api': return styles.badgeApi;
      default: return styles.badgeOther;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'spec': return '명세서';
      case 'design': return '디자인';
      case 'guide': return '가이드';
      case 'api': return 'API';
      default: return '기타';
    }
  };

  const openEditDialog = (doc: DocumentResponse) => {
    setEditingDocument({ ...doc });
    setIsEditDialogOpen(true);
  }

  return (
    <div className={styles.wrapper}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.headerTitle}>문서</h1>
          <p className={styles.headerSubtitle}>프로젝트별 문서를 관리하고 공유하세요</p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className={styles.primaryBtn}>
              <Plus className="w-4 h-4 mr-2" />
              새 문서
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>새 문서 추가</DialogTitle>
            </DialogHeader>

            <div className={styles.dialogBody}>
              <div className={styles.field}>
                <Label htmlFor="add-doc-title">문서 제목 *</Label>
                <Input
                  id="add-doc-title"
                  placeholder="문서 제목을 입력하세요"
                  value={newDocument.title}
                  onChange={(e) => setNewDocument({ ...newDocument, title: e.target.value })}
                />
              </div>

              <div className={styles.grid2}>
                <div className={styles.field}>
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

                <div className={styles.field}>
                  <Label htmlFor="add-doc-type">문서 유형</Label>
                  <Select
                    value={newDocument.docType}
                    onValueChange={(value) => setNewDocument({ ...newDocument, docType: value })}
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

              <div className={styles.field}>
                <Label htmlFor="add-doc-file">파일 첨부 *</Label>
                <Input id="add-doc-file" type="file" onChange={handleFileSelect} className={styles.fileInput} />

                {selectedFile && (
                  <div className={styles.fileInfo}>
                    <FileIcon className="w-4 h-4 text-gray-600" />
                    <span className={styles.fileName}>{selectedFile.name}</span>
                    <span className={styles.fileSize}>({formatFileSize(selectedFile.size)})</span>
                  </div>
                )}
              </div>

              <div className={styles.field}>
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

            <div className={styles.dialogFooter}>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                취소
              </Button>
              <Button onClick={handleAddDocument} className={styles.primaryBtn} disabled={loading}>
                {loading ? '업로드 중...' : '추가'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading && <p className="text-sm text-gray-500 mb-4 ml-1">로딩 중...</p>}
      {errorMsg && <p className="text-sm text-red-500 mb-4 ml-1">{errorMsg}</p>}

      {/* Stats & Filter */}
      <div className={styles.statsGrid}>
        <div className={styles.card}>
          <div className={styles.cardLabel}>전체 문서</div>
          <div className={styles.cardValue}>{documents.length}</div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardLabel}>명세서</div>
          <div className={`${styles.cardValue} ${styles.blue}`}>
            {documents.filter((d) => d.docType === 'spec').length}
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardLabel}>가이드</div>
          <div className={`${styles.cardValue} ${styles.green}`}>
            {documents.filter((d) => d.docType === 'guide').length}
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardLabel}>API 문서</div>
          <div className={`${styles.cardValue} ${styles.orange}`}>
            {documents.filter((d) => d.docType === 'api').length}
          </div>
        </div>

        <div className={styles.card}>
          <Label htmlFor="project-filter" className={`${styles.cardLabel} ${styles.filterLabel}`}>
            <Filter className="w-4 h-4" />
            프로젝트 필터
          </Label>

          <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
            <SelectTrigger id="project-filter" className={styles.filterSelect}>
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
      <div className={styles.docsGrid}>
        {documents.map((document) => (
          <div key={document.id} className={styles.docCard}>
            <div className={styles.docHeader}>
              <div style={{ flex: 1 }}>
                <div className={styles.docTitleRow}>
                  <FileText className="w-5 h-5 text-gray-600" />
                  <h3 className={styles.docTitle}>{document.title}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={getTypeBadgeClass(document.docType)}>
                    {getTypeLabel(document.docType)}
                  </Badge>
                </div>
              </div>

              <div className={styles.actions}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={styles.iconBtn}
                  onClick={() => openEditDialog(document)}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
                  onClick={() => handleDeleteDocument(document.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <p className={styles.desc}>{document.description}</p>

            <div className={styles.meta}>
              <div className={styles.metaRow}>
                <Tag className="w-4 h-4" />
                <span>{getProjectName(document.projectId)}</span>
              </div>

              <div className={styles.metaRow}>
                <FileIcon className="w-4 h-4" />
                <span className={styles.truncate}>{document.originalName}</span>
                <span className={styles.fileSize}>({formatFileSize(document.fileSize)})</span>
              </div>

              <div className={styles.metaRow}>
                <Calendar className="w-4 h-4" />
                <span>최종 수정: {new Date(document.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className={styles.footer}>
              <Button onClick={() => handleDownload(document)} size="sm" className={styles.downloadBtn}>
                <Download className="w-3 h-3 mr-2" />
                다운로드
              </Button>
            </div>
          </div>
        ))}
      </div>

      {documents.length === 0 && !loading && (
        <div className={styles.empty}>
          <p>문서가 없습니다. 새 문서를 추가해보세요!</p>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>문서 수정</DialogTitle>
          </DialogHeader>

          {editingDocument && (
            <div className={styles.dialogBody}>
              <div className={styles.field}>
                <Label htmlFor="edit-doc-title">문서 제목 *</Label>
                <Input
                  id="edit-doc-title"
                  placeholder="문서 제목을 입력하세요"
                  value={editingDocument.title}
                  onChange={(e) => setEditingDocument({ ...editingDocument, title: e.target.value })}
                />
              </div>

              <div className={styles.grid2}>
                <div className={styles.field}>
                  <Label htmlFor="edit-doc-project">프로젝트</Label>
                  <Select
                    value={String(editingDocument.projectId)}
                    disabled
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

                <div className={styles.field}>
                  <Label htmlFor="edit-doc-type">문서 유형</Label>
                  <Select
                    value={editingDocument.docType}
                    onValueChange={(value) => setEditingDocument({ ...editingDocument, docType: value as any })}
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

              <div className={styles.field}>
                <Label htmlFor="edit-doc-description">설명</Label>
                <Textarea
                  id="edit-doc-description"
                  placeholder="문서 설명을 입력하세요"
                  rows={3}
                  value={editingDocument.description}
                  onChange={(e) => setEditingDocument({ ...editingDocument, description: e.target.value })}
                />
              </div>
            </div>
          )}

          <div className={styles.dialogFooter}>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleEditDocument} className={styles.primaryBtn}>
              저장
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
