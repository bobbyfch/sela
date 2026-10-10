const params=new URLSearchParams(location.search);
const result={type:'sela:cloud-auth',state:params.get('state'),code:params.get('code'),error:params.get('error')};
history.replaceState(null,'',location.pathname);
if(/^[A-Za-z0-9_-]{43}$/.test(result.state||'')){
 if(window.opener)window.opener.postMessage(result,location.origin);
 if(typeof BroadcastChannel==='function'){const channel=new BroadcastChannel('sela-cloud-'+result.state);channel.postMessage(result);setTimeout(()=>channel.close(),1000);}
 document.getElementById('status').textContent='Return to Sela to finish importing your books.';
}else document.getElementById('status').textContent='Open cloud connection from Sela settings.';
