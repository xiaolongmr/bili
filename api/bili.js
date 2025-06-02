// api/bili.js

export default async function handler(req, res) {
    const url = 'https://api.bilibili.com/x/polymer/web-dynamic/v1/feed/space?host_mid=1716314498';

    const r = await fetch(url);
    const data = await r.json();

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json(data);
}
