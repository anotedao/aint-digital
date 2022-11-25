import Alpine from 'alpinejs'
import 'bootstrap'
import "bootswatch/dist/slate/bootstrap.min.css";
import '@fortawesome/fontawesome-free/css/all.css'
import anime from 'animejs/lib/anime.es.js';
import $ from "jquery";
import {manifest, version} from '@parcel/service-worker';

// window.Alpine = Alpine
Alpine.start();

const wrapperEl = document.querySelector('.wrapper');
const numberOfEls = 60;
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
  el.classList.add('el');
  el.classList.add('red');
  el.style.transform = 'rotate(' + rotate + 'deg) translateY(' + translateY + '%)';
  tl.add({
    begin: function() {
      anime({
        targets: el,
        rotate: [rotate + 'deg', rotate + 10 +'deg'],
        translateY: [translateY + '%', translateY + 10 + '%'],
        scale: [1, 1.25],
        easing: 'easeInOutSine',
        direction: 'alternate',
        duration: duration * .1
      });
    }
  });
  if (wrapperEl != null) {
    wrapperEl.appendChild(el);
  }
};

for (let i = 0; i < numberOfEls; i++) createEl(i);

tl.pause();

function pulsate() {
    if($(".wrapper").is(":visible")) {
        $(".wrapper").fadeOut(pulsate);
    } else {
        $(".wrapper").fadeIn(function() {
            setTimeout(pulsate, 3000);
        });
    }
}

var isMining = true;
var address = localStorage.getItem("address");

$.getJSON("https://nodes.anote.digital/node/status", function (data) {
    var currentHeight = data.blockchainHeight;
    $.getJSON("https://nodes.anote.digital/addresses/data/3ANzidsKXn9a1s9FEbWA19hnMgV9zZ2RB9a?key=" + address, function (data) {
        if (data.length > 0) {
            var miningData = data[0].value;
            var mdSplit = miningData.split("__")

            if (mdSplit.length >= 3) {
                var miningHeight = parseInt(miningData.split("__")[2]);
            } else {
                var miningHeight = 0;
            }

            if (currentHeight - miningHeight <= 1410) {
                startMiner();
            } else {
                isMining = false;
                $("#mainView").hide();
                $("#mineView").show();
            }
        }
    });
});

$("#startMiner").on("click", function() {
    $(this).blur();
    startMiner()

    try {
        MyJavascriptInterface.startMiner();
    } catch (e: any) {}
});

$("#stopMiner").on("click", function() {
    $(this).blur();
    stopMiner();

    try {
        MyJavascriptInterface.stopMiner();
    } catch (e: any) {}
});

function startMiner() {
    tl.play();
    $("#stopMiner > i").removeClass("text-danger");
    $("#startMiner > i").addClass("text-success");
}

function stopMiner() {
    tl.pause();
    $("#startMiner > i").removeClass("text-success");
    $("#stopMiner > i").addClass("text-danger");
}

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

if (urlParams.get('run') == 'true') {
    startMiner();
}

$("#profileButton").on("click", function() {
    if (isMining) {
        $("#mainView").fadeOut(function() {
            $("#profileView").fadeIn();
        });
    } else {
        $("#mineView").fadeOut(function() {
            $("#profileView").fadeIn();
        });
    }
});

$("#backButton").on("click", function() {
    $("#profileView").fadeOut(function() {
        if (isMining) {
            $("#mainView").fadeIn();
        } else {
            $("#mineView").fadeIn();
        }
    });
});

$("#addressButton").on("click", function() {
    var address = $("#address").val();
    if (!address || address.length == 0) {
        $("#addressMessage").fadeIn(function() {
            setTimeout(function() {
                $("#addressMessage").fadeOut();
            }, 1000);
        });
    } else {
        localStorage.setItem("address", address);
        $("#profileView").fadeOut(function() {
            if (isMining) {
                $("#mainView").fadeIn();
            } else {
                $("#mineView").fadeIn();
            }
        });
        try {
            MyJavascriptInterface.saveAddress(address);
        } catch (e: any) {}
    }
});

var address = localStorage.getItem("address");
if (address && address.length > 0) {
    $("#address").val(address);
    try {
        MyJavascriptInterface.saveAddress(address);
    } catch (e: any) {}
}

var mobileNodeUrl = "https://mobile.anote.digital";
var captchaId = "";

$.getJSON(mobileNodeUrl + "/new-captcha/" + address, function (data) {
    $("#captcha-img").attr("src", data.image);
    $("#captcha-img").attr("onclick", "this.src=('" + data.image + "?reload='+(new Date()).getTime())");
    captchaId = data.id;
});

$("#buttonMine").on("click", function() {
    $(this).blur();
    
    var code = $("#code").val();
    var captcha = $("#captcha").val();

    if (code?.toString().length == 0 || captcha?.toString().length == 0) {
        $("#errorMessage").html("Both fields are required");
        $("#errorMessage").fadeIn(function () {
            setTimeout(function () {
                $("#errorMessage").fadeOut();
            }, 500);
        });
        navigator.vibrate(500);
    } else {
        var ref = "";

        // if (this.referral && this.referral.length > 0 && this.referral != undefined) {
        //     ref = "/" + this.referral
        // }

        $.getJSON(mobileNodeUrl + "/mine/" + address + "/" + captchaId + "/" + captcha + "/" + code + ref, function (data) {
            if (data.error == 1) {
                $("#errorMessage").html(t.bank.wrongCaptcha);
                $("#errorMessage").fadeIn(function () {
                    setTimeout(function () {
                        $("#errorMessage").fadeOut();
                    }, 500);
                });
                $("#captcha-img").click();
                navigator.vibrate(500);
            } else if (data.error == 2) {
                $("#errorMessage").html(t.bank.wrongCode);
                $("#errorMessage").fadeIn(function () {
                    setTimeout(function () {
                        $("#errorMessage").fadeOut();
                    }, 500);
                });
                $("#captcha-img").click();
                navigator.vibrate(500);
            } else if (data.error == 3) {
                $("#errorMessage").html(t.bank.otherError);
                $("#errorMessage").fadeIn(function () {
                    setTimeout(function () {
                        $("#errorMessage").fadeOut();
                    }, 5000);
                });
                $("#captcha-img").click();
                navigator.vibrate(500);
            } else if (data.error == 4) {
                $("#errorMessage").html(t.bank.ipError);
                $("#errorMessage").fadeIn(function () {
                    setTimeout(function () {
                        $("#errorMessage").fadeOut();
                    }, 1000);
                });
                navigator.vibrate(500);
            } else if (data.success) {
                startMiner();
                $("#mineView").fadeOut(function () {
                    $("#mainView").fadeIn();
                    navigator.vibrate(1000);
                });

                try {
                    MyJavascriptInterface.startMinerNotification();
                } catch (e: any) {}
            }
        });
    }
});

$.getJSON("https://nodes.anote.digital/addresses/data/3ANmnLHt8mR9c36mdfQVpBtxUs8z1mMAHQW/%25s__adnum", function (data) {
    $("#buttonCode").attr("href", "https://t.me/AnoteToday/" + data.value);
});