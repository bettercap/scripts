function sendMessage(message) {
    if(telegramEnabled) {
        sendTelegramMessage(message);
    }

    if(weixinEnabled) {
        sendWeixinMessage(message);
    }
}

function sendTelegramMessage(message) {
    log(message);

    var url = 'https://api.telegram.org/bot' + telegramToken +
        '/sendMessage?chat_id=' + telegramChatId +
        '&text=' + http.Encode(message);

    var resp = http.Get(url, {});
    if( resp.Error ) {
        log("error while running sending telegram message: " + resp.Error.Error());
    }
}

// credits to @jiyilide https://github.com/bettercap/scripts/pull/1
function sendWeixinMessage(message) {
    log(message);

    var url = 'https://sctapi.ftqq.com/' + weixinToken +
              '.send?' + 'title=bettercap' +
              '&desp=' + http.Encode(message);

    var resp = http.Get(url, {});
    if( resp.Error ) {
        log("error while running sending weixin message: " + resp.Error.Error());
    }
}