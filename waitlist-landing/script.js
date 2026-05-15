/* Krost waitlist landing — form handling.
   Posts to the same /api/waitlist endpoint used by the main app.
   Override at runtime via window.KROST_API or the data-api attribute. */

(function () {
  'use strict';

  // Endpoint resolution — same-origin /api/waitlist by default.
  // If hosting this static page on a different domain than the Krost app,
  // set window.KROST_API = 'https://krost.xyz/api/waitlist' before this script,
  // or add data-api="…" to either form element.
  var DEFAULT_ENDPOINT = '/api/waitlist';

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  // localStorage flag so a returning visitor sees a softer state.
  var STORAGE_KEY = 'krost_waitlist_joined';

  function resolveEndpoint(form) {
    return (
      form.getAttribute('data-api') ||
      (typeof window !== 'undefined' && window.KROST_API) ||
      DEFAULT_ENDPOINT
    );
  }

  function setStatus(el, message, kind) {
    if (!el) return;
    el.textContent = message || '';
    el.classList.remove('is-error', 'is-success');
    if (kind) el.classList.add('is-' + kind);
  }

  function setLoading(btn, loading) {
    if (!btn) return;
    var label = btn.querySelector('.btn-label');
    if (loading) {
      btn.disabled = true;
      if (label && !btn.dataset.origLabel) btn.dataset.origLabel = label.textContent;
      if (label) label.textContent = 'Sending…';
    } else {
      btn.disabled = false;
      if (label && btn.dataset.origLabel) label.textContent = btn.dataset.origLabel;
    }
  }

  function wireForm(formId, statusId, btnId) {
    var form = document.getElementById(formId);
    if (!form) return;
    var status = document.getElementById(statusId);
    var btn = document.getElementById(btnId);

    // If user already joined in this browser, soft-acknowledge.
    try {
      if (localStorage.getItem(STORAGE_KEY)) {
        setStatus(status, "You're on the list. We'll email your report shortly.", 'success');
      }
    } catch (e) { /* localStorage may be blocked — fine */ }

    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var emailInput = form.querySelector('input[name="email"]');
      var email = emailInput ? emailInput.value.trim().toLowerCase() : '';

      if (!email || !EMAIL_RE.test(email)) {
        setStatus(status, 'Enter a valid email address.', 'error');
        if (emailInput) emailInput.focus();
        return;
      }

      setLoading(btn, true);
      setStatus(status, '');

      var endpoint = resolveEndpoint(form);
      var payload = {
        email: email,
        role: 'gig_worker',
        platform: 'waitlist-landing',
      };

      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      })
        .then(function (res) {
          return res.json().then(function (data) { return { ok: res.ok, status: res.status, data: data }; });
        })
        .then(function (result) {
          if (result.ok && result.data && result.data.success) {
            try { localStorage.setItem(STORAGE_KEY, '1'); } catch (e) {}
            if (result.data.existing) {
              setStatus(status, "You're already on the list — we'll email your report shortly.", 'success');
            } else {
              setStatus(status, "You're in. Check your inbox for the report.", 'success');
            }
            if (emailInput) emailInput.value = '';
            // Mirror to the other form's status line for consistency.
            var otherStatusId = statusId === 'form-status' ? 'form-status-2' : 'form-status';
            var otherStatus = document.getElementById(otherStatusId);
            if (otherStatus && !otherStatus.textContent) {
              setStatus(otherStatus, "You're in. Check your inbox.", 'success');
            }
          } else {
            var msg = (result.data && result.data.error) || 'Something went wrong. Try again?';
            setStatus(status, msg, 'error');
          }
        })
        .catch(function (err) {
          // Network failure or CORS — degrade gracefully.
          console.warn('[waitlist] submit error', err);
          setStatus(
            status,
            "We couldn't reach the server. Email hello@krost.xyz and we'll add you manually.",
            'error'
          );
        })
        .then(function () { setLoading(btn, false); });
    });
  }

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    wireForm('waitlist-form', 'form-status', 'submit-btn');
    wireForm('waitlist-form-2', 'form-status-2', 'submit-btn-2');

    // Smooth anchor focus for accessibility on hash-based CTAs.
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function () {
        var target = document.querySelector(a.getAttribute('href'));
        if (target) setTimeout(function () { target.setAttribute('tabindex', '-1'); target.focus({ preventScroll: true }); }, 400);
      });
    });
  });
})();
