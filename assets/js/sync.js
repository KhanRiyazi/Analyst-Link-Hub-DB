/* Google Sheets sync (talks to google-apps-script/Code.gs). Your URL and key stay in this browser. */
(function () {
  const CK = 'alh-sync';
  const URL_RE = /^https:\/\/script\.google\.com\/(macros\/s|a\/macros\/[^/]+\/s)\/[^/]+\/exec$/;
  let cfg = { url: '', key: '', auto: true };
  let ready = false, busy = false, again = false, timer = null, applying = false, lastSync = 0;
  try { Object.assign(cfg, JSON.parse(localStorage.getItem(CK) || '{}')); } catch (e) {}

  function status(text, cls) {
    $('#sy-st').textContent = text;
    const b = $('#sync');
    b.classList.remove('ok', 'err');
    if (cls) b.classList.add(cls);
    b.title = 'Google Sheets sync: ' + text;
  }
  const stamp = msg => { lastSync = Date.now(); status(msg + ' at ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 'ok'); };
  const snap = confirmEmpty => ({ links, decisions: decs, settings: { review: lastReview, domain, apps }, confirmEmpty: !!confirmEmpty });

  async function call(action, data) {
    if (!URL_RE.test(cfg.url)) throw new Error('Check the Web app URL');
    // text/plain keeps this a "simple" request, so the browser does not need a CORS preflight.
    const r = await fetch(cfg.url, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ key: cfg.key, action, data }) });
    let j;
    try { j = await r.json(); } catch (e) { throw new Error('No data came back. Is the Web app access set to Anyone?'); }
    if (!j.ok) throw new Error(j.error || 'Request failed');
    return j;
  }

  function apply(j) {
    applying = true;
    links = (j.links || []).map(l => Object.assign({}, l, { cat: CATS.includes(l.cat) ? l.cat : 'Ask' }));
    decs = j.decisions || [];
    const st = j.settings || {};
    lastReview = st.review || '';
    domain = st.domain || '';
    apps = st.apps && st.apps.length ? st.apps : null;
    try {
      localStorage.setItem(KEY, JSON.stringify(links)); localStorage.setItem('alh-v', '2');
      localStorage.setItem('alh-dec', JSON.stringify(decs)); localStorage.setItem('alh-review', lastReview);
      localStorage.setItem('alh-domain', domain);
      apps ? localStorage.setItem('alh-apps', JSON.stringify(apps)) : localStorage.removeItem('alh-apps');
    } catch (e) {}
    wsRender(); renderHubNav(); render();
    applying = false;
  }

  async function pull(silent) {
    busy = true; status('Loading from the Sheet…');
    try {
      const j = await call('load');
      if (!j.links.length && !j.decisions.length && links.length) {
        await call('save', snap());
        ready = true; stamp('Sheet was empty, so your data was saved to it');
        if (!silent) toast('Sheet was empty. Your links were saved to it.');
      } else {
        apply(j); ready = true; stamp('Loaded from the Sheet');
        if (!silent) toast('Loaded from your Google Sheet');
      }
    } catch (e) { status(e.message, 'err'); if (!silent) toast(e.message); }
    finally { busy = false; }
  }

  async function push(confirmEmpty, silent) {
    if (busy) { again = true; return; }
    busy = true; status('Saving to the Sheet…');
    try {
      await call('save', snap(confirmEmpty));
      ready = true; stamp('Saved');
      if (!silent) toast('Saved to your Google Sheet');
    } catch (e) { status(e.message, 'err'); if (!silent) toast(e.message); }
    finally { busy = false; if (again) { again = false; queue(); } }
  }

  function queue() { clearTimeout(timer); timer = setTimeout(() => { timer = null; push(false, true); }, 1500); }
  window.afterSave = () => { if (cfg.url && cfg.key && cfg.auto && ready && !applying) queue(); };

  $('#sync').onclick = () => {
    $('#sy-url').value = cfg.url; $('#sy-key').value = cfg.key; $('#sy-auto').checked = cfg.auto !== false;
    $('#dlg4').showModal();
  };
  $('#sy-x').onclick = () => $('#dlg4').close();
  $('#sy-ok').onclick = async () => {
    cfg.url = $('#sy-url').value.trim(); cfg.key = $('#sy-key').value.trim(); cfg.auto = $('#sy-auto').checked;
    if (!URL_RE.test(cfg.url)) { status('The URL should look like https://script.google.com/macros/s/…/exec', 'err'); return; }
    if (!cfg.key) { status('Paste your secret key', 'err'); return; }
    try { localStorage.setItem(CK, JSON.stringify(cfg)); } catch (e) {}
    try { await call('ping'); } catch (e) { status(e.message, 'err'); return; }
    await pull(false);
  };
  $('#sy-load').onclick = () => {
    if (!cfg.url) { status('Connect first', 'err'); return; }
    if (confirm('Replace the data on this device with the data in your Sheet?')) pull(false);
  };
  $('#sy-save').onclick = () => {
    if (!cfg.url) { status('Connect first', 'err'); return; }
    const empty = !links.length;
    if (empty && !confirm('You have no links. This will empty your Sheet. Continue?')) return;
    push(empty, false);
  };
  $('#sy-off').onclick = () => {
    cfg = { url: '', key: '', auto: true }; ready = false;
    try { localStorage.removeItem(CK); } catch (e) {}
    $('#sy-url').value = ''; $('#sy-key').value = ''; status('Not connected. Your data stays on this device.');
  };
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && ready && !timer && !busy && !document.querySelector('dialog[open]') && Date.now() - lastSync > 30000) pull(true);
  });

  status(cfg.url && cfg.key ? 'Connecting…' : 'Not connected. Your data stays on this device.');
  if (cfg.url && cfg.key) pull(true);
})();
