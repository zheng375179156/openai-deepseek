# 智投热点助手 - A股投资决策辅助

<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

支持 DeepSeek / OpenAI 双引擎的智能A股热点追踪与投资分析工具。

## 🚀 快速开始

### 前置要求

- Node.js 18+ 
- npm 或 yarn

### 本地开发

#### 方式一：完整开发模式（推荐 - 包含API服务器）

1. **安装依赖**:
   ```bash
   npm install
   ```

2. **配置API密钥**:
   
   在应用设置中配置（推荐）：
   - 打开应用后，点击右上角 ⚙️ 设置图标
   - 输入你的 DeepSeek API Key 或 OpenAI API Key
   - API Key 会保存在浏览器本地存储中
   
   或者通过环境变量配置（可选）：
   ```bash
   # 创建 .env.local 文件
   DEEPSEEK_API_KEY=your_deepseek_key
   OPENAI_API_KEY=your_openai_key
   ```

3. **启动开发服务器**:
   ```bash
   npm run dev:full
   ```
   
   这会同时启动：
   - 前端开发服务器: `http://localhost:3000`
   - API服务器: `http://localhost:3001`
   
   浏览器会自动打开 `http://localhost:3000`

#### 方式二：仅前端开发（需要外部API）

如果API服务器已经在其他地方运行：

```bash
npm run dev
```

前端会在 `http://localhost:3000` 运行，API请求会通过代理转发。

#### 方式三：使用Vercel CLI（推荐用于生产环境测试）

如果你已安装 Vercel CLI：

```bash
# 安装Vercel CLI（如果未安装）
npm i -g vercel

# 启动Vercel开发服务器
vercel dev
```

这会启动完整的开发环境，包括API路由。

### 📦 构建与部署

#### 构建生产版本

```bash
npm run build
```

构建产物在 `dist` 目录。

#### 预览生产构建

```bash
npm run preview
```

#### 部署到Vercel

1. 将代码推送到GitHub/GitLab
2. 在 [Vercel](https://vercel.com) 导入项目
3. 配置环境变量：
   - `DEEPSEEK_API_KEY` (可选)
   - `OPENAI_API_KEY` (可选)
4. 部署完成！

### 🔧 故障排除

#### 问题1: 本地运行无法获取数据

**原因**: API路由需要服务器环境才能运行。

**解决方案**:
- 使用 `npm run dev:full` 启动完整开发环境
- 或使用 `vercel dev` 启动Vercel开发服务器
- 确保API服务器在 `http://localhost:3001` 运行

#### 问题2: 联网运行无法打开网址

**原因**: 可能是部署配置问题或网络问题。

**解决方案**:
1. 检查Vercel部署日志
2. 确认 `vercel.json` 配置正确
3. 检查环境变量是否已配置
4. 如果使用自定义域名，检查DNS配置

#### 问题3: API Key错误

**解决方案**:
1. 在应用设置中重新配置API Key
2. 检查API Key是否有效
3. DeepSeek API Key获取: https://platform.deepseek.com/
4. OpenAI API Key获取: https://platform.openai.com/api-keys

#### 问题4: 网络连接问题

如果在中国大陆：
- 访问 `esm.sh` CDN可能需要VPN
- 建议使用VPN或配置国内CDN镜像
- OpenAI API需要科学上网

### 📝 开发说明

#### 项目结构

```
├── api/              # Vercel Serverless Functions (API路由)
│   ├── market/      # 市场数据API
│   ├── holdings/    # 持仓分析API
│   ├── analyst/     # AI分析师API
│   └── ...
├── components/       # React组件
├── services/         # 业务逻辑服务
├── server-local.js   # 本地API服务器（开发用）
├── vite.config.ts    # Vite配置
└── vercel.json       # Vercel部署配置
```

#### 环境变量

- `DEEPSEEK_API_KEY`: DeepSeek API密钥
- `OPENAI_API_KEY`: OpenAI API密钥
- `API_PORT`: 本地API服务器端口（默认3001）
- `VITE_API_URL`: API服务器地址（开发用）

### 🎯 功能特性

- ✅ 实时A股热点追踪
- ✅ 游资动向分析
- ✅ AI投资建议
- ✅ 持仓管理
- ✅ 市场情绪分析
- ✅ 智能问答

### 📄 许可证

MIT License

### ⚠️ 免责声明

本应用数据为 AI 模拟或搜索聚合，仅供参考，不构成投资建议。
