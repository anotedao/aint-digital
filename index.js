var $8OivB$alpinejs = require("alpinejs");
require("bootstrap");
require("bootstrap/dist/css/bootstrap.css");
require("@fortawesome/fontawesome-free/css/all.css");
var $8OivB$animejslibanimeesjs = require("animejs/lib/anime.es.js");

function $parcel$interopDefault(a) {
  return a && a.__esModule ? a.default : a;
}





window.Alpine = (0, ($parcel$interopDefault($8OivB$alpinejs)));
(0, ($parcel$interopDefault($8OivB$alpinejs))).start();
const $a826c173f4456cde$var$wrapperEl = document.querySelector(".wrapper");
const $a826c173f4456cde$var$numberOfEls = 90;
const $a826c173f4456cde$var$duration = 6000;
const $a826c173f4456cde$var$delay = $a826c173f4456cde$var$duration / $a826c173f4456cde$var$numberOfEls;
let $a826c173f4456cde$var$tl = (0, ($parcel$interopDefault($8OivB$animejslibanimeesjs))).timeline({
    duration: $a826c173f4456cde$var$delay,
    complete: function() {
        $a826c173f4456cde$var$tl.restart();
    }
});
function $a826c173f4456cde$var$createEl(i) {
    let el = document.createElement("div");
    const rotate = 360 / $a826c173f4456cde$var$numberOfEls * i;
    const translateY = -50;
    const hue = Math.round(360 / $a826c173f4456cde$var$numberOfEls * i);
    el.classList.add("el");
    //   el.style.backgroundColor = 'hsl(' + hue + ', 40%, 60%)';
    el.style.backgroundColor = "#DC4040";
    el.style.transform = "rotate(" + rotate + "deg) translateY(" + translateY + "%)";
    $a826c173f4456cde$var$tl.add({
        begin: function() {
            (0, ($parcel$interopDefault($8OivB$animejslibanimeesjs)))({
                targets: el,
                // backgroundColor: ['hsl(' + hue + ', 40%, 60%)', 'hsl(' + hue + ', 60%, 80%)'],
                backgroundColor: "#DC4040",
                rotate: [
                    rotate + "deg",
                    rotate + 10 + "deg"
                ],
                translateY: [
                    translateY + "%",
                    translateY + 10 + "%"
                ],
                scale: [
                    1,
                    1.25
                ],
                easing: "easeInOutSine",
                direction: "alternate",
                duration: $a826c173f4456cde$var$duration * .1
            });
        }
    });
    $a826c173f4456cde$var$wrapperEl.appendChild(el);
}
for(let i = 0; i < $a826c173f4456cde$var$numberOfEls; i++)$a826c173f4456cde$var$createEl(i);


//# sourceMappingURL=index.js.map
