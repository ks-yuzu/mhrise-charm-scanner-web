# is何
MHRise (Monster Hunter Rise) の護石を自動読み取りする web アプリです.
動画を入力として, 護石のスキル・スロットを一覧で出力します.

その他, 護石の管理機能 (全護石の一覧表示, 読み取り時のキャプチャ画像の表示, 上位互換護石の表示など) があります.

# 使い方
[https://mhrise-charm-scanner.yuzu-k.com/](https://mhrise-charm-scanner.yuzu-k.com/) へ GO !

# 自分で動かしたい人用メモ
いないと思いますが一応書いておきます.

## 準備
```bash
npm install
```

## 開発用サーバを立てる
```bash
npm run dev
```
[localhost:5000](http://localhost:5000) でアクセスできます

## リリースビルド
```bash
npm run build
```

## その他
### index.html の更新
emscripten の入力に使っている wasm-modules/template.html を更新し,
WebAssembly モジュールのビルドを行う

### WebAssembly モジュールのビルド
上位互換護石の検索に使用している wasm モジュール関連の
`docs/index.html`, `docs/mhrise-charm-substitutes-search.{js,wasm}` の更新

```
cd wasm-modules
make
```

