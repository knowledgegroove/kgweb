"use client";

import { useMemo, useState } from "react";
import { useAppData } from "../_lib/store";
import { Avatar, Card, EmptyState, PageHeader, SubjectPill } from "../_components/ui";
import { SUBJECTS } from "../_lib/seed-data";

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function QABoardPage() {
  const { role, qaPosts, addQAPost, addReply, toggleResolved } = useAppData();
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [onlyUnanswered, setOnlyUnanswered] = useState(false);
  const [showAsk, setShowAsk] = useState(false);

  const [askSubject, setAskSubject] = useState(SUBJECTS[0]);
  const [askName, setAskName] = useState("");
  const [askQuestion, setAskQuestion] = useState("");

  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [replyName, setReplyName] = useState("Ananya Krishnan");

  const filtered = useMemo(() => {
    return qaPosts
      .filter((p) => subjectFilter === "all" || p.subject === subjectFilter)
      .filter((p) => !onlyUnanswered || p.replies.length === 0)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [qaPosts, subjectFilter, onlyUnanswered]);

  const submitQuestion = () => {
    if (!askQuestion.trim() || !askName.trim()) return;
    addQAPost({ subject: askSubject, authorName: askName.trim(), question: askQuestion.trim() });
    setAskQuestion("");
    setShowAsk(false);
  };

  const submitReply = (postId: string) => {
    const text = replyDrafts[postId]?.trim();
    if (!text || !replyName.trim()) return;
    addReply(postId, {
      authorName: replyName.trim(),
      authorType: role === "coordinator" ? "Coordinator" : "Tutor",
      text,
    });
    setReplyDrafts((prev) => ({ ...prev, [postId]: "" }));
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        title="Async Q&A Board"
        description="Follow-up questions between sessions — a lightweight alternative to waiting for the next Access period."
        action={
          (role === "student" || role === "coordinator") && (
            <button
              onClick={() => setShowAsk((s) => !s)}
              className="rounded-lg bg-alp-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-alp-brand-700 cursor-pointer"
            >
              {showAsk ? "Cancel" : "Ask a question"}
            </button>
          )
        }
      />

      {showAsk && (
        <Card className="mb-6 p-4">
          <h3 className="text-sm font-semibold text-slate-900">New question</h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Your name</label>
              <input
                value={askName}
                onChange={(e) => setAskName(e.target.value)}
                placeholder="e.g. Sam Patterson"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-alp-brand-400 focus:outline-none focus:ring-2 focus:ring-alp-brand-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Subject</label>
              <select
                value={askSubject}
                onChange={(e) => setAskSubject(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-alp-brand-400 focus:outline-none focus:ring-2 focus:ring-alp-brand-100"
              >
                {SUBJECTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-3">
            <label className="mb-1 block text-xs font-medium text-slate-500">Question</label>
            <textarea
              value={askQuestion}
              onChange={(e) => setAskQuestion(e.target.value)}
              rows={3}
              placeholder="What are you stuck on?"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-alp-brand-400 focus:outline-none focus:ring-2 focus:ring-alp-brand-100"
            />
          </div>
          <div className="mt-3 flex justify-end">
            <button
              onClick={submitQuestion}
              className="rounded-lg bg-alp-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-alp-brand-700 cursor-pointer"
            >
              Post question
            </button>
          </div>
        </Card>
      )}

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <select
          value={subjectFilter}
          onChange={(e) => setSubjectFilter(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-alp-brand-400 focus:outline-none focus:ring-2 focus:ring-alp-brand-100"
        >
          <option value="all">All subjects</option>
          {SUBJECTS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-1.5 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={onlyUnanswered}
            onChange={(e) => setOnlyUnanswered(e.target.checked)}
            className="rounded border-slate-300"
          />
          Unanswered only
        </label>
        {role === "tutor" && (
          <div className="ml-auto flex items-center gap-1.5 text-sm text-slate-500">
            Replying as
            <input
              value={replyName}
              onChange={(e) => setReplyName(e.target.value)}
              className="w-40 rounded-lg border border-slate-200 px-2 py-1 text-sm focus:border-alp-brand-400 focus:outline-none focus:ring-2 focus:ring-alp-brand-100"
            />
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No questions here yet" description="Try a different subject filter." />
      ) : (
        <div className="space-y-4">
          {filtered.map((post) => (
            <Card key={post.id} className="p-4">
              <div className="flex items-start gap-3">
                <Avatar name={post.authorName} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-slate-900">{post.authorName}</p>
                    <SubjectPill subject={post.subject} />
                    <span className="text-xs text-slate-400">{timeAgo(post.createdAt)}</span>
                    {post.replies.length === 0 && (
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-200">
                        Awaiting reply
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 text-sm text-slate-700">{post.question}</p>
                </div>
              </div>

              {post.replies.length > 0 && (
                <div className="mt-3 space-y-3 border-t border-slate-100 pl-11 pt-3">
                  {post.replies.map((reply) => (
                    <div key={reply.id} className="flex items-start gap-3">
                      <Avatar name={reply.authorName} size="sm" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-slate-800">{reply.authorName}</p>
                          <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
                            {reply.authorType}
                          </span>
                          <span className="text-xs text-slate-400">{timeAgo(reply.createdAt)}</span>
                        </div>
                        <p className="mt-0.5 text-sm text-slate-600">{reply.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {(role === "tutor" || role === "coordinator") && (
                <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-3 pl-11">
                  <input
                    value={replyDrafts[post.id] ?? ""}
                    onChange={(e) => setReplyDrafts((prev) => ({ ...prev, [post.id]: e.target.value }))}
                    placeholder="Write a reply…"
                    className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm focus:border-alp-brand-400 focus:outline-none focus:ring-2 focus:ring-alp-brand-100"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") submitReply(post.id);
                    }}
                  />
                  <button
                    onClick={() => submitReply(post.id)}
                    className="shrink-0 rounded-lg bg-alp-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-alp-brand-700 cursor-pointer"
                  >
                    Reply
                  </button>
                  <button
                    onClick={() => toggleResolved(post.id)}
                    className={`shrink-0 rounded-lg border px-2.5 py-1.5 text-xs font-medium cursor-pointer ${
                      post.resolved
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    {post.resolved ? "Resolved" : "Mark resolved"}
                  </button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
