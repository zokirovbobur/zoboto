import type { Project, User, Department, Task, ProjectUpdate, WorkloadRecord, ActivityLog } from '@prisma/client'

// Re-export Prisma types for convenience
export type { Project, User, Department, Task, ProjectUpdate, WorkloadRecord, ActivityLog }
export type { ProjectStatus, TaskStatus, Priority, RiskLevel, Role } from '@prisma/client'

// Extended types with relations
export type ProjectWithRelations = Project & {
  manager: User | null
  department: Department | null
  _count: { tasks: number; teamMembers: number; updates: number }
}

export type ProjectDetail = Project & {
  manager: User | null
  department: Department | null
  teamMembers: Array<{ user: User }>
  tasks: Task[]
  updates: Array<ProjectUpdate & { author: User | null }>
  workloadItems: Array<WorkloadRecord & { user: User }>
}

export type UserWithLoad = User & {
  department: Department | null
  managedProjects: Pick<Project, 'id' | 'name' | 'status'>[]
  workloadRecords: Array<WorkloadRecord & { project: Pick<Project, 'id' | 'name' | 'status' | 'product'> }>
  _count: { managedProjects: number; teamMemberships: number }
}

// Dashboard summary shape
export interface DashboardSummary {
  total: number
  completed: number
  inProgress: number
  planned: number
  paused: number
  overdue: number
  demoReady: number
  highRisk: number
  totalEmployees: number
  departments: number
}

// API response wrapper
export interface ApiResponse<T> {
  data: T
  error?: string
}
