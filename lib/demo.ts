export const STUDENT_NAME = "Daniel";
export const LECTURER_NAME = "Dr. Oni Lewa";

export const LECTURERS = [
  { id: "ol", name: "Dr. Oni Lewa", subject: "Mathematics" },
  { id: "ab", name: "Dr. Ade Bello", subject: "Computer Science" },
];

export const STUDENTS = [
  { id: "ac", name: "Amara Cole" },
  { id: "tb", name: "Tunde Bakare" },
  { id: "ce", name: "Chisom Eze" },
  { id: "ya", name: "Yemi Adeyemi" },
];

export type Assessment = {
  id: string;
  title: string;
  lecturer: string;
  category: "Assignment" | "Project" | "Presentation";
  description: string;
  due: string;
  action: "submit" | "link" | "classroom";
  actionLabel: string;
  hint: string;
};

export const OUTSTANDING: Assessment[] = [
  {
    id: "o1",
    title: "Project Defense Chapter 1 - 3",
    lecturer: "Dr. Oni Lewa",
    category: "Project",
    description:
      "Prepare and present chapters 1 through 3 of your final year project. Ensure methodology and literature review sections are complete.",
    due: "2026-06-13",
    action: "submit",
    actionLabel: "Submit Now",
    hint: "requires PDF or DOCX",
  },
  {
    id: "o2",
    title: "GitHub Code Snippet Review",
    lecturer: "Dr. Ade Bello",
    category: "Assignment",
    description: "You will show us the snippet of the code on Github",
    due: "2026-06-18",
    action: "link",
    actionLabel: "Add Links",
    hint: "requires URL",
  },
  {
    id: "o3",
    title: "Present your code",
    lecturer: "Dr. Oni Lewa",
    category: "Presentation",
    description: "Present your solution online in the Scholaid Classroom.",
    due: "2026-06-20",
    action: "classroom",
    actionLabel: "Start Now",
    hint: "enter Scholaid Classroom",
  },
];

export type Submitted = {
  id: string;
  title: string;
  lecturer: string;
  category: "Assignment" | "Project" | "Presentation";
  description: string;
  submittedOn: string;
};

export const SUBMITTED: Submitted[] = [
  {
    id: "s1",
    title: "Introduction to Algorithms Essay",
    lecturer: "Dr. Ade Bello",
    category: "Assignment",
    description:
      "A 2000-word critical analysis of sorting algorithm complexity with real-world applications.",
    submittedOn: "2026-12-15",
  },
  {
    id: "s2",
    title: "Database ER Diagram",
    lecturer: "Dr. Oni Lewa",
    category: "Project",
    description:
      "Entity relationship diagram for a hospital management system built in draw.io.",
    submittedOn: "2026-12-15",
  },
];

export type Graded = {
  id: string;
  title: string;
  lecturer: string;
  category: "Assignment" | "Project" | "Presentation";
  summary: string;
  grade: number;
  label: string;
};

export const GRADED: Graded[] = [
  {
    id: "g1",
    title: "Web Development Final Project",
    lecturer: "Dr. Ade Bello",
    category: "Project",
    summary:
      "Strong implementation of RESTful API design. Frontend lacks responsive optimization on mobile. Overall well-structured codebase with good separation of concerns.",
    grade: 82,
    label: "Excellent",
  },
];

export type Resource = {
  id: string;
  name: string;
  course: string;
  lecturer: string;
  uploaded: string;
  size: string;
  type: "pdf" | "docx" | "video" | "link";
};

export const RESOURCES: Resource[] = [
  {
    id: "r1",
    name: "Lecture Notes Week 4.pdf",
    course: "MTH 301",
    lecturer: "Dr. Oni Lewa",
    uploaded: "3 days ago",
    size: "2.4 MB",
    type: "pdf",
  },
  {
    id: "r2",
    name: "Assignment Brief.docx",
    course: "CSC 202",
    lecturer: "Dr. Ade Bello",
    uploaded: "1 week ago",
    size: "340 KB",
    type: "docx",
  },
  {
    id: "r3",
    name: "Project Guidelines.pdf",
    course: "ENG 410",
    lecturer: "Dr. Oni Lewa",
    uploaded: "2 weeks ago",
    size: "1.1 MB",
    type: "pdf",
  },
  {
    id: "r4",
    name: "Reference Video.mp4",
    course: "MTH 301",
    lecturer: "Dr. Ade Bello",
    uploaded: "3 weeks ago",
    size: "84 MB",
    type: "video",
  },
];

export const COURSES = ["All", "MTH 301", "CSC 202", "ENG 410"];
