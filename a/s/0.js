
var $ = (e)=> document.getElementById(e);

// cursor effect
(()=> {

  var cursor = $("canvas-cursor");
  var ctx = cursor.getContext("2d");
  function rese() {

    cursor.width = document.documentElement.clientWidth;
    cursor.height = document.documentElement.clientHeight;

  }rese();
  window.addEventListener("resize", rese);

  var li5 = [];
  ctx.lineWidth = 1;
  ctx.fillStyle = "#0005"
  document.addEventListener("mousemove" ,(e)=> {

    e.preventDefault();
    var el = document.elementFromPoint(e.clientX, e.clientY);
    var l = el?el.tagName==="A"||el.getAttribute("cursor")==="link":false;
    ctx.strokeStyle = l?"#333":"#aaa";
    if(li5.length>=10) li5.splice(0,2);
    li5.push(e.clientX, e.clientY);

    ctx.clearRect(0,0,cursor.width,cursor.height);
    for(let i=0; i<li5.length; i+=2) {
      
      ctx.beginPath();
      ctx.arc(li5[i], li5[i+1], (l?12:16), 0, Math.PI*2);
      ctx.globalAlpha = i/li5.length;
      if(l) ctx.fill();
      ctx.stroke();

    }

  });

})();

var voc = new Audio();
$("start").onanimationend = ()=> $("start").style.display = "none";
$("start").onclick = ()=> {

  $("start").className = "fadeout";
  voc.src = "/a/b/lol.mp3";
  voc.play();

};

// live2d
(()=> {

  var c = $("canvas-live");
  c.onclick = ()=> {

    voc.src = "/a/b/biechongle.mp3";
    voc.play();

  };
  c.width = 426;
  c.height = 240;
  var ctx = c.getContext("2d");

  var eye = [135, 135];
  var frameDegs = [180, 165, 150, 135, 120, 105, 90, 75, 60, 45, 30, 15, 0, -15, -30, -45, -60, -75, -90, -105, -120, -135, -150, -165];
  var frames = {};
  var img = new Image();

  fetch("/a/b/livelulu").then((v)=> v.arrayBuffer()).then((v)=> {

    var buf = new Uint8Array(v);
    var dv = new DataView(v);
    
    for(let ind=0; ind<buf.length;) {

      const i = Number(ind);
      const len = dv.getUint16(i+10);
      frames[String.fromCharCode(...buf.subarray(i, i+10).filter((v)=>v!==0))
        .replace(".jpg", "")] = URL.createObjectURL(new Blob([buf.subarray(i+12, i+12+len)]));
      
      ind+=len+12;
  
    }
  
  });

  document.addEventListener("mousemove", (e)=> {

    var deg = -Math.atan2(
      e.clientY - document.documentElement.clientHeight + eye[1], 
      e.clientX - document.documentElement.clientWidth + eye[0]
    )/Math.PI*180;
    var f = frames[frameDegs.find((v)=> v<=deg)];
    if(f) {

      img.src = f;
      img.onload = ()=> ctx.drawImage(img, 0, 0, 426, 240);

    }

  });

})();

var page = 0;
function pageTo(i) {

  $("pages").children[page].className = "fadeout";
  $("pages").children[i].className = "fadein";
  $("pages").style.top = -i+"00vh";
  page = i;
  var nl = $("nav-li").children;
  for(let j=0; j<nl.length; ++j) nl[j].className = "";
  nl[i].className = "act";

}
for(let i=0; i<$("nav-li").children.length;++i) 
  $("nav-li").children[i].onclick = ()=> pageTo(i);
$("pages").onwheel = (e)=> {

  e.deltaY>0&&page<4&&pageTo(page+1);
  e.deltaY<0&&page>0&&pageTo(page-1);
  
};
$("pages").onmousedown = (e)=> {
  $("pages").onmouseup = (_e)=> {

    e.clientY-_e.clientY>  120&&page<4&&pageTo(page+1);
    e.clientY-_e.clientY< -120&&page>0&&pageTo(page-1);

  };
};
for(let img of document.images) img.ondragstart = img.ondrag = img.onmousedown = (e)=> {
  
  e.preventDefault();
  return false;

}
