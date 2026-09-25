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
function openProject(button){project=projects.find(p=>p.id===button.dataset.project);if(!project)return;opener=button;document.getElementById('dialog-category').textContent=project.media;for(const [id,val] of [['project-title',project.title],['project-date',project.date],['project-lead',project.lead],['project-role',project.role],['project-scale',project.scale]])document.getElementById(id).textContent=val;const body=document.getElementById('project-body');body.replaceChildren();project.body.forEach(([title,copy])=>{const h=document.createElement('h3'),p=document.createElement('p');h.textContent=title;p.textContent=copy;body.append(h,p)});const link=document.getElementById('project-link');link.hidden=!project.link;if(project.link){link.href=project.link[0];link.textContent=project.link[1]+' ↗'}else link.removeAttribute('href');strip.replaceChildren();project.images.forEach((img,i)=>{const b=document.createElement('button'),im=document.createElement('img');b.type='button';b.setAttribute('aria-label',img.caption);im.src=img.src;im.alt='';b.append(im);b.addEventListener('click',()=>imageAt(i));strip.append(b)});strip.hidden=project.images.length<2;if(!dialog.open)dialog.showModal();document.body.classList.add('modal-open');dialog.scrollTop=0;document.querySelector(".project-detail").scrollTop=0;imageAt(Number(button.dataset.slide)||0);if(!navigatingProject)document.getElementById('close-dialog').focus({preventScroll:true});}
document.querySelectorAll('[data-project]').forEach(b=>b.addEventListener('click',()=>openProject(b)));
document.getElementById('close-dialog').addEventListener('click',()=>dialog.close());document.getElementById('previous-image').addEventListener('click',()=>imageAt(index-1));document.getElementById('next-image').addEventListener('click',()=>imageAt(index+1));dialog.addEventListener('close',()=>{version++;document.body.classList.remove('modal-open');opener?.focus({preventScroll:true})});dialog.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();imageAt(index+(e.key==='ArrowRight'?1:-1))}});screen.addEventListener('touchstart',e=>{start=[e.changedTouches[0].clientX,e.changedTouches[0].clientY]},{passive:true});screen.addEventListener('touchend',e=>{if(!start)return;const dx=e.changedTouches[0].clientX-start[0],dy=e.changedTouches[0].clientY-start[1];if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.5)imageAt(index+(dx<0?1:-1));start=null},{passive:true});

// Reveal once, with CSS doing the animation. No scroll-loop or layout updates.
if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
 const revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
  if(entry.isIntersecting){entry.target.classList.remove('reveal-pending');entry.target.classList.add('reveal-visible');revealObserver.unobserve(entry.target);}
 }),{threshold:0.06,rootMargin:'0px 0px -24px 0px'});
 document.querySelectorAll('.work-card,.section-heading,.reach-intro,.reach-roles,.support-copy,.onboarding-images,.about-section,.skill-row,.personal-work').forEach(el=>{
  if(el.getBoundingClientRect().top>innerHeight){el.classList.add('reveal-pending');revealObserver.observe(el);}
 });
 window.addEventListener('beforeprint',()=>document.querySelectorAll('.reveal-pending').forEach(el=>el.classList.remove('reveal-pending')));
}

function navigateProject(direction){
 const buttons=[...document.querySelectorAll('.work-card [data-project]')];
 const current=buttons.findIndex(b=>b.dataset.project===project.id);
 if(current<0)return;
 const target=buttons[(current+direction+buttons.length)%buttons.length];
 navigatingProject=true;openProject(target);navigatingProject=false;
 if(direction<0)imageAt(project.images.length-1);
}
