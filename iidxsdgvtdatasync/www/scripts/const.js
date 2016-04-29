// 定数
var _LOG_DEBUG_ = 0;
var _LOG_INFORMATION_ = 1;
var _LOG_WARNING_ = 2;
var _LOG_ERROR_ = 3;

var _STOP_ = 0;
var _RUNNING_ = 1;
var _COMPLETE_ = 2;
var _ERROR_ = 9;

var konami = "konami";
var sdgvt = "sdgvt";

var baseurl = {
    konami: "http://p.eagate.573.jp/game/2dx/",
    sdgvt: "http://felice.dip.jp/"
}
var targeturl = {
    konami: baseurl[konami] + "23/",
    sdgvt: baseurl[sdgvt] + "iidxac23/"
}

var _VERSION_ = 23;

var _GET_INTERVAL_ = 200;
var _NETWORK_TIMEOUT_ = 60000;

var _ADMOB_DEFAULT_ = "ca-app-pub-8045595074870452/1482327555";

var clearlamp = {
    "FULL COMBO": 7,
    "EX HARD CLEAR": 6,
    "HARD CLEAR": 5,
    "ASSIST CLEAR": 4,
    "EASY CLEAR": 3,
    "FAILED": 2,
    "CLEAR": 1,
    "NO PLAY": 0
};

Date.prototype.toString = function () {
    var text = "" + this.getFullYear() + "/";

    if ((this.getMonth() + 1) < 10) {
        text += "0";
    }
    text += ("" + (this.getMonth() + 1) + "/");
    if (this.getDate() < 10) {
        text += "0";
    }
    text += ("" + this.getDate() + " ");

    if (this.getHours() < 10) {
        text += "0";
    }
    text += ("" + this.getHours() + ":");
    if (this.getMinutes() < 10) {
        text += "0";
    }
    text += ("" + this.getMinutes() + ":");
    if (this.getSeconds() < 10) {
        text += "0";
    }
    text += ("" + this.getSeconds());

    return text;
}


