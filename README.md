# Kingdom Defender — 王國守衛者

一款以 React、TypeScript、Vite、Phaser 3、Tailwind CSS 與 Zustand 製作的原創 2D 奇幻塔防遊戲。遊戲內圖像使用 Emoji、Phaser 幾何圖形與 CSS 自製，不使用未授權素材。

## 安裝與啟動

需求：Node.js 18+、npm。

```bash
npm install
npm run dev
```

開啟終端機顯示的 localhost 網址即可遊玩。正式建置：

```bash
npm run build
npm run preview
```

## 操作方式

- 點擊地圖上的金色圓台，再點擊下方的塔型按鈕建塔。
- 弓箭塔、法師塔、砲塔與兵營有不同射程、傷害與攻速。
- 點擊已建造的塔可選取；升級與出售可在後續版本擴充。
- 可使用流星火雨與援軍召喚，兩者都有獨立冷卻時間。
- 支援暫停、1x/2x 遊戲速度與提前召喚下一波。
- 敵人通過城堡會扣除生命，完成 20 波即可勝利。

## 架構

- `src/game/types.ts`：塔與敵人的資料驅動定義，增加內容時只需擴充型別與資料。
- `src/game/KingdomScene.ts`：Phaser 地圖、路徑、敵人、塔攻擊、波次與技能。
- `src/store.ts`：Zustand 的 UI 與遊戲狀態。
- `src/App.tsx`：React 主選單、HUD 與行動控制。
- `vercel.json`：Vercel SPA fallback 與建置設定。

## 上傳 GitHub

在專案根目錄執行（將 URL 換成自己的 Repository）：

```bash
git init
git add .
git commit -m "feat: create kingdom defender game"
git branch -M main
git remote add origin https://github.com/<YOUR_NAME>/kingdom-defender.git
git push -u origin main
```

## 部署到 Vercel

1. 在 GitHub 建立空白 Repository 並依上方指令推送。
2. 登入 [Vercel](https://vercel.com/)，選擇 **Add New Project**。
3. Import `kingdom-defender` Repository，Framework Preset 選 **Vite**。
4. Build Command 使用 `npm run build`，Output Directory 使用 `dist`。
5. 按下 **Deploy**。專案內的 `vercel.json` 已設定 SPA rewrite，重新整理任何頁面都能正常回到遊戲。
