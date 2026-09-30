// Injected into every brief page: a slim top bar back to the portal and a closing call-to-action.
(function () {
  const css = `
  .kp-bar{position:sticky;top:0;z-index:100;display:flex;align-items:center;gap:10px;padding:10px 16px;
    background:rgba(248,246,241,.94);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);
    border-bottom:1px solid #EDE8DE;font:500 13.5px 'DM Sans',-apple-system,BlinkMacSystemFont,sans-serif}
  .kp-bar a{text-decoration:none;color:#6B6560}
  .kp-bar a:hover{color:#9A7B3E}
  .kp-bar .kp-name{margin:0 auto;font-family:'Playfair Display',Georgia,serif;font-weight:600;color:#1A1A1A;font-size:15px}
  .kp-bar .kp-book{background:#9A7B3E;color:#fff;padding:7px 13px;border-radius:8px;font-weight:600;white-space:nowrap}
  .kp-bar .kp-book:hover{background:#876A33;color:#fff}
  @media(max-width:520px){.kp-bar .kp-name{display:none}.kp-bar .kp-book{margin-left:auto}}
  .kp-cta{max-width:820px;margin:0 auto 3rem;padding:0 1.4rem}
  .kp-cta-in{border:1px solid #C4A05A;background:#FBF7EE;border-radius:12px;padding:1.3rem 1.4rem;text-align:center;
    font-family:'DM Sans',-apple-system,sans-serif}
  .kp-cta-t{font-family:'Playfair Display',Georgia,serif;font-size:19px;font-weight:600;margin-bottom:.35rem;color:#1A1A1A}
  .kp-cta-s{font-size:14px;color:#6B6560;margin-bottom:1rem}
  .kp-cta-b{display:flex;gap:8px;justify-content:center;flex-wrap:wrap}
  .kp-cta-b a{text-decoration:none;font-weight:600;font-size:14px;padding:10px 16px;border-radius:9px}
  .kp-p{background:#9A7B3E;color:#fff}.kp-p:hover{background:#876A33;color:#fff}
  .kp-g{background:#fff;color:#1A1A1A;border:1px solid #EDE8DE}.kp-g:hover{border-color:#9A7B3E;color:#9A7B3E}`;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  const bar = document.createElement('div');
  bar.className = 'kp-bar';
  bar.innerHTML = `
    <a href="../insights.html">← 市场洞察 · Insights</a>
    <a class="kp-name" href="../index.html">Kelly Chan</a>
    <a class="kp-book" href="../book.html">📅 预约咨询 · Book</a>`;
  document.body.insertBefore(bar, document.body.firstChild);

  const cta = document.createElement('div');
  cta.className = 'kp-cta';
  cta.innerHTML = `
    <div class="kp-cta-in">
      <div class="kp-cta-t">这些新闻，对你的退休计划意味着什么？</div>
      <div class="kp-cta-s">What does today's news mean for your retirement plan? Find out in 3 minutes.</div>
      <div class="kp-cta-b">
        <a class="kp-p" href="../calculator.html">🧭 免费计算退休缺口 · Retirement calculator</a>
        <a class="kp-g" href="../book.html">预约咨询 · Book a consult</a>
      </div>
    </div>`;
  document.body.appendChild(cta);
})();
