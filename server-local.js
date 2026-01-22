// 本地开发服务器 - 处理API路由
import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';

// 加载 .env 文件（如果存在）
config();

const app = express();
app.use(cors());
app.use(express.json());

// 适配Vercel Serverless Functions格式到Express
const adaptHandler = (handler) => {
  return async (req, res) => {
    // 将Express请求转换为Vercel格式
    const vercelReq = {
      method: req.method,
      body: req.body,
      headers: req.headers,
      query: req.query,
      url: req.url,
    };
    
    let statusCode = 200;
    const headers = {};
    
    const vercelRes = {
      statusCode: 200,
      headers: {},
      setHeader: (key, value) => {
        headers[key] = value;
        res.setHeader(key, value);
      },
      status: (code) => {
        statusCode = code;
        return vercelRes;
      },
      json: (data) => {
        Object.keys(headers).forEach(key => {
          res.setHeader(key, headers[key]);
        });
        res.status(statusCode).json(data);
      },
      end: (data) => {
        Object.keys(headers).forEach(key => {
          res.setHeader(key, headers[key]);
        });
        if (data) {
          res.status(statusCode).send(data);
        } else {
          res.status(statusCode).end();
        }
      },
    };

    try {
      await handler(vercelReq, vercelRes);
      // 如果handler没有调用res.json或res.end，默认返回200
      if (!res.headersSent) {
        res.status(statusCode).end();
      }
    } catch (error) {
      console.error('API Error:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: error.message || 'Internal Server Error' });
      }
    }
  };
};

// 动态导入并注册API路由
const registerRoutes = async () => {
  try {
    const reportHandler = (await import('./api/market/report.js')).default;
    const investorsHandler = (await import('./api/market/investors.js')).default;
    const dailyHandler = (await import('./api/report/daily.js')).default;
    const chatHandler = (await import('./api/analyst/chat.js')).default;
    const analyzeHandler = (await import('./api/holdings/analyze.js')).default;
    const holdingsReportHandler = (await import('./api/holdings/report.js')).default;
    const searchHandler = (await import('./api/stock/search.js')).default;
    const analyzeStockHandler = (await import('./api/analyze-stock.js')).default;

    app.all('/api/market/report', adaptHandler(reportHandler));
    app.all('/api/market/investors', adaptHandler(investorsHandler));
    app.all('/api/report/daily', adaptHandler(dailyHandler));
    app.all('/api/analyst/chat', adaptHandler(chatHandler));
    app.all('/api/holdings/analyze', adaptHandler(analyzeHandler));
    app.all('/api/holdings/report', adaptHandler(holdingsReportHandler));
    app.all('/api/stock/search', adaptHandler(searchHandler));
    app.all('/api/analyze-stock', adaptHandler(analyzeStockHandler));

    console.log('✅ API路由已注册');
  } catch (error) {
    console.error('❌ 注册API路由失败:', error);
  }
};

// 启动服务器
const PORT = process.env.API_PORT || 3001;
registerRoutes().then(() => {
  app.listen(PORT, () => {
    console.log(`\n📡 API服务器运行在 http://localhost:${PORT}`);
    console.log(`🔗 API端点: http://localhost:${PORT}/api/*`);
    
    // 检查环境变量配置
    const hasOpenAI = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim() !== '';
    const hasDeepSeek = process.env.DEEPSEEK_API_KEY && process.env.DEEPSEEK_API_KEY.trim() !== '';
    
    if (!hasOpenAI && !hasDeepSeek) {
      console.log(`\n⚠️  警告: 未检测到 API Key 配置`);
      console.log(`   请创建 .env 文件并配置以下环境变量之一：`);
      console.log(`   - OPENAI_API_KEY=sk-...`);
      console.log(`   - DEEPSEEK_API_KEY=sk-...`);
      console.log(`   或直接在系统环境变量中设置\n`);
    } else {
      console.log(`\n✅ 已检测到 API Key:`);
      if (hasOpenAI) console.log(`   - OpenAI: 已配置`);
      if (hasDeepSeek) console.log(`   - DeepSeek: 已配置`);
      console.log(``);
    }
  });
});
