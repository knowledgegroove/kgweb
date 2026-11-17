export type Role = "coordinator" | "tutor" | "student";

export interface Viewer {
  id: string;
  email: string | null;
  name: string;
  isGuest: boolean;
  /** null = signed in but hasn't finished account setup yet. */
  role: Role | null;
}

export type SubjectStatus = "pending" | "approved";

export interface TutorSubject {
  subject: string;
  status: SubjectStatus;
}

export interface SessionSignup {
  studentId: string;
  name: string;
  email: string;
  joinedAt: string;
}

export interface PortalSession {
  id: string;
  tutorId: string;
  tutorName: string;
  subject: string;
  startsAt: string; // ISO
  durationMin: number;
  capacity: number;
  /** Only sent to the tutor, the coordinator, and students who joined. */
  meetLink: string | null;
  notes: string | null;
  cancelled: boolean;
  signupCount: number;
  /** Student view: whether the viewer has joined. */
  joined?: boolean;
  /** Tutor/coordinator view: who signed up. */
  signups?: SessionSignup[];
}

export interface TutorInfo {
  id: string;
  name: string;
  email: string | null;
  subjects: TutorSubject[];
  joinedAt: string;
}

export type PortalData =
  | { viewer: Viewer & { role: null }; canRegisterAsTutor: boolean }
  | { viewer: Viewer & { role: "student" }; sessions: PortalSession[] }
  | { viewer: Viewer & { role: "tutor" }; subjects: TutorSubject[]; sessions: PortalSession[] }
  | {
      viewer: Viewer & { role: "coordinator" };
      tutors: TutorInfo[];
      sessions: PortalSession[];
      studentCount: number;
    };

export type ActionResult<T = object> = ({ ok: true } & T) | { ok: false; error: string };

export const ROLE_HOME: Record<Role, string> = {
  coordinator: "/ALportal/coordinator",
  tutor: "/ALportal/tutor",
  student: "/ALportal/student",
};
