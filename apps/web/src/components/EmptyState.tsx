import Link from "next/link";
import { Plus, Sparkles } from "lucide-react";

export function EmptyState() {
  return (
    <section className="empty-state">
      <div className="empty-illustration" aria-hidden="true">
        <span className="paper-line dark" />
        <span className="paper-line" />
        <span className="paper-line" />
        <span className="paper-line" />
        <b>×</b>
      </div>
      <h1>No assignments yet</h1>
      <p>Create your first assignment to start collecting and grading student submissions. You can set up rubrics, define marking criteria, and let AI assist with grading.</p>
      <Link className="primary-action" href="/create">
        <Plus size={22} /> Create Your First Assignment
      </Link>
      <span className="tiny-spark"><Sparkles size={26} /></span>
    </section>
  );
}
