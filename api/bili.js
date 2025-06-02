// File: api/bili.js

import fetch from 'node-fetch';
import fs from 'fs/promises';
import path from 'path';

const CACHE_DIR = '/tmp/bili_cache';
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

export default async function handler(req, res) {
    const { mid } = req.query;
    if (!mid) return res.status(400).json({ error: 'Missing mid parameter' });

    try {
        await fs.mkdir(CACHE_DIR, { recursive: true });
        const cacheFile = path.join(CACHE_DIR, `${mid}.json`);

        // Check cache
        let cached = null;
        try {
            const stats = await fs.stat(cacheFile);
            const age = Date.now() - stats.mtimeMs;
            if (age < CACHE_TTL) {
                cached = JSON.parse(await fs.readFile(cacheFile, 'utf-8'));
            }
        } catch (_) { }

        // Fetch from Bilibili
        const biliRes = await fetch(
            `https://api.bilibili.com/x/polymer/web-dynamic/v1/feed/space?host_mid=${mid}`
        );
        const biliJson = await biliRes.json();

        if (biliJson.code === 0) {
            await fs.writeFile(cacheFile, JSON.stringify(biliJson), 'utf-8');
            return res.setHeader('Access-Control-Allow-Origin', '*').status(200).json(biliJson);
        }

        // Fallback to cache
        if (cached) {
            return res.setHeader('Access-Control-Allow-Origin', '*').status(200).json(cached);
        }

        return res.status(502).json({ error: 'Bilibili fetch failed', code: biliJson.code });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Server error' });
    }
}
