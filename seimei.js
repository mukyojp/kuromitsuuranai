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
    const ten = sum(a), chi = sum(b), jin = a[a.length - 1] + b[0], so = ten + chi, gai = Math.max(so - jin, 1);
    const rows = [['人格', jin], ['地格', chi], ['外格', gai], ['総格', so], ['天格', ten]];
    const full = sei.join('') + ' ' + mei.join('');
    $('#out').innerHTML = `
      <h2 style="text-align:center;margin:0 0 4px">${esc(full)} さん</h2>
      <p style="text-align:center;color:var(--muted);margin:0 0 6px">${[...sei, ...mei].map((c) => `${esc(c)}${strokes(c, manual)}`).join('・')}</p>
      <p style="text-align:center;margin:0 0 18px">あなたの名前のいちばんの力は<br><strong style="font-size:22px">「${esc(kw(jin))}」</strong></p>
      <div class="kakus">${rows.map(([k, n]) => `<div class="card"><h3 style="margin:0 0 4px">${k}　${n}画「${esc(kw(n))}」</h3><p class="fine" style="margin:0">${esc(S.kaku[k])}</p></div>`).join('')}</div>
      <p class="fine" style="margin-top:12px">画数は新字体で数えています。旧字体や流派によって画数・読み方が変わることがあります。名前の良し悪しを決めるものではなく、あなたの名前が持つ力を知るための読みものです。</p>`;
    $('#res').hidden = false; $('#res').scrollIntoView({ behavior: 'smooth' });
  });
})();
