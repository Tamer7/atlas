export const API_ROUTES = {
  auth: {
    login: '/api/v1/auth/login',
    register: '/api/v1/auth/register',
    logout: '/api/v1/auth/logout',
    me: '/api/v1/auth/me',
    magicLink: '/api/v1/auth/magic-link',
    magicLinkVerify: '/api/v1/auth/magic-link/verify',
  },
  courses: {
    list: '/api/v1/courses',
    detail: (id: string) => `/api/v1/courses/${id}`,
    create: '/api/v1/courses',
    update: (id: string) => `/api/v1/courses/${id}`,
  },
  teacher: {
    students: '/api/v1/teacher/students',
    invite: '/api/v1/teacher/students/invite',
    courseStudents: (courseId: string) => `/api/v1/teacher/courses/${courseId}/students`,
    addStudent: (courseId: string) => `/api/v1/teacher/courses/${courseId}/students`,
  },
  invitations: {
    accept: '/api/v1/invitations/accept',
  },
} as const;
