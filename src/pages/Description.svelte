<script lang="ts">
import {Lightbox} from 'svelte-lightbox'
</script>

<div id="description">
  <div class="card border border-light shadow-sm">
    <div class="card-body">
      <h2>■ 概要</h2>
      <p>
        モンスターハンターライズの護石用ツールです。<br>
        手持ちの護石を自動読み取りすることができます。<br>
        <br>
        読み取った護石は、スキャン時の画像や上位互換の護石が確認できます。<br>
        また、護石を性能検索することもできます。<br>
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
        キャプチャ動画の読み取りと、護石管理ページとの関係については、<a href="#h2-charm-manager">護石管理</a>を参照してください。<br>
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
      <h2>■ 護石リアルタイムスキャン(β)</h2>
      <p>
        護石のスキルやスロットを自動読み取りします。<br>
        Nintendo Switch の映像をキャプチャボードで取り込み、リアルタイムにスキャンを行うことができます。<br>
        市販のキャプチャボードの購入が必要ですが、キャプチャ動画を用意する必要がなくなります。<br>
        <br>
        動画からのスキャン同様、読み込んだ護石は護石管理ページで確認したり、エクスポートすることができます。<br>
        <br>
        (注意)<br>
        <span style="color: red">装飾品をつけたままだと、装飾品分のスキルも読み込まれてしまいます。</span> (一括解除が有用です)<br>
      </p>

      <div class="lightboxes">
        <Lightbox thumbnailStyle="width: 24rem; max-width: 90%; border: solid 1px #eee">
          <img src="img/screenshots/charm-realtime-scan.png" alt="charm realtime scan">
        </Lightbox>
      </div>
    </div>
  </div>

  <div class="card border border-light shadow-sm">
    <div class="card-body">
      <h2 id="h2-charm-manager">■ 護石管理</h2>
      <p>
        スキャンした護石の一覧を見ることができます。<br>
        護石データは蓄積され、次回、同じブラウザで開いた時にも保持されます。<br>
        <br>
        護石一覧における表示順は、動画読み込み順 → ゲーム内での表示順です。<br>
        動画を撮る際に、レア度ソートし、1 ページ目から順に撮ることで、輪廻錬金での表示順と同じになります。<br>
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
        <!-- <span style="color: red">輪廻錬金の際は充分に確認し、自己責任にて行ってください。<br></span> -->
        <!-- 本ツールを使用したことにより不利益が生じた場合、一切責任を負いかねます。<br> -->
      </p>

      <div class="lightboxes">
        <Lightbox thumbnailStyle="width: 24rem; max-width: 90%; border: solid 1px #eee">
          <img src="img/screenshots/charm-img.png" alt="charm scrennshot">
        </Lightbox>
        <Lightbox thumbnailStyle="width: 24rem; max-width: 90%; border: solid 1px #eee">
          <img src="img/screenshots/charm-substitutes.png" alt="charm substitutes">
        </Lightbox>
      </div>
    </div>
  </div>

  <div class="card border border-light shadow-sm">
    <div class="card-body">
      <h2>■ 護石スペック検索</h2>
      <p>
        スキャンした護石を検索することができます。
        装飾品でスキルが実現できる場合も検索対象に含まれます。
      </p>

      <div class="lightboxes">
        <Lightbox thumbnailStyle="width: 24rem; max-width: 90%; border: solid 1px #eee">
          <img src="img/screenshots/charm-search.png" alt="charm search">
        </Lightbox>
      </div>
    </div>
  </div>

  <div class="card border border-light shadow-sm">
    <div class="card-body">
      <h2>■ 輪廻サポート(β)</h2>
      <p>
        輪廻錬金を行う際に、表示中の護石の上位互換護石をリアルタイム表示する機能です。<br>
        カーソル位置のスキャンがうまくいかない場合、スライダーで感度を調整することができます。<br>
        <br>
        <span style="color: red">
          必ずしもスキャンが正しいとは限りません。<br>
          輪廻に使う時は記録されているスクリーンショットを確認するなど、十分な確認を行ってください。
        </span>
      </p>

      <div class="lightboxes">
        <Lightbox thumbnailStyle="width: 24rem; max-width: 90%; border: solid 1px #eee">
          <img src="img/screenshots/charm-rinne-support.png" alt="charm rinne support">
        </Lightbox>
      </div>
    </div>
  </div>

  <div class="card border border-light shadow-sm">
    <div class="card-body">
      <h2>■ 売却サポート(β)</h2>
      <p>
        護石の売却を行う際に、表示中の護石の上位互換護石をリアルタイム表示する機能です。<br>
        カーソル位置のスキャンがうまくいかない場合、スライダーで感度を調整することができます。<br>
        <br>
        <span style="color: red">
          必ずしもスキャンが正しいとは限りません。<br>
          売却時は記録されているスクリーンショットを確認するなど、十分な確認を行ってください。
        </span>
      </p>
    </div>
  </div>

  <div class="card border border-light shadow-sm">
    <div class="card-body">
      <h2>■ 護石インポート・エクスポート</h2>
      <p>
        スキャンした護石のエクスポート・インポートが行えます。<br>
        入出力形式は、護石スキャン時と同様です。<br>
        <br>
        <span style="color: red">
          上書きインポートを使用すると、保存している護石情報が全て失なわれます。<br>
          また、インポート・エクスポートでは画像を扱っていないので、エクスポート → 上書きインポートすると護石画像が見れなくなります。<br>
        </span>
      </p>
    </div>
  </div>

  <div class="card border border-light shadow-sm">
    <div class="card-body">
      <h2>■ FAQ</h2>
      <h3>
        Q. 護石管理のページで表示される護石がスキャンした数より少ないです
      </h3>
      <p>
        A.<br>
        完全に同性能 (スキル、スキルレベル、スロット全て同じ) 護石は登録されない仕様になっています。<br>
        <br>
        これは、複数の動画を読み取った時に、同一の護石か別の同性能護石か判別する術がないためです。<br>
        「重複していると思って輪廻に使ったら、同じ護石が登録されているだけだった」<br>
        という事態を考慮し、安全重視の仕様にしています。<br>
        <br>
        スキャン時の出力は重複も含めて表示されるので、必要があればそちらをご利用下さい。
        <!-- <br> -->
        <!-- <span class="gray small"> -->
        <!--   良おま神おまの重複はそうそう起きないので、 -->
        <!--   重複護石は上位互換が出やすい (=両方輪廻送りの対象として検出できる) だろうという楽観的希望もあります。<br> -->
        <!-- </span> -->
      </p>
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

  /*
  .gray {
    color: gray;
  }

  .small {
    font-size: 0.7rem;
    line-height: 0.7rem;
  }
  */

  #description h3 {
    font-size: 1rem;
    font-weight: bold;
  }
</style>
