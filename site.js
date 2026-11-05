/* Standalone static demo controller. No CRM, network submission or persistent storage. */
(function () {
  'use strict';
  if (document.documentElement.hasAttribute('data-ro-cloudflare-init')) return;
  document.documentElement.setAttribute('data-ro-cloudflare-init', '1');

  var popupHooks = {
    consultation: 'rec3552248901',
    'pdf-guide': 'rec3614771301',
    curriculum: 'rec3614682801',
    corporate: 'rec3614689701'
  };
  var ctaHooks = {
    'cta-consultation-hero': 'consultation',
    'cta-pdf-guide': 'pdf-guide',
    'cta-curriculum-final-project': 'curriculum',
    'cta-corporate-price': 'corporate'
  };
  var formTypes = {
    form3552248901: 'consultation',
    form3614771301: 'pdf-guide',
    form3614682801: 'curriculum',
    form3614689701: 'corporate',
    form3614904801: 'consultation'
  };
  var downloads = {
    'pdf-guide': '/downloads/ai-governance-guide.pdf',
    curriculum: '/downloads/full-program.pdf'
  };
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var activeModal = null;
  var returnFocus = null;
  var originalBodyStyle = null;
  var scrollPosition = 0;
  var backgroundStates = [];
  var countdownTimer = null;
  var submittedForm = null;
  var success = document.getElementById('tildaformsuccesspopup-new');
  var menu = document.getElementById('nav3614639401');
  var menuButton = document.querySelector('#rec3614639401 .t-menu-burger');
  var focusableSelector = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  function focusable(root) {
    return Array.prototype.filter.call(root.querySelectorAll(focusableSelector), function (node) {
      return !node.hidden && !node.closest('[hidden]') && node.getClientRects().length > 0;
    });
  }

  function restoreBackground() {
    backgroundStates.forEach(function (entry) { entry.node.inert = entry.inert; });
    backgroundStates = [];
  }

  function isolateModal(modal) {
    restoreBackground();
    var current = modal;
    while (current && current.parentElement && current !== document.body) {
      Array.prototype.forEach.call(current.parentElement.children, function (sibling) {
        if (sibling === current || /^(SCRIPT|STYLE|LINK)$/.test(sibling.tagName)) return;
        backgroundStates.push({ node: sibling, inert: sibling.inert });
        sibling.inert = true;
      });
      current = current.parentElement;
    }
  }

  function lockScroll() {
    if (originalBodyStyle !== null) return;
    scrollPosition = window.scrollY;
    originalBodyStyle = document.body.getAttribute('style') || '';
    document.body.style.position = 'fixed';
    document.body.style.top = '-' + scrollPosition + 'px';
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';
    document.documentElement.classList.add('ro-scroll-locked');
  }

  function unlockScroll() {
    if (originalBodyStyle === null) return;
    document.body.setAttribute('style', originalBodyStyle);
    originalBodyStyle = null;
    document.documentElement.classList.remove('ro-scroll-locked');
    window.scrollTo({ top: scrollPosition, behavior: 'instant' });
  }

  function hideModal(modal) {
    if (!modal) return;
    modal.hidden = true;
    modal.classList.remove('ro-modal-open', 't-popup_show');
    modal.setAttribute('aria-hidden', 'true');
  }

  function closeModal() {
    window.clearInterval(countdownTimer);
    countdownTimer = null;
    hideModal(activeModal);
    activeModal = null;
    restoreBackground();
    unlockScroll();
    if (submittedForm) {
      submittedForm.dataset.roSubmitting = '';
      submittedForm.querySelectorAll('[type="submit"], .t-submit').forEach(function (button) { button.disabled = false; });
      submittedForm = null;
    }
    if (returnFocus && returnFocus.isConnected) returnFocus.focus({ preventScroll: true });
    returnFocus = null;
  }

  function showModal(modal, trigger) {
    if (!modal) return;
    if (!activeModal) returnFocus = trigger || document.activeElement;
    window.clearInterval(countdownTimer);
    hideModal(activeModal);
    closeMenu(false);
    activeModal = modal;
    lockScroll();
    modal.hidden = false;
    modal.classList.add('ro-modal-open', 't-popup_show');
    modal.setAttribute('aria-hidden', 'false');
    modal.scrollTop = 0;
    var card = modal.querySelector('.t-popup__container, .t-form-success-popup__wrapper');
    if (card) card.scrollTop = 0;
    isolateModal(modal);
    var first = focusable(modal)[0];
    (first || modal).focus({ preventScroll: true });
  }

  function openPopup(hook, trigger) {
    var record = document.getElementById(popupHooks[hook]);
    if (record) showModal(record.querySelector('.t-popup'), trigger);
  }

  function closeMenu(restoreFocus) {
    if (!menu || !menuButton) return;
    menu.classList.remove('ro-menu-open');
    menuButton.setAttribute('aria-expanded', 'false');
    if (restoreFocus) menuButton.focus();
  }

  function headerOffset() {
    var mobile = document.querySelector('#rec3614639401 .tmenu-mobile');
    var desktop = document.getElementById('nav3614639401');
    var header = mobile && mobile.getClientRects().length ? mobile : desktop;
    return (header ? header.getBoundingClientRect().height : 0) + 12;
  }

  function scrollToAnchor(hash) {
    var id;
    try { id = decodeURIComponent(hash.slice(1)); } catch (_error) { return; }
    var target = id === 'top' ? document.documentElement : document.getElementById(id);
    if (!target) return;
    closeMenu(false);
    var top = id === 'top' ? 0 : window.scrollY + target.getBoundingClientRect().top - headerOffset();
    window.scrollTo({ top: Math.max(0, top), behavior: reducedMotion.matches ? 'auto' : 'smooth' });
    if (id !== 'top') history.replaceState(null, '', '#' + id);
  }

  document.addEventListener('click', function (event) {
    var target = event.target.closest ? event.target : event.target.parentElement;
    if (!target) return;
    if (target.closest('#rec3614639401 .t-menu-burger')) {
      if (!menu || !menuButton) return;
      var open = menu.classList.toggle('ro-menu-open');
      menuButton.setAttribute('aria-expanded', String(open));
      return;
    }
    var close = target.closest('.t-popup__close-wrapper, .t-form-success-popup__button');
    if (close && activeModal && activeModal.contains(close)) {
      event.preventDefault();
      closeModal();
      return;
    }
    if (activeModal && event.target === activeModal) {
      closeModal();
      return;
    }
    var trigger = target.closest('[id], a[href]');
    var hook = trigger && ctaHooks[trigger.id];
    var link = target.closest('a[href]');
    var href = link ? link.getAttribute('href') : '';
    if (!hook && href && href.indexOf('#popup:') === 0) hook = href.slice(7);
    if (hook && popupHooks[hook]) {
      event.preventDefault();
      openPopup(hook, trigger || link);
      return;
    }
    if (href && href.charAt(0) === '#' && href.length > 1) {
      event.preventDefault();
      scrollToAnchor(href);
    }
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      if (activeModal) closeModal();
      else closeMenu(true);
      return;
    }
    if (event.key !== 'Tab' || !activeModal) return;
    var nodes = focusable(activeModal);
    if (!nodes.length) { event.preventDefault(); activeModal.focus(); return; }
    var first = nodes[0];
    var last = nodes[nodes.length - 1];
    if (event.shiftKey && (document.activeElement === first || !activeModal.contains(document.activeElement))) {
      event.preventDefault(); last.focus();
    } else if (!event.shiftKey && (document.activeElement === last || !activeModal.contains(document.activeElement))) {
      event.preventDefault(); first.focus();
    }
  });

  document.querySelectorAll('[role="tablist"]').forEach(function (tablist) {
    var tabs = Array.prototype.slice.call(tablist.querySelectorAll('[role="tab"][aria-controls]'));
    function select(tab, shouldFocus) {
      tabs.forEach(function (item) {
        var selected = item === tab;
        item.setAttribute('aria-selected', String(selected));
        item.tabIndex = selected ? 0 : -1;
        item.classList.toggle('is-active', selected);
        var panel = document.getElementById(item.getAttribute('aria-controls'));
        if (!panel) return;
        panel.hidden = !selected;
        panel.setAttribute('aria-hidden', String(!selected));
        panel.classList.toggle('is-active', selected);
      });
      if (shouldFocus) tab.focus();
    }
    tabs.forEach(function (tab, index) {
      tab.addEventListener('click', function () { select(tab, false); });
      tab.addEventListener('keydown', function (event) {
        var next;
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % tabs.length;
        if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index - 1 + tabs.length) % tabs.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = tabs.length - 1;
        if (next === undefined) return;
        event.preventDefault(); select(tabs[next], true);
      });
    });
    if (tabs.length) select(tabs.find(function (tab) { return tab.getAttribute('aria-selected') === 'true'; }) || tabs[0], false);
  });

  var rail = document.querySelector('#teachers [aria-label="Преподаватели программы"]');
  if (rail) {
    var cards = Array.prototype.slice.call(rail.querySelectorAll('article'));
    function moveTeacher(direction) {
      var maximum = Math.max(0, rail.scrollWidth - rail.clientWidth);
      var railLeft = rail.getBoundingClientRect().left;
      var firstSnap = cards.length ? Math.max(0, rail.scrollLeft + cards[0].getBoundingClientRect().left - railLeft) : 0;
      // Snap positions include the rail's leading inset; subtracting the first
      // card's offset targets the current snap point again when going backward.
      var points = cards.map(function (card, index) {
        var position = index === 0 ? 0 : rail.scrollLeft + card.getBoundingClientRect().left - railLeft;
        return Math.min(maximum, Math.max(0, position));
      });
      var target;
      if (direction > 0) target = rail.scrollLeft >= maximum - 3 ? 0 : points.find(function (point) { return point > rail.scrollLeft + 3; });
      else target = rail.scrollLeft <= firstSnap + 3 ? maximum : points.slice().reverse().find(function (point) { return point < rail.scrollLeft - 3; });
      rail.scrollTo({ left: target === undefined ? (direction > 0 ? maximum : 0) : target, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
    }
    var previousTeacher = document.querySelector('#teachers [aria-label="Предыдущие преподаватели"]');
    var nextTeacher = document.querySelector('#teachers [aria-label="Следующие преподаватели"]');
    if (previousTeacher) previousTeacher.addEventListener('click', function () { moveTeacher(-1); });
    if (nextTeacher) nextTeacher.addEventListener('click', function () { moveTeacher(1); });
  }

  function phoneDigits(value) {
    var digits = value.replace(/\D/g, '');
    if (digits.length > 10 && (digits[0] === '7' || digits[0] === '8')) digits = digits.slice(1);
    return digits.slice(0, 10);
  }

  function formatPhone(input) {
    var digits = phoneDigits(input.value);
    var formatted = '';
    if (digits.length) formatted = '(' + digits.slice(0, 3);
    if (digits.length >= 3) formatted += ') ';
    if (digits.length > 3) formatted += digits.slice(3, 6);
    if (digits.length > 6) formatted += '-' + digits.slice(6, 8);
    if (digits.length > 8) formatted += '-' + digits.slice(8, 10);
    input.value = formatted;
    input.setCustomValidity(digits.length === 10 || !digits.length ? '' : 'Введите номер телефона полностью.');
  }

  function showSuccess(type, trigger) {
    if (!success) return;
    var isDownload = Boolean(downloads[type]);
    success.classList.add('ro-success-popup');
    success.classList.toggle('ro-success-download', isDownload);
    success.classList.toggle('ro-success-request', !isDownload);
    success.setAttribute('aria-label', 'Спасибо!');
    success.querySelector('.t-form-success-popup__title').textContent = 'Спасибо!';
    success.querySelector('.t-form-success-popup__text').textContent = isDownload ? 'Файл уже начинает скачиваться.' : 'Заявка отправлена. Мы свяжемся с вами в ближайшее время.';
    var info = success.querySelector('.t-form-success-popup__info');
    if (info) {
      info.hidden = !isDownload;
      info.classList.toggle('t-form-success-popup_hidden', !isDownload);
      var infoText = info.querySelector('.t-form-success-popup__info-text');
      var digit = info.querySelector('.t-form-success-popup__info-digit');
      if (infoText) {
        infoText.textContent = 'Автоматический переход через:';
        infoText.hidden = false;
        infoText.classList.remove('t-form-success-popup_hidden');
      }
      if (digit) {
        digit.hidden = false;
        digit.classList.remove('t-form-success-popup_hidden');
        digit.textContent = '3';
      }
    }
    showModal(success, trigger);
    if (isDownload && info) {
      var seconds = 3;
      countdownTimer = window.setInterval(function () {
        seconds -= 1;
        var digit = info.querySelector('.t-form-success-popup__info-digit');
        if (digit) digit.textContent = String(seconds);
        if (seconds <= 0) closeModal();
      }, 1000);
    }
  }

  document.querySelectorAll('form').forEach(function (form) {
    if (!formTypes[form.id]) return;
    form.removeAttribute('novalidate');
    form.querySelectorAll('input[data-tilda-req="1"], textarea[data-tilda-req="1"], select[data-tilda-req="1"], input[type="checkbox"], input[type="tel"]').forEach(function (input) {
      if (input.type !== 'hidden') { input.required = true; input.setAttribute('aria-required', 'true'); }
    });
    form.querySelectorAll('input[type="tel"]').forEach(function (input) {
      input.maxLength = 15;
      input.autocomplete = 'tel-national';
      input.inputMode = 'tel';
      input.addEventListener('input', function () { formatPhone(input); });
      input.addEventListener('blur', function () { formatPhone(input); });
      input.addEventListener('keydown', function (event) {
        if (event.key !== 'Backspace' || input.selectionStart !== input.selectionEnd || input.selectionEnd !== input.value.length || /\d$/.test(input.value)) return;
        var digits = phoneDigits(input.value);
        if (!digits) return;
        event.preventDefault();
        input.value = digits.slice(0, -1);
        formatPhone(input);
      });
    });
    form.querySelectorAll('.t-input-phonemask__select').forEach(function (select) {
      select.removeAttribute('tabindex');
      select.removeAttribute('role');
    });
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (form.dataset.roSubmitting === 'true') return;
      form.querySelectorAll('input[type="tel"]').forEach(formatPhone);
      if (!form.reportValidity()) return;
      var type = formTypes[form.id];
      form.dataset.roSubmitting = 'true';
      submittedForm = form;
      var values = {};
      new FormData(form).forEach(function (value, name) {
        if (name.indexOf('tilda') === 0 || name === 'formservices[]' || name === 'form-spec-comments') return;
        values[name] = value;
      });
      var phone = form.querySelector('input[type="tel"]');
      if (phone) values.Phone = '+7' + phoneDigits(phone.value);
      form.querySelectorAll('[type="submit"], .t-submit').forEach(function (button) { button.disabled = true; });
      // A browser-only integration hook. No personal data leaves the page or persists.
      document.dispatchEvent(new CustomEvent('ranepa-otus:demo-submit', {
        detail: { formId: form.id, type: type, values: values }
      }));
      if (downloads[type]) {
        var download = document.createElement('a');
        download.href = downloads[type];
        download.download = downloads[type].split('/').pop();
        download.hidden = true;
        document.body.appendChild(download);
        download.click();
        download.remove();
      }
      form.reset();
      showSuccess(type, event.submitter);
    });
  });

  // The snapshot may retain its old open/hidden state; always start with all dialogs closed.
  document.querySelectorAll('.t-popup, #tildaformsuccesspopup-new').forEach(hideModal);
  if (success) {
    var successLink = success.querySelector('a.t-form-success-popup__button');
    if (successLink) successLink.hidden = true;
    var successClose = success.querySelector('.t-form-success-popup__close-icon');
    if (successClose) { successClose.hidden = true; successClose.tabIndex = -1; }
  }
  if (menuButton && menu) {
    menuButton.setAttribute('aria-controls', menu.id);
    closeMenu(false);
  }
})();
