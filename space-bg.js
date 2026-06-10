// BunzyBets Space Background Engine — shared across all pages
(function() {
  // Create and inject canvas
  const canvas = document.createElement('canvas');
  canvas.id = 'space-canvas';
  canvas.style.cssText = 'position:fixed;inset:0;z-index:0;pointer-events:none;';
  document.body.insertBefore(canvas, document.body.firstChild);

  // Hide old starfield div if present
  const oldSf = document.getElementById('starfield');
  if (oldSf) oldSf.style.display = 'none';

  const ctx = canvas.getContext('2d');
  let W, H;

  function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize);

  // Stars — 3 depth layers
  const stars = [];
  const LAYERS = [
    { count:120, minS:0.3, maxS:0.8, baseOp:0.4 },
    { count:80,  minS:0.8, maxS:1.6, baseOp:0.7 },
    { count:40,  minS:1.6, maxS:2.8, baseOp:1.0 },
  ];
  LAYERS.forEach(l => {
    for (let i=0; i<l.count; i++) {
      stars.push({
        x: Math.random(), y: Math.random(),
        size: l.minS + Math.random()*(l.maxS-l.minS),
        baseOp: l.baseOp*(0.5+Math.random()*0.5),
        tOff: Math.random()*Math.PI*2,
        tSpd: 0.5+Math.random()*1.5,
      });
    }
  });

  // Nebula clouds
  const nebulas = [
    { x:0.15, y:0.25, rx:0.28, ry:0.20, color:[80,0,180],  op:0.18, phase:Math.random()*Math.PI*2, spd:0.00003  },
    { x:0.75, y:0.15, rx:0.22, ry:0.16, color:[0,40,180],  op:0.14, phase:Math.random()*Math.PI*2, spd:0.00004  },
    { x:0.55, y:0.70, rx:0.30, ry:0.18, color:[160,0,80],  op:0.12, phase:Math.random()*Math.PI*2, spd:0.000025 },
    { x:0.85, y:0.60, rx:0.18, ry:0.14, color:[0,80,160],  op:0.10, phase:Math.random()*Math.PI*2, spd:0.000035 },
    { x:0.30, y:0.80, rx:0.20, ry:0.12, color:[120,0,200], op:0.09, phase:Math.random()*Math.PI*2, spd:0.00002  },
  ];

  // Shooting stars
  const shooters = [];
  let lastShot = 0;
  function spawnShooter() {
    const angle = (15+Math.random()*20)*Math.PI/180;
    shooters.push({
      x: Math.random()*1.2-0.1, y: -0.05,
      len: 0.08+Math.random()*0.12,
      spd: 0.003+Math.random()*0.004,
      op: 0, angle,
      life: 0, maxLife: 80+Math.random()*60,
      size: 1+Math.random()*1.5,
    });
  }

  function drawBg() {
    const g = ctx.createRadialGradient(W*.5,H*.5,0,W*.5,H*.5,Math.max(W,H)*.8);
    g.addColorStop(0,'#04020f'); g.addColorStop(0.5,'#020108'); g.addColorStop(1,'#010006');
    ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
  }

  function drawNebulas(t) {
    nebulas.forEach(n => {
      const dx = Math.sin(t*n.spd+n.phase)*0.03;
      const dy = Math.cos(t*n.spd*0.7+n.phase)*0.02;
      const cx=(n.x+dx)*W, cy=(n.y+dy)*H;
      const rx=n.rx*W, ry=n.ry*H;
      const [r,g,b]=n.color;
      const grad=ctx.createRadialGradient(cx,cy,0,cx,cy,Math.max(rx,ry));
      grad.addColorStop(0,`rgba(${r},${g},${b},${n.op})`);
      grad.addColorStop(0.4,`rgba(${r},${g},${b},${n.op*0.5})`);
      grad.addColorStop(1,`rgba(${r},${g},${b},0)`);
      ctx.save(); ctx.scale(1,ry/rx);
      ctx.beginPath(); ctx.arc(cx,cy*(rx/ry),rx,0,Math.PI*2);
      ctx.fillStyle=grad; ctx.fill(); ctx.restore();
    });
  }

  function drawStars(t) {
    stars.forEach(s => {
      const tw = 0.5+0.5*Math.sin(t*0.001*s.tSpd+s.tOff);
      const op = s.baseOp*(0.4+0.6*tw);
      ctx.beginPath(); ctx.arc(s.x*W,s.y*H,s.size,0,Math.PI*2);
      ctx.fillStyle = s.size>1.5 ? `rgba(255,240,210,${op})` : `rgba(210,225,255,${op})`;
      ctx.fill();
      if(s.size>1.8&&tw>0.7){
        ctx.beginPath(); ctx.arc(s.x*W,s.y*H,s.size*2.5,0,Math.PI*2);
        ctx.fillStyle=`rgba(200,220,255,${op*0.15})`; ctx.fill();
      }
    });
  }

  function drawShooters(t) {
    for(let i=shooters.length-1;i>=0;i--){
      const s=shooters[i]; s.life++;
      s.x+=Math.cos(s.angle)*s.spd; s.y+=Math.sin(s.angle)*s.spd;
      if(s.life<10) s.op=s.life/10;
      else if(s.life>s.maxLife-15) s.op=(s.maxLife-s.life)/15;
      else s.op=1;
      if(s.life>=s.maxLife||s.x>1.2||s.y>1.2){shooters.splice(i,1);continue;}
      const x1=s.x*W,y1=s.y*H,x2=x1-Math.cos(s.angle)*s.len*W,y2=y1-Math.sin(s.angle)*s.len*W;
      const g=ctx.createLinearGradient(x1,y1,x2,y2);
      g.addColorStop(0,`rgba(255,255,255,${s.op})`);
      g.addColorStop(0.3,`rgba(180,210,255,${s.op*0.6})`);
      g.addColorStop(1,`rgba(100,150,255,0)`);
      ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2);
      ctx.strokeStyle=g; ctx.lineWidth=s.size; ctx.lineCap='round'; ctx.stroke();
      ctx.beginPath(); ctx.arc(x1,y1,s.size*1.5,0,Math.PI*2);
      ctx.fillStyle=`rgba(255,255,255,${s.op*0.8})`; ctx.fill();
    }
  }

  function loop(t) {
    ctx.clearRect(0,0,W,H);
    drawBg(); drawNebulas(t); drawStars(t); drawShooters(t);
    if(t-lastShot > 3000+Math.random()*6000){ spawnShooter(); if(Math.random()<0.25) setTimeout(spawnShooter,200+Math.random()*400); lastShot=t; }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();
