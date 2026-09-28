// Native POST keeps FormSubmit's server-side CAPTCHA in the submission flow.
(() => {
 const form = document.querySelector('.contact-form');
 if (!form) return;
 const status = form.querySelector('.form-status');
 const button = form.querySelector('[type="submit"]');
 const original = button.innerHTML;
 const key = 'portfolio-contact-next-at';
 let sending = false, nextAt = 0;
 const show = message => { status.hidden = false; status.textContent = message; };
 form.addEventListener('submit', event => {
  if (sending) { event.preventDefault(); return; }
  const name = form.elements.name.value.trim();
  const email = form.elements.email.value.trim();
  const message = form.elements.message.value.trim();
  if (!form.reportValidity() || !name || !message || name.length > 100 || email.length > 254 || message.length > 10000 || /[\r\n]/.test(name + email)) {
   event.preventDefault(); show('お名前・メールアドレス・ご相談内容をご確認ください。'); return;
  }
  if (form.elements._honey.value) {
   event.preventDefault(); show('送信を受け付けられませんでした。ページを再読み込みしてお試しください。'); return;
  }
  try { const stored = Number(localStorage.getItem(key)); if (Number.isFinite(stored)) nextAt = Math.max(nextAt, Math.min(stored, Date.now() + 60000)); } catch (_) {}
  const remaining = Math.ceil((nextAt - Date.now()) / 1000);
  if (remaining > 0) { event.preventDefault(); show(`続けて送信する場合は、あと${remaining}秒お待ちください。入力内容は残っています。`); return; }
  form.elements._subject.value = `ポートフォリオから${name}様よりお問い合わせが有りました`;
  nextAt = Date.now() + 60000;
  try { localStorage.setItem(key, String(nextAt)); } catch (_) {}
  sending = true; button.disabled = true; button.textContent = '認証画面へ進んでいます…';
  show('認証完了後に送信完了画面へ戻ります。');
  // Do not preventDefault here: the service must perform the CAPTCHA verification.
 });
 window.addEventListener('pageshow', () => { sending = false; button.disabled = false; button.innerHTML = original; });
})();
