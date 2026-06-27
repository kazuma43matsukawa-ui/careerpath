export interface Qualification {
  id: string;
  name: string;
  category: 'language' | 'it' | 'finance' | 'medical' | 'legal' | 'real_estate' | 'hr' | 'creative' | 'food' | 'beauty' | 'education' | 'civil' | 'business' | 'startup';
  totalHours: number;
  color: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  description?: string;
}

export interface Career {
  id: string;
  title: string;
  description: string;
  qualificationIds: string[];
  emoji: string;
  category: string;
}

export interface StudySession {
  id: string;
  qualificationId: string;
  date: string;
  minutes: number;
  memo?: string;
  mode?: 'timer' | 'manual' | 'pomodoro';
}

export interface WeeklyCommitment {
  weekStart: string;
  targetHours: number;
  actualMinutes: number;
}

export interface UserGoal {
  qualificationId: string;
  careerId?: string;
  startDate: string;
  targetDate?: string;
  loggedMinutes: number;
}

export interface Badge {
  id: string;
  name: string;
  emoji: string;
  description: string;
  unlockedAt?: string;
}

export interface AppState {
  goals: UserGoal[];
  sessions: StudySession[];
  weeklyCommitments: WeeklyCommitment[];
  activeTimerGoalId: string | null;
  timerStartedAt: number | null;
  pomodoroCount: number;
  unlockedBadges: string[];
}
