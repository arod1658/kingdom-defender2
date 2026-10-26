import { create } from 'zustand';

interface GameStore {
  screen: 'menu' | 'game' | 'result';
  gold: number;
  lives: number;
  wave: number;
  paused: boolean;
  speed: 1 | 2;
  selectedTower: string | null;
  result: 'victory' | 'defeat' | null;
  bestWave: number;
  startGame: () => void;
  setScreen: (screen: GameStore['screen']) => void;
  setGold: (gold: number) => void;
  setLives: (lives: number) => void;
  setWave: (wave: number) => void;
  setPaused: (paused: boolean) => void;
  setSpeed: (speed: 1 | 2) => void;
  selectTower: (type: string | null) => void;
  finish: (result: 'victory' | 'defeat') => void;
}

const savedBestWave = Number(localStorage.getItem('kingdom-defender-best-wave') ?? 0);

export const useGameStore = create<GameStore>((set) => ({
  screen: 'menu', gold: 250, lives: 20, wave: 0, paused: false, speed: 1,
  selectedTower: null, result: null, bestWave: savedBestWave,
  startGame: () => set({ screen: 'game', gold: 250, lives: 20, wave: 0, paused: false, speed: 1, result: null }),
  setScreen: (screen) => set({ screen }),
  setGold: (gold) => set({ gold }),
  setLives: (lives) => set({ lives }),
  setWave: (wave) => set({ wave }),
  setPaused: (paused) => set({ paused }),
  setSpeed: (speed) => set({ speed }),
  selectTower: (selectedTower) => set({ selectedTower }),
  finish: (result) => set((state) => {
    const bestWave = Math.max(state.bestWave, state.wave);
    localStorage.setItem('kingdom-defender-best-wave', String(bestWave));
    localStorage.setItem('kingdom-defender-last-result', result);
    return { result, bestWave, screen: 'result', paused: true };
  }),
}));
