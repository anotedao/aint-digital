import { Signer } from '@waves/signer';
import { ProviderSeed } from '@waves/provider-seed';
// import Alpine from 'alpinejs'
import 'bootstrap'
import "bootswatch/dist/slate/bootstrap.min.css";
import '@fortawesome/fontawesome-free/css/all.css'
import anime from 'animejs/lib/anime.es.js';
import $ from "jquery";
import {manifest, version} from '@parcel/service-worker';
import copy from 'copy-to-clipboard';

// window.Alpine = Alpine
// Alpine.start();

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

var isMiningScreen = false;
var address = localStorage.getItem("address");
var seed = localStorage.getItem("seed");
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
var isServiceMining = urlParams.get('run') == 'true';
var mobileNodeUrl = "https://mobile.anote.digital";
var captchaId = "";

var nativeApp = false;
var update = false;
var countdownStarted = false;
var version = 'v1.0-beta2';
var has_telegram = false;

if (urlParams.get('app') == 'true') {
    nativeApp = true;
}

if (urlParams.get('v') != version) {
    update = true;
}

if (address && address.length > 0 && address.startsWith("3A")) {
    $("#seed").val(seed);

    $("#telegramLink").attr("href", "https://t.me/AnoteRobot?start=" + address);

    $.getJSON("https://mobile.anote.digital/miner/" + address, function(data) {
        has_telegram = data.has_telegram;

        console.log(has_telegram);

        loadMinerData();

        setRefLink();
    });

    try {
        MyJavascriptInterface.saveAddress(address);
    } catch (e: any) {}
} else {
    $("#mainView").hide();
    $("#backButton").hide();
    $("#profileView").show();
}

function setRefLink() {
    var ref = address;
    $.getJSON("https://node.anote.digital/alias/by-address/" + address, function (data) {
        if (data.length > 0) {
            var alias = String(data[0]).replace("alias:7:", "");
            ref = alias;
        }

        $("#refLink").val("https://anote.one/mine?r=" + ref);
    });

    $.getJSON("https://mobile.anote.digital/miner/" + address, function(data) {
        $("#ref").html(data.referred);
        $("#refa").html(data.active);
    });
}

function loadMinerData() {
    $.getJSON("https://node.anote.digital/node/status", function (data) {
        var currentHeight = data.blockchainHeight;
        $.getJSON("https://node.anote.digital/addresses/data/3ANzidsKXn9a1s9FEbWA19hnMgV9zZ2RB9a?key=" + address, function (data) {
            if (data.length > 0) {
                var miningData = data[0].value;
                var mdSplit = miningData.split("__")

                if (mdSplit.length >= 2) {
                    var miningHeight = parseInt(miningData.split("__")[1]);
                } else {
                    var miningHeight = 0;
                }

                if (currentHeight - miningHeight <= 1410 && isServiceMining){
                    isMiningScreen = true;
                    startMiner();

                    if (has_telegram) {
                        $("#mainView").fadeIn();
                    } else {
                        $("#profileButton").hide();
                        $("#telegramView").fadeIn();
                        checkTelegram();
                    }

                    if (!nativeApp) {
                        startMiningWeb();
                    } else {
                        console.log("starting miner");
                        try {
                            MyJavascriptInterface.startMiner();
                        } catch (e: any) {}
                    }
                } else if (currentHeight - miningHeight > 1410) {
                    if (has_telegram) {
                        isMiningScreen = false;
                        $("#mineView").show();
                    } else {
                        $("#profileButton").hide();
                        $("#telegramView").fadeIn();
                        checkTelegram();
                    }
                } else if (!isServiceMining) {
                    if (has_telegram) {
                        isMiningScreen = true;
                        $("#mainView").fadeIn();
                    } else {
                        $("#profileButton").hide();
                        $("#telegramView").fadeIn();
                        checkTelegram();
                    }
                }
            } else {
                if (has_telegram) {
                    isMiningScreen = false;
                    $("#mineView").show();
                } else {
                    $("#profileButton").hide();
                    $("#telegramView").fadeIn();
                    checkTelegram();
                }
            }

            loadHealth();

            updateBlocks();
        });
    });

    $.getJSON(mobileNodeUrl + "/new-captcha/" + address, function (data) {
        $("#captcha-img").attr("src", data.image);
        $("#captcha-img").attr("onclick", "this.src=('" + data.image + "?reload='+(new Date()).getTime())");
        captchaId = data.id;
    });
}

function loadHealth() {
    $.getJSON("https://mobile.anote.digital/health/" + address, function (data) {
        $("#healthProgress").width(data.health + "%");
        $("#healthPercentage").html(data.health);

        $("#healthProgress").removeClass("bg-success");
        $("#healthProgress").removeClass("bg-danger");
        $("#healthProgress").removeClass("bg-warning");

        if (parseInt(data.health) > 66) {
            $("#healthProgress").addClass("bg-success");
        } else if (parseInt(data.health) > 33) {
            $("#healthProgress").addClass("bg-warning");
        } else {
            $("#healthProgress").addClass("bg-danger");
        }

        if (update && !data.updated_app) {
            $("#mainView").hide();
            $("#mineView").hide();
            $("#profileView").hide();
            $("#profileButton").hide();
            $("#updateView").show();
        }
        
        setTimeout(loadHealth, 30000);
    });
}

$("#mineButton").on("click", function() {
    $(this).blur();

    if (isServiceMining) {
        isServiceMining = false;
        stopMiner();

        try {
            MyJavascriptInterface.stopMiner();
        } catch (e: any) {}

        if (!nativeApp) {
            stopMiningWeb();
        }        
    } else {
        isServiceMining = true;
        startMiner()

        try {
            MyJavascriptInterface.startMiner();
        } catch (e: any) {}
    
        if (!nativeApp) {
            startMiningWeb();
        }
    }
});

// $("#stopMiner").on("click", function() {
//     $(this).blur();
//     stopMiner();

//     try {
//         MyJavascriptInterface.stopMiner();
//     } catch (e: any) {}

//     if (!nativeApp) {
//         stopMiningWeb();
//     }
// });

function startMiner() {
    tl.play();
    $("#mineButton > i").removeClass("text-danger");
    $("#mineButton > i").addClass("text-success");
}

function stopMiner() {
    tl.pause();
    $("#mineButton > i").removeClass("text-success");
    $("#mineButton > i").addClass("text-danger");
}

$("#profileButton").on("click", function() {
    if (isMiningScreen) {
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
        if (isMiningScreen) {
            $("#mainView").fadeIn();
        } else {
            $("#mineView").fadeIn();
        }
    });
});

$("#backButtonRef").on("click", function() {
    $("#referralView").fadeOut(function() {
        $("#profileButton").fadeIn();
        $("#mainView").fadeIn();
    });
});

$("#addressButton").on("click", async function() {
    var seed = $("#seed").val();
    if (!seed || seed.length == 0) {
        $("#addressMessage").fadeIn(function() {
            setTimeout(function() {
                $("#addressMessage").fadeOut();
            }, 3000);
        });
    } else {
        var splits = seed.split(" ");
        if (splits.length != 15) {
            $("#addressMessage1").fadeIn(function() {
                setTimeout(function() {
                    $("#addressMessage1").fadeOut();
                }, 3000);
            });
        } else {
            const signer = new Signer({
                NODE_URL: 'https://node.anote.digital',
            });
            const provider = new ProviderSeed(seed.toString());
            provider.connect({
                NODE_URL: 'https://node.anote.digital',
                NETWORK_BYTE: 55,
            });
            signer.setProvider(provider);
            var user = await signer.login();
            address = user.address;
    
            localStorage.setItem("seed", seed);
            localStorage.setItem("address", address);

            $("#telegramLink").attr("href", "https://t.me/AnoteRobot?start=" + address);

            $("#profileView").fadeOut(function() {
                $.getJSON("https://mobile.anote.digital/miner/" + address, function(data) {
                    has_telegram = data.has_telegram;

                    if (has_telegram) {
                        $("#backButton").show();
                        loadMinerData();
                    } else {
                        $("#profileButton").hide();
                        $("#telegramView").fadeIn();
                        checkTelegram();
                    }
                });
            });
            try {
                MyJavascriptInterface.saveAddress(address);
            } catch (e: any) {}
        }
    }
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
                $("#errorMessage").html("Captcha code is wrong, please try again.");
                $("#errorMessage").fadeIn(function () {
                    setTimeout(function () {
                        $("#errorMessage").fadeOut();
                    }, 500);
                });
                $("#captcha-img").click();
                navigator.vibrate(500);
            } else if (data.error == 2) {
                $("#errorMessage").html("Mining code is wrong, please try again.");
                $("#errorMessage").fadeIn(function () {
                    setTimeout(function () {
                        $("#errorMessage").fadeOut();
                    }, 500);
                });
                $("#captcha-img").click();
                navigator.vibrate(500);
            } else if (data.error == 3) {
                $("#errorMessage").html("An error happened. Please try again!");
                $("#errorMessage").fadeIn(function () {
                    setTimeout(function () {
                        $("#errorMessage").fadeOut();
                    }, 5000);
                });
                $("#captcha-img").click();
                navigator.vibrate(500);
            } else if (data.error == 4) {
                $("#errorMessage").html("Sorry, there are too many miners on a single Internet connection.");
                $("#errorMessage").fadeIn(function () {
                    setTimeout(function () {
                        $("#errorMessage").fadeOut();
                    }, 1000);
                });
                navigator.vibrate(500);
            } else if (data.error == 5) {
                $("#errorMessage").html("There is something wrong with your address. Copy it from anote.one wallet (green button).");
                $("#errorMessage").fadeIn(function () {
                    setTimeout(function () {
                        $("#errorMessage").fadeOut();
                    }, 1000);
                });
                navigator.vibrate(500);
            } else if (data.success) {
                isMiningScreen = true;
                $("#cycleProgress").width("0%");
                updateBlocks();
                if (isServiceMining) {
                    startMiner();
                    $("#mineView").fadeOut(function () {
                        $("#mainView").fadeIn();
                        navigator.vibrate(1000);
                    });
    
                    try {
                        MyJavascriptInterface.startMinerNotification();
                    } catch (e: any) {}
                } else {
                    startMiner();

                    $("#mineView").fadeOut(function () {
                        $("#mainView").fadeIn();
                        navigator.vibrate(1000);
                    });

                    if (!nativeApp) {
                        startMiningWeb();
                    } else {
                        console.log("starting miner");
                        try {
                            MyJavascriptInterface.startMiner();
                        } catch (e: any) {}
                    }
                }
            }
        });
    }
});

$("#referralButton").on("click", function() {
    $("#profileButton").fadeOut();
    $("#mainView").fadeOut(function() {
        $("#referralView").fadeIn();
    });
});

$("#refCopyButton").on("click", function() {
    var link = $("#refLink").val();
    copy(String(link));
    $("#copyMessage").fadeIn(function () {
        setTimeout(function () {
            $("#copyMessage").fadeOut();
        }, 500);
    });
});

$.getJSON("https://node.anote.digital/addresses/data/3ANmnLHt8mR9c36mdfQVpBtxUs8z1mMAHQW/%25s__adnum", function (data) {
    $("#buttonCode").attr("href", "https://t.me/AnoteToday/" + data.value);
});

var interval;

function startMiningWeb() {
    interval = setInterval(function() {
        $.getJSON("https://mobile.anote.digital/mine/" + address, function (data) {
            console.log(data);
        });
    }, 60000);
}

function stopMiningWeb() {
    clearInterval(interval);
}

function startCountdown(seconds) {
    if (!countdownStarted) {
        countdownStarted = true;
        setInterval(function () {
            var countdown = "~ ";
            seconds--;
            var hours = Math.floor(seconds / 60 / 60);
            if (hours < 10) {
                countdown += "0";
            }
            countdown += hours + ":";
            var minutes = Math.floor(seconds / 60) % 60;
            if (minutes < 10) {
                countdown += "0";
            }
            countdown += minutes + ":";
            var sec = seconds % 60;
            if (sec < 10) {
                countdown += "0";
            }
            countdown += sec;
            $("#countdown").html(countdown);
        }, 1000);
    }
}

function updateBlocks() {
    $.getJSON("https://node.anote.digital/node/status", function (data) {
        var currentHeight = data.blockchainHeight;
        $.getJSON("https://node.anote.digital/addresses/data/3ANzidsKXn9a1s9FEbWA19hnMgV9zZ2RB9a?key=" + address, function (data) {
            if (data.length > 0) {
                var miningData = data[0].value;
                var mdSplit = miningData.split("__")
                if (mdSplit.length >= 2) {
                    var miningHeight = parseInt(miningData.split("__")[1]);
                } else {
                    var miningHeight = 0;
                }
                if (currentHeight - miningHeight <= 1410) {
                    var blocks = 1410 - currentHeight + miningHeight;
                    var cycle = (currentHeight - miningHeight) / 1410 * 100;
                    $("#cycleProgress").width(cycle + "%");
                    $("#blocks").html(blocks?.toString());
                    setTimeout(updateBlocks, 60000);
                    var seconds = blocks * 60;
                    startCountdown(seconds);
                }
            }
        });
    });
}

function checkTelegram() {
    $.getJSON("https://mobile.anote.digital/miner/" + address, function(data) {
        has_telegram = data.has_telegram;

        if (has_telegram) {
            $("#profileButton").fadeIn();
            loadMinerData();
        } else {
            setTimeout(checkTelegram, 5000);
        }
    });
}