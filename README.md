# 日子咖啡 RIZI Coffee

日子咖啡的品牌形象與線上商店前端專案，以響應式設計呈現最新消息、與咖啡商品，並提供會員註冊／登入、購物車功能。

商品、會員與購物車功能會串接後端 REST API；首頁輪播、最新消息、餐點與訂單等展示資料目前由專案內的模擬資料提供。

## 選用技術

- **Nuxt 4、Vue 3、TypeScript**：應用程式框架、元件開發與型別檢查
- **Pinia**：購物車與收藏狀態管理
- **pinia-plugin-persistedstate**：將指定的前端狀態保留在瀏覽器
- **Tailwind CSS 4**：版面配置與響應式樣式
- **Ant Design Vue**：表單、提示訊息、分頁等 UI 元件
- **Vitest、Nuxt Test Utils、Happy DOM**：單元測試與 Nuxt 整合測試
- **ESLint**：程式碼品質與格式檢查

## 本機啟動

### 系統需求

- Node.js 24（CI 使用 `24.22.2`）
- pnpm 10（專案指定 `10.26.0`）

### 安裝與執行

```bash
# 安裝相依套件
pnpm install

# 啟動開發伺服器
pnpm dev
```
