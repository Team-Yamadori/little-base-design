# ゲームロジック仕様書

> `hooks/use-game.ts` / `lib/game-state.ts` / `components/scoreboard/runner-resolution.tsx` の全ロジックを記述

---

## 1. データ構造

### 1.1 GameState（試合全体の状態）

```ts
interface GameState {
  home: TeamData;        // ホームチームデータ
  away: TeamData;        // アウェイチームデータ
  inning: number;        // 現在のイニング (1〜9)
  isTop: boolean;        // true=表（アウェイ攻撃）, false=裏（ホーム攻撃）
  balls: number;         // 現在のボールカウント (0〜3)
  strikes: number;       // 現在のストライクカウント (0〜2)
  outs: number;          // 現在のアウトカウント (0〜2)
  bases: [boolean, boolean, boolean]; // [1塁, 2塁, 3塁] の走者有無
  currentBatter: PlayerData;   // 現在の打者
  currentPitcher: PlayerData;  // 現在の投手
  isPlaying: boolean;    // 試合進行中か
  isGameOver: boolean;   // 試合終了か
}
```

### 1.2 TeamData（チームデータ）

```ts
interface TeamData {
  name: string;                  // チーム名
  shortName: string;             // 略称
  scores: (number | null)[];     // イニングごとの得点（null=未プレー）
  runs: number;                  // 総得点
  hits: number;                  // 総安打数
  errors: number;                // 総失策数
  color: string;                 // チームカラー
}
```

### 1.3 PendingPlay（走者選択の中間状態）

```ts
interface PendingPlay {
  actionLabel: string;           // プレー名（例: "ゴロ 5→3"）
  slots: RunnerSlot[];           // 各走者の行き先スロット
  isHit: boolean;                // 安打か
  isError: boolean;              // エラーか
  preserveCount?: boolean;       // trueの場合、カウントをリセットしない（走塁系イベント）
  hitDirection?: HitDirection;   // 打球方向（安打時のみ）
  fieldingNumbers?: number[];    // 守備番号列（アウト系のみ）
  requiresOut?: boolean;         // trueの場合、最低1つアウトがないと確定不可
}
```

### 1.4 RunnerSlot（走者1人分の行き先）

```ts
interface RunnerSlot {
  from: "batter" | "1B" | "2B" | "3B";  // 元の位置
  label: string;                          // 表示名（例: "1塁走者"）
  destination: Destination;               // 現在選択中の行き先
  options: Destination[];                 // 選択可能な行き先一覧
}

type Destination = "out" | "1B" | "2B" | "3B" | "home" | "stay";
```

### 1.5 その他の型

```ts
type HitDirection = "投" | "捕" | "一" | "二" | "三" | "遊" | "左" | "中" | "右";
type StrikeoutType = "swinging" | "looking";

interface PendingFielding {
  action: ComplexAction;     // アクション種別
  actionLabel: string;       // 表示名
  numbers: number[];         // 入力中の守備番号列
}

interface HistoryEntry {
  state: GameState;          // その時点のGameState
  batterIndex: number;       // その時点の打順インデックス
  label: string;             // 操作ラベル（undo時の表示用）
}
```

---

## 2. アクション分類

### 2.1 SimpleAction（即時処理、走者選択なし）

| アクション | 説明 |
|---|---|
| `ball` | ボール。4球目で四球 |
| `strike` | ストライク。3球目で三振判定へ |
| `foul` | ファウル。2ストライク未満ならストライク加算 |
| `homerun` | ホームラン（打球方向選択後に即時処理） |
| `triple` | 三塁打（打球方向選択後に即時処理） |
| `hit-by-pitch` | 死球。強制進塁 |
| `walk` | 四球（ボタン押下版）。強制進塁 |
| `intentional-walk` | 敬遠。強制進塁 |
| `reset` | 試合リセット |

### 2.2 ComplexAction（走者選択画面を経由）

| アクション | ラベル | requiresOut | preserveCount | isHit | isError |
|---|---|---|---|---|---|
| `single` | シングルヒット | - | - | true | - |
| `double` | 二塁打 | - | - | true | - |
| `groundout` | ゴロ | true | - | - | - |
| `flyout` | フライ | true | - | - | - |
| `lineout` | ライナー | true | - | - | - |
| `sacrifice-fly` | 犠飛 | true | - | - | - |
| `sacrifice-bunt` | 犠打 | true | - | - | - |
| `fielders-choice` | フィールダーズチョイス | - | - | - | - |
| `stolen-base` | 盗塁 | - | true | - | - |
| `caught-stealing` | 盗塁失敗 | true | true | - | - |
| `wild-pitch` | 暴投 | - | true | - | - |
| `passed-ball` | 捕逸 | - | true | - | - |
| `balk` | ボーク | - | true | - | - |
| `runner-out` | 走塁アウト | true | true | - | - |
| `error` | エラー | - | - | - | true |
| `dropped-third-strike` | 振り逃げ | - | - | - | - |
| `catcher-interference` | 打撃妨害 | - | - | - | - |
| `obstruction` | 走塁妨害 | - | true | - | - |
| `offensive-interference` | 守備妨害 | true | true | - | - |

---

## 3. 操作フロー

### 3.1 投球系（ball / strike / foul）

```
handleAction("ball")
  → balls + 1
  → balls >= 4 の場合:
      → showMessage("フォアボール!")
      → forceAdvance() で走者を押し出し進塁
      → カウントリセット、次の打者へ

handleAction("strike")
  → strikes >= 2 の場合:
      → strikeoutPending = true（三振種別選択画面を表示）
      → resolveStrikeout("swinging" | "looking") で確定
        → outs + 1
        → カウントリセット、次の打者へ
        → outs >= 3 なら checkThreeOuts()
  → strikes < 2 の場合:
      → strikes + 1

handleAction("foul")
  → strikes < 2 の場合:
      → strikes + 1
  → strikes >= 2 の場合:
      → showMessage("ファウル!") のみ（カウント変化なし）
```

### 3.2 安打系（single / double / triple / homerun）

```
handleAction("single" | "double" | "triple" | "homerun")
  → pendingDirection を設定（打球方向選択画面を表示）

resolveDirection(direction)
  ※ 打球方向選択: シングルのみ外野＋内野、二塁打・三塁打・HRは外野（左・中・右）のみ
  → homerun の場合:
      → 全走者 + 打者の得点を計算（満塁なら4点）
      → addRuns(), addHits(1)
      → 塁をクリア、カウントリセット、次の打者へ
  → triple の場合:
      → 全走者の得点を計算
      → addRuns(), addHits(1)
      → bases = [false, false, true]（打者が3塁）
      → カウントリセット、次の打者へ
  → single / double の場合:
      → buildPendingPlayCascaded() でスロット構築
      → play.hitDirection = direction
      → 全スロットの選択肢が1つだけ → 即時 resolvePlay()
      → それ以外 → pendingPlay を設定（走者選択画面を表示）
```

### 3.3 アウト系（groundout / flyout / lineout / sacrifice-fly / sacrifice-bunt）

```
handleAction("groundout" | "flyout" | "lineout" | "sacrifice-fly" | "sacrifice-bunt")
  → 前提条件チェック:
      → sacrifice-fly: 3塁走者がいなければ "3塁走者がいません" で中断
      → sacrifice-bunt: 走者が誰もいなければ "走者がいません" で中断
  → pendingFielding を設定（守備番号選択画面を表示）

confirmFielding()
  → buildPendingPlayCascaded() でスロット構築
  → play.fieldingNumbers = numbers
  → play.actionLabel = "ゴロ 5→3" のような形式に更新
  → 全スロットの選択肢が1つだけ → 即時 resolvePlay()
  → それ以外 → pendingPlay を設定（走者選択画面を表示）
```

### 3.4 走塁・その他の ComplexAction

```
handleAction(complexAction)
  → buildPendingPlayCascaded() でスロット構築
  → play が null → "走者がいません" で中断
  → 全スロットの選択肢が1つだけ → 即時 resolvePlay()
  → それ以外 → pendingPlay を設定（走者選択画面を表示）
```

### 3.5 強制進塁（四球・死球・敬遠共通）

```
handleAction("hit-by-pitch" | "walk" | "intentional-walk")
  → forceAdvance(bases)
  → addRuns(s, runs)
  → カウントリセット、次の打者へ
```

---

## 4. コアロジック詳細

### 4.1 forceAdvance（強制進塁）

四球・死球・敬遠で使用。打者が1塁に進み、後ろから押す形で走者を進める。

```ts
function forceAdvance(bases: [boolean, boolean, boolean]) {
  let runs = 0;
  const b = [...bases];
  if (b[0]) {           // 1塁に走者がいる
    if (b[1]) {         //   2塁にも走者がいる
      if (b[2]) runs++; //     3塁にも走者がいる → 得点
      b[2] = true;      //   2塁走者 → 3塁
    }
    b[1] = true;        // 1塁走者 → 2塁
  }
  b[0] = true;          // 打者 → 1塁
  return { newBases: b, runs };
}
```

**ポイント**: 押し出しは1塁から順に連鎖する。3塁走者のみの場合は進塁しない（1塁が空いているため強制力がない）。

**パターン別の結果:**

| 走者状態 | 結果 | 得点 |
|---|---|---|
| 走者なし | [true, false, false] | 0 |
| 1塁のみ | [true, true, false] | 0 |
| 2塁のみ | [true, false, true] | 0 |
| 3塁のみ | [true, false, true] | 0 |
| 1・2塁 | [true, true, true] | 0 |
| 1・3塁 | [true, true, true] | 0 |
| 2・3塁 | [true, false, true] | 0 |
| 満塁 | [true, true, true] | 1 |

### 4.2 buildPendingPlay（走者スロット構築）

各ComplexActionに応じて、走者ごとのスロット（行き先選択肢）を構築する。

#### 安打系

**single（シングルヒット）:**
| 走者 | デフォルト | 選択肢 |
|---|---|---|
| 3塁走者 | home | home, 3B, out |
| 2塁走者 | 3B | 3B, home, out |
| 1塁走者 | 2B | 2B, 3B, home, out |
| 打者 | 1B | 1B |

**double（二塁打）:**
| 走者 | デフォルト | 選択肢 |
|---|---|---|
| 3塁走者 | home | home |
| 2塁走者 | 3B | 3B, home, out |
| 1塁走者 | 3B | 3B, home, out |
| 打者 | 2B | 2B |

#### アウト系

**groundout（ゴロ）:** `requiresOut: true`
| 走者 | デフォルト | 選択肢 |
|---|---|---|
| 3塁走者 | 3B | 3B, home, out |
| 2塁走者 | 2B | 2B, 3B, home, out |
| 1塁走者 | 1B | 1B, 2B, 3B, home, out |
| 打者 | out | out, 1B, 2B, 3B, home |

**flyout（フライ）:** `requiresOut: true`
| 走者 | デフォルト | 選択肢 |
|---|---|---|
| 3塁走者 | 3B | 3B, home, out |
| 2塁走者 | 2B | 2B, 3B, home, out |
| 1塁走者 | 1B | 1B, 2B, 3B, home, out |
| 打者 | out | out |

**lineout（ライナー）:** `requiresOut: true`
| 走者 | デフォルト | 選択肢 |
|---|---|---|
| 3塁走者 | 3B | 3B, home, out |
| 2塁走者 | 2B | 2B, 3B, home, out |
| 1塁走者 | 1B | 1B, 2B, 3B, home, out |
| 打者 | out | out |

**sacrifice-fly（犠飛）:** `requiresOut: true`、3塁走者必須
| 走者 | デフォルト | 選択肢 |
|---|---|---|
| 3塁走者 | home | home, 3B |
| 2塁走者 | 2B | 2B, 3B, home |
| 1塁走者 | 1B | 1B, 2B, 3B, home |
| 打者 | out | out |

**sacrifice-bunt（犠打）:** `requiresOut: true`、走者必須
| 走者 | デフォルト | 選択肢 |
|---|---|---|
| 3塁走者 | home | home, 3B |
| 2塁走者 | 3B | 3B, home |
| 1塁走者 | 2B | 2B, 3B |
| 打者 | out | out, 1B, 2B |

#### 走塁系（preserveCount: true）

**stolen-base（盗塁成功）:** 走者必須
| 走者 | デフォルト | 選択肢 |
|---|---|---|
| 3塁走者 | 3B | home, 3B |
| 2塁走者 | 3B | 3B, 2B |
| 1塁走者 | 2B | 2B, 1B |

**caught-stealing（盗塁失敗）:** `requiresOut: true`、走者必須
| 走者 | デフォルト | 選択肢 |
|---|---|---|
| 3塁走者 | 3B | out, 3B |
| 2塁走者 | 2B | out, 2B |
| 1塁走者 | out | out, 1B |

**wild-pitch（暴投）:** 走者必須
| 走者 | デフォルト | 選択肢 |
|---|---|---|
| 3塁走者 | home | home, 3B |
| 2塁走者 | 3B | 3B, home |
| 1塁走者 | 2B | 2B, 3B |

**passed-ball（捕逸）:** 走者必須
| 走者 | デフォルト | 選択肢 |
|---|---|---|
| 3塁走者 | home | home, 3B |
| 2塁走者 | 3B | 3B, home |
| 1塁走者 | 2B | 2B, 3B |

**balk（ボーク）:** 走者必須
| 走者 | デフォルト | 選択肢 |
|---|---|---|
| 3塁走者 | home | home |
| 2塁走者 | 3B | 3B |
| 1塁走者 | 2B | 2B |

**runner-out（走塁アウト）:** `requiresOut: true`、走者必須
| 走者 | デフォルト | 選択肢 |
|---|---|---|
| 3塁走者 | 3B | out, 3B |
| 2塁走者 | 2B | out, 2B |
| 1塁走者 | 1B | out, 1B |

#### その他

**fielders-choice（フィールダーズチョイス）:** 走者必須
| 走者 | デフォルト | 選択肢 |
|---|---|---|
| 3塁走者 | 3B | out, home, 3B |
| 2塁走者 | 3B | out, 3B, 2B |
| 1塁走者 | out | out, 2B, 3B |
| 打者 | 1B | 1B |

**error（エラー）:** `isError: true`
| 走者 | デフォルト | 選択肢 |
|---|---|---|
| 3塁走者 | home | home, 3B |
| 2塁走者 | 3B | 3B, home |
| 1塁走者 | 2B | 2B, 3B, home |
| 打者 | 1B | 1B, 2B, 3B |

**dropped-third-strike（振り逃げ）:**
| 走者 | デフォルト | 選択肢 |
|---|---|---|
| 3塁走者 | 3B | home, 3B |
| 2塁走者 | 2B | 3B, 2B |
| 1塁走者 | 1B | 2B, 1B |
| 打者 | 1B | 1B, out |

**catcher-interference（打撃妨害）:**
| 走者 | デフォルト | 選択肢 |
|---|---|---|
| 3塁走者 | 3B | home, 3B |
| 2塁走者 | 2B | 3B, 2B |
| 1塁走者 | 2B | 2B, 1B |
| 打者 | 1B | 1B |

**obstruction（走塁妨害）:** `preserveCount: true`、走者必須
| 走者 | デフォルト | 選択肢 |
|---|---|---|
| 3塁走者 | 3B | home, 3B |
| 2塁走者 | 2B | 3B, home, 2B |
| 1塁走者 | 1B | 2B, 3B, 1B |

**offensive-interference（守備妨害）:** `requiresOut: true`, `preserveCount: true`、走者必須
| 走者 | デフォルト | 選択肢 |
|---|---|---|
| 3塁走者 | 3B | out, 3B |
| 2塁走者 | 2B | out, 2B |
| 1塁走者 | 1B | out, 1B |

### 4.3 cascadeSlots（走者衝突解消）

走者が同じ塁に重ならないよう、自動的に前後の走者を押し出す。

```ts
function cascadeSlots(slots: RunnerSlot[], fromIndex = -1): void
```

**処理の流れ:**

1. スロットを元の位置（batter → 1B → 2B → 3B）順にソート
2. **前方カスケード**: 後ろの走者が前の走者と同じ or 先の塁にいる場合、前の走者を1つ先に押し出す（最大 home まで）
3. **後方カスケード**（`fromIndex` 指定時のみ）: 前の走者が後ろの走者と同じ or 手前の塁にいる場合、後ろの走者を1つ手前に戻す（最小 1B まで）

**塁の順序値:**

| Destination | 値 |
|---|---|
| out | null（スキップ） |
| 1B | 1 |
| 2B | 2 |
| 3B | 3 |
| home | 4 |

**使用箇所:**
- `buildPendingPlayCascaded()`: 初期スロット構築後に `cascadeSlots(slots)` を呼び出し
- `updatePendingSlot()`: ユーザーが行き先を変更した時に `cascadeSlots(newSlots, slotIndex)` を呼び出し

### 4.4 resolvePlay（プレー確定）

走者選択画面で「確定」を押した時に呼ばれる。

```
resolvePlay(play: PendingPlay):
  1. ensureInningScore() でイニングスコアを初期化
  2. 全スロットを走査:
     - destination === "out"  → outs++
     - destination === "home" → runs++
     - destination === "1B"   → newBases[0] = true
     - destination === "2B"   → newBases[1] = true
     - destination === "3B"   → newBases[2] = true
     - destination === "stay" → fromの塁をそのまま維持
  3. addRuns(s, runs)
  4. play.isHit なら addHits(s, 1)
  5. play.isError なら addErrors(s, 1)
  6. play.preserveCount の場合:
     → outs と bases のみ更新（カウント維持、打者変更なし）
  7. play.preserveCount でない場合:
     → カウントリセット、次の打者へ
  8. outs >= 3 なら checkThreeOuts()
```

### 4.5 checkThreeOuts（3アウトチェンジ）

```
checkThreeOuts(s: GameState):
  outs < 3 → そのまま返す

  表の攻撃中（isTop === true）の場合:
    → isTop = false, カウント/アウト/走者リセット、次の打者へ

  裏の攻撃中（isTop === false）の場合:
    → ホームチームのイニングスコアを 0 で初期化（null → 0）
    → 次のイニングへ（inning + 1）
    → inning > 9 の場合:
        → showMessage("試合終了!")
        → isPlaying = false, isGameOver = true
    → それ以外:
        → isTop = true, カウント/アウト/走者リセット、次の打者へ
```

### 4.6 updatePendingSlot（走者選択画面での変更）

```
updatePendingSlot(slotIndex: number, dest: Destination):
  1. 対象スロットの destination を更新
  2. cascadeSlots(newSlots, slotIndex) で衝突解消
  3. バリデーション:
     a. 同じ塁に複数走者がいないか（home/out を除く）
     b. 全スロットの destination がその options に含まれるか
  4. バリデーション失敗 → 変更を破棄（prev を返す）
```

---

## 5. 状態ヘルパー関数

### 5.1 ensureInningScore

現在のイニングのスコアが null なら 0 に初期化。攻撃中チームのスコア配列を対象とする。

```ts
const team = s.isTop ? "away" : "home";
if (sc[s.inning - 1] === null) sc[s.inning - 1] = 0;
```

### 5.2 addRuns

攻撃中チームの `runs`（総得点）と `scores[inning-1]`（イニング得点）を加算。

```ts
const t = s.isTop ? "away" : "home";
d.runs += r;
sc[s.inning - 1] = (sc[s.inning - 1] || 0) + r;
```

### 5.3 addHits

攻撃中チームの `hits`（総安打数）を加算。

```ts
const t = s.isTop ? "away" : "home";
d.hits += h;
```

### 5.4 addErrors

**守備側チーム**の `errors`（総失策数）を加算。攻撃側の逆。

```ts
const t = s.isTop ? "home" : "away"; // 守備側
d.errors += e;
```

### 5.5 resetCount

ボールカウントとストライクカウントを 0 にリセット。

```ts
({ ...s, balls: 0, strikes: 0 })
```

---

## 6. 打順管理

### 6.1 batterNames（固定値）

```ts
const batterNames = [
  "猪狩 守", "矢部 明雄", "六道 聖", "友沢 亮", "橘 みずき",
  "阿畑 やすし", "東條 小次郎", "冴木 創", "茂野 吾郎",
];
```

### 6.2 nextBatter

```ts
function nextBatter(): PlayerData {
  setBatterIndex((prev) => (prev + 1) % batterNames.length);
  return {
    name: batterNames[(batterIndex + 1) % batterNames.length],
    number: ((batterIndex + 1) % batterNames.length) + 1,
    position: "野手",
    avg: `.${Math.floor(Math.random() * 200 + 200)}`,
  };
}
```

**呼び出しタイミング:** 打席結果が確定するたび（三振、安打、アウト、四球、死球、敬遠など）。`preserveCount: true` のプレー（盗塁、暴投等の走塁イベント）では呼ばれない。

---

## 7. 履歴・Undo

### 7.1 pushHistory

プレー確定前に現在の `gameState` と `batterIndex` をスナップショットとして保存。

```ts
setHistory((prev) => [...prev, { state: gameState, batterIndex, label }]);
```

### 7.2 requestUndo → confirmUndo

1. `requestUndo()`: 確認ダイアログを表示（`undoConfirmPending = true`）
2. `confirmUndo()`: 履歴の最後のエントリを取り出し、`gameState` と `batterIndex` を復元。全ての pending 状態をクリア。

---

## 8. UI状態管理

### 8.1 pending 状態の種類

| 状態 | 型 | トリガー | 解決 |
|---|---|---|---|
| `pendingPlay` | `PendingPlay \| null` | 走者選択が必要な時 | `confirmPending()` → `resolvePlay()` |
| `strikeoutPending` | `boolean` | 2ストライクでS押下 | `resolveStrikeout()` |
| `pendingDirection` | `{ action, label } \| null` | 安打ボタン押下 | `resolveDirection()` |
| `pendingFielding` | `PendingFielding \| null` | アウト系ボタン押下 | `confirmFielding()` |
| `undoConfirmPending` | `boolean` | undo ボタン押下 | `confirmUndo()` / `cancelUndo()` |

### 8.2 allSingle 判定（走者選択スキップ）

全スロットの `options.length <= 1` の場合、走者選択画面を表示せずに即時 `resolvePlay()` を実行する。

**該当例:**
- 走者なしのシングルヒット（打者の行き先が1Bのみ）
- ボーク（全走者の行き先が1択ずつ）

### 8.3 requiresOut バリデーション

`runner-resolution.tsx` 内で、`play.requiresOut === true` の場合、いずれかのスロットが `destination === "out"` でないと確定ボタンを無効化する。

```ts
const hasOut = play.slots.some((sl) => sl.destination === "out");
const canConfirm = !play.requiresOut || hasOut;
```

---

## 9. 走者選択画面（runner-resolution.tsx）

### 9.1 表示順序

スロットは `from` の値で batter → 1B → 2B → 3B の順にソートして表示。

### 9.2 選択肢の表示順序

各スロットの `options` は以下の順序でソート:

| Destination | 順序値 |
|---|---|
| stay | 0 |
| 1B | 1 |
| 2B | 2 |
| 3B | 3 |
| home | 4 |
| out | 5 |

### 9.3 確定・キャンセル

- **確定**: `onConfirm` → `confirmPending()` → `pushHistory()` → `resolvePlay()`
- **キャンセル**: `onCancel` → `cancelPending()` → `setPendingPlay(null)`

---

## 10. メッセージ表示

```ts
function showMessage(msg: string) {
  setMessage(msg);
  setTimeout(() => setMessage(null), 1800); // 1.8秒後に自動消去
}
```

**表示されるメッセージ一覧:**

| 条件 | メッセージ |
|---|---|
| 四球（自動判定） | "フォアボール!" |
| 四球（ボタン） | "フォアボール!" |
| 死球 | "死球!" |
| 敬遠 | "敬遠!" |
| ファウル（2ストライク後） | "ファウル!" |
| 三振 | "空振り三振!" / "見逃し三振!" |
| ホームラン | "ソロホームラン!" / "{n}ランHR!" / "満塁ホームラン!!" |
| 三塁打 | "三塁打!" |
| 得点（resolvePlay内） | "得点!" / "{n}点!" |
| 得点なし（resolvePlay内） | "{actionLabel}!" |
| 3アウト | "チェンジ!" |
| 試合終了 | "試合終了!" |
| リセット | "リセット!" |
| 走者不在 | "走者がいません" / "3塁走者がいません" |

---

## 11. 定数・マッピング

### 11.1 ACTION_LABELS

```ts
const ACTION_LABELS = {
  ball: "ボール", strike: "ストライク", foul: "ファウル",
  homerun: "ホームラン", triple: "三塁打",
  "hit-by-pitch": "死球", walk: "四球", "intentional-walk": "敬遠",
};
```

### 11.2 DEST_LABELS / DEST_COLORS

```ts
const DEST_LABELS = {
  out: "OUT", "1B": "1塁", "2B": "2塁", "3B": "3塁", home: "得点", stay: "残留",
};
```

色は `DEST_COLORS` で Destination ごとに `bg` / `text` / `activeBg` の Tailwind クラスを定義。

### 11.3 走者選択画面の表示色

| from | 色 | ラベル |
|---|---|---|
| batter | bg-[#2563EB] | 打 |
| 1B | bg-[#3B82F6] | 1 |
| 2B | bg-[#0891B2] | 2 |
| 3B | bg-[#D97706] | 3 |

---

## 12. playSeq（プレーシーケンス）

打席結果が確定するたびにインクリメントされるカウンター。外部コンポーネントでプレーの変化を検知するために使用。

```ts
setPlaySeq((s) => s + 1);
```

**インクリメントされるタイミング:**
- `resolvePlay()` 実行時
- `resolveStrikeout()` 実行時
- `resolveDirection()` で homerun / triple を即時処理した時
- `handleAction()` で四球・死球・敬遠を処理した時（`completesPlay === true`）

---

## 13. initialGameState（初期値）

```ts
{
  away: { name: "パワフルズ", shortName: "パワ", scores: [null x 9], runs: 0, hits: 0, errors: 0, color: "hsl(0, 85%, 55%)" },
  home: { name: "あかつき大附", shortName: "あか", scores: [null x 9], runs: 0, hits: 0, errors: 0, color: "hsl(210, 80%, 45%)" },
  inning: 1,
  isTop: true,
  balls: 0, strikes: 0, outs: 0,
  bases: [false, false, false],
  currentBatter: { name: "猪狩 守", number: 1, position: "投手", avg: ".321" },
  currentPitcher: { name: "早川 あおい", number: 18, position: "投手", era: "2.45" },
  isPlaying: true,
  isGameOver: false,
}
```
