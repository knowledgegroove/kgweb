export type Period =
  | "Access Period"
  | "B-Period (Commons)"
  | "Lunch (Commons)"
  | "After School";

export type RequestSource = "Infinite Campus" | "Teacher Google Form" | "Portal";

export type RequestStatus = "open" | "assigned" | "completed";

export interface Tutor {
  id: string;
  name: string;
  grade: 10 | 11 | 12;
  subjects: string[];
  /** Subset of `subjects` the coordinator has vetted this tutor to hold sessions for. */
  approvedSubjects: string[];
  periods: Period[];
  bio: string;
  sessionsThisMonth: number;
  hoursThisMonth: number;
  rating: number; // out of 5
  active: boolean;
}

export interface TutoringRequest {
  id: string;
  requesterName: string;
  requesterType: "Student" | "Teacher";
  subject: string;
  period: Period;
  source: RequestSource;
  notes: string;
  status: RequestStatus;
  assignedTutorId?: string;
  createdAt: string; // ISO date
}

export interface QAReply {
  id: string;
  authorName: string;
  authorType: "Tutor" | "Coordinator";
  text: string;
  createdAt: string;
}

export interface QAPost {
  id: string;
  subject: string;
  authorName: string;
  question: string;
  createdAt: string;
  replies: QAReply[];
  resolved: boolean;
}

export interface ScheduledSession {
  id: string;
  tutorId: string;
  subject: string;
  period: Period;
  date: string; // ISO date, day only (e.g. "2026-09-16")
  location: string;
  capacity: number;
  joinedStudents: string[];
  notes?: string;
  createdAt: string;
}

export type Role = "coordinator" | "tutor" | "student";
