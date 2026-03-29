/**
 * 공공데이터포털 Proxy + Static File Server
 * Endpoints: /api/apt-trade (매매), /api/apt-rent (전세)
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3456;

// ─── Load Environment Variables ──────────────────────────
let API_KEY = process.env.API_KEY || '';
let KAKAO_KEY = process.env.KAKAO_KEY || '';

try {
    const env = fs.readFileSync(path.join(__dirname, '.env'), 'utf8');
    const m1 = env.match(/^API_KEY=(.+)$/m);
    if (m1 && !process.env.API_KEY) API_KEY = m1[1].trim();
    const m2 = env.match(/^KAKAO_KEY=(.+)$/m);
    if (m2 && !process.env.KAKAO_KEY) KAKAO_KEY = m2[1].trim();
} catch (e) { }

const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
};

// ─── XML Parser ──────────────────────────────────────────
function parseXmlItems(xml) {
    const items = [];
    let pos = 0;
    while (true) {
        const s = xml.indexOf('<item>', pos);
        if (s === -1) break;
        const e = xml.indexOf('</item>', s);
        if (e === -1) break;
        const chunk = xml.substring(s + 6, e);
        const item = {};
        let fp = 0;
        while (true) {
            const fo = chunk.indexOf('<', fp);
            if (fo === -1) break;
            const fc = chunk.indexOf('>', fo);
            if (fc === -1) break;
            const tag = chunk.substring(fo + 1, fc).trim();
            if (tag.startsWith('/') || tag.endsWith('/')) { fp = fc + 1; continue; }
            const ve = chunk.indexOf('</' + tag + '>', fc);
            if (ve === -1) { fp = fc + 1; continue; }
            item[tag] = chunk.substring(fc + 1, ve).trim();
            fp = ve + tag.length + 3;
        }
        if (Object.keys(item).length > 0) items.push(item);
        pos = e + 7;
    }
    return items;
}

function xmlVal(xml, tag) {
    const s = xml.indexOf('<' + tag + '>');
    if (s === -1) return null;
    const e = xml.indexOf('</' + tag + '>', s);
    if (e === -1) return null;
    return xml.substring(s + tag.length + 2, e).trim();
}

function isOk(code) { return !code || /^0+$/.test(code.trim()); }

// ─── Fetch helper ────────────────────────────────────────
function apiFetch(apiPath, params) {
    return new Promise((resolve, reject) => {
        const qs = new URLSearchParams(params).toString();
        const fullPath = apiPath + '?serviceKey=' + API_KEY + '&' + qs;
        const req = https.request({
            hostname: 'apis.data.go.kr', port: 443, path: fullPath, method: 'GET',
            headers: { 'Accept': 'application/xml, text/xml, */*', 'User-Agent': 'AptGap/2.0' },
        }, res => {
            let d = ''; res.setEncoding('utf8');
            res.on('data', c => d += c);
            res.on('end', () => {
                console.log('  ' + (res.statusCode === 200 ? '✅' : '❌') + ' ' + res.statusCode + ' ' + params.LAWD_CD + '/' + params.DEAL_YMD + ' (' + d.length + 'b)');
                resolve({ status: res.statusCode, body: d });
            });
        });
        req.on('error', reject);
        req.end();
    });
}

async function handleApiRequest(res, apiPath, query) {
    const { LAWD_CD, DEAL_YMD, pageNo, numOfRows } = query;
    if (!API_KEY) { json(res, 500, { error: 'API key not configured' }); return; }
    if (!LAWD_CD || !DEAL_YMD) { json(res, 400, { error: 'Missing LAWD_CD or DEAL_YMD' }); return; }

    try {
        const r = await apiFetch(apiPath, { LAWD_CD, DEAL_YMD, pageNo: pageNo || '1', numOfRows: numOfRows || '1000' });
        if (r.status !== 200) { json(res, r.status, { error: 'API HTTP ' + r.status }); return; }
        const items = parseXmlItems(r.body);
        const rc = xmlVal(r.body, 'resultCode');
        if (!isOk(rc)) { json(res, 200, { error: xmlVal(r.body, 'resultMsg') || 'Error ' + rc }); return; }
        json(res, 200, { totalCount: parseInt(xmlVal(r.body, 'totalCount')) || items.length, items });
    } catch (err) {
        json(res, 502, { error: 'Proxy: ' + err.message });
    }
}

function json(res, code, obj) {
    res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(obj));
}

// ─── Server ──────────────────────────────────────────────
http.createServer(async (req, res) => {
    const u = url.parse(req.url, true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

    // API: 매매 실거래
    if (u.pathname === '/api/apt-trade') {
        await handleApiRequest(res, '/1613000/RTMSDataSvcAptTradeDev/getRTMSDataSvcAptTradeDev', u.query);
        return;
    }

    // API: 전세 실거래
    if (u.pathname === '/api/apt-rent') {
        await handleApiRequest(res, '/1613000/RTMSDataSvcAptRent/getRTMSDataSvcAptRent', u.query);
        return;
    }

    // API: Kakao key (for map)
    if (u.pathname === '/api/config') {
        json(res, 200, { kakaoKey: KAKAO_KEY || '' });
        return;
    }

    // Static
    let fp = u.pathname === '/' ? '/index.html' : u.pathname;
    fp = path.join(__dirname, fp);
    if (!fp.startsWith(__dirname)) { res.writeHead(403); res.end(); return; }
    const ext = path.extname(fp).toLowerCase();
    fs.readFile(fp, (err, data) => {
        if (err) { res.writeHead(404); res.end('Not Found'); return; }
        res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
        res.end(data);
    });
}).listen(PORT, () => {
    console.log('\n  🏠 아파트 갈아타기 계산기 v2\n  ✅ http://localhost:' + PORT);
    console.log('  🔑 API: ' + (API_KEY ? API_KEY.substring(0, 8) + '...' : '⚠️ MISSING'));
    console.log('  🗺️  Kakao: ' + (KAKAO_KEY ? 'loaded' : 'not set (map disabled)') + '\n');

    // Self-ping to prevent Render free tier spin down (every 10 minutes)
    const RENDER_URL = 'https://apartment-trade-up-calculator.onrender.com';
    setInterval(() => {
        https.get(RENDER_URL, (res) => {
            console.log(`  🏓 Self-ping: ${res.statusCode}`);
        }).on('error', (err) => {
            console.error(`  ❌ Self-ping failed: ${err.message}`);
        });
    }, 10 * 60 * 1000); // 10분마다
});
