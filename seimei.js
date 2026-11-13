(() => {
  const S = window.SEIMEI, $ = (s) => document.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const DAK = 'がぎぐげござじずぜぞだぢづでどばびぶべぼガギグゲゴザジズゼゾダヂヅデドバビブベボヴ', HAN = 'ぱぴぷぺぽパピプペポ';
  const BASE = { 'が': 'か', 'ぎ': 'き', 'ぐ': 'く', 'げ': 'け', 'ご': 'こ', 'ざ': 'さ', 'じ': 'し', 'ず': 'す', 'ぜ': 'せ', 'ぞ': 'そ', 'だ': 'た', 'ぢ': 'ち', 'づ': 'つ', 'で': 'て', 'ど': 'と', 'ば': 'は', 'び': 'ひ', 'ぶ': 'ふ', 'べ': 'へ', 'ぼ': 'ほ', 'ぱ': 'は', 'ぴ': 'ひ', 'ぷ': 'ふ', 'ぺ': 'へ', 'ぽ': 'ほ' };
  const kata2hira = (c) => String.fromCharCode(c.charCodeAt(0) - 0x60);
  function strokes(c, manual) {
    if (manual[c]) return manual[c];
    if (S.st[c]) return S.st[c];
    if (DAK.includes(c) || HAN.includes(c)) {
      const isK = c >= 'ァ', h = isK ? kata2hira(c) : c, b = BASE[h];
      const base = isK ? S.st[String.fromCharCode(b.charCodeAt(0) + 0x60)] : S.st[b];
      if (base) return base + 2; // 濁点・半濁点は2画（流派で異なる）
    }
    return 0;
  }
  const kw = (n) => S.kw[((n - 1) % 80) + 1];
  let manual = {};

  $('#fs').addEventListener('submit', (e) => {
    e.preventDefault();
    const sei = [...$('#sei').value.replace(/\s/g, '')], mei = [...$('#mei').value.replace(/\s/g, '')];
    if (!sei.length || !mei.length) return;
    const miss = [...new Set([...sei, ...mei].filter((c) => !strokes(c, manual)))];
    if (miss.length) {
      $('#miss').hidden = false;
      $('#miss').innerHTML = `<p style="margin:0 0 8px">画数がわからない文字があります。画数を入れてください。</p>` +
        miss.map((c) => `<label style="display:flex;align-items:center;gap:10px;margin:6px 0"><span style="font-size:24px">${esc(c)}</span><input type="number" min="1" max="40" data-c="${esc(c)}" style="width:90px"> 画</label>`).join('') +
        `<button class="btn" type="button" id="mok">この画数で診断する</button>`;
      $('#mok').onclick = () => {
        document.querySelectorAll('#miss [data-c]').forEach((x) => { if (+x.value > 0) manual[x.dataset.c] = +x.value; });
        $('#miss').hidden = true; $('#fs').requestSubmit();
      };
      return;
    }
    const a = sei.map((c) => strokes(c, manual)), b = mei.map((c) => strokes(c, manual));
    const sum = (x) => x.reduce((p, q) => p + q, 0);
    const ten = sum(a), chi = sum(b), jin = a[a.length - 1] + b[0], so = ten + chi;
    // 外格：姓・名が1文字のときは霊数1を足して数える（外格だけ。ほかの格には足さない）
    const gai = Math.max(so - jin, 0) + (a.length === 1 ? 1 : 0) + (b.length === 1 ? 1 : 0) || 1;
    const rows = [['人格', jin], ['地格', chi], ['外格', gai], ['総格', so], ['天格', ten]];
    const full = sei.join('') + ' ' + mei.join('');
    const who = ($('#who') && $('#who').value) || 'self';
    const call = who === 'self' ? esc(mei.join('')) + 'さん' : '「' + esc(full) + '」';
    $('#out').innerHTML = `
      <div class="kuro-say"><img src="img/cut/base.png" alt="黒ねこの占い師くろみつ"><p>${who === 'baby' ? 'すてきな名前の候補ですね。' : 'こんにちは、黒ねこの占い師くろみつです。'}<br>${call}の画数を読みました。</p></div>
      <h2 style="text-align:center;margin:16px 0 4px">${esc(full)}</h2>
      <div class="kakuzu">${[...sei, ...mei].map((c, i) => `<span class="${i < sei.length ? 'ks' : 'km'}"><b>${esc(c)}</b><small>${strokes(c, manual)}画</small></span>`).join('')}</div>
      <p style="text-align:center;margin:10px 0 18px">${who === 'self' ? 'あなた' : 'この名前'}のいちばんの力は<br><strong style="font-size:26px;font-family:var(--maru)">「${esc(kw(jin))}」</strong><br><small style="color:var(--muted)">人格 ${jin}画（名前の中心にある力）</small></p>
      <div class="kakus">${rows.map(([k, n]) => `<div class="card"><h3 style="margin:0 0 4px">${k}　${n}画「${esc(kw(n))}」</h3><p class="fine" style="margin:0">${esc(S.kaku[k])}</p></div>`).join('')}</div>
      <div class="share"><p>結果をシェアする（名前は入りません）</p><a target="_blank" rel="noopener" href="https://twitter.com/intent/tweet?text=${encodeURIComponent('くろみつ占いの姓名診断、わたしの名前のいちばんの力は「' + kw(jin) + '」だった #くろみつ占い')}&url=${encodeURIComponent('https://kuromitsuuranai.jp/seimei.html')}">Xでシェア</a><a target="_blank" rel="noopener" href="https://social-plugins.line.me/lineit/share?url=${encodeURIComponent('https://kuromitsuuranai.jp/seimei.html')}">LINEで送る</a></div>
      ${who === 'self' ? `<div class="cta"><h3>${call}の名前と生年月日で、<br>2027年も読んでみませんか？</h3><p style="margin:0 0 6px">名前の画数に、星・数字・九星を合わせて、くろみつが鑑定書の第1章を無料で書きます。</p><a class="btn yama" href="shindan.html?sei=${encodeURIComponent(sei.join(''))}&mei=${encodeURIComponent(mei.join(''))}">名前はそのまま、生年月日を入れて読む<small>無料・3分</small></a></div>` : ''}
      <p class="fine" style="margin-top:12px">画数は新字体で数えています。旧字体や流派によって画数・読み方が変わることがあります。名前の良し悪しを決めるものではなく、名前が持つ力を知るための読みものです。</p>`;
    document.querySelectorAll('.seimei-plan').forEach((x) => { x.hidden = !(x.dataset.who.split(' ').includes(who)); });
    $('#res').hidden = false; $('#res').scrollIntoView({ behavior: 'smooth' });
  });
  const q = new URLSearchParams(location.search);
  if (q.get('sei') && q.get('mei')) { document.getElementById('sei').value = q.get('sei'); document.getElementById('mei').value = q.get('mei'); document.getElementById('fs').requestSubmit(); }
})();
