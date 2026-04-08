import type { AchievementDef, Profile, Session } from "@/types";
import { getDayKey, isToday } from "./utils";

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    key: "first_pomodoro",
    title: "First Blood",
    description: "Complete your very first Pomodoro",
    icon: "🍅",
    xpReward: 100,
    condition: (profile) => profile.pomodoros_completed >= 1,
  },
  {
    key: "five_in_day",
    title: "On Fire",
    description: "Complete 5 Pomodoros in a single day",
    icon: "🔥",
    xpReward: 200,
    condition: (_, sessions) => {
      const today = getDayKey();
      const todayCount = sessions.filter(
        (s) => s.completed && s.started_at.split("T")[0] === today
      ).length;
      return todayCount >= 5;
    },
  },
  {
    key: "ten_total",
    title: "Getting Serious",
    description: "Complete 10 total Pomodoros",
    icon: "⚡",
    xpReward: 150,
    condition: (profile) => profile.pomodoros_completed >= 10,
  },
  {
    key: "fifty_total",
    title: "Warrior",
    description: "Complete 50 total Pomodoros",
    icon: "⚔️",
    xpReward: 500,
    condition: (profile) => profile.pomodoros_completed >= 50,
  },
  {
    key: "first_game",
    title: "Earned It",
    description: "Earn your first Dota game",
    icon: "🎮",
    xpReward: 150,
    condition: (profile) => profile.dota_games_earned >= 1,
  },
  {
    key: "three_day_streak",
    title: "Consistent",
    description: "Maintain a 3-day streak",
    icon: "🌟",
    xpReward: 200,
    condition: (profile) => profile.current_streak >= 3,
  },
  {
    key: "seven_day_streak",
    title: "Week Warrior",
    description: "Maintain a 7-day streak",
    icon: "💫",
    xpReward: 500,
    condition: (profile) => profile.current_streak >= 7,
  },
  {
    key: "night_owl",
    title: "Night Owl",
    description: "Complete a Pomodoro after 10 PM",
    icon: "🦉",
    xpReward: 75,
    condition: (_, sessions) => {
      return sessions.some((s) => {
        if (!s.completed) return false;
        const hour = new Date(s.started_at).getHours();
        return hour >= 22;
      });
    },
  },
  {
    key: "early_bird",
    title: "Early Bird",
    description: "Complete a Pomodoro before 7 AM",
    icon: "🌅",
    xpReward: 100,
    condition: (_, sessions) => {
      return sessions.some((s) => {
        if (!s.completed) return false;
        const hour = new Date(s.started_at).getHours();
        return hour < 7;
      });
    },
  },
  {
    key: "gym_rat",
    title: "Gym Rat",
    description: "Complete 5 Gym Pomodoros",
    icon: "🏋️",
    xpReward: 200,
    condition: (_, sessions) => {
      const gymCount = sessions.filter((s) => s.completed && s.label === "Gym").length;
      return gymCount >= 5;
    },
  },
  {
    key: "deep_worker",
    title: "Flow State",
    description: "Complete 10 Deep Work Pomodoros",
    icon: "🎯",
    xpReward: 300,
    condition: (_, sessions) => {
      const count = sessions.filter((s) => s.completed && s.label === "Deep Work").length;
      return count >= 10;
    },
  },
  {
    key: "five_games",
    title: "Game Night",
    description: "Earn 5 Dota games",
    icon: "🏆",
    xpReward: 300,
    condition: (profile) => profile.dota_games_earned >= 5,
  },
];

export function checkNewAchievements(
  profile: Profile,
  sessions: Session[],
  earnedKeys: string[]
): AchievementDef[] {
  return ACHIEVEMENTS.filter(
    (ach) => !earnedKeys.includes(ach.key) && ach.condition(profile, sessions)
  );
}

export function calculateStreak(sessions: Session[]): number {
  const completedDays = new Set(
    sessions
      .filter((s) => s.completed)
      .map((s) => s.started_at.split("T")[0])
  );

  if (completedDays.size === 0) return 0;

  const today = getDayKey();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = getDayKey(yesterday);

  // Streak must include today or yesterday
  if (!completedDays.has(today) && !completedDays.has(yesterdayKey)) return 0;

  let streak = 0;
  const startDay = completedDays.has(today) ? 0 : 1;

  for (let i = startDay; i < 365; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = getDayKey(d);
    if (completedDays.has(key)) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export function getLevelTitle(level: number): string {
  const titles = [
    "Rookie",       // 1
    "Apprentice",   // 2
    "Adept",        // 3
    "Journeyman",   // 4
    "Skilled",      // 5
    "Expert",       // 6
    "Master",       // 7
    "Grandmaster",  // 8
    "Legend",       // 9
    "Ancient",      // 10+
  ];
  return titles[Math.min(level - 1, titles.length - 1)];
}

export function getStreakMessage(streak: number): string {
  if (streak === 0) return "Start your streak today!";
  if (streak === 1) return "1 day streak — keep going!";
  if (streak < 3) return `${streak} days — building momentum!`;
  if (streak < 7) return `${streak} days — you're on fire! 🔥`;
  if (streak < 14) return `${streak} days — incredible!`;
  if (streak < 30) return `${streak} days — legendary! ⚡`;
  return `${streak} days — IMMORTAL! 🏆`;
}

export function getTodaySessionCount(sessions: Session[]): number {
  return sessions.filter((s) => s.completed && isToday(s.started_at)).length;
}

export function getPomodorosUntilNextGame(pomodorosCompleted: number): number {
  const POMODOROS_PER_GAME = 2;
  return POMODOROS_PER_GAME - (pomodorosCompleted % POMODOROS_PER_GAME);
}
