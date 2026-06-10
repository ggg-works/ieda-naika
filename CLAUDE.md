# 家田内科 ウェブサイト CLAUDE.md

## プロジェクト概要

- サイト: 家田内科（ieda-naika.jp）
- 構成: 静的HTML/CSS/JS（GitHub Pages）
- メインファイル: `index.html` / `style.css` / `script.js`

---

## お知らせ更新ルール

### 対象箇所

`index.html` 内の以下のブロックの**先頭**に追記する。

```html
<div class="news-list js-fade" aria-label="お知らせ一覧">
  <!-- ← ここに追加 -->
</div>
```

### 制約（厳守・毎回適用）

- お知らせ追加・編集の指示を受けた場合、**お知らせ以外のコードは一切変更しない**
- ユーザーが「他は変更しないで」と言わなくても、この制約は**常に有効**
- インラインスタイル（`style="..."`）は**禁止**
- 新規CSSクラスの追加は**禁止**（既存クラスのみ使用）
- 新規JS追加は**禁止**

---

## お知らせのHTMLテンプレート

### ① シンプル（展開なし）

```html
<article class="news-item">
  <time class="news-date" datetime="YYYY-MM-DD">YYYY.MM.DD</time>
  <span class="news-badge badge--XXX">ラベル</span>
  <h3 class="news-title">タイトル</h3>
</article>
```

### ② 展開式（詳細を開閉できる）

```html
<article class="news-item news-item--expandable">
  <details class="news-details">
    <summary class="news-summary">
      <time class="news-date" datetime="YYYY-MM-DD">YYYY.MM.DD</time>
      <span class="news-badge badge--XXX">ラベル</span>
      <h3 class="news-title">タイトル</h3>
      <span class="news-expand" aria-hidden="true"></span>
    </summary>
    <div class="news-body">
      <p>本文</p>
    </div>
  </details>
</article>
```

---

## バッジクラス一覧（style.css より）

| クラス | 色 | 用途 |
|---|---|---|
| `badge--closed` | アンバーオレンジ／白文字 | 休診・臨時休診 |
| `badge--service` | 白地／エメラルド文字・枠 | 診療案内 |
| `badge--vaccine` | 白地／ゴールド文字・枠 | 予防接種 |
| `badge--info` | 白地／グレー文字・枠 | 一般お知らせ |

---

## CSSカラー変数（style.css より）

```css
--c-em:         #2ABFBF;  /* エメラルドブルー（メイン） */
--c-em-dark:    #0E8080;  /* ディープエメラルド */
--c-em-light:   #E0F5F5;  /* 薄エメラルド（背景アクセント） */
--c-ivory:      #F5F0E8;  /* サンドベージュ */
--c-text:       #2C2C2C;  /* 本文テキスト */
--c-text-muted: #6B7280;  /* サブテキスト */
--c-border:     #DDE8E8;  /* ボーダー */
--c-gold:       #B89840;  /* ゴールド */
```

---

## カレンダー形式の本文（休診お知らせ用）

展開式の `<div class="news-body">` 内で使う。
テーブルで日付・曜日・診療状況を表示し、既存クラスのみ使用する。

```html
<div class="news-body">
  <table>
    <thead>
      <tr>
        <th>日付</th>
        <th>曜日</th>
        <th>診療</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>8月X日</td>
        <td>〇</td>
        <td>通常診療</td>
      </tr>
      <tr>
        <td>8月X日</td>
        <td>〇</td>
        <td>休診</td>
      </tr>
    </tbody>
  </table>
  <p>ご不便をおかけしますが、よろしくお願い申し上げます。</p>
</div>
```

> テーブルに既存クラスを付与する場合は `style.css` を確認してから指定すること。
> 不明な場合はクラスなし（ブラウザデフォルト）で対応する。

---

## 指示の出し方（例）

```
お知らせを追加してください。他は変更しないでください。

- 形式: 展開式
- 日付: 2025-08-01
- バッジ: badge--closed
- タイトル: お盆休みの診療について
- 本文: カレンダー形式で以下を表示
  8/8(土) 通常診療
  8/9(日) 休診
  8/10(月) 午前診のみ（信人）／研人は休診
  8/11(火)〜8/16(日) 休診
  末尾に「ご不便をおかけしますが、よろしくお願い申し上げます。」
```
