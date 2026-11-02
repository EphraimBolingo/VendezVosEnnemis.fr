(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const formatNumber = (number, digits = 0) => new Intl.NumberFormat('fr-FR', { maximumFractionDigits: digits, minimumFractionDigits: digits }).format(number);
  const formatMoney = number => `${formatNumber(Math.round(number))} $`;
  const formatDate = date => new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
  const sleep = ms => new Promise(resolve => window.setTimeout(resolve, ms));
  const SALES_KEY = 'vve-demo-sales-v1';
  const PORTFOLIO_KEY = 'vve-demo-portfolio';
  let data = null;
  let activeQuote = null;
  let isAnalyzing = false;
  let modalRun = 0;
  let previousFocus = null;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const relationLabels = {
    oncles: 'Oncle(s) moraliste(s)',
    tantes: 'Tante(s) commère(s)',
    ex: 'Ex toxique(s)',
    voisins: 'Voisin(s) bruyant(s)',
    cousins: 'Cousin(s) emprunteur(s)',
    scammeurs: 'Scammeur(s) WhatsApp'
  };

  const categoryIcons = {
    oncles: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 19c1.1-3.3 3.7-5 8-5s6.9 1.7 8 5M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" stroke="currentColor" stroke-width="1.35"/><path d="m8.5 17.8 3.5-2 3.5 2M10 6.5h4" stroke="currentColor" stroke-width="1.1"/></svg>',
    tantes: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 20c.8-3.4 3.1-5.2 7-5.2s6.2 1.8 7 5.2M12 12.5a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" stroke="currentColor" stroke-width="1.35"/><path d="M18.4 4.3h2.4v2.4M17.7 7.4l3-3" stroke="currentColor" stroke-width="1.35"/></svg>',
    cousins: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 19c.8-3.1 3.5-4.8 8-4.8s7.2 1.7 8 4.8M12 11.8a3.8 3.8 0 1 0 0-7.6 3.8 3.8 0 0 0 0 7.6Z" stroke="currentColor" stroke-width="1.35"/><path d="M15.5 16.5h4M17.5 14.5v4" stroke="currentColor" stroke-width="1.3"/></svg>',
    ex: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 20s-7.5-4.3-8.3-8.8C3.1 7.6 7.6 5.4 10 8l2 2 2-2c2.4-2.6 6.9-.4 6.3 3.2C19.5 15.7 12 20 12 20Z" stroke="currentColor" stroke-width="1.3"/><path d="M18.2 4.3v3.3M16.5 5.95h3.4" stroke="currentColor" stroke-width="1.2"/></svg>',
    voisins: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m3 10 9-7 9 7v10H3V10Z" stroke="currentColor" stroke-width="1.3"/><path d="M9 20v-6h6v6M4 11h16" stroke="currentColor" stroke-width="1.2"/><path d="M18.5 4.5c1.4 1.1 2 2.4 1.8 4" stroke="currentColor" stroke-width="1.1"/></svg>',
    scammeurs: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 3.5h14v17H5zM8 7h8M8 10.5h8M8 14h3" stroke="currentColor" stroke-width="1.25"/><path d="m15 14.5 1.5 1.5 3-3" stroke="currentColor" stroke-width="1.3"/></svg>'
  };

  async function fetchSiteData(cacheBust = false) {
    const url = cacheBust ? `./data/site.json?ajax=${Date.now()}` : './data/site.json';
    const response = await fetch(url, { headers: { Accept: 'application/json' }, cache: cacheBust ? 'no-store' : 'default' });
    if (!response.ok) throw new Error(`Chargement des données indisponible (${response.status})`);
    return response.json();
  }

  function readSales() {
    try {
      const value = JSON.parse(sessionStorage.getItem(SALES_KEY) || '[]');
      return Array.isArray(value) ? value : [];
    } catch (_) { return []; }
  }

  function saveSales(sales) {
    try { sessionStorage.setItem(SALES_KEY, JSON.stringify(sales.slice(0, 10))); } catch (_) { /* le reçu reste visible pour cette page */ }
  }

  function readPortfolio() {
    try { return JSON.parse(sessionStorage.getItem(PORTFOLIO_KEY) || 'null'); } catch (_) { return null; }
  }

  function renderTrust() {
    $('#trust-logos').innerHTML = data.trustLogos.map(name => `<span class="trust-logo">${name}</span>`).join('');
  }

  function renderStats() {
    const grid = $('#stats-grid');
    grid.innerHTML = data.stats.map((stat, index) => `<article class="stat-card"><strong class="count-value" data-value="${stat.value}" data-decimals="${stat.decimals || 0}" data-suffix="${stat.suffix}" id="stat-${index}">0</strong><span><i class="stat-orbit"></i>${stat.label}</span></article>`).join('');
    const animate = item => {
      const target = Number(item.dataset.value);
      const decimals = Number(item.dataset.decimals);
      const suffix = item.dataset.suffix;
      const start = performance.now();
      const duration = reducedMotion ? 1 : 1550;
      const tick = now => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        item.textContent = `${formatNumber(target * eased, decimals)}${suffix}`;
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => entries.forEach(entry => {
        if (entry.isIntersecting) { animate(entry.target); observer.unobserve(entry.target); }
      }), { threshold: 0.45 });
      $$('.count-value', grid).forEach(item => observer.observe(item));
    } else $$('.count-value', grid).forEach(animate);
  }

  function renderCategories() {
    $('#category-grid').innerHTML = data.categories.map(item => `<article class="category-card" data-accent="${item.accent}"><div class="category-top"><span class="category-icon">${categoryIcons[item.id] || categoryIcons.oncles}</span><span class="category-tag">${item.tag}</span></div><h3>${item.name}</h3><p>${item.description}</p><button class="category-action" type="button" data-category="${item.id}"><span>SÉLECTIONNER CE MEMBRE</span><span aria-hidden="true">↗</span></button></article>`).join('');
  }

  function renderOffers() {
    $('#offers-grid').innerHTML = data.offers.map(offer => `<article class="offer-card${offer.popular ? ' popular' : ''}">${offer.popular ? '<span class="popular-tag">LE PLUS DEMANDÉ</span>' : ''}<h3>${offer.name}</h3><p>${offer.subtitle}</p><span class="offer-quantity">${offer.quantity}</span><strong class="offer-price">${offer.price}</strong><span class="offer-note">${offer.note}</span><button class="button ${offer.popular ? 'button-gold' : 'button-outline'}" type="button" data-offer="${offer.id}">ÉTUDIER L'OFFRE <span>↗</span></button></article>`).join('');
  }

  function renderTestimonials() {
    $('#testimonials-grid').innerHTML = data.testimonials.map(item => `<article class="testimonial-card"><div class="testimonial-stars" aria-label="5 étoiles">★★★★★</div><blockquote>« ${item.quote} »</blockquote><div class="testimonial-author"><span class="testimonial-avatar">${item.initials}</span><span><b>${item.name}</b><small>CLIENT · PORTEFEUILLE FAMILIAL</small></span></div></article>`).join('');
  }

  function renderFaq() {
    $('#faq-list').innerHTML = data.faq.map((item, index) => `<article class="faq-item"><button class="faq-question" type="button" aria-expanded="${index === 0}" aria-controls="faq-answer-${index}" id="faq-question-${index}"><span>${item.question}</span><span aria-hidden="true">+</span></button><div class="faq-answer" id="faq-answer-${index}" role="region" aria-labelledby="faq-question-${index}" style="max-height:${index === 0 ? '150px' : '0px'}"><p>${item.answer}</p></div></article>`).join('');
  }

  function renderQuantityFields(values = {}) {
    const normalizedValues = { scammeurs: 0, ...values };
    $('#quantity-fields').innerHTML = Object.entries(relationLabels).map(([id, label]) => `<div class="quantity-row"><label for="count-${id}">${label}</label><div class="stepper"><button type="button" data-step="-1" data-target="count-${id}" aria-label="Réduire ${label}">−</button><input id="count-${id}" name="${id}" type="number" min="0" max="99" step="1" value="${Number(normalizedValues[id] ?? 1)}" inputmode="numeric"><button type="button" data-step="1" data-target="count-${id}" aria-label="Ajouter ${label}">+</button></div></div>`).join('');
  }

  function renderTransactionSteps(active = -1) {
    if (!data) return;
    $('#transaction-steps').innerHTML = data.transactionSteps.map((step, index) => {
      const status = index < active ? 'done' : index === active ? 'current' : '';
      const word = index < active ? 'EFFECTUÉ' : index === active ? 'EN COURS' : 'À VENIR';
      return `<li class="transaction-step ${status}"><span class="step-icon">${index < active ? '✓' : String(index + 1).padStart(2, '0')}</span><span>${step}</span><span class="step-state">${word}</span></li>`;
    }).join('');
  }

  function renderHistory() {
    const defaults = [
      ['◈', 'Oncle moralisateur', 'Potentiel confirmé', '● ACTIF'],
      ['✳', 'Tante commère', 'Réseau activé', '● ACTIF'],
      ['↗', 'Cousin emprunteur', 'Analyse prioritaire', '● ACTIF']
    ];
    const sales = readSales().slice(0, 3).map(sale => ['↗', sale.memberSummary, `Réf. ${sale.reference}`, sale.status || 'EN COURS']);
    const entries = [...sales, ...defaults].slice(0, 3);
    $('#history-list').innerHTML = entries.map(row => `<div class="history-row"><span class="history-icon">${row[0]}</span><span><b>${row[1]}</b><small>${row[2]}</small></span><span class="history-status">${row[3]}</span></div>`).join('');
  }

  function showToast(message, region = '#toast-region', icon = '✓') {
    const host = $(region);
    const toast = document.createElement('div');
    toast.className = region === '#popup-region' ? 'popup-toast' : 'toast';
    toast.innerHTML = `<span class="${region === '#popup-region' ? 'popup-icon' : 'toast-icon'}" aria-hidden="true">${icon}</span><span>${message}</span>`;
    host.append(toast);
    window.setTimeout(() => { toast.classList.add('exiting'); window.setTimeout(() => toast.remove(), 280); }, 4700);
  }

  function scrollTo(selector) {
    const target = $(selector);
    if (!target) return;
    target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
    $('#primary-nav').classList.remove('open');
    $('.menu-toggle').setAttribute('aria-expanded', 'false');
  }

  function selectedCounts() {
    return Object.fromEntries(Object.keys(relationLabels).map(id => [id, Math.max(0, Math.min(99, Number($(`#count-${id}`).value) || 0))]));
  }

  function countUnits(counts) { return Object.values(counts).reduce((sum, value) => sum + value, 0); }

  function describeMembers(counts) {
    return Object.entries(relationLabels).filter(([id]) => counts[id] > 0).map(([id, label]) => `${label} × ${counts[id]}`).join(' · ') || 'Aucun membre sélectionné';
  }

  function estimate(counts) {
    const units = countUnits(counts);
    const familyUnits = counts.oncles + counts.tantes + counts.cousins;
    const rates = data.resultRates;
    return {
      principal: rates.principalPerUnit * units,
      loyalty: rates.loyaltyPerUnit * units,
      nuisance: rates.nuisancePerUnit * units,
      family: familyUnits ? Math.round(rates.familyBonusTotalAtThreeRelatives * familyUnits / 3) : 0
    };
  }

  function updateDashboard(counts, total) {
    $('#dash-fortune').textContent = formatMoney(total);
    $('#dash-assets').textContent = `${formatNumber(countUnits(counts))} actif${countUnits(counts) === 1 ? '' : 's'}`;
  }

  function resetQuote() {
    activeQuote = null;
    $('#analysis-result').classList.add('hidden');
    $('#analysis-progress').classList.add('hidden');
    $('#analysis-empty').classList.remove('hidden');
    $('.system-state').classList.remove('active');
    $('.system-state').innerHTML = '<i></i> EN ATTENTE';
    const latestSale = readSales()[0];
    if (latestSale) updateTransactionCard(latestSale, latestSale.stepIndex);
    else {
      $('#transaction-reference').textContent = 'REF. EN ATTENTE';
      $('#transaction-amount-display').textContent = 'À CALCULER';
      $('#transaction-status-pill').textContent = '● ANALYSE REQUISE';
      $('#transaction-notice-copy').textContent = 'Votre sélection a changé. Relancez l’analyse pour mettre le dossier à jour.';
      renderTransactionSteps(-1);
    }
  }

  function updateTransactionCard(record, stepIndex = -1) {
    if (!record) return;
    $('#transaction-reference').textContent = record.reference ? `REF. ${record.reference}` : 'REF. DOSSIER ANALYSÉ';
    $('#transaction-amount-display').textContent = formatMoney(record.total ?? record.amount);
    const pill = $('#transaction-status-pill');
    pill.textContent = `● ${record.status || 'DOSSIER ANALYSÉ · CONFIRMATION REQUISE'}`;
    renderTransactionSteps(stepIndex);
    const notice = $('#transaction-notice-copy');
    if (notice) notice.textContent = record.status === 'VIREMENT PROGRAMMÉ' ? 'Votre dossier est enregistré. Le délai de versement annoncé est de 48 heures ouvrables.' : 'Confirmez le dossier pour lancer le suivi de transaction simulé.';
  }

  function randomReference() {
    const day = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    const random = Math.random().toString(36).slice(2, 8).toUpperCase().padEnd(6, 'X');
    return `VVE-${day}-${random}`;
  }

  async function runAnalysis(event) {
    event.preventDefault();
    if (isAnalyzing) return;
    const counts = selectedCounts();
    const units = countUnits(counts);
    if (units === 0) {
      showToast('Aucun membre sélectionné. Votre calme est admirable, nos analystes sont perplexes.', '#toast-region', 'i');
      return;
    }
    activeQuote = null;
    isAnalyzing = true;
    const button = $('#analyze-button');
    button.disabled = true;
    button.innerHTML = 'ANALYSE EN COURS <span aria-hidden="true">…</span>';
    $('#analysis-empty').classList.add('hidden');
    $('#analysis-result').classList.add('hidden');
    $('#analysis-progress').classList.remove('hidden');
    $('.system-state').classList.add('active');
    $('.system-state').innerHTML = '<i></i> ANALYSE';
    $('#analysis-log').innerHTML = '';
    $('#progress-bar').style.width = '0%';
    $('#progress-count').textContent = '00%';
    try {
      await fetchSiteData(true);
      const delay = reducedMotion ? 110 : 470;
      for (let index = 0; index < data.analysisLogs.length; index += 1) {
        const line = document.createElement('p');
        line.textContent = data.analysisLogs[index];
        $('#analysis-log').append(line);
        const progress = Math.round(((index + 1) / data.analysisLogs.length) * 100);
        $('#progress-bar').style.width = `${progress}%`;
        $('#progress-count').textContent = `${String(progress).padStart(2, '0')}%`;
        await sleep(delay);
      }
      const amounts = estimate(counts);
      const total = Object.values(amounts).reduce((sum, amount) => sum + amount, 0);
      activeQuote = { counts, amounts, total, memberSummary: describeMembers(counts), createdAt: new Date().toISOString() };
      const lines = [['Montant généré', amounts.principal], ['Bonus fidélité', amounts.loyalty], ['Bonus nuisance psychologique', amounts.nuisance], ['Bonus familial', amounts.family]];
      $('#result-lines').innerHTML = lines.map(([label, amount]) => `<div class="result-line"><span>${label}</span><strong>${formatMoney(amount)}</strong></div>`).join('');
      $('#result-total-value').textContent = formatMoney(total);
      $('#analysis-progress').classList.add('hidden');
      $('#analysis-result').classList.remove('hidden');
      $('.system-state').classList.remove('active');
      $('.system-state').innerHTML = '<i></i> DOSSIER PRÊT';
      updateDashboard(counts, total);
      updateTransactionCard({ ...activeQuote, status: 'ANALYSE VALIDÉE · CONFIRMATION REQUISE' }, -1);
      try { sessionStorage.setItem(PORTFOLIO_KEY, JSON.stringify({ counts, total })); } catch (_) { /* stockage facultatif */ }
      showToast(`Dossier prêt : ${formatMoney(total)} estimés. Procédez pour confirmer la vente simulée.`);
    } catch (error) {
      $('#analysis-progress').classList.add('hidden');
      $('#analysis-empty').classList.remove('hidden');
      $('.system-state').classList.remove('active');
      $('.system-state').innerHTML = '<i></i> EN ATTENTE';
      showToast('La connexion au réseau ancestral est momentanément incertaine. Réessayez.', '#toast-region', 'i');
      console.warn('Échec de l’analyse locale :', error);
    } finally {
      isAnalyzing = false;
      button.disabled = false;
      button.innerHTML = 'ANALYSER MON PATRIMOINE <span aria-hidden="true">→</span>';
    }
  }

  function openSaleReview() {
    if (!activeQuote) {
      showToast('Analysez d’abord votre sélection : votre dossier doit être accepté avant confirmation.', '#toast-region', 'i');
      scrollTo('#simulateur');
      return;
    }
    const modal = $('#transaction-modal');
    previousFocus = document.activeElement;
    $('#modal-title').textContent = 'Confirmez votre vente.';
    $('#modal-icon').textContent = '↗';
    $('#sale-selected-members').textContent = activeQuote.memberSummary;
    $('#sale-review-amount').textContent = formatMoney(activeQuote.total);
    $('#sale-review-reference').textContent = 'Attribuée à la confirmation';
    $('#sale-review').classList.remove('hidden');
    $('#sale-processing').classList.add('hidden');
    $('#sale-receipt').classList.add('hidden');
    modal.classList.remove('processing');
    modal.hidden = false;
    document.body.classList.add('modal-open');
    requestAnimationFrame(() => modal.classList.add('visible'));
    $('#confirm-sale').focus();
  }

  function closeModal() {
    const modal = $('#transaction-modal');
    if (modal.classList.contains('processing')) return;
    modalRun += 1;
    modal.classList.remove('visible');
    document.body.classList.remove('modal-open');
    window.setTimeout(() => { modal.hidden = true; }, 250);
    if (previousFocus) previousFocus.focus();
  }

  function updateReceipt(sale) {
    $('#receipt-reference').textContent = sale.reference;
    $('#receipt-member').textContent = sale.memberSummary;
    $('#receipt-amount').textContent = formatMoney(sale.amount);
    $('#receipt-created').textContent = formatDate(new Date(sale.createdAt));
    $('#receipt-status').textContent = sale.status;
    $('#receipt-eta').textContent = 'Versement annoncé sous 48 heures ouvrables';
  }

  async function confirmSale() {
    if (!activeQuote) return;
    const modal = $('#transaction-modal');
    const runId = ++modalRun;
    const sale = {
      reference: randomReference(),
      memberSummary: activeQuote.memberSummary,
      counts: activeQuote.counts,
      amount: activeQuote.total,
      createdAt: new Date().toISOString(),
      status: 'DOSSIER REÇU',
      stepIndex: 0,
      eta: '48 heures ouvrables'
    };
    const sales = readSales();
    sales.unshift(sale);
    saveSales(sales);
    renderHistory();
    modal.classList.add('processing');
    $('#sale-review').classList.add('hidden');
    $('#sale-processing').classList.remove('hidden');
    $('#sale-receipt').classList.add('hidden');
    $('#modal-title').textContent = 'Votre dossier est en traitement.';
    $('#modal-reference').textContent = `RÉF. ${sale.reference}`;
    $('#modal-processing-amount').textContent = formatMoney(sale.amount);
    $('#modal-progress-bar').style.width = '0%';
    showToast(`Vente simulée confirmée. Référence ${sale.reference}.`);

    try {
      await fetchSiteData(true);
      for (let index = 0; index < data.transactionSteps.length; index += 1) {
        if (runId !== modalRun) return;
        sale.stepIndex = index;
        sale.status = index === data.transactionSteps.length - 1 ? 'ORDRE DE VIREMENT CRÉÉ' : data.transactionSteps[index].toLocaleUpperCase('fr-FR');
        $('#modal-step').textContent = `${data.transactionSteps[index]}...`;
        $('#modal-progress-bar').style.width = `${Math.round(((index + 1) / data.transactionSteps.length) * 100)}%`;
        updateTransactionCard(sale, index);
        saveSales([sale, ...readSales().filter(item => item.reference !== sale.reference)]);
        if (data.transactionNotifications[index]) showToast(data.transactionNotifications[index]);
        await sleep(reducedMotion ? 220 : 720);
      }
      if (runId !== modalRun) return;
      sale.stepIndex = data.transactionSteps.length;
      sale.status = 'VIREMENT PROGRAMMÉ';
      saveSales([sale, ...readSales().filter(item => item.reference !== sale.reference)]);
      renderHistory();
      updateTransactionCard(sale, data.transactionSteps.length);
      updateReceipt(sale);
      $('#sale-processing').classList.add('hidden');
      $('#sale-receipt').classList.remove('hidden');
      $('#modal-title').textContent = 'Vente enregistrée.';
      $('#modal-icon').textContent = '✓';
      modal.classList.remove('processing');
      showToast('Ordre simulé créé. Le délai de versement annoncé est de 48 heures ouvrables.');
      $('#receipt-close').focus();
    } catch (error) {
      modal.classList.remove('processing');
      sale.status = 'DOSSIER EN ATTENTE DE REPRISE';
      saveSales([sale, ...readSales().filter(item => item.reference !== sale.reference)]);
      showToast('Le suivi a été interrompu. Votre référence reste consultable dans cette session.', '#toast-region', 'i');
      console.warn('Échec du suivi de vente simulé :', error);
    }
  }

  function applyOffer(id) {
    const presets = {
      oncle: { oncles: 1, tantes: 0, ex: 0, voisins: 0, cousins: 0 },
      tante: { oncles: 0, tantes: 1, ex: 0, voisins: 0, cousins: 0 },
      dynastie: { oncles: 1, tantes: 1, ex: 0, voisins: 0, cousins: 1 },
      legende: { oncles: 1, tantes: 1, ex: 1, voisins: 1, cousins: 1 },
      monthly: { oncles: 2, tantes: 0, ex: 0, voisins: 0, cousins: 0 }
    };
    resetQuote();
    renderQuantityFields(presets[id] || presets.legende);
    scrollTo('#simulateur');
    showToast(id === 'monthly' ? 'Bonus ancestral et support Gold pré-réservés — dans l’imaginaire.' : 'Votre formule est préchargée. Analysez puis confirmez la vente simulée.', '#toast-region', '↗');
  }

  function startRandomPopups() {
    const announce = () => {
      if (document.hidden || !data || !$('#transaction-modal').hidden) return;
      showToast(data.popups[Math.floor(Math.random() * data.popups.length)], '#popup-region', '↗');
    };
    window.setTimeout(announce, 11500);
    window.setInterval(announce, 22000);
  }

  function bindEvents() {
    document.addEventListener('click', event => {
      const scrollButton = event.target.closest('[data-scroll]');
      if (scrollButton) { event.preventDefault(); scrollTo(scrollButton.dataset.scroll); return; }
      const stepButton = event.target.closest('[data-step]');
      if (stepButton) {
        const input = $(`#${stepButton.dataset.target}`);
        input.value = String(Math.max(Number(input.min), Math.min(Number(input.max), (Number(input.value) || 0) + Number(stepButton.dataset.step))));
        resetQuote();
        return;
      }
      const categoryButton = event.target.closest('[data-category]');
      if (categoryButton) {
        const relation = categoryButton.dataset.category;
        const values = Object.fromEntries(Object.keys(relationLabels).map(id => [id, id === relation ? 1 : 0]));
        resetQuote();
        renderQuantityFields(values);
        scrollTo('#simulateur');
        showToast(`${relationLabels[relation]} sélectionné. Analysez le dossier pour poursuivre vers la vente.`);
        return;
      }
      const offer = event.target.closest('[data-offer]');
      if (offer) { applyOffer(offer.dataset.offer); return; }
      const faqButton = event.target.closest('.faq-question');
      if (faqButton) {
        const expanded = faqButton.getAttribute('aria-expanded') === 'true';
        faqButton.setAttribute('aria-expanded', String(!expanded));
        const answer = $(`#${faqButton.getAttribute('aria-controls')}`);
        answer.style.maxHeight = expanded ? '0px' : `${answer.scrollHeight}px`;
        return;
      }
      if (event.target.closest('#recover-fortune')) { openSaleReview(); return; }
      if (event.target.closest('#confirm-sale')) { confirmSale(); return; }
      if (event.target.closest('#receipt-dashboard')) {
        closeModal();
        window.setTimeout(() => scrollTo('#espace-client'), 260);
        return;
      }
      if (event.target.closest('[data-close-modal]')) { closeModal(); return; }
      const anchor = event.target.closest('a[href^="#"]');
      if (anchor) {
        const id = anchor.getAttribute('href');
        if (id && id.length > 1 && $(id)) { event.preventDefault(); scrollTo(id); }
      }
    });

    $('#simulator-form').addEventListener('submit', runAnalysis);
    $('#quantity-fields').addEventListener('input', event => {
      if (event.target.matches('input[type="number"]') && !isAnalyzing) resetQuote();
    });
    $('.menu-toggle').addEventListener('click', event => {
      const toggle = event.currentTarget;
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      $('#primary-nav').classList.toggle('open', !expanded);
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && !$('#transaction-modal').hidden && !$('#transaction-modal').classList.contains('processing')) closeModal();
      if (event.key === 'Tab' && !$('#transaction-modal').hidden) {
        const focusable = $$('button:not([disabled]), [href], input', $('#transaction-modal')).filter(el => el.offsetParent !== null);
        if (!focusable.length) return;
        const first = focusable[0], last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    });
  }

  async function boot() {
    bindEvents();
    renderHistory();
    try {
      data = await fetchSiteData();
      renderTrust();
      renderStats();
      renderCategories();
      renderOffers();
      renderTestimonials();
      renderFaq();
      renderQuantityFields();
      const latestSale = readSales()[0];
      renderTransactionSteps(latestSale ? latestSale.stepIndex : -1);
      const portfolio = readPortfolio();
      if (portfolio && portfolio.counts) updateDashboard(portfolio.counts, portfolio.total);
      if (latestSale) {
        updateDashboard(latestSale.counts, latestSale.amount);
        updateTransactionCard(latestSale, latestSale.stepIndex);
      }
      startRandomPopups();
    } catch (error) {
      console.error('Impossible de charger les données du site :', error);
      showToast('Chargement du réseau relationnel incomplet. Actualisez le serveur de prévisualisation.', '#toast-region', '!');
    }
  }

  boot();
})();
