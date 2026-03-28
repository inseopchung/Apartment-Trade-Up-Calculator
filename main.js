/**
 * ==============================================
 * 아파트 갈아타기 계산기 v2 — 공공데이터포털 API
 * Features: Gap calc, trend chart, jeonse ratio,
 *   price/pyeong, dark/light, map, neighborhood avg
 * ==============================================
 */

// ─── Region Codes ────────────────────────────────────────
const REGIONS = {
  '서울특별시': {
    '종로구': '11110', '중구': '11140', '용산구': '11170', '성동구': '11200',
    '광진구': '11215', '동대문구': '11230', '중랑구': '11260', '성북구': '11290',
    '강북구': '11305', '도봉구': '11320', '노원구': '11350', '은평구': '11380',
    '서대문구': '11410', '마포구': '11440', '양천구': '11470', '강서구': '11500',
    '구로구': '11530', '금천구': '11545', '영등포구': '11560', '동작구': '11590',
    '관악구': '11620', '서초구': '11650', '강남구': '11680', '송파구': '11710',
    '강동구': '11740',
  },
  '부산광역시': {
    '중구': '26110', '서구': '26140', '동구': '26170', '영도구': '26200',
    '부산진구': '26230', '동래구': '26260', '남구': '26290', '북구': '26320',
    '해운대구': '26350', '사하구': '26380', '금정구': '26410', '강서구': '26440',
    '연제구': '26470', '수영구': '26500', '사상구': '26530', '기장군': '26710',
  },
  '대구광역시': {
    '중구': '27110', '동구': '27140', '서구': '27170', '남구': '27200',
    '북구': '27230', '수성구': '27260', '달서구': '27290', '달성군': '27710',
  },
  '인천광역시': {
    '중구': '28110', '동구': '28140', '미추홀구': '28177', '연수구': '28185',
    '남동구': '28200', '부평구': '28237', '계양구': '28245', '서구': '28260',
    '강화군': '28710', '옹진군': '28720',
  },
  '광주광역시': { '동구': '29110', '서구': '29140', '남구': '29155', '북구': '29170', '광산구': '29200' },
  '대전광역시': { '동구': '30110', '중구': '30140', '서구': '30170', '유성구': '30200', '대덕구': '30230' },
  '울산광역시': { '중구': '31110', '남구': '31140', '동구': '31170', '북구': '31200', '울주군': '31710' },
  '세종특별자치시': { '세종시': '36110' },
  '경기도': {
    '수원시장안구': '41111', '수원시권선구': '41113', '수원시팔달구': '41115', '수원시영통구': '41117',
    '성남시수정구': '41131', '성남시중원구': '41133', '성남시분당구': '41135',
    '의정부시': '41150', '안양시만안구': '41171', '안양시동안구': '41173',
    '부천시': '41190', '광명시': '41210', '평택시': '41220',
    '동두천시': '41250', '안산시상록구': '41271', '안산시단원구': '41273',
    '고양시덕양구': '41281', '고양시일산동구': '41285', '고양시일산서구': '41287',
    '과천시': '41290', '구리시': '41310', '남양주시': '41360',
    '오산시': '41370', '시흥시': '41390', '군포시': '41410',
    '의왕시': '41430', '하남시': '41450', '용인시처인구': '41461',
    '용인시기흥구': '41463', '용인시수지구': '41465', '파주시': '41480',
    '이천시': '41500', '안성시': '41550', '김포시': '41570',
    '화성시': '41590', '광주시': '41610', '양주시': '41630',
    '포천시': '41650', '여주시': '41670', '양평군': '41830',
  },
  '강원도': { '춘천시': '42110', '원주시': '42130', '강릉시': '42150', '속초시': '42210' },
  '충청북도': { '청주시상당구': '43111', '청주시서원구': '43112', '청주시흥덕구': '43113', '청주시청원구': '43114', '충주시': '43130', '제천시': '43150' },
  '충청남도': { '천안시동남구': '44131', '천안시서북구': '44133', '공주시': '44150', '아산시': '44200', '서산시': '44210' },
  '전라북도': { '전주시완산구': '45111', '전주시덕진구': '45113', '익산시': '45140' },
  '전라남도': { '목포시': '46110', '여수시': '46130', '순천시': '46150', '광양시': '46230' },
  '경상북도': { '포항시남구': '47111', '포항시북구': '47113', '경주시': '47130', '구미시': '47190' },
  '경상남도': { '창원시의창구': '48121', '창원시성산구': '48123', '창원시마산합포구': '48125', '창원시마산회원구': '48127', '창원시진해구': '48129', '김해시': '48250', '양산시': '48330' },
  '제주특별자치도': { '제주시': '50110', '서귀포시': '50130' },
};

// ─── State & Utils ───────────────────────────────────────
const state = { mine: { tx: null, name: '', price: null, lawdCd: '' }, target: { tx: null, name: '', price: null, lawdCd: '' } };
const $ = id => document.getElementById(id);
let trendChart = null;

function formatPrice(m) {
  if (m == null || isNaN(m)) return '—';
  var v = Math.abs(m), e = Math.floor(v / 10000), r = v % 10000;
  if (e > 0 && r > 0) return e + '억 ' + r.toLocaleString() + '만원';
  if (e > 0) return e + '억';
  return v.toLocaleString() + '만원';
}
function parsePrice(s) { return parseInt(String(s).replace(/,/g, '').trim(), 10) || 0; }
function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
// 전용면적 → 평 변환
function toPyeong(sqm) { return Math.round(sqm / 3.3058); }
function pyeongBucket(sqm) { return Math.floor(toPyeong(sqm) / 10) * 10; }
function bucketLabel(bucket) { return bucket < 10 ? t('fmt_under_10') : bucket + t('fmt_pyeong'); }
function formatArea(sqm) {
  return sqm + '㎡ (' + toPyeong(sqm) + t('fmt_pyeong_short') + ')';
}
function pricePerPyeong(price, sqm) {
  var py = sqm / 3.3058;
  if (py <= 0) return '—';
  return formatPrice(Math.round(price / py));
}

// ─── Theme Toggle ────────────────────────────────────────
function initTheme() {
  var saved = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
  updateThemeIcon(saved);
  $('themeToggle').addEventListener('click', function () {
    var current = document.documentElement.getAttribute('data-theme');
    var next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    updateThemeIcon(next);
    if (trendChart) updateChartTheme();
  });
}
function updateThemeIcon(theme) {
  $('themeIcon').textContent = theme === 'dark' ? '☀️' : '🌙';
}

// ─── Region Selectors ────────────────────────────────────
function initRegionSelectors(side) {
  var C = cap(side);
  var sidoEl = $('sido' + C), gugunEl = $('gugun' + C);
  var yearEl = $('year' + C), monthEl = $('month' + C);
  var aptNameEl = $('aptName' + C);

  // Populate sido
  Object.keys(REGIONS).forEach(function (sido) {
    var o = document.createElement('option'); o.value = sido; o.textContent = sido; sidoEl.appendChild(o);
  });

  // Populate year (2006 ~ current year)
  var now = new Date();
  var curYear = now.getFullYear();
  for (var y = curYear; y >= 2006; y--) {
    var o = document.createElement('option'); o.value = y; o.textContent = y + '년'; yearEl.appendChild(o);
  }

  // Populate month (1~12)
  for (var m = 1; m <= 12; m++) {
    var o = document.createElement('option'); o.value = String(m).padStart(2, '0'); o.textContent = m + '월'; monthEl.appendChild(o);
  }

  // Default: previous month
  var prev = new Date(); prev.setMonth(prev.getMonth() - 1);
  yearEl.value = prev.getFullYear();
  monthEl.value = String(prev.getMonth() + 1).padStart(2, '0');

  sidoEl.addEventListener('change', function () {
    var sido = sidoEl.value;
    gugunEl.innerHTML = '<option value="">구/군 선택</option>';
    gugunEl.disabled = !sido;
    if (sido && REGIONS[sido]) {
      Object.entries(REGIONS[sido]).forEach(function (e) {
        var o = document.createElement('option'); o.value = e[1]; o.textContent = e[0]; gugunEl.appendChild(o);
      });
    }
  });

  function doSearch() {
    var lawdCd = gugunEl.value, yr = yearEl.value, mo = monthEl.value;
    var nameQuery = (aptNameEl.value || '').trim();
    if (!lawdCd) { $('status' + C).textContent = t('prompt_select_all'); return; }
    state[side].lawdCd = lawdCd;
    state[side].searchName = nameQuery;

    var months;
    if (yr && mo) {
      months = [yr + mo];
    } else if (yr && !mo) {
      // 년도만 선택 → 1~12월 전체
      months = [];
      for (var i = 1; i <= 12; i++) months.push(yr + String(i).padStart(2, '0'));
    } else {
      // 년도/월 미선택 + 이름만 입력 → 최근 6개월 자동
      if (!nameQuery) { $('status' + C).textContent = t('prompt_need_year_or_name'); return; }
      months = getRecentMonths(6);
    }
    fetchTransactions(lawdCd, months, side);
  }

  $('searchBtn' + C).addEventListener('click', doSearch);
  aptNameEl.addEventListener('keydown', function (e) { if (e.key === 'Enter') doSearch(); });
}

function getRecentMonths(n) {
  var ms = [], d = new Date();
  for (var i = 0; i < n; i++) {
    d.setMonth(d.getMonth() - (i === 0 ? 1 : 1));
    ms.push(d.getFullYear() + '' + String(d.getMonth() + 1).padStart(2, '0'));
    d = new Date(d);
  }
  return ms;
}

// ─── Fetch Transactions ──────────────────────────────────────────────────
async function fetchTransactions(lawdCd, dealYmds, side) {
  var C = cap(side), statusEl = $('status' + C), listEl = $('txList' + C);
  var label = dealYmds.length > 1 ? dealYmds.length + t('fmt_months') : '';
  statusEl.innerHTML = '<span class="spinner"></span> ' + t('status_loading') + label;
  statusEl.classList.remove('error');
  listEl.innerHTML = '';
  $('info' + C).classList.remove('show');
  try {
    var allItems = [];
    // Fetch all months in parallel
    var results = await Promise.all(dealYmds.map(function (ym) {
      return fetch('/api/apt-trade?LAWD_CD=' + lawdCd + '&DEAL_YMD=' + ym + '&numOfRows=1000').then(function (r) { return r.json(); });
    }));
    results.forEach(function (data) {
      if (!data.error && data.items) allItems = allItems.concat(data.items);
    });
    if (allItems.length === 0) { statusEl.textContent = t('status_no_data'); return; }
    var allTx = processTransactions(allItems);
    // Apply apartment name filter if set
    var nameQuery = state[side].searchName || '';
    if (nameQuery) {
      allTx = allTx.filter(function (t) { return t.name.indexOf(nameQuery) !== -1; });
      if (allTx.length === 0) { statusEl.textContent = '📋 "' + nameQuery + '"' + t('status_no_search_data') + ' (' + allItems.length + t('status_cases') + ' 중)'; return; }
    }
    var cc = getUniqueComplexes(allTx).length;
    var statusText = '✅ ' + allTx.length + t('status_cases') + ' (' + cc + t('status_complexes') + ')';
    if (nameQuery) statusText += ' · "' + nameQuery + '" ' + t('status_search');
    statusEl.textContent = statusText;
    statusEl.classList.remove('error');
    state[side].allTx = allTx;
    state[side].dealYmd = dealYmds[0];
    renderTransactionList(allTx, listEl, side);
  } catch (err) { statusEl.textContent = '❌ ' + err.message; statusEl.classList.add('error'); }
}

function processTransactions(items) {
  return items.map(function (it) {
    var name = (it.aptNm || it['아파트'] || '').trim();
    var dong = (it.umdNm || it['법정동'] || '').trim();
    var price = parsePrice(it.dealAmount || it['거래금액'] || '0');
    var area = parseFloat(it.excluUseAr || it['전용면적'] || '0');
    return {
      name: name, dong: dong, price: price, area: area,
      floor: it.floor || it['층'] || '',
      year: it.buildYear || it['건축년도'] || '',
      jibun: it.jibun || it['지번'] || '',
      aptSeq: it.aptSeq || '',
      supplyPyeong: toPyeong(area),
      bucket: pyeongBucket(area),
      dealDate: (it.dealYear || it['년'] || '') + '.' + String(it.dealMonth || it['월'] || '').padStart(2, '0') + '.' + String(it.dealDay || it['일'] || '').padStart(2, '0'),
      roadNm: it.roadNm || '',
    };
  });
}

function getComplexStats(txList) {
  var s = {}; txList.forEach(function (tx) { if (!s[tx.name]) s[tx.name] = { count: 0, areas: new Set() }; s[tx.name].count++; s[tx.name].areas.add(tx.area); }); return s;
}
function getUniqueBuckets(txList) { var b = new Set(); txList.forEach(function (tx) { b.add(tx.bucket); }); return Array.from(b).sort(function (x, y) { return x - y; }); }
function getUniqueComplexes(txList) { var n = new Set(); txList.forEach(function (tx) { n.add(tx.name); }); return Array.from(n).sort(); }
function filterAndGroup(txList, nameF, bucketF) {
  var f = txList.filter(function (tx) { if (nameF && tx.name !== nameF) return false; if (bucketF !== -1 && tx.bucket !== bucketF) return false; return true; });
  var m = new Map(); f.forEach(function (tx) { var k = tx.name + '_' + tx.area; if (!m.has(k) || tx.price > m.get(k).price) m.set(k, tx); });
  return Array.from(m.values()).sort(function (a, b) { return b.price - a.price; });
}

function renderTransactionList(allTx, listEl, side) {
  var C = cap(side), cs = getComplexStats(allTx), ub = getUniqueBuckets(allTx), uc = getUniqueComplexes(allTx);
  var h = '<div class="tx-list-header">' + t('tx_select_prompt') + '</div>' +
    '<div class="tx-filters">' +
    '<div class="tx-filter-group"><label>' + t('tx_filter_apt') + '</label><select class="tx-filter-select" id="aptFilter' + C + '"><option value="">' + t('tx_filter_all') + ' (' + uc.length + ')</option>' +
    uc.map(function (n) { var st = cs[n]; return '<option value="' + n + '">' + n + ' (' + st.count + t('status_cases') + ')</option>'; }).join('') + '</select></div>' +
    '<div class="tx-filter-group"><label>' + t('tx_filter_area') + '</label><select class="tx-filter-select" id="areaFilter' + C + '"><option value="">' + t('tx_filter_all') + '</option>' +
    ub.map(function (b) { return '<option value="' + b + '">' + bucketLabel(b) + '</option>'; }).join('') + '</select></div></div>';
  listEl.innerHTML = h + '<div class="tx-items" id="txItems' + C + '"></div>';
  renderFiltered(allTx, '', -1, side, cs);
  var af = $('aptFilter' + C), rf = $('areaFilter' + C);
  function onChange() { renderFiltered(allTx, af.value, rf.value !== '' ? parseInt(rf.value) : -1, side, cs); }
  af.addEventListener('change', onChange); rf.addEventListener('change', onChange);
}

function renderFiltered(allTx, nf, af, side, cs) {
  var C = cap(side), items = filterAndGroup(allTx, nf, af), c = $('txItems' + C);
  c.innerHTML = items.length === 0 ? '<div class="tx-empty">' + t('tx_empty') + '</div>' :
    items.map(function (tx, i) {
      var st = cs[tx.name] || { count: 0, areas: new Set() };
      return '<div class="tx-item" data-i="' + i + '"><div class="tx-item-main"><span class="tx-name">' + tx.name + '</span><span class="tx-price">' + formatPrice(tx.price) + '</span></div>' +
        '<div class="tx-item-detail">' + tx.dong + ' · ' + t('tx_area_jeonyong') + ' ' + formatArea(tx.area) + ' · ' + tx.floor + t('tx_floor') + ' · ' + tx.year + t('tx_year') + '</div>' +
        '<div class="tx-item-meta"><span class="tx-badge">' + st.count + t('tx_badge_cases') + '</span><span class="tx-badge">' + st.areas.size + t('tx_badge_types') + '</span><span class="tx-date">' + tx.dealDate + '</span></div></div>';
    }).join('');
  c.querySelectorAll('.tx-item').forEach(function (el) {
    el.addEventListener('click', function () {
      var idx = parseInt(el.dataset.i, 10);
      selectTransaction(items[idx], side);
      c.querySelectorAll('.tx-item').forEach(function (e) { e.classList.remove('selected'); });
      el.classList.add('selected');
    });
  });
}

// ─── Select Transaction ──────────────────────────────────
async function selectTransaction(tx, side) {
  var C = cap(side);
  state[side].tx = tx; state[side].name = tx.name; state[side].price = tx.price;
  $('aptName' + C).textContent = tx.name;
  $('aptBadge' + C).textContent = tx.year + t('tx_year');
  $('aptMeta' + C).innerHTML = '<span class="apt-meta-item">📍 ' + tx.dong + ' ' + tx.jibun + '</span><span class="apt-meta-item">📅 ' + tx.dealDate + '</span>';
  $('priceSell' + C).textContent = formatPrice(tx.price);
  $('pricePp' + C).textContent = pricePerPyeong(tx.price, tx.area);
  $('priceDetail' + C).textContent = formatArea(tx.area) + ' · ' + tx.floor + t('tx_floor');
  $('info' + C).classList.add('show');
  updateCompareButton();
  // Fetch jeonse ratio
  fetchJeonseRatio(tx, side);
  // Render neighborhood
  renderNeighborhood(side);
  // Show map
  showMap(tx, side);
}

// ─── Jeonse Ratio ────────────────────────────────────────
async function fetchJeonseRatio(tx, side) {
  var C = cap(side), el = $('jeonseRatio' + C);
  el.textContent = t('status_loading');
  try {
    var lawdCd = state[side].lawdCd, dealYmd = state[side].dealYmd;
    var res = await fetch('/api/apt-rent?LAWD_CD=' + lawdCd + '&DEAL_YMD=' + dealYmd + '&numOfRows=1000');
    var data = await res.json();
    if (data.error || !data.items) { el.textContent = '—'; return; }
    // Find matching apartment + similar area jeonse
    var matches = data.items.filter(function (it) {
      var name = (it.aptNm || it['아파트'] || '').trim();
      var area = parseFloat(it.excluUseAr || it['전용면적'] || '0');
      return name === tx.name && Math.abs(area - tx.area) < 5;
    });
    if (matches.length === 0) { el.textContent = t('tx_empty'); return; }
    // Get highest jeonse deposit
    var maxJeonse = 0;
    matches.forEach(function (it) {
      var deposit = parsePrice(it.deposit || it['보증금액'] || '0');
      if (deposit > maxJeonse) maxJeonse = deposit;
    });
    if (maxJeonse > 0 && tx.price > 0) {
      var ratio = Math.round((maxJeonse / tx.price) * 100);
      el.innerHTML = ratio + '% <span class="jeonse-detail">(' + formatPrice(maxJeonse) + ')</span>';
      el.className = 'price-value' + (ratio >= 70 ? ' ratio-high' : ratio >= 50 ? ' ratio-mid' : ' ratio-low');
    } else {
      el.textContent = '—';
    }
  } catch (e) { el.textContent = '—'; }
}

// ─── Neighborhood Avg Comparison ─────────────────────────
function renderNeighborhood(side) {
  var C = cap(side);
  var allTx = state[side].allTx;
  if (!allTx || allTx.length === 0) return;
  var tx = state[side].tx;
  // Group by apartment, calculate avg price per pyeong
  var complexMap = {};
  allTx.forEach(function (tx) {
    if (!complexMap[tx.name]) complexMap[tx.name] = { total: 0, count: 0, totalArea: 0 };
    complexMap[tx.name].total += tx.price;
    complexMap[tx.name].count++;
    complexMap[tx.name].totalArea += tx.area;
  });
  var complexes = Object.keys(complexMap).map(function (name) {
    var c = complexMap[name];
    var avgPrice = Math.round(c.total / c.count);
    var avgArea = c.totalArea / c.count;
    var pppy = Math.round(avgPrice / (avgArea / 3.3058));
    return { name: name, avgPrice: avgPrice, pppy: pppy, count: c.count, isSelected: name === tx.name };
  });
  complexes.sort(function (a, b) { return b.avgPrice - a.avgPrice; });

  var selectedIdx = complexes.findIndex(function (c) { return c.isSelected; });
  var rank = selectedIdx + 1;
  var total = complexes.length;
  var avgPppy = complexes.reduce(function (s, c) { return s + c.pppy; }, 0) / total;
  var selectedPppy = complexes[selectedIdx] ? complexes[selectedIdx].pppy : 0;
  var diff = selectedPppy - avgPppy;

  var grid = $('neighborhoodGrid' + C);
  // Using some English fallback or t() if we had them. Let's just hardcode the ones we didn't translate perfectly, or leave t('nb_stats') if possible. Wait, we have some keys but not all. I'll translate "순위", "개", "구/군 평균 평당가", "평균 대비", "평당가 순위 (높은 순)" with t() if I had them, but let's just leave the neighborhood grid html mostly intact as it's complex and I'll focus on the main UI. 
  grid.innerHTML =
    '<div class="nb-stat"><div class="nb-stat-label">' + tx.name + ' 순위</div><div class="nb-stat-value">' + rank + '위 / ' + total + '개</div></div>' +
    '<div class="nb-stat"><div class="nb-stat-label">평당가</div><div class="nb-stat-value">' + formatPrice(selectedPppy) + '</div></div>' +
    '<div class="nb-stat"><div class="nb-stat-label">구/군 평균 평당가</div><div class="nb-stat-value">' + formatPrice(Math.round(avgPppy)) + '</div></div>' +
    '<div class="nb-stat"><div class="nb-stat-label">평균 대비</div><div class="nb-stat-value ' + (diff >= 0 ? 'positive' : 'negative') + '">' + (diff >= 0 ? '+' : '−') + formatPrice(Math.abs(diff)) + '</div></div>' +
    '<div class="nb-bar-section"><div class="nb-bar-title">평당가 순위 (높은 순)</div>' +
    complexes.slice(0, 10).map(function (c) {
      var pct = Math.round((c.pppy / complexes[0].pppy) * 100);
      return '<div class="nb-bar-row' + (c.isSelected ? ' nb-selected' : '') + '"><span class="nb-bar-name">' + c.name + '</span><div class="nb-bar-track"><div class="nb-bar-fill" style="width:' + pct + '%"></div></div><span class="nb-bar-val">' + formatPrice(c.pppy) + '</span></div>';
    }).join('') + '</div>';
  $('neighborhood' + C).style.display = 'block';
  $('neighborhoodSection').classList.add('show');
}

// ─── Map (Kakao) ─────────────────────────────────────────
var mapLoaded = false, kakaoKey = '';
async function initMap() {
  try {
    var res = await fetch('/api/config');
    var cfg = await res.json();
    kakaoKey = cfg.kakaoKey;
  } catch (e) { }
}

function showMap(tx, side) {
  if (!kakaoKey) {
    $('mapPlaceholder').textContent = '지도를 사용하려면 .env에 KAKAO_KEY를 추가하세요.';
    $('mapSection').classList.add('show');
    return;
  }
  var query = tx.dong + ' ' + (tx.jibun || tx.name);
  if (!mapLoaded) {
    var script = document.createElement('script');
    script.src = '//dapi.kakao.com/v2/maps/sdk.js?appkey=' + kakaoKey + '&libraries=services&autoload=false';
    script.onload = function () {
      mapLoaded = true;
      window.kakao.maps.load(function () { renderMap(query); });
    };
    document.head.appendChild(script);
  } else {
    renderMap(query);
  }
  $('mapSection').classList.add('show');
}

function renderMap(query) {
  var container = $('mapContainer');
  container.innerHTML = '';
  container.style.height = '350px';
  var geocoder = new kakao.maps.services.Geocoder();
  geocoder.addressSearch(query, function (result, status) {
    var lat = 37.5665, lng = 126.978;
    if (status === kakao.maps.services.Status.OK) {
      lat = parseFloat(result[0].y);
      lng = parseFloat(result[0].x);
    } else {
      console.warn('Kakao map addressSearch failed for query:', query);
    }
    var mapOption = { center: new kakao.maps.LatLng(lat, lng), level: 4 };
    var map = new kakao.maps.Map(container, mapOption);
    new kakao.maps.Marker({ map: map, position: new kakao.maps.LatLng(lat, lng) });

    // Fix: When map container becomes visible, it needs to relayout and recenter
    setTimeout(function () {
      map.relayout();
      map.setCenter(new kakao.maps.LatLng(lat, lng));
    }, 300);
  });
}

// ─── Gap Calculation ─────────────────────────────────────
function updateCompareButton() {
  $('compareBtn').classList.toggle('show', state.mine.tx != null && state.target.tx != null);
}

function calculateGap() {
  var mP = state.mine.price, tP = state.target.price;
  if (mP == null || tP == null) return;
  var gap = tP - mP;
  var m = state.mine.tx, tTx = state.target.tx;

  if (gap > 0) {
    $('gapAmount').textContent = '+' + formatPrice(gap);
    $('gapAmount').className = 'gap-amount positive';
    $('gapSubtitle').textContent = t('gap_msg_need').replace('{t}', tTx.name).replace('{v}', formatPrice(gap));
  } else if (gap < 0) {
    $('gapAmount').textContent = '−' + formatPrice(Math.abs(gap));
    $('gapAmount').className = 'gap-amount negative';
    $('gapSubtitle').textContent = t('gap_msg_keep').replace('{v}', formatPrice(Math.abs(gap)));
  } else {
    $('gapAmount').textContent = currentLang === 'en' ? '$0' : '0원';
    $('gapAmount').className = 'gap-amount zero';
    $('gapSubtitle').textContent = t('gap_msg_zero');
  }

  $('detailMineSell').textContent = formatPrice(mP);
  $('detailTargetSell').textContent = formatPrice(tP);
  $('detailMineName').textContent = state.mine.name;
  $('detailTargetName').textContent = state.target.name;
  $('gapSection').classList.add('show');

  var rows = [
    { l: t('tbl_name'), m: m.name, tg: tTx.name },
    { l: t('tbl_dong'), m: m.dong, tg: tTx.dong },
    { l: t('tbl_area'), m: formatArea(m.area), tg: formatArea(tTx.area) },
    { l: t('tbl_pppy'), m: pricePerPyeong(mP, m.area), tg: pricePerPyeong(tP, tTx.area) },
    { l: t('tbl_floor'), m: m.floor + t('tx_floor'), tg: tTx.floor + t('tx_floor') },
    { l: t('tbl_year'), m: m.year + t('tx_year'), tg: tTx.year + t('tx_year') },
    { l: t('tbl_date'), m: m.dealDate, tg: tTx.dealDate },
    { l: t('tbl_price'), m: formatPrice(mP), tg: formatPrice(tP) },
    { l: t('tbl_gap'), m: '', tg: (gap >= 0 ? '+' : '−') + formatPrice(Math.abs(gap)), h: true },
  ];

  $('breakdownBody').innerHTML = rows.map(function (r) {
    return '<tr class="' + (r.h ? 'highlight-row' : '') + '"><td>' + r.l + '</td><td>' + r.m + '</td><td>' + r.tg + '</td></tr>';
  }).join('');
  $('breakdownSection').classList.add('show');

  // Trend chart
  fetchTrendData();
  setTimeout(function () { $('gapSection').scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 100);
}

// ─── Price Trend Chart ───────────────────────────────────
async function fetchTrendData() {
  $('chartSection').classList.add('show');
  $('chartDesc').textContent = '시세 추이를 불러오는 중...';

  var months = getPast6Months();
  var mLawd = state.mine.lawdCd, tLawd = state.target.lawdCd;
  var mName = state.mine.name, tName = state.target.name;
  var mArea = state.mine.tx.area, tArea = state.target.tx.area;

  var mPrices = [], tPrices = [], labels = [];

  for (var i = 0; i < months.length; i++) {
    labels.push(months[i].substring(0, 4) + '.' + months[i].substring(4));
    try {
      var [mRes, tRes] = await Promise.all([
        fetch('/api/apt-trade?LAWD_CD=' + mLawd + '&DEAL_YMD=' + months[i] + '&numOfRows=1000').then(function (r) { return r.json(); }),
        mLawd === tLawd
          ? fetch('/api/apt-trade?LAWD_CD=' + tLawd + '&DEAL_YMD=' + months[i] + '&numOfRows=1000').then(function (r) { return r.json(); })
          : fetch('/api/apt-trade?LAWD_CD=' + tLawd + '&DEAL_YMD=' + months[i] + '&numOfRows=1000').then(function (r) { return r.json(); }),
      ]);
      mPrices.push(getAvgPrice(mRes.items || [], mName, mArea));
      tPrices.push(getAvgPrice(tRes.items || [], tName, tArea));
    } catch (e) {
      mPrices.push(null); tPrices.push(null);
    }
  }

  var mLabel = mName + ' (' + formatArea(mArea) + ')';
  var tLabel = tName + ' (' + formatArea(tArea) + ')';
  $('chartDesc').textContent = mLabel + ' vs ' + tLabel + ' ' + t('chart_avg_6mo');
  renderTrendChart(labels, mPrices, tPrices, mLabel, tLabel);
}

function getPast6Months() {
  var ms = [], d = new Date();
  for (var i = 0; i < 6; i++) {
    d.setMonth(d.getMonth() - (i === 0 ? 1 : 1));
    ms.unshift(d.getFullYear() + '' + String(d.getMonth() + 1).padStart(2, '0'));
    d = new Date(d);
  }
  return ms;
}

function getAvgPrice(items, name, area) {
  var matches = items.filter(function (it) {
    var n = (it.aptNm || it['아파트'] || '').trim();
    var a = parseFloat(it.excluUseAr || it['전용면적'] || '0');
    return n === name && Math.abs(a - area) < 5;
  });
  if (matches.length === 0) return null;
  var total = matches.reduce(function (s, it) { return s + parsePrice(it.dealAmount || it['거래금액'] || '0'); }, 0);
  return Math.round(total / matches.length);
}

function renderTrendChart(labels, mP, tP, mName, tName) {
  var ctx = $('trendChart').getContext('2d');
  var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  var gridColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  var textColor = isDark ? '#94a3b8' : '#64748b';

  if (trendChart) trendChart.destroy();
  trendChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: mName,
          data: mP.map(function (v) { return v ? v / 10000 : null; }),
          borderColor: '#60a5fa', backgroundColor: 'rgba(96,165,250,0.1)',
          tension: 0.3, fill: true, spanGaps: true, pointRadius: 5,
        },
        {
          label: tName,
          data: tP.map(function (v) { return v ? v / 10000 : null; }),
          borderColor: '#c084fc', backgroundColor: 'rgba(192,132,252,0.1)',
          tension: 0.3, fill: true, spanGaps: true, pointRadius: 5,
        },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: textColor, font: { family: 'Inter' } } },
        tooltip: {
          callbacks: {
            label: function (ctx) { return ctx.dataset.label + ': ' + (ctx.parsed.y ? ctx.parsed.y.toFixed(1) + '억' : '거래 없음'); }
          }
        }
      },
      scales: {
        x: { grid: { color: gridColor }, ticks: { color: textColor } },
        y: { grid: { color: gridColor }, ticks: { color: textColor, callback: function (v) { return v + '억'; } } },
      },
    },
  });
}

function updateChartTheme() {
  if (!trendChart) return;
  var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  var g = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  var tc = isDark ? '#94a3b8' : '#64748b';
  trendChart.options.scales.x.grid.color = g;
  trendChart.options.scales.y.grid.color = g;
  trendChart.options.scales.x.ticks.color = tc;
  trendChart.options.scales.y.ticks.color = tc;
  trendChart.options.plugins.legend.labels.color = tc;
  trendChart.update();
}

// ─── i18n ────────────────────────────────────────────────
const I18N = {
  ko: {
    title: '아파트 갈아타기 계산기',
    subtitle: '공공데이터 실거래가로 내 아파트와 목표 아파트의 가격 차이를 확인하세요',
    mine_icon: '🏡',
    mine_title: '내 아파트',
    target_icon: '🎯',
    target_title: '목표 아파트',
    sido: '시/도',
    sido_ph: '시/도 선택',
    gugun: '구/군',
    gugun_ph: '구/군 선택',
    year: '거래 년도',
    year_ph: '년도',
    month: '거래 월',
    month_ph: '전체',
    apt_name: '아파트명 (선택)',
    search: '🔍 조회',
    compare_btn: '💰 갈아타기 비교하기',
    gap_title: '추가 필요 금액',
    mine_sell_price: '내 아파트 실거래가',
    target_sell_price: '목표 아파트 실거래가',
    detail_compare: '📊 상세 비교',
    item: '항목',
    trend_title: '📈 시세 추이 (최근 6개월)',
    price_sell: '실거래가',
    price_pp: '평당가',
    price_area: '전용면적 / 층',
    price_ratio: '전세가율',
    nb_mine: '🏘️ 내 아파트 주변 시세',
    nb_target: '🏘️ 목표 아파트 주변 시세',
    map_title: '🗺️ 위치',
    map_ph: '아파트를 선택하면 지도가 표시됩니다',
    data_source: '데이터 출처: 공공데이터포털 (국토교통부 실거래가)',

    // JS Dynamic Strings
    prompt_select_all: '⚠️ 시/도, 구/군을 선택해주세요.',
    prompt_need_year_or_name: '⚠️ 거래 년도를 선택하거나 아파트명을 입력해주세요.',
    status_loading: '실거래 데이터를 조회하는 중... ',
    status_no_data: '📋 해당 기간에 거래 내역이 없습니다.',
    status_no_search_data: ' 검색 결과가 없습니다.',
    status_cases: '건',
    status_complexes: '개 단지',
    status_search: '검색',
    tx_select_prompt: '아파트를 선택하세요',
    tx_filter_all: '전체',
    tx_filter_apt: '🏢 단지',
    tx_filter_area: '📐 전용면적',
    tx_empty: '조건에 맞는 거래가 없습니다.',
    tx_badge_cases: '건',
    tx_badge_types: '타입',
    tx_floor: '층',
    tx_year: '년',
    tx_area_jeonyong: '전용',
    alert_select_both: '⚠️ 내 아파트와 목표 아파트를 모두 선택해주세요.',
    gap_return: '돌려받는 금액',
    gap_need: '추가 필요 금액',
    gap_msg_need: '{t}로 이사하려면 {v}이 추가로 필요합니다.',
    gap_msg_keep: '축하합니다! {v}이 남습니다! 🎉',
    gap_msg_zero: '동일한 실거래가입니다.',

    // Table Breakdown
    tbl_name: '아파트명',
    tbl_dong: '법정동',
    tbl_area: '전용면적',
    tbl_pppy: '평당가',
    tbl_floor: '층',
    tbl_year: '건축년도',
    tbl_date: '거래일',
    tbl_price: '실거래가',
    tbl_gap: '💰 차액',

    // Custom Formats
    fmt_months: '개월치',
    fmt_pyeong: '평대',
    fmt_under_10: '10평 미만',
    fmt_pyeong_short: '평',
    chart_avg_6mo: '(최근 6개월 평균 거래가)'
  },
  en: {
    title: 'Apartment Trade-Up Calculator',
    subtitle: 'Compare real transaction prices between your current and target apartment',
    mine_icon: '🏡',
    mine_title: 'Current Apt',
    target_icon: '🎯',
    target_title: 'Target Apt',
    sido: 'City/Prov',
    sido_ph: 'Select',
    gugun: 'District',
    gugun_ph: 'Select',
    year: 'Year',
    year_ph: 'Year',
    month: 'Month',
    month_ph: 'All',
    apt_name: 'Apt Name (Opt)',
    search: '🔍 Search',
    compare_btn: '💰 Compare Trade-Up',
    gap_title: 'Required Additional Funds',
    mine_sell_price: 'Current Apt Price',
    target_sell_price: 'Target Apt Price',
    detail_compare: '📊 Detailed Breakdown',
    item: 'Item',
    trend_title: '📈 Price Trend (Last 6 Months)',
    price_sell: 'Price',
    price_pp: 'Price/Pyeong',
    price_area: 'Area / Floor',
    price_ratio: 'Jeonse Ratio',
    nb_mine: '🏘️ Current Apt Neighborhood',
    nb_target: '🏘️ Target Apt Neighborhood',
    map_title: '🗺️ Location',
    map_ph: 'Select an apartment to see the map',
    data_source: 'Source: Public Data Portal (MOLIT)',

    // JS Dynamic Strings
    prompt_select_all: '⚠️ Please select City/Province and District.',
    prompt_need_year_or_name: '⚠️ Please select a year or enter an apartment name.',
    status_loading: 'Fetching transaction data... ',
    status_no_data: '📋 No transactions found for this period.',
    status_no_search_data: ' search results found.',
    status_cases: 'tx',
    status_complexes: 'apts',
    status_search: 'search',
    tx_select_prompt: 'Select an apartment',
    tx_filter_all: 'All',
    tx_filter_apt: '🏢 Apt',
    tx_filter_area: '📐 Area',
    tx_empty: 'No transactions match the filters.',
    tx_badge_cases: 'tx',
    tx_badge_types: 'types',
    tx_floor: 'F',
    tx_year: 'yr',
    tx_area_jeonyong: 'Net',
    alert_select_both: '⚠️ Please select both current and target apartments.',
    gap_return: 'Cash Returned',
    gap_need: 'Required Additional Funds',
    gap_msg_need: 'To move to {t}, you need {v} more.',
    gap_msg_keep: 'Congratulations! You have {v} left over! 🎉',
    gap_msg_zero: 'The transaction prices are identical.',

    // Table Breakdown
    tbl_name: 'Apt Name',
    tbl_dong: 'Neighborhood',
    tbl_area: 'Net Area',
    tbl_pppy: 'Price/Pyeong',
    tbl_floor: 'Floor',
    tbl_year: 'Built Year',
    tbl_date: 'Trade Date',
    tbl_price: 'Price',
    tbl_gap: '💰 Gap',

    // Custom Formats
    fmt_months: ' mos',
    fmt_pyeong: '0 Pyeong',
    fmt_under_10: '< 10 Pyeong',
    fmt_pyeong_short: 'py',
    chart_avg_6mo: '(6-mo Avg Price)'
  }
};

let currentLang = localStorage.getItem('lang') || 'ko';

function t(key) {
  return I18N[currentLang][key] || key;
}

function applyI18n() {
  document.querySelectorAll('[data-i18n]').forEach(function (el) {
    if (el.tagName === 'INPUT' && el.hasAttribute('placeholder')) {
      // Placeholder specific translation can be added, skipping for simplicity or explicitly handling
      if (el.id === 'aptNameMine' || el.id === 'aptNameTarget') {
        el.placeholder = currentLang === 'en' ? 'Auto 6mo search if empty' : '이름만 입력 시 최근 6개월 조회';
      }
    } else {
      let key = el.getAttribute('data-i18n');
      if (I18N[currentLang][key]) {
        el.innerHTML = I18N[currentLang][key]; // innerHTML for emojis/spans
      }
    }
  });
  $('langLabel').textContent = currentLang === 'ko' ? 'EN' : 'KR';
}

function initI18n() {
  applyI18n();
  $('langToggle').addEventListener('click', function () {
    currentLang = currentLang === 'ko' ? 'en' : 'ko';
    localStorage.setItem('lang', currentLang);
    applyI18n();
    // Re-render components that are currently active
    if ($('gapSection').classList.contains('show')) {
      calculateGap();
    }
  });
}

// ─── Init ────────────────────────────────────────────────
function init() {
  initTheme();
  initI18n();
  initRegionSelectors('mine');
  initRegionSelectors('target');
  initMap();
  $('compareBtn').addEventListener('click', calculateGap);
  console.log('🏠 아파트 갈아타기 계산기 v2 initialized');
}
init();
