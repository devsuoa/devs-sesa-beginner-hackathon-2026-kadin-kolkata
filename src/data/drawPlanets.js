//rarh
export function drawPlanetCanvas(c2d, artKey, sz) {
  const r = sz;
  c2d.clearRect(0, 0, r * 2, r * 2);
  const cx2 = r, cy2 = r;

  if (artKey === 'terrestrial_green') {
    const g = c2d.createRadialGradient(cx2-r*.3, cy2-r*.3, r*.05, cx2, cy2, r);
    g.addColorStop(0,'#6ec86e'); g.addColorStop(.5,'#2a7a3a'); g.addColorStop(1,'#1a4a28');
    c2d.fillStyle = g; c2d.beginPath(); c2d.arc(cx2, cy2, r, 0, Math.PI*2); c2d.fill();
    c2d.fillStyle = 'rgba(60,130,200,0.7)';
    c2d.beginPath(); c2d.ellipse(cx2+r*.1, cy2+r*.1, r*.35, r*.2, 0.4, 0, Math.PI*2); c2d.fill();
    c2d.beginPath(); c2d.ellipse(cx2-r*.2, cy2-r*.05, r*.22, r*.13, -.3, 0, Math.PI*2); c2d.fill();
    c2d.fillStyle = 'rgba(255,255,255,0.18)';
    c2d.beginPath(); c2d.ellipse(cx2-r*.05, cy2-r*.3, r*.3, r*.08, -.2, 0, Math.PI*2); c2d.fill();
    c2d.fillStyle = 'rgba(0,0,0,0.22)'; c2d.beginPath(); c2d.arc(cx2+r*.2, cy2+r*.2, r, 0, Math.PI*2); c2d.fill();

  } else if (artKey === 'terrestrial_desert') {
    const g = c2d.createRadialGradient(cx2-r*.3, cy2-r*.3, r*.05, cx2, cy2, r);
    g.addColorStop(0,'#e8b86a'); g.addColorStop(.5,'#c48a3a'); g.addColorStop(1,'#7a4a1a');
    c2d.fillStyle = g; c2d.beginPath(); c2d.arc(cx2, cy2, r, 0, Math.PI*2); c2d.fill();
    c2d.fillStyle = 'rgba(180,120,60,0.5)';
    for (let i = 0; i < 4; i++) { c2d.beginPath(); c2d.ellipse(cx2+(i-1.5)*r*.3, cy2+r*.1*(i%2-.5), r*.18, r*.08, i*.4, 0, Math.PI*2); c2d.fill(); }
    c2d.fillStyle = 'rgba(255,240,200,0.15)';
    c2d.beginPath(); c2d.ellipse(cx2, cy2-r*.35, r*.4, r*.1, 0, 0, Math.PI*2); c2d.fill();
    c2d.fillStyle = 'rgba(0,0,0,0.2)'; c2d.beginPath(); c2d.arc(cx2+r*.2, cy2+r*.2, r, 0, Math.PI*2); c2d.fill();

  } else if (artKey === 'terrestrial_red') {
    const g = c2d.createRadialGradient(cx2-r*.3, cy2-r*.3, r*.05, cx2, cy2, r);
    g.addColorStop(0,'#cc5533'); g.addColorStop(.5,'#992211'); g.addColorStop(1,'#551100');
    c2d.fillStyle = g; c2d.beginPath(); c2d.arc(cx2, cy2, r, 0, Math.PI*2); c2d.fill();
    c2d.fillStyle = 'rgba(220,100,30,0.5)';
    c2d.beginPath(); c2d.ellipse(cx2, cy2+r*.15, r*.5, r*.15, 0, 0, Math.PI*2); c2d.fill();
    c2d.fillStyle = 'rgba(255,180,100,0.2)';
    c2d.beginPath(); c2d.ellipse(cx2+r*.1, cy2-r*.2, r*.45, r*.12, -.2, 0, Math.PI*2); c2d.fill();
    c2d.fillStyle = 'rgba(0,0,0,0.22)'; c2d.beginPath(); c2d.arc(cx2+r*.2, cy2+r*.2, r, 0, Math.PI*2); c2d.fill();

  } else if (artKey === 'terrestrial_cold') {
    const g = c2d.createRadialGradient(cx2-r*.3, cy2-r*.3, r*.05, cx2, cy2, r);
    g.addColorStop(0,'#aaccee'); g.addColorStop(.5,'#4477aa'); g.addColorStop(1,'#223355');
    c2d.fillStyle = g; c2d.beginPath(); c2d.arc(cx2, cy2, r, 0, Math.PI*2); c2d.fill();
    c2d.fillStyle = 'rgba(220,240,255,0.7)';
    c2d.beginPath(); c2d.ellipse(cx2, cy2-r*.55, r*.5, r*.2, 0, 0, Math.PI*2); c2d.fill();
    c2d.beginPath(); c2d.ellipse(cx2, cy2+r*.55, r*.55, r*.2, 0, 0, Math.PI*2); c2d.fill();
    c2d.fillStyle = 'rgba(180,220,255,0.35)';
    c2d.beginPath(); c2d.ellipse(cx2+r*.15, cy2, r*.25, r*.4, -.1, 0, Math.PI*2); c2d.fill();
    c2d.fillStyle = 'rgba(0,0,0,0.2)'; c2d.beginPath(); c2d.arc(cx2+r*.2, cy2+r*.2, r, 0, Math.PI*2); c2d.fill();

  } else if (artKey === 'terrestrial_half') {
    const g = c2d.createRadialGradient(cx2-r*.3, cy2-r*.3, r*.05, cx2, cy2, r);
    g.addColorStop(0,'#e8a84a'); g.addColorStop(.5,'#c06820'); g.addColorStop(1,'#6a2800');
    c2d.fillStyle = g; c2d.beginPath(); c2d.arc(cx2, cy2, r, 0, Math.PI*2); c2d.fill();
    c2d.fillStyle = 'rgba(180,220,255,0.85)';
    c2d.beginPath(); c2d.arc(cx2, cy2, r, Math.PI*.5, Math.PI*1.5); c2d.closePath(); c2d.fill();
    c2d.fillStyle = 'rgba(255,255,255,0.6)';
    c2d.beginPath(); c2d.ellipse(cx2, cy2, r*.08, r, 0, 0, Math.PI*2); c2d.fill();
    c2d.fillStyle = 'rgba(0,0,0,0.22)'; c2d.beginPath(); c2d.arc(cx2+r*.2, cy2+r*.2, r, 0, Math.PI*2); c2d.fill();

  } else if (artKey === 'ice') {
    const g = c2d.createRadialGradient(cx2-r*.3, cy2-r*.3, r*.05, cx2, cy2, r);
    g.addColorStop(0,'#eef6ff'); g.addColorStop(.5,'#99ccee'); g.addColorStop(1,'#3366aa');
    c2d.fillStyle = g; c2d.beginPath(); c2d.arc(cx2, cy2, r, 0, Math.PI*2); c2d.fill();
    c2d.strokeStyle = 'rgba(255,255,255,0.4)'; c2d.lineWidth = .8;
    for (let i = 0; i < 5; i++) {
      c2d.beginPath(); c2d.moveTo(cx2-r+i*r*.4, cy2-r+i*r*.3); c2d.lineTo(cx2+r*.2, cy2+r*.6-i*r*.2); c2d.stroke();
    }
    c2d.fillStyle = 'rgba(0,0,0,0.18)'; c2d.beginPath(); c2d.arc(cx2+r*.2, cy2+r*.2, r, 0, Math.PI*2); c2d.fill();

  } else if (artKey === 'volcanic') {
    const g = c2d.createRadialGradient(cx2-r*.3, cy2-r*.3, r*.05, cx2, cy2, r);
    g.addColorStop(0,'#aa3300'); g.addColorStop(.4,'#661100'); g.addColorStop(1,'#220500');
    c2d.fillStyle = g; c2d.beginPath(); c2d.arc(cx2, cy2, r, 0, Math.PI*2); c2d.fill();
    c2d.fillStyle = 'rgba(255,100,0,0.8)';
    c2d.beginPath(); c2d.ellipse(cx2+r*.1, cy2+r*.2, r*.35, r*.1, -.2, 0, Math.PI*2); c2d.fill();
    c2d.beginPath(); c2d.ellipse(cx2-r*.2, cy2-r*.05, r*.2, r*.06, .3, 0, Math.PI*2); c2d.fill();
    c2d.fillStyle = 'rgba(255,200,0,0.6)';
    c2d.beginPath(); c2d.ellipse(cx2+r*.15, cy2+r*.15, r*.15, r*.04, -.1, 0, Math.PI*2); c2d.fill();
    c2d.fillStyle = 'rgba(80,20,0,0.6)';
    c2d.beginPath(); c2d.ellipse(cx2-r*.1, cy2-r*.25, r*.25, r*.12, .2, 0, Math.PI*2); c2d.fill();
    c2d.fillStyle = 'rgba(0,0,0,0.25)'; c2d.beginPath(); c2d.arc(cx2+r*.2, cy2+r*.2, r, 0, Math.PI*2); c2d.fill();

  } else if (artKey === 'gas_giant') {
    const g = c2d.createRadialGradient(cx2-r*.3, cy2-r*.3, r*.05, cx2, cy2, r);
    g.addColorStop(0,'#ddaa88'); g.addColorStop(.5,'#aa6644'); g.addColorStop(1,'#552211');
    c2d.fillStyle = g; c2d.beginPath(); c2d.arc(cx2, cy2, r, 0, Math.PI*2); c2d.fill();
    const bands = [['rgba(180,120,80,0.5)',-.35],['rgba(220,170,120,0.4)',-.15],['rgba(160,90,50,0.5)',.1],['rgba(210,160,100,0.4)',.3]];
    bands.forEach(([col,off]) => {
      c2d.fillStyle = col; c2d.beginPath(); c2d.ellipse(cx2, cy2+r*off, r, r*.08, 0, 0, Math.PI*2); c2d.fill();
    });
    c2d.strokeStyle = 'rgba(200,150,100,0.6)'; c2d.lineWidth = r*.3; c2d.beginPath();
    c2d.ellipse(cx2, cy2, r*1.55, r*.2, 0, 0, Math.PI*2); c2d.stroke();
    c2d.fillStyle = 'rgba(0,0,0,0.2)'; c2d.beginPath(); c2d.arc(cx2+r*.2, cy2+r*.2, r, 0, Math.PI*2); c2d.fill();

  } else if (artKey === 'gas_yellow') {
    const g = c2d.createRadialGradient(cx2-r*.3, cy2-r*.3, r*.05, cx2, cy2, r);
    g.addColorStop(0,'#eecc44'); g.addColorStop(.5,'#aaaa00'); g.addColorStop(1,'#445500');
    c2d.fillStyle = g; c2d.beginPath(); c2d.arc(cx2, cy2, r, 0, Math.PI*2); c2d.fill();
    c2d.fillStyle = 'rgba(180,180,0,0.4)';
    c2d.beginPath(); c2d.ellipse(cx2, cy2+r*.2, r, r*.07, 0, 0, Math.PI*2); c2d.fill();
    c2d.beginPath(); c2d.ellipse(cx2, cy2-r*.15, r, r*.06, 0, 0, Math.PI*2); c2d.fill();
    c2d.fillStyle = 'rgba(0,0,0,0.2)'; c2d.beginPath(); c2d.arc(cx2+r*.2, cy2+r*.2, r, 0, Math.PI*2); c2d.fill();

  } else if (artKey === 'meteor') {
    const g = c2d.createRadialGradient(cx2-r*.2, cy2-r*.2, r*.05, cx2, cy2, r);
    g.addColorStop(0,'#888880'); g.addColorStop(.6,'#555550'); g.addColorStop(1,'#222220');
    c2d.fillStyle = g; c2d.beginPath(); c2d.arc(cx2, cy2, r*.8, 0, Math.PI*2); c2d.fill();
    c2d.fillStyle = 'rgba(30,30,28,0.7)';
    [[-.25,-.2,.18],[.2,.15,.12],[-.1,.25,.1],[.3,-.25,.08]].forEach(([ox,oy,cr]) => {
      c2d.beginPath(); c2d.arc(cx2+r*ox, cy2+r*oy, r*cr, 0, Math.PI*2); c2d.fill();
    });
    c2d.fillStyle = 'rgba(0,0,0,0.25)'; c2d.beginPath(); c2d.arc(cx2+r*.15, cy2+r*.15, r*.8, 0, Math.PI*2); c2d.fill();

  } else {
    // meteor2 + any unknown art key falls here
    const g = c2d.createRadialGradient(cx2-r*.2, cy2-r*.2, r*.05, cx2, cy2, r);
    g.addColorStop(0,'#998877'); g.addColorStop(.6,'#665544'); g.addColorStop(1,'#332211');
    c2d.fillStyle = g; c2d.beginPath(); c2d.arc(cx2, cy2, r*.75, 0, Math.PI*2); c2d.fill();
    c2d.fillStyle = 'rgba(20,18,15,0.6)';
    [[-.2,-.1,.14],[.15,.2,.1]].forEach(([ox,oy,cr]) => {
      c2d.beginPath(); c2d.arc(cx2+r*ox, cy2+r*oy, r*cr, 0, Math.PI*2); c2d.fill();
    });
    c2d.fillStyle = 'rgba(0,0,0,0.22)'; c2d.beginPath(); c2d.arc(cx2+r*.15, cy2+r*.15, r*.75, 0, Math.PI*2); c2d.fill();
  }
}