# EPSON Printer App

Electron + ReactJS アプリケーション for プリンタ印刷

## 概要

このアプリケーションは、システムにインストールされたプリンタを使用して、売上伝票やテキストを印刷するためのデスクトップアプリケーションです。

## 特徴

- ✅ **Pure JavaScript**: Native build tools 不要
- ✅ **システムプリンタ**: インストール済みプリンタを自動検索
- ✅ **PDF生成**: 印刷前にPDFを生成
- ✅ **売上伝票印刷**: 完全な伝票レイアウト
- ✅ **画像印刷**: 画像のPDF変換と印刷
- ✅ **リアルタイム接続**: 接続状態の監視
- ✅ **日本語対応**: 完全な日本語サポート

## システム要件

### 必須要件
- Windows 10/11 (64-bit)
- Node.js 18+ (LTS version)
- npm/yarn package manager
- インストール済みプリンタ（PDFプリンタ含む）

### 不要なもの
- ❌ Visual Studio Build Tools
- ❌ Python 3.x
- ❌ Windows SDK
- ❌ Native compilation tools

## インストール

### 1. リポジトリのクローン
```bash
git clone <repository-url>
cd electron-epson-printer
```

### 2. 依存関係のインストール
```bash
npm install
```

### 3. 開発サーバーの起動
```bash
npm run dev
```

### 4. 本番ビルド
```bash
npm run build
npm run dist
```

## 使用方法

### 1. プリンタの検索
1. アプリを起動
2. 「検索開始」ボタンをクリック
3. 検出されたプリンタから選択

### 2. プリンタの接続
1. プリンタを選択
2. 「接続」ボタンをクリック
3. 接続状態を確認

### 3. 印刷テスト
1. 「印刷テスト」セクションでテキストを入力
2. 印刷オプションを設定
3. 「印刷」ボタンをクリック

### 4. 売上伝票の印刷
1. 「売上伝票印刷」セクションで情報を入力
2. 商品明細を追加
3. 「印刷」ボタンをクリック

## プロジェクト構造

```
electron-epson-printer/
├── src/
│   ├── main/                 # Electron main process
│   │   ├── main.ts
│   │   ├── preload.ts
│   │   ├── printer/
│   │   │   ├── printer-discovery.ts
│   │   │   ├── printer-connection.ts
│   │   │   ├── printer-service.ts
│   │   │   └── escpos-commands.ts
│   │   └── ipc/
│   │       └── printer-handlers.ts
│   ├── renderer/             # ReactJS renderer process
│   │   ├── components/
│   │   │   ├── PrinterDiscovery.tsx
│   │   │   ├── PrinterConnection.tsx
│   │   │   ├── PrintDialog.tsx
│   │   │   └── SalesReceiptForm.tsx
│   │   ├── hooks/
│   │   │   └── usePrinter.ts
│   │   ├── types/
│   │   │   └── printer.types.ts
│   │   ├── App.tsx
│   │   ├── index.tsx
│   │   └── index.css
│   └── shared/               # Shared types and utilities
│       └── types/
│           └── printer.types.ts
├── public/
├── package.json
├── tsconfig.json
├── tsconfig.main.json
└── README.md
```

## 技術スタック

### Frontend
- **React 18**: UI フレームワーク
- **TypeScript**: 型安全性
- **Styled Components**: CSS-in-JS
- **Electron**: デスクトップアプリ

### Backend
- **Node.js**: ランタイム
- **Bluetooth Serial Port**: Bluetooth 通信
- **Jimp**: 画像処理
- **ESC/POS**: プリンタコマンド

### 開発ツール
- **TypeScript**: 型チェック
- **Electron Builder**: パッケージング
- **Concurrently**: 並行実行

## API リファレンス

### プリンタ検索
```typescript
// プリンタ検索開始
await window.electronAPI.startPrinterDiscovery();

// 検出されたプリンタ取得
const printers = await window.electronAPI.getDiscoveredPrinters();

// 検索停止
await window.electronAPI.stopPrinterDiscovery();
```

### プリンタ接続
```typescript
// プリンタ接続
const success = await window.electronAPI.connectPrinter(printerInfo);

// 接続状態確認
const isConnected = await window.electronAPI.isPrinterConnected();

// プリンタ切断
await window.electronAPI.disconnectPrinter();
```

### 印刷機能
```typescript
// テキスト印刷
await window.electronAPI.printText(text, options);

// 画像印刷
await window.electronAPI.printImage(imagePath, options);

// 売上伝票印刷
await window.electronAPI.printSalesReceipt(receiptData);
```

## トラブルシューティング

### プリンタが検出されない
1. Bluetooth が有効になっているか確認
2. プリンタがペアリングモードになっているか確認
3. プリンタの電源が入っているか確認

### 接続エラー
1. プリンタが他のデバイスに接続されていないか確認
2. プリンタを再起動
3. アプリを再起動

### 印刷エラー
1. プリンタの用紙が切れていないか確認
2. プリンタの接続状態を確認
3. 印刷データの形式を確認

## 開発

### 開発環境のセットアップ
```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# 型チェック
npm run build:main
```

### ビルド
```bash
# 本番ビルド
npm run build

# パッケージ作成
npm run dist

# ディレクトリのみ作成
npm run pack
```

## ライセンス

MIT License

## 貢献

プルリクエストやイシューの報告を歓迎します。

## サポート

問題が発生した場合は、GitHub の Issues セクションで報告してください。
