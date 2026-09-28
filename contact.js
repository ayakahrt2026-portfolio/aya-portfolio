// Keep visitors on the site and report only confirmed acceptance.
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
 const status = contactForm.querySelector('.form-status');
 const submit = contactForm.querySelector('[type="submit"]');
 let sending = false;
 const cooldownKey = 'portfolio-contact-next-at';
 let nextAttempt = 0;
 const readCooldown = () => {
  try { const stored = Number(localStorage.getItem(cooldownKey)); if (Number.isFinite(stored)) nextAttempt = Math.max(nextAttempt, Math.min(stored, Date.now() + 60000)); } catch (_) {}
  return Math.ceil((nextAttempt - Date.now()) / 1000);
 };
 const setCooldown = seconds => {
  nextAttempt = Date.now() + seconds * 1000;
  try { localStorage.setItem(cooldownKey, String(nextAttempt)); } catch (_) {}
 };
 contactForm.addEventListener('submit', async event => {
  event.preventDefault();
  if (sending || !contactForm.reportValidity()) return;
  const name = contactForm.elements.name.value.trim();
  const email = contactForm.elements.email.value.trim();
  const message = contactForm.elements.message.value.trim();
  if (!name || !message) {
   status.hidden = false; status.textContent = 'お名前とご相談内容をご入力ください。'; return;
  }
  if (name.length > 100 || email.length > 254 || message.length > 10000 || /[\r\n]/.test(name + email)) {
   status.hidden = false; status.textContent = '入力内容が長すぎるか、使用できない改行が含まれています。内容をご確認ください。'; return;
  }
  if (contactForm.elements._honey.value) {
   status.hidden = false; status.textContent = '送信を受け付けられませんでした。ページを再読み込みしてお試しください。'; return;
  }
  const remaining = readCooldown();
  if (remaining > 0) {
   status.hidden = false; status.textContent = `続けて送信する場合は、あと${remaining}秒お待ちください。入力内容は残っています。`; return;
  }
  setCooldown(10);
  sending = true; submit.disabled = true;
  const label = submit.innerHTML;
  submit.textContent = '送信中…';
  status.hidden = false; status.textContent = '送信しています。そのままお待ちください。';
  contactForm.setAttribute('aria-busy', 'true');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000);
  try {
   const response = await fetch('https://formsubmit.co/ajax/ayakahrt2025@gmail.com', {
    method: 'POST', headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
    signal: controller.signal,
    body: JSON.stringify({name, email, message, _replyto: email,
     _subject: `ポートフォリオから${name.replace(/[\r\n]/g, '')}様よりお問い合わせが有りました`,
     _template: 'table', _honey: ''})
   });
   const result = await response.json();
   if (!response.ok || ![true, 'true'].includes(result.success) || /activat|confirm.*email/i.test(result.message || '')) throw new Error('not accepted');
   setCooldown(60);
   contactForm.reset();
   status.textContent = '送信完了しました。お問い合わせありがとうございます。';
  } catch (error) {
   status.textContent = error.name === 'AbortError'
    ? '送信結果を確認できませんでした。時間をおいてから再度お試しください。'
    : '送信を完了できませんでした。入力内容は残っています。時間をおいてから再度お試しください。';
  } finally {
   clearTimeout(timer); sending = false; submit.disabled = false;
   submit.innerHTML = label; contactForm.removeAttribute('aria-busy');
  }
 });
}
