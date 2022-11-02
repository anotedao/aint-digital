import Alpine from 'alpinejs'
import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.css' // Import precompiled Bootstrap css
import '@fortawesome/fontawesome-free/css/all.css'
import anime from 'animejs/lib/anime.es.js';

window.Alpine = Alpine
Alpine.start();

const wrapperEl = document.querySelector('.wrapper');
const numberOfEls = 90;
const duration = 6000;
const delay = duration / numberOfEls;

let tl = anime.timeline({
  duration: delay,
  complete: function() { tl.restart(); }
});

function createEl(i) {
  let el = document.createElement('div');
  const rotate = (360 / numberOfEls) * i;
  const translateY = -50;
  const hue = Math.round(360 / numberOfEls * i);
  el.classList.add('el');
//   el.style.backgroundColor = 'hsl(' + hue + ', 40%, 60%)';
  el.style.backgroundColor = '#DC4040';
  el.style.transform = 'rotate(' + rotate + 'deg) translateY(' + translateY + '%)';
  tl.add({
    begin: function() {
      anime({
        targets: el,
        // backgroundColor: ['hsl(' + hue + ', 40%, 60%)', 'hsl(' + hue + ', 60%, 80%)'],
        backgroundColor: '#DC4040',
        rotate: [rotate + 'deg', rotate + 10 +'deg'],
        translateY: [translateY + '%', translateY + 10 + '%'],
        scale: [1, 1.25],
        easing: 'easeInOutSine',
        direction: 'alternate',
        duration: duration * .1
      });
    }
  });
  wrapperEl.appendChild(el);
};

for (let i = 0; i < numberOfEls; i++) createEl(i);