export const SUBJECTS = [
  "AP Chemistry",
  "AP Biology",
  "Chemistry",
  "Biology",
  "Algebra 2",
  "Geometry",
  "Precalculus",
  "AP Calculus AB",
  "AP Calculus BC",
  "AP Statistics",
  "AP Physics 1",
  "Physics",
  "AP Computer Science A",
  "AP US History",
  "World History",
  "AP English Language",
  "English 10",
  "Spanish 3",
  "AP Spanish Language",
  "Mandarin 2",
] as const;

export const SUBJECT_SET: ReadonlySet<string> = new Set(SUBJECTS);
