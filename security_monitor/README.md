This bettercap session script performs the following tasks:

* Detects WiFi rogue access points / KARMA attack.
* Detects WiFi deauthentication frames.
* Detects handshakes and WPA key material.
* Detects IPv4 and IPv6 gateway changes for possible MITM attacks.

All these events are reported via telegram to a bot you can configure by:

    cp config.example.js config.js
    vi config.js # set your configuration data here