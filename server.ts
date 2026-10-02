import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import type {
  Course,
  Unit,
  ResourceItem,
  User,
  UnlockRequest,
  StudentSubmission,
  NoteRequest,
  AdminPopup,
  SiteSettings,
} from './src/types/index.ts';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '25mb' }));

// Initialize Google GenAI
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Seed Data
const initialCourses: Course[] = [
  {
    id: 'c-chem',
    name: 'AP Chemistry Honors',
    code: 'CHEM-502',
    period: 'Period 3',
    teacher: 'Dr. Henderson',
    color: 'emerald',
    accentHex: '#10b981',
    icon: 'FlaskConical',
    room: 'Sci-304',
    description: 'Advanced atomic structures, thermodynamics, reaction kinetics, equilibrium, and acid-base buffers.',
    nextDueDate: '2026-10-03T09:00:00.000Z',
    nextDueTitle: 'Unit 2 Reaction Kinetics & Equilibrium Exam',
    urgencyType: 'exam',
  },
  {
    id: 'c-calc',
    name: 'AP Calculus BC',
    code: 'MATH-601',
    period: 'Period 4',
    teacher: 'Mr. Vance',
    color: 'rose',
    accentHex: '#f43f5e',
    icon: 'Sigma',
    room: 'Hall-210',
    description: 'Differential and integral calculus, series, polar/parametric coordinates, and vector-valued functions.',
    nextDueDate: '2026-10-04T13:30:00.000Z',
    nextDueTitle: 'Taylor Series & Convergence Tests Quiz',
    urgencyType: 'exam',
  },
  {
    id: 'c-lit',
    name: 'AP English Literature',
    code: 'ENGL-401',
    period: 'Period 1',
    teacher: 'Ms. Holloway',
    color: 'indigo',
    accentHex: '#6366f1',
    icon: 'BookOpen',
    room: 'Hum-108',
    description: 'Close textual analysis of classical literature, poetry motifs, rhetorical devices, and analytical essays.',
    nextDueDate: '2026-10-06T23:59:00.000Z',
    nextDueTitle: 'Gatsby Analytical Synthesis Paper (Draft 1)',
    urgencyType: 'assignment',
  },
  {
    id: 'c-csa',
    name: 'AP Computer Science A',
    code: 'CS-301',
    period: 'Period 7',
    teacher: 'Coach Miller',
    color: 'cyan',
    accentHex: '#06b6d4',
    icon: 'Code2',
    room: 'Lab-402',
    description: 'Java OOP, inheritance hierarchies, recursion, searching/sorting algorithms, and 2D arrays.',
    nextDueDate: '2026-10-05T17:00:00.000Z',
    nextDueTitle: 'Recursive Grid Search & Backtracking Lab',
    urgencyType: 'lab',
  },
  {
    id: 'c-history',
    name: 'AP United States History',
    code: 'HIST-305',
    period: 'Period 6',
    teacher: 'Mrs. Gallagher',
    color: 'amber',
    accentHex: '#f59e0b',
    icon: 'Landmark',
    room: 'Hum-205',
    description: 'Colonization through modern era, DBQs, LEQs, historical context, and thematic argumentations.',
    nextDueDate: '2026-10-08T11:00:00.000Z',
    nextDueTitle: 'Period 3 DBQ: Revolutionary Sentiment Essay',
    urgencyType: 'assignment',
  },
];

const initialUnits: Unit[] = [
  // Chemistry Units
  {
    id: 'u-chem-1',
    courseId: 'c-chem',
    unitNumber: 1,
    title: 'Unit 1: Atomic Structure & Periodicity',
    description: 'Electron configurations, Coulombic forces, photoelectron spectroscopy (PES), and periodic trends.',
    status: 'unlocked',
    order: 1,
  },
  {
    id: 'u-chem-2',
    courseId: 'c-chem',
    unitNumber: 2,
    title: 'Unit 2: Chemical Reactions & Kinetics',
    description: 'Rate laws, collision theory, activation energy, catalysis, and reaction mechanisms.',
    status: 'unlocked',
    isActiveSpotlight: true,
    order: 2,
  },
  {
    id: 'u-chem-3',
    courseId: 'c-chem',
    unitNumber: 3,
    title: 'Unit 3: Thermodynamics & Electrochemistry',
    description: 'Enthalpy, entropy, Gibbs free energy, galvanic cells, and Nernst equation.',
    status: 'locked',
    unlockAt: '2026-10-15T08:00:00.000Z',
    order: 3,
  },

  // Calculus Units
  {
    id: 'u-calc-1',
    courseId: 'c-calc',
    unitNumber: 1,
    title: 'Unit 1: Advanced Integration Techniques',
    description: 'Integration by parts, partial fractions, trigonometric substitutions, and improper integrals.',
    status: 'unlocked',
    order: 1,
  },
  {
    id: 'u-calc-2',
    courseId: 'c-calc',
    unitNumber: 2,
    title: 'Unit 2: Infinite Sequences & Series',
    description: 'Convergence tests (Ratio, Root, Integral), Maclaurin series, and Taylor polynomials.',
    status: 'unlocked',
    isActiveSpotlight: true,
    order: 2,
  },

  // English Literature
  {
    id: 'u-lit-1',
    courseId: 'c-lit',
    unitNumber: 1,
    title: 'Unit 1: Short Fiction & Character Motifs',
    description: 'Narrative structure, unreliable narrators, figurative symbolism, and tone shifts.',
    status: 'unlocked',
    order: 1,
  },
  {
    id: 'u-lit-2',
    courseId: 'c-lit',
    unitNumber: 2,
    title: 'Unit 2: The American Dream & Modernist Poetry',
    description: 'The Great Gatsby thematic analysis, modernist alienation, and poetic scansion.',
    status: 'unlocked',
    isActiveSpotlight: true,
    order: 2,
  },

  // CompSci
  {
    id: 'u-csa-1',
    courseId: 'c-csa',
    unitNumber: 1,
    title: 'Unit 1: ArrayLists & Object Collections',
    description: 'Wrapper classes, auto-boxing, traversals, and mutating lists safely.',
    status: 'unlocked',
    order: 1,
  },
  {
    id: 'u-csa-2',
    courseId: 'c-csa',
    unitNumber: 2,
    title: 'Unit 2: Recursion & Binary Search Algorithms',
    description: 'Call stacks, base cases, binary recursive tree exploration, and O(log n) performance.',
    status: 'unlocked',
    isActiveSpotlight: true,
    order: 2,
  },

  // History
  {
    id: 'u-hist-1',
    courseId: 'c-history',
    unitNumber: 1,
    title: 'Unit 1: Colonial America & Early Republic (1607-1800)',
    description: 'Mercantilism, Salutary neglect, French & Indian War aftermath, and Constitutional debates.',
    status: 'unlocked',
    order: 1,
  },
];

const initialResources: ResourceItem[] = [
  // Chem Resources
  {
    id: 'r-chem-1',
    courseId: 'c-chem',
    unitId: 'u-chem-2',
    title: 'Unit 2 Reaction Kinetics Master Equation Sheet & Rate Law Rules',
    description: 'Zero, First, and Second-order integrated rate law graphs, half-life formulas, and Arrhenius plots with hand annotations.',
    url: 'https://docs.google.com/document/d/1studyvault-chem-kinetics-sheet',
    type: 'doc',
    category: 'study_guide',
    visibilityScope: 'all_enrolled',
    isCompletedHw: false,
    createdAt: '2026-09-28T14:00:00.000Z',
    submittedBy: 'Liam Nystrom',
    viewCount: 42,
    tags: ['Kinetics', 'Equations', 'Exam Prep'],
    previewSnippet: 'Integrated rate law graphs: [A] vs t (0-order), ln[A] vs t (1st-order), 1/[A] vs t (2nd-order slope = k).',
  },
  {
    id: 'r-chem-2',
    courseId: 'c-chem',
    unitId: 'u-chem-2',
    title: 'Problem Set #4: Method of Initial Rates - Full Step-by-Step Answer Key',
    description: 'Complete solved homework problems 1 through 12 with all exponent derivations and units for rate constant k explained.',
    url: 'https://drive.google.com/file/d/1studyvault-chem-hw4-key/view',
    type: 'pdf',
    category: 'completed_hw',
    visibilityScope: 'all_enrolled',
    isCompletedHw: true,
    createdAt: '2026-09-29T18:30:00.000Z',
    submittedBy: 'Alex Rivera',
    viewCount: 68,
    tags: ['Completed HW', 'Problem Set', 'Rate Laws'],
    previewSnippet: 'Q3 Answer: Rate = k[NO2]^2[CO]^0. Value of k = 1.45 x 10^-3 M^-1 s^-1. Check step 4 for cancelations.',
  },
  {
    id: 'r-chem-3',
    courseId: 'c-chem',
    unitId: 'u-chem-2',
    title: 'Crystal Violet Colorimetry Lab: Raw Data & Beer-Lambert Calibration Curve',
    description: 'Spreadsheet with absorbance vs time data, spectrophotometer calibration slope, and calculated pseudo-first order constant.',
    url: 'https://docs.google.com/spreadsheets/d/1studyvault-chem-lab-crystal-violet',
    type: 'sheets',
    category: 'lab_report',
    visibilityScope: 'restricted_students',
    allowedStudentIds: ['u-alex', 'u-maya'], // Lab group only
    isCompletedHw: true,
    createdAt: '2026-09-30T10:15:00.000Z',
    submittedBy: 'Liam Nystrom',
    viewCount: 15,
    tags: ['Lab Report', 'Lab Group 3', 'Beer-Lambert'],
    previewSnippet: 'Group 3 Lab Partners (Liam, Alex, Maya). Absorbance wavelength set to 590 nm. R^2 fit = 0.9984.',
  },
  {
    id: 'r-chem-4',
    courseId: 'c-chem',
    unitId: 'u-chem-2',
    title: 'Kinetics & Catalysis Ultimate Quizlet Deck (85 Terms & Mechanisms)',
    description: 'Flashcard deck covering elementary steps, intermediates vs catalysts, rate-determining steps, and molecularity.',
    url: 'https://quizlet.com/studyvault-chem-unit2-flashcards',
    type: 'quizlet',
    category: 'study_guide',
    visibilityScope: 'all_enrolled',
    isCompletedHw: false,
    createdAt: '2026-09-27T08:00:00.000Z',
    submittedBy: 'Maya Patel',
    viewCount: 51,
    tags: ['Flashcards', 'Quizlet', 'Vocab'],
    previewSnippet: 'Key definitions: Intermediate (produced then consumed), Catalyst (consumed then regenerated).',
  },
  {
    id: 'r-chem-5',
    courseId: 'c-chem',
    unitId: 'u-chem-1',
    title: 'Unit 1 Photoelectron Spectroscopy (PES) & Periodic Trends Slide Deck',
    description: 'Lecture annotations with binding energy spectrum comparisons for elements Sodium through Argon.',
    url: 'https://docs.google.com/presentation/d/1studyvault-chem-pes-slides',
    type: 'slides',
    category: 'lecture_notes',
    visibilityScope: 'all_enrolled',
    isCompletedHw: false,
    createdAt: '2026-09-12T16:00:00.000Z',
    submittedBy: 'Dr. Henderson / Liam',
    viewCount: 33,
    tags: ['PES', 'Atomic Radius', 'Electronegativity'],
    previewSnippet: 'Slide 14 highlights why 4s electrons are removed before 3d in transition metal cations.',
  },
  {
    id: 'r-chem-6',
    courseId: 'c-chem',
    unitId: 'u-chem-2',
    title: 'Unit 2 Official Mock Practice Exam Key & Scoring Rubric',
    description: 'Teacher-released previous year mock exam with full AP-style FRQ point distributions. Locked until 24h before exam.',
    url: 'https://drive.google.com/file/d/1studyvault-chem-mock-exam-key',
    type: 'pdf',
    category: 'practice_exam',
    visibilityScope: 'all_enrolled',
    scheduledUnlockAt: '2026-10-02T16:00:00.000Z', // Time-locked
    isCompletedHw: false,
    createdAt: '2026-09-30T19:00:00.000Z',
    submittedBy: 'Liam Nystrom',
    viewCount: 9,
    tags: ['FRQ Rubric', 'Time-Locked', 'Practice Exam'],
    previewSnippet: '🔒 This resource unlocks automatically on Thursday at 4:00 PM. Or submit an unlock request to study early.',
  },

  // Calc Resources
  {
    id: 'r-calc-1',
    courseId: 'c-calc',
    unitId: 'u-calc-2',
    title: 'Taylor & Maclaurin Series Mega-Cheat Sheet (Sin, Cos, e^x, 1/(1-x))',
    description: 'Comprehensive table of standard series expansions, radius of convergence, and Lagrange error bound formula.',
    url: 'https://docs.google.com/document/d/1studyvault-calc-series-sheet',
    type: 'doc',
    category: 'study_guide',
    visibilityScope: 'all_enrolled',
    isCompletedHw: false,
    createdAt: '2026-09-29T11:00:00.000Z',
    submittedBy: 'Liam Nystrom',
    viewCount: 77,
    tags: ['Taylor Series', 'Convergence', 'Cheat Sheet'],
    previewSnippet: 'Lagrange Error: |R_n(x)| <= (M / (n+1)!) * |x - c|^(n+1), where M is the maximum of |f^(n+1)(t)|.',
  },
  {
    id: 'r-calc-2',
    courseId: 'c-calc',
    unitId: 'u-calc-2',
    title: 'Series Convergence Tests Decision Tree Flowchart (PDF)',
    description: 'Visual flowchart to decide which test to use first: nth Term Divergence -> Geometric/p-Series -> Ratio -> Alt Series.',
    url: 'https://drive.google.com/file/d/1studyvault-calc-series-flowchart',
    type: 'pdf',
    category: 'study_guide',
    visibilityScope: 'all_enrolled',
    isCompletedHw: false,
    createdAt: '2026-09-28T15:20:00.000Z',
    submittedBy: 'Alex Rivera',
    viewCount: 61,
    tags: ['Flowchart', 'Convergence Tests'],
    previewSnippet: 'Pro tip: Always run the nth-term test in your head first. If lim a_n != 0, it diverges immediately.',
  },
  {
    id: 'r-calc-3',
    courseId: 'c-calc',
    unitId: 'u-calc-1',
    title: 'Integration by Parts & Tabular Method Walkthrough Video (18 min)',
    description: 'Screen recording showing the D-I (Differentiation-Integration) tabular shortcut for polynomials multiplied by trig/exp.',
    url: 'https://youtube.com/watch?v=studyvault-calc-tabular-method',
    type: 'video',
    category: 'lecture_notes',
    visibilityScope: 'all_enrolled',
    isCompletedHw: false,
    createdAt: '2026-09-15T20:00:00.000Z',
    submittedBy: 'Liam Nystrom',
    viewCount: 45,
    tags: ['Tabular Method', 'Integration by Parts', 'Video Walkthrough'],
    previewSnippet: 'Video timestamps: 00:00 LIATE rule, 04:30 Tabular setup, 11:20 Repeating loop integrals.',
  },

  // Lit Resources
  {
    id: 'r-lit-1',
    courseId: 'c-lit',
    unitId: 'u-lit-2',
    title: 'The Great Gatsby: Complete Quote Bank & Symbolism Matrix (Color & Eyes of TJ Eckleburg)',
    description: 'Sorted by chapter with page numbers, context, speaker, and literary significance for essay citations.',
    url: 'https://docs.google.com/document/d/1studyvault-lit-gatsby-quotebank',
    type: 'doc',
    category: 'study_guide',
    visibilityScope: 'all_enrolled',
    isCompletedHw: false,
    createdAt: '2026-09-25T13:40:00.000Z',
    submittedBy: 'Liam Nystrom',
    viewCount: 39,
    tags: ['Gatsby', 'Quotes', 'Symbolism', 'Essay'],
    previewSnippet: 'Chapter 5: "His count of enchanted objects had diminished by one" - Gatsby re-evaluating the green light.',
  },
  {
    id: 'r-lit-2',
    courseId: 'c-lit',
    unitId: 'u-lit-2',
    title: 'Synthesis Essay Outline & High-Scoring Sample Introduction',
    description: 'Exemplar thesis statements that earn the complexity point on the AP Lit 6-point scoring rubric.',
    url: 'https://notion.so/studyvault/gatsby-synthesis-outline',
    type: 'notion',
    category: 'completed_hw',
    visibilityScope: 'all_enrolled',
    isCompletedHw: true,
    createdAt: '2026-09-30T12:00:00.000Z',
    submittedBy: 'Alex Rivera',
    viewCount: 28,
    tags: ['Essay Outline', 'Complexity Point', 'AP Rubric'],
  },

  // CompSci Resources
  {
    id: 'r-csa-1',
    courseId: 'c-csa',
    unitId: 'u-csa-2',
    title: 'Recursion Call-Stack Visualizer & 2D Maze Solver Solution (Java)',
    description: 'Clean documented Java implementation demonstrating base cases, backtracking marker reset, and boundary checking.',
    url: 'https://github.com/studyvault/ap-csa-recursion-maze-solver',
    type: 'code',
    category: 'completed_hw',
    visibilityScope: 'all_enrolled',
    isCompletedHw: true,
    createdAt: '2026-09-26T17:00:00.000Z',
    submittedBy: 'Maya Patel',
    viewCount: 54,
    tags: ['Java', 'Recursion', 'Backtracking', 'Completed Lab'],
    previewSnippet: 'Key pattern: mark visited with grid[r][c] = 2; backtrack with grid[r][c] = 0 if path fails.',
  },

  // History Resources
  {
    id: 'r-hist-1',
    courseId: 'c-history',
    unitId: 'u-hist-1',
    title: 'Period 3 (1754-1800) DBQ Document Sourcing Guide (HIPP Analysis)',
    description: 'Historical context, Intended audience, Purpose, Point of view guidelines for all 7 primary source docs.',
    url: 'https://docs.google.com/document/d/1studyvault-hist-hipp-guide',
    type: 'doc',
    category: 'study_guide',
    visibilityScope: 'all_enrolled',
    isCompletedHw: false,
    createdAt: '2026-09-22T19:10:00.000Z',
    submittedBy: 'Liam Nystrom',
    viewCount: 31,
    tags: ['HIPP', 'DBQ', 'Period 3'],
  },
];

const initialUsers: User[] = [
  {
    id: 'u-admin',
    name: 'Liam Nystrom (Admin)',
    username: 'admin',
    role: 'admin',
    status: 'approved',
    enrolledCourseIds: ['c-chem', 'c-calc', 'c-lit', 'c-csa', 'c-history'],
    email: 'liamnystrom9@gmail.com',
    joinedAt: '2026-08-20T08:00:00.000Z',
    lastLogin: '2026-10-01T17:45:00.000Z',
    notes: 'Vault Creator & System Administrator',
  },
  {
    id: 'u-alex',
    name: 'Alex Rivera',
    username: 'alex',
    role: 'student',
    status: 'approved',
    enrolledCourseIds: ['c-chem', 'c-calc', 'c-lit'],
    email: 'alex.rivera@highschool.edu',
    joinedAt: '2026-08-25T10:00:00.000Z',
    lastLogin: '2026-10-01T15:20:00.000Z',
    notes: 'Period 3 Chem Lab Partner & Calc study group',
  },
  {
    id: 'u-maya',
    name: 'Maya Patel',
    username: 'maya',
    role: 'student',
    status: 'approved',
    enrolledCourseIds: ['c-chem', 'c-csa'],
    email: 'maya.p@highschool.edu',
    joinedAt: '2026-08-27T11:30:00.000Z',
    lastLogin: '2026-09-30T21:10:00.000Z',
    notes: 'CS lab partner & quizlet author',
  },
  {
    id: 'u-liam-student',
    name: 'Liam S.',
    username: 'liams',
    role: 'student',
    status: 'approved',
    enrolledCourseIds: ['c-lit', 'c-history'],
    joinedAt: '2026-09-01T09:00:00.000Z',
    lastLogin: '2026-10-01T12:00:00.000Z',
  },
  {
    id: 'u-jordan',
    name: 'Jordan Hayes',
    username: 'jordan',
    role: 'student',
    status: 'pending',
    enrolledCourseIds: [],
    requestedCourses: ['c-chem', 'c-calc', 'c-csa'],
    email: 'jordan.hayes@students.k12.org',
    joinedAt: '2026-10-01T14:15:00.000Z',
    notes: 'New transfer student requesting AP Chem & Calc BC vault access.',
  },
  {
    id: 'u-sam',
    name: 'Sam Chen',
    username: 'samc',
    role: 'student',
    status: 'pending',
    enrolledCourseIds: [],
    requestedCourses: ['c-chem', 'c-lit'],
    joinedAt: '2026-10-01T16:30:00.000Z',
    notes: 'Period 1 Lit classmate',
  },
];

const initialUnlockRequests: UnlockRequest[] = [
  {
    id: 'req-1',
    resourceId: 'r-chem-3',
    resourceTitle: 'Crystal Violet Colorimetry Lab: Raw Data & Beer-Lambert Calibration Curve',
    courseId: 'c-chem',
    courseName: 'AP Chemistry Honors',
    userId: 'u-liam-student',
    userName: 'Liam S.',
    username: 'liams',
    reason: 'I had an excused absence for the cross-country regional meet on Tuesday. Need the spectrophotometer calibration curve to finish my lab calculation questions.',
    requestedAt: '2026-10-01T11:20:00.000Z',
    status: 'pending',
  },
  {
    id: 'req-2',
    resourceId: 'r-chem-6',
    resourceTitle: 'Unit 2 Official Mock Practice Exam Key & Scoring Rubric',
    courseId: 'c-chem',
    courseName: 'AP Chemistry Honors',
    userId: 'u-alex',
    userName: 'Alex Rivera',
    username: 'alex',
    reason: 'Studying tonight with my tutor since I have family dinner tomorrow during normal review hours. Could I get an early 24-hour pass?',
    requestedAt: '2026-10-01T13:45:00.000Z',
    status: 'pending',
  },
];

const initialSubmissions: StudentSubmission[] = [
  {
    id: 'sub-1',
    courseId: 'c-chem',
    unitId: 'u-chem-2',
    studentId: 'u-maya',
    studentName: 'Maya Patel',
    title: 'Arrhenius Activation Energy Graphing Method Handout',
    url: 'https://docs.google.com/document/d/1maya-arrhenius-graphing',
    type: 'doc',
    category: 'study_guide',
    notes: 'Made this summary with Dr. Henderson after school explaining how to calculate Ea from the slope of ln(k) vs 1/T.',
    submittedAt: '2026-10-01T12:00:00.000Z',
    status: 'pending',
  },
];

const initialNoteRequests: NoteRequest[] = [
  {
    id: 'note-req-1',
    courseId: 'c-chem',
    userId: 'u-alex',
    userName: 'Alex Rivera',
    topic: 'Dr. Henderson whiteboard derivation of 2nd-order half life formula (9/29)',
    dateNeeded: '2026-10-02',
    details: 'My phone died right when he was deriving t_1/2 = 1/(k[A]_0). Does anyone have a clear photo of the board?',
    createdAt: '2026-09-30T17:15:00.000Z',
    status: 'open',
  },
];

// In-Memory Data Store with Local State
let courses: Course[] = [...initialCourses];
let units: Unit[] = [...initialUnits];
let resources: ResourceItem[] = [...initialResources];
let users: User[] = [...initialUsers];
let unlockRequests: UnlockRequest[] = [...initialUnlockRequests];
let submissions: StudentSubmission[] = [...initialSubmissions];
let noteRequests: NoteRequest[] = [...initialNoteRequests];

// Passwords store for secure credential verification
const userPasswords: Record<string, string> = {
  'u-admin': 'vaultadmin',
  'u-alex': 'alex123',
  'u-maya': 'maya123',
  'u-liam-student': 'liams123',
};

// Global Site Settings (Maintenance Mode & AI Tutor Toggle)
let siteSettings: SiteSettings = {
  maintenanceMode: {
    enabled: false,
    countdownTarget: new Date(Date.now() + 3600 * 1000 * 2).toISOString(), // 2 hours
    message: 'StudyVault is undergoing scheduled unit restructuring and updates. Back soon!',
  },
  aiTutorEnabled: false, // Deactivated by default for all accounts unless enabled by admin!
};

// Admin Popups / Broadcast Announcements (Global or Individual)
let popups: AdminPopup[] = [
  {
    id: 'pop-1',
    title: 'Welcome to StudyVault',
    message: 'Review newly uploaded homework solution guides and exam cram sheets. If you need unit access, click any locked card to request access.',
    type: 'info',
    scope: 'global',
    createdAt: new Date().toISOString(),
    active: true,
  },
];

// --- REST API Endpoints ---

// Get complete vault state
app.get('/api/state', (_req, res) => {
  res.json({
    courses,
    units,
    resources,
    users,
    unlockRequests,
    submissions,
    noteRequests,
    siteSettings,
    popups,
  });
});

// Authentication / Login with strict credentials and Maintenance Mode gate
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(
    (u) => u.username.toLowerCase() === (username || '').toLowerCase().trim()
  );

  if (!user) {
    return res.status(401).json({ error: 'User not found. Check username or register.' });
  }

  // Maintenance mode check: ONLY admin can log in when maintenance mode is active!
  if (siteSettings.maintenanceMode.enabled && user.role !== 'admin') {
    return res.status(503).json({
      error: 'Site is under maintenance mode. Only administrators may log in.',
      isMaintenance: true,
      maintenanceMessage: siteSettings.maintenanceMode.message,
      countdownTarget: siteSettings.maintenanceMode.countdownTarget,
    });
  }

  if (user.status === 'suspended') {
    return res.status(403).json({ error: 'This account has been suspended by the administrator.' });
  }

  if (user.status === 'pending') {
    return res.status(403).json({
      error: 'Your account registration is currently pending admin approval.',
      status: 'pending',
    });
  }

  // Strict Password Check
  const expectedPassword = userPasswords[user.id] || user.temporaryPassword || 'vaultadmin';
  if (!password || password.trim() !== expectedPassword.trim()) {
    return res.status(401).json({ error: 'Incorrect password.' });
  }

  // Update lastLogin
  user.lastLogin = new Date().toISOString();

  res.json({
    user,
    message: `Welcome back, ${user.name}!`,
  });
});

// Student Registration
app.post('/api/auth/register', (req, res) => {
  const { name, username, requestedCourses, notes, email, password } = req.body;

  if (!name || !username) {
    return res.status(400).json({ error: 'Display name and username are required.' });
  }

  const existing = users.find(
    (u) => u.username.toLowerCase() === username.toLowerCase().trim()
  );
  if (existing) {
    return res.status(400).json({ error: 'Username already taken. Please choose another.' });
  }

  const newUser: User = {
    id: `u-${Date.now()}`,
    name: name.trim(),
    username: username.toLowerCase().trim(),
    role: 'student',
    status: 'pending', // Requires admin approval
    enrolledCourseIds: [],
    requestedCourses: requestedCourses || [],
    email: email || undefined,
    joinedAt: new Date().toISOString(),
    notes: notes || undefined,
  };

  users.push(newUser);
  userPasswords[newUser.id] = password || 'study123';

  res.status(201).json({
    user: newUser,
    message: 'Registration request submitted! Your administrator will approve your courses shortly.',
  });
});

// Admin approves pending account
app.post('/api/admin/users/:id/approve-request', (req, res) => {
  const { id } = req.params;
  const { courseIds } = req.body;

  const targetUser = users.find((u) => u.id === id);
  if (!targetUser) return res.status(404).json({ error: 'User not found' });

  targetUser.status = 'approved';
  targetUser.enrolledCourseIds = courseIds || targetUser.requestedCourses || [];
  targetUser.requestedCourses = [];

  res.json({ user: targetUser, message: `${targetUser.name} has been approved.` });
});

// Admin denies pending account
app.post('/api/admin/users/:id/reject-request', (req, res) => {
  const { id } = req.params;
  users = users.filter((u) => u.id !== id);
  delete userPasswords[id];
  res.json({ success: true, message: 'Request removed.' });
});

// Admin updates user course matrix
app.post('/api/admin/users/:id/update-courses', (req, res) => {
  const { id } = req.params;
  const { courseIds } = req.body;

  const targetUser = users.find((u) => u.id === id);
  if (!targetUser) return res.status(404).json({ error: 'User not found' });

  targetUser.enrolledCourseIds = courseIds || [];
  res.json({ user: targetUser });
});

// Admin toggle user suspend/active
app.post('/api/admin/users/:id/toggle-status', (req, res) => {
  const { id } = req.params;
  const targetUser = users.find((u) => u.id === id);
  if (!targetUser) return res.status(404).json({ error: 'User not found' });

  targetUser.status = targetUser.status === 'approved' ? 'suspended' : 'approved';
  res.json({ user: targetUser });
});

// Admin reset user password
app.post('/api/admin/users/:id/reset-password', (req, res) => {
  const { id } = req.params;
  const { temporaryPassword } = req.body;

  const targetUser = users.find((u) => u.id === id);
  if (!targetUser) return res.status(404).json({ error: 'User not found' });

  targetUser.temporaryPassword = temporaryPassword || 'study123';
  userPasswords[targetUser.id] = targetUser.temporaryPassword || 'study123';

  res.json({
    user: targetUser,
    message: `Password reset. Hand "${targetUser.temporaryPassword}" to ${targetUser.name}.`,
  });
});

// Site Settings (Maintenance Mode & AI Tutor Toggle)
app.post('/api/admin/settings', (req, res) => {
  const { maintenanceMode, aiTutorEnabled } = req.body;
  if (maintenanceMode !== undefined) {
    siteSettings.maintenanceMode = {
      ...siteSettings.maintenanceMode,
      ...maintenanceMode,
    };
  }
  if (aiTutorEnabled !== undefined) {
    siteSettings.aiTutorEnabled = !!aiTutorEnabled;
  }
  res.json({ siteSettings });
});

// Admin Popups / Announcements
app.post('/api/admin/popups', (req, res) => {
  const popupData = req.body as AdminPopup;
  popupData.id = `pop-${Date.now()}`;
  popupData.createdAt = new Date().toISOString();
  popupData.active = true;
  popups.unshift(popupData);
  res.status(201).json({ popup: popupData });
});

app.post('/api/admin/popups/:id/toggle', (req, res) => {
  const { id } = req.params;
  const p = popups.find((x) => x.id === id);
  if (!p) return res.status(404).json({ error: 'Popup not found' });
  p.active = !p.active;
  res.json({ popup: p });
});

app.delete('/api/admin/popups/:id', (req, res) => {
  const { id } = req.params;
  popups = popups.filter((x) => x.id !== id);
  res.json({ success: true });
});

// Course Creation / Update
app.post('/api/courses', (req, res) => {
  const courseData = req.body as Course;
  if (!courseData.id) {
    courseData.id = `c-${Date.now()}`;
    courses.push(courseData);
  } else {
    const idx = courses.findIndex((c) => c.id === courseData.id);
    if (idx >= 0) courses[idx] = { ...courses[idx], ...courseData };
    else courses.push(courseData);
  }
  res.json({ course: courseData });
});

// Course Delete (also cleans up associated units and resources)
app.delete('/api/courses/:id', (req, res) => {
  const { id } = req.params;
  courses = courses.filter((c) => c.id !== id);
  units = units.filter((u) => u.courseId !== id);
  resources = resources.filter((r) => r.courseId !== id);
  // Also remove from enrolled course arrays
  users.forEach((u) => {
    u.enrolledCourseIds = u.enrolledCourseIds.filter((cid) => cid !== id);
  });
  res.json({ success: true });
});

// Course Reorder
app.post('/api/courses/reorder', (req, res) => {
  const { courseIds } = req.body as { courseIds: string[] };
  if (!Array.isArray(courseIds)) return res.status(400).json({ error: 'Invalid courseIds' });
  const ordered: Course[] = [];
  courseIds.forEach((id) => {
    const c = courses.find((x) => x.id === id);
    if (c) ordered.push(c);
  });
  courses.forEach((c) => {
    if (!ordered.some((x) => x.id === c.id)) ordered.push(c);
  });
  courses = ordered;
  res.json({ courses });
});

// Unit Creation / Update
app.post('/api/units', (req, res) => {
  const unitData = req.body as Unit;
  if (!unitData.id) {
    unitData.id = `u-${Date.now()}`;
    units.push(unitData);
  } else {
    const idx = units.findIndex((u) => u.id === unitData.id);
    if (idx >= 0) units[idx] = { ...units[idx], ...unitData };
    else units.push(unitData);
  }
  res.json({ unit: unitData });
});

// Unit Delete
app.delete('/api/units/:id', (req, res) => {
  const { id } = req.params;
  units = units.filter((u) => u.id !== id);
  resources = resources.filter((r) => r.unitId !== id);
  res.json({ success: true });
});

// Unit Reorder
app.post('/api/units/reorder', (req, res) => {
  const { unitId, direction } = req.body;
  const unit = units.find((u) => u.id === unitId);
  if (!unit) return res.status(404).json({ error: 'Unit not found' });

  const courseUnits = units
    .filter((u) => u.courseId === unit.courseId)
    .sort((a, b) => a.order - b.order);
  const idx = courseUnits.findIndex((u) => u.id === unitId);

  if (direction === 'up' && idx > 0) {
    const prev = courseUnits[idx - 1];
    const tempOrder = prev.order;
    prev.order = unit.order;
    unit.order = tempOrder;
  } else if (direction === 'down' && idx < courseUnits.length - 1) {
    const next = courseUnits[idx + 1];
    const tempOrder = next.order;
    next.order = unit.order;
    unit.order = tempOrder;
  }

  res.json({ units });
});

// Resource Move to another Unit
app.post('/api/resources/:id/move', (req, res) => {
  const { id } = req.params;
  const { newUnitId } = req.body;
  const item = resources.find((r) => r.id === id);
  if (!item) return res.status(404).json({ error: 'Resource not found' });
  const unit = units.find((u) => u.id === newUnitId);
  if (!unit) return res.status(404).json({ error: 'Target unit not found' });
  item.unitId = newUnitId;
  item.courseId = unit.courseId;
  res.json({ resource: item });
});

// Resource Creation / Update
app.post('/api/resources', (req, res) => {
  const resData = req.body as ResourceItem;
  if (!resData.id) {
    resData.id = `r-${Date.now()}`;
    resData.createdAt = new Date().toISOString();
    resData.viewCount = 0;
    resources.unshift(resData);
  } else {
    const idx = resources.findIndex((r) => r.id === resData.id);
    if (idx >= 0) resources[idx] = { ...resources[idx], ...resData };
    else resources.unshift(resData);
  }
  res.json({ resource: resData });
});

// Delete Resource
app.delete('/api/resources/:id', (req, res) => {
  const { id } = req.params;
  resources = resources.filter((r) => r.id !== id);
  res.json({ success: true });
});

// Record resource view
app.post('/api/resources/:id/view', (req, res) => {
  const { id } = req.params;
  const item = resources.find((r) => r.id === id);
  if (item) {
    item.viewCount = (item.viewCount || 0) + 1;
    res.json({ viewCount: item.viewCount });
  } else {
    res.status(404).json({ error: 'Resource not found' });
  }
});

// Student submits Unlock Request
app.post('/api/unlock-requests', (req, res) => {
  const { resourceId, resourceTitle, courseId, courseName, userId, userName, username, reason } = req.body;

  const newReq: UnlockRequest = {
    id: `req-${Date.now()}`,
    resourceId,
    resourceTitle,
    courseId,
    courseName,
    userId,
    userName,
    username,
    reason: reason.trim(),
    requestedAt: new Date().toISOString(),
    status: 'pending',
  };

  unlockRequests.unshift(newReq);
  res.status(201).json({ request: newReq });
});

// Admin responds to Unlock Request
app.post('/api/unlock-requests/:id/respond', (req, res) => {
  const { id } = req.params;
  const { decision, adminNote } = req.body; // 'approve_permanent' | 'approve_temporary' | 'denied'

  const unlockReq = unlockRequests.find((r) => r.id === id);
  if (!unlockReq) return res.status(404).json({ error: 'Request not found' });

  unlockReq.status = decision;
  unlockReq.adminNote = adminNote || undefined;

  if (decision === 'approve_temporary') {
    // 24 hours pass
    const expires = new Date();
    expires.setHours(expires.getHours() + 24);
    unlockReq.temporaryExpiresAt = expires.toISOString();
  }

  // If approved, update resource allowed students if it's restricted
  if (decision === 'approve_permanent' || decision === 'approve_temporary') {
    const resource = resources.find((r) => r.id === unlockReq.resourceId);
    if (resource) {
      if (!resource.allowedStudentIds) resource.allowedStudentIds = [];
      if (!resource.allowedStudentIds.includes(unlockReq.userId)) {
        resource.allowedStudentIds.push(unlockReq.userId);
      }
    }
  }

  res.json({ request: unlockReq });
});

// Student Submissions
app.post('/api/submissions', (req, res) => {
  const subData = req.body as StudentSubmission;
  subData.id = `sub-${Date.now()}`;
  subData.submittedAt = new Date().toISOString();
  subData.status = 'pending';
  submissions.unshift(subData);
  res.status(201).json({ submission: subData });
});

// Admin reviews Student Submission
app.post('/api/submissions/:id/review', (req, res) => {
  const { id } = req.params;
  const { action, publishCourseId, publishUnitId } = req.body; // 'approve' | 'reject'

  const sub = submissions.find((s) => s.id === id);
  if (!sub) return res.status(404).json({ error: 'Submission not found' });

  sub.status = action === 'approve' ? 'approved' : 'rejected';

  if (action === 'approve') {
    // Convert to live resource
    const newResource: ResourceItem = {
      id: `r-${Date.now()}`,
      courseId: publishCourseId || sub.courseId,
      unitId: publishUnitId || sub.unitId,
      title: sub.title,
      description: sub.notes,
      url: sub.url,
      type: sub.type,
      category: sub.category,
      visibilityScope: 'all_enrolled',
      isCompletedHw: sub.category === 'completed_hw',
      createdAt: new Date().toISOString(),
      submittedBy: sub.studentName,
      viewCount: 0,
      tags: ['Student Submitted', sub.category],
    };
    resources.unshift(newResource);
  }

  res.json({ submission: sub });
});

// Note Requests
app.post('/api/notes-requests', (req, res) => {
  const noteData = req.body as NoteRequest;
  noteData.id = `note-${Date.now()}`;
  noteData.createdAt = new Date().toISOString();
  noteData.status = 'open';
  noteRequests.unshift(noteData);
  res.status(201).json({ noteRequest: noteData });
});

// Fulfill Note Request
app.post('/api/notes-requests/:id/fulfill', (req, res) => {
  const { id } = req.params;
  const { fulfilledBy, fulfilledUrl } = req.body;

  const noteReq = noteRequests.find((n) => n.id === id);
  if (!noteReq) return res.status(404).json({ error: 'Note request not found' });

  noteReq.status = 'fulfilled';
  noteReq.fulfilledBy = fulfilledBy;
  noteReq.fulfilledUrl = fulfilledUrl;

  res.json({ noteRequest: noteReq });
});

// --- Gemini AI Endpoints ---

// 1. Multi-turn AI Study Assistant Chatbot
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, courseContext, speedPreference, enableHighThinking, systemRole, userRole } = req.body;

    // Check if AI Tutor is enabled by admin
    if (!siteSettings.aiTutorEnabled && userRole !== 'admin') {
      return res.status(403).json({
        error: 'AI Tutor is currently deactivated for all accounts by the administrator.',
      });
    }

    // Model selection based on user instructions:
    // - gemini-3.1-pro-preview for particularly complex tasks & high thinking
    // - gemini-3.5-flash for general tasks
    // - gemini-3.1-flash-lite for tasks that should happen fast
    let selectedModel = 'gemini-3.5-flash';
    if (speedPreference === 'fast') {
      selectedModel = 'gemini-3.1-flash-lite';
    } else if (enableHighThinking || speedPreference === 'pro') {
      selectedModel = 'gemini-3.1-pro-preview';
    }

    const rolePrompt =
      systemRole === 'math_physics_coach'
        ? 'You are an elite STEM tutor who explains derivations step-by-step with formulas and clear intuitions.'
        : systemRole === 'essay_rubric_critic'
        ? 'You are a meticulous AP English essay advisor specializing in rhetorical analysis, thesis refinement, and rubric mastery.'
        : 'You are an encouraging, expert academic peer tutor for high school and college students.';

    const systemInstruction = `${rolePrompt}
You are embedded in "StudyVault", helping a student studying for their courses.
Current Course Context: ${courseContext || 'General Academics'}.
Guidelines:
1. Provide structured, accurate, and easy-to-digest study advice, step-by-step solutions, and memorization tips.
2. Use markdown formatting with bolding, lists, and clear headers.
3. If giving completed homework assistance, teach the underlying concept first before revealing final answers so the student truly understands.`;

    const config: any = {
      systemInstruction,
    };

    if (enableHighThinking && selectedModel === 'gemini-3.1-pro-preview') {
      config.thinkingConfig = { thinkingLevel: ThinkingLevel.HIGH };
      // Do not set maxOutputTokens when using thinkingLevel
    }

    // Format contents from messages
    const formattedContents = (messages || []).map((msg: any) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    // If empty, supply default
    if (formattedContents.length === 0) {
      formattedContents.push({ role: 'user', parts: [{ text: 'Hello!' }] });
    }

    let response;
    try {
      response = await ai.models.generateContent({
        model: selectedModel,
        contents: formattedContents,
        config,
      });
    } catch (primaryErr: any) {
      console.warn(`Primary model ${selectedModel} failed, falling back to gemini-3.8-flash:`, primaryErr?.message);
      // Graceful fallback to gemini-3.8-flash
      response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: formattedContents,
        config: {
          systemInstruction,
        },
      });
    }

    const responseText = response.text || 'I could not generate an answer at this moment.';
    res.json({
      text: responseText,
      modelUsed: selectedModel,
    });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    res.status(500).json({ error: error.message || 'Error processing AI chat response' });
  }
});

// 2. Homework / Study Notes Image Understanding (gemini-3.1-pro-preview)
app.post('/api/analyze-image', async (req, res) => {
  try {
    const { imageBase64, mimeType, prompt, courseContext, userRole } = req.body;

    // Check if AI Tutor is enabled by admin
    if (!siteSettings.aiTutorEnabled && userRole !== 'admin') {
      return res.status(403).json({
        error: 'AI Tutor is currently deactivated for all accounts by the administrator.',
      });
    }

    if (!imageBase64) {
      return res.status(400).json({ error: 'No image data provided' });
    }

    // Strip data prefix if passed
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');

    const imagePart = {
      inlineData: {
        mimeType: mimeType || 'image/jpeg',
        data: cleanBase64,
      },
    };

    const textPrompt = `${prompt || 'Analyze this homework problem or handwritten study notes. Break down the question, explain the key principles, and provide step-by-step guidance.'}
Course context: ${courseContext || 'General High School / College'}.`;

    let response;
    try {
      response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: {
          parts: [imagePart, { text: textPrompt }],
        },
        config: {
          systemInstruction: 'You are an expert visual STEM and humanities homework analyzer. Carefully transcribe equations, diagrams, and text, then explain step-by-step.',
        },
      });
    } catch (err: any) {
      console.warn('Pro vision model fallback to gemini-3.8-flash:', err?.message);
      response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: {
          parts: [imagePart, { text: textPrompt }],
        },
      });
    }

    res.json({
      analysis: response.text || 'Unable to analyze image.',
    });
  } catch (error: any) {
    console.error('Image analysis error:', error);
    res.status(500).json({ error: error.message || 'Failed to analyze homework image' });
  }
});

// Vite / Static setup
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static('dist'));
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`StudyVault full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
