const projects=JSON.parse(document.getElementById('project-data').textContent);
const dialog=document.getElementById('project-dialog'),frame=document.getElementById('dialog-image'),screen=document.querySelector('.screen'),strip=document.getElementById('filmstrip');
let project,index=0,opener,version=0,start,navigatingProject=false;
async function imageAt(i){
 if(i<0||i>=project.images.length){navigateProject(i<0?-1:1);return;}
 index=i;const currentProject=project,image=currentProject.images[i],v=++version;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const nextImage=new Image();nextImage.src=image.src;
 screen.classList.remove('is-entering');
 screen.classList.add('is-switching');
 await Promise.all([nextImage.decode().catch(()=>{}),new Promise(resolve=>setTimeout(resolve,reduced?0:160))]);
 if(v!==version||!dialog.open)return;
 frame.src=image.src;frame.alt=image.caption;
 document.getElementById('image-caption').textContent=image.caption;
 document.getElementById('image-counter').textContent=`${i+1} / ${currentProject.images.length}`;
 document.getElementById('previous-image').disabled=false;
 document.getElementById('next-image').disabled=false;
 [...strip.children].forEach((button,n)=>button.setAttribute('aria-current',String(i===n)));
 requestAnimationFrame(()=>requestAnimationFrame(()=>{if(v===version)screen.classList.remove('is-switching')}));
 // Decode the adjacent image while the visitor is viewing this one.
 const adjacent=currentProject.images[i+1];if(adjacent){const preload=new Image();preload.src=adjacent.src;preload.decode().catch(()=>{});}
}
function openProject(button){project=projects.find(p=>p.id===button.dataset.project);if(!project)return;opener=button;document.getElementById('dialog-category').textContent=project.media;for(const [id,val] of [['project-title',project.title],['project-date',project.date],['project-lead',project.lead],['project-role',project.role],['project-scale',project.scale]])document.getElementById(id).textContent=val;document.getElementById('project-tools-row').hidden=!project.tools;document.getElementById('project-tools').textContent=project.tools||'';const body=document.getElementById('project-body');body.replaceChildren();project.body.forEach(([title,copy])=>{const h=document.createElement('h3'),p=document.createElement('p');h.textContent=title;p.textContent=copy;body.append(h,p)});const link=document.getElementById('project-link');link.hidden=!project.link;if(project.link){link.href=project.link[0];link.textContent=project.link[1]+' ↗'}else link.removeAttribute('href');strip.replaceChildren();project.images.forEach((img,i)=>{const b=document.createElement('button'),im=document.createElement('img');b.type='button';b.setAttribute('aria-label',img.caption);im.src=img.src;im.alt='';b.append(im);b.addEventListener('click',()=>imageAt(i));strip.append(b)});strip.hidden=project.images.length<2;if(!dialog.open)dialog.showModal();document.body.classList.add('modal-open');dialog.scrollTop=0;document.querySelector(".project-detail").scrollTop=0;imageAt(Number(button.dataset.slide)||0);if(!navigatingProject)document.getElementById('close-dialog').focus({preventScroll:true});}
document.querySelectorAll('[data-project]').forEach(b=>b.addEventListener('click',()=>openProject(b)));
document.getElementById('close-dialog').addEventListener('click',()=>dialog.close());document.getElementById('previous-image').addEventListener('click',()=>imageAt(index-1));document.getElementById('next-image').addEventListener('click',()=>imageAt(index+1));dialog.addEventListener('close',()=>{version++;document.body.classList.remove('modal-open');opener?.focus({preventScroll:true})});dialog.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();imageAt(index+(e.key==='ArrowRight'?1:-1))}});

// Animate separate content groups once as they enter the viewport.
if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
 const selector='.opening-intro,.opening-intro .hero-portrait,.section-heading,.reach-grid .work-card,.instagram-grid .work-card,.support-topic,.personal-copy,.line-categories>a,.skill-capabilities article,.tools-heading,.skill-row,.qualification,.editorial-break,.about-title,.about-text,.career-list>li,.contact-inner>div,.contact-form,.site-footer';
 const elements=[...document.querySelectorAll(selector)];
 const observer=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('motion-visible');observer.unobserve(entry.target)}});
 },{threshold:0.08,rootMargin:'0px 0px -24px 0px'});
 elements.forEach(el=>{
  el.classList.add('motion-ready');
  if(el.matches('.work-card,.skill-capabilities article,.line-categories>a')){
   const siblings=[...el.parentElement.children];el.style.setProperty('--reveal-delay',`${Math.min(siblings.indexOf(el)%4,3)*65}ms`);
  }
  if(el.matches('.hero-portrait,.editorial-break'))el.classList.add('motion-soft');
  observer.observe(el);
 });
 window.addEventListener('beforeprint',()=>elements.forEach(el=>el.classList.add('motion-visible')));
}

function navigateProject(direction){
 const buttons=[...document.querySelectorAll('.work-card [data-project], #support [data-project]')].filter((b,i,all)=>all.findIndex(x=>x.dataset.project===b.dataset.project)===i);
 const current=buttons.findIndex(b=>b.dataset.project===project.id);
 if(current<0)return;
 const target=buttons[(current+direction+buttons.length)%buttons.length];
 navigatingProject=true;openProject(target);navigatingProject=false;
 if(direction<0)imageAt(project.images.length-1);
}

// Keep mobile navigation independent from the desktop index.
const mobileMenu=document.getElementById('mobile-menu');
const menuToggle=document.getElementById('menu-toggle');
const closeMenu=()=>mobileMenu.close();
menuToggle.addEventListener('click',()=>{mobileMenu.showModal();menuToggle.setAttribute('aria-expanded','true');document.body.classList.add('menu-open')});
document.getElementById('menu-close').addEventListener('click',closeMenu);
mobileMenu.addEventListener('click',event=>{if(event.target===mobileMenu){const r=mobileMenu.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right)closeMenu()}});
let pendingSection=null;
function scrollToSection(target){
 requestAnimationFrame(()=>requestAnimationFrame(()=>{
  target.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
  history.replaceState(null,'','#'+target.id);
 }));
}
document.querySelectorAll('a[href^="#"]').forEach(link=>link.addEventListener('click',event=>{
 const target=link.hash&&document.getElementById(link.hash.slice(1));
 if(!target)return;
 event.preventDefault();
 if(mobileMenu.open){pendingSection=target;closeMenu()}else scrollToSection(target);
}));
mobileMenu.addEventListener('close',()=>{
 menuToggle.setAttribute('aria-expanded','false');
 document.body.classList.remove('menu-open');
 if(pendingSection){const target=pendingSection;pendingSection=null;scrollToSection(target)}
});
matchMedia('(min-width:901px)').addEventListener('change',event=>{if(event.matches&&mobileMenu.open)closeMenu()});

// Write the opening copy in reading order without blurring text.
if(!matchMedia('(prefers-reduced-motion: reduce)').matches){
 const blocks=document.querySelectorAll('.hero-copy > *');
 let nextStart=.2;
 blocks.forEach(block=>{
  if(block.classList.contains('button')){block.style.setProperty('--button-delay',`${nextStart}s`);return;}
  const walker=document.createTreeWalker(block,NodeFilter.SHOW_TEXT);
  const nodes=[];while(walker.nextNode()){const n=walker.currentNode;if(n.textContent.trim()&&!n.parentElement.closest('.button>span[aria-hidden]'))nodes.push(n)}
  let character=0;
  nodes.forEach(node=>{
   const fragment=document.createDocumentFragment();
   for(const letter of node.textContent){const span=document.createElement('span');span.className='write-character';span.textContent=letter;span.style.setProperty('--character-delay',`${nextStart+character*.028}s`);fragment.append(span);character++}
   const run=document.createElement("span");run.className="written-run";run.append(fragment);node.replaceWith(run);
  });
  nextStart+=character*.028+.65;
 });
}

// Keep visitors on the site and report only confirmed acceptance.
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
 const status = contactForm.querySelector('.form-status');
 const submit = contactForm.querySelector('[type="submit"]');
 let sending = false;
 contactForm.addEventListener('submit', async event => {
  event.preventDefault();
  if (sending || !contactForm.reportValidity()) return;
  const name = contactForm.elements.name.value.trim();
  const email = contactForm.elements.email.value.trim();
  const message = contactForm.elements.message.value.trim();
  if (!name || !message) {
   status.hidden = false; status.textContent = 'お名前とご相談内容をご入力ください。'; return;
  }
  if (contactForm.elements._honey.value) return;
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
   contactForm.reset();
   status.textContent = '正常に送信されました。お問い合わせありがとうございます。';
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
