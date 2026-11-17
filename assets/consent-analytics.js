/* Frontier Labs: Google Analytics 4, loaded only after the visitor opts in.
   Nothing is sent to Google before consent. The choice is kept in localStorage
   and can be changed from the privacy page. */
(function () {
  var s = document.currentScript;
  if (!s) return;
  var GA = s.getAttribute('data-ga');
  var PRIVACY = s.getAttribute('data-privacy') || '/privacy/';
  var KEY = 'fl-analytics-consent';

  function read() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function write(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }

  function load() {
    if (window.__flGa || !GA) return;
    window.__flGa = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    gtag('consent', 'default', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'granted' });
    gtag('js', new Date());
    gtag('config', GA, { allow_google_signals: false, allow_ad_personalization_signals: false });
    var g = document.createElement('script');
    g.async = true;
    g.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA);
    document.head.appendChild(g);
  }

  // Track enquiry clicks as a GA event (only once analytics is on).
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="mailto:"]');
    if (a && window.gtag && window.__flGa) {
      gtag('event', 'generate_lead', { method: 'email', link_text: (a.textContent || '').trim().slice(0, 80), page_path: location.pathname });
    }
  });

  function banner() {
    var b = document.createElement('div');
    b.className = 'consent';
    b.setAttribute('role', 'region');
    b.setAttribute('aria-label', 'Analytics choice');
    b.innerHTML = '<p>May we use Google Analytics to count visits? Nothing is sent until you agree. <a href="' + PRIVACY + '">Privacy</a></p>' +
      '<div class="consent-btns"><button type="button" data-v="no">No thanks</button><button type="button" data-v="yes" class="yes">Allow analytics</button></div>';
    b.addEventListener('click', function (e) {
      var v = e.target.getAttribute && e.target.getAttribute('data-v');
      if (!v) return;
      write(v === 'yes' ? 'granted' : 'denied');
      b.remove();
      if (v === 'yes') load();
    });
    document.body.appendChild(b);
  }

  // Lets the privacy page offer a way to change the choice.
  window.flAnalyticsChoice = function (v) {
    write(v ? 'granted' : 'denied');
    if (v) load(); else location.reload();
  };

  function start() {
    var c = read();
    if (c === 'granted') load();
    else if (c !== 'denied') banner();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
