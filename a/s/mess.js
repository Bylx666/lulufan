$("mess").onwheel = $("mess").onmousedown = $("mess").onmouseup = (e)=> e.stopPropagation();

(()=> {

  var ni = $("mess-name");
  var ti = $("mess-text");
  var bi = $("mess-butt");

  localStorage&&(ni.value = localStorage.getItem("mess-name"));
  window.addEventListener("beforeunload", ()=> localStorage&&localStorage.setItem("mess-name", ni.value));

  var len = 0;
  fetch("/api/mess").then((v)=> v.json()).then((v)=> {

    len = v.length;
    for(let c of v) {

      const div = document.createElement("div");
      $("mess").children[0].append(div);
      div.innerHTML = `<h3><span>${c.n.replace(/\</g, "&lt;")}</span><address>${new Date(c.t).toLocaleDateString()}#${c.i}</address></h3><div><h3>${c.n[0]}</h3><p>${c.c.replace(/\</g, "&lt;")}</p></div>`;

    }

  });

  function subm() {

    bi.onclick = null;
    bi.className = "dis";
    var _ni = String(ni.value);
    var _ti = String(ti.value);
    ti.value = "";
    fetch("/api/mess", {
      method: "POST",
      body: JSON.stringify({
        "n": _ni,
        "c": _ti
      })
    }).then((v)=> v.text()).then((v)=> {

      v&&$("mess").children[0].children[0].insertAdjacentHTML("afterend", `<div><h3><span>${_ni.replace(/\</g, "&lt;")}</span><address>${new Date().toLocaleDateString()}#${++len}</address></h3><div><h3>${_ni[0]}</h3><p>${_ti.replace(/\</g, "&lt;")}</p></div></div>`);

    });

  }

  ni.oninput = ti.oninput = ()=> {

    if(ni.value&&ti.value) {

      bi.onclick = subm;
      bi.className = "";

    }else {

      bi.onclick = null;
      bi.className = "dis";

    }

  };
  
})();

$("mess-debu").onclick = ()=> {
  
  voc.src = "/a/b/duidui.mp3";
  voc.play();
  
};
