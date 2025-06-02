// api/proxy-image.js

export default async function handler(req, res) {
    const { url } = req.query;
    if (!url) return res.status(400).send('Missing url');

    try {
        const imageRes = await fetch(url);
        const contentType = imageRes.headers.get("content-type");
        const buffer = await imageRes.arrayBuffer();

        res.setHeader("Content-Type", contentType);
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.send(Buffer.from(buffer));
    } catch (err) {
        res.status(500).send('Proxy image failed.');
    }
}
