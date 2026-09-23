function formulaTex(c){
  const cs=CurveMath.constants(c.constants),v=c.mode==='cart'?'x':c.mode==='polar'?'theta':'t';
  const expr=(s,vars=v)=>CurveLatex.ast(CurveMath.compile(s,vars,cs).ast);
  let rows=[];
  if(c.mode==='implicit'){const parts=c.y.split('=');rows=[expr(parts[0],['x','y'])+'='+expr(parts[1]||'0',['x','y'])];}
  else if(c.mode==='cart')rows=['y='+expr(c.y)];
  else if(c.mode==='polar')rows=['r(\\theta)='+expr(c.y)];
  else rows=['x(t)='+expr(c.x),'y(t)='+expr(c.y),...(c.mode==='space'?['z(t)='+expr(c.z)]:[])];
  const variable=c.mode==='cart'||c.mode==='implicit'?'x':c.mode==='polar'?'\\theta':'t';
  rows.push(expr(c.a,'constant')+'\\le '+variable+'\\le '+expr(c.b,'constant'));
  if(c.mode==='implicit')rows.push(expr(c.ymin,'constant')+'\\le y\\le '+expr(c.ymax,'constant'));
  const source=[c.x,c.y,c.z].join(' '),used=Object.keys(cs).filter(k=>new RegExp('\\b'+k+'\\b').test(source));
  if(used.length)rows.push(used.map(k=>CurveLatex.ast({type:'constant',name:k})+'='+cs[k]).join(',\\quad '));
  return '\\begin{gathered}'+rows.join('\\\\[3pt]')+'\\end{gathered}';
}
function renderPlotFormula(){const box=$('plot-formula');box.replaceChildren();box.classList.toggle('left',$('formula-corner').value==='left');box.hidden=$('formula-corner').value==='hidden'||!curve;if(!box.hidden)box.append(CurveLatex.node(formulaTex(plotted),true));}
$('formula-corner').onchange=()=>{renderPlotFormula();store();};

const originalGuide=renderGuide;
renderGuide=function(){
 originalGuide();
 const replacements=[
 ['Đặt x =',String.raw`Đặt $x=\cos t$, $y=\sin t+\sqrt[3]{\cos^2 t}$, $0\le t\le2\pi$. Khi đó $x^2+(y-\sqrt[3]{x^2})^2=\cos^2t+\sin^2t=1$.`],
 ['Có thể tách',String.raw`Có thể tách hai nhánh $y=\sqrt[3]{x^2}\pm\sqrt{1-x^2}$, $-1\le x\le1$. Vết đối xứng qua $Oy$; không coi hai nhánh là một hàm $y(x)$.`],
 ['Đạo hàm của tham số hóa',String.raw`Đạo hàm của tham số hóa này không hữu hạn tại $\cos t=0$; đồ thị vẫn có thể vẽ, nhưng không dùng Frenet tại đó.`],
 ['x′ =',String.raw`$x'=-\sin t(1+\sqrt2\cos t)$, $y'=\cos(2t)$. Tốc độ $v=|1+\sqrt2\cos t|(\sqrt2-\cos t)$.`],
 ['Tách tích phân tại t',String.raw`Tách tích phân tại $t=-\frac{3\pi}{4}$ và $t=\frac{3\pi}{4}$ để bỏ dấu giá trị tuyệt đối. Độ dài trên $[-\pi,\pi]$ là $\sqrt2\left(\frac\pi2+3\right)$.`],
 ['Tại ±',String.raw`Tại $t=\pm\frac{3\pi}{4}$, cả hai đạo hàm đều bằng $0$: không dùng công thức Frenet có mẫu $\|\gamma'\|$ tại đó.`],
 ['Bài 1.1.10',String.raw`Bài 1.1.10 — với $a>0$.`],
 ['Chọn x =',String.raw`Chọn $x=at\Rightarrow y=\frac{at^3}{3},\ z=\frac{a}{2t}$. Hai mặt phẳng $y=\frac a3$ và $y=9a$ cho $t=1$ và $t=3$.`],
 ['γ′(t) = a',String.raw`$\gamma'(t)=a\left(1,t^2,-\frac{1}{2t^2}\right)$; $\|\gamma'(t)\|=a\sqrt{1+t^4+\frac{1}{4t^4}}=a\left(t^2+\frac{1}{2t^2}\right)$.`],
 ['L = a[',String.raw`$L=a\left[\frac{t^3}{3}-\frac{1}{2t}\right]_1^3=9a$. Thế tham số hóa vào cả hai phương trình để kiểm tra.`],
 ['Bài 1.1.11',String.raw`Bài 1.1.11 — theo đúng dấu $\sin(-t)$ trong đề, với $r>0$.`],
 ['γ(t) = r',String.raw`$\gamma(t)=r(t+\sin t,1-\cos t)$, $\gamma'(t)=r(1+\cos t,\sin t)$.`],
 ['‖γ′(t)‖ =',String.raw`$\|\gamma'(t)\|=2r\left|\cos\frac t2\right|$. Tách tích phân tại $\pi$: độ dài trên $[0,2\pi]$ là $L=8r$.`],
 ['γ′(t)=0',String.raw`$\gamma'(t)=0$ khi $t=(2k+1)\pi$, $k\in\mathbb Z$, nên tham số hóa không chính quy tại các mốc đó. Với cycloid $t-\sin t$, các mốc kỳ dị là $2k\pi$: hai quy ước khác nhau.`],
 ['1. Xác định miền',String.raw`1. Xác định miền thực và các đối xứng của $F(x,y)=0$.`],
 ['2. Thử tách',String.raw`2. Thử tách nhánh $y=f(x)$, hoặc tìm tham số hóa $x(t),y(t)$. Bảng biến thiên chỉ áp dụng sau khi chọn được nhánh/tham số.`],
 ['2. Tính γ',String.raw`2. Tính $\gamma'$ và giải đồng thời các thành phần $\gamma'=0$ để xét chính quy. Điểm dừng của riêng $x$ hoặc $y$ không đủ kết luận kỳ dị.`],
 ['4. Độ dài:',String.raw`4. Độ dài: tích phân $\|\gamma'\|$. Chỉ dùng $\kappa$, $\tau$ và khung Frenet tại nơi các mẫu số khác $0$.`]
 ];
 for(const p of $('solution-guide').querySelectorAll('p')){const item=replacements.find(([prefix])=>p.textContent.startsWith(prefix));if(item)CurveLatex.rich(p,item[1]);}
 const c=plotted,compact=s=>s.replace(/\s/g,'');
 if(c.mode==='space'&&compact(c.x)==='t'&&compact(c.y)==='t^2'&&compact(c.z)==='t^2'&&compact(c.a)==='0'&&compact(c.b)==='20'){
   const p=cell('p','');CurveLatex.rich(p,String.raw`Ví dụ tính độ dài (trang 24–25): $\gamma(t)=(t,t^2,t^2)$, $\|\gamma'\|=\sqrt{1+8t^2}$. Do đó $L=\int_0^{20}\sqrt{1+8t^2}\,dt=10\sqrt{3201}+\frac{\sqrt2}{8}\ln(40\sqrt2+\sqrt{3201})$.`);$('solution-guide').prepend(p);
 }
};

presets.space.push(['Knot trong giáo trình · ví dụ 1.1.10','-10*cos(t)-2*cos(5t)+15*sin(2t)','-15*cos(2t)+10*sin(t)-2*sin(5t)','0','2*pi','10*cos(3t)'],['Tích phân độ dài · ví dụ Maple','t','t^2','0','20','t^2']);
presets.param.push(['Độ cong có dấu · ví dụ 2.2.1','t^2','sin(t)','-3','3']);
const basePointGeometry=pointGeometry;
pointGeometry=function(){basePointGeometry();if(curve.mode==='space')return;const t=selectedT??curve.a+(curve.b-curve.a)*Number($('position').value)/10000,g=CurveGeometry.at(curve,t),k=g.regular?(g.d1[0]*g.d2[1]-g.d1[1]*g.d2[0])/g.speed**3:NaN;$('geometry-point').append(document.createTextNode(' Độ cong có dấu trong Oxy ≈ '+(Number.isFinite(k)?Number(k.toPrecision(7)):'không xác định')+'.'));};

$('png').onclick=async()=>{
 if(!curve)return;stop();$('status').textContent='Đang xuất ảnh…';
 try{
  const out=document.createElement('canvas'),scale=2;out.width=Math.round(W*scale);out.height=Math.round((H+42)*scale);const c=out.getContext('2d');c.scale(scale,scale);c.fillStyle='white';c.fillRect(0,0,W,H+42);c.fillStyle='#111';c.font='600 16px system-ui';c.fillText('CurveLab · '+$('charttitle').textContent,20,27);c.drawImage(canvas,0,42,W,H);
  const svg=$('plot-formula').querySelector('svg');
  if(svg&&!$('plot-formula').hidden){const rect=svg.getBoundingClientRect(),cr=canvas.getBoundingClientRect(),copy=svg.cloneNode(true);copy.setAttribute('xmlns','http://www.w3.org/2000/svg');copy.setAttribute('width',rect.width);copy.setAttribute('height',rect.height);copy.style.color='#111';const image=new Image(),url=URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(copy)],{type:'image/svg+xml'}));try{image.src=url;await image.decode();c.fillStyle='white';c.fillRect(rect.left-cr.left-5,rect.top-cr.top+37,rect.width+10,rect.height+10);c.drawImage(image,rect.left-cr.left,rect.top-cr.top+42,rect.width,rect.height);}finally{URL.revokeObjectURL(url);}}
  out.toBlob(blob=>{if(blob){download(blob,'curvelab.png');$('status').textContent='Đã tạo ảnh PNG, gồm công thức nếu đang bật.';}else $('status').textContent='Không tạo được ảnh.';});
 }catch(e){$('status').textContent='Không xuất được ảnh: '+e.message;}
};

MathJax.startup.promise.then(()=>{
 const formulas=[String.raw`v=\|\gamma'\|,\qquad L=\int_a^b\|\gamma'(t)\|\,dt`,String.raw`\kappa=\frac{\|\gamma'\times\gamma''\|}{\|\gamma'\|^3},\qquad \tau=\frac{\det(\gamma',\gamma'',\gamma''')}{\|\gamma'\times\gamma''\|^2}`,String.raw`\kappa_{\mathrm{có\ dấu}}=\frac{x'y''-y'x''}{(x'^2+y'^2)^{3/2}}`];
 for(const tex of formulas){const row=cell('div','');row.className='formula-row';row.append(CurveLatex.node(tex));$('geometry-equations').append(row);}
 startCurveLab();
}).catch(e=>{$('error').textContent='Không tải được bộ hiển thị công thức. Hãy tải lại trang. '+e.message;});
