import Phaser from 'phaser';
import { ENEMIES, TOWERS, EnemyType, TowerType } from './types';

type Sync = (data: { gold?: number; lives?: number; wave?: number; result?: 'victory' | 'defeat' }) => void;
interface EnemyUnit { body: Phaser.GameObjects.Container; hp: number; maxHp: number; type: EnemyType; progress: number; lastHit: number; }
interface TowerUnit { type: TowerType; level: number; x: number; y: number; body: Phaser.GameObjects.Container; lastShot: number; }

const PATH = [{ x: -30, y: 440 }, { x: 120, y: 440 }, { x: 210, y: 340 }, { x: 360, y: 340 }, { x: 455, y: 230 }, { x: 620, y: 230 }, { x: 730, y: 130 }, { x: 900, y: 130 }];
const SPOTS = [{ x: 145, y: 520 }, { x: 290, y: 430 }, { x: 390, y: 445 }, { x: 505, y: 320 }, { x: 625, y: 330 }, { x: 700, y: 245 }];

export class KingdomScene extends Phaser.Scene {
  private sync: Sync = () => undefined;
  private enemies: EnemyUnit[] = [];
  private towers: TowerUnit[] = [];
  private graphics!: Phaser.GameObjects.Graphics;
  private wave = 0;
  private gold = 250;
  private lives = 20;
  private spawnLeft = 0;
  private spawned = 0;
  private spawnTimer = 0;
  private waveBreak = 0;
  private gameSpeed = 1;
  private pausedByUser = false;
  private selectedSpot = -1;
  private selectedTowerIndex = -1;

  constructor() { super('kingdom'); }

  init(data: { sync: Sync }) { this.sync = data.sync; }

  create() {
    this.cameras.main.setBackgroundColor('#152c32');
    this.graphics = this.add.graphics();
    this.drawMap();
    this.add.text(18, 18, '樹海邊境', { fontFamily: 'Georgia', fontSize: '22px', color: '#f8d47a', fontStyle: 'bold' });
    this.add.text(18, 48, '守住王國，直到第 20 波！', { fontFamily: 'Arial', fontSize: '13px', color: '#b6d2c8' });
    this.startWave();
  }

  private drawMap() {
    this.graphics.clear();
    this.graphics.fillStyle(0x1b403d).fillRect(0, 0, 960, 600);
    for (let i = 0; i < 45; i++) {
      const x = (i * 137) % 950 + 8; const y = 85 + ((i * 83) % 490);
      this.graphics.fillStyle(i % 2 ? 0x285248 : 0x326255).fillCircle(x, y, 14 + (i % 3) * 4);
      this.graphics.fillStyle(0x173b38).fillRect(x - 3, y + 8, 6, 18);
    }
    this.graphics.lineStyle(48, 0x8c704d, 1).beginPath().moveTo(PATH[0].x, PATH[0].y);
    PATH.slice(1).forEach((p) => this.graphics.lineTo(p.x, p.y)); this.graphics.strokePath();
    this.graphics.lineStyle(35, 0xb29462, 1).beginPath().moveTo(PATH[0].x, PATH[0].y);
    PATH.slice(1).forEach((p) => this.graphics.lineTo(p.x, p.y)); this.graphics.strokePath();
    this.graphics.fillStyle(0x4c9a8b).fillRect(850, 80, 90, 100);
    this.add.text(862, 98, '🏰', { fontSize: '52px' });
    this.add.text(856, 154, '王國城堡', { fontSize: '12px', color: '#fff3c4' });
    SPOTS.forEach((s, i) => {
      this.graphics.fillStyle(0xd7b66b, 0.9).fillCircle(s.x, s.y, 23);
      this.graphics.lineStyle(3, 0xf9e4a8).strokeCircle(s.x, s.y, 23);
      const marker = this.add.text(s.x - 10, s.y - 13, '+', { fontSize: '26px', color: '#59472a' }).setName(`spot-${i}`);
      marker.setInteractive({ useHandCursor: true }).on('pointerdown', () => { this.selectedSpot = i; });
    });
  }

  update(time: number, delta: number) {
    if (this.pausedByUser) return;
    const dt = delta * this.gameSpeed;
    this.spawnTimer -= dt;
    if (this.spawnLeft > 0 && this.spawnTimer <= 0) { this.spawnEnemy(); this.spawnTimer = Math.max(260, 850 - this.wave * 20); }
    if (this.spawnLeft === 0 && this.enemies.length === 0) {
      if (this.wave >= 20) { this.sync({ result: 'victory' }); return; }
      this.waveBreak += dt;
      if (this.waveBreak > 3500) this.startWave();
    }
    this.enemies.forEach((enemy) => this.moveEnemy(enemy, dt));
    this.towers.forEach((tower) => this.fire(tower, time));
  }

  private startWave() {
    this.wave++; this.spawned = 0; this.spawnLeft = 5 + this.wave * 2; this.waveBreak = 0;
    this.sync({ wave: this.wave });
  }

  private chooseEnemy(): EnemyType {
    if (this.wave === 20 && this.spawnLeft === 1) return 'boss';
    const pool: EnemyType[] = ['goblin'];
    if (this.wave > 3) pool.push('orc'); if (this.wave > 6) pool.push('wolf');
    if (this.wave > 10) pool.push('knight'); if (this.wave > 14) pool.push('demon');
    return pool[this.spawned % pool.length];
  }

  private spawnEnemy() {
    this.spawnLeft--; this.spawned++;
    const type = this.chooseEnemy(); const stats = ENEMIES[type];
    const body = this.add.container(PATH[0].x, PATH[0].y);
    const aura = this.add.circle(0, 0, type === 'boss' ? 26 : 17, stats.color, 0.9);
    const icon = this.add.text(-15, -16, stats.icon, { fontSize: type === 'boss' ? '30px' : '23px' });
    const barBg = this.add.rectangle(0, -27, type === 'boss' ? 58 : 38, 5, 0x351e25);
    const bar = this.add.rectangle(0, -27, type === 'boss' ? 58 : 38, 5, 0x71e09b).setName('hp');
    body.add([aura, icon, barBg, bar]); body.setDepth(5);
    this.enemies.push({ body, hp: stats.hp * (1 + this.wave * 0.09), maxHp: stats.hp * (1 + this.wave * 0.09), type, progress: 0, lastHit: 0 });
  }

  private moveEnemy(enemy: EnemyUnit, dt: number) {
    const stats = ENEMIES[enemy.type]; enemy.progress += stats.speed * dt;
    const segment = Math.min(PATH.length - 2, Math.floor(enemy.progress / 100));
    const local = (enemy.progress % 100) / 100; const a = PATH[segment]; const b = PATH[segment + 1];
    enemy.body.setPosition(Phaser.Math.Linear(a.x, b.x, local), Phaser.Math.Linear(a.y, b.y, local));
    if (enemy.progress >= (PATH.length - 1) * 100) {
      enemy.body.destroy(); this.enemies = this.enemies.filter((e) => e !== enemy);
      this.lives--; this.sync({ lives: this.lives }); if (this.lives <= 0) this.sync({ result: 'defeat' });
    }
  }

  private fire(tower: TowerUnit, time: number) {
    const stats = TOWERS[tower.type]; const cooldown = stats.cooldown / (tower.level * 0.78);
    if (time - tower.lastShot < cooldown) return;
    const target = this.enemies.find((e) => Phaser.Math.Distance.Between(tower.x, tower.y, e.body.x, e.body.y) <= stats.range);
    if (!target) return;
    tower.lastShot = time; const damage = stats.damage * tower.level;
    this.add.line(0, 0, tower.x, tower.y, target.body.x, target.body.y, stats.color, 0.7).setLineWidth(4).setDepth(4);
    this.time.delayedCall(100, () => { const line = this.children.list[this.children.list.length - 1]; if (line && line instanceof Phaser.GameObjects.Line) line.destroy(); });
    target.hp -= damage; const bar = target.body.getByName('hp') as Phaser.GameObjects.Rectangle;
    bar.width = Math.max(2, 38 * target.hp / target.maxHp); bar.x = (38 - bar.width) / 2;
    if (target.hp <= 0) { target.body.destroy(); this.enemies = this.enemies.filter((e) => e !== target); this.gold += ENEMIES[target.type].reward; this.sync({ gold: this.gold }); }
  }

  buildTower(type: TowerType) {
    const index = this.selectedSpot; if (index < 0 || this.towers.some((t) => t.x === SPOTS[index].x) || this.gold < TOWERS[type].cost) return false;
    const { x, y } = SPOTS[index]; const stats = TOWERS[type]; const body = this.add.container(x, y).setDepth(6);
    body.add([this.add.circle(0, 0, 22, stats.color), this.add.text(-14, -15, stats.icon, { fontSize: '24px' })]);
    body.setInteractive(new Phaser.Geom.Circle(0, 0, 26), Phaser.Geom.Circle.Contains);
    const tower: TowerUnit = { type, level: 1, x, y, body, lastShot: 0 };
    body.on('pointerdown', () => { this.selectedTowerIndex = this.towers.indexOf(tower); this.sync({}); });
    this.towers.push(tower); this.gold -= stats.cost; this.sync({ gold: this.gold }); this.selectedSpot = -1;
    const marker = this.children.getByName(`spot-${index}`) as Phaser.GameObjects.Text | null;
    marker?.setVisible(false); return true;
  }

  selectSpot(index: number) { this.selectedSpot = index; }

  upgradeSelected() {
    const tower = this.towers[this.selectedTowerIndex]; if (!tower || tower.level >= 3 || this.gold < 70 * tower.level) return false;
    this.gold -= 70 * tower.level; tower.level++; tower.body.setScale(1 + tower.level * 0.12); this.sync({ gold: this.gold }); return true;
  }

  sellSelected() {
    const tower = this.towers[this.selectedTowerIndex]; if (!tower) return false;
    const index = SPOTS.findIndex((spot) => spot.x === tower.x && spot.y === tower.y);
    this.gold += Math.floor(TOWERS[tower.type].cost * tower.level * 0.6); tower.body.destroy(); this.towers.splice(this.selectedTowerIndex, 1);
    this.selectedTowerIndex = -1; this.selectedSpot = index;
    (this.children.getByName(`spot-${index}`) as Phaser.GameObjects.Text | null)?.setVisible(true);
    this.sync({ gold: this.gold }); return true;
  }

  setSpeed(speed: 1 | 2) { this.gameSpeed = speed; }
  setPaused(paused: boolean) { this.pausedByUser = paused; }
  callNextWave() { if (this.spawnLeft === 0 && this.enemies.length === 0) this.startWave(); }
  meteor() { this.enemies.slice().forEach((e) => { if (e.body.x > 150) { e.hp -= 150; if (e.hp <= 0) { e.body.destroy(); this.enemies = this.enemies.filter((x) => x !== e); this.gold += ENEMIES[e.type].reward; } } }); this.sync({ gold: this.gold }); }
  reinforcements() { for (let i = 0; i < 3; i++) { const e = this.enemies[i]; if (e) e.hp -= 80; } }
}
