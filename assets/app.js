(() => {
  const menuButton = document.querySelector('.menu-toggle'), nav = document.querySelector('.topbar nav');
  if (menuButton && nav) menuButton.addEventListener('click', () => { const open = nav.classList.toggle('open'); menuButton.setAttribute('aria-expanded', String(open)); });
  const statusEls = document.querySelectorAll('#network-status');
  const updateNetwork = () => { const online = navigator.onLine; statusEls.forEach(el => { el.innerHTML = `<i style="background:${online ? '#7cffb2' : '#ff8b8b'}"></i> ${online ? 'Соединение активно' : 'Нет сети — проверяем кеш'}`; }); const v = document.getElementById('online-value'); if (v) v.textContent = online ? 'ONLINE' : 'OFFLINE'; };
  window.addEventListener('online', updateNetwork); window.addEventListener('offline', updateNetwork); updateNetwork();
  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection, connEl = document.getElementById('connection-type');
  if (connEl && conn) connEl.textContent = [conn.effectiveType, conn.saveData ? 'экономия трафика' : ''].filter(Boolean).join(' · ') || 'не сообщается';
  const loadEl = document.getElementById('load-time');
  const showLoad = () => { if (!loadEl) return; const e = performance.getEntriesByType('navigation')[0]; loadEl.textContent = e && e.loadEventEnd > 0 ? `${Math.round(e.loadEventEnd)} мс` : 'нет данных'; };
  window.addEventListener('load', showLoad); setTimeout(showLoad, 700);
  const timeEl = document.getElementById('check-time'), updateTime = () => { if (timeEl) timeEl.textContent = new Date().toLocaleTimeString('ru-RU'); }; updateTime();
  const swState = document.getElementById('sw-state'), cacheDetail = document.getElementById('cache-detail'), checkButton = document.getElementById('check-cache'), clearButton = document.getElementById('clear-cache');
  async function inspectCache() {
    updateTime();
    if (!('serviceWorker' in navigator)) { if (swState) swState.textContent = 'Service Worker не поддерживается'; if (cacheDetail) cacheDetail.textContent = 'Попробуй современный браузер и HTTPS или localhost.'; return; }
    try { const reg = await navigator.serviceWorker.getRegistration(); if (swState) swState.textContent = reg && reg.active ? 'Service Worker активен' : 'Service Worker ещё запускается'; if ('caches' in window) { const keys = await caches.keys(), ours = keys.filter(k => k.startsWith('fastsite-')); if (cacheDetail) cacheDetail.textContent = ours.length ? `Локальные кеши: ${ours.join(', ')}` : 'Кеш появится после установки Service Worker и загрузки файлов.'; } }
    catch (_) { if (swState) swState.textContent = 'Не удалось проверить кеш'; if (cacheDetail) cacheDetail.textContent = 'Проверь, что сайт открыт через HTTPS или localhost.'; }
  }
  if (checkButton) checkButton.addEventListener('click', inspectCache);
  if (clearButton) clearButton.addEventListener('click', async () => { if (!('caches' in window)) return; const keys = await caches.keys(); await Promise.all(keys.filter(k => k.startsWith('fastsite-')).map(k => caches.delete(k))); if (cacheDetail) cacheDetail.textContent = 'Кеш очищен. При следующей загрузке файлы будут сохранены заново.'; if (swState) swState.textContent = 'Кеш очищен'; });
  if (document.getElementById('sw-state')) inspectCache();
  const measureButton = document.getElementById('measure-again');
  if (measureButton) measureButton.addEventListener('click', () => { showLoad(); updateTime(); updateNetwork(); if (connEl && conn) connEl.textContent = [conn.effectiveType, conn.saveData ? 'экономия трафика' : ''].filter(Boolean).join(' · ') || 'не сообщается'; });
  const saveData = Boolean(conn && conn.saveData);
  if ('requestIdleCallback' in window && !saveData && navigator.onLine) {
    const prefetched = new Set();
    const prefetch = url => { if (prefetched.has(url)) return; prefetched.add(url); const l = document.createElement('link'); l.rel = 'prefetch'; l.href = url; document.head.appendChild(l); };
    const maybePrefetch = a => { if (!a || saveData || !navigator.onLine) return; const u = new URL(a.href, location.href); if (u.origin === location.origin && u.href !== location.href) requestIdleCallback(() => prefetch(u.href), {timeout: 1000}); };
    const links = [...document.querySelectorAll('a[data-prefetch]')];
    if ('IntersectionObserver' in window) { const observer = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) { maybePrefetch(e.target); observer.unobserve(e.target); } }), {rootMargin:'150px'}); links.forEach(a => observer.observe(a)); }
    document.addEventListener('pointerover', e => maybePrefetch(e.target.closest && e.target.closest('a[data-prefetch]')), {passive:true});
  }
  if ('serviceWorker' in navigator && ['https:','http:'].includes(location.protocol) && (location.protocol === 'https:' || ['localhost','127.0.0.1'].includes(location.hostname))) window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(err => console.warn('Service Worker registration failed:', err)));
})();
