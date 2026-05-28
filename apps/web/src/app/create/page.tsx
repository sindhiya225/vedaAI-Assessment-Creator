"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, CalendarDays, Minus, Plus, UploadCloud, X } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useAssignments } from "@/lib/store";
import type { QuestionPlan, QuestionType } from "@vedaai/shared";

const types: QuestionType[] = [
  "Multiple Choice Questions",
  "Short Answer Questions",
  "Long Answer Questions",
  "Case Study Questions",
  "True or False"
];

export default function CreateAssignmentPage() {
  const router = useRouter();
  const createAssignment = useAssignments((state) => state.createAssignment);
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    title: "Quiz on Electricity",
    schoolName: "Delhi Public School, Sector-4, Bokaro",
    subject: "Science",
    className: "8th",
    dueDate: "",
    timeAllowedMinutes: 45,
    instructions: "Create CBSE-style questions from NCERT chapters. Keep wording clear and student friendly.",
    sourceText: "Electric current, electrolysis, conductors, electroplating, copper sulphate solution, cathode and anode reactions."
  });
  const [plans, setPlans] = useState<QuestionPlan[]>([
    { type: "Short Answer Questions", count: 10, marks: 2 },
    { type: "Multiple Choice Questions", count: 5, marks: 1 }
  ]);

  const maxMarks = useMemo(() => plans.reduce((sum, plan) => sum + plan.count * plan.marks, 0), [plans]);

  function validate() {
    const next: Record<string, string> = {};
    if (form.title.trim().length < 3) next.title = "Assignment title is required.";
    if (!form.schoolName.trim()) next.schoolName = "School name is required.";
    if (!form.subject.trim()) next.subject = "Subject is required.";
    if (!form.className.trim()) next.className = "Class is required.";
    if (!form.dueDate) next.dueDate = "Due date is required.";
    if (form.dueDate && new Date(form.dueDate) < new Date(new Date().toDateString())) next.dueDate = "Due date cannot be in the past.";
    if (form.timeAllowedMinutes < 10) next.timeAllowedMinutes = "Minimum time is 10 minutes.";
    if (!plans.length) next.plans = "Add at least one question type.";
    plans.forEach((plan, index) => {
      if (plan.count < 1 || plan.marks < 1) next[`plan-${index}`] = "Questions and marks must be positive.";
    });
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function submit() {
    if (!validate()) return;
    const assignment = await createAssignment({ ...form, plans, uploadedFileName: file?.name }, file);
    router.push(`/assignments/${assignment.id}`);
  }

  return (
    <AppShell title="Assignment">
      <section className="page-heading compact">
        <span className="live-dot" />
        <div>
          <h1>Create Assignment</h1>
          <p>Set up a new assignment for your students</p>
        </div>
      </section>

      <div className="stepper" aria-label="Assignment creation progress">
        <span className={step >= 1 ? "active" : ""} />
        <span className={step >= 2 ? "active" : ""} />
      </div>

      <section className="creator-card">
        <div className="card-title">
          <h2>{step === 1 ? "Assignment Details" : "Question Blueprint"}</h2>
          <p>{step === 1 ? "Basic information about your assignment" : "Tell AI what kind of paper to generate"}</p>
        </div>

        {step === 1 ? (
          <div className="form-stack">
            <label className="upload-zone">
              <input type="file" accept=".pdf,.txt,.png,.jpg,.jpeg" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
              <UploadCloud size={34} />
              <strong>{file ? file.name : "Choose a file or drag & drop it here"}</strong>
              <span>PDF, TXT, JPEG, PNG, up to 10MB</span>
              <b>Browse Files</b>
            </label>
            <p className="helper-text">Upload images or documents of your preferred material</p>

            <div className="two-col">
              <Field label="Assignment Title" error={errors.title}>
                <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
              </Field>
              <Field label="Due Date" error={errors.dueDate}>
                <div className="input-icon">
                  <input type="date" value={form.dueDate} onChange={(event) => setForm({ ...form, dueDate: event.target.value })} />
                  <CalendarDays size={20} />
                </div>
              </Field>
            </div>

            <div className="three-col">
              <Field label="School" error={errors.schoolName}>
                <input value={form.schoolName} onChange={(event) => setForm({ ...form, schoolName: event.target.value })} />
              </Field>
              <Field label="Subject" error={errors.subject}>
                <input value={form.subject} onChange={(event) => setForm({ ...form, subject: event.target.value })} />
              </Field>
              <Field label="Class" error={errors.className}>
                <input value={form.className} onChange={(event) => setForm({ ...form, className: event.target.value })} />
              </Field>
            </div>
          </div>
        ) : (
          <div className="form-stack">
            <div className="question-header">
              <span>Question Type</span>
              <span>No. of Questions</span>
              <span>Marks</span>
            </div>
            {plans.map((plan, index) => (
              <div className="question-row" key={`${plan.type}-${index}`}>
                <select value={plan.type} onChange={(event) => updatePlan(index, { type: event.target.value as QuestionType })}>
                  {types.map((type) => (
                    <option key={type}>{type}</option>
                  ))}
                </select>
                <Stepper value={plan.count} onChange={(count) => updatePlan(index, { count })} />
                <Stepper value={plan.marks} onChange={(marks) => updatePlan(index, { marks })} />
                <button className="icon-only" onClick={() => setPlans(plans.filter((_, planIndex) => planIndex !== index))} aria-label="Remove question type">
                  <X size={18} />
                </button>
                {errors[`plan-${index}`] ? <small>{errors[`plan-${index}`]}</small> : null}
              </div>
            ))}
            <button className="subtle-button" onClick={() => setPlans([...plans, { type: "Short Answer Questions", count: 3, marks: 2 }])}>
              <Plus size={18} /> Add Question Type
            </button>
            {errors.plans ? <p className="error-text">{errors.plans}</p> : null}

            <div className="two-col">
              <Field label="Time Allowed (minutes)" error={errors.timeAllowedMinutes}>
                <input
                  type="number"
                  min={10}
                  value={form.timeAllowedMinutes}
                  onChange={(event) => setForm({ ...form, timeAllowedMinutes: Number(event.target.value) })}
                />
              </Field>
              <div className="marks-preview">
                <span>Maximum Marks</span>
                <strong>{maxMarks}</strong>
              </div>
            </div>

            <Field label="Additional Instructions">
              <textarea value={form.instructions} onChange={(event) => setForm({ ...form, instructions: event.target.value })} rows={4} />
            </Field>
            <Field label="Source Text">
              <textarea value={form.sourceText} onChange={(event) => setForm({ ...form, sourceText: event.target.value })} rows={5} />
            </Field>
          </div>
        )}
      </section>

      <div className="wizard-actions">
        <button className="secondary-action" onClick={() => (step === 1 ? router.push("/") : setStep(1))}>
          <ArrowLeft size={20} />
          Previous
        </button>
        <button className="primary-action" onClick={() => (step === 1 ? setStep(2) : submit())}>
          {step === 1 ? "Next" : "Generate"}
          <ArrowRight size={20} />
        </button>
      </div>
    </AppShell>
  );

  function updatePlan(index: number, patch: Partial<QuestionPlan>) {
    setPlans(plans.map((plan, planIndex) => (planIndex === index ? { ...plan, ...patch } : plan)));
  }
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
      {error ? <small>{error}</small> : null}
    </label>
  );
}

function Stepper({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return (
    <div className="mini-stepper">
      <button onClick={() => onChange(Math.max(1, value - 1))} aria-label="Decrease">
        <Minus size={16} />
      </button>
      <strong>{value}</strong>
      <button onClick={() => onChange(value + 1)} aria-label="Increase">
        <Plus size={16} />
      </button>
    </div>
  );
}
