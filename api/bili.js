// 文件路径：/api/bili.js

let cache = {};

export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*"); // 跨域支持

    const { mid } = req.query;
    if (!mid) return res.status(400).json({ error: "Missing mid" });

    // 判断是否有缓存且未过期
    const now = Date.now();
    const cached = cache[mid];
    if (cached && now - cached.time < 10 * 60 * 1000) {
        console.log("从缓存读取：" + mid);
        return res.status(200).json(cached.data);
    }

    try {
        const resp = await fetch(
            `https://api.bilibili.com/x/polymer/web-dynamic/v1/feed/space?host_mid=${mid}`
        );
        const data = await resp.json();

        if (data.code === 0) {
            cache[mid] = { data, time: now }; // 缓存成功结果
            return res.status(200).json(data);
        }

        // B站报错 -352 且有旧缓存，就返回旧缓存
        if (data.code === -352 && cached) {
            console.log("接口返回-352，使用旧缓存：" + mid);
            return res.status(200).json(cached.data);
        }

        // 没有缓存就返回报错
        return res.status(502).json({ error: "Bilibili API Error", data });

    } catch (err) {
        console.error("异常：", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}
