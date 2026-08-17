import { Routes } from '@angular/router';
import { Login } from './login/login';
import { AdminLayoutComponent } from './admin/layout/admin-layout/admin-layout';
import { Dashboard } from './admin/dashboard/dashboard';
import { Courses } from './admin/courses/courses';
import { Grades } from './admin/grades/grades';
import { Sections } from './admin/sections/sections';
import { Years } from './admin/years/years';
import { TimeSlots } from './admin/time-slots/time-slots';
import { AcademicStaff } from './admin/academic-staff/academic-staff';
import { Registrations } from './admin/registrations/registrations';
import { SchoolDays } from './admin/school-days/school-days';
import { TeachingBlocks } from './admin/teaching-blocks/teaching-blocks';
import { Weightings } from './admin/weightings/weightings';
import { Schedules } from './admin/schedules/schedules';
import { TeacherGroups } from './admin/teacher-groups/teacher-groups';
import { ParentsLayout } from './parents/layout/parents-layout/parents-layout';
import { ParentsDashboard } from './parents/dashboard/dashboard';
import { TeachersDashboard } from './teachers/dashboard/dashboard';
import { authGuard, loginGuard } from '../core/auth/auth.guard';
import { TeachersLayout } from './teachers/layout/teachers-layout/teachers-layout';
import { AcademicRecord } from './teachers/academic-records/academic-records';
import { TeachingBlockCourseAverage } from './teachers/teaching-block-course-average/teaching-block-course-average';
import { GeneralAverage } from './teachers/general-average/general-average';
import { CourseAverage } from './teachers/course-average/course-average';
import { StudentAcademicRecord } from './parents/student-academic-record/student-academic-record';
import { AcademicPerformance } from './admin/academic-performance/academic-performance';
import { Profile } from './admin/profile/profile';
import { AdsReceived } from './parents/ads-received/ads-received';
import { AdsSent } from './teachers/ads-sent/ads-sent';
import { TeacherProfile } from './teachers/teacher-profile/teacher-profile';
import { ParentProfile } from './parents/parent-profile/parent-profile';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login, canActivate: [loginGuard] },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [authGuard],
    data: { roles: ['Administrador'] },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: Dashboard },
      {
        path: 'courses',
        component: Courses
      },
      {
        path: 'grades',
        component: Grades
      },
      {
        path: 'sections',
        component: Sections
      },
      {
        path: 'years',
        component: Years
      },
      {
        path: 'teaching-blocks',
        component: TeachingBlocks
      },
      {
        path: 'school-days',
        component: SchoolDays
      },
      {
        path: 'time-slots',
        component: TimeSlots
      },
      {
        path: 'weightings',
        component: Weightings
      },
      {
        path: 'academic-staff',
        component: AcademicStaff
      },
      {
        path: 'registrations',
        component: Registrations
      },
      {
        path: 'schedules',
        component: Schedules
      },
      {
        path: 'teacher-groups',
        component: TeacherGroups
      },
      {
        path: 'academic-performance',
        component: AcademicPerformance
      },
      {
        path: 'profile',
        component: Profile
      }
    ],
  },
  {
    path: 'parent',
    component: ParentsLayout,
    canActivate: [authGuard],
    data: { roles: ['Apoderado'] },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: ParentsDashboard },
      { path: 'student-academic-record', component: StudentAcademicRecord },
      { path: 'ads-received', component: AdsReceived },
      { path: 'parent-profile', component: ParentProfile }
    ],
  },
  {
    path: 'teacher',
    component: TeachersLayout,
    canActivate: [authGuard],
    data: { roles: ['Docente'] },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: TeachersDashboard },
      { path: 'academic-records', component: AcademicRecord },
      { path: 'teaching-block-course-average', component: TeachingBlockCourseAverage },
      { path: 'course-average', component: CourseAverage },
      { path: 'general-average', component: GeneralAverage },
      { path: 'ads-sent', component: AdsSent },
      { path: 'teacher-profile', component: TeacherProfile },
    ],
  },
];