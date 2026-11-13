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
  // 名前の画数（姓名診断と同じ数え方。わからない字があれば null）
  function nameKaku(sei, mei) {
    const st_ = D.strokes || {}, get = (c) => st_[c] || 0;
    const a = [...sei].map(get), b = [...mei].map(get);
    if (!a.length || !b.length || [...a, ...b].some((x) => !x)) return null;
    const sum = (x) => x.reduce((p, q) => p + q, 0);
    return { jin: a[a.length - 1] + b[0], so: sum(a) + sum(b) };
  }
  const nkw = (n) => (D.name_kw ? D.name_kw[String(((n - 1) % 80) + 1)] : '');
  function renderFree() {
    const sg = st.sign, lp = D.lifepath[st.lp], ky = D.kyusei[st.ky], C = D.ch1 || {};
    const call = esc(st.mei);
    const sKw = D.sign_kw[sg] || [], lKw = D.lp_kw[String(st.lp)] || [], kk = nameKaku(st.sei, st.mei);
    const chips = [...sKw.slice(0, 3), ...lKw, kk ? nkw(kk.jin) : ''].filter(Boolean);
    const signText = (C.sign && C.sign[sg] && C.sign[sg].surface) ? C.sign[sg].surface.replace(/\{name\}/g, st.mei) : D.sign_trait[sg];
    const lpText = (C.lifepath && C.lifepath[String(st.lp)]) ? C.lifepath[String(st.lp)].replace(/\{name\}/g, st.mei) : lp[1];
    const kyText = (C.kyusei && C.kyusei[String(st.ky)]) ? C.kyusei[String(st.ky)].replace(/\{name\}/g, st.mei) : ky[1];
    const best = (D.best[sg] || []).map((m) => m + '月').join('と');
    const catchS = (C.sign_catch && C.sign_catch[sg]) ? C.sign_catch[sg][0] : '';
    $('#free').innerHTML = `
      <div class="kuro-say"><img src="img/cut/${sg}.png" alt="黒ねこの占い師くろみつ"><p>${call}さん、はじめまして。黒ねこの占い師、くろみつです。<br>あなたが生まれた日の空と、数字と、お名前を読みました。</p></div>
      <div class="free-top"><p class="ft-k">${esc(st.name)}さんは</p><h2>${D.signs[sg]} × ${esc(lp[0])} × ${esc(ky[0])}</h2>
      <p class="ft-l">あなたをあらわすことば</p><div class="chips">${chips.map((c) => `<span>${esc(c)}</span>`).join('')}</div></div>
      <div class="rcard r-sei"><p class="rc-t"><span>西洋占星術</span>太陽星座　${D.signs[sg]}</p><p>${esc(signText)}</p>
      <div class="rc-y"><b>2027年の${D.signs[sg]}</b>　一文字は「${esc(D.kanji[sg])}」${catchS ? '　' + esc(catchS) : ''}<br>星座全体で運気が高まるのは <b>${best}</b>。<a href="signs/${sg}.html">月別の運勢を見る</a></div></div>
      <div class="rcard r-lp"><p class="rc-t"><span>数秘術</span>ライフパス数　${st.lp}「${esc(lp[0])}」</p><p>${esc(lpText)}</p></div>
      <div class="rcard r-ky"><p class="rc-t"><span>九星気学</span>本命星　${esc(ky[0])}</p><p>${esc(kyText)}</p></div>
      <div class="rcard r-mei"><p class="rc-t"><span>姓名判断</span>「${esc(st.sei)} ${esc(st.mei)}」</p>${kk ? `<p>名前の中心にある人格は <b>${kk.jin}画「${esc(nkw(kk.jin))}」</b>、人生全体をあらわす総格は <b>${kk.so}画「${esc(nkw(kk.so))}」</b>。名前の画数にも、${call}さんらしさが表れています。</p>` : '<p>お名前の画数は、姓名診断でくわしく読めます。</p>'}<a href="seimei.html?sei=${encodeURIComponent(st.sei)}&mei=${encodeURIComponent(st.mei)}">五つの画数を全部見る</a></div>
      <div class="free-hook"><p>ここまでが、${call}さんが生まれ持った<b>「地図」</b>です。</p>
      <p>でも、今の${call}さんがどこにいて、何をがんばっていて、何に迷っているのか。それは生年月日だけでは読めません。</p>
      <p>星座全体の高まりは${best}。けれど、${call}さんの星と数字と、今の心で見ると、いちばん運気が動く月は、それとは別の月かもしれません。</p></div>`;
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
  // 第1章：ch1_texts.json の部品を、しいたけ占いに学んだ順番で並べる（部品がなければ旧版の短い文）
  function ch1Html(call, sg, theme, tired, change, code, ax, lp, ky, tn) {
    const C = D.ch1, fill = (x) => esc(x || '').replace(/\{name\}/g, call);
    if (!C || !C.sign || !C.sign[sg]) {
      return `<p>${call}さんは、${D.signs[sg]}の太陽を持って生まれました。${esc(D.sign_trait[sg])}</p>
      <p>数秘術で見ると、ライフパス数は「${st.lp}」。${esc(lp[0])}です。${esc(lp[1])}</p>
      <p>そして九星気学の本命星は${esc(ky[0])}。${esc(ky[1])}</p>
      <p>18のこたえからは、こんな${call}さんが見えてきました。${esc(ax[0])}${esc(ax[1])}${esc(ax[2])}${esc(ax[3])}</p>`;
    }
    const S = C.sign[sg], mood = tired ? C.tired : (change ? C.change : C.steady);
    const parts = [
      ['', C.opening], [`${D.signs[sg]}の、もうひとつの顔`, S.inner],
      [`18のこたえが見せた「${tn}」の心`, C.type[code]], ['', mood], ['', S.hurt], ['', S.gift],
      [`「${theme}」を選んだあなたへ`, (C.theme && (C.theme[theme] || C.theme['2027年の全体の流れ']))]];
    return parts.filter((x) => x[1]).map(([h, b]) => (h ? `<p class="ch-sub">${esc(h)}</p>` : '') + `<p>${fill(b)}</p>`).join('');
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
      ${ch1Html(call, sg, theme, tired, change, code, ax, lp, ky, tn)}
      </div>
      <h2 style="margin-top:30px">${call}さんの運命の一文字</h2>
      <div class="card" style="text-align:center"><div class="shikishi"><div class="ichi">${esc(ichi['漢字'])}</div><span class="rakkan">くろみつ</span></div><p class="fine" style="margin:0 0 8px">※画面の文字は書体です。お申し込み後、書家・夢香が筆で書きます。</p><p style="margin:0">${esc(ichi['込める意味'])}。<br>「${esc(theme)}」を占ってほしいあなたを、そっと守る一文字です。</p>
      <p class="fine" style="margin:10px 0 0">この一文字は、書家・夢香があなたのために筆で書くこともできます（下でご案内します）。</p></div>
      <div class="toc"><p class="toc-h">ここからは、${call}さんの2027年のお話です</p>
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
      <tr><td>あなたの悩み</td><td>—</td><td class="pay">「${esc(theme)}」に答える</td></tr></table></div>
      <div class="prem yw-wrap">${D.yume_html}</div>`;
  }


  document.addEventListener('click', (e) => { const a = e.target.closest('[data-plan]'); if (a) localStorage.setItem('kuromitsu_plan', a.dataset.plan); });

  if (st.sei && st.birth) { $('#sei').value = st.sei; $('#mei').value = st.mei || ''; $('#bd').value = st.birth; }
  const q = new URLSearchParams(location.search);
  if (q.get('t')) { st.preTheme = q.get('t'); save(); const h = $('#theme-hint'); if (h) { h.hidden = false; h.textContent = '占うテーマ：' + q.get('t'); } }
  if (q.get('b')) $('#bd').value = q.get('b');
  if (q.get('sei')) $('#sei').value = q.get('sei');
  if (q.get('mei')) $('#mei').value = q.get('mei');
  if (q.get('sei') && q.get('mei') && q.get('b')) $('#f1').requestSubmit();
})();
