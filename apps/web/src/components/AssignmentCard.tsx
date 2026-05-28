"use client";

import Link from "next/link";
import { MoreVertical, Trash2 } from "lucide-react";
import type { Assignment } from "@vedaai/shared";
import { useAssignments } from "@/lib/store";

export function AssignmentCard({ assignment }: { assignment: Assignment }) {
  const deleteAssignment = useAssignments((state) => state.deleteAssignment);

  return (
    <article className="assignment-card">
      <div className="card-menu">
        <MoreVertical size={22} />
        <div>
          <Link href={`/assignments/${assignment.id}`}>View Assignment</Link>
          <button onClick={() => deleteAssignment(assignment.id)}>
            <Trash2 size={15} /> Delete
          </button>
        </div>
      </div>
      <Link href={`/assignments/${assignment.id}`}>
        <h2>{assignment.title}</h2>
      </Link>
      <p className={`status ${assignment.status}`}>{assignment.status}</p>
      <footer>
        <span><strong>Assigned on :</strong> {formatDate(assignment.assignedOn)}</span>
        <span><strong>Due :</strong> {formatDate(assignment.dueDate)}</span>
      </footer>
    </article>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB").replaceAll("/", "-");
}
