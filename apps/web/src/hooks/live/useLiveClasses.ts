import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchLiveClassesForCourse,
  createLiveClass,
  startLiveClass,
  endLiveClass,
  type CreateLiveClassPayload,
} from '@/lib/api/live'

export const liveKeys = {
  forCourse: (courseId: string) => ['live-classes', 'course', courseId] as const,
}

export function useLiveClassesForCourse(courseId: string) {
  return useQuery({
    queryKey: liveKeys.forCourse(courseId),
    queryFn: () => fetchLiveClassesForCourse(courseId),
    enabled: !!courseId,
  })
}

export function useCreateLiveClass(courseId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateLiveClassPayload) => createLiveClass(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: liveKeys.forCourse(courseId) }),
  })
}

export function useStartLiveClass(courseId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (classId: string) => startLiveClass(classId),
    onSuccess: () => qc.invalidateQueries({ queryKey: liveKeys.forCourse(courseId) }),
  })
}

export function useEndLiveClass(courseId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (classId: string) => endLiveClass(classId),
    onSuccess: () => qc.invalidateQueries({ queryKey: liveKeys.forCourse(courseId) }),
  })
}
