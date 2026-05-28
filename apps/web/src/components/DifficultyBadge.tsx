import clsx from "clsx";
import type { Difficulty } from "@vedaai/shared";

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  return <span className={clsx("difficulty", difficulty.toLowerCase())}>{difficulty}</span>;
}
