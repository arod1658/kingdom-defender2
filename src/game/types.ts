export type TowerType = 'archer' | 'mage' | 'cannon' | 'barracks';
export type EnemyType = 'goblin' | 'orc' | 'wolf' | 'knight' | 'demon' | 'boss';

export interface TowerStats {
  label: string;
  icon: string;
  cost: number;
  range: number;
  damage: number;
  cooldown: number;
  color: number;
}

export interface EnemyStats {
  label: string;
  icon: string;
  hp: number;
  speed: number;
  reward: number;
  color: number;
}

export const TOWERS: Record<TowerType, TowerStats> = {
  archer: { label: '弓箭塔', icon: '🏹', cost: 70, range: 145, damage: 18, cooldown: 850, color: 0x8dd35f },
  mage: { label: '法師塔', icon: '🔮', cost: 105, range: 130, damage: 34, cooldown: 1250, color: 0xb792ff },
  cannon: { label: '砲塔', icon: '💣', cost: 130, range: 115, damage: 65, cooldown: 1800, color: 0xff9b54 },
  barracks: { label: '兵營', icon: '🛡️', cost: 90, range: 75, damage: 12, cooldown: 1000, color: 0x52c7dd },
};

export const ENEMIES: Record<EnemyType, EnemyStats> = {
  goblin: { label: '哥布林', icon: '👺', hp: 55, speed: 0.045, reward: 12, color: 0x71c56b },
  orc: { label: '獸人', icon: '👹', hp: 135, speed: 0.028, reward: 22, color: 0xb86a4a },
  wolf: { label: '狼騎兵', icon: '🐺', hp: 90, speed: 0.07, reward: 18, color: 0x9ca6b7 },
  knight: { label: '裝甲騎士', icon: '🛡️', hp: 260, speed: 0.018, reward: 35, color: 0x9ea8bc },
  demon: { label: '飛行惡魔', icon: '👿', hp: 180, speed: 0.052, reward: 40, color: 0xd45f88 },
  boss: { label: '森林魔王', icon: '🐲', hp: 1800, speed: 0.012, reward: 250, color: 0xc65353 },
};
