const CATS=['Ask','Prepare','Process','Analyze','Share','Act','Learn'];
const HINT=['Define the problem and what stakeholders expect','Collect, store and check the data','Clean it and check its integrity','Explore, calculate, find patterns','Visualize and share the findings','Turn insights into decisions','Keep learning and improving'];
const COL=['#1f4fd8','#0f9d8a','#c98a00','#7a4fd8','#d8481f','#4a6b8a','#8a97a6'];
const OLD={Define:'Ask',Collect:'Prepare',Prepare:'Process',Analyze:'Analyze',Visualize:'Share',Decide:'Act',Learn:'Learn',Dashboards:'Share','Data sources':'Prepare',Docs:'Ask',Code:'Analyze',Learning:'Learn',Tools:'Process',Other:'Ask'};
const GUESS=[[/powerbi|tableau|looker|metabase|grafana|superset|datastudio/,'Share'],[/slides|presentation|mail\.google|groups\.google/,'Act'],[/kaggle|snowflake|storage|datasetsearch|analytics\.google|search\.google|trends\.google|forms|data\.gov|databricks|redshift|drive\.google/,'Prepare'],[/bigquery|sheets|spreadsheets|script\.google|dataform|excel|airtable/,'Process'],[/colab|github|gitlab|jupyter|vertex|stackoverflow/,'Analyze'],[/coursera|udemy|youtube|medium|datacamp|edx|skillsboost|grow\.google|support\.google|\/docs\/?$/,'Learn'],[/docs\.google|notion|confluence|sharepoint|calendar\.google|meet\.google|chat\.google/,'Ask']];
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const KEY='analyst-link-hub-v1';
const ymd=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const today=()=>ymd(new Date());
const plus=n=>{const d=new Date();d.setDate(d.getDate()+n);return ymd(d)};
let links=[],cat='All',query='',editId=null;

function load(){try{const r=localStorage.getItem(KEY);if(r){const v2=localStorage.getItem('alh-v')==='2';links=JSON.parse(r).map(l=>({...l,cat:v2?(CATS.includes(l.cat)?l.cat:'Ask'):(OLD[l.cat]||'Ask')}));localStorage.setItem(KEY,JSON.stringify(links));localStorage.setItem('alh-v','2');return}}catch(e){}
  links=[
    {id:1,title:'Weekly sales dashboard',url:'https://app.powerbi.com',cat:'Share',pri:3,due:today(),pinned:true,opens:6,last:Date.now()-864e5,added:Date.now()-9e8},
    {id:2,title:'Customer churn dataset',url:'https://www.kaggle.com/datasets',cat:'Prepare',pri:2,due:plus(-2),pinned:false,opens:1,last:Date.now()-18*864e5,added:Date.now()-12e8},
    {id:3,title:'SQL window functions guide',url:'https://www.youtube.com',cat:'Learn',pri:1,due:plus(5),pinned:false,opens:0,last:0,added:Date.now()-3e8},
    {id:4,title:'Analysis notebook',url:'https://colab.research.google.com',cat:'Analyze',pri:3,due:plus(1),pinned:true,opens:4,last:Date.now()-2*864e5,added:Date.now()-6e8},
    {id:5,title:'KPI definitions',url:'https://docs.google.com',cat:'Ask',pri:2,due:'',pinned:false,opens:0,last:0,added:Date.now()-2e8},
    {id:6,title:'Industry benchmark article',url:'https://medium.com',cat:'Learn',pri:0,due:'',pinned:false,opens:0,last:0,added:Date.now()-1e8}];}
function save(){try{localStorage.setItem(KEY,JSON.stringify(links));localStorage.setItem('alh-v','2')}catch(e){}if(window.afterSave)afterSave()}
function host(u){try{return new URL(u).hostname.replace(/^www\./,'')}catch(e){return u}}
function guess(u){const h=u.toLowerCase();for(const [re,c] of GUESS)if(re.test(h))return c;return 'Ask'}
function fix(u){u=u.trim();if(!u)return '';if(!/^https?:\/\//i.test(u))u='https://'+u;try{new URL(u);return u}catch(e){return ''}}
function status(l){if(!l.due||l.doneOn===today())return 0;const t=today();return l.due<t?-1:l.due===t?1:2}
function score(l){let s=l.pri*10;const st=status(l);if(st===-1)s+=40;else if(st===1)s+=30;else if(st===2)s-=5;if(l.pinned)s+=12;if(!l.opens)s+=4;return s}
function dueText(l){if(!l.due)return '';if(l.doneOn===today())return '<span class="due-today">Done today</span>';const st=status(l);const d=Math.round((new Date(l.due+'T00:00')-new Date(today()+'T00:00'))/864e5);
  if(st===-1)return '<span class="due-over">Overdue by '+(-d)+' day'+(d===-1?'':'s')+'</span>';
  if(st===1)return '<span class="due-today">Due today</span>';return 'Due in '+d+' day'+(d===1?'':'s')}
function row(l){const pr=['Inbox','Later','Should do','Must do'][l.pri];
  return '<div class="item'+(l.doneOn===today()?' dn':'')+'"><a class="ico-a" href="'+esc(l.url)+'" target="_blank" rel="noopener" data-open="'+l.id+'" tabindex="-1" aria-hidden="true">'+iconHtml({url:l.url,title:l.title,icon:l.icon,color:COL[hash(host(l.url))%7]},'lg')+'</a><div class="main"><a class="t" href="'+esc(l.url)+'" target="_blank" rel="noopener" data-open="'+l.id+'">'+esc(l.title)+'</a>'+
  '<div class="meta"><span class="tag">'+(CATS.indexOf(l.cat)+1)+'. '+esc(l.cat)+'</span><span>'+esc(host(l.url))+'</span><span>'+pr+'</span><span>'+(l.mins||15)+' min</span>'+(l.due?'<span>'+dueText(l)+'</span>':'')+'<span>Opened '+l.opens+'×</span></div>'+(l.pri===0?'<div class="tq">Sort it: <button data-set="'+l.id+':3">Must</button><button data-set="'+l.id+':2">Should</button><button data-set="'+l.id+':1">Later</button></div>':'')+'</div>'+
  '<div class="acts"><button class="ib'+(l.doneOn===today()?' on':'')+'" data-done="'+l.id+'" aria-label="Mark done today" title="Mark done today">✓</button><button class="ib'+(l.pinned?' on':'')+'" data-pin="'+l.id+'" aria-label="Pin" title="Pin">'+(l.pinned?'★':'☆')+'</button>'+
  '<button class="ib" data-edit="'+l.id+'" aria-label="Edit" title="Edit">✎</button>'+
  '<button class="ib" data-del="'+l.id+'" aria-label="Delete" title="Delete">✕</button></div></div>'}

function render(){
  const t=today(),over=links.filter(l=>status(l)===-1),dt=links.filter(l=>status(l)===1);
  const stale=links.filter(staleL);
  const k=[['In Inbox',links.filter(l=>l.pri===0).length,'','v:inbox'],['Overdue',over.length,over.length?'bad':'','v:due'],['Due today',dt.length,'','v:due'],['Need a look',stale.length,stale.length?'bad':'','v:stale']];
  $('#kpis').innerHTML=k.map(x=>'<button class="kpi '+x[2]+'" data-nav="'+x[3]+'"><b>'+x[1]+'</b><span>'+x[0]+'</span></button>').join('');
  renderFocus();
  const counts=CATS.map(c=>links.filter(l=>l.cat===c).length),n=links.length||1;
  const op=CATS.map(c=>links.filter(l=>l.cat===c).reduce((a,l)=>a+l.opens,0)),to=op.reduce((a,b)=>a+b,0)||1;
  $('#bar').innerHTML=CATS.map((c,i)=>'<div class="st'+(counts[i]?' ok':'')+'"><b>'+(i+1)+'</b><span>'+c+'<small>'+HINT[i]+'</small><u style="width:'+Math.round(op[i]/to*100)+'%"></u></span><em>'+counts[i]+'</em></div>').join('');$('#leg').innerHTML='<p class="note">Bars show where your opens go. Numbers are links per stage.</p>';
  $('#chips').innerHTML=['All',...CATS].map(c=>'<button class="chip'+(c===cat?' on':'')+'" data-cat="'+c+'">'+c+'</button>').join('');
  const q=query.toLowerCase();
  const shown=links.filter(l=>inView(l)&&(cat==='All'||l.cat===cat)&&(!q||(l.title+' '+l.url+' '+l.cat).toLowerCase().includes(q))).sort(sortBy==='path'?(a,b)=>CATS.indexOf(a.cat)-CATS.indexOf(b.cat)||score(b)-score(a):(a,b)=>score(b)-score(a));
  {const nm={all:'All links',inbox:'Inbox',due:'Due & overdue',star:'Starred',stale:'Needs a look'};$('#lt').textContent=(view==='all'?(cat==='All'?'All links':cat):nm[view])+' ('+shown.length+')'}
  $('#list').innerHTML=shown.length?shown.map(row).join(''):'<div class="empty">Nothing matches. Clear the search or pick another category.</div>';
  $('#ins').innerHTML=insights(over,dt,stale,counts).map(x=>'<li>'+x+'</li>').join('');
  decide(over,dt,stale);renderNav(over,dt,stale);renderReview();renderMentor();renderDec();
}
function insights(over,dt,stale,counts){
  const o=[];if(!links.length)return ['Add a few links and insights appear here.'];
  if(over.length)o.push('<b>'+over.length+' overdue.</b> Start with “'+esc(over.sort((a,b)=>score(b)-score(a))[0].title)+'”, then reset dates you will not meet.');
  if(dt.length)o.push('<b>'+dt.length+' due today.</b> Block the first hour of your day for them.');
  const rvA=reviewAge();if(rvA===null||rvA>7)o.push('<b>Weekly review due.</b> Sort the Inbox, retire links you no longer use, and choose next week’s Must links.');
  const inb=links.filter(l=>l.pri===0).length;if(inb)o.push('<b>'+inb+' link'+(inb>1?'s':'')+' in your Inbox.</b> Sort each with one tap: Must, Should or Later. Unsorted links drain focus.');
  const tot=links.reduce((a,l)=>a+l.opens,0);if(tot>=10){const sr=[...links].sort((a,b)=>b.opens-a.opens),k=Math.max(1,Math.ceil(links.length*.2)),sh=Math.round(sr.slice(0,k).reduce((a,l)=>a+l.opens,0)/tot*100);o.push('<b>'+sh+'% of your opens go to '+k+' link'+(k>1?'s':'')+'.</b> Those are your vital few. Pin them and keep the rest in Later.')}
  const cn=c=>counts[CATS.indexOf(c)];
  if(!cn('Ask')&&(cn('Prepare')+cn('Process')+cn('Analyze')+cn('Share')))o.push('<b>Start with the question.</b> You have links for later stages but none under Ask. Define the problem and what stakeholders expect first.');
  if(cn('Prepare')&&!cn('Process'))o.push('<b>Data without a cleaning step.</b> Add a link for cleaning or checking this data, so you can trust the results.');
  const shl=links.filter(l=>l.cat==='Share'&&!l.ref),shs=shl.filter(staleL).length;if(shl.length>=3&&shs>=2)o.push('<b>'+shs+' of '+shl.length+' dashboards or reports look unused.</b> Keep the ones you rely on, merge duplicates and retire the rest.');
  if(cn('Share')&&!cn('Act'))o.push('<b>Findings with no decision step.</b> Link the doc, deck or thread where you share the result and record the decision.');
  const miss=CATS.filter((c,i)=>!counts[i]);if(miss.length&&miss.length<7)o.push('<b>Gaps in your analyst path:</b> no links for '+miss.join(', ')+'. A full path runs '+CATS.join(', ')+'.');
  const mx=Math.max(...counts),ci=counts.indexOf(mx),share=Math.round(mx/links.length*100);
  if(links.length>=4&&share>=45)o.push('<b>'+share+'% of links are in “'+CATS[ci]+'”.</b> Your work leans on one area. Check whether the other stages (sources, dashboards, docs) are covered.');
  const never=links.filter(l=>!l.opens&&!l.ref&&l.pri>0);if(never.length)o.push('<b>'+never.length+' never opened.</b> Open each once or delete it, so the list stays trustworthy.');
  const used=[...links].sort((a,b)=>b.opens-a.opens)[0];if(used&&used.opens>2)o.push('<b>Most used:</b> “'+esc(used.title)+'” ('+used.opens+' opens). Pin it so it always ranks high.');
  const hc={};links.forEach(l=>{const h=host(l.url);hc[h]=(hc[h]||0)+1});const dup=Object.entries(hc).filter(e=>e[1]>2)[0];
  if(dup)o.push('<b>'+dup[1]+' links point to '+esc(dup[0])+'.</b> Consider one bookmark folder or a single index page for that site.');
  const nodue=links.filter(l=>!l.due&&l.pri===3).length;if(nodue)o.push('<b>'+nodue+' high-priority link'+(nodue>1?'s have':' has')+' no reminder.</b> Give each a date.');
  if(!o.length)o.push('Everything looks tidy. Nothing overdue, nothing stale.');
  return o.slice(0,6);
}

function decide(over,dt,stale){
  const hi=links.filter(l=>!l.due&&l.pri===3).length;
  const soon=links.filter(l=>{if(status(l)!==2)return false;return (new Date(l.due+'T00:00')-new Date(today()+'T00:00'))/864e5<=3}).length;
  const load=over.length+dt.length+soon;
  let h=100-over.length*12-stale.length*4-hi*5-Math.max(0,load-5)*4;h=Math.max(0,Math.min(100,h));
  const v=h>=80?['On track','var(--ok)']:h>=50?['Needs attention','#c98a00']:['Overloaded','var(--warn)'];
  const top=[...links].sort((a,b)=>score(b)-score(a))[0];
  let best='Add a few links with reminder dates to get a recommendation.';
  if(top){const w=[],st=status(top);if(st===-1)w.push('it is overdue');if(st===1)w.push('it is due today');if(top.pri===3)w.push('its priority is high');if(top.pinned)w.push('you pinned it');if(!top.opens)w.push('you have never opened it');
    best='<b>Best next move:</b> open <a class="t" href="'+esc(top.url)+'" target="_blank" rel="noopener" data-open="'+top.id+'">'+esc(top.title)+'</a> because '+(w.join(', ')||'it ranks highest on your list')+'.'}
  const now=links.filter(l=>status(l)===-1||status(l)===1);
  const sched=links.filter(l=>!l.due&&l.pri>=2);
  const drop=links.filter(l=>l.pri===1&&!l.pinned&&status(l)!==-1&&staleL(l));
  const li=a=>a.length?'<ul>'+a.slice(0,4).map(l=>'<li>'+esc(l.title)+'</li>').join('')+(a.length>4?'<li>+'+(a.length-4)+' more</li>':'')+'</ul>':'<span style="color:var(--mute)">None</span>';
  const warn=load>5?'<p><b>Workload warning:</b> '+load+' links are due or overdue within 3 days. Push the low-priority ones back, or you will miss dates.</p>':'';
  $('#decide').innerHTML='<div class="score"><b style="color:'+v[1]+'">'+h+'</b><div><strong>'+v[0]+'</strong><div class="bar"><i style="width:'+h+'%;background:'+v[1]+'"></i></div></div></div>'+
    warn+
    '<div class="tri"><div><h3>Do now ('+now.length+')</h3>'+li(now)+'</div><div><h3>Needs a date ('+sched.length+')</h3>'+li(sched)+'</div><div><h3>Drop or archive ('+drop.length+')</h3>'+li(drop)+'</div></div>'+
    '<details class="note"><summary>How is this score calculated?</summary>Score: 100, minus 12 per overdue link, 4 per stale link, 5 per high-priority link with no date, and 4 for each link beyond 5 due in the next 3 days. It reads only your link data, so use it as a guide, not a verdict.</details>';
}
const HUB=[
['Calendar','https://calendar.google.com/a/{d}',0],['Docs','https://docs.google.com/a/{d}/document/',0],['Chat','https://chat.google.com/',0],['Meet','https://meet.google.com/?hd={d}',0],
['Forms','https://docs.google.com/a/{d}/forms/',1],['Drive','https://drive.google.com/a/{d}',1],['Analytics','https://analytics.google.com/',1],['Search Console','https://search.google.com/search-console',1],['Trends','https://trends.google.com/',1],['Dataset Search','https://datasetsearch.research.google.com/',1],['Cloud Storage','https://console.cloud.google.com/storage',1],
['Sheets','https://docs.google.com/a/{d}/spreadsheets/',2],['BigQuery','https://console.cloud.google.com/bigquery',2],['Apps Script','https://script.google.com/',2],['Dataform','https://cloud.google.com/dataform',2],
['Colab','https://colab.research.google.com/',3],['Vertex AI','https://console.cloud.google.com/vertex-ai',3],
['Looker Studio','https://lookerstudio.google.com/',4],['Looker','https://cloud.google.com/looker',4],
['Slides','https://docs.google.com/a/{d}/presentation/',5],['Gmail','https://mail.google.com/a/{d}',5],['Groups','https://groups.google.com/a/{d}',5],
['Skills Boost','https://www.cloudskillsboost.google/',6],['Analytics Certificate','https://grow.google/certificates/data-analytics/',6],['BigQuery docs','https://cloud.google.com/bigquery/docs',6],['Looker Studio help','https://support.google.com/looker-studio',6],
['Admin console','https://admin.google.com/',7],['Cloud Console','https://console.cloud.google.com/',7]];
const STG=CATS.concat(['Admin & setup']);
let domain='';
const stg=h=>h[2]>6?0:h[2],hubCol=h=>COL[stg(h)];
const fillUrl=u=>domain?u.replace(/\{d\}/g,domain):u.replace('/a/{d}','').replace('?hd={d}','');
const hubUrl=h=>fillUrl(h[1]);
const hubHtml=t=>STG.map((s,si)=>{const it=HUB.filter(h=>h[2]===si);return it.length?t(si<7?(si+1)+'. '+s:s,it):''}).join('');
function wsRender(){
  $('#ws').innerHTML='<label for="dom" style="margin-top:0">Your Workspace domain (optional)</label><div style="display:flex;gap:8px"><input id="dom" placeholder="yourcompany.com" value="'+esc(domain)+'"><button class="btn" id="dom-s">Save</button></div><p class="note">'+(domain?'Workspace apps open signed in to '+esc(domain)+'.':'Leave empty for plain Google links, or enter the part of your work email after @.')+'</p>'+
  '<p class="note dk">Open the apps from <b>Google hub</b> in the sidebar (tap Menu on a phone). They follow the order of a data analyst project.</p>'+
  '<div class="hub">'+hubHtml((s,it)=>'<div class="hg"><div class="cap2">'+s+'</div><div class="ws">'+it.map(h=>'<a href="'+esc(hubUrl(h))+'" target="_blank" rel="noopener">'+iconHtml({url:hubUrl(h),title:h[0],color:hubCol(h)},'md')+''+h[0]+'</a>').join('')+'</div></div>')+'</div>'+
  '<button class="btn" id="ws-add" style="margin-top:12px;width:100%">Add all to my links</button>';
}
document.addEventListener('click',e=>{
  if(e.target.id==='dom-s'){const d=$('#dom').value.trim().toLowerCase().replace(/^https?:\/\//,'').replace(/^.*@/,'').replace(/\/.*$/,'');
    if(d&&!/^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(d)){$('#dom').style.borderColor='var(--warn)';return}
    domain=d;try{localStorage.setItem('alh-domain',d)}catch(x){}if(window.afterSave)afterSave();wsRender();renderHubNav();toast('Domain saved')}
  if(e.target.id==='ws-add'){HUB.forEach((h,i)=>{const u=hubUrl(h);if(!links.some(l=>l.url===u))links.push({id:Date.now()+i,title:'Google: '+h[0],url:u,cat:CATS[stg(h)],pri:1,mins:5,ref:true,due:'',pinned:false,opens:0,last:0,added:Date.now()})});save();render();toast('Google hub links added')}
});
let view='all';
const staleL=l=>!l.ref&&l.pri>0&&(!l.opens||(l.last&&Date.now()-l.last>14*864e5));
const inView=l=>view==='all'||(view==='due'&&(status(l)===-1||status(l)===1))||(view==='star'&&l.pinned)||(view==='inbox'&&l.pri===0)||(view==='stale'&&staleL(l));
function renderNav(over,dt,stale){
  const on=k=>(k.startsWith('v:')?k==='v:'+view&&cat==='All':view==='all'&&k==='c:'+cat)?' on':'';
  const it=(k,t,c,hot)=>'<button class="nv'+on(k)+'" data-nav="'+k+'"><span>'+t+'</span><b'+(hot?' class="hot"':'')+'>'+(c||'')+'</b></button>';
  const due=over.length+dt.length,star=links.filter(l=>l.pinned).length;
  $('#navmain').innerHTML='<div class="navtop"><button class="fab fabx">＋ Add link</button>'+startBtn()+'</div><div class="cap">Today</div>'+it('v:all','Home',links.length)+it('v:inbox','Inbox',links.filter(l=>l.pri===0).length)+it('v:due','Due & overdue',due)+it('v:star','Starred',star); 
  $('#navrev').innerHTML='<div class="cap">Review</div>'+it('v:stale','Needs a look',stale.length);
  $('#stages').innerHTML=CATS.map((c,i)=>{const n=links.filter(l=>l.cat===c).length,hot=links.some(l=>l.cat===c&&(status(l)===-1||status(l)===1)),sx=stState(c);return '<button class="nv stp'+on('c:'+c)+'" data-nav="c:'+c+'" title="'+esc(HINT[i])+'"><i class="sn '+sx+'">'+(sx==='done'?'✓':i+1)+'</i><span>'+c+'</span><b'+(hot?' class="hot"':'')+'>'+(n||'')+'</b></button>'}).join('');
  $('#pathd summary').innerHTML='Analyst workflow <em class="pg">'+CATS.slice(0,6).filter(c=>stState(c)==='done').length+'/6</em>';
  const tb=(k,ic,t,c)=>'<button class="tb'+on(k)+'" data-nav="'+k+'"><span class="ic">'+ic+'</span><span>'+t+'</span>'+(c?'<i>'+c+'</i>':'')+'</button>';
  $('#tabbar').innerHTML=tb('v:all','⌂','Home')+tb('v:inbox','✉','Inbox',links.filter(l=>l.pri===0).length)+'<button class="tb add fabx" aria-label="Add link"><span class="ic">＋</span></button>'+tb('v:due','◷','Due',due)+'<button class="tb" id="menu" aria-label="Open menu"><span class="ic">☰</span><span>Menu</span></button>';
}
let sortBy='score',ctouched=false;
$('#sort').onchange=e=>{sortBy=e.target.value;render()};
$('#f-cat').addEventListener('change',()=>{ctouched=true});
let budget=60;
function queue(){const s=links.filter(l=>l.pri>0&&!l.ref&&l.doneOn!==today()).sort((a,b)=>score(b)-score(a)),out=[];let t=0;
  for(const l of s){const m=l.mins||15;if(out.length>=5)break;if(t+m<=budget||!out.length){out.push(l);t+=m}}return {out,t}}
function renderFocus(){const {out,t}=queue();
  const done=links.filter(l=>l.doneOn===today()).length,must=links.filter(l=>l.pri===3&&l.doneOn!==today()).length,inb=links.filter(l=>l.pri===0).length;
  $('#focus').innerHTML=out.length?out.map(row).join(''):'<div class="empty">Nothing planned. Sort your Inbox or add a link.</div>';
  $('#fsum').innerHTML='Planned '+t+' of '+budget+' min. Done today: '+done+'.'+(must>3?' <b>'+must+' Must links.</b> Keep it to 3 a day and move the rest to Should.':'')+(inb?' '+inb+' in Inbox waiting to be sorted.':'');}
$('#tb').onchange=e=>{budget=+e.target.value;render()};
const IMG_OK=/^data:image\/(png|jpeg|webp|gif);base64,/;
let iconsOn=true,curIcon=null;
const hash=s=>[...String(s)].reduce((a,c)=>(a*31+c.charCodeAt(0))>>>0,7);
const hostOf=u=>{try{return new URL(u).hostname}catch(e){return ''}};
const fav=u=>hostOf(u)?'https://www.google.com/s2/favicons?domain='+encodeURIComponent(hostOf(u))+'&sz=64':'';
const fav2=u=>hostOf(u)?'https://icons.duckduckgo.com/ip3/'+hostOf(u)+'.ico':'';
function iconHtml(o,sz){
  const ic=o.icon,letter=esc((String(o.title||'?').trim()[0]||'?').toUpperCase());
  let inner='<b>'+letter+'</b>';
  if(ic&&ic.t==='emoji')inner='<b class="em">'+esc(ic.v)+'</b>';
  else if(ic&&ic.t==='img'&&IMG_OK.test(ic.v))inner+='<img src="'+ic.v+'" alt="">';
  else if(iconsOn&&fav(o.url))inner+='<img class="fv" loading="lazy" src="'+esc(fav(o.url))+'" data-alt="'+esc(fav2(o.url))+'" alt="">';
  return '<span class="ico '+(sz||'lg')+'" style="--c:'+(o.color||COL[hash(o.title)%7])+'">'+inner+'</span>';
}
document.addEventListener('error',e=>{const t=e.target;if(t.classList&&t.classList.contains('fv')){if(!t.dataset.d&&t.dataset.alt){t.dataset.d=1;t.src=t.dataset.alt}else t.remove()}},true);
function icPrev(){const u=fix($('#f-url').value)||'https://example.com';$('#ic-prev').innerHTML=iconHtml({url:u,title:$('#f-title').value||host(u),icon:curIcon,color:COL[hash(host(u))%7]},'lg')}
$('#f-url').addEventListener('input',icPrev);$('#f-title').addEventListener('input',icPrev);
$('#ic-up').onclick=()=>$('#ic-file').click();
$('#ic-auto').onclick=()=>{curIcon=null;$('#ic-emo').value='';icPrev()};
$('#ic-emo').addEventListener('input',e=>{const v=Array.from(e.target.value.trim()).slice(0,2).join('');curIcon=v?{t:'emoji',v}:null;icPrev()});
$('#ic-file').addEventListener('change',e=>{const f=e.target.files[0];e.target.value='';if(!f)return;if(f.size>5e6){toast('Image is over 5 MB');return}
  const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{const c=document.createElement('canvas');c.width=c.height=96;const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,96,96);
    const s=Math.min(im.width,im.height);x.drawImage(im,(im.width-s)/2,(im.height-s)/2,s,s,0,0,96,96);curIcon={t:'img',v:c.toDataURL('image/jpeg',.82)};$('#ic-emo').value='';icPrev()};im.onerror=()=>toast('Could not read that image');im.src=r.result};r.readAsDataURL(f)});
$('#icons').onclick=()=>{iconsOn=!iconsOn;try{localStorage.setItem('alh-icons',iconsOn?'on':'off')}catch(e){}$('#icons').textContent='Site icons: '+(iconsOn?'On':'Off');render();renderHubNav();wsRender()};
function sideInit(){let st={};try{st=JSON.parse(localStorage.getItem('alh-side')||'{}')}catch(e){}['pathd','hubd'].forEach(id=>{if(id in st)$('#'+id).open=!!st[id]})}
document.addEventListener('toggle',e=>{const d=e.target;if(d.id==='pathd'||d.id==='hubd'){let st={};try{st=JSON.parse(localStorage.getItem('alh-side')||'{}')}catch(x){}st[d.id]=d.open;try{localStorage.setItem('alh-side',JSON.stringify(st))}catch(x){}}},true);
function renderHubNav(){const op=[...document.querySelectorAll('#ghub details[open]')].map(d=>d.dataset.s);
  $('#ghub').innerHTML=STG.map((s,si)=>{const it=HUB.filter(h=>h[2]===si);if(!it.length)return '';
    return '<details class="sg" data-s="'+si+'"'+(op.includes(String(si))?' open':'')+'><summary><span>'+(si<7?(si+1)+'. ':'')+s+'</span><em>'+it.length+'</em></summary>'+it.map(h=>'<a class="gl" href="'+esc(hubUrl(h))+'" target="_blank" rel="noopener"><span class="gn">'+iconHtml({url:hubUrl(h),title:h[0],color:hubCol(h)},'sm')+esc(h[0])+'</span><span class="ar">↗</span></a>').join('')+'</details>'}).join('')}
let lastReview='';try{lastReview=localStorage.getItem('alh-review')||''}catch(e){}
const reviewAge=()=>lastReview?Math.round((new Date(today()+'T00:00')-new Date(lastReview+'T00:00'))/864e5):null;
function renderReview(){const a=reviewAge();$('#review').innerHTML='<div class="cap" style="margin:12px 16px 4px">Weekly review</div><div class="rvb"><span>'+(a===null?'Not done yet':a===0?'Done today':'Last done '+a+' day'+(a>1?'s':'')+' ago')+'</span><button class="btn" id="rv-done">Mark done</button></div>'}
function startBtn(){const l=queue().out[0];return l?'<button class="start" data-start="'+l.id+'" title="Open: '+esc(l.title)+' ('+(l.mins||15)+' min)" aria-label="Start next: '+esc(l.title)+'">▶ Start next</button>':''}
const closeNav=()=>document.body.classList.remove('navopen');
document.addEventListener('click',e=>{const t=e.target;
  if(t.closest('#menu')){document.body.classList.toggle('navopen');return}
  const st=t.closest('[data-start]');if(st){const l=links.find(x=>x.id===+st.dataset.start);if(l){window.open(l.url,'_blank','noopener');l.opens++;l.last=Date.now();save();render()}}
  if(t.id==='rv-done'){lastReview=today();try{localStorage.setItem('alh-review',lastReview)}catch(x){}if(window.afterSave)afterSave();render();toast('Weekly review recorded')}
  if(t.closest('#nav button,#nav a,#scrim'))closeNav()});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeNav()});
const stState=c=>{const L=links.filter(l=>l.cat===c&&!l.ref);return L.some(l=>l.opens>0||l.doneOn)?'done':L.length?'todo':'gap'};
const TIPS=['Keep Must do to about three links a day. More than that and nothing is really a priority.','Check the data for gaps or bias before you analyze it. Clean data finds real trends.','Start with the question. A clear question saves hours of rework.','Retire dashboards nobody opens. A few trusted dashboards beat many unused ones.','Write the decision down with the evidence. Future you will thank you.','Do a short weekly review. Sort the Inbox and choose next week’s Must links.'];
function renderMentor(){
  const S=CATS.slice(0,6).map((c,i)=>({c,i,st:stState(c),L:links.filter(l=>l.cat===c&&!l.ref)}));
  const cur=S.find(x=>x.st!=='done'),ready=S.filter(x=>x.st==='done').length,od=links.filter(l=>status(l)===-1).length;
  let head,body,btn='';
  if(!links.filter(l=>!l.ref).length){head='Let’s start with the question';body='Add your first link: a doc or note that states the business question. Every good analysis begins there.';btn='<button class="btn pri fabx">＋ Add a link</button>'}
  else if(!cur){head='You have evidence at every stage';body='Before you act, write the decision in one sentence and say why. A written decision is easier to check and improve later.';btn='<button class="btn pri" id="m-dec">Record my decision</button>'}
  else if(cur.st==='gap'){const t=HUB.find(h=>h[2]===cur.i);head='Next: '+(cur.i+1)+'. '+cur.c;body=HINT[cur.i]+'. You have no link for this stage yet.'+(t?' A good tool to start with is '+t[0]+'.':'');btn='<button class="btn pri fabx">＋ Add a link</button>'+(t?'<a class="btn" href="'+esc(hubUrl(t))+'" target="_blank" rel="noopener">Open '+esc(t[0])+'</a>':'')}
  else{const l=[...cur.L].sort((a,b)=>score(b)-score(a))[0];head='Next: '+(cur.i+1)+'. '+cur.c;body=HINT[cur.i]+'. Open “'+esc(l.title)+'”, then tick it done when you finish.';btn='<a class="btn pri" href="'+esc(l.url)+'" target="_blank" rel="noopener" data-open="'+l.id+'">Open this link</a>'}
  const skip=cur&&S.slice(cur.i+1).some(x=>x.st==='done');
  $('#mentor').innerHTML='<div class="m-top"><span class="m-av">M</span><div><div class="m-h">'+head+'</div><p class="m-b">'+body+'</p></div></div>'+
    (skip?'<p class="m-w">You already used links from a later stage. Go back to '+cur.c+' first, so your decision rests on checked data.</p>':'')+
    (od?'<p class="m-w">'+od+' overdue link'+(od>1?'s':'')+'. Finish or reschedule '+(od>1?'them':'it')+' today.</p>':'')+
    '<div class="gates" role="list" aria-label="Decision readiness">'+S.map(x=>'<div class="gate '+x.st+(cur&&cur.i===x.i?' cur':'')+'" role="listitem"><i>'+(x.st==='done'?'✓':x.st==='todo'?'◐':'○')+'</i>'+x.c+'</div>').join('')+'</div>'+
    '<p class="note">'+ready+' of 6 stages have evidence. '+(ready===6?'You are ready to decide.':'Decide once all six do.')+'</p><div class="m-act">'+btn+'</div><p class="m-tip">Mentor tip: '+TIPS[new Date().getDate()%TIPS.length]+'</p>';
}
let decs=[];try{decs=JSON.parse(localStorage.getItem('alh-dec')||'[]')}catch(e){}
const saveDec=()=>{try{localStorage.setItem('alh-dec',JSON.stringify(decs))}catch(e){}if(window.afterSave)afterSave()};
function renderDec(){$('#declist').innerHTML=decs.slice(0,5).map(d=>'<li><b>'+esc(d.t)+'</b><div class="meta"><span>'+d.date+'</span>'+(d.why?'<span>Because: '+esc(d.why)+'</span>':'')+'<button class="ib" data-dd="'+d.id+'" aria-label="Delete decision">✕</button></div></li>').join('')||'<li class="empty">No decisions recorded yet.</li>'}
document.addEventListener('click',e=>{const t=e.target;
  if(t.id==='dec-save'){const x=$('#dec-t').value.trim();if(!x){$('#dec-t').focus();return}decs.unshift({id:Date.now(),t:x,why:$('#dec-w').value.trim(),date:today()});decs=decs.slice(0,50);saveDec();$('#dec-t').value='';$('#dec-w').value='';renderDec();toast('Decision saved')}
  const dd=t.closest('[data-dd]');if(dd){decs=decs.filter(d=>d.id!==+dd.dataset.dd);saveDec();renderDec()}
  if(t.id==='m-dec'){$('#decp').scrollIntoView({block:'center'});$('#dec-t').focus()}
});
function toast(msg,act,fn){const s=$('#snack');s.innerHTML=esc(msg)+(act?'<button id="snack-a">'+act+'</button>':'');s.classList.add('show');
  if(act)$('#snack-a').onclick=()=>{fn();s.classList.remove('show')};clearTimeout(toast.t);toast.t=setTimeout(()=>s.classList.remove('show'),5000)}
const CORE=['Gmail','Drive','Calendar','Docs','Sheets','Slides','Forms','Meet','Chat'];
let apps=null;
const defApps=()=>CORE.map(n=>({n,u:HUB.find(h=>h[0]===n)[1]}));
function loadApps(){try{const r=localStorage.getItem('alh-apps');apps=r?JSON.parse(r):null}catch(e){apps=null}}
const getApps=()=>apps||defApps();
function appsRender(){$('#appm').innerHTML=getApps().map((a,i)=>'<a href="'+esc(fillUrl(a.u))+'" target="_blank" rel="noopener">'+iconHtml({url:fillUrl(a.u),title:a.n,color:COL[i%7]},'md')+''+esc(a.n)+'</a>').join('')+'<button class="btn cust" id="app-cust">Customize names and links</button>'}
function addRow(n,u,o){$('#app-rows').insertAdjacentHTML('beforeend','<div class="arow" data-o="'+esc(o||'')+'"><input class="an" aria-label="App name" placeholder="Name" value="'+esc(n)+'"><input class="au" aria-label="App link" placeholder="https://" value="'+esc(u)+'"><button class="ib" data-rm aria-label="Remove app">✕</button></div>')}
document.addEventListener('click',e=>{const t=e.target;
  if(t.id==='app-cust'){$('#app-rows').innerHTML='';getApps().forEach(a=>addRow(a.n,fillUrl(a.u),a.u));$('#appm').classList.remove('show');$('#dlg3').showModal();return}
  if(t.id==='app-add'){addRow('','','');return}
  if(t.closest('[data-rm]')){t.closest('.arow').remove();return}
  if(t.id==='cx3'){$('#dlg3').close();return}
  if(t.id==='app-reset'){try{localStorage.removeItem('alh-apps')}catch(x){}apps=null;$('#dlg3').close();appsRender();toast('Launcher reset');return}
  if(t.id==='sv3'){const out=[];document.querySelectorAll('#app-rows .arow').forEach(r=>{const n=r.querySelector('.an').value.trim(),v=r.querySelector('.au').value.trim();if(!n||!v)return;const u=fix(v);if(!u)return;const o=r.dataset.o;out.push({n,u:o&&u===fillUrl(o)?o:u})});
    apps=out.slice(0,12);try{localStorage.setItem('alh-apps',JSON.stringify(apps))}catch(x){}if(window.afterSave)afterSave();$('#dlg3').close();appsRender();toast('Launcher saved')}
});
document.addEventListener('click',e=>{
  const n=e.target.closest('[data-nav]');
  if(n){const k=n.dataset.nav;if(k.startsWith('v:')){view=k.slice(2);cat='All'}else{view='all';cat=k.slice(2)}render();if(k!=='v:all'||n.classList.contains('kpi'))$('#all').scrollIntoView({behavior:(window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches)?'auto':'smooth',block:'start'});else scrollTo(0,0);return}
  if(e.target.closest('.fabx')){openDlg();return}
  if(e.target.closest('#theme')){const r=document.documentElement,cur=r.dataset.theme||(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light');r.dataset.theme=cur==='dark'?'light':'dark';return}
  if(e.target.closest('#apps')){appsRender();$('#appm').classList.toggle('show');return}
  if(!e.target.closest('#appm'))$('#appm').classList.remove('show')});
document.addEventListener('keydown',e=>{if(/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)||e.metaKey||e.ctrlKey||document.querySelector('dialog[open]'))return;
  if(e.key==='c'){e.preventDefault();openDlg()}if(e.key==='Escape')$('#appm').classList.remove('show')});
function openDlg(l){editId=l?l.id:null;$('#dt').textContent=l?'Edit link':'Add link';
  $('#f-cat').innerHTML=CATS.map(c=>'<option>'+c+'</option>').join('');
  ctouched=false;$('#f-url').value=l?l.url:'';$('#f-title').value=l?l.title:'';$('#f-cat').value=l?l.cat:CATS[0];$('#f-pri').value=l?l.pri:2;$('#f-due').value=l?l.due:plus(3);$('#f-min').value=l&&l.mins?l.mins:15;curIcon=l&&l.icon?l.icon:null;$('#ic-emo').value=curIcon&&curIcon.t==='emoji'?curIcon.v:'';icPrev();
  $('#dlg').showModal();$('#f-url').focus()}
$('#add').onclick=()=>openDlg();
$('#cx').onclick=()=>$('#dlg').close();
$('#f-url').addEventListener('blur',()=>{if(!editId&&$('#f-url').value&&!ctouched)$('#f-cat').value=guess($('#f-url').value)});
$('#sv').onclick=()=>{const u=fix($('#f-url').value);if(!u){$('#f-url').focus();$('#f-url').style.borderColor='var(--warn)';return}
  $('#f-url').style.borderColor='';const d={title:$('#f-title').value.trim()||host(u),url:u,cat:$('#f-cat').value,pri:+$('#f-pri').value,due:$('#f-due').value,mins:+$('#f-min').value,icon:curIcon};
  if(editId){Object.assign(links.find(l=>l.id===editId),d)}else links.push({id:Date.now(),pinned:false,opens:0,last:0,added:Date.now(),...d});
  save();render();$('#dlg').close()};
$('#bulk').onclick=()=>{$('#bulk-t').value='';$('#dlg2').showModal()};
$('#cx2').onclick=()=>$('#dlg2').close();
$('#sv2').onclick=()=>{let n=0;$('#bulk-t').value.split('\n').forEach((ln,i)=>{ln=ln.trim();if(!ln)return;const p=ln.split('|');const u=fix(p.length>1?p[1]:p[0]);if(!u)return;
  links.push({id:Date.now()+i,title:(p.length>1&&p[0].trim())||host(u),url:u,cat:guess(u),pri:0,due:'',mins:15,pinned:false,opens:0,last:0,added:Date.now()});n++});
  save();render();$('#dlg2').close()};
$('#q').oninput=e=>{query=e.target.value;render()};
document.addEventListener('keydown',e=>{if(e.key==='/'&&!/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)){e.preventDefault();$('#q').focus()}});
document.addEventListener('click',e=>{const b=e.target.closest('[data-pin],[data-edit],[data-del],[data-cat],[data-open],[data-set],[data-done]');if(!b)return;
  const g=a=>b.dataset[a],f=id=>links.find(l=>l.id===+id);
  if(g('cat')){cat=g('cat');render();return}
  if(g('open')){const l=f(g('open'));l.opens++;l.last=Date.now();save();setTimeout(render,0);return}
  if(g('pin')){const l=f(g('pin'));l.pinned=!l.pinned}
  if(g('edit')){openDlg(f(g('edit')));return}
  if(g('del')){const gone=f(g('del'));links=links.filter(l=>l.id!==+g('del'));toast('Link deleted','Undo',()=>{links.push(gone);save();render()})}
  if(g('set')){const [id,p]=g('set').split(':');f(id).pri=+p;toast('Moved to '+['Inbox','Later','Should do','Must do'][+p])}
  if(g('done')){const l=f(g('done'));l.doneOn=l.doneOn===today()?'':today();if(l.doneOn){l.opens++;l.last=Date.now()}}
  save();render()});
$('#exp').onclick=()=>{const t=links.map(l=>[l.title,l.url,l.cat,l.pri,l.due,l.opens].map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(',')).join('\n');
  const w=window.open('','_blank');if(w){w.document.write('<pre>'+esc('title,url,category,priority,due,opens\n'+t)+'</pre>')}};
$('#clr').onclick=()=>{if(confirm('Remove all links? This cannot be undone.')){links=[];save();render()}};
const hr=new Date().getHours();$('#hi').textContent=hr<12?'Good morning':hr<18?'Good afternoon':'Good evening';$('#dl').textContent=new Date().toLocaleDateString(undefined,{weekday:'long',day:'numeric',month:'long'})+'. Here is what needs you first.';
load();try{domain=localStorage.getItem('alh-domain')||''}catch(e){}try{iconsOn=localStorage.getItem('alh-icons')!=='off'}catch(e){}$('#icons').textContent='Site icons: '+(iconsOn?'On':'Off');sideInit();loadApps();wsRender();renderHubNav();render();
