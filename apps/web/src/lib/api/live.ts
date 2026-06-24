import { apiClient } from './client'
import type { ApiResponse } from '@/types/api'

export interface LiveClass {
  id: string
  course_id: string
  title: string
  description: string | null
  room_name: string
  status: 'scheduled' | 'live' | 'ended'
  scheduled_at: string | null
  started_at: string | null
  ended_at: string | null
  recording_url: string | null
  teacher: { id: string; name: string; color: string }
  course?: { id: string; title: string }
}

export interface CreateLiveClassPayload {
  course_id: string
  title: string
  description?: string
  scheduled_at?: string
}

export interface LiveToken {
  token: string
  role: 'teacher' | 'student'
  server_url: string
  room_name: string
  title: string
}

export const fetchLiveClassesForCourse = async (courseId: string): Promise<LiveClass[]> => {
  const { data } = await apiClient.get<ApiResponse<LiveClass[]>>(
    `/api/v1/courses/${courseId}/live-classes`
  )
  return data.data
}

export const fetchTeacherLiveClasses = async (): Promise<LiveClass[]> => {
  const { data } = await apiClient.get<ApiResponse<LiveClass[]>>('/api/v1/teacher/live-classes')
  return data.data
}

export const fetchStudentLiveClasses = async (): Promise<LiveClass[]> => {
  const { data } = await apiClient.get<ApiResponse<LiveClass[]>>('/api/v1/student/live-classes')
  return data.data
}

export const createLiveClass = async (payload: CreateLiveClassPayload): Promise<LiveClass> => {
  const { data } = await apiClient.post<ApiResponse<LiveClass>>('/api/v1/live-classes', payload)
  return data.data
}

export const fetchLiveToken = async (classId: string): Promise<LiveToken> => {
  const { data } = await apiClient.post<ApiResponse<LiveToken>>(
    `/api/v1/live-classes/${classId}/token`
  )
  return data.data
}

export const startLiveClass = async (classId: string): Promise<LiveClass> => {
  const { data } = await apiClient.post<ApiResponse<LiveClass>>(
    `/api/v1/live-classes/${classId}/start`
  )
  return data.data
}

export const endLiveClass = async (classId: string): Promise<LiveClass> => {
  const { data } = await apiClient.post<ApiResponse<LiveClass>>(
    `/api/v1/live-classes/${classId}/end`
  )
  return data.data
}
