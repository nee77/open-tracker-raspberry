//
const SYS_VERSION = '1.0.1';

const GPS_SERIAL_PORT = '/dev/ttyUSB0';
const GPS_SERIAL_BAUDRATE = 4800;

const token_url = 'https://us-central1-open-tracker-1.cloudfunctions.net/getDeviceToken';
const firebase_config = {
    apiKey: "AIzaSyAk29l93r9IOHDxAr8QerciHI9I6yVJ0Mo",
    authDomain: "open-tracker-1.firebaseapp.com",
    databaseURL: "https://open-tracker-1.firebaseio.com",
    storageBucket: "open-tracker-1.appspot.com",
    messagingSenderId: "4788312663"
};


const firebase = require("firebase");
const https = require('https');
const os = require('os');
const exec = require('child_process').exec;
const SerialPort = require("serialport");
const GPS = require('gps');


// ID устройство берется из переменных окружения
const DEVICE_ID = process.env.OPEN_TRACKER_ID;


// Если ID не обнаружено, то программа завершает работу
if( !DEVICE_ID ){
    console.log('ERR: no device ID');
    process.exit(1);
}

// Инициализируем глобальные переменные
let online = false,
    logged_in = false,
    device_token = null,
    device_token_time = 0,
    firebase_status = 'none',
    gps_status = 'none';

// Полезные данные на выход
let gps_data = {
     last_data_time: 0
    ,time: 0
    ,lat: 0 //
    ,lon: 0 //
    ,alt: 0 //
    ,speed: 0 //
    ,track: 0
    ,sats: 0 //
    ,pdop: 100
    ,vdop: 100
    ,hdop: 100
    ,mag_var: 0
    ,geoidal: 0
    ,quality: 0
};

let system_data = {
    cpu_temp: 0
    ,memory_use: 0
    ,uptime: 0
};


// Инициализируем Firebase
firebase.initializeApp(firebase_config);


// Логин Firebase с помощью одноразового токена
const firebase_token_login = function(){
    firebase_status =  'token login';
    console.log(firebase_status);

    firebase.auth().signInWithCustomToken(device_token).catch(function(error) {
        // TODO Errors
        // auth/invalid-user-token
        // auth/network-request-failed
        // auth/user-token-expired
        firebase_status =  'token login ERROR ' + error;
        console.log(firebase_status);
    });
};


// Функция обращается на сервер и получает токен для устройства
const get_token = function(){
    firebase_status =  'fetching token';
    console.log(firebase_status);
    // загрузить одноразовый токен с сервера через функцию Firebase
    https.get(token_url + '?device_id=' + DEVICE_ID, (res) => {
        if( 200 == res.statusCode ){
            res.on('data', (d) => {
                device_token = d.toString();
                device_token_time = Math.round(new Date().getTime()/1000);
                firebase_status =  'token recevied';
                console.log(firebase_status);
                firebase_token_login();
            });
        }
    })
    // Если не получилось соединиться, попробуем через 10 сек
    .on('error', (e) => {
        firebase_status =  'request token ERROR';
        console.log(firebase_status);
        setTimeout(get_token, 5000);
    });
};


// Авторизация приложения
const app_auth = function(){
    // Если вышло время у токена, попробуем авторизоваться заново
    if( !device_token || device_token_time + 3000 < Math.round(new Date().getTime()/1000) ){
        get_token();
    }
    // Или авторизуемся со старым токеном
    else {
        firebase_token_login();
    }
};


// При изменении авторизации с сервером Firebase
firebase.auth().onAuthStateChanged(function(device) {
    // Устройство подключилось и авторизовалось
    if (device) {
        firebase_status =  'device logged in';
        console.log(firebase_status);
        logged_in = true;

        const ref = firebase.database().ref('devices/' + DEVICE_ID + '/realtime_data/online');
        ref.update({
            status: true,
            time_connected: firebase.database.ServerValue.TIMESTAMP
        });
        ref.onDisconnect().update({
            status: false,
            time_disconnected: firebase.database.ServerValue.TIMESTAMP
        });

    } else {
        firebase_status =  'device logged out';
        console.log(firebase_status);
        logged_in = false;
        app_auth();
    }
});


// Определение статуса соединения с Firebase
firebase.database().ref(".info/connected").on("value", function(snap) {
    if (snap.val() === true) {
        firebase_status =  'device connected';
        console.log(firebase_status);
        online = true;
    } else {
        firebase_status =  'device disconnected';
        console.log(firebase_status);
        online = false;
    }
});


// Сохранение данных в Firebase
const save_to_fb = function(){
    let data_save = {
        device_time: Math.round(+new Date().getTime()/1000)
        ,gps_time: gps_data.time
        ,last_gps_data: gps_data.last_data_time
        ,lat: gps_data.lat
        ,lon: gps_data.lon
        ,speed: gps_data.speed
        ,track: gps_data.track
        ,sats: gps_data.sats
        ,pdop: gps_data.pdop
        ,vdop: gps_data.vdop
        ,hdop: gps_data.hdop
        ,mag_var: gps_data.mag_var
        ,geoidal: gps_data.geoidal
        ,quality: gps_data.quality
        ,cpu_temp: system_data.cpu_temp
        ,memory_use: system_data.memory_use
        ,uptime: system_data.uptime
    };

    firebase.database().ref('devices/' + DEVICE_ID + '/realtime_data/telemetry').set(data_save)
        .then(function(){
            firebase_status =  'data transmitted';
            console.log(firebase_status);
        })
        .catch(function (error) {
            firebase_status =  'data transmition ERROR ' + error;
            console.log(firebase_status);
        });

};


//
// Соединение с GPS
//

const gps = new GPS;

// При поступлении данных в GPS обновляем выходные данные
gps.on('data', data => {

    gps_data.last_data_time = Math.round(new Date().getTime()/1000);
    gps_data.time = gps.state.time;
    gps_data.lat = gps.state.lat;
    gps_data.lon = gps.state.lon;
    gps_data.alt = gps.state.alt;
    gps_data.speed = Math.round(gps.state.speed);
    gps_data.track = Math.round(gps.state.track);

    if( 'GSA' == data.type && data.valid ){
        gps_data.pdop = data.pdop;
        gps_data.vdop = data.vdop;
        gps_data.hdop = data.hdop;
    }

    if( 'GGA' == data.type && data.valid ){
        gps_data.sats = data.satelites;
        gps_data.geoidal = data.geoidal;
        gps_data.quality = data.quality;
    }

    if( 'RMC' == data.type && data.valid ){
        gps_data.mag_var = data.variation;
    }

    gps_status =  'data received, s' + gps_data.sats;

});


//
// Соединение с портом
//
const port = new SerialPort(GPS_SERIAL_PORT, {autoOpen: false, baudrate: GPS_SERIAL_BAUDRATE, parser: SerialPort.parsers.readline('\r\n') });

port.on('open', function(){
    gps_status =  'port opened';
    console.log(gps_status);
    // При поступлении данных в порт обновляем GPS
    port.on('data', function(data) {
        gps.update(data);
    });
});

port.on('disconnect', function(error){
    gps_status =  'port disconnected';
    console.log(gps_status);
    setTimeout(port.open, 5000);
});

port.on('error', function(error){
    gps_status =  'port error ' + error;
    console.log(gps_status);
});

port.on('close', function(error){
    gps_status =  'port closed';
    console.log(gps_status);
});

// Открываем порт для чтения
port.open();

// Главная функция
const heartBeat = function(){
    let gps_active = gps_data.last_data_time + 10 > Math.round(new Date().getTime()/1000);

    if( !gps_active ){
        gps_data.quality = 'no';
        gps_data.sats = 0;
    }

    if( online ){
        save_to_fb();
    }

    console.log('FB: ' + firebase_status + ', GPS: ' + gps_status );

};

setInterval(heartBeat, 1000);


const reconnect5m = function(){
    if( !logged_in ) app_auth();

    let gps_active = gps_data.last_data_time + 3*60 > Math.round(new Date().getTime()/1000);

    if( !gps_active ){
        port.close();
    }

    if( !port.isOpen() ){
        port.open();
    }

};

setInterval(reconnect5m, 5*60*1000);


//
// Каждые 10 секунд меряем температуру
setInterval(function(){
    let child = exec("cat /sys/class/thermal/thermal_zone0/temp", function (error, stdout, stderr) {
        if (error !== null) {
            console.log('exec error: ' + error);
        }
        else {
          system_data.cpu_temp = Math.round(parseFloat(stdout)/1000);
        }
    });
}, 10000);

//
// Каждые 5 секунд меряем память
setInterval(function () {
    let total = os.totalmem();
    let free = os.freemem();
    // uptime:
    // networkInterfaces:
    // loadavg:os.
    //

    system_data.memory_use = Math.round((total-free)/total*100);
    system_data.uptime = os.uptime();

}, 1000);
