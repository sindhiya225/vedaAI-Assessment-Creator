import type { Assignment, CreateAssignmentInput, QuestionPaper } from "@vedaai/shared";
import { questionPaperSchema } from "@vedaai/shared";
import { config } from "./config.js";

const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const difficultyCycle = ["Easy", "Moderate", "Hard"] as const;
type QuestionSeed = {
  text: string;
  answer: string;
  difficulty: (typeof difficultyCycle)[number];
};

const electricityBank: QuestionSeed[] = [
  {
    text: "Define electroplating. Why is it commonly used on objects made of cheaper metals?",
    answer:
      "Electroplating is the process of depositing a thin layer of one metal over another metal by using electric current through an electrolyte. It is used to improve appearance, prevent corrosion, reduce wear, and give cheaper metals the surface properties of costlier metals.",
    difficulty: "Easy"
  },
  {
    text: "What is an electrolyte? Give one example of an electrolyte used during electroplating.",
    answer:
      "An electrolyte is a liquid or solution that conducts electricity because it contains ions. Copper sulphate solution is an electrolyte commonly used when an object is electroplated with copper.",
    difficulty: "Easy"
  },
  {
    text: "Why does copper sulphate solution conduct electricity while pure water is a poor conductor?",
    answer:
      "Copper sulphate solution contains copper ions and sulphate ions that move through the liquid and carry charge. Pure water has very few ions, so it does not allow electric current to pass easily.",
    difficulty: "Moderate"
  },
  {
    text: "Name the electrodes used in electrolysis and state where reduction usually occurs.",
    answer:
      "The two electrodes are the cathode and the anode. Reduction usually occurs at the cathode, where positively charged ions gain electrons.",
    difficulty: "Easy"
  },
  {
    text: "Explain why direct current is preferred over alternating current for electroplating.",
    answer:
      "Direct current keeps the cathode and anode fixed, so metal ions are deposited steadily on the object connected to the cathode. Alternating current keeps reversing direction, which would disturb or undo the metal deposition.",
    difficulty: "Moderate"
  },
  {
    text: "During copper electroplating, why is the object to be plated connected to the negative terminal?",
    answer:
      "The object is connected to the negative terminal so it acts as the cathode. Copper ions in the solution are attracted to it, gain electrons, and form a copper layer on its surface.",
    difficulty: "Moderate"
  },
  {
    text: "What happens at the anode when copper is used as the anode in copper electroplating?",
    answer:
      "Copper atoms from the anode lose electrons and enter the solution as copper ions. This helps replace the copper ions that are deposited on the cathode.",
    difficulty: "Hard"
  },
  {
    text: "Write the chemical changes at the electrodes during electrolysis of acidified water.",
    answer:
      "At the cathode, hydrogen ions gain electrons to form hydrogen gas. At the anode, hydroxide ions or water molecules lose electrons to form oxygen gas. Hydrogen is produced in about twice the volume of oxygen.",
    difficulty: "Hard"
  },
  {
    text: "Why should the object be cleaned before electroplating?",
    answer:
      "The object is cleaned to remove oil, dust, rust, and oxide layers. A clean surface allows the deposited metal layer to stick evenly and firmly.",
    difficulty: "Easy"
  },
  {
    text: "Mention two uses of electroplating in daily life.",
    answer:
      "Electroplating is used to chromium-plate taps, bicycle handles, and car parts to prevent rust and improve shine. It is also used to plate jewellery with gold or silver.",
    difficulty: "Easy"
  },
  {
    text: "A student says metals conduct electricity because their atoms move through the wire. Correct this statement.",
    answer:
      "In metals, atoms do not move through the wire. Electric current is mainly due to the movement of free electrons through the metallic structure.",
    difficulty: "Moderate"
  },
  {
    text: "How does electrolysis show the chemical effect of electric current?",
    answer:
      "Electrolysis shows the chemical effect of current because passing current through an electrolyte causes chemical changes such as gas formation, metal deposition, or decomposition of compounds.",
    difficulty: "Moderate"
  },
  {
    text: "Why does the blue colour of copper sulphate solution remain nearly unchanged when a copper anode is used?",
    answer:
      "Copper ions removed from the solution at the cathode are replaced by copper ions produced from the copper anode. Therefore, the concentration of copper ions remains nearly constant.",
    difficulty: "Hard"
  },
  {
    text: "What safety precaution should be followed while setting up an electrolysis experiment in class?",
    answer:
      "Use low-voltage DC, avoid touching bare wires with wet hands, keep chemicals away from eyes and mouth, and perform the experiment under teacher supervision.",
    difficulty: "Easy"
  },
  {
    text: "Differentiate between a conductor and an insulator with one example each.",
    answer:
      "A conductor allows electric current to pass through it, such as copper. An insulator does not allow current to pass easily, such as rubber or plastic.",
    difficulty: "Easy"
  }
];

const generalBank: QuestionSeed[] = [
  {
    text: "Define the main idea of the chapter in your own words and give one suitable example.",
    answer: "A strong answer should state the definition clearly, connect it to the chapter, and support it with one accurate example.",
    difficulty: "Easy"
  },
  {
    text: "Explain how the given concept is useful in real life.",
    answer: "The answer should describe the concept, identify a practical use, and explain why that use matters.",
    difficulty: "Moderate"
  },
  {
    text: "Give reasons for one important process from the lesson and mention its result.",
    answer: "The answer should include the cause, the steps involved, and the final result of the process.",
    difficulty: "Moderate"
  },
  {
    text: "Analyse a situation where the concept may fail or produce an unexpected result.",
    answer: "The answer should identify the situation, explain the reason for failure, and suggest a correction.",
    difficulty: "Hard"
  }
];

export function buildPrompt(input: CreateAssignmentInput) {
  const totalMarks = input.plans.reduce((sum, plan) => sum + plan.count * plan.marks, 0);
  return `Create a structured question paper as JSON only.
School: ${input.schoolName}
Subject: ${input.subject}
Class: ${input.className}
Time allowed: ${input.timeAllowedMinutes} minutes
Maximum marks: ${totalMarks}
Due date: ${input.dueDate}
Question plan: ${JSON.stringify(input.plans)}
Teacher instructions: ${input.instructions || "Use age-appropriate, exam-ready wording."}
Source material: ${input.sourceText || "Use standard curriculum knowledge for the subject."}

Return JSON with schoolName, subject, className, timeAllowedMinutes, maximumMarks, generatedAt, sections[].
Each section needs id, title, instruction, type, questions[].
Each question needs id, text, difficulty as Easy/Moderate/Hard, marks, answer.
Do not include markdown or commentary.`;
}

export async function generateQuestionPaper(assignment: Assignment): Promise<QuestionPaper> {
  if (config.openAiKey) {
    const aiPaper = await generateWithOpenAI(assignment);
    if (aiPaper) return aiPaper;
  }
  return generateLocally(assignment);
}

async function generateWithOpenAI(assignment: Assignment) {
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.openAiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: config.openAiModel,
        temperature: 0.35,
        messages: [
          { role: "system", content: "You generate valid JSON exam papers for teachers." },
          { role: "user", content: buildPrompt(assignment) }
        ],
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) return null;
    const data = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;
    return questionPaperSchema.parse(JSON.parse(content));
  } catch (error) {
    console.warn("OpenAI generation failed, falling back to local generator");
    return null;
  }
}

function generateLocally(assignment: Assignment): QuestionPaper {
  let serial = 1;
  const bank = chooseQuestionBank(assignment);
  const topics = extractTopics(assignment.sourceText || assignment.subject);
  const sections = assignment.plans.map((plan, sectionIndex) => ({
    id: `section-${letters[sectionIndex]}`,
    title: `Section ${letters[sectionIndex]}`,
    instruction: plan.type.includes("Long")
      ? "Answer the following in detail."
      : "Attempt all questions. Each question carries equal marks.",
    type: plan.type,
    questions: Array.from({ length: plan.count }, (_, index) => {
      const seed = bank[(index + sectionIndex * 3) % bank.length];
      const id = `q-${serial++}`;
      const question = adaptQuestion(seed, plan.type, index, topics);
      return {
        id,
        text: question.text,
        difficulty: question.difficulty,
        marks: plan.marks,
        answer: question.answer
      };
    })
  }));

  return {
    schoolName: assignment.schoolName,
    subject: assignment.subject,
    className: assignment.className,
    timeAllowedMinutes: assignment.timeAllowedMinutes,
    maximumMarks: assignment.plans.reduce((sum, plan) => sum + plan.count * plan.marks, 0),
    sections,
    generatedAt: new Date().toISOString()
  };
}

function chooseQuestionBank(assignment: Assignment) {
  const context = `${assignment.subject} ${assignment.sourceText}`.toLowerCase();
  if (/(electric|electrolysis|electroplating|copper|cathode|anode|conductor|current)/.test(context)) {
    return electricityBank;
  }
  return generalBank;
}

function extractTopics(source: string) {
  const matches = source
    .split(/[,.;\n]/)
    .map((part) => part.trim())
    .filter((part) => part.length > 3)
    .slice(0, 6);
  return matches.length ? matches : ["the lesson"];
}

function adaptQuestion(seed: QuestionSeed, type: Assignment["plans"][number]["type"], index: number, topics: string[]): QuestionSeed {
  if (type === "Multiple Choice Questions") {
    const correct = shortAnswer(seed.answer);
    return {
      text: `${seed.text} A. ${correct} B. It happens without ions C. It needs alternating current only D. It does not involve electrodes`,
      answer: `Correct option: A. ${seed.answer}`,
      difficulty: seed.difficulty
    };
  }

  if (type === "True or False") {
    const topic = topics[index % topics.length];
    return {
      text: `True or False: ${topic} is connected with the chemical effect of electric current. Justify your answer in one sentence.`,
      answer: `True. ${seed.answer}`,
      difficulty: index % 3 === 2 ? "Moderate" : "Easy"
    };
  }

  if (type === "Case Study Questions") {
    return {
      text: `A student sets up an electroplating experiment but the coating is patchy and dull. Based on the chapter, identify two likely causes and suggest one correction.`,
      answer:
        "The object may not have been cleaned properly, the current may be too high, or the electrolyte may be weak/impure. The student should clean the object, use low steady DC, and keep the correct electrolyte and electrode arrangement.",
      difficulty: "Hard"
    };
  }

  if (type === "Long Answer Questions") {
    return {
      text: `${seed.text} Explain the process step by step and include a labelled example from daily life.`,
      answer: `${seed.answer} A detailed response should also describe the setup, direction of ion movement, electrode reactions where relevant, and one daily-life application.`,
      difficulty: seed.difficulty === "Easy" ? "Moderate" : seed.difficulty
    };
  }

  return seed;
}

function shortAnswer(answer: string) {
  const firstSentence = answer.split(".")[0]?.trim();
  if (!firstSentence) return "The correct scientific explanation";
  return firstSentence.length <= 95 ? firstSentence : `${firstSentence.slice(0, 92).trim()}...`;
}
