import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, StudySession, UserGoal, WeeklyCommitment } from '../types';
import { BADGES } from '../data/masterData';

const STORAGE_KEY = 'careerpath_state';

const getMonday = (date: Date): string => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().split('T')[0];
};

const today = (): string => new Date().toISOString().split('T')[0];

const defaultState = (): AppState => ({
  goals: [],
  sessions: [],
  weeklyCommitments: [],
  activeTimerGoalId: null,
  timerStartedAt: null,
  pomodoroCount: 0,
  unlockedBadges: [],
});

export function useAppState() {
  const [state, setState] = useState<AppState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...defaultState(), ...JSON.parse(saved) } : defaultState();
    } catch {
      return defaultState();
    }
  });

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    if (state.activeTimerGoalId && state.timerStartedAt) {
      intervalRef.current = setInterval(() => {
        setElapsedSeconds(Math.floor((Date.now() - state.timerStartedAt!) / 1000));
      }, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [state.activeTimerGoalId, state.timerStartedAt]);

  // バッジチェック
  const checkBadges = useCallback((newState: AppState): string[] => {
    const unlocked = [...newState.unlockedBadges];
    const totalMins = newState.sessions.reduce((s, sess) => s + sess.minutes, 0);
    const totalHours = totalMins / 60;
    const studyDates = new Set(newState.sessions.map(s => s.date));

    // 連続日数
    let streak = 0;
    const cur = new Date();
    while (true) {
      const d = cur.toISOString().split('T')[0];
      if (studyDates.has(d)) { streak++; cur.setDate(cur.getDate() - 1); }
      else break;
    }

    const checks: [string, boolean][] = [
      ['first_study', newState.sessions.length >= 1],
      ['streak_3', streak >= 3],
      ['streak_7', streak >= 7],
      ['streak_30', streak >= 30],
      ['total_10h', totalHours >= 10],
      ['total_50h', totalHours >= 50],
      ['total_100h', totalHours >= 100],
      ['pomodoro_10', newState.pomodoroCount >= 10],
      ['multi_goal', newState.goals.length >= 3],
    ];

    checks.forEach(([id, met]) => {
      if (met && !unlocked.includes(id)) unlocked.push(id);
    });

    return unlocked;
  }, []);

  const addGoal = useCallback((goal: Omit<UserGoal, 'loggedMinutes'>) => {
    setState(s => {
      if (s.goals.find(g => g.qualificationId === goal.qualificationId)) return s;
      const newState = { ...s, goals: [...s.goals, { ...goal, loggedMinutes: 0 }] };
      return { ...newState, unlockedBadges: checkBadges(newState) };
    });
  }, [checkBadges]);

  const removeGoal = useCallback((qualificationId: string) => {
    setState(s => ({ ...s, goals: s.goals.filter(g => g.qualificationId !== qualificationId) }));
  }, []);

  const startTimer = useCallback((qualificationId: string) => {
    setState(s => ({ ...s, activeTimerGoalId: qualificationId, timerStartedAt: Date.now() }));
  }, []);

  const stopTimer = useCallback((memo?: string) => {
    setState(s => {
      if (!s.activeTimerGoalId || !s.timerStartedAt) return s;
      const minutes = Math.floor((Date.now() - s.timerStartedAt) / 60000);
      if (minutes < 1) return { ...s, activeTimerGoalId: null, timerStartedAt: null };

      const session: StudySession = {
        id: Date.now().toString(),
        qualificationId: s.activeTimerGoalId,
        date: today(),
        minutes,
        memo,
        mode: 'timer',
      };

      const weekStart = getMonday(new Date());
      const existingCommit = s.weeklyCommitments.find(c => c.weekStart === weekStart);
      const updatedCommits = existingCommit
        ? s.weeklyCommitments.map(c => c.weekStart === weekStart ? { ...c, actualMinutes: c.actualMinutes + minutes } : c)
        : [...s.weeklyCommitments, { weekStart, targetHours: 10, actualMinutes: minutes }];

      const newState = {
        ...s,
        sessions: [...s.sessions, session],
        goals: s.goals.map(g => g.qualificationId === s.activeTimerGoalId ? { ...g, loggedMinutes: g.loggedMinutes + minutes } : g),
        weeklyCommitments: updatedCommits,
        activeTimerGoalId: null,
        timerStartedAt: null,
      };
      return { ...newState, unlockedBadges: checkBadges(newState) };
    });
  }, [checkBadges]);

  // 手動記録
  const addManualSession = useCallback((qualificationId: string, minutes: number, date: string, memo?: string) => {
    setState(s => {
      const session: StudySession = { id: Date.now().toString(), qualificationId, date, minutes, memo, mode: 'manual' };
      const weekStart = getMonday(new Date(date));
      const existingCommit = s.weeklyCommitments.find(c => c.weekStart === weekStart);
      const updatedCommits = existingCommit
        ? s.weeklyCommitments.map(c => c.weekStart === weekStart ? { ...c, actualMinutes: c.actualMinutes + minutes } : c)
        : [...s.weeklyCommitments, { weekStart, targetHours: 10, actualMinutes: minutes }];

      const newState = {
        ...s,
        sessions: [...s.sessions, session],
        goals: s.goals.map(g => g.qualificationId === qualificationId ? { ...g, loggedMinutes: g.loggedMinutes + minutes } : g),
        weeklyCommitments: updatedCommits,
      };
      return { ...newState, unlockedBadges: checkBadges(newState) };
    });
  }, [checkBadges]);

  // ポモドーロ完了
  const completePomodoro = useCallback((qualificationId: string) => {
    setState(s => {
      const minutes = 25;
      const session: StudySession = { id: Date.now().toString(), qualificationId, date: today(), minutes, mode: 'pomodoro' };
      const weekStart = getMonday(new Date());
      const existingCommit = s.weeklyCommitments.find(c => c.weekStart === weekStart);
      const updatedCommits = existingCommit
        ? s.weeklyCommitments.map(c => c.weekStart === weekStart ? { ...c, actualMinutes: c.actualMinutes + minutes } : c)
        : [...s.weeklyCommitments, { weekStart, targetHours: 10, actualMinutes: minutes }];

      const newState = {
        ...s,
        sessions: [...s.sessions, session],
        goals: s.goals.map(g => g.qualificationId === qualificationId ? { ...g, loggedMinutes: g.loggedMinutes + minutes } : g),
        weeklyCommitments: updatedCommits,
        pomodoroCount: s.pomodoroCount + 1,
      };
      return { ...newState, unlockedBadges: checkBadges(newState) };
    });
  }, [checkBadges]);

  const setWeeklyTarget = useCallback((targetHours: number) => {
    const weekStart = getMonday(new Date());
    setState(s => {
      const existing = s.weeklyCommitments.find(c => c.weekStart === weekStart);
      if (existing) {
        return { ...s, weeklyCommitments: s.weeklyCommitments.map(c => c.weekStart === weekStart ? { ...c, targetHours } : c) };
      }
      return { ...s, weeklyCommitments: [...s.weeklyCommitments, { weekStart, targetHours, actualMinutes: 0 }] };
    });
  }, []);

  const currentWeekCommit = (() => {
    const weekStart = getMonday(new Date());
    return state.weeklyCommitments.find(c => c.weekStart === weekStart) || null;
  })();

  const getStudyDates = useCallback(() => new Set(state.sessions.map(s => s.date)), [state.sessions]);

  const getStreak = useCallback(() => {
    const dates = new Set(state.sessions.map(s => s.date));
    let streak = 0;
    const cur = new Date();
    while (true) {
      const d = cur.toISOString().split('T')[0];
      if (dates.has(d)) { streak++; cur.setDate(cur.getDate() - 1); }
      else break;
    }
    return streak;
  }, [state.sessions]);

  const unlockedBadgeObjects = BADGES.filter(b => state.unlockedBadges.includes(b.id));

  return {
    state, elapsedSeconds,
    addGoal, removeGoal,
    startTimer, stopTimer,
    addManualSession, completePomodoro,
    setWeeklyTarget, currentWeekCommit,
    getStudyDates, getStreak,
    unlockedBadgeObjects,
  };
}
