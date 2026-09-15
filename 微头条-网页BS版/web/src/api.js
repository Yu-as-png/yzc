// 简单 fetch 封装，基址走 vite 代理 /api -> localhost:3000
export async function request(path, { method = 'GET', body } = {}) {
  const token = localStorage.getItem('token') || '';
  const res = await fetch('/api' + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: 'Bearer ' + token } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  let json;
  try {
    json = await res.json();
  } catch {
    throw new Error('服务器响应异常');
  }
  if (json.code !== 0) {
    throw new Error(json.msg || '请求失败');
  }
  return json.data;
}

export const api = {
  get: (path, params) => request(path + (params ? '?' + new URLSearchParams(params) : '')),
  post: (path, body = {}) => request(path, { method: 'POST', body }),
  put: (path, body = {}) => request(path, { method: 'PUT', body }),
  del: (path) => request(path, { method: 'DELETE' }),
};
