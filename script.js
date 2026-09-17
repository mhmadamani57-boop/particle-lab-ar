const canvas = document.getElementById('labCanvas');
const ctx = canvas.getContext('2d');
const fieldRange = document.getElementById('fieldRange');
const velocityRange = document.getElementById('velocityRange');
const fieldValue = document.getElementById('fieldValue');
const velocityValue = document.getElementById('velocityValue');
const chargeValue = document.getElementById('chargeValue');
const runStatus = document.getElementById('runStatus');
const stateReadout = document.getElementById('stateReadout');
const xReadout = document.getElementById('xReadout');
const energyReadout = document.getElementById('energyReadout');
const timeReadout = document.getElementById('timeReadout');
const targetRing = document.getElementById('targetRing');
let charge = 1, animating = false, raf = 0, startAt = 0;

function resize(){ const dpr = Math.min(devicePixelRatio || 1, 2); const r = canvas.getBoundingClientRect(); canvas.width = r.width*dpr; canvas.height = r.height*dpr; ctx.setTransform(dpr,0,0,dpr,0,0); drawIdle(); }
function getSize(){ const r = canvas.getBoundingClientRect(); return {w:r.width,h:r.height}; }
function drawGrid(){ const {w,h}=getSize(); ctx.clearRect(0,0,w,h); ctx.save(); ctx.globalAlpha=.22; for(let x=0;x<w;x+=38){ctx.beginPath();ctx.moveTo(x,h*.15);ctx.lineTo(x,h);ctx.strokeStyle='#50ddec';ctx.stroke()} for(let y=h*.15;y<h;y+=38){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.strokeStyle='#50ddec';ctx.stroke()} ctx.restore(); }
function drawIdle(){ drawGrid(); const {w,h}=getSize(); const y=h*.62, sx=w*.82; ctx.save(); ctx.setLineDash([5,8]);ctx.strokeStyle='#6b84ab';ctx.globalAlpha=.5;ctx.beginPath();ctx.moveTo(sx,y);ctx.lineTo(w*.16,y);ctx.stroke();ctx.restore(); drawParticle(sx,y,'#9bf2ff'); }
function drawParticle(x,y,color='#9bf2ff'){ ctx.save(); ctx.shadowBlur=22;ctx.shadowColor=color;ctx.fillStyle=color;ctx.beginPath();ctx.arc(x,y,5,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(x-1.5,y-1.5,1.8,0,Math.PI*2);ctx.fill();ctx.restore(); }
function trajectory(t){ const {w,h}=getSize(); const sx=w*.82, sy=h*.62, b=Number(fieldRange.value), v=Number(velocityRange.value); const radius=Math.max(105, 260 - b*125 + (v-70)*.65); const omega=.9 + b*.55; const angle=charge*(omega*t); return {x:sx-radius*Math.sin(angle), y:sy+charge*radius*(1-Math.cos(angle)), radius}; }
function render(t){ if(!animating)return; const elapsed=(t-startAt)/1000; const {w,h}=getSize(); drawGrid(); const sx=w*.82, sy=h*.62; ctx.save();ctx.strokeStyle=charge>0?'#5ce5f3':'#b993ff';ctx.lineWidth=2;ctx.globalAlpha=.25;ctx.beginPath(); for(let i=0;i<70;i++){const p=trajectory(i*.018);i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y)}ctx.stroke();ctx.restore(); const p=trajectory(Math.min(elapsed,2.8)); drawParticle(p.x,p.y,charge>0?'#62ecff':'#d1a1ff'); xReadout.textContent=`${((w*.82-p.x)/w*100).toFixed(1)}%`; energyReadout.textContent=`${(Number(velocityRange.value)*.82).toFixed(0)} keV`; timeReadout.textContent=`${elapsed.toFixed(2)} s`; if(elapsed<2.8){raf=requestAnimationFrame(render)}else{animating=false;const target={x:w*.2,y:h*.41};const hit=Math.hypot(p.x-target.x,p.y-target.y)<90; finish(hit)} }
function finish(hit){runStatus.textContent=hit?'إصابة ناجحة':'انتهت الجولة';runStatus.style.color=hit?'#11a876':'#c97a37';runStatus.style.borderColor=hit?'#bfead9':'#f4d2ae';runStatus.style.background=hit?'#ebfff7':'#fff7ed';stateReadout.textContent=hit?'الهدف أُصيب!':'جرّب متغيرات أخرى';stateReadout.style.color=hit?'#14ae7c':'#c97a37';targetRing.style.transform=hit?'scale(1.18)':'scale(1)';}
function launch(){cancelAnimationFrame(raf);animating=true;startAt=performance.now();runStatus.textContent='جارٍ التشغيل';runStatus.style.color='#7769f4';runStatus.style.borderColor='#d8d1ff';runStatus.style.background='#f4f1ff';stateReadout.textContent='الجسيم في المسار';targetRing.style.transform='scale(1)';raf=requestAnimationFrame(render)}
fieldRange.addEventListener('input',()=>{fieldValue.textContent=`${Number(fieldRange.value).toFixed(2)} T`;drawIdle()});
velocityRange.addEventListener('input',()=>{velocityValue.textContent=`${velocityRange.value} km/s`;drawIdle()});
document.querySelectorAll('.seg').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('.seg').forEach(b=>b.classList.remove('active'));btn.classList.add('active');charge=Number(btn.dataset.charge);chargeValue.textContent=charge>0?'موجبة +':'سالبة −';drawIdle()}));
document.getElementById('launchBtn').addEventListener('click',launch);document.getElementById('startBtn').addEventListener('click',()=>{document.getElementById('lab').scrollIntoView({behavior:'smooth'});setTimeout(launch,500)});document.getElementById('resetBtn').addEventListener('click',()=>{fieldRange.value=.6;velocityRange.value=72;charge=1;document.querySelectorAll('.seg')[0].click();fieldValue.textContent='0.60 T';velocityValue.textContent='72 km/s';runStatus.textContent='جاهز';stateReadout.textContent='في الانتظار';stateReadout.style.color='#14ae7c';drawIdle()});
document.getElementById('howBtn').addEventListener('click',()=>document.getElementById('howModal').classList.remove('hidden'));document.getElementById('closeModal').addEventListener('click',()=>document.getElementById('howModal').classList.add('hidden'));document.getElementById('howModal').addEventListener('click',e=>{if(e.target.id==='howModal')e.currentTarget.classList.add('hidden')});
window.addEventListener('resize',resize);resize();
