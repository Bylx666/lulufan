(()=> {

  var ac = new AudioContext();
  var src = null;
  var startTime = 0;
  function play() {

    ac.resume();
    $("music-cover").onclick = pause;
    $("music-cover").querySelector("img").className = "play";

  }
  function pause() {

    ac.suspend();
    $("music-cover").onclick = play;
    $("music-cover").querySelector("img").className = "";

  }
  var cache = {};
  var loading = false;
  function load(i, c) {

    if(loading) return 0;
    $("music-cont").querySelector("img").src = $("music-cover").querySelector("img")
    .src = "/a/b/songs.src/"+i+".jpg";
    src&&src.disconnect();
    playing = false;
    startTime = Number(ac.currentTime);
    src = ac.createBufferSource();
    src.connect(analy);
    src.loop = true;
    function splay() {

      src.start();
      play();

    }
    if(cache[i]) {
      
      src.buffer = cache[i];
      splay();

    }else {

      loading = true;
      fetch("/a/b/songs.src/"+i+".mp3").then((v)=> v.arrayBuffer())
      .then((v)=> ac.decodeAudioData(v)).then((v)=> {

        src.buffer = cache[i] = v;
        if(c) {

          $("music-cover").onclick = splay;
          setInterval(renderCover, 50);

        }else splay()
        loading = false;

      });

    }

  }
  
  // load musics
  var musicList = ["One last's kiss", "香水有毒", "一Lu向北", "Luu民飞行", "in the rain", "救いたかったのは", "アイルクライル", "CHE.R.RY", "Calc.", "For ya", "lumon", "金魚花火", "シンデレラボーイ"];

  var li = $("music-list").querySelector("div");
  for(let i=0; i<=12; ++i) {

    const p = document.createElement("p");
    li.append(p);
    p.textContent = musicList[i];
    p.setAttribute("cursor", "link");
    p.onclick = ()=> {

      load(i);
      $("music-cover").onclick = pause;

    };
    
  }

  $("music-progr").onclick = ()=> {

    voc.src = "/a/b/niganma.mp3";
    voc.play();

  };

  // render cover byte shape
  var c = $("canvas-music");
  c.width = c.height = 300;
  var ctx = c.getContext("2d");
  ctx.lineWidth = 2;

  var analy = ac.createAnalyser();
  analy.connect(ac.destination);
  var shape = new Uint8Array(analy.frequencyBinCount);
  const halfd = 16/shape.length*2*Math.PI;

  var partis = {
    l: [],
    p: []
  };
  var pcanv = $("canvas-music-parti");
  pcanv.width = pcanv.height = 300;
  var pctx = pcanv.getContext("2d");
  pctx.lineWidth = 2;

  function parti() {

    src&&($("music-progr").style.width = ((ac.currentTime-startTime)/src.buffer.duration*100)+"%");
    pctx.clearRect(0,0,300,300);
    pctx.beginPath();
    if(partis.l.length<10) partis.l.push(Math.random()*2*Math.PI, 100);
    if(partis.p.length<10) partis.p.push(Math.random()*2*Math.PI, 100);
    for(let i=0; i<partis.l.length;i+=2) {

      const deg = partis.l[i];
      partis.l[i+1]+=1;
      const pos = partis.l[i+1];
      if(pos>180) {

        partis.l.splice(i, 2);
        i-=2;
        continue;

      }
      const opx = 150+Math.sin(deg)*pos;
      const opy = 150-Math.cos(deg)*pos;
      const inpx = 150+Math.sin(deg)*(pos-20);
      const inpy = 150-Math.cos(deg)*(pos-20);
      pctx.moveTo(inpx,inpy);
      pctx.lineTo(opx,opy);
  
    }
    pctx.stroke();

    for(let i=0; i<partis.p.length;i+=2) {

      const deg = partis.p[i];
      partis.p[i+1]+=2;
      const pos = partis.p[i+1];
      if(pos>180) {

        partis.p.splice(i, 2);
        i-=2;
        continue;

      }
      const opx = 150+Math.sin(deg)*pos;
      const opy = 150-Math.cos(deg)*pos;
      pctx.beginPath();
      pctx.arc(opx, opy, 6, 0, 2*Math.PI);
      pctx.stroke();
  
    }

  }

  function renderCover() {

    if(!src.buffer) return 0;

    analy.getByteFrequencyData(shape);
    ctx.clearRect(0,0,300,300);
    ctx.beginPath();
    for(let i=0; i<shape.length; i+=32) {

      const deg = i/shape.length*2*Math.PI;
      const inlx = 150+Math.sin(deg-halfd)*100;
      const inly = 150-Math.cos(deg-halfd)*100;
      const opx = 150+Math.sin(deg)*(125+25*(shape[i]-128)/128);
      const opy = 150-Math.cos(deg)*(125+25*(shape[i]-128)/128);
      const inpx = 150+Math.sin(deg)*100;
      const inpy = 150-Math.cos(deg)*100;
      i===0?(ctx.moveTo):(ctx.lineTo)(inlx, inly);
      ctx.lineTo(opx, opy);
      ctx.lineTo(inpx, inpy);
      ctx.lineTo(opx, opy);
      
    }
    ctx.closePath();
    ctx.stroke();
    parti();
    
  }
  load(0, true);


  // get main color
  var bg = $("music-cont").querySelector("img");
  bg.onload = ()=> {

    ctx.drawImage(bg, 50,50,200,200);
    var imgdat = ctx.getImageData(50, 50, 200, 200).data;
    var imgColors = {r:0,g:0,b:0};
    for(let i=0; i<imgdat.length; i+=4) {
  
      imgColors.r+=imgdat[i];
      imgColors.g+=imgdat[i+1];
      imgColors.b+=imgdat[i+2];
  
    }
    var rgb = `rgb(${imgColors.r/40000}, ${imgColors.g/40000}, ${imgColors.b/40000})`;
    ctx.clearRect(0,0,300,300);
    ctx.strokeStyle = rgb;
    var prg = pctx.createRadialGradient(150,150,180,150,150,100);
    prg.addColorStop(0, "#0000");
    prg.addColorStop(1, rgb);
    pctx.strokeStyle = prg;

  };

})();
