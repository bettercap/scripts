var fakeESSID = random.String(16, 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
var fakeBSSID = random.Mac();

// persistent database
var db = {
    endpoints: {},
    aps: {},
};

// load database from file if it exists
if(fileExists(dbPath)) {
    db = loadJSON(dbPath);
    log("database loaded from " + dbPath);

}

// update last_seen timestamp and meta values of a known endpoint
function updateEndpoint(endpoint) {
    var known = db.endpoints[endpoint.mac];

    known.last_seen = endpoint.last_seen;
    for( var name in endpoint.meta.values ) {
        if(!(name in known.meta.values)) {
            known.meta.values[name] = endpoint.meta.values[name];
        }
    }

    db.endpoints[endpoint.mac] = known;
}

// create a new endpoint in the database
function createEndpoint(endpoint) {
    db.endpoints[endpoint.mac] = endpoint;
}

// update last_seen timestamp and meta values of a known access point
function updateAP(ap) {
    var known = db.aps[ap.mac];

    known.last_seen = ap.last_seen;
    for( var name in ap.meta.values ) {
        if(!(name in known.meta.values)) {
            known.meta.values[name] = ap.meta.values[name];
        }
    }

    db.aps[ap.mac] = known;
}

// create a new access point in the database
function createAP(ap) {
    db.aps[ap.mac] = ap;
}

// pretty print mac and vendor when available
function decorateMac(label, mac, vendor) {
    if(vendor.length) {
        return label + ": " + mac + " ( " + vendor + " )";
    } 
    return label + ": " + mac;
}

// pretty print endpoint
function decorateEndpoint(endpoint, padding) {
    var msg = (endpoint.hostname.length ? (padding + "Hostname: " + endpoint.hostname + "\n") : '') +
              (endpoint.ipv4.length ? (padding + "IPv4: " + endpoint.ipv4 + "\n") : '') +
              (endpoint.ipv6.length ? (padding + "IPv6: " + endpoint.ipv6 + "\n") : '') +
              padding + decorateMac("MAC", endpoint.mac, endpoint.vendor) + "\n";

    if( endpoint.meta.values.length > 0 ) {
        msg += "\n" + padding + "Info:\n"; 
        for( var name in endpoint.meta.values ) {
            msg += padding + name + ' : ' + endpoint.meta.values[name] + "\n";
        }
    }

    return msg;
}

// pretty print access point
function decorateAP(ap, padding) {
    var msg = padding + "ESSID: " + ap.hostname + "\n" +
              padding + decorateMac("BSSID", ap.mac, ap.vendor) + "\n";

    if( ap.meta.values.length > 0 ) {
        msg += "\n" + padding + "Info:\n"; 
        for( var name in ap.meta.values ) {
            msg += padding + name + ' : ' + ap.meta.values[name] + "\n";
        }
    }

    return msg;
}

// triggered when a new IPv4 or IPv6 endpoint is detected on the LAN
function onNewEndpoint(event) {
    var endpoint = event.data;
    var msg = null;

    if( endpoint.mac in db.endpoints ){
        log('known endpoint ' + endpoint.mac + ' connected');

        updateEndpoint(endpoint);
    } else {
        var msg = "🚨 Unknown endpoint connected:\n\n" +
                  decorateEndpoint(endpoint, '');
                 
        createEndpoint(endpoint);
    }

    saveJSON(db, dbPath);

    if(notifyUknownEndpoints && msg != null) {
        sendMessage(msg);
    }
}

// triggered when a new WiFi access point is detected
function onNewAP(event){
    var ap = event.data;

    // check fake ap first
    if(ap.hostname == fakeESSID) {
        if(notifyRogueAPs) {
            var message = '🦠 Detected rogue AP:\n\n' +
                          decorateMac('AP', ap.mac, ap.vendor);
            // send to telegram bot
            sendMessage(message);
        }
        return;
    }

    if( ap.mac in db.aps ) {
        updateAP(ap);
    } else {
        createAP(ap);
    }

    saveJSON(db, dbPath);
}

// pretty print a MAC depending if it's an IP endpoint or WiFi access point
function decorateAddress(label, mac) {
    if( mac in db.endpoints ) {
        return label + ":\n" + decorateEndpoint(db.endpoints[mac], '  ');
    } else if( mac in db.aps ) {
        return label + ":\n" + decorateAP(db.aps[mac], '  ');
    } else {
        return label + ': ' + mac + "\n";
    }
}

// triggered when a WiFi deauthentication frame is detected
function onDeauthentication(event) {
    if(notifyDeauth) {
        var data = event.data;

        var message = '🚨 Detected deauthentication frame:\n\n' +
            'RSSI: ' + data.rssi + "\n" +
            'Reason: ' + data.reason + "\n\n" +
            decorateAddress('Address1', data.address1) + "\n" +
            decorateAddress('Address2', data.address2)+ "\n" +
            decorateAddress('Address3', data.address3) + "\n" +
            'AP:\n' + JSON.stringify(data.ap, null, 2);


        // send to telegram bot
        sendMessage(message);
    }
}

// triggered when partial or full handshakes are captured
function onHandshake(event){
    if(notifyHandshakes) {
        var data = event.data;
        var what = 'handshake';

        if(data.pmkid != null) {
            what = "RSN PMKID";
        } else if(data.full) {
            what += " (full)";
        } else if(data.half) {
            what += " (half)";
        }

        var message = '💰 Captured ' + what + ':\n\n' +
            decorateAddress('Station', data.station) + "\n" +
            decorateAddress('AP', data.ap);

        // send to telegram bot
        sendMessage(message);
    }
}

// triggered when an IPv4 or IPv6 gateway change is detected
function onGatewayChange(event) {
    if(notifyGatewayChanges) {
        var change = event.data;

        var message = '🚨 Detected ' + change.type + ' gateway change, possible MITM attack:\n\n' +
            'Prev: ' + change.prev.ip + ' (' + change.prev.mac + ")\n" +
            'New: ' + change.new.ip + ' (' + change.new.mac + ")";

        // send to telegram bot
        sendMessage(message);
    }
}

// triggered periodically, we use this to send a probe for a fake access point in order
// to detect rogue AP attacks
function onTick(event) {
    run('wifi.probe ' + fakeBSSID + ' ' + fakeESSID);
}