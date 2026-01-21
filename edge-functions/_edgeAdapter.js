export async function adaptHandler(handler, context) {
  const { request, env } = context;

  const url = new URL(request.url);

  let body = null;
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    try {
      body = await request.json();
    } catch {
      body = null;
    }
  }

  // Express/Vercel 样式的 req 对象，传递 EdgeOne env 方便在 handler 中使用
  const vercelReq = {
    method: request.method,
    body,
    headers: Object.fromEntries(request.headers),
    query: Object.fromEntries(url.searchParams),
    url: request.url,
    env,
  };

  let statusCode = 200;
  const headers = {};
  let responseBody = null;

  const vercelRes = {
    setHeader(key, value) {
      headers[key] = value;
    },
    status(code) {
      statusCode = code;
      return vercelRes;
    },
    json(data) {
      responseBody = JSON.stringify(data);
      if (!headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
      }
    },
    end(data) {
      if (data !== undefined) {
        responseBody = data;
      }
    },
  };

  await handler(vercelReq, vercelRes);

  return new Response(responseBody ?? '', {
    status: statusCode,
    headers,
  });
}

