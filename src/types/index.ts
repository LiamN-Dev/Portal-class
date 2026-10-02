export type UserRole = 'admin' | 'student';
export type UserStatus = 'approved' | 'pending' | 'suspended';

export interface User {
  id: string;
  name: string;
  username: string;
  role: UserRole;
  status: UserStatus;
  enrolledCourseIds: string[];
  email?: string;
  temporaryPassword?: string;
  joinedAt: string;
  lastLogin?: string;
  requestedCourses?: string[];
  notes?: string;
}

export type ResourceType = 'doc' | 'pdf' | 'quizlet' | 'slides' | 'video' | 'sheets' | 'notion' | 'code' | 'link';
export type ResourceCategory = 'completed_hw' | 'study_guide' | 'lecture_notes' | 'lab_report' | 'practice_exam' | 'formula_sheet';
export type VisibilityScope = 'all_enrolled' | 'restricted_students' | 'admin_only';

export interface Course {
  id: string;
  name: string;
  code: string;
  period: string;
  teacher: string;
  color: 'emerald' | 'indigo' | 'amber' | 'rose' | 'cyan' | 'purple';
  accentHex: string;
  icon: string;
  room: string;
  description: string;
  nextDueDate?: string;
  nextDueTitle?: string;
  urgencyType?: 'exam' | 'assignment' | 'lab' | 'project';
  isArchived?: boolean;
}

export interface Unit {
  id: string;
  courseId: string;
  unitNumber: number;
  title: string;
  description: string;
  status: 'unlocked' | 'locked' | 'restricted';
  unlockAt?: string;
  isActiveSpotlight?: boolean;
  order: number;
}

export interface ResourceItem {
  id: string;
  courseId: string;
  unitId: string;
  title: string;
  description: string;
  url: string;
  type: ResourceType;
  category: ResourceCategory;
  visibilityScope: VisibilityScope;
  allowedStudentIds?: string[];
  scheduledUnlockAt?: string;
  autoLockAt?: string;
  isCompletedHw: boolean;
  createdAt: string;
  submittedBy?: string;
  viewCount: number;
  tags: string[];
  previewSnippet?: string;
}

export interface UnlockRequest {
  id: string;
  resourceId: string;
  resourceTitle: string;
  courseId: string;
  courseName: string;
  userId: string;
  userName: string;
  username: string;
  reason: string;
  requestedAt: string;
  status: 'pending' | 'approved_permanent' | 'approved_temporary' | 'denied';
  temporaryExpiresAt?: string;
  adminNote?: string;
}

export interface StudentSubmission {
  id: string;
  courseId: string;
  unitId: string;
  studentId: string;
  studentName: string;
  title: string;
  url: string;
  type: ResourceType;
  category: ResourceCategory;
  notes: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface NoteRequest {
  id: string;
  courseId: string;
  userId: string;
  userName: string;
  topic: string;
  dateNeeded: string;
  details: string;
  createdAt: string;
  status: 'open' | 'fulfilled';
  fulfilledBy?: string;
  fulfilledUrl?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  modelUsed?: string;
  thinkingContent?: string;
  imageUrl?: string;
  courseContext?: string;
}
