import { create } from 'zustand';

export const useAuthStore = create((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ loading }),
  clear: () => set({ user: null, profile: null }),
  // Computed
  isPremium: () => get().profile?.is_premium === true,
}));

// Trail lesson exam store (separate from full exam)
export const useTrailExamStore = create((set, get) => ({
  topic: null,
  questions: [],
  currentIndex: 0,
  answers: {},
  startTime: null,
  questionStartTime: null,
  status: 'idle', // idle | active | finished
  result: null,
  isPremium: false,

  start: (topic, questions, isPremium) =>
    set({
      topic,
      questions,
      isPremium,
      currentIndex: 0,
      answers: {},
      startTime: Date.now(),
      questionStartTime: Date.now(),
      status: 'active',
      result: null,
    }),

  answer: (questionId, selected, isCorrect) => {
    const { answers } = get();
    set({
      answers: { ...answers, [questionId]: { selected, isCorrect } },
      questionStartTime: Date.now(),
    });
  },

  next: () => {
    const { currentIndex, questions } = get();
    if (currentIndex < questions.length - 1)
      set({ currentIndex: currentIndex + 1, questionStartTime: Date.now() });
  },

  prev: () => {
    const { currentIndex } = get();
    if (currentIndex > 0) set({ currentIndex: currentIndex - 1 });
  },

  finish: () => {
    const { answers, questions } = get();
    const correct = Object.values(answers).filter((a) => a.isCorrect).length;
    const score = Math.round((correct / questions.length) * 100);
    set({ status: 'finished', result: { correct, total: questions.length, score } });
  },

  reset: () =>
    set({
      topic: null, questions: [], currentIndex: 0,
      answers: {}, startTime: null, questionStartTime: null,
      status: 'idle', result: null, isPremium: false,
    }),
}));

export const useExamStore = create((set, get) => ({
  // Session
  sessionId: null,
  questions: [],
  currentIndex: 0,
  answers: {}, // { questionId: { selected, isCorrect, timeSpent } }
  startTime: null,
  questionStartTime: null,
  status: 'idle', // idle | active | reviewing | finished

  // Result
  result: null,

  // Actions
  startExam: (questions, sessionId) =>
    set({
      questions,
      sessionId,
      currentIndex: 0,
      answers: {},
      startTime: Date.now(),
      questionStartTime: Date.now(),
      status: 'active',
      result: null,
    }),

  answerQuestion: (questionId, selected, isCorrect) => {
    const { questionStartTime, answers } = get();
    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
    set({
      answers: { ...answers, [questionId]: { selected, isCorrect, timeSpent } },
      questionStartTime: Date.now(),
    });
  },

  nextQuestion: () => {
    const { currentIndex, questions } = get();
    if (currentIndex < questions.length - 1) {
      set({ currentIndex: currentIndex + 1, questionStartTime: Date.now() });
    }
  },

  prevQuestion: () => {
    const { currentIndex } = get();
    if (currentIndex > 0) {
      set({ currentIndex: currentIndex - 1 });
    }
  },

  finishExam: (result) => set({ status: 'finished', result }),

  setStatus: (status) => set({ status }),

  reset: () =>
    set({
      sessionId: null,
      questions: [],
      currentIndex: 0,
      answers: {},
      startTime: null,
      questionStartTime: null,
      status: 'idle',
      result: null,
    }),

  // Computed
  getScore: () => {
    const { answers } = get();
    const vals = Object.values(answers);
    if (!vals.length) return 0;
    const correct = vals.filter((a) => a.isCorrect).length;
    return Math.round((correct / vals.length) * 100);
  },

  getElapsedSeconds: () => {
    const { startTime } = get();
    return startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
  },
}));
