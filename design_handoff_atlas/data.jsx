/* global React */
// Mock data for Atlas prototype

const DATA = {
  user: {
    name: "Sofia Chen",
    email: "sofia.chen@email.com",
    avatar: null,
    color: "#2747E0",
  },
  teacher: {
    name: "Prof. Marcus Vale",
    email: "m.vale@atlas.edu",
    color: "#5C3A1E",
  },
  courses: [
    { id: 1, title: "English B2 — Conversational Fluency", glyph: "E", tag: "English · B2", lessonsTotal: 24, lessonsDone: 14, progress: 58, instructor: "Lena Ortega", nextLesson: "Lesson 15 · Conditionals in real talk", due: "Tomorrow", category: "Languages" },
    { id: 2, title: "Spanish Foundations — A2", glyph: "ñ", tag: "Spanish · A2", lessonsTotal: 32, lessonsDone: 8, progress: 25, instructor: "Diego Marín", nextLesson: "Lesson 9 · Ser vs Estar in context", due: "Fri", category: "Languages" },
    { id: 3, title: "IELTS Writing Intensive", glyph: "✎", tag: "Test Prep", lessonsTotal: 12, lessonsDone: 11, progress: 91, instructor: "Prof. Marcus Vale", nextLesson: "Final Mock Essay Review", due: "Today", category: "Test Prep" },
    { id: 4, title: "Public Speaking & Storytelling", glyph: "S", tag: "Soft Skills", lessonsTotal: 8, lessonsDone: 3, progress: 38, instructor: "Robin Park", nextLesson: "Lesson 4 · The 3-act narrative arc", due: "Next week", category: "Soft Skills" },
    { id: 5, title: "Beginner Japanese — Hiragana", glyph: "あ", tag: "Japanese · A1", lessonsTotal: 20, lessonsDone: 0, progress: 0, instructor: "Aiko Tanaka", nextLesson: "Lesson 1 · The vowel row", due: "Not started", category: "Languages" },
  ],

  // Lesson list for course #1
  modules: [
    { id: "m1", title: "Module 1 · Confident Greetings", lessons: [
      { id: "l1", n: 1, title: "Tone, pacing, and first impressions", duration: "12:40", done: true },
      { id: "l2", n: 2, title: "Small talk that doesn't feel small", duration: "14:05", done: true },
      { id: "l3", n: 3, title: "Cultural cues across Englishes", duration: "09:55", done: true, hasQuiz: true },
    ]},
    { id: "m2", title: "Module 2 · Sounds & Stress", lessons: [
      { id: "l4", n: 4, title: "Linking sounds in spoken English", duration: "11:20", done: true },
      { id: "l5", n: 5, title: "Word stress vs sentence stress", duration: "13:30", done: true },
      { id: "l6", n: 6, title: "Reduced forms: gonna, wanna, gotta", duration: "10:15", done: true, hasQuiz: true },
    ]},
    { id: "m3", title: "Module 3 · Conditionals in Real Talk", lessons: [
      { id: "l13", n: 13, title: "Zero & first conditionals", duration: "15:10", done: true },
      { id: "l14", n: 14, title: "Second conditional & hypotheticals", duration: "16:42", done: true },
      { id: "l15", n: 15, title: "Mixed conditionals & nuance", duration: "18:05", current: true },
      { id: "l16", n: 16, title: "Conditional practice quiz", duration: "10 questions", quiz: true },
    ]},
    { id: "m4", title: "Module 4 · Idioms & Register", lessons: [
      { id: "l17", n: 17, title: "Formal vs informal register", duration: "12:00", locked: true },
      { id: "l18", n: 18, title: "Idioms that natives actually use", duration: "14:30", locked: true },
    ]},
  ],

  // Chapters within current video lesson
  chapters: [
    { id: "c1", n: 1, title: "Why mixed conditionals trip people up", time: "00:00", t: 0, done: true },
    { id: "c2", n: 2, title: "Pattern 1 — Past condition, present result", time: "02:14", t: 134, done: true },
    { id: "c3", n: 3, title: "Pattern 2 — Present condition, past result", time: "06:48", t: 408, current: true },
    { id: "c4", n: 4, title: "Native examples in dialogue", time: "10:22", t: 622 },
    { id: "c5", n: 5, title: "Common mistakes to avoid", time: "13:55", t: 835 },
    { id: "c6", n: 6, title: "Try it — guided practice", time: "16:10", t: 970 },
  ],

  // Transcript snippet
  transcript: [
    { t: "06:48", speaker: "Lena", text: "So if you grasp this one pattern, you'll suddenly hear it everywhere. It's the same trick native speakers use to layer time without breaking grammar." },
    { t: "07:02", speaker: "Lena", text: "Let's say I'm broke today. Why? Because of a choice I made last year. Now watch — \"If I hadn't quit my job, I'd be saving every month.\"" },
    { t: "07:18", speaker: "Lena", text: "Past condition, present result. The structure splits time. That's the move." },
    { t: "07:34", speaker: "Lena", text: "Try this one with me. Past regret, current reality. Take 10 seconds, write yours, then we'll compare." },
  ],

  // Discussion in lesson
  discussion: [
    { id: "d1", who: "Amir K.", color: "#D97757", time: "2h ago", text: "The split-time idea finally clicked. Mind if I share two examples to check?", replies: 3 },
    { id: "d2", who: "Yuna P.", color: "#15706A", time: "1d ago", text: "Question on pattern 2 — does this work with future regret too, or strictly past result?", replies: 5 },
    { id: "d3", who: "Lena (Instructor)", color: "#2747E0", time: "1d ago", text: "Great question Yuna — short answer: with futures we usually shift to ‘would have' forms. I'll cover this in the next lesson.", replies: 0, instructor: true },
  ],

  // Quiz - questions for "Lesson 15 quiz"
  quiz: {
    title: "Mixed Conditionals · Practice Quiz",
    course: "English B2",
    minutes: 10,
    questions: [
      { id: "q1", type: "mcq", prompt: "Which sentence is a correctly-formed mixed conditional?",
        options: [
          { id: "a", text: "If I had studied harder, I will pass the exam." },
          { id: "b", text: "If I had studied harder, I would be passing the exam now." },
          { id: "c", text: "If I would study harder, I had passed the exam." },
          { id: "d", text: "If I studied harder, I had passed the exam." },
        ], answer: "b" },
      { id: "q2", type: "tf", prompt: "Mixed conditionals always combine a past condition with a present result.",
        answer: false, note: "They can also combine a present condition with a past result." },
      { id: "q3", type: "fib", prompt: "Complete: \"If she ___ (take) that job last year, she ___ (live) in Lisbon right now.\"",
        blanks: ["had taken", "would be living"] },
      { id: "q4", type: "short", prompt: "In your own words, when would you choose a mixed conditional over a regular second or third conditional?",
        rubric: "Look for: separation of past cause vs present effect; nuance/contrast in time." },
      { id: "q5", type: "match", prompt: "Match each clause with the best continuation.",
        pairs: [
          { l: "If I hadn't moved abroad,", r: "I wouldn't be fluent today." },
          { l: "If you were more patient,", r: "you would have caught the mistake earlier." },
          { l: "If he had taken the bus,", r: "he would be here by now." },
        ]},
    ],
  },

  // Exam metadata
  exam: {
    title: "End-of-Term Comprehensive Exam — English B2",
    duration: 90, // minutes
    questions: 28,
    pointsTotal: 100,
  },

  // Student roster (teacher view)
  roster: [
    { id: "s1", name: "Sofia Chen",     courses: 3, attendance: 94, avgScore: 88, status: "on-track",   last: "Today",      flagged: false, color: "#2747E0" },
    { id: "s2", name: "Amir Khoury",    courses: 2, attendance: 76, avgScore: 71, status: "at-risk",    last: "3 days ago", flagged: true,  color: "#D97757" },
    { id: "s3", name: "Yuna Park",      courses: 4, attendance: 98, avgScore: 92, status: "excelling",  last: "Today",      flagged: false, color: "#15706A" },
    { id: "s4", name: "Diego Martín",   courses: 1, attendance: 88, avgScore: 79, status: "on-track",   last: "Yesterday",  flagged: false, color: "#5C3A1E" },
    { id: "s5", name: "Priya Raman",    courses: 2, attendance: 65, avgScore: 58, status: "at-risk",    last: "1 week ago", flagged: true,  color: "#6B2E84" },
    { id: "s6", name: "Tomás Silva",    courses: 3, attendance: 90, avgScore: 84, status: "on-track",   last: "2 days ago", flagged: false, color: "#0F4C8A" },
    { id: "s7", name: "Hannah Liu",     courses: 1, attendance: 100, avgScore: 96, status: "excelling", last: "Today",      flagged: false, color: "#15706A" },
    { id: "s8", name: "Felix Brandt",   courses: 2, attendance: 82, avgScore: 74, status: "on-track",   last: "Yesterday",  flagged: false, color: "#B47A00" },
  ],

  // Grading queue
  gradingQueue: [
    { id: "g1", student: "Amir Khoury", color: "#D97757", course: "English B2", item: "Mixed Conditionals Quiz", type: "Quiz", submitted: "2h ago", needsReview: 2, autoScore: 6, total: 10 },
    { id: "g2", student: "Yuna Park",   color: "#15706A", course: "IELTS Writing Intensive", item: "Mock Essay 3 — Climate", type: "Exam", submitted: "5h ago", needsReview: 1, autoScore: null, total: 40 },
    { id: "g3", student: "Sofia Chen",  color: "#2747E0", course: "English B2", item: "Mid-term Exam", type: "Exam", submitted: "1d ago", needsReview: 3, autoScore: 56, total: 80 },
    { id: "g4", student: "Priya Raman", color: "#6B2E84", course: "Spanish A2",  item: "Ser vs Estar Quiz", type: "Quiz", submitted: "1d ago", needsReview: 0, autoScore: 7, total: 10 },
    { id: "g5", student: "Tomás Silva", color: "#0F4C8A", course: "English B2", item: "Conditionals Quiz", type: "Quiz", submitted: "2d ago", needsReview: 1, autoScore: 8, total: 10 },
  ],

  // Live classes
  live: {
    // The session that is happening right now
    liveNow: {
      id: "lc-now", title: "Mixed Conditionals — Live Workshop", course: "English B2",
      instructor: "Lena Ortega", startedAgo: "12 min ago", attending: 14, capacity: 20,
      thumb: "grad-1",
    },
    upcoming: [
      { id: "lc1", title: "Mixed Conditionals — Live Workshop", course: "English B2", instructor: "Lena Ortega", when: "Now", date: "Live", duration: "60 min", attending: 14, capacity: 20, status: "live", thumb: "grad-1" },
      { id: "lc2", title: "IELTS Writing — Task 2 Clinic", course: "IELTS Writing Intensive", instructor: "Prof. Marcus Vale", when: "Today · 13:30", date: "Today", duration: "90 min", attending: 0, capacity: 25, rsvp: 18, status: "soon", thumb: "grad-3" },
      { id: "lc3", title: "Ser vs Estar — Q&A Session", course: "Spanish A2", instructor: "Diego Marín", when: "Tomorrow · 10:00", date: "Wed 20", duration: "45 min", attending: 0, capacity: 30, rsvp: 9, status: "scheduled", thumb: "grad-2" },
      { id: "lc4", title: "Storytelling Arc — Group Practice", course: "Public Speaking", instructor: "Robin Park", when: "Fri · 16:00", date: "Fri 22", duration: "60 min", attending: 0, capacity: 15, rsvp: 6, status: "scheduled", thumb: "grad-4" },
    ],
    recordings: [
      { id: "rec1", title: "Second Conditional — Deep Dive", course: "English B2", instructor: "Lena Ortega", date: "May 14", duration: "58:24", views: 38, thumb: "grad-1", hasWhiteboard: true, hasChat: true },
      { id: "rec2", title: "Linking Sounds — Live Practice", course: "English B2", instructor: "Lena Ortega", date: "May 9", duration: "47:10", views: 41, thumb: "grad-5", hasWhiteboard: true, hasChat: true },
      { id: "rec3", title: "IELTS Essay Structures Workshop", course: "IELTS Writing Intensive", instructor: "Prof. Marcus Vale", date: "May 7", duration: "1:24:08", views: 52, thumb: "grad-3", hasWhiteboard: true, hasChat: false },
      { id: "rec4", title: "Hiragana — Vowel Row Walkthrough", course: "Beginner Japanese", instructor: "Aiko Tanaka", date: "May 3", duration: "39:55", views: 27, thumb: "grad-6", hasWhiteboard: true, hasChat: true },
    ],
    // Participants in the live room
    participants: [
      { id: "p0", name: "Lena Ortega", role: "host", color: "#2747E0", cam: true, mic: true, hand: false, sharing: false },
      { id: "p1", name: "Sofia Chen", role: "student", color: "#2747E0", cam: true, mic: false, hand: true, sharing: false },
      { id: "p2", name: "Amir Khoury", role: "student", color: "#D97757", cam: true, mic: false, hand: false, sharing: false },
      { id: "p3", name: "Yuna Park", role: "student", color: "#15706A", cam: false, mic: false, hand: false, sharing: false },
      { id: "p4", name: "Diego Martín", role: "student", color: "#5C3A1E", cam: true, mic: false, hand: false, sharing: false },
      { id: "p5", name: "Priya Raman", role: "student", color: "#6B2E84", cam: false, mic: true, hand: false, sharing: false },
      { id: "p6", name: "Tomás Silva", role: "student", color: "#0F4C8A", cam: true, mic: false, hand: false, sharing: false },
      { id: "p7", name: "Hannah Liu", role: "student", color: "#B47A00", cam: true, mic: false, hand: true, sharing: false },
    ],
    chat: [
      { id: "c1", who: "Lena Ortega", role: "host", color: "#2747E0", time: "00:02", text: "Welcome everyone! We'll start with a quick recap, then jump to the whiteboard." },
      { id: "c2", who: "Amir Khoury", role: "student", color: "#D97757", time: "03:14", text: "Can you re-explain pattern 2? Got lost last time 😅" },
      { id: "c3", who: "Yuna Park", role: "student", color: "#15706A", time: "03:40", text: "+1 to that" },
      { id: "c4", who: "Lena Ortega", role: "host", color: "#2747E0", time: "04:05", text: "Absolutely — drawing it out now. Watch the timeline split." },
      { id: "c5", who: "Hannah Liu", role: "student", color: "#B47A00", time: "06:22", text: "Ohh the timeline visual really helps. Thank you!" },
    ],
  },
};

window.DATA = DATA;
