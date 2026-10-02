import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
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

// Seed Data definition for starter or template loading
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
];

const initialUnits: Unit[] = [
  {
    id: 'u-chem-1',
    courseId: 'c-chem',
    unitNumber: 1,
    title: 'Unit 1: Atomic Structure & Intermolecular Forces',
    description: 'Electron configurations, periodic trends, Coulombic attractions, and dipole attractions.',
    status: 'unlocked',
    order: 1,
  },
  {
    id: 'u-chem-2',
    courseId: 'c-chem',
    unitNumber: 2,
    title: 'Unit 2: Chemical Kinetics & Rate Laws',
    description: 'Differential rate laws, integrated rate laws, half-life mechanics, and reaction mechanisms.',
    status: 'unlocked',
    isActiveSpotlight: true,
    order: 2,
  },
  {
    id: 'u-chem-3',
    courseId: 'c-chem',
    unitNumber: 3,
    title: 'Unit 3: Chemical Equilibrium & Le Chatelier',
    description: 'Equilibrium expressions (Kc, Kp), reaction quotient Q vs K, and solubility equilibrium.',
    status: 'locked',
    unlockAt: '2026-10-02T16:00:00.000Z',
    order: 3,
  },
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
    title: 'Unit 2: Infinite Series & Power Series',
    description: 'Geometric series, p-series, ratio/root tests, Taylor & Maclaurin polynomials with Lagrange error bound.',
    status: 'unlocked',
    isActiveSpotlight: true,
    order: 2,
  },
  {
    id: 'u-lit-1',
    courseId: 'c-lit',
    unitNumber: 1,
    title: 'Unit 1: Short Fiction & Character Complexities',
    description: 'Point of view, unreliable narrators, epiphany moments, and figurative characterization.',
    status: 'unlocked',
    order: 1,
  },
  {
    id: 'u-lit-2',
    courseId: 'c-lit',
    unitNumber: 2,
    title: 'Unit 2: The Jazz Age & Rhetorical Modernism',
    description: 'Analysis of The Great Gatsby, color symbolism, Valley of Ashes motifs, and consumerism critiques.',
    status: 'unlocked',
    isActiveSpotlight: true,
    order: 2,
  },
  {
    id: 'u-csa-1',
    courseId: 'c-csa',
    unitNumber: 1,
    title: 'Unit 1: Class Design, Inheritance & Polymorphism',
    description: 'Superclasses, subclasses, overriding methods, object reference hierarchies, and abstract classes.',
    status: 'unlocked',
    order: 1,
  },
  {
    id: 'u-csa-2',
    courseId: 'c-csa',
    unitNumber: 2,
    title: 'Unit 2: Recursion & 2D Arrays',
    description: 'Base cases, recursive call stacks, row-major and column-major traversals, and maze search algorithms.',
    status: 'unlocked',
    isActiveSpotlight: true,
    order: 2,
  },
];

const initialResources: ResourceItem[] = [
  {
    id: 'r-chem-1',
    courseId: 'c-chem',
    unitId: 'u-chem-2',
    title: 'Kinetics Problem Set 4: Multi-Step Reaction Mechanisms (Full HW Key)',
    description: 'Includes full step-by-step intermediate cancellations, rate-determining step rate law derivations, and catalyst identification.',
    url: 'https://docs.google.com/document/d/1studyvault-chem-kinetics-hw4-key',
    type: 'doc',
    category: 'completed_hw',
    visibilityScope: 'all_enrolled',
    isCompletedHw: true,
    createdAt: '2026-09-29T14:30:00.000Z',
    submittedBy: 'Liam Nystrom',
    viewCount: 42,
    tags: ['Answer Key', 'Step-by-Step', 'Reaction Mechanisms'],
    previewSnippet: 'Step 1: NO + O2 <-> NO3 (fast). Step 2: NO3 + NO -> 2 NO2 (slow RDS). Overall Rate = k[NO]^2[O2].',
  },
  {
    id: 'r-chem-2',
    courseId: 'c-chem',
    unitId: 'u-chem-2',
    title: 'Integrated Rate Laws & Half-Life Cheat Sheet (0th, 1st, 2nd Order)',
    description: 'Summary table with linear plots: [A] vs t, ln[A] vs t, 1/[A] vs t, units of rate constant k, and graphical tips.',
    url: 'https://quizlet.com/join/studyvault-chem-rate-laws',
    type: 'quizlet',
    category: 'formula_sheet',
    visibilityScope: 'all_enrolled',
    isCompletedHw: false,
    createdAt: '2026-09-30T10:15:00.000Z',
    submittedBy: 'Liam Nystrom',
    viewCount: 78,
    tags: ['Kinetics', 'Formula Sheet', 'Quizlet Flashcards'],
    previewSnippet: 'First-order: ln[A]t = -kt + ln[A]0, t_1/2 = 0.693/k. Second-order: 1/[A]t = kt + 1/[A]0.',
  },
  {
    id: 'r-chem-3',
    courseId: 'c-chem',
    unitId: 'u-chem-2',
    title: 'Crystal Violet Colorimetry Lab: Raw Data & Beer-Lambert Calibration Curve',
    description: 'Raw absorbance readings at 590nm, path length b=1.0 cm, spectrophotometer calibration curve, and pseudo-first-order rate graphs.',
    url: 'https://docs.google.com/spreadsheets/d/1studyvault-chem-beer-lambert-lab',
    type: 'sheets',
    category: 'lab_report',
    visibilityScope: 'restricted_students',
    allowedStudentIds: ['u-alex', 'u-maya'],
    isCompletedHw: true,
    createdAt: '2026-09-27T18:00:00.000Z',
    submittedBy: 'Liam Nystrom',
    viewCount: 19,
    tags: ['Lab Report', 'Raw Data', 'Spectroscopy'],
    previewSnippet: 'Beer-Lambert law: A = epsilon * b * c. Molar absorptivity of crystal violet at 590 nm calculated to be 8.4 x 10^4 M^-1 cm^-1.',
  },
  {
    id: 'r-calc-1',
    courseId: 'c-calc',
    unitId: 'u-calc-2',
    title: 'Taylor & Maclaurin Polynomials HW 3 Solution Key with Lagrange Error Bounds',
    description: 'Complete calculations showing third and fourth-degree Taylor expansions around x=a, with maximum remainder bounds on intervals.',
    url: 'https://docs.google.com/document/d/1studyvault-calc-taylor-series-key',
    type: 'doc',
    category: 'completed_hw',
    visibilityScope: 'all_enrolled',
    isCompletedHw: true,
    createdAt: '2026-09-29T16:00:00.000Z',
    submittedBy: 'Liam Nystrom',
    viewCount: 53,
    tags: ['Answer Key', 'Taylor Series', 'Error Bound'],
    previewSnippet: 'Lagrange Error: |R_n(x)| <= [M / (n+1)!] * |x - c|^(n+1) where M is the maximum of |f^(n+1)(z)|.',
  },
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
    viewCount: 34,
    tags: ['Java', 'Recursion', 'Backtracking'],
    previewSnippet: 'if (maze[r][c] == GOAL) return true; maze[r][c] = VISITED; if (solve(r+1,c) || solve(r-1,c)...',
  },
];

const initialUsers: User[] = [
  {
    id: 'u-admin',
    name: 'Vault Administrator',
    username: 'admin',
    role: 'admin',
    status: 'approved',
    enrolledCourseIds: ['c-chem', 'c-calc', 'c-lit', 'c-csa'],
    email: 'admin@studyvault.internal',
    joinedAt: '2026-08-15T08:00:00.000Z',
    notes: 'Vault Owner & Administrator',
    aiTutorEnabled: true,
  },
  {
    id: 'u-alex',
    name: 'Alex Rivera',
    username: 'alex',
    role: 'student',
    status: 'approved',
    enrolledCourseIds: ['c-chem', 'c-calc'],
    email: 'alex.rivera@highschool.edu',
    joinedAt: '2026-09-01T10:00:00.000Z',
    lastLogin: '2026-10-01T19:30:00.000Z',
    aiTutorEnabled: false, // Default deactivated per user
  },
  {
    id: 'u-maya',
    name: 'Maya Patel',
    username: 'maya',
    role: 'student',
    status: 'approved',
    enrolledCourseIds: ['c-chem', 'c-csa'],
    email: 'maya.patel@highschool.edu',
    joinedAt: '2026-09-02T11:15:00.000Z',
    lastLogin: '2026-10-01T20:10:00.000Z',
    aiTutorEnabled: false, // Default deactivated per user
  },
  {
    id: 'u-liam-student',
    name: 'Liam S.',
    username: 'liams',
    role: 'student',
    status: 'approved',
    enrolledCourseIds: ['c-chem', 'c-lit'],
    email: 'liam.s@highschool.edu',
    joinedAt: '2026-09-10T09:00:00.000Z',
    aiTutorEnabled: false,
  },
  {
    id: 'u-jordan-pending',
    name: 'Jordan Hayes',
    username: 'jordanh',
    role: 'student',
    status: 'pending',
    enrolledCourseIds: [],
    requestedCourses: ['c-chem', 'c-lit'],
    joinedAt: '2026-10-01T16:30:00.000Z',
    notes: 'Period 1 Lit classmate',
    aiTutorEnabled: false,
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

const initialUserPasswords: Record<string, string> = {
  'u-admin': 'vaultadmin',
  'u-alex': 'alex123',
  'u-maya': 'maya123',
  'u-liam-student': 'liams123',
};

const initialSiteSettings: SiteSettings = {
  maintenanceMode: {
    enabled: false,
    countdownTarget: new Date(Date.now() + 3600 * 1000 * 2).toISOString(), // 2 hours
    message: 'StudyVault is undergoing scheduled unit restructuring and updates. Back soon!',
  },
  aiTutorEnabled: false, // Deactivated by default for all accounts
};

const initialPopups: AdminPopup[] = [
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

// File-backed Persistence Path
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'studyvault-db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-Memory Data Store variables
let courses: Course[] = [];
let units: Unit[] = [];
let resources: ResourceItem[] = [];
let users: User[] = [];
let unlockRequests: UnlockRequest[] = [];
let submissions: StudentSubmission[] = [];
let noteRequests: NoteRequest[] = [];
let userPasswords: Record<string, string> = {};
let siteSettings: SiteSettings = { ...initialSiteSettings };
let popups: AdminPopup[] = [];

// Helper to save current database state to disk
function saveDb() {
  try {
    const dbPayload = {
      courses,
      units,
      resources,
      users,
      unlockRequests,
      submissions,
      noteRequests,
      userPasswords,
      siteSettings,
      popups,
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(dbPayload, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write studyvault-db.json:', err);
  }
}

// Helper to load or initialize database
function loadDb() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const data = JSON.parse(raw);
      courses = data.courses || [];
      units = data.units || [];
      resources = data.resources || [];
      users = data.users || [];
      unlockRequests = data.unlockRequests || [];
      submissions = data.submissions || [];
      noteRequests = data.noteRequests || [];
      userPasswords = data.userPasswords || {};
      siteSettings = data.siteSettings || initialSiteSettings;
      popups = data.popups || [];

      // Make sure admin always exists
      if (!users.some((u) => u.role === 'admin')) {
        users.unshift(initialUsers[0]);
        userPasswords[initialUsers[0].id] = 'vaultadmin';
      }
      console.log(`StudyVault DB loaded from ${DB_FILE} with ${courses.length} courses, ${users.length} users.`);
    } else {
      // First boot: populate with initial seed data and save to file
      courses = [...initialCourses];
      units = [...initialUnits];
      resources = [...initialResources];
      users = [...initialUsers];
      unlockRequests = [...initialUnlockRequests];
      submissions = [...initialSubmissions];
      noteRequests = [...initialNoteRequests];
      userPasswords = { ...initialUserPasswords };
      siteSettings = { ...initialSiteSettings };
      popups = [...initialPopups];
      saveDb();
      console.log(`Created new StudyVault DB at ${DB_FILE}.`);
    }
  } catch (err) {
    console.error('Error loading DB, initializing defaults:', err);
    courses = [...initialCourses];
    units = [...initialUnits];
    resources = [...initialResources];
    users = [...initialUsers];
    unlockRequests = [...initialUnlockRequests];
    submissions = [...initialSubmissions];
    noteRequests = [...initialNoteRequests];
    userPasswords = { ...initialUserPasswords };
    siteSettings = { ...initialSiteSettings };
    popups = [...initialPopups];
    saveDb();
  }
}

// Load DB on server launch
loadDb();

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
  saveDb();

  res.json({
    user,
    message: `Welcome back, ${user.name}!`,
  });
});

// Logout endpoint
app.post('/api/auth/logout', (_req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
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
    aiTutorEnabled: false, // Always deactivated by default for new students!
  };

  users.push(newUser);
  userPasswords[newUser.id] = password || 'study123';
  saveDb();

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
  saveDb();

  res.json({ user: targetUser, message: `${targetUser.name} has been approved.` });
});

// Admin denies pending account
app.post('/api/admin/users/:id/reject-request', (req, res) => {
  const { id } = req.params;
  users = users.filter((u) => u.id !== id);
  delete userPasswords[id];
  saveDb();
  res.json({ success: true, message: 'Request removed.' });
});

// Admin updates user course matrix
app.post('/api/admin/users/:id/update-courses', (req, res) => {
  const { id } = req.params;
  const { courseIds } = req.body;

  const targetUser = users.find((u) => u.id === id);
  if (!targetUser) return res.status(404).json({ error: 'User not found' });

  targetUser.enrolledCourseIds = courseIds || [];
  saveDb();
  res.json({ user: targetUser });
});

// Admin toggle user suspend/active
app.post('/api/admin/users/:id/toggle-status', (req, res) => {
  const { id } = req.params;
  const targetUser = users.find((u) => u.id === id);
  if (!targetUser) return res.status(404).json({ error: 'User not found' });

  targetUser.status = targetUser.status === 'approved' ? 'suspended' : 'approved';
  saveDb();
  res.json({ user: targetUser });
});

// Admin toggle user AI tutor access (per user!)
app.post('/api/admin/users/:id/toggle-ai', (req, res) => {
  const { id } = req.params;
  const targetUser = users.find((u) => u.id === id);
  if (!targetUser) return res.status(404).json({ error: 'User not found' });

  targetUser.aiTutorEnabled = !targetUser.aiTutorEnabled;
  saveDb();
  res.json({ user: targetUser, message: `AI Tutor access for ${targetUser.name} set to ${targetUser.aiTutorEnabled ? 'Enabled' : 'Disabled'}` });
});

// Admin toggle AI tutor access for ALL students
app.post('/api/admin/users/toggle-ai-all', (req, res) => {
  const { enabled } = req.body;
  users.forEach((u) => {
    if (u.role !== 'admin') {
      u.aiTutorEnabled = !!enabled;
    }
  });
  siteSettings.aiTutorEnabled = !!enabled;
  saveDb();
  res.json({ users, aiTutorEnabled: siteSettings.aiTutorEnabled });
});

// Admin reset user password
app.post('/api/admin/users/:id/reset-password', (req, res) => {
  const { id } = req.params;
  const { temporaryPassword } = req.body;

  const targetUser = users.find((u) => u.id === id);
  if (!targetUser) return res.status(404).json({ error: 'User not found' });

  targetUser.temporaryPassword = temporaryPassword || 'study123';
  userPasswords[targetUser.id] = targetUser.temporaryPassword || 'study123';
  saveDb();

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
  saveDb();
  res.json({ siteSettings });
});

// Admin Popups / Announcements
app.post('/api/admin/popups', (req, res) => {
  const popupData = req.body as AdminPopup;
  popupData.id = `pop-${Date.now()}`;
  popupData.createdAt = new Date().toISOString();
  popupData.active = true;
  popups.unshift(popupData);
  saveDb();
  res.status(201).json({ popup: popupData });
});

app.post('/api/admin/popups/:id/toggle', (req, res) => {
  const { id } = req.params;
  const p = popups.find((x) => x.id === id);
  if (!p) return res.status(404).json({ error: 'Popup not found' });
  p.active = !p.active;
  saveDb();
  res.json({ popup: p });
});

app.delete('/api/admin/popups/:id', (req, res) => {
  const { id } = req.params;
  popups = popups.filter((x) => x.id !== id);
  saveDb();
  res.json({ success: true });
});

// Clean Slate: Wipe sample items and start fresh with empty vault (Admin only keeps account)
app.post('/api/admin/clean-slate', (_req, res) => {
  courses = [];
  units = [];
  resources = [];
  unlockRequests = [];
  submissions = [];
  noteRequests = [];
  popups = [];
  // Keep only admin user
  users = users.filter((u) => u.role === 'admin');
  if (users.length === 0) {
    users = [initialUsers[0]];
    userPasswords[initialUsers[0].id] = 'vaultadmin';
  }
  saveDb();
  res.json({
    success: true,
    message: 'Vault cleared to a clean slate. You can now create your real courses and add real materials.',
    courses,
    units,
    resources,
    users,
  });
});

// Reset to Sample Template Demo Data
app.post('/api/admin/reset-demo', (_req, res) => {
  courses = [...initialCourses];
  units = [...initialUnits];
  resources = [...initialResources];
  users = [...initialUsers];
  unlockRequests = [...initialUnlockRequests];
  submissions = [...initialSubmissions];
  noteRequests = [...initialNoteRequests];
  userPasswords = { ...initialUserPasswords };
  siteSettings = { ...initialSiteSettings };
  popups = [...initialPopups];
  saveDb();
  res.json({
    success: true,
    message: 'Reset vault to starter demo template.',
    courses,
    units,
    resources,
    users,
  });
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
  saveDb();
  res.json({ course: courseData });
});

// Course Delete (also cleans up associated units and resources)
app.delete('/api/courses/:id', (req, res) => {
  const { id } = req.params;
  courses = courses.filter((c) => c.id !== id);
  units = units.filter((u) => u.courseId !== id);
  resources = resources.filter((r) => r.courseId !== id);
  users.forEach((u) => {
    u.enrolledCourseIds = u.enrolledCourseIds.filter((cid) => cid !== id);
  });
  saveDb();
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
  saveDb();
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
  saveDb();
  res.json({ unit: unitData });
});

// Unit Delete
app.delete('/api/units/:id', (req, res) => {
  const { id } = req.params;
  units = units.filter((u) => u.id !== id);
  resources = resources.filter((r) => r.unitId !== id);
  saveDb();
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

  saveDb();
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
  saveDb();
  res.json({ resource: item });
});

// Resource Quick Visibility Switch
app.post('/api/resources/:id/visibility', (req, res) => {
  const { id } = req.params;
  const { visibilityScope, allowedStudentIds, scheduledUnlockAt, autoLockAt } = req.body;
  const item = resources.find((r) => r.id === id);
  if (!item) return res.status(404).json({ error: 'Resource not found' });

  if (visibilityScope) item.visibilityScope = visibilityScope;
  if (allowedStudentIds !== undefined) item.allowedStudentIds = allowedStudentIds;
  if (scheduledUnlockAt !== undefined) item.scheduledUnlockAt = scheduledUnlockAt;
  if (autoLockAt !== undefined) item.autoLockAt = autoLockAt;

  saveDb();
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
  saveDb();
  res.json({ resource: resData });
});

// Delete Resource
app.delete('/api/resources/:id', (req, res) => {
  const { id } = req.params;
  resources = resources.filter((r) => r.id !== id);
  saveDb();
  res.json({ success: true });
});

// Record resource view
app.post('/api/resources/:id/view', (req, res) => {
  const { id } = req.params;
  const item = resources.find((r) => r.id === id);
  if (item) {
    item.viewCount = (item.viewCount || 0) + 1;
    saveDb();
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
  saveDb();
  res.status(201).json({ request: newReq });
});

// Admin responds to Unlock Request
app.post('/api/unlock-requests/:id/respond', (req, res) => {
  const { id } = req.params;
  const { decision, adminNote } = req.body;

  const unlockReq = unlockRequests.find((r) => r.id === id);
  if (!unlockReq) return res.status(404).json({ error: 'Request not found' });

  unlockReq.status = decision;
  unlockReq.adminNote = adminNote || undefined;

  if (decision === 'approve_temporary') {
    const expires = new Date();
    expires.setHours(expires.getHours() + 24);
    unlockReq.temporaryExpiresAt = expires.toISOString();
  }

  if (decision === 'approve_permanent' || decision === 'approve_temporary') {
    const resource = resources.find((r) => r.id === unlockReq.resourceId);
    if (resource) {
      if (!resource.allowedStudentIds) resource.allowedStudentIds = [];
      if (!resource.allowedStudentIds.includes(unlockReq.userId)) {
        resource.allowedStudentIds.push(unlockReq.userId);
      }
    }
  }

  saveDb();
  res.json({ request: unlockReq });
});

// Student Submissions
app.post('/api/submissions', (req, res) => {
  const subData = req.body as StudentSubmission;
  subData.id = `sub-${Date.now()}`;
  subData.submittedAt = new Date().toISOString();
  subData.status = 'pending';
  submissions.unshift(subData);
  saveDb();
  res.status(201).json({ submission: subData });
});

// Admin reviews Student Submission
app.post('/api/submissions/:id/review', (req, res) => {
  const { id } = req.params;
  const { action, publishCourseId, publishUnitId } = req.body;

  const sub = submissions.find((s) => s.id === id);
  if (!sub) return res.status(404).json({ error: 'Submission not found' });

  sub.status = action === 'approve' ? 'approved' : 'rejected';

  if (action === 'approve') {
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

  saveDb();
  res.json({ submission: sub });
});

// Note Requests
app.post('/api/notes-requests', (req, res) => {
  const noteData = req.body as NoteRequest;
  noteData.id = `note-${Date.now()}`;
  noteData.createdAt = new Date().toISOString();
  noteData.status = 'open';
  noteRequests.unshift(noteData);
  saveDb();
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

  saveDb();
  res.json({ noteRequest: noteReq });
});

// --- Gemini AI Endpoints ---

// 1. Multi-turn AI Study Assistant Chatbot
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, courseContext, speedPreference, enableHighThinking, systemRole, userId, userRole } = req.body;

    // Check if AI Tutor is enabled per user (admin always allowed)
    if (userRole !== 'admin') {
      const callingUser = users.find((u) => u.id === userId);
      const isAllowed = callingUser?.aiTutorEnabled || false;
      if (!isAllowed) {
        return res.status(403).json({
          error: 'AI Tutor is deactivated for your account. Please ask the administrator to enable it.',
        });
      }
    }

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
    }

    const formattedContents = (messages || []).map((msg: any) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

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

// 2. Homework / Study Notes Image Understanding
app.post('/api/analyze-image', async (req, res) => {
  try {
    const { imageBase64, mimeType, prompt, courseContext, userId, userRole } = req.body;

    if (userRole !== 'admin') {
      const callingUser = users.find((u) => u.id === userId);
      const isAllowed = callingUser?.aiTutorEnabled || false;
      if (!isAllowed) {
        return res.status(403).json({
          error: 'AI Tutor is deactivated for your account. Please ask the administrator to enable it.',
        });
      }
    }

    if (!imageBase64) {
      return res.status(400).json({ error: 'No image data provided' });
    }

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
