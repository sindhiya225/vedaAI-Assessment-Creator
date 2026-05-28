"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Download, RefreshCcw } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { DifficultyBadge } from "@/components/DifficultyBadge";
import { useAssignments } from "@/lib/store";

export function OutputClient({ id }: { id: string }) {
  const { current, fetchAssignment, connectSocket, regenerate } = useAssignments();

  useEffect(() => {
    fetchAssignment(id);
    connectSocket();
  }, [id, fetchAssignment, connectSocket]);

  const paper = current?.result;

  return (
    <AppShell title="Create New">
      {!current ? (
        <section className="paper-shell">Loading assignment...</section>
      ) : (
        <>
          <section className="result-actionbar">
            <p>
              Certainly, Lakshya! Here are customized Question Paper for your {current.subject} class on the selected chapters:
            </p>
            <div>
              <button onClick={() => regenerate(current.id)}>
                <RefreshCcw size={18} /> Regenerate
              </button>
              <a href={`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/assignments/${current.id}/pdf`}>
                <Download size={18} /> Download as PDF
              </a>
            </div>
          </section>

          {!paper ? (
            <section className="paper-shell loading-paper">
              <h2>{current.status === "failed" ? "Generation failed" : "Generating your question paper..."}</h2>
              <p>{current.error ?? "The AI worker is creating sections, questions, marks, and answer key."}</p>
              <Link href="/">Back to Assignments</Link>
            </section>
          ) : (
            <article className="paper-shell">
              <header className="paper-header">
                <h1>{paper.schoolName}</h1>
                <p>Subject: {paper.subject}</p>
                <p>Class: {paper.className}</p>
              </header>
              <div className="paper-meta">
                <span>Time Allowed: {paper.timeAllowedMinutes} minutes</span>
                <span>Maximum Marks: {paper.maximumMarks}</span>
              </div>
              <p className="compulsory">All questions are compulsory unless stated otherwise.</p>
              <div className="student-info">
                <span>Name: <b /></span>
                <span>Roll Number: <b /></span>
                <span>Section: <b /></span>
              </div>

              {paper.sections.map((section) => (
                <section className="question-section" key={section.id}>
                  <h2>{section.title}</h2>
                  <h3>{section.type}</h3>
                  <p>{section.instruction}</p>
                  <ol>
                    {section.questions.map((question) => (
                      <li key={question.id}>
                        <div className="question-line">
                          <DifficultyBadge difficulty={question.difficulty} />
                          <span>{question.text}</span>
                        </div>
                        <strong>[{question.marks} Marks]</strong>
                      </li>
                    ))}
                  </ol>
                </section>
              ))}

              <strong className="paper-end">End of Question Paper</strong>
              <section className="answer-key">
                <h2>Answer Key:</h2>
                <ol>
                  {paper.sections.flatMap((section) => section.questions).map((question, index) => (
                    <li key={question.id}>
                      <span>Answer {index + 1}:</span> {question.answer}
                    </li>
                  ))}
                </ol>
              </section>
            </article>
          )}
        </>
      )}
    </AppShell>
  );
}
