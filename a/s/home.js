// home danmuku
(()=> {

  var danl = ["打call", "天选国v", "打卡", "支持", "走神了", "我超，二次元", "？？？？？？", "？？？", "？", "离谱", "草", "蚌埠住了", "哈哈哈哈哈哈", "哈哈哈", "笑死", "2333", "mua", "好听", "\\lulu/\\lulu/\\lulu/", "\\lulu/", "贴贴", "好好好", "小黑子是吧", "1", "1111111", "11", "牛蛙", "牛", "卧槽", "大佬", "真好听", "太强了", "lulu太强了", "单推了", "爱了爱了", "妙啊", "太可爱了", "可爱", "植物", "我超", "来了", "两眼一黑", "两眼一亮", "lulu~", "太潮辣", "对味了", "得得得得得得得得得得得得", "礼尚往来", "危", "开始暴躁", "血压上来了", "番茄射手", "加油", "给你一拳", "るるまじ可愛い", "门牙掉了", "沉默", "emo-1", "emo-1", "emo-2", "emo-3", "emo-4", "emo-4"];

  var to = 0;
  function makeDan() {

    to = setTimeout(makeDan, Math.random()*1000*(1600/document.documentElement.clientWidth));
    if(page!==0) return 0;

    var sel = danl[Math.floor(Math.random()*danl.length)];
    var isEmo = sel.startsWith("emo");
    var p = document.createElement(isEmo?"img":"p");
    $("home-dan").append(p);
    isEmo?(p.src = "/a/p/"+sel+".png"):(p.textContent = sel);
    p.style.top = Math.floor(Math.random()*5)*40+"px";
    p.onanimationend = ()=> p.remove();

  }
  makeDan();
  document.addEventListener("blur", ()=> clearTimeout(to));
  document.addEventListener("focus", ()=> makeDan());

})();
$("home-kanban").children[0].onclick = ()=> {

  voc.src = "/a/b/dedede.mp3";
  voc.play();

};
