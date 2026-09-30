// Live market strip on the home page (TradingView free "Tickers" widget: name, price, change).
// Only symbols TradingView allows in free widgets work here — tested 2026-09-30:
//   OK:  FOREXCOM:SPXUSD, FOREXCOM:DJI, FOREXCOM:NSXUSD, OANDA:XAUUSD, TVC:USOIL, FX_IDC:USDMYR
//   NOT: SP:SPX, DJ:DJI, NASDAQ:IXIC, NASDAQ:NDX, FTSEMYX:FBMKLCI ("only available on TradingView")
(function () {
  const MARKETS = [
    { proName: 'FOREXCOM:SPXUSD', zh: '标普 500', en: 'S&P 500' },
    { proName: 'FOREXCOM:DJI',    zh: '道琼斯 30', en: 'Dow 30' },
    { proName: 'FOREXCOM:NSXUSD', zh: '纳指 100', en: 'Nasdaq 100' },
    { proName: 'OANDA:XAUUSD',    zh: '黄金', en: 'Gold' },
    { proName: 'TVC:USOIL',       zh: 'WTI 原油', en: 'WTI Crude' },
    { proName: 'FX_IDC:USDMYR',   zh: '美元/令吉', en: 'USD/MYR' }
  ];
  const strip = document.getElementById('marketStrip');
  if (!strip) return;

  // Scrolling "Ticker Tape" everywhere: the static "Tickers" row only fits 4 of 6 even at 1280px
  // and 1 on phones (tested 2026-09-30). Set matches:true to try the static row again.
  const wide = { matches: false, addEventListener() {} };

  function build(lang) {
    const tape = !wide.matches;
    strip.className = 'mkt-strip ' + (tape ? 'is-tape' : 'is-row');
    strip.innerHTML = '<div class="tradingview-widget-container"><div class="tradingview-widget-container__widget"></div></div>';
    const s = document.createElement('script');
    s.src = 'https://s3.tradingview.com/external-embedding/' + (tape ? 'embed-widget-ticker-tape.js' : 'embed-widget-tickers.js');
    s.async = true;
    s.text = JSON.stringify(Object.assign({
      symbols: MARKETS.map(m => ({ proName: m.proName, title: lang === 'zh' ? m.zh : m.en })),
      isTransparent: true,
      showSymbolLogo: true,
      colorTheme: 'light',
      // 'en' keeps green = up (zh_CN colours rises red, the mainland China convention)
      locale: 'en'
    }, tape ? { displayMode: 'adaptive' } : {}));
    strip.firstChild.appendChild(s);
  }

  let current = null;
  function sync() {
    const key = (window.kpLang ? kpLang() : 'zh') + (wide.matches ? '-row' : '-tape');
    if (key !== current) { current = key; build(key.split('-')[0]); }
  }
  document.addEventListener('kp:lang', sync);

  // ---- KLCI: TradingView doesn't allow it in free widgets, so show the last verified close from the daily brief ----
  const card = document.getElementById('klciCard');
  let klci = null;
  function drawKlci() {
    if (!card || !klci) return;
    const zh = (window.kpLang ? kpLang() : 'zh') === 'zh';
    const up = klci.change >= 0, sign = up ? '+' : '';
    const [y, m, d] = klci.date.split('-').map(Number);
    const dateTxt = zh ? `${m}月${d}日收盘` : `Close ${new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' })}`;
    card.href = klci.brief ? 'briefs/' + klci.brief : 'briefs/index.html';
    card.title = zh ? `数据来源：${klci.source}（经每日简报核实）` : `Source: ${klci.source} (verified in the daily brief)`;
    card.innerHTML = `
      <span class="klci-name">${zh ? '富时大马 KLCI' : 'FBM KLCI'}</span>
      <span class="klci-price">${klci.close.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
      <span class="klci-chg ${up ? 'up' : 'dn'}">${sign}${klci.change.toFixed(2)} (${sign}${klci.changePct.toFixed(2)}%)</span>
      <span class="klci-date">${dateTxt}</span>`;
    card.hidden = false;
  }
  if (card) {
    // cache-bust: GitHub Pages caches files for 10 minutes
    fetch('markets/klci.json?t=' + Date.now()).then(r => r.ok ? r.json() : null).then(j => {
      if (j && isFinite(j.close) && isFinite(j.change) && isFinite(j.changePct) && j.date) { klci = j; drawKlci(); }
    }).catch(() => {});
    document.addEventListener('kp:lang', drawKlci);
  }
  wide.addEventListener ? wide.addEventListener('change', sync) : wide.addListener(sync);
  sync();
})();
