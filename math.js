/* Small expression parser. No eval, Function, or external dependency. */
(function(root){
'use strict';
const funcs={sin:Math.sin,cos:Math.cos,tan:Math.tan,asin:Math.asin,acos:Math.acos,atan:Math.atan,sinh:Math.sinh,cosh:Math.cosh,tanh:Math.tanh,sqrt:Math.sqrt,cbrt:Math.cbrt,abs:Math.abs,exp:Math.exp,log:Math.log,ln:Math.log,log10:Math.log10,floor:Math.floor,ceil:Math.ceil,sign:Math.sign};
function compile(source,variable='t'){
 if(typeof source!=='string'||source.length>300)throw Error('Biểu thức cần là văn bản, tối đa 300 ký tự.');
 let s=source.trim().replace(/\b(?:np|math)\./g,'').replace(/\*\*/g,'^').replace(/π/g,'pi').replace(/θ/g,'theta').replace(/−/g,'-');
 const tokens=s.match(/(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?|[a-zA-Z]+|[^\s]/g)||[];let i=0;
 const peek=()=>tokens[i],take=()=>tokens[i++];
 function primary(){let z=take();if(z===undefined)throw Error('Biểu thức chưa đầy đủ.');if(z==='('){let f=add();if(take()!==')')throw Error('Thiếu dấu ngoặc đóng.');return f;}if(/^(?:\d|\.)/.test(z)){let n=Number(z);if(!Number.isFinite(n))throw Error('Số không hợp lệ hoặc quá lớn.');return ()=>n;}if(z===variable||(variable==='theta'&&z==='t'))return t=>t;if(z==='pi')return ()=>Math.PI;if(z==='e')return ()=>Math.E;if(Object.hasOwn(funcs,z)){if(take()!=='(')throw Error('Hàm '+z+' cần dấu ngoặc.');let f=add();if(take()!==')')throw Error('Thiếu dấu ngoặc đóng.');return t=>funcs[z](f(t));}throw Error('Không hỗ trợ ký hiệu “'+z+'”. Biến đang dùng: '+(variable==='constant'?'không có':variable)+'.');}
 function power(){let f=primary();if(peek()==='^'){take();let g=unary(),a=f;f=t=>a(t)**g(t);}return f;}
 function unary(){if(peek()==='+'||peek()==='-'){let op=take(),f=unary();return t=>op==='-'?-f(t):f(t);}return power();}
 function mul(){let f=unary();while(peek()==='*'||peek()==='/'){let op=take(),g=unary(),a=f;f=t=>op==='*'?a(t)*g(t):a(t)/g(t);}return f;}
 function add(){let f=mul();while(peek()==='+'||peek()==='-'){let op=take(),g=mul(),a=f;f=t=>op==='+'?a(t)+g(t):a(t)-g(t);}return f;}
 let f=add();if(i!==tokens.length)throw Error('Ký hiệu không hợp lệ: '+peek()+'. Dùng * để nhân.');return f;
}
function makeCurve(config){
 const variable={param:'t',cart:'x',polar:'theta'}[config.mode];if(!variable)throw Error('Dạng phương trình không hợp lệ.');
 const a=compile(config.a,'constant')(NaN),b=compile(config.b,'constant')(NaN);if(!Number.isFinite(a)||!Number.isFinite(b)||b<=a||!Number.isFinite(b-a))throw Error('Khoảng phải hữu hạn và giá trị đầu nhỏ hơn giá trị cuối.');
 const f=compile(config.y,variable);let point;if(config.mode==='param'){const g=compile(config.x,variable);point=t=>({x:g(t),y:f(t)});}else if(config.mode==='cart')point=t=>({x:t,y:f(t)});else point=t=>{const r=f(t);return {x:r*Math.cos(t),y:r*Math.sin(t)};};
 const n=[1200,4000,12000].includes(Number(config.samples))?Number(config.samples):4000;
 const valid=p=>Number.isFinite(p.x)&&Number.isFinite(p.y)&&Math.abs(p.x)<=1e12&&Math.abs(p.y)<=1e12;
 const data=Array.from({length:n+1},(_,i)=>{const t=a+(b-a)*i/n;return {t,...point(t)};});const finite=data.filter(valid);if(finite.length<2)throw Error('Không đủ điểm thực để vẽ. Kiểm tra miền xác định; tọa độ hỗ trợ |x|, |y| ≤ 10^12.');
 const bounds=finite.reduce((v,p)=>[Math.min(v[0],p.x),Math.max(v[1],p.x),Math.min(v[2],p.y),Math.max(v[3],p.y)],[Infinity,-Infinity,Infinity,-Infinity]);
 return {a,b,point,data,valid,bounds,omitted:data.length-finite.length};
}
function derivative(curve,t){const h=Math.max(1,Math.abs(t))*1e-5;const p=curve.point(t),l=curve.point(t-h),r=curve.point(t+h);const central=curve.valid(l)&&curve.valid(r);if(central){const dx=(r.x-l.x)/(2*h),dy=(r.y-l.y)/(2*h),lx=(p.x-l.x)/h,ly=(p.y-l.y)/h,rx=(r.x-p.x)/h,ry=(r.y-p.y)/h;const smooth=Math.hypot(lx-rx,ly-ry)<=.025*Math.max(1,Math.hypot(dx,dy));return {dx,dy,ok:smooth&&Number.isFinite(dx)&&Number.isFinite(dy)&&Math.hypot(dx,dy)>1e-8};}return {dx:NaN,dy:NaN,ok:false};}
root.CurveMath={compile,makeCurve,derivative};if(typeof module!=='undefined')module.exports=root.CurveMath;
})(typeof window!=='undefined'?window:globalThis);
