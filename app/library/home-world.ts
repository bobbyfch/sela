import * as THREE from 'three';
import {readPersonal} from './personal-store.ts';

type Companion='cat'|'hamster'|'rabbit'|'fox'|'owl'|'turtle'|'red-panda'|'penguin'|'shiba'|'fawn'|'plant';
// Keep artwork as ordinary static files instead of inlining it into the lazy Three.js chunk.
const publicAsset=(name:string)=>new URL('../library/assets/'+name,location.href).href;
const roomUrl=publicAsset('reading-room.webp');
const companionUrls:Record<Exclude<Companion,'plant'>,string>={
  cat:publicAsset('cat.webp'),
  hamster:publicAsset('hamster.webp'),
  rabbit:publicAsset('rabbit.webp'),
  fox:publicAsset('fox.webp'),
  owl:publicAsset('owl.webp'),
  turtle:publicAsset('turtle.webp'),
  'red-panda':publicAsset('red-panda.webp'),
  penguin:publicAsset('penguin.webp'),
  shiba:publicAsset('shiba.webp'),
  fawn:publicAsset('fawn.webp')
};

/** A small illustrated reading nook rendered as a Three.js scene, with a moving storybook companion. */
export async function mountHomeWorld(home:HTMLElement):Promise<()=>void>{
  const canvas=document.createElement('canvas');canvas.className='home-world-canvas';canvas.setAttribute('aria-hidden','true');document.body.prepend(canvas);
  const root=document.documentElement,reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let renderer:THREE.WebGLRenderer;
  try{renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,depth:true,stencil:false,powerPreference:'low-power'});}
  catch{canvas.dataset.fallback='true';canvas.style.backgroundImage=`url("${roomUrl}")`;home.dataset.world='fallback';return()=>canvas.remove();}

  renderer.setClearColor(0x000000,0);renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.25));
  const scene=new THREE.Scene(),aspect=()=>window.innerWidth/Math.max(window.innerHeight,1),camera=new THREE.OrthographicCamera(-1,1,.5,-.5,.1,40);
  camera.position.set(0,0,10);
  const textureLoader=new THREE.TextureLoader();let disposed=false,visible=false,quiet=false,lastFrame=0,elapsed=0,petGeneration=0,petBaseHeight=.28,petBaseY=-.27,petKind:Companion|undefined,pet:THREE.Sprite|undefined,petTexture:THREE.Texture|undefined;
  let room:THREE.Texture;try{room=await textureLoader.loadAsync(roomUrl);}catch{renderer.dispose();canvas.dataset.fallback='true';canvas.style.backgroundImage=`url("${roomUrl}")`;home.dataset.world='fallback';return()=>canvas.remove();}room.colorSpace=THREE.SRGBColorSpace;room.minFilter=THREE.LinearMipmapLinearFilter;room.magFilter=THREE.LinearFilter;
  const roomPlane=new THREE.Mesh(new THREE.PlaneGeometry(1.5,1),new THREE.MeshBasicMaterial({map:room,depthWrite:false}));roomPlane.position.z=-4;scene.add(roomPlane);
  const rainCount=22,rainPositions=new Float32Array(rainCount*6),rainGeometry=new THREE.BufferGeometry();rainGeometry.setAttribute('position',new THREE.BufferAttribute(rainPositions,3));
  const rain=new THREE.LineSegments(rainGeometry,new THREE.LineBasicMaterial({color:'#fff3d8',transparent:true,opacity:.16,depthWrite:false}));rain.visible=false;scene.add(rain);
  const layout=()=>{const width=aspect(),compact=window.innerWidth<640;camera.left=-width/2;camera.right=width/2;camera.top=.5;camera.bottom=-.5;camera.updateProjectionMatrix();const cover=Math.max(width/1.5,1);roomPlane.scale.setScalar(cover);renderer.setSize(window.innerWidth,window.innerHeight,false);if(pet){const height=Math.min(.32,Math.max(.19,window.innerHeight/920*.28))*(compact?.54:1);petBaseHeight=height;petBaseY=compact?.12:-.27;pet.scale.set(height*(petTexture?.image.width/(petTexture?.image.height||1)||1),height,1);pet.position.set(width*(compact?.34:.23),petBaseY,-1.7);}renderer.render(scene,camera);};
  const removePet=()=>{if(!pet)return;scene.remove(pet);pet.material.dispose();pet=undefined;petTexture?.dispose();petTexture=undefined;};
  const updatePet=async()=>{const selected=readPersonal().companion as Companion;if(selected===petKind)return;petKind=selected;const generation=++petGeneration;removePet();if(selected==='plant'||!(selected in companionUrls))return;
    try{const texture=await textureLoader.loadAsync(companionUrls[selected as Exclude<Companion,'plant'>]);if(disposed||generation!==petGeneration){texture.dispose();return;}texture.colorSpace=THREE.SRGBColorSpace;texture.magFilter=THREE.LinearFilter;texture.minFilter=THREE.LinearMipmapLinearFilter;const material=new THREE.SpriteMaterial({map:texture,transparent:true,alphaTest:.04,depthWrite:false});pet=new THREE.Sprite(material);petTexture=texture;pet.renderOrder=3;scene.add(pet);layout();}
    catch{home.dataset.companion='unavailable';}
  };
  const syncWeather=()=>{const weather=root.dataset.weather||'neutral';rain.visible=weather==='rain'||weather==='storm';};
  const lowPower=()=>{try{return !!JSON.parse(localStorage.getItem('sela-library:preferences')||'{}').lowPower;}catch{return false;}};
  const wantsMotion=()=>!disposed&&visible&&!document.hidden&&!reduced.matches&&!quiet&&!lowPower();
  const render=(time:number)=>{if(!wantsMotion()||time-lastFrame<32)return;lastFrame=time;elapsed=time*.001;camera.position.x=Math.sin(elapsed*.11)*.004;camera.position.y=Math.cos(elapsed*.09)*.003;
    if(pet){pet.position.y=petBaseY+Math.sin(elapsed*1.15)*.009;pet.scale.y=petBaseHeight*(1+Math.sin(elapsed*1.15)*.006);pet.rotation.z=Math.sin(elapsed*.31)*.012;}
    if(rain.visible){const width=aspect();for(let index=0;index<rainCount;index++){const x=(index/rainCount-.5)*width*1.1+Math.sin(elapsed*.24+index)*.012,y=.52-((elapsed*.19+index*.079)%1.12);rainPositions.set([x,y,-1.9,x-.012,y-.045,-1.9],index*6);}const position=rainGeometry.getAttribute('position') as THREE.BufferAttribute;position.needsUpdate=true;}
    renderer.render(scene,camera);
  };
  const sync=()=>{if(disposed)return;quiet=readPersonal().quiet;syncWeather();void updatePet();if(wantsMotion())renderer.setAnimationLoop(render);else{renderer.setAnimationLoop(null);renderer.render(scene,camera);}};
  const observer=new IntersectionObserver(entries=>{visible=entries.some(entry=>entry.isIntersecting);canvas.classList.toggle('is-visible',visible);sync();},{threshold:0});observer.observe(home);
  const resize=()=>layout(),powerControl=document.querySelector('#default-low-power');window.addEventListener('resize',resize,{passive:true});document.addEventListener('visibilitychange',sync);document.addEventListener('sela:personal',sync);document.addEventListener('sela:weather',sync);powerControl?.addEventListener('change',sync);reduced.addEventListener('change',sync);
  const stop=()=>{if(disposed)return;disposed=true;petGeneration++;observer.disconnect();renderer.setAnimationLoop(null);window.removeEventListener('resize',resize);document.removeEventListener('visibilitychange',sync);document.removeEventListener('sela:personal',sync);document.removeEventListener('sela:weather',sync);powerControl?.removeEventListener('change',sync);reduced.removeEventListener('change',sync);removePet();room.dispose();roomPlane.geometry.dispose();(roomPlane.material as THREE.Material).dispose();rainGeometry.dispose();(rain.material as THREE.Material).dispose();renderer.dispose();canvas.remove();};
  window.addEventListener('pagehide',stop,{once:true});root.dataset.homeWorld='ready';home.dataset.world='ready';layout();syncWeather();void updatePet();
  return stop;
}
