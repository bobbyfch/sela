/* Release notifications only. Never downloads or executes replacement code. */
(function(root){
 'use strict';
 const endpoint='https://api.github.com/repos/bobbyfch/sela/releases/latest';
 function version(value){const match=/^v?(\d+)\.(\d+)\.(\d+)$/.exec(value||'');return match?match.slice(1).map(Number):null;}
 function newer(remote,current){const a=version(remote),b=version(current);if(!a||!b)return false;for(let i=0;i<3;i++){if(a[i]!==b[i])return a[i]>b[i];}return false;}
 async function check(current,request=root.fetch.bind(root)){
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),8000);
  try{const response=await request(endpoint,{signal:controller.signal,credentials:'omit',referrerPolicy:'no-referrer',headers:{Accept:'application/vnd.github+json'}});
   if(!response.ok)throw new Error('Update service unavailable ('+response.status+')');
   const release=await response.json();if(release.draft||release.prerelease||!version(release.tag_name))throw new Error('Invalid release information');
   const tag=release.tag_name;return {checked:Date.now(),version:tag.replace(/^v/,''),available:newer(tag,current),url:'https://github.com/bobbyfch/sela/releases/tag/'+tag};
  }finally{clearTimeout(timer);}
 }
 root.SelaUpdates={check,newer};
})(globalThis);
