import { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { KingdomScene } from './game/KingdomScene';
import { TOWERS, TowerType } from './game/types';
import { useGameStore } from './store';

const towerTypes = Object.keys(TOWERS) as TowerType[];

export function App() {
  const gameRef = useRef<KingdomScene | null>(null);
  const [meteorCd, setMeteorCd] = useState(0); const [reinforceCd, setReinforceCd] = useState(0);
  const { screen, gold, lives, wave, paused, speed, selectedTower, result, startGame, setGold, setLives, setWave, setPaused, setSpeed, selectTower, finish } = useGameStore();
  useEffect(() => {
    if (screen !== 'game') return;
    const scene = new KingdomScene(); gameRef.current = scene;
    const game = new Phaser.Game({ type: Phaser.AUTO, width: 960, height: 600, parent: 'game-canvas', scene: [], scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH } });
    game.scene.add('kingdom', scene, true, { sync: (data: { gold?: number; lives?: number; wave?: number; result?: 'victory' | 'defeat' }) => {
      if (data.gold !== undefined) setGold(data.gold); if (data.lives !== undefined) setLives(data.lives); if (data.wave !== undefined) setWave(data.wave); if (data.result) finish(data.result);
    }});
    return () => { game.destroy(true); gameRef.current = null; };
  }, [screen]);
  useEffect(() => { gameRef.current?.setPaused(paused); gameRef.current?.setSpeed(speed); }, [paused, speed]);
  const activate = (kind: 'meteor' | 'reinforce') => {
    if (kind === 'meteor' && meteorCd === 0) { gameRef.current?.meteor(); setMeteorCd(12); }
    if (kind === 'reinforce' && reinforceCd === 0) { gameRef.current?.reinforcements(); setReinforceCd(18); }
  };
  useEffect(() => { const id = window.setInterval(() => { setMeteorCd((v) => Math.max(0, v - 1)); setReinforceCd((v) => Math.max(0, v - 1)); }, 1000); return () => window.clearInterval(id); }, []);
  if (screen === 'menu') return <main className="menu"><div className="brand-mark">♜</div><p className="eyebrow">THE FOREST FRONTIER</p><h1>Kingdom <span>Defender</span></h1><p className="subtitle">王國守衛者</p><div className="menu-card"><p>樹海深處的黑暗正在甦醒。建造防禦塔、召集英雄，守住最後的城堡。</p><button className="primary" onClick={startGame}>開始守衛</button><small>原創美術 · 無需後端 · 進度自動保存</small></div></main>;
  if (screen === 'result') return <main className="menu result"><div className="brand-mark">{result === 'victory' ? '🏆' : '💔'}</div><p className="eyebrow">{result === 'victory' ? 'THE KINGDOM STANDS' : 'THE FOREST FALLS'}</p><h1>{result === 'victory' ? '勝利！' : '城堡失守'}</h1><p className="subtitle">你完成了 {wave} / 20 波</p><button className="primary" onClick={startGame}>再次挑戰</button></main>;
  return <main className="game-shell"><header className="topbar"><div><b>♜ KINGDOM DEFENDER</b><span className="map-name">樹海邊境</span></div><div className="stats"><span>❤️ {lives}</span><span>🪙 {gold}</span><span>⚔️ 波次 {wave}/20</span><button onClick={() => setPaused(!paused)}>{paused ? '▶ 繼續' : 'Ⅱ 暫停'}</button><button onClick={() => setSpeed(speed === 1 ? 2 : 1)}>{speed}x</button></div></header><section className="board"><div id="game-canvas" /><div className="hint">先點擊金色圓台，再選擇塔；點擊已建造的塔可選取</div></section><nav className="control-panel"><div className="tower-list">{towerTypes.map((type) => <button key={type} className={selectedTower === type ? 'tower active' : 'tower'} onClick={() => { selectTower(type); gameRef.current?.buildTower(type); }} disabled={gold < TOWERS[type].cost}><strong>{TOWERS[type].icon}</strong><span>{TOWERS[type].label}</span><small>🪙 {TOWERS[type].cost}</small></button>)}<button className="tower" onClick={() => gameRef.current?.upgradeSelected()}>⬆️ 升級<small>🪙 70+</small></button><button className="tower" onClick={() => gameRef.current?.sellSelected()}>💰 出售<small>返還 60%</small></button></div><div className="actions"><button className="skill" onClick={() => activate('meteor')} disabled={meteorCd > 0}>☄️ 流星火雨 <small>{meteorCd ? `${meteorCd}s` : 'READY'}</small></button><button className="skill" onClick={() => activate('reinforce')} disabled={reinforceCd > 0}>🪖 援軍召喚 <small>{reinforceCd ? `${reinforceCd}s` : 'READY'}</small></button><button className="next" onClick={() => gameRef.current?.callNextWave()}>提前召喚波次 →</button></div></nav></main>;
}
