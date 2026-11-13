(() => {
  const D = window.SHINDAN, $ = (s) => document.querySelector(s);
  const KEY = 'kuromitsu_shindan';
  const st = JSON.parse(localStorage.getItem(KEY) || '{}');
  const save = () => localStorage.setItem(KEY, JSON.stringify(st));
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const show = (id) => { ['#s1', '#s2', '#s3', '#s4'].forEach((x) => ($(x).hidden = x !== id)); scrollTo(0, 0); };

  const ORDER = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'];
  function signOf(y, m, d) {
    // 天文計算の表（その年の各星座のはじまりの日）で判定。表の外の年は平均的な境目で判定
    const t = (D.cal && D.cal.sign[y]) || [321, 420, 521, 622, 723, 823, 923, 1024, 1123, 1222, 120, 219];
    const md = m * 100 + d;
    let best = 'capricorn', bestStart = -1;
    t.forEach((start, i) => { if (start <= md && start > bestStart) { bestStart = start; best = ORDER[i]; } });
    return best;
  }
  function lifePath(y, m, d) {
    let n = String(y) + String(m).padStart(2, '0') + String(d).padStart(2, '0');
    let v = [...n].reduce((a, c) => a + +c, 0);
    while (v > 9 && ![11, 22, 33].includes(v)) v = [...String(v)].reduce((a, c) => a + +c, 0);
    return v;
  }
  function kyusei(y, m, d) {
    // 立春（2月4日ごろ）より前の生まれは前の年として数える
    const rs = (D.cal && D.cal.risshun[y]) || 204; const yy = (m * 100 + d < rs) ? y - 1 : y;
    const r = (11 - (yy % 9)) % 9; return r === 0 ? 9 : r;
  }

  // ---- step 1: 無料の結果 ----
  $('#f1').addEventListener('submit', (e) => {
    e.preventDefault();
    const sei = $('#sei').value.trim(), mei = $('#mei').value.trim(), b = $('#bd').value;
    if (!sei || !mei || !b) return;
    const name = sei + ' ' + mei;
    const [y, m, d] = b.split('-').map(Number);
    Object.assign(st, { name, sei, mei, birth: b, sign: signOf(y, m, d), lp: lifePath(y, m, d), ky: kyusei(y, m, d) });
    save(); renderFree(); show('#s2');
  });
  function renderFree() {
    const sg = st.sign, lp = D.lifepath[st.lp], ky = D.kyusei[st.ky];
    $('#free').innerHTML = `
      <div class="kuro-say"><img src="img/cut/${sg}.png" alt="黒ねこの占い師くろみつ"><p>${esc(st.mei)}さん、はじめまして。<br>黒ねこの占い師、くろみつです。<br>あなたの生まれた日の星を読みました。</p></div>
      <p style="text-align:center;margin:14px 0 0">${esc(st.name)}さんは</p>
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
      <div class="themes">${D.themes.map((t) => `<label class="chipbox"><input type="checkbox" value="${esc(t)}"${st.preTheme === t ? ' checked' : ''}> ${esc(t)}</label>`).join('')}</div>
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
    const sg = st.sign, lp = D.lifepath[st.lp], ky = D.kyusei[st.ky];
    const ax = ['A', 'B', 'C', 'D'].map((x) => D.axis_text[x][score(x) >= 0 ? 0 : 1]);
    const call = esc(st.mei || st.name);
    $('#res').innerHTML = `
      <div class="kuro-say"><img src="img/cut/base.png" alt="黒ねこの占い師くろみつ"><p>${call}さん、18の質問にこたえてくれてありがとう。<br>あなたの星と数字と、こたえを読みました。</p></div>
      <p style="text-align:center;margin:18px 0 0">${call}さんの心のかたちは</p>
      <h2 style="text-align:center;margin:4px 0 4px">「${esc(tn)}」タイプ</h2>
      <p style="text-align:center;color:var(--muted);margin:0 0 18px">${esc(td)}</p>
      <div class="chapter"><p class="ch-no">鑑定書 第1章（無料）</p><h3>${call}さんという人</h3>
      <p>${call}さんは、${D.signs[sg]}の太陽を持って生まれました。${esc(D.sign_trait[sg])}</p>
      <p>数秘術で見ると、ライフパス数は「${st.lp}」。${esc(lp[0])}です。${esc(lp[1])}</p>
      <p>そして九星気学の本命星は${esc(ky[0])}。${esc(ky[1])}</p>
      <p>18のこたえからは、こんな${call}さんが見えてきました。${esc(ax[0])}${esc(ax[1])}</p>
      <p>${esc(ax[2])}${esc(ax[3])}</p>
      ${tired ? `<p>${esc(D.tired_text)}</p>` : ''}${change ? `<p>${esc(D.change_text)}</p>` : ''}
      <p>星と数字とこたえ、3つが同じ方向を指しているところが、${call}さんの本当の強みです。2027年は、その強みがいちばん試され、いちばん報われる年になります。</p>
      <div class="hit"><p>当たっていましたか？</p><button type="button" data-hit="1">当たってる！</button><button type="button" data-hit="0">ちょっと違うかも</button><p class="hit-msg" hidden></p></div></div>
      <h2 style="margin-top:30px">${call}さんの運命の一文字</h2>
      <div class="card" style="text-align:center"><div class="shikishi"><div class="ichi">${esc(ichi['漢字'])}</div><span class="rakkan">くろみつ</span></div><p class="fine" style="margin:0 0 8px">※画面の文字は書体です。お申し込み後、書家・夢香が筆で書きます。</p><p style="margin:0">${esc(ichi['込める意味'])}。<br>「${esc(theme)}」を占ってほしいあなたを、そっと守る一文字です。</p>
      <p class="fine" style="margin:10px 0 0">この一文字を、書家・夢香が筆で書き、ご加護の待ち受けや色紙にしてお届けできます。</p></div>
      <div class="toc"><p class="toc-h">ここから本題。${call}さんの2027年を読みます</p>
      <div class="ch"><b>第2章　2027年、運気がいちばん動く月</b><p>${call}さんの2027年でいちばん運気が動くのは、<span class="fuse">〇月</span>です。その月、生まれた日の星に……</p></div>
      <div class="ch"><b>第3章　その前の月にしておくとよい準備</b><p>大きな流れが来る前に、${call}さんがひとつだけ整えておきたいのは……</p></div>
      <div class="ch"><b>第4章　追い風の3か月と、ひと休みしてよい月</b><p>追い風が吹くのは <span class="fuse">〇月・〇月・〇月</span>。反対に、無理をしなくていいのは <span class="fuse">〇月</span>……</p></div>
      <div class="ch"><b>第5章　1月〜12月、ひと月ひと言の運気カレンダー</b><p>1月は「<span class="fuse">〇〇〇〇</span>」、2月は「<span class="fuse">〇〇〇〇</span>」……</p></div>
      <div class="ch"><b>第6章　「${esc(theme)}」が動くのは何月？</b><p>${call}さんが占ってほしいと選んだ「${esc(theme)}」。星の配置から見ると……</p></div>
      ${st.worry ? `<div class="ch"><b>第6章より　「${esc(st.worry.slice(0, 24))}${st.worry.length > 24 ? '…' : ''}」へのこたえ</b><p>${call}さんが書いてくれたこと、ちゃんと読みました。くろみつの答えは……</p></div>` : ''}
      <div class="ch last"><b>第7章　${call}さんを守る一文字「${esc(ichi['漢字'])}」と、今年のお守りことば</b><p>……</p></div></div>
      <div class="buy"><p class="buy-h">${call}さんの「〇月」を、今すぐ読む</p>
      <a class="btn" href="kantei.html#order" data-plan="otameshi">私の「〇月」を読む（990円）<small>上の第2章〜第7章まで、${call}さんの名前入りの鑑定書（PDF）で</small></a>
      <p class="buy-note">1回990円（税込）・<b>月額ではありません</b>・はじめての方限定<br>ご注文から3日以内にメールでお届け</p></div>
      <div class="cmp"><h3>無料の星座占いと、何がちがうの？</h3><table>
      <tr><th></th><th>無料の星座占い</th><th class="pay">990円の鑑定書</th></tr>
      <tr><td>だれの運勢？</td><td>${D.signs[sg]}の人みんな</td><td class="pay"><b>${call}さんだけ</b><br><small>生年月日・フルネーム・18のこたえ</small></td></tr>
      <tr><td>使う占術</td><td>西洋占星術（太陽星座）</td><td class="pay">西洋占星術・数秘術・九星気学</td></tr>
      <tr><td>運気が動く月</td><td>星座全体の傾向</td><td class="pay"><b>${call}さんの月を名指し</b></td></tr>
      <tr><td>あなたの悩み</td><td>—</td><td class="pay">「${esc(theme)}」に答える</td></tr></table></div>`;
  }

  $('#res').addEventListener('click', (e) => {
    const h = e.target.closest('[data-hit]'); if (!h) return;
    const m = $('#res .hit-msg'); m.hidden = false;
    m.textContent = h.dataset.hit === '1' ? 'よかった。それでは、ここから本題。あなたの2027年を読んでいきますね。' : '教えてくれてありがとう。くわしい鑑定では、生まれた時間やあなたの悩みまで読むので、もっと深くあなたに近づけます。';
    st.hit = h.dataset.hit; save();
  });

  document.addEventListener('click', (e) => { const a = e.target.closest('[data-plan]'); if (a) localStorage.setItem('kuromitsu_plan', a.dataset.plan); });

  if (st.sei && st.birth) { $('#sei').value = st.sei; $('#mei').value = st.mei || ''; $('#bd').value = st.birth; }
  const q = new URLSearchParams(location.search);
  if (q.get('t')) { st.preTheme = q.get('t'); save(); const h = $('#theme-hint'); if (h) { h.hidden = false; h.textContent = '占うテーマ：' + q.get('t'); } }
  if (q.get('b')) $('#bd').value = q.get('b');
  if (q.get('sei')) $('#sei').value = q.get('sei');
  if (q.get('mei')) $('#mei').value = q.get('mei');
  if (q.get('sei') && q.get('mei') && q.get('b')) $('#f1').requestSubmit();
})();
