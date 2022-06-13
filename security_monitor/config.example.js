var wifiInterface = 'put the wifi interface to put in monitor mode here';

// if true the system will trigger notifications for unknown IPv4 and IPv6 endpoints
var notifyUknownEndpoints = true;
// if true the system will trigger notifications for rogue WiFi access points
var notifyRogueAPs = true;
// if true the system will trigger notifications for WiFi deauthentication frames
var notifyDeauth = true;
// if true the system will trigger notifications for captured WiFi handshakes
var notifyHandshakes = true;
// if true the system will trigger notifications for IPv4 and IPv6 gateway changes
var notifyGatewayChanges = true;

// if true notifications will be sent to the specified telegram chat
var telegramEnabled = true;
var telegramToken = 'put your telegram bot token here';
var telegramChatId = 'put your telegram chat id here';

var weixinEnabled = false;
var weixinToken = 'put your weixin server jiang token here';

// network and wifi endpoints are persisted on this file in order to 
// detect known and unknown ones
var dbPath = '~/bettercap-security-monitor-database.json';