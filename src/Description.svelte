<script>
import { Lightbox } from 'svelte-lightbox'
</script>

<div id="description">
  <div class="card border border-light shadow-sm">
    <div class="card-body">
      <h2>■ 概要</h2>
      <p>
        モンスターハンターライズの護石用ツールです。<br>
        機能追加、UI 改善は随時行っています。<br>
      </p>
    </div>
  </div>

  <div class="card border border-light shadow-sm">
    <div class="card-body">
      <h2>■ 護石スキャン</h2>
      <p>
        護石のスキルやスロットを自動読み取りします。<br>
        Nintendo Switch の 30 秒キャプチャ動画を用意するだけで、自動でデータ化できます。
        (<a href="sample/input.mp4">動画例</a>)<br>
        <br>
        出力形式は、&lt;スキル1&gt;,&lt;スキル1Lv&gt;,&lt;スキル2&gt;,&lt;スキル2Lv&gt;,&lt;スロット1Lv&gt;,&lt;スロット2Lv&gt;,&lt;スロット3Lv&gt; です。<br>
        <a href="https://mhrise.wiki-db.com/sim/">泣きシミュ</a> さんでそのままインポートできます。<br>
        <br>
        (注意)<br>
        - <span style="color: red">装飾品をつけたままだと、装飾品分のスキルも読み込まれてしまいます。</span> (一括解除が有用です)<br>
        - キャプチャ動画のファイル名はデフォルトのまま使用することを推奨します。<br>
      </p>

      <div class="lightboxes">
        <Lightbox thumbnailStyle="width: 24rem; max-width: 90%; border: solid 1px #eee">
          <img src="img/screenshots/charm-scanning.png" alt="charm scanning">
        </Lightbox>
      </div>
    </div>
  </div>

  <div class="card border border-light shadow-sm">
    <div class="card-body">
      <h2>■ 護石管理</h2>
      <p>
        スキャンした護石の一覧を見ることができます。<br>
        護石データは蓄積され、次回、同じブラウザで開いた時にも保持されます。<br>
        <br>
        表中の "合計スキルレベル" は、<br>
        <span class="px-3 font-weight-bold">(スキルを装飾品換算した場合のスロットLv) × (スキルLv) + (スロットLv)</span><br>
        として計算しています。<br>
        <br>
        例: 納刀術2, ひるみ軽減1, スロット 3-1-0 の場合<br>
        <span class="px-3">2 × 2 + 1 × 1 + 3 + 1 + 0 = 9</span><br>
        <br>
        右端の画像ボタンを押すことで、スキャン時のスクリーンショットを確認できます。<br>
        右端に上向き矢印がある場合、上位互換の護石があります。クリックで該当の護石を確認することができます。<br>
        <br>
        <span style="color: red">輪廻錬金の際は充分に確認し、自己責任にて行ってください。<br></span>
        <!-- 本ツールを使用したことにより不利益が生じた場合、一切責任を負いかねます。<br> -->
      </p>

      <div class="lightboxes">
        <Lightbox thumbnailStyle="width: 24rem; max-width: 90%; border: solid 1px #eee">
          <img src="img/screenshots/charm-img.png" alt="charm image">
        </Lightbox>
        <Lightbox thumbnailStyle="width: 24rem; max-width: 90%; border: solid 1px #eee">
          <img src="img/screenshots/charm-substitutes.png" alt="charm substitutes">
        </Lightbox>
      </div>
    </div>
  </div>

  <div class="card border border-light shadow-sm">
    <div class="card-body">
      <h2>■ お問い合わせ</h2>
      <p>
        不具合報告や要望は <a href="https://github.com/ks-yuzu/mhrise-charm-scanner-web/issues">GitHub issue</a> にてお願いします。
      </p>
    </div>
  </div>
</div>


<style>
  #description {
    width:       100%;
    height:      100%;

    overflow:    auto;
  }

  #description > div.card {
    margin: 1rem auto;

    width:     56rem;
    max-width: 98%;
  }

  #description h2 {
    font-size:   1rem;
    font-weight: bold;
    text-align:  left;
  }

  #description p {
    text-align: left;
  }

  #description .lightboxes {
    display: flex;
    justify-content: space-around;
  }

  :global(#description img) {
    max-width: 100%;
  }
</style>
