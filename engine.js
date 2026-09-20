(function(root){
  'use strict';
  const intervals=[60000,600000,86400000,259200000,604800000,1209600000,2592000000];
  const empty=()=>({right:0,wrong:0,stage:0,due:0,last:0,streak:0,mastered:false,star:false,note:'',lastResult:null});
  function grade(q,selected){return [...selected].sort().join('')===q.answer.slice().sort().join('');}
  function record(previous,ok,now=Date.now(),self=false){
    const p={...empty(),...previous};
    p[ok?'right':'wrong']++;p.last=now;p.lastResult=ok;p.streak=ok?p.streak+1:0;
    if(!ok){p.stage=0;p.mastered=false;p.due=now+intervals[0];}
    else if(!p.due || now>=p.due){p.stage=Math.min(7,p.stage+1);p.mastered=p.stage===7;p.due=p.mastered?0:now+intervals[p.stage];}
    p.selfAssessed=!!self;return p;
  }
  function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
  function filter(qs,c,stats={}){return qs.filter(q=>(!c.dept||c.dept==='全部'||q.dept===c.dept)&&(!c.type||c.type==='全部'||q.type===c.type)&&q.no>=Number(c.from||1)&&q.no<=Number(c.to||999999)&&(!c.search||(q.text+q.dept+q.no+q.options.map(o=>o.text).join('')).toLowerCase().includes(c.search.toLowerCase()))&&(!c.status||c.status==='全部'||(c.status==='错题'&&(stats[q.id]?.wrong||0)>0)||(c.status==='收藏'&&stats[q.id]?.star)||(c.status==='未学'&&!stats[q.id]?.last)||(c.status==='已掌握'&&stats[q.id]?.mastered)));}
  function loopNext(ids,stats,now=Date.now(),lastId){
    const active=ids.filter(id=>!stats[id]?.mastered);
    const ready=active.filter(id=>!stats[id]?.due||stats[id].due<=now).sort((a,b)=>(stats[a]?.due||0)-(stats[b]?.due||0));
    return {id:ready.find(id=>id!==lastId)||ready[0]||null,remaining:active.length,nextDue:active.length?Math.min(...active.map(id=>stats[id]?.due||now)):0};
  }
  const api={intervals,empty,grade,record,shuffle,filter,loopNext};
  if(typeof module!=='undefined')module.exports=api;else root.ShizhiEngine=api;
})(typeof window!=='undefined'?window:globalThis);
