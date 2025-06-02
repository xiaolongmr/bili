// api/bili.js

let cachedData = null;
let lastFetchTime = 0;
const CACHE_TTL = 10 * 60 * 1000; // 缓存 10 分钟

export default async function handler(req, res) {
    const now = Date.now();
    const apiUrl = 'https://api.bilibili.com/x/polymer/web-dynamic/v1/feed/space?host_mid=1';

    try {
        const apiRes = await fetch(apiUrl);
        const json = await apiRes.json();

        if (json.code === 0) {
            // 正常响应，更新缓存
            cachedData = json;
            lastFetchTime = now;

            res.setHeader('Access-Control-Allow-Origin', '*');
            return res.status(200).json(json);
        }

        // 出现 -352 错误，尝试从缓存返回
        if (json.code === -352 && cachedData && now - lastFetchTime < CACHE_TTL) {
            console.warn("Bilibili 返回 -352，使用缓存");
            res.setHeader('Access-Control-Allow-Origin', '*');
            return res.status(200).json(cachedData);
        }

        // 其他错误
        return res.status(500).json({ error: 'Bilibili API 错误', code: json.code });
    } catch (e) {
        // 网络请求失败，尝试从缓存返回
        if (cachedData && now - lastFetchTime < CACHE_TTL) {
            console.warn("网络错误，使用缓存");
            res.setHeader('Access-Control-Allow-Origin', '*');
            return res.status(200).json(cachedData);
        }

        return res.status(500).json({ error: '请求失败', detail: e.message });
    }
}
