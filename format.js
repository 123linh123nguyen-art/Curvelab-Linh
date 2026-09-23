/* Recognizes simple numeric forms; this is not symbolic proof. */
(function(root){
'use strict';
const cache=new Map();
function rational(n,maxDen,tolerance){for(let q=1;q<=maxDen;q++){const p=Math.round(n*q);if(Number.isSafeInteger(p)&&Math.abs(n-p/q)<=tolerance)return {p,q};}return null;}
function fraction(p,q){return q===1?String(p):`${p}/${q}`;}
function format(n,prefer=true){
 if(!Number.isFinite(n))return 'KXĐ';
 if(!prefer)return Math.abs(n)<1e-10?'0':Number(n.toPrecision(6)).toString();
 if(cache.has(n))return cache.get(n);
 const eps=2e-9*Math.max(1,Math.min(10,Math.abs(n)));let text;
 if(Math.abs(n)<eps)text='0';
 else {const r=rational(n,1000,eps);if(r)text=fraction(r.p,r.q);}
 if(!text){const candidates=[];
 for(const d of [2,3,5,6,7,10,11,13,14,15,17,19,21,22,23,26,29,30]){const r=rational(n/Math.sqrt(d),100,eps/Math.sqrt(d));if(!r||!r.p||Math.abs(r.p)>100)continue;const sign=r.p<0?'-':'',p=Math.abs(r.p);const value=`${sign}${p===1?'':p}√${d}${r.q===1?'':'/'+r.q}`;candidates.push({value,score:value.length+d*.05});}
 const pi=rational(n/Math.PI,100,eps/Math.PI);if(pi&&pi.p&&Math.abs(pi.p)<=100)candidates.push({value:`${pi.p<0?'-':''}${Math.abs(pi.p)===1?'':Math.abs(pi.p)}π${pi.q===1?'':'/'+pi.q}`,score:3+String(pi.p).length+String(pi.q).length});
 candidates.sort((a,b)=>a.score-b.score);text=candidates[0]?.value;
 }
 if(!text)text=Number(n.toPrecision(6)).toString();
 if(cache.size>2000)cache.clear();cache.set(n,text);return text;
}
root.CurveFormat={format};if(typeof module!=='undefined')module.exports=root.CurveFormat;
})(typeof window!=='undefined'?window:globalThis);
