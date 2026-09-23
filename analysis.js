/* Numerical analysis on the displayed finite parameter interval. */
(function(root){
'use strict';
const M=root.CurveMath||(typeof require==='function'?require('./math.js'):null);
function analyze(curve,mode){
 const {a,b,point,valid}=curve,span=b-a,n=Math.min(4000,curve.data.length-1),dt=span/n,tol=Math.max(span*1e-8,1e-10);
 const ts=Array.from({length:n+1},(_,i)=>a+span*i/n);
 const derivative=(t,key)=>{const h=Math.min(span*1e-5,Math.max(1,Math.abs(t))*2e-6),p=point(t),l=point(t-h),r=point(t+h);if(!valid(p)||!valid(l)||!valid(r))return NaN;return (r[key]-l[key])/(2*h);};
 const functions={x:t=>valid(point(t))?point(t).x:NaN,y:t=>valid(point(t))?point(t).y:NaN,dx:t=>derivative(t,'x'),dy:t=>derivative(t,'y'),dz:t=>derivative(t,'z')};
 function roots(f){const values=ts.map(f),finite=values.filter(Number.isFinite),scale=finite.length?Math.max(...finite.map(Math.abs)):0;if(!scale||finite.every(v=>Math.abs(v)<1e-12))return [];
 const out=[],add=t=>{if(t<a-tol||t>b+tol)return;if(!out.some(v=>Math.abs(v-t)<tol*20))out.push(Math.max(a,Math.min(b,t)));};
 for(let i=0;i<=n;i++){let v=values[i];if(!Number.isFinite(v))continue;if(v===0&&(i===0||i===n||values[i-1]!==0||values[i+1]!==0))add(ts[i]);if(i&&Number.isFinite(values[i-1])&&v*values[i-1]<0){let l=ts[i-1],r=ts[i],fl=values[i-1];for(let j=0;j<48;j++){let m=(l+r)/2,fm=f(m);if(!Number.isFinite(fm))break;if(fm===0){l=r=m;break;}if(fl*fm<=0)r=m;else{l=m;fl=fm;}}let t=(l+r)/2,res=f(t),local=Math.max(1,Math.min(Math.abs(v),Math.abs(values[i-1])));if(Number.isFinite(res)&&Math.abs(res)<local*1e-6)add(t);}
 // Even-multiplicity zeros do not change sign. Refine local |f| minima.
 if(i>0&&i<n&&Math.abs(v)<Math.abs(values[i-1])&&Math.abs(v)<Math.abs(values[i+1])){let l=ts[i-1],r=ts[i+1];for(let j=0;j<42;j++){let u=l+(r-l)/3,w=r-(r-l)/3;if(Math.abs(f(u))<Math.abs(f(w)))r=w;else l=u;}const t=(l+r)/2,res=f(t),neighbor=Math.min(Math.abs(values[i-1]),Math.abs(values[i+1]));if(Number.isFinite(res)&&Math.abs(res)<Math.max(1e-11,neighbor*1e-5))add(t);}}
 return out.sort((x,y)=>x-y);
 }
 const marks=[],breaks=[a,b];function addMark(t,kind){if(!valid(point(t)))return;let m=marks.find(p=>Math.abs(p.t-t)<tol*20);if(!m){m={t,...point(t),kinds:[]};marks.push(m);}if(!m.kinds.includes(kind))m.kinds.push(kind);}
 addMark(a,'Đầu khoảng');addMark(b,'Cuối khoảng');
 const critical={dx:mode==='cart'?[]:roots(functions.dx),dy:roots(functions.dy),dz:mode==='space'?roots(functions.dz):[]};
 for(const key of (mode==='space'?['dx','dy','dz']:['dx','dy']))for(const t of critical[key]){breaks.push(t);let h=Math.min(dt/3,(t-a)/2,(b-t)/2);if(h<=0)h=dt/4;const f=functions[key],left=f(t-h),right=f(t+h),axis=key==='dx'?'x':key==='dy'?'y':'z',d=M.derivative(curve,t);let kind=left*right<0?(left>0?`Cực đại ${axis}`:`Cực tiểu ${axis}`):`${axis}′ ≈ 0`;if(!d.ok&&Math.hypot(d.dx,d.dy)>1e-7)kind+=' / góc nhọn';addMark(t,kind);}
 for(const t of roots(functions.x))addMark(t,mode==='space'?'x = 0':'Giao Oy');for(const t of roots(functions.y))addMark(t,mode==='space'?'y = 0':'Giao Ox');
 if(mode==='space')for(const t of roots(functions.z||((t)=>point(t).z)))addMark(t,'z = 0');
 // Locate boundaries between valid and invalid sampled regions.
 for(let i=1;i<=n;i++){const vl=valid(point(ts[i-1])),vr=valid(point(ts[i]));if(vl!==vr){let l=ts[i-1],r=ts[i];for(let j=0;j<36;j++){const m=(l+r)/2;if(valid(point(m))===vl)l=m;else r=m;}breaks.push((l+r)/2);}}
 // Detect sampled jumps/poles; never claim monotonicity across such a split.
 const xr=curve.bounds[1]-curve.bounds[0],yr=curve.bounds[3]-curve.bounds[2];
 for(let i=1;i<=n;i++){const l=point(ts[i-1]),r=point(ts[i]),m=point((ts[i-1]+ts[i])/2);if(valid(l)&&valid(r)&&(!valid(m)||Math.abs(m.x-(l.x+r.x)/2)>Math.max(1e-7,xr*.08)||Math.abs(m.y-(l.y+r.y)/2)>Math.max(1e-7,yr*.08))){breaks.push((ts[i-1]+ts[i])/2);}}
 const sorted=breaks.sort((x,y)=>x-y).filter((t,i,list)=>i===0||t-list[i-1]>tol*20),limited=sorted.length>42;
 const knots=limited?sorted.slice(0,41).concat(b):sorted;
 function sign(l,r,key){const vals=Array.from({length:9},(_,i)=>{const t=l+(r-l)*(i+1)/10;return valid(point(t))?functions[key](t):NaN;});if(vals.some(v=>!Number.isFinite(v)))return '?';const max=Math.max(...vals.map(Math.abs)),eps=Math.max(1e-9,max*1e-6);let plus=vals.some(v=>v>eps),minus=vals.some(v=>v< -eps);return plus&&minus?'?':plus?'+':minus?'−':'0';}
 const intervals=knots.slice(1).map((r,i)=>({a:knots[i],b:r,dx:sign(knots[i],r,'dx'),dy:sign(knots[i],r,'dy'),dz:mode==='space'?sign(knots[i],r,'dz'):'0'}));
 marks.sort((x,y)=>x.t-y.t);
 const groups=[];const spatial=Math.max(1,xr,yr)*1e-7;
 for(const mark of marks){let g=groups.find(p=>Math.hypot(p.x-mark.x,p.y-mark.y,(p.z||0)-(mark.z||0))<spatial);if(!g){g={x:mark.x,y:mark.y,z:mark.z,branches:[]};groups.push(g);}g.branches.push(mark);}
 groups.forEach((g,i)=>g.label=`P${i+1}`);
 return {knots,intervals,groups,limited,critical,derivative,approximate:true};
}
root.CurveAnalysis={analyze};if(typeof module!=='undefined')module.exports=root.CurveAnalysis;
})(typeof window!=='undefined'?window:globalThis);
