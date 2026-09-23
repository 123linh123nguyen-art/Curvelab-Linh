/* MathJax SVG is bundled locally; no formula is sent to a server. */
window.MathJax={startup:{typeset:false},svg:{fontCache:'local'},options:{enableMenu:false}};
window.CurveLatex={
  node(tex,display=false){return MathJax.tex2svg('\\displaystyle '+tex,{display});},
  ast(n){
    const tex=a=>this.ast(a),group=a=>'\\left('+tex(a)+'\\right)',sum=a=>a.type==='binary'&&['+','-'].includes(a.op),wrap=a=>sum(a)?group(a):tex(a);
    if(n.type==='number')return Number.isFinite(n.value)?String(n.value):'\\text{không xác định}';
    if(n.type==='constant'||n.type==='variable')return n.name==='pi'?'\\pi':n.name==='theta'?'\\theta':n.name.length>1?'\\mathrm{'+n.name+'}':n.name;
    if(n.type==='neg')return '-'+wrap(n.a);
    if(n.type==='function'){
      if(n.name==='sqrt'||n.name==='cbrt')return '\\sqrt'+(n.name==='cbrt'?'[3]':'')+'{'+tex(n.a)+'}';
      if(n.name==='abs')return '\\left|'+tex(n.a)+'\\right|';
      if(n.name==='floor'||n.name==='ceil')return '\\left\\l'+n.name+' '+tex(n.a)+'\\right\\r'+n.name;
      const names={asin:'arcsin',acos:'arccos',atan:'arctan',log:'ln',log10:'log_{10}'};
      const name=names[n.name]||n.name;
      return (name==='sign'?'\\operatorname{sgn}':'\\'+name)+'\\left('+tex(n.a)+'\\right)';
    }
    if(n.op==='/')return '\\frac{'+tex(n.a)+'}{'+tex(n.b)+'}';
    if(n.op==='^'){
      if(n.a.type==='function'&&['sin','cos','tan','sinh','cosh','tanh'].includes(n.a.name))return '\\'+n.a.name+'^{'+tex(n.b)+'}\\left('+tex(n.a.a)+'\\right)';
      return (n.a.type==='binary'||n.a.type==='neg'||n.a.type==='function'||n.a.type==='number'&&n.a.value<0?group(n.a):'{'+tex(n.a)+'}')+'^{'+tex(n.b)+'}';
    }
    if(n.op==='*'){
      // Only presentation normalization: no cancelling factors or changing domains.
      const factors=[];const flatten=a=>{if(a.type==='binary'&&a.op==='*'){flatten(a.a);flatten(a.b);}else factors.push(a);};flatten(n);
      let sign=1,coefficient=1;const rest=[];
      for(let f of factors){if(f.type==='neg'){sign*=-1;f=f.a;}if(f.type==='number'&&Number.isInteger(f.value)){coefficient*=f.value;}else rest.push(f);}
      if(coefficient<0){sign*=-1;coefficient=-coefficient;}
      const parts=rest.map(wrap);if(coefficient!==1||!parts.length)parts.unshift(String(coefficient));
      // Move a single denominator to a fraction for readable chain-rule derivatives.
      const frac=rest.findIndex(f=>f.type==='binary'&&f.op==='/');
      if(frac>=0&&rest.filter(f=>f.type==='binary'&&f.op==='/').length===1){const f=rest[frac],others=rest.filter((_,i)=>i!==frac);if(!(f.a.type==='number'&&f.a.value===1))others.unshift(f.a);let top=others.map(wrap);if(coefficient!==1||!top.length)top.unshift(String(coefficient));return (sign<0?'-':'')+'\\frac{'+top.join('\\,')+'}{'+tex(f.b)+'}';}
      return (sign<0?'-':'')+parts.join('\\,');
    }
    const a=tex(n.a),b=n.op==='-'?wrap(n.b):tex(n.b);
    return a+(n.op==='+'&&b.startsWith('-')?'':n.op)+b;
  },
  rich(el,text){el.replaceChildren();const re=/\$([^$]+)\$/g;let last=0;for(const m of text.matchAll(re)){el.append(document.createTextNode(text.slice(last,m.index)),this.node(m[1]));last=m.index+m[0].length;}el.append(document.createTextNode(text.slice(last)));}
};
