(() => {
  const D = window.SHINDAN, $ = (s) => document.querySelector(s);
  const KEY = 'kuromitsu_shindan';
  const st = JSON.parse(localStorage.getItem(KEY) || '{}');
  const save = () => localStorage.setItem(KEY, JSON.stringify(st));
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const show = (id) => { ['#s1', '#s2', '#s3', '#s4'].forEach((x) => ($(x).hidden = x !== id)); scrollTo(0, 0); };

  function signOf(m, d) {
    const t = [[1, 20, 'aquarius'], [2, 19, 'pisces'], [3, 21, 'aries'], [4, 20, 'taurus'], [5, 21, 'gemini'], [6, 22, 'cancer'], [7, 23, 'leo'], [8, 23, 'virgo'], [9, 23, 'libra'], [10, 24, 'scorpio'], [11, 23, 'sagittarius'], [12, 22, 'capricorn']];
    let s = 'capricorn'; for (const [mm, dd, n] of t) if (m > mm || (m === mm && d >= dd)) s = n; return s;
  }
  function lifePath(y, m, d) {
    let n = String(y) + String(m).padStart(2, '0') + String(d).padStart(2, '0');
    let v = [...n].reduce((a, c) => a + +c, 0);
    while (v > 9 && ![11, 22, 33].includes(v)) v = [...String(v)].reduce((a, c) => a + +c, 0);
    return v;
  }
  function kyusei(y, m, d) {
    // 立春（2月4日ごろ）より前の生まれは前の年として数える
    const yy = (m < 2 || (m === 2 && d < 4)) ? y - 1 : y;
    const r = (11 - (yy % 9)) % 9; return r === 0 ? 9 : r;
  }

  // ---- step 1: 無料の結果 ----
  $('#f1').addEventListener('submit', (e) => {
    e.preventDefault();
    const sei = $('#sei').value.trim(), mei = $('#mei').value.trim(), b = $('#bd').value;
    if (!sei || !mei || !b) return;
    const name = sei + ' ' + mei;
    const [y, m, d] = b.split('-').map(Number);
    Object.assign(st, { name, sei, mei, birth: b, sign: signOf(m, d), lp: lifePath(y, m, d), ky: kyusei(y, m, d) });
    save(); renderFree(); show('#s2');
  });
  function renderFree() {
    const sg = st.sign, lp = D.lifepath[st.lp], ky = D.kyusei[st.ky];
    $('#free').innerHTML = `
      <img src="img/cut/${sg}.png" alt="" style="display:block;width:170px;margin:0 auto 10px">
      <p style="text-align:center;margin:0">${esc(st.name)}さんは</p>
      <h2 style="text-align:center;margin:4px 0 18px">${D.signs[sg]}・${esc(lp[0])}</h2>
      <div class="card"><h3>西洋占星術　太陽星座は${D.signs[sg]}</h3><p style="margin:0">2027年の${D.signs[sg]}の一文字は「${esc(D.kanji[sg])}」。<a href="signs/${sg}.html">2027年の運勢を読む</a></p></div>
      <div class="card"><h3>数秘術　ライフパス数 ${st.lp}「${esc(lp[0])}」</h3><p style="margin:0">${esc(lp[1])}</p></div>
      <div class="card"><h3>九星気学　本命星は${esc(ky[0])}</h3><p style="margin:0">${esc(ky[1])}</p></div>
      <div class="card"><h3>姓名判断　「${esc(st.sei)} ${esc(st.mei)}」の画数</h3><p style="margin:0">お名前の画数が持つ力も、無料で読めます。<a href="seimei.html?sei=${encodeURIComponent(st.sei)}&mei=${encodeURIComponent(st.mei)}">名前の画数を見る</a></p></div>`;
  }
  $('#go2').addEventListener('click', () => { st.ans = []; st.qi = 0; save(); renderQ(); show('#s3'); });

  // ---- step 2: 質問 ----
  function renderQ() {
    const qs = D.questions, i = st.qi;
    if (i < qs.length) {
      $('#qbox').innerHTML = `
        <p class="fine" style="margin:0 0 6px">質問 ${i + 1} / ${qs.length}</p>
        <div class="bar"><i style="width:${(i / qs.length) * 100}%"></i></div>
        <h2 style="margin:22px 0 26px;min-height:3em">${esc(qs[i].q)}</h2>
        <div class="ans5">${D.choices.map(([l, v]) => `<button data-v="${v}"${st.ans[i] === v ? ' class="sel"' : ''}>${l}</button>`).join('')}</div>
        ${i ? '<button class="back" data-back>ひとつ戻る</button>' : ''}`;
      return;
    }
    $('#qbox').innerHTML = `
      <div class="bar"><i style="width:100%"></i></div>
      <h2 style="margin:22px 0 10px">いちばん占ってほしいことは？</h2><p class="fine" style="margin:0 0 12px">いくつでも選べます</p>
      <div class="themes">${D.themes.map((t) => `<label class="chipbox"><input type="checkbox" value="${esc(t)}"> ${esc(t)}</label>`).join('')}</div>
      <h2 style="margin:24px 0 10px">今、気になっていること</h2>
      <textarea id="worry" placeholder="例：転職するか迷っています／来年こそ恋人がほしい（書かなくても大丈夫）"></textarea>
      <label class="fine" style="display:block;margin-top:14px">生まれた時間（わかれば。鑑定がくわしくなります）</label><input type="time" id="btime">
      <button class="btn" id="go3" style="margin-top:20px">結果を見る</button>`;
    $('#go3').onclick = () => {
      st.themes = [...document.querySelectorAll('.themes input:checked')].map((x) => x.value);
      st.worry = $('#worry').value.trim(); st.time = $('#btime').value; save(); renderResult(); show('#s4');
    };
  }
  $('#qbox').addEventListener('click', (e) => {
    const b = e.target.closest('[data-v]');
    if (b) { st.ans[st.qi] = +b.dataset.v; st.qi++; save(); renderQ(); return; }
    if (e.target.closest('[data-back]')) { st.qi = Math.max(0, st.qi - 1); save(); renderQ(); }
  });

  // ---- step 3: 回答から読む（無料の一部）＋くわしい鑑定 ----
  function score(axis) {
    return D.questions.reduce((a, q, i) => a + (q.axis === axis ? (q.rev ? -1 : 1) * (st.ans[i] || 0) : 0), 0);
  }
  function renderResult() {
    const code = ['A', 'B', 'C', 'D'].map((x) => (score(x) >= 0 ? x : x.toLowerCase())).join('');
    const [tn, td] = D.types[code];
    const tired = score('E') >= 3, change = score('F') >= 3;
    st.type = code; save();
    const theme = (st.themes && st.themes[0]) || '2027年の全体の流れ';
    // 運命の一文字：選んだテーマに合う候補から、生年月日と回答で一つに決める（同じ入力なら毎回同じ字）
    const want = (D.theme_map[theme] || []);
    let pool = D.ichimoji.filter((r) => want.includes(r['テーマ']));
    if (!pool.length) pool = D.ichimoji;
    const seed = [...(st.birth + code + st.ans.join(''))].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
    const ichi = pool[seed % pool.length]; st.ichimoji = ichi['漢字']; save();
    $('#res').innerHTML = `
      <img src="img/cut/${st.sign}.png" alt="" style="display:block;width:140px;margin:0 auto 8px">
      <p style="text-align:center;margin:0">${esc(st.name)}さんの心のかたちは</p>
      <h2 style="text-align:center;margin:4px 0 4px">「${esc(tn)}」タイプ</h2>
      <p style="text-align:center;color:var(--muted);margin:0 0 18px">${esc(td)}</p>
      <div class="card"><p style="margin:0">${tired ? 'このところ、まわりのためにがんばってきた時間が長かったようです。2027年は、そのがんばりを自分にも向けてあげる年。' : '今のあなたには、新しいことを受けとめる余白があります。2027年は、その余白に何を入れるかがテーマです。'}
      ${change ? '心の中で、決めたいことがはっきりしてきていますね。くろみつは、その決断のタイミングを星から読みます。' : ''}</p></div>
      <h2 style="margin-top:30px">あなたの運命の一文字</h2>
      <div class="card" style="text-align:center"><div class="ichi">${esc(ichi['漢字'])}</div><p style="margin:0">${esc(ichi['込める意味'])}。<br>「${esc(theme)}」を占ってほしいあなたを、そっと守る一文字です。</p>
      <p class="fine" style="margin:10px 0 0">この一文字を、書家・夢香が筆で書き、ご加護の待ち受けや額装色紙にしてお届けできます。</p></div>
      <h2 style="margin-top:30px">ここから先は、あなたの回答で書く鑑定書</h2>
      <p class="lead">生年月日・お名前・${st.ans.length}の回答・「${esc(theme)}」をもとに、くろみつがあなただけの2027年を読み解きます。</p>
      <div class="locked"><p>第1章　あなたという人／第2章　「${esc(tn)}」タイプのあなたが2027年に伸びる力／第3章　数字と九星が教えること／第4章　2027年の大きな流れ／第5章　「${esc(theme)}」がいちばん動く月……</p></div>`;
  }

  if (st.sei && st.birth) { $('#sei').value = st.sei; $('#mei').value = st.mei || ''; $('#bd').value = st.birth; }
  const q = new URLSearchParams(location.search);
  if (q.get('b')) $('#bd').value = q.get('b');
  if (q.get('sei')) $('#sei').value = q.get('sei');
  if (q.get('mei')) $('#mei').value = q.get('mei');
  if (q.get('sei') && q.get('mei') && q.get('b')) $('#f1').requestSubmit();
})();
