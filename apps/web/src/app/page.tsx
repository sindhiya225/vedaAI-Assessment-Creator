"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Plus, Search, SlidersHorizontal } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { AssignmentCard } from "@/components/AssignmentCard";
import { EmptyState } from "@/components/EmptyState";
import { useAssignments } from "@/lib/store";

export default function AssignmentsPage() {
  const { assignments, fetchAssignments, connectSocket, query, setQuery } = useAssignments();

  useEffect(() => {
    fetchAssignments();
    connectSocket();
  }, [fetchAssignments, connectSocket]);

  const filtered = assignments.filter((assignment) => assignment.title.toLowerCase().includes(query.toLowerCase()));

  return (
    <AppShell title="Assignment">
      <section className="page-heading">
        <span className="live-dot" />
        <div>
          <h1>Assignments</h1>
          <p>Manage and create assignments for your classes.</p>
        </div>
      </section>

      {assignments.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="filter-bar">
            <div className="filter-label">
              <SlidersHorizontal size={20} />
              <span>Filter By</span>
            </div>
            <label className="search-box">
              <Search size={22} />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search Assignment" />
            </label>
          </div>

          <div className="assignment-grid">
            {filtered.map((assignment) => (
              <AssignmentCard key={assignment.id} assignment={assignment} />
            ))}
          </div>
        </>
      )}

      <Link className="floating-create" href="/create" aria-label="Create Assignment">
        <Plus size={24} />
        <span>Create Assignment</span>
      </Link>
    </AppShell>
  );
}
