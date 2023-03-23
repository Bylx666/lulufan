$("canvas-luse").onwheel = $("canvas-luse").onmousedown = $("canvas-luse").onmouseup = (e)=> e.stopPropagation();
(()=> {

  var canv = $("canvas-luse");
  var c = canv.getContext("2d");
  canv.width = 1600;
  canv.height = 900;
  var rese = ()=> {

    var docel = document.documentElement;
    var W = docel.clientWidth*9<docel.clientHeight*16;
    canv.style.width = W?"80%":(docel.clientHeight*12.8/9+"px");
    canv.style.height = W?(docel.clientWidth*7.2/16+"px"):"80%";

  };
  rese();
  window.addEventListener("resize", rese);


  var ac = new AudioContext();
  var acAnaly = ac.createAnalyser();
  acAnaly.connect(ac.destination);
  function play(n, l) {

    var bf = ac.createBufferSource();
    bf.buffer = srcs[n];
    bf.connect(ac.destination);
    if(l) bf.loop = true;
    bf.start();
    return bf;

  }
  var bpm = 100;
  var score = [];
  var playing = true;


  var srcs = {};
  var srcLen = 0;
  var srcLoaded = 0;
  var srcFunc = ()=> {
    if(++srcLoaded!==srcLen) return;

    render();
    canv.onclick = scene0;

  };
  fetch("/a/b/luse").then((v)=> v.arrayBuffer()).then((v)=> {

    var buf = new Uint8Array(v);
    var dv = new DataView(v);
    for(let i=0; i<v.byteLength; ) {

      const n = String.fromCharCode(...buf.subarray(i, i+20).filter((v)=> v!==0));
      const s = dv.getUint32(i+20);
      const f = v.slice(i+24, i+24+s);
      i+=s+24;
      ++srcLen;

      if(n.endsWith(".png")) {

        const na = n.replace(".png", "");
        srcs[na] = new Image();
        srcs[na].src = URL.createObjectURL(new Blob([f]));
        srcs[na].onload = srcFunc;

      }else if(n.endsWith(".mp3")) {

        const na = n.replace(".mp3", "");
        ac.decodeAudioData(f).then((v)=> {
          
          srcs[na] = v;
          srcFunc();

        });

      }

    }
    
  });


  srcs.score = {};
  srcs.music = {};
  var scoreLoading = 0;
  function getSource(id) {

    scoreLoading += 2;
    fetch("/a/b/luses/"+id+".score").then((v)=> v.text()).then((v)=> {

      var a = v.replace(/(\[.+?\])|(\n)|(\r)/gs, "").split(";");
      var _score = [];
      a.forEach((t)=> {
  
        if(t.startsWith("bpm=")) {
  
          _score.bpm = parseInt(t.replace("bpm=", ""));
          return 0;

        }
        if(t.startsWith("score=")) {
  
          let holding = 0;
          t.replace("score=", "").split(",").reduce((a,b)=> {
  
            var _b = parseInt(b);
            var w = (_b===0?0:(4/(parseInt(b)||4)));
            var t = ["a", "b", "d", "h", "g"].find((w)=> b.includes(w));
            var air = b.includes("f");

            if(t==="h") {

              if((holding&2)&&!air) holding &= 1;
              else if((holding&1)&&air) holding &= 2;
              else holding |= (air?1:2);

            }
            if(b.includes("|")) _score.devo = a/(_score.bpm/60);
            _score.push({
              w: w,
              l: a,
              a: air,
              t: t,
              h: holding
            });
            if(t==="d") _score.push({
              w: 0,
              l: a,
              a: !air,
              t: t,
              h: holding
            })
            return w+a;
  
          }, 4);
  
        }
  
      });
      srcs.score[id] = _score;
      --scoreLoading;
  
    });

    fetch("/a/b/luses/"+id+".mp3").then((v)=> v.arrayBuffer()).then((v)=> 
    ac.decodeAudioData(v)).then((v)=> {

      srcs.music[id] = v;
      --scoreLoading;

    });

  }
  var theme = "a";
  getSource(theme);

  
  var frame = {
    lu: 1,
    air: false,
    holding: 0,
    scor: null,
    apscor: 0,
    bg: 0,
    ground: 0,
    countdown: 2,
    start: 0,
    missCd: 0,
    combo: 0,
    bgshape: new Uint8Array(acAnaly.frequencyBinCount),
    stat: {
      m: 0,
      g: 0,
      p: 0
    }
  };
  var frameLuStep = ()=> playing&&(++frame.lu>4)&&(frame.lu = 1);
  var frameLuStepTimer = setInterval(frameLuStep, 300);
  setInterval(()=> {

    if(!playing) return 0;
    (frame.bg -= 10)< -1000&&(frame.bg = 0);
    (frame.ground -= 40)< -1000&&(frame.ground = 0);

  }, 40);


  var progress = {};
  var userPrecision = [0.4, 0.15];
  var userKey = {
    1: ["j","k","l","r"],
    2: ["s","d","f","u"],
  };
  document.addEventListener("keydown", (e)=> {
    if(e.repeat) return 0;
    if(e.key==="Escape") return reset();
    if(e.key===" ") return playswi();

    var hitA = userKey[1].find((v)=> e.key===v)?false
      :(userKey[2].find((v)=> e.key===v)?true:null);
    if(hitA===null) return 0;
    frame.air = hitA;

    var beat = (ac.currentTime - frame.start)/60*bpm+0.3;
    var hitI = score.findIndex((s, i)=> 
      ((progress[i]===undefined)&&(Math.abs(s.l-beat)<userPrecision[0])
      &&s.t&&s.t!=="g"&&(s.a===hitA)));
    if(hitI===-1) return frame.scor = null;
    var hit = score[hitI];

    if(scene!==2||!playing) return 0;
    var offs = Math.abs(hit.l-beat);
    var scor = 0;
    if(offs>=0&&offs<userPrecision[1]) {

      scor = 10;
      ++frame.stat.p;

    }
    if(offs>=userPrecision[1]&&offs<userPrecision[0]) {
      
      scor = 3;
      ++frame.stat.g;

    }
    frame.scor = scor;
    frame.apscor += 10 / userPrecision[1];
    progress[hitI] = scor / userPrecision[1];
    ++frame.combo;

    if(hit.t==="h") {

      play("sin");
      const hbf = play("sin2", true);
      ++frame.holding;
      const mue = (_e)=> {

        if(_e.key!==e.key) return 0;
        hbf.stop();
        frame.apscor += 30;
        var _beat = (ac.currentTime - frame.start)/60*bpm+0.3;
        var _hitI = score.findIndex((s, i)=> 
          (progress[i]===undefined)&&_beat>s.l-1&&s.t==="h"&&s.a===hitA);
        if(_hitI===-1) frame.scor = progress[score.findIndex((s, i)=> 
          (progress[i]===undefined)&&s.t==="h"&&s.a===hitA)] = 0;
        else {

          frame.scor = 10;
          progress[_hitI] = 30;

        }
        --frame.holding;
        document.removeEventListener("keyup", mue);

      };
      document.addEventListener("keyup" ,mue);

    }else play((hit.t==="b"?"kick":"snare"));

  });


  var scene = 0;
  function scene0() {

    if(scoreLoading) return 0;
    canv.onclick = null;
    scene = 1;
    setTimeout(()=> {

      frame.countdown = 1;
      setTimeout(()=> load(srcs.score[theme], srcs.music[theme]), 1000);

    }, 1000);

  };


  var userOffset = 120;
  c.textAlign = "center";
  function render() {

    requestAnimationFrame(render);
    if(!playing) return 0;
    c.clearRect(0,0,1600,900);

    // 背景
    c.drawImage(srcs.bg, frame.bg, 0, 1000, 900);
    c.drawImage(srcs.bg, frame.bg+1000, 0, 1000, 900);
    c.drawImage(srcs.bg, frame.bg+2000, 0, 1000, 900);
    acAnaly.getByteFrequencyData(frame.bgshape);
    c.beginPath();
    for(let i=0; i<frame.bgshape.length; i+=8) {

      const s = frame.bgshape[i]/256;
      const l = frame.bgshape.length;
      c.rect(1600/l*(l-i), 900*(1-s), 10800/l, 900*s);

    }
    c.fillStyle = "#fff5";
    c.fill();
    c.drawImage(srcs.ground, frame.ground, 600, 1000, 300);
    c.drawImage(srcs.ground, frame.ground+1000, 600, 1000, 300);
    c.drawImage(srcs.ground, frame.ground+2000, 600, 1000, 300);

    let total = 0;
    for(let i=0; i<score.length; ++i) 
      progress[i]&&(total += progress[i]);
    const perfr = (total*100/frame.apscor)||100;
    if(scene===0) {

      // 启动画面
      c.fillStyle = "#0005";
      c.font = "100px code, monospace";
      c.fillText("Lulu Dash", 900, 600);
      c.font = "30px hc, sans-serif";
      c.fillText("点击任意处开始", 900, 500);

    }
    if(scene===1) {

      // 倒计时
      c.font = "100px hc, monospace";
      c.fillStyle = "#000";
      c.fillText(frame.countdown===2?"Ready":(frame.countdown===1?"Go!":""), 800, 300);

    }
    if(scene===2) {

      // 画怪
      const beats = (ac.currentTime - frame.start)/60*bpm;
      c.beginPath();
      score.filter((v,i)=> {

        // 判断pass和miss
        function miss() {

          ++frame.stat.m;
          frame.combo = 0;
          frame.scor = progress[i] = 0;
          if(frame.missCd) return 0;
          frame.missCd = true;
          setTimeout(()=> frame.missCd = false, 2000);
          play("miss");

        }
        if(v.t==="g"&&progress[i]===undefined) {

          const _d = beats-v.l;
          if(_d> 0&&_d<0.3&&frame.air!==v.a) {

            frame.apscor += 20;
            miss();

          }
          if(_d>0.3) {

            frame.apscor += 20;
            progress[i] = 20;

          }

        }else if(v.t&&progress[i]===undefined&&(beats-v.l)>userPrecision[0]) {
          
          frame.apscor += (10 / userPrecision[1]);
          miss();

        }

        return v.l>(beats-6)&&v.l<(beats+6);

      }).forEach((v)=>{

        var i = score.indexOf(v);
        var x = 400*(v.l-beats)+userOffset;
        var y = v.a?200:500;

        if(v.h&2) c.drawImage(srcs.holding, x+135, 500, v.w*400, 300);
        if(v.h&1) c.drawImage(srcs.holdinga, x+135, 200, v.w*400, 300);
        if(!v.t||!(!progress[i]||v.t==="g")) return 0;

        c.moveTo(x+40, 800);
        c.quadraticCurveTo(x+110, 845, x+200, 800);
        c.quadraticCurveTo(x+110, 760, x+40, 800);
        if(v.t==="h") {

          if(v.a&&(v.h&1)) c.drawImage(srcs.holdinga, x+135, y, v.w*400, 300);
          else if((!v.a)&&(v.h&2)) c.drawImage(srcs.holding, x+135, y, v.w*400, 300);

          c.drawImage(v.a?srcs.holda:srcs.hold, x, y);
          return 0;

        }
        
        if(v.t==="d") return c.drawImage(srcs.both, x, 200);
        if(v.t==="g") return c.drawImage(srcs.gear, x, v.a?500:200);
        if(v.t==="a") return c.drawImage(v.a?srcs.cata:srcs.cat, x, y);
        if(v.t==="b") return c.drawImage(v.a?srcs.doga:srcs.dog, x, y);

      });
      c.fillStyle = "#0005";
      c.fill();


      let scor = "";
      switch (frame.scor) {
        case 10: scor = "Perfect";c.fillStyle = "#FECADC";break;
        case 3: scor = "Great";c.fillStyle = "#B3E4EF";break;
        case 0: scor = "Miss";c.fillStyle = "#ffffff";break;
        case null: scor = "";
      }
      c.font = "80px hc, monospace";
      c.strokeStyle = "#888";
      c.strokeText(scor, 382, 302);
      c.fillText(scor, 380, 300);

      c.font = "60px code, monospace";
      c.fillStyle = "#333";
      c.fillText(total.toFixed(0), 150, 100);

      c.font = "45px code, monospace";
      if(perfr>90) c.fillStyle = "#FECADC";
      else c.fillStyle = "#B3E4EF";
      c.strokeText(perfr.toFixed(2)+"%", 152, 152);
      c.fillText(perfr.toFixed(2)+"%", 150, 150);

      if(frame.combo<50) c.fillStyle = "#3335";
      else if(frame.combo>=50&&frame.combo<100) c.fillStyle = "#a88";
      else c.fillStyle = "#d33";
      c.font = "120px hc, monospace";
      c.fillText(frame.combo, 800, 160);

    }
    if(scene===3) {

      // 结算
      c.drawImage(srcs["settlebg"], 0, 0, 1600, 900);
      c.drawImage(srcs["settlelu"], 700, 0, 900, 900);

      const levl = [100, 95, 90, 80].find((v)=> perfr>=v);
      let lev = "";
      switch(levl) {
        case 80: lev = "B";c.fillStyle = "#a8a";break;
        case 90: lev = "A";c.fillStyle = "#8cc";break;
        case 95: lev = "S";c.fillStyle = "#a22";break;
        case 100: lev = "AP";c.fillStyle = "#000";break;
        default: lev = "C";c.fillStyle = "#ff0";
      }
      c.font = "300px code, monospace";
      c.strokeText(lev, 352, 402);
      c.fillText(lev, 350, 400);

      c.font = "80px code, monospace";
      c.strokeText(perfr.toFixed(2)+"%", 352, 702);
      c.fillText(perfr.toFixed(2)+"%", 350, 700);

      c.font = "120px code, monospace";
      c.fillStyle = "#333";
      c.strokeText(total.toFixed(0), 352, 602);
      c.fillText(total.toFixed(0), 350, 600);

      c.font = "36px code, monospace";
      c.fillStyle = "#fff";
      c.fillText("Perfects "+ frame.stat.p, 1400, 100);
      c.fillText("Greats "+ frame.stat.g, 1400, 200);
      c.fillText("Misses "+ frame.stat.m, 1400, 300);

      return 0;
      
    }

    // 画角色
    c.beginPath();
    c.moveTo(110, 790);
    c.quadraticCurveTo(180, 855, 280, 790);
    c.quadraticCurveTo(180, 740, 110, 790);
    c.fillStyle = "#0005";
    c.fill();
    if(frame.air)c.drawImage(srcs[frame.holding?"lu-hold":"lu-air"], 50, 200+(2*frame.lu));
    else c.drawImage(srcs[frame.holding?"lu-hold":("lu-run"+(
      frame.lu===4?"2":frame.lu))], 50, 500);
    c.drawImage(srcs["baseline"], 80+userOffset, 200);

  }

  // 控制函数
  var bgmbs = null;
  function load(_score, _music) {

    scene = 2;
    score = _score;
    bpm = _score.bpm;
    progress = {};
    var devo = _score.devo;
    if(devo) frame.missCd = true;
    else frame.missCd = false;
    clearInterval(frameLuStepTimer);
    frameLuStepTimer = setInterval(frameLuStep, 30000/bpm);
    frame.countdown = 2;
    frame.start = ac.currentTime-(devo?devo:0);
    frame.combo = 0;
    frame.apscor = 0;
    frame.stat = {
      m: 0,
      g: 0,
      p: 0
    }

    var bs = ac.createBufferSource();
    bgmbs = bs;
    bs.buffer = _music;
    bs.connect(acAnaly);
    bs.start(0, devo);
    playing = true;
    bs.onended = ()=> {

      scene = 3;
      let total = 0;
      for(let i=0; i<score.length; ++i) 
        progress[i]&&(total += progress[i]);
      var vbs = ac.createBufferSource();
      if(total/frame.apscor>0.9) vbs.buffer = srcs["nice"];
      else vbs.buffer = srcs["five"];
      vbs.connect(acAnaly);
      vbs.start();
      canv.onclick = scene0;

    };

  }

  function playswi() {
    if(scene===0||scene===3) return scene0();
    if(scene!==2) return 0;

    if(playing) {

      ac.suspend();
      playing = false;
      $("luse-pause").innerHTML = "&#xe8c4;";

    }else {

      ac.resume();
      playing = true;
      $("luse-pause").innerHTML = "&#xe8c5;";

    }
  }
  $("luse-pause").onclick = playswi;

  function reset() {
    if(scene!==2) return 0;

    if(!playing) playswi();
    scene = 0;
    if(bgmbs) {

      bgmbs.onended = null;
      bgmbs.disconnect();

    }
    canv.onclick = scene0;

  }
  $("luse-reset").onclick = reset;

  // settings
  $("luse-set").onclick = function f() {

    $("luse-sett").style.transform = "translate(0)";
    $("luse-set").onclick = ()=> {

      $("luse-sett").style.transform = "translate(-100%)";
      $("luse-set").onclick = f;

    };
  }

  try {

    userOffset = parseInt(localStorage.getItem("luse-offset"))||120;
    $("luse-sett-offset").value = userOffset;

  }catch{};
  $("luse-sett-offset").onchange = ()=> {

    var v = parseInt($("luse-sett-offset").value);
    if(v===NaN) return 0;
    userOffset = v;
    localStorage&&localStorage.setItem("luse-offset", v);

  };

  try {

    userKey = JSON.parse(localStorage.getItem("luse-keys"))||{
      1: ["j","k","l","r"],
      2: ["f","d","s","u"]
    };

  }catch {};
  for(let i=0; i<4; ++i) {for(let j=1; j<3; ++j) {

    const ka = $("luse-sett-key"+j).querySelectorAll("kbd");
    ka[i].setAttribute("cursor", "link");
    ka[i].textContent = userKey[j][i];
    
    ka[i].onclick = function f(e) {

      e.stopPropagation();

      ka[i].className = "act";
      var exi = ()=> {

        document.removeEventListener("click", exi);
        ka[i].className = "";

      };
      document.addEventListener("click", exi);
      document.addEventListener("keydown", function f(e) {

        document.removeEventListener("keydown", f);
        exi();
        if(e.key==="Escape"||e.key===" ") return 0;

        var k = e.key;
        ka[i].textContent = userKey[j][i] = k;
        localStorage&&localStorage.setItem("luse-keys", JSON.stringify(userKey));

      });

    }

  }}

  for(let i=0; i<3; ++i) {
    
    const b = $("luse-sett-perc").children[i];
    b.onclick = ()=> {

      for(const _b of $("luse-sett-perc").children) _b.className = "";
      b.className = "act";
      switch(i) {
        case 0: userPrecision = [0.5, 0.2];break;
        case 1: userPrecision = [0.4, 0.15];break;
        case 2: userPrecision = [0.1, 0.1];break;
      }

    };

  }
  
  $("luse-sett").onmousedown = $("luse-sett").onwheel = 
  $("luse-sett").onmouseup = (e)=> e.stopPropagation();

})();
