
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
 const wallMat=mat('#eee9de'),floorMat=mat('#d8cbb6'),dark=mat('#34302b'),wood=mat('#c4b49a');
 function box(w,h,d,x,y,z,m){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);scene.add(o);return o;}
 
 // A double-height atrium with an open mezzanine; no intermediate ceiling.
 box(10,.16,17,0,-.08,0,floorMat);
 const cream=mat('#e8ddc9'),stone=mat('#d2c2a5'),bronze=new THREE.MeshStandardMaterial({color:'#8f7957',metalness:.65,roughness:.35});
 for(const side of [-1,1]){
 box(.22,7.8,10.6,side*5,3.9,0,wallMat);
 for(const z of [-8.4,5.4,8.4,-5.4])box(.25,7.8,.18,side*5,3.9,z,cream);
 for(const z of [-6.9,6.9]){
 box(.24,.6,2.85,side*5,.3,z,cream);box(.24,.5,2.85,side*5,7.55,z,cream);
 const glass=new THREE.Mesh(new THREE.PlaneGeometry(2.8,6.65),new THREE.MeshBasicMaterial({color:'#dce7e1',side:THREE.DoubleSide}));glass.position.set(side*5,3.9,z);glass.rotation.y=Math.PI/2;scene.add(glass);
 for(const yy of [.6,3.7,7.2])box(.3,.045,2.85,side*4.96,yy,z,mat('#b2a387'));
 box(.3,6.65,.045,side*4.96,3.9,z);
 }
 }
 box(10,3.25,.22,0,1.625,-8.5,wallMat);
 for(const x of [-4.9,0,4.9])box(.14,4.5,.22,x,5.5,-8.5,cream);
 box(10,.4,.22,0,7.6,-8.5,cream);
 const rearGlass=new THREE.Mesh(new THREE.PlaneGeometry(9.7,4.1),new THREE.MeshBasicMaterial({color:'#e2ebe5'}));rearGlass.position.set(0,5.45,-8.37);scene.add(rearGlass);
 box(2.9,7.8,.22,-3.55,3.9,8.5,wallMat);box(2.9,7.8,.22,3.55,3.9,8.5,wallMat);box(4.2,2,.22,0,6.8,8.5,wallMat);
 // Slender roof structure above the atrium, leaving both floors visible.
 for(const z of [-7,0,7])box(10,.12,.12,0,7.7,z,cream);
 // Rear mezzanine slab and supports.
 box(9.8,.22,3.7,0,3.3,-6.55,cream);
 for(const x of [-4.4,4.4])box(.18,3.2,.18,x,1.6,-7.7,cream);
 const railMat=mat('#a99a80');
 for(let x=-4.8;x<=2.8;x+=.8)box(.035,1.05,.035,x,3.93,-4.7,railMat);
 box(7.8,.04,.04,-.95,4.46,-4.7,railMat);
 // Compact open stair on the right, rising toward the mezzanine.
 const steps=18,rise=3.41/steps,run=.36;
 for(let i=0;i<steps;i++){const z=2.0-i*run;box(1.35,.10,run,3.75,(i+1)*rise,z,cream);if(i%3===0)box(.035,.95,.035,4.42,(i+1)*rise+.5,z,railMat)}
 const stairRail=box(.04,.04,6.9,4.42,2.7,-1.05,railMat);stairRail.rotation.x=.48;
 // Minimal freestanding exhibition partition.
 box(1.8,2.65,.16,-1.5,1.325,-2.3,wallMat);
 for(const z of [3.6,-1]){box(1.3,.14,1.6,-.6,.48,z,stone);for(const zz of [z-.5,z+.5])box(.8,.43,.08,-.6,.22,zz,cream);}
 // Abstract sculptural studies: distinct from Carolina's exhibited paintings.
 function sculpture(x,y,z,type){
 box(.85,.7,.85,x,y+.35,z,cream);
 let geometry;if(type===0)geometry=new THREE.TorusKnotGeometry(.34,.10,96,12,2,3);else if(type===1)geometry=new THREE.TorusGeometry(.42,.11,18,72);else geometry=new THREE.IcosahedronGeometry(.46,1);
 const object=new THREE.Mesh(geometry,type===1?bronze:mat(type===0?'#efe3cb':'#c8bca5'));object.position.set(x,y+1.25,z);if(type===0)object.rotation.z=.3;if(type===2)object.scale.set(.7,1.65,.7);scene.add(object);
 }
 sculpture(1.2,0,5.2,0);sculpture(-1.6,0,-5,1);sculpture(-2.6,3.41,-6.7,2);sculpture(1.3,3.41,-7,0);
 scene.add(new THREE.HemisphereLight('#fff9ed','#ad9b80',2.4));
 const daylight=new THREE.DirectionalLight('#fff6e5',2.6);daylight.position.set(-7,10,6);scene.add(daylight);
 const fillLight=new THREE.DirectionalLight('#e7eeec',1.3);fillLight.position.set(5,7,-8);scene.add(fillLight);
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
 const ordered=[stops[0],...stops.slice(1,4),...stops.slice(4).reverse(),{pos:[3.65,1.65,2.5],yaw:0,work:null,area:true},{pos:[3.75,2.8,-.3],yaw:0,work:null,area:true},{pos:[3.75,4.95,-4.8],yaw:.5,work:null,area:true},{pos:[0,4.95,-5.6],yaw:Math.PI,work:null,area:true}];
 let index=0,yaw=0,pitch=0,targetYaw=0,desired=new THREE.Vector3(...ordered[0].pos);camera.position.copy(desired);
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 function label(){const w=ordered[index].work;status.textContent=index===0?words().intro:w?words().stop+' '+index+' / 6 · '+w.title:(lang()==='fr'?'Mezzanine · Sculptures et vue sur la galerie':lang()==='es'?'Entrepiso · Esculturas y vista de la galería':'Mezzanine · Sculptures and gallery overlook');document.querySelector('#visit-details').hidden=!w;document.querySelector('#visit-prev').disabled=index===0;document.querySelector('#visit-next').disabled=index===ordered.length-1;}
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
