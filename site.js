'use strict';
const $ = (selector) => document.querySelector(selector);
const menu = $('.menu-toggle');
const navigation = $('#navigation');
function closeMenu(){ menu.setAttribute('aria-expanded','false'); navigation.classList.remove('open'); }
menu.addEventListener('click',()=>{ const open=menu.getAttribute('aria-expanded')!=='true'; menu.setAttribute('aria-expanded',String(open)); navigation.classList.toggle('open',open); });
navigation.querySelectorAll('a').forEach(link=>link.addEventListener('click',closeMenu));
document.addEventListener('keydown',event=>{if(event.key==='Escape')closeMenu();});
window.matchMedia('(min-width: 761px)').addEventListener('change',event=>{if(event.matches)closeMenu();});

const cities = {
  surat:{name:'Surat',state:'GUJARAT / OUR HOME BASE',description:'From residential communities to commercial destinations and outdoor LED, connect your brand with a city always moving forward.',formats:['Residential','Corporate','Outdoor LED']},
  ahmedabad:{name:'Ahmedabad',state:'GUJARAT / URBAN CONNECTIONS',description:'Build a presence across residential, corporate and retail environments in Gujarat’s commercial hub. Ask our team for locations relevant to your audience.',formats:['Residential','Corporate','Retail']},
  mumbai:{name:'Mumbai',state:'MAHARASHTRA / METROPOLITAN REACH',description:'Explore residential tower and business-park placements in the Mumbai market. Let your brand become part of the spaces people live and work in.',formats:['Residential','Business destinations']},
  vadodara:{name:'Vadodara',state:'GUJARAT / NEIGHBOURHOOD PRESENCE',description:'Connect with residential and corporate audiences across Vadodara. Discuss relevant neighbourhoods, locations and campaign timing with our team.',formats:['Residential','Corporate']},
  gandhinagar:{name:'Gandhinagar',state:'GUJARAT / CAPITAL-CITY CONNECTIONS',description:'Explore residential, mall and corporate settings across the capital-city market. Bring your brief to our team for a considered location plan.',formats:['Residential','Corporate','Malls']},
  mountabu:{name:'Mount Abu',state:'RAJASTHAN / OUTDOOR DESTINATIONS',description:'Consider outdoor LED opportunities in a tourism-led setting. Ask about the available sites, campaign period and creative requirements.',formats:['Outdoor LED']}
};
let selectedCity='surat';
const cityTabs=[...document.querySelectorAll('[data-city]')];
function selectCity(key){
  const city=cities[key]; if(!city)return; selectedCity=key;
  cityTabs.forEach(tab=>{ const selected=tab.dataset.city===key; tab.setAttribute('aria-selected',String(selected)); tab.tabIndex=selected?0:-1; });
  $('#city-panel').setAttribute('aria-labelledby',`tab-${key}`);
  $('#city-name').textContent=`${city.name}.`; $('#city-state').textContent=city.state; $('#city-description').textContent=city.description;
  $('#city-formats').replaceChildren(...city.formats.map(format=>{const span=document.createElement('span');span.textContent=format;return span;}));
  const arrow=document.createElementNS('http://www.w3.org/2000/svg','svg');arrow.setAttribute('class','icon');arrow.setAttribute('viewBox','0 0 24 24');arrow.setAttribute('aria-hidden','true');
  const path=document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d','M5 19 19 5M5 5h14v14');arrow.append(path);
  $('#city-cta').replaceChildren(document.createTextNode(`Plan in ${city.name} `),arrow);
}
cityTabs.forEach((tab,index)=>{
 tab.addEventListener('click',()=>selectCity(tab.dataset.city));
 tab.addEventListener('keydown',event=>{
  let next=index;
  if(event.key==='ArrowRight')next=(index+1)%cityTabs.length;
  else if(event.key==='ArrowLeft')next=(index-1+cityTabs.length)%cityTabs.length;
  else if(event.key==='Home')next=0;else if(event.key==='End')next=cityTabs.length-1;else return;
  event.preventDefault();cityTabs[next].focus();selectCity(cityTabs[next].dataset.city);
 });
});
function showForm(){ $('#enquiry-form').hidden=false;$('#enquiry-result').hidden=true; }
function goToBrief(){showForm();$('#contact').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
$('#city-cta').addEventListener('click',()=>{$('#market-select').value=cities[selectedCity].name;goToBrief();});
document.querySelectorAll('[data-format]').forEach(button=>button.addEventListener('click',()=>{$('#format-select').value=button.dataset.format;goToBrief();}));
$('#partner-cta').addEventListener('click',()=>{$('#format-select').value='Agency / media partnership';showForm();});
document.querySelectorAll('[data-sector]').forEach(button=>button.addEventListener('click',()=>{if(!$('#enquiry-form').elements.brief.value.trim())$('#enquiry-form').elements.brief.value=`Sector: ${button.dataset.sector}\nCampaign goal: `;goToBrief();}));
$('#specs-cta').addEventListener('click',()=>{if(!$('#enquiry-form').elements.brief.value.trim())$('#enquiry-form').elements.brief.value='Please share placement-specific creative requirements, availability and scheduling options.';goToBrief();});

const heroVideo=$('#hero-video');const motionButton=$('#motion-toggle');const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
let userPaused=false;
function setMotionUI(playing){motionButton.textContent=playing?'Pause motion':'Play motion';motionButton.setAttribute('aria-label',playing?'Pause background video':'Play background video');heroVideo.classList.toggle('playing',playing);}
async function playHero(){
 if(reduceMotion.matches||navigator.connection?.saveData){setMotionUI(false);return;}
 if(!heroVideo.getAttribute('src'))heroVideo.src=heroVideo.dataset.src;
 try{await heroVideo.play();setMotionUI(true);}catch{setMotionUI(false);}
}
motionButton.addEventListener('click',()=>{if(!heroVideo.paused){heroVideo.pause();userPaused=true;setMotionUI(false);}else{userPaused=false;playHero();}});
heroVideo.addEventListener('error',()=>{setMotionUI(false);motionButton.textContent='Motion unavailable';motionButton.disabled=true;});
reduceMotion.addEventListener('change',event=>{motionButton.hidden=event.matches||Boolean(navigator.connection?.saveData);if(event.matches){heroVideo.pause();setMotionUI(false);}else if(!userPaused)playHero();});
document.addEventListener('visibilitychange',()=>{if(document.hidden){heroVideo.pause();setMotionUI(false);}else if(!userPaused&&!reduceMotion.matches)playHero();});
if(reduceMotion.matches){motionButton.hidden=true;}else if(navigator.connection?.saveData){motionButton.hidden=true;}else{window.addEventListener('load',()=>window.setTimeout(playHero,300),{once:true});}

const filmDialog=$('#film-dialog');const film=$('#network-film');let returnFocus;
document.querySelectorAll('[data-film]').forEach(button=>button.addEventListener('click',()=>{
 returnFocus=button;if(!film.getAttribute('src'))film.src=film.dataset.src;filmDialog.showModal();document.body.classList.add('dialog-open');heroVideo.pause();setMotionUI(false);film.play().catch(()=>{});
}));
function closeFilm(){film.pause();filmDialog.close();}
$('#close-film').addEventListener('click',closeFilm);
filmDialog.addEventListener('click',event=>{if(event.target===filmDialog){const rect=filmDialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)closeFilm();}});
filmDialog.addEventListener('close',()=>{film.pause();document.body.classList.remove('dialog-open');returnFocus?.focus();if(!userPaused&&!reduceMotion.matches)playHero();});

const form=$('#enquiry-form');let currentBrief='';
const safeLine=value=>String(value??'').replace(/[\u0000-\u001f\u007f]/g,' ').trim().slice(0,180);
for(const name of ['name','company','brief'])form.elements[name].addEventListener('input',()=>form.elements[name].setCustomValidity(''));
form.addEventListener('submit',event=>{
 event.preventDefault();
 for(const name of ['name','company','brief'])form.elements[name].setCustomValidity(form.elements[name].value.trim()?'':'Please enter a value rather than only spaces.');
 if(!form.reportValidity())return;
 const data=new FormData(form);
 currentBrief=`EYESARK campaign enquiry\n\nName: ${safeLine(data.get('name'))}\nCompany / brand: ${safeLine(data.get('company'))}\nWork email: ${safeLine(data.get('email'))}\nMarket: ${safeLine(data.get('market'))}\nMedia interest: ${safeLine(data.get('format'))}\nCampaign timing: ${safeLine(data.get('timing'))||'To discuss'}\nBudget range: ${safeLine(data.get('budget'))||'To discuss'}\n\nBrief:\n${String(data.get('brief')).trim().slice(0,2000)}\n\nPlease share relevant availability, creative specifications and a campaign proposal.`;
 $('#brief-preview').textContent=currentBrief;
 $('#email-draft').href=`mailto:info@eyesarkads.com?subject=${encodeURIComponent('Campaign enquiry — '+safeLine(data.get('company')))}&body=${encodeURIComponent(currentBrief)}`;
 form.hidden=true;$('#enquiry-result').hidden=false;$('#copy-status').textContent='';$('#email-draft').focus();
});
$('#copy-brief').addEventListener('click',async()=>{
 try{await navigator.clipboard.writeText(currentBrief);$('#copy-status').textContent='Brief copied. Paste it into an email to info@eyesarkads.com.';}
 catch{const range=document.createRange();range.selectNodeContents($('#brief-preview'));const selection=window.getSelection();selection.removeAllRanges();selection.addRange(range);$('#copy-status').textContent='Please copy the selected brief using your device’s copy command.';}
});
$('#edit-brief').addEventListener('click',()=>{showForm();form.elements.name.focus();});
$('#enquiry-fields').disabled=false;
const privacyDialog=$('#privacy-dialog');
$('#open-privacy').addEventListener('click',()=>privacyDialog.showModal());
$('#close-privacy').addEventListener('click',()=>privacyDialog.close());
privacyDialog.addEventListener('close',()=>$('#open-privacy').focus());
$('#year').textContent=new Date().getFullYear();
