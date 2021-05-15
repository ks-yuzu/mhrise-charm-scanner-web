<div id="description" class="card border border-light shadow-sm">
  <div class="card-body">
    <!-- <p style="margin: auto; max-width: 100%; width: 54rem; text-align: left"> -->
    <p>
      モンスターハンターライズの護石用ツールです。<br>
      機能追加、UI 改善は随時行っています。<br>
    </p>

    <h3>■ 護石スキャン</h3>
    <p>
      護石のスキルやスロットを自動読み取りします。<br>
      Nintendo Switch の 30 秒キャプチャ動画を用意するだけで、自動でデータ化できます。
      (<a href="sample/input.mp4">動画例</a>)<br>
      <br>
      出力形式は、&lt;スキル1&gt;,&lt;スキル1Lv&gt;,&lt;スキル2&gt;,&lt;スキル2Lv&gt;,&lt;スロット1Lv&gt;,&lt;スロット2Lv&gt;,&lt;スロット3Lv&gt; です。<br>
      <a href="https://mhrise.wiki-db.com/sim/">泣きシミュ</a> さんでそのままインポートできます。<br>
    </p>

    <h3>■ 護石管理</h3>
    <p>
      スキャンした護石の一覧を見ることができます。<br>
      右端の画像ボタンを押すことで、スキャン時のスクリーンショットを確認できます。<br>
      護石データは蓄積され、次回、同じブラウザで開いた時にも保持されます。<br>
      <br>
      表中の "合計スキルレベル" は、<br>
      <span class="px-3 font-weight-bold">(スキルを装飾品換算した場合のスロットLv) × (スキルLv) + (スロットLv)</span><br>
      として計算しています。<br>
      <br>
      例) 納刀術2, ひるみ軽減1, スロット 3-1-0 の場合<br>
      <span class="px-3">2 × 2 + 1 × 1 + 3 + 1 + 0 = 9</span><br>

      近日、上位互換護石の表示機能を追加予定です。
    </p>
  </div>
</div>


<style>
  #description {
    margin: 2rem auto;

    max-width: 100%;
    width: 56rem;
  }

  #description h3 {
    font-size:   1rem;
    font-weight: bold;
    text-align:  left;
  }

  #description p {
    text-align: left;
  }
</style>
