export interface Todo {
  id: number;
  text: string;
  duration: number;
  timeRemaining: number;
  lastPaused: number | null;
  userName?: string;
  completed?: boolean;
}

export interface UserData {
  todos: Todo[];
  xp: number;      // 獲得済みXP
  level: number;   // 現在のレベル
}
