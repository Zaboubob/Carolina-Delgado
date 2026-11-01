
const UI={
en:{title:'The immersive gallery',intro:'Step inside Beyond Shadows.',hint:'Drag to look around · Use the arrows to follow the visit · Select a painting for details',enter:'Enter the gallery',loading:'Preparing your visit…',prev:'← Previous stop',next:'Next stop →',reset:'Entrance',full:'Full screen',details:'About this painting',close:'Close ×',error:'The 3D visit could not start on this device. You can explore every artwork in the standard gallery.',fallback:'Open the gallery',stop:'Stop',view:'View artwork',gallery:'3D Gallery'},
fr:{title:'La galerie immersive',intro:'Entrez dans Beyond Shadows.',hint:'Glissez pour regarder autour de vous · Suivez les flèches · Sélectionnez un tableau pour ses détails',enter:'Entrer dans la galerie',loading:'Préparation de votre visite…',prev:'← Étape précédente',next:'Étape suivante →',reset:'Entrée',full:'Plein écran',details:'À propos de cette peinture',close:'Fermer ×',error:'La visite 3D ne peut pas démarrer sur cet appareil. Retrouvez toutes les œuvres dans la galerie classique.',fallback:'Ouvrir la galerie',stop:'Étape',view:'Voir l’œuvre',gallery:'Galerie 3D'},
es:{title:'La galería inmersiva',intro:'Entra en Beyond Shadows.',hint:'Arrastra para mirar alrededor · Sigue las flechas · Selecciona una pintura para ver sus detalles',enter:'Entrar en la galería',loading:'Preparando tu visita…',prev:'← Parada anterior',next:'Siguiente parada →',reset:'Entrada',full:'Pantalla completa',details:'Acerca de esta pintura',close:'Cerrar ×',error:'No se pudo iniciar la visita 3D en este dispositivo. Puedes descubrir las obras en la galería clásica.',fallback:'Abrir la galería',stop:'Parada',view:'Ver obra',gallery:'Galería 3D'}};
const host=document.querySelector('#gallery-world'),overlay=document.querySelector('#visit-overlay'),status=document.querySelector('#visit-status');
const lang=()=>document.documentElement.lang||'en';const words=()=>UI[lang()]||UI.en;
let started=false,ready=false,api=null,active=null,workData=[];
function updateUI(){document.querySelectorAll('[data-visit-text]').forEach(e=>e.textContent=words()[e.dataset.visitText]);if(api)api.label();if(active)showPainting(active);}
document.querySelectorAll('[data-language]').forEach(b=>b.addEventListener('click',()=>queueMicrotask(updateUI)));
updateUI();
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const info=document.querySelector('#painting-info');
function showPainting(w){active=w;document.querySelector('#painting-info-content').innerHTML='<img src="'+w.image+'" alt="'+esc(w.title)+'"><div><p class="eyebrow">'+esc(w.series)+'</p><h2>'+esc(w.title==='Sans titre'?(lang()==='fr'?'Sans titre':lang()==='es'?'Sin título':'Untitled'):w.title)+'</h2><p>'+esc(lang()==='es'?translateSpanish(w.details):w.details)+'</p><p>'+esc(lang()==='fr'?w.descriptionFr:lang()==='es'?translateSpanish(w.description):w.description)+'</p><a class="button" href="boutique.html">'+(lang()==='fr'?'Découvrir la boutique':lang()==='es'?'Visitar la tienda':'Explore the shop')+'</a></div>';if(!info.open)info.showModal();}
document.querySelector('#painting-close').onclick=()=>info.close();info.addEventListener('close',()=>active=null);
document.querySelector('#visit-enter').onclick=()=>{if(ready){started=true;overlay.hidden=true;host.querySelector('canvas').focus();api.label();}};
document.querySelector('#visit-prev').onclick=()=>api?.step(-1);document.querySelector('#visit-next').onclick=()=>api?.step(1);document.querySelector('#visit-reset').onclick=()=>api?.go(0);
document.querySelector('#visit-details').onclick=()=>{if(api?.current())showPainting(api.current())};
document.querySelector('#visit-full').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.querySelector('.immersive-stage').requestFullscreen();}catch{}};
async function init(){
 try{
 const THREE=await import('https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js');
 const response=await fetch('works.json');if(!response.ok)throw Error('catalog');workData=(await response.json()).filter(w=>w.category==='Peintures');
 const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false});renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;
 host.prepend(renderer.domElement);renderer.domElement.tabIndex=0;renderer.domElement.setAttribute('aria-label',words().hint);
 const scene=new THREE.Scene();scene.background=new THREE.Color('#e7dece');scene.fog=new THREE.Fog('#e7dece',18,38);
 const camera=new THREE.PerspectiveCamera(65,1,.08,70);camera.rotation.order='YXZ';
 const mat=(color,roughness=.85)=>new THREE.MeshStandardMaterial({color,roughness});
 const wallMat=mat('#eee9de'),floorMat=mat('#b4a18a'),dark=mat('#34302b'),wood=mat('#88725b');
 function box(w,h,d,x,y,z,m){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);scene.add(o);return o;}
 box(10,.16,17,0,-.08,0,floorMat);box(.2,4.5,17,-5,2.25,0,wallMat);box(.2,4.5,17,5,2.25,0,wallMat);box(10,4.5,.2,0,2.25,-8.5,wallMat);
 box(10,.13,17,0,4.5,0,wallMat);
 // Entrance portal, skirting and architectural ceiling beams.
 box(2.9,4.5,.2,-3.55,2.25,8.5,wallMat);box(2.9,4.5,.2,3.55,2.25,8.5,wallMat);box(4.2,1,.2,0,4,8.5,wallMat);
 for(const x of [-4.86,4.86])box(.06,.12,16.8,x,.06,0,mat('#ccc2b1'));
 for(const z of [-6,-2,2,6]){box(9.8,.15,.12,0,4.3,z,mat('#d8cfbf'));box(6,.02,.6,0,4.39,z,new THREE.MeshBasicMaterial({color:'#fff8e8'}));}
 for(let x=-4.5;x<5;x+=.75)box(.012,.004,16.8,x,.006,0,mat('#9f8e78'));
 for(const z of [-3,3]){box(1.1,.13,2.1,0,.48,z,wood);for(const zz of [z-.7,z+.7])box(.65,.45,.08,0,.23,zz,dark);}
 scene.add(new THREE.HemisphereLight('#fff5df','#8b7861',2.3));
 const ceiling=new THREE.DirectionalLight('#fff7e8',2.2);ceiling.position.set(0,7,4);scene.add(ceiling);
 function textPlane(text,width,height,x,y,z,rotation=0){const c=document.createElement('canvas');c.width=1024;c.height=256;const ctx=c.getContext('2d');ctx.fillStyle='#eee9de';ctx.fillRect(0,0,1024,256);ctx.fillStyle='#38312a';ctx.textAlign='center';ctx.font='48px Georgia';ctx.fillText(text,512,145);const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;const mesh=new THREE.Mesh(new THREE.PlaneGeometry(width,height),new THREE.MeshBasicMaterial({map:tex}));mesh.position.set(x,y,z);mesh.rotation.y=rotation;scene.add(mesh);}
 textPlane('CAROLINA DELGADO',5,.9,0,2.75,-8.37);textPlane('BEYOND SHADOWS',3,.45,0,1.9,-8.36);
 const loader=new THREE.TextureLoader(),targets=[],stops=[{pos:[0,1.65,7],yaw:0,work:null}];
 const zs=[4.7,0,-4.7];const sizes=[[.91,1.22],[.91,1.22],[.61,1.22],[1.55,1.3],[.99,1.3],[2.4,1.5]];
 let missing=0;
 await Promise.all(workData.map(async(w,i)=>{
 const side=i<3?-1:1,z=zs[i%3],rotation=side<0?Math.PI/2:-Math.PI/2,[width,height]=sizes[i];
 const frame=box(.07,height+.1,width+.1,side*4.83,1.95,z,dark);
 let texture;try{texture=await loader.loadAsync(w.image)}catch{missing++;return}
 texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());
 const imageRatio=texture.image.width/texture.image.height;const imageHeight=Math.min(1.8,height*1.22),imageWidth=imageHeight*imageRatio;
 frame.scale.set(1,(imageHeight+.08)/(height+.1),(imageWidth+.08)/(width+.1));
 const painting=new THREE.Mesh(new THREE.PlaneGeometry(imageWidth,imageHeight),new THREE.MeshBasicMaterial({map:texture}));painting.position.set(side*4.78,1.95,z);painting.rotation.y=rotation;painting.userData.work=w;scene.add(painting);targets.push(painting);
 textPlane(w.title,.95,.24,side*4.76,1.95-imageHeight/2-.24,z,rotation);
 const spot=new THREE.PointLight('#fff1d6',12,6,2);spot.position.set(side*3.5,3.6,z);scene.add(spot);
 const pos=[side*2.4,1.65,z];const yaw=side<0?Math.PI/2:-Math.PI/2;stops.push({pos,yaw,work:w});
 }));
 if(missing)throw Error('Missing artwork images');
 // Walk clockwise along the walls.
 const ordered=[stops[0],...stops.slice(1,4),...stops.slice(4).reverse()];
 let index=0,yaw=0,pitch=0,targetYaw=0,desired=new THREE.Vector3(...ordered[0].pos);camera.position.copy(desired);
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 function label(){const w=ordered[index].work;status.textContent=index===0?words().intro:words().stop+' '+index+' / 6 · '+w.title;document.querySelector('#visit-details').hidden=!w;document.querySelector('#visit-prev').disabled=index===0;document.querySelector('#visit-next').disabled=index===ordered.length-1;}
 function go(i){index=Math.max(0,Math.min(ordered.length-1,i));desired.set(...ordered[index].pos);targetYaw=ordered[index].yaw;pitch=0;if(reduced){camera.position.copy(desired);yaw=targetYaw}label()}
 api={go,step:n=>go(index+n),label,current:()=>ordered[index].work};
 const ray=new THREE.Raycaster(),pointer=new THREE.Vector2();let dragging=false,lastX=0,lastY=0,travel=0;
 renderer.domElement.style.touchAction='none';
 renderer.domElement.addEventListener('pointerdown',e=>{if(!started)return;dragging=true;travel=0;lastX=e.clientX;lastY=e.clientY;renderer.domElement.setPointerCapture(e.pointerId)});
 renderer.domElement.addEventListener('pointermove',e=>{if(!dragging)return;const dx=e.clientX-lastX,dy=e.clientY-lastY;travel+=Math.abs(dx)+Math.abs(dy);targetYaw-=dx*.004;pitch=Math.max(-.75,Math.min(.75,pitch-dy*.003));lastX=e.clientX;lastY=e.clientY});
 renderer.domElement.addEventListener('pointerup',e=>{if(!dragging)return;dragging=false;if(travel<8){const rect=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);ray.setFromCamera(pointer,camera);const hit=ray.intersectObjects(targets)[0];if(hit)showPainting(hit.object.userData.work)}});
 renderer.domElement.addEventListener('pointercancel',()=>dragging=false);
 renderer.domElement.addEventListener('keydown',e=>{if(info.open)return;if(['ArrowUp','w','z'].includes(e.key)){e.preventDefault();api.step(1)}if(['ArrowDown','s'].includes(e.key)){e.preventDefault();api.step(-1)}if(e.key==='ArrowLeft')targetYaw+=.18;if(e.key==='ArrowRight')targetYaw-=.18;});
 function resize(){const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}new ResizeObserver(resize).observe(host);resize();
 let last=performance.now();renderer.setAnimationLoop(now=>{const dt=Math.min((now-last)/1000,.1);last=now;const amount=1-Math.exp(-dt*5);camera.position.lerp(desired,amount);let delta=targetYaw-yaw;delta=Math.atan2(Math.sin(delta),Math.cos(delta));yaw+=delta*amount;camera.rotation.y=yaw;camera.rotation.x=pitch;renderer.render(scene,camera)});
 renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();overlay.hidden=false;document.querySelector('#visit-enter').hidden=true;document.querySelector('#visit-loading').textContent=words().error;});
 ready=true;document.querySelector('#visit-loading').hidden=true;document.querySelector('#visit-enter').disabled=false;label();
 }catch(error){document.querySelector('#visit-loading').textContent=words().error;document.querySelector('#visit-enter').hidden=true;document.querySelector('#visit-fallback').hidden=false;}
}
init();
