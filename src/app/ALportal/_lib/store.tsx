"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { QAPost, QAReply, Role, ScheduledSession, Tutor, TutoringRequest } from "./types";
import { QA_POSTS, REQUESTS, SCHEDULED_SESSIONS, TUTORS } from "./seed-data";

export type JoinSessionResult = "joined" | "full" | "already-joined";

interface AppContextValue {
  role: Role;
  setRole: (r: Role) => void;
  tutors: Tutor[];
  requests: TutoringRequest[];
  qaPosts: QAPost[];
  sessions: ScheduledSession[];
  assignTutor: (requestId: string, tutorId: string) => void;
  markCompleted: (requestId: string) => void;
  addRequest: (req: Omit<TutoringRequest, "id" | "createdAt" | "status">) => void;
  addQAPost: (post: Omit<QAPost, "id" | "createdAt" | "replies" | "resolved">) => void;
  addReply: (postId: string, reply: Omit<QAReply, "id" | "createdAt">) => void;
  toggleResolved: (postId: string) => void;
  simulateSync: () => number;
  approveSubject: (tutorId: string, subject: string) => void;
  revokeSubjectApproval: (tutorId: string, subject: string) => void;
  scheduleSession: (session: Omit<ScheduledSession, "id" | "createdAt" | "joinedStudents">) => void;
  joinSession: (sessionId: string, studentName: string) => JoinSessionResult;
  cancelSession: (sessionId: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

const NEW_SYNC_REQUESTS: Omit<TutoringRequest, "id" | "createdAt">[] = [
  {
    requesterName: "Ella Simmons",
    requesterType: "Student",
    subject: "AP Calculus AB",
    period: "Access Period",
    source: "Infinite Campus",
    notes: "Derivatives of inverse trig functions.",
    status: "open",
  },
  {
    requesterName: "Mr. Osei (English)",
    requesterType: "Teacher",
    subject: "English 10",
    period: "B-Period (Commons)",
    source: "Teacher Google Form",
    notes: "In-class peer editing support, 3 students requested.",
    status: "open",
  },
  {
    requesterName: "Ravi Subramaniam",
    requesterType: "Student",
    subject: "AP Chemistry",
    period: "Lunch (Commons)",
    source: "Infinite Campus",
    notes: "Thermochemistry, Hess's Law practice.",
    status: "open",
  },
];

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role>("coordinator");
  const [tutors, setTutors] = useState<Tutor[]>(TUTORS);
  const [requests, setRequests] = useState<TutoringRequest[]>(REQUESTS);
  const [qaPosts, setQaPosts] = useState<QAPost[]>(QA_POSTS);
  const [sessions, setSessions] = useState<ScheduledSession[]>(SCHEDULED_SESSIONS);
  const [syncPointer, setSyncPointer] = useState(0);

  const assignTutor = useCallback((requestId: string, tutorId: string) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === requestId ? { ...r, status: "assigned", assignedTutorId: tutorId } : r
      )
    );
  }, []);

  const markCompleted = useCallback((requestId: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: "completed" } : r))
    );
  }, []);

  const addRequest = useCallback(
    (req: Omit<TutoringRequest, "id" | "createdAt" | "status">) => {
      setRequests((prev) => [
        { ...req, id: `r-${Date.now()}`, createdAt: new Date().toISOString(), status: "open" },
        ...prev,
      ]);
    },
    []
  );

  const addQAPost = useCallback(
    (post: Omit<QAPost, "id" | "createdAt" | "replies" | "resolved">) => {
      setQaPosts((prev) => [
        { ...post, id: `q-${Date.now()}`, createdAt: new Date().toISOString(), replies: [], resolved: false },
        ...prev,
      ]);
    },
    []
  );

  const addReply = useCallback((postId: string, reply: Omit<QAReply, "id" | "createdAt">) => {
    setQaPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              replies: [
                ...p.replies,
                { ...reply, id: `${postId}-${Date.now()}`, createdAt: new Date().toISOString() },
              ],
            }
          : p
      )
    );
  }, []);

  const toggleResolved = useCallback((postId: string) => {
    setQaPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, resolved: !p.resolved } : p)));
  }, []);

  const simulateSync = useCallback(() => {
    if (syncPointer >= NEW_SYNC_REQUESTS.length) return 0;
    const batch = NEW_SYNC_REQUESTS.slice(syncPointer, syncPointer + 2);
    if (batch.length === 0) return 0;
    setRequests((prev) => [
      ...batch.map((b, i) => ({
        ...b,
        id: `r-sync-${syncPointer + i}-${Date.now()}`,
        createdAt: new Date().toISOString(),
      })),
      ...prev,
    ]);
    setSyncPointer((p) => p + batch.length);
    return batch.length;
  }, [syncPointer]);

  const approveSubject = useCallback((tutorId: string, subject: string) => {
    setTutors((prev) =>
      prev.map((t) =>
        t.id === tutorId && !t.approvedSubjects.includes(subject)
          ? { ...t, approvedSubjects: [...t.approvedSubjects, subject] }
          : t
      )
    );
  }, []);

  const revokeSubjectApproval = useCallback((tutorId: string, subject: string) => {
    setTutors((prev) =>
      prev.map((t) =>
        t.id === tutorId ? { ...t, approvedSubjects: t.approvedSubjects.filter((s) => s !== subject) } : t
      )
    );
  }, []);

  const scheduleSession = useCallback(
    (session: Omit<ScheduledSession, "id" | "createdAt" | "joinedStudents">) => {
      setSessions((prev) => [
        { ...session, id: `s-${Date.now()}`, createdAt: new Date().toISOString(), joinedStudents: [] },
        ...prev,
      ]);
    },
    []
  );

  const joinSession = useCallback(
    (sessionId: string, studentName: string): JoinSessionResult => {
      const session = sessions.find((s) => s.id === sessionId);
      if (!session) return "full";
      if (session.joinedStudents.includes(studentName)) return "already-joined";
      if (session.joinedStudents.length >= session.capacity) return "full";
      setSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId ? { ...s, joinedStudents: [...s.joinedStudents, studentName] } : s
        )
      );
      return "joined";
    },
    [sessions]
  );

  const cancelSession = useCallback((sessionId: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      role,
      setRole,
      tutors,
      requests,
      qaPosts,
      sessions,
      assignTutor,
      markCompleted,
      addRequest,
      addQAPost,
      addReply,
      toggleResolved,
      simulateSync,
      approveSubject,
      revokeSubjectApproval,
      scheduleSession,
      joinSession,
      cancelSession,
    }),
    [
      role,
      tutors,
      requests,
      qaPosts,
      sessions,
      assignTutor,
      markCompleted,
      addRequest,
      addQAPost,
      addReply,
      toggleResolved,
      simulateSync,
      approveSubject,
      revokeSubjectApproval,
      scheduleSession,
      joinSession,
      cancelSession,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppData must be used within AppDataProvider");
  return ctx;
}
