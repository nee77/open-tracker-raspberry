const firebase = require("firebase");
const https = require('https');
const os = require('os');
const exec = require('child_process').exec;


const DEVICE_ID = process.env.OPEN_TRACKER_ID;

// Отсюда отправляются все данные


if( !DEVICE_ID ){
    console.log('no device id');
    process.exit(1);
}

const token_url = 'https://us-central1-open-tracker-1.cloudfunctions.net/getDeviceToken';

const firebase_config = {
    apiKey: "AIzaSyAk29l93r9IOHDxAr8QerciHI9I6yVJ0Mo",
    authDomain: "open-tracker-1.firebaseapp.com",
    databaseURL: "https://open-tracker-1.firebaseio.com",
    storageBucket: "open-tracker-1.appspot.com",
    messagingSenderId: "4788312663"
};


let db = null;


try {
    firebase.initializeApp(firebase_config);

    // TODO определить когда рвется соединение не по причине авторизации

    const init_connection = function(){
        // Авторизация с использованием токена
        // загрузить одноразовый токен с сервера через функцию Firebase
        https.get(token_url + '?device_id=' + DEVICE_ID, (res) => {
            if( 200 == res.statusCode ){
                res.on('data', (d) => {
                    const token = d.toString();
                    //console.log('token', token);
                    //const jsonObject = JSON.parse(d);
                    //console.log('token data', jsonObject);

                    firebase.auth().signInWithCustomToken(token).catch(function(error) {
                        // Errors
                        // auth/invalid-user-token
                        // auth/network-request-failed
                        // auth/user-token-expired
                        console.log('fb auth error', error);
                    });
                });
            }
        })
        // Если не получилось соединиться, попробуем через 10 сек
        .on('error', (e) => {
            console.error('http get error', e);
            setTimeout(init_connection, 5000);
        });
    };


    /*
    //
    // Авторизация анонимная
    firebase.auth().signInAnonymously().catch(function(error) {
        console.log(error);
    });

    // Авторизация ручная с логином и паролем
    firebase.auth().signInWithEmailAndPassword('email', 'password').catch(function(error) {
        console.log(error);
    });
    */



    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            db = firebase.database();
            console.log('user logged in');

            const ref = db.ref('devices/' + DEVICE_ID + '/realtime_data/online');
            ref.update({
                status: true,
                time_connected: firebase.database.ServerValue.TIMESTAMP
            });
            ref.onDisconnect().update({
                status: false,
                time_disconnected: firebase.database.ServerValue.TIMESTAMP
            });

        } else {
            db = null;
            console.log('user not logged in');
            init_connection();
        }
    });

}
catch (e){
    console.log('firebase init error', e);
}

let gps_data = {
     time: 0
    ,lat: 0 //
    ,lon: 0 //
    ,alt: 0 //
    ,speed: 0 //
    ,track: 0
    ,satsActive: 0 //
    ,sats_num: 0 //
    ,satsVisible: 0 //
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


try {

    const SerialPort = require("serialport");

    const port = new SerialPort('/dev/ttyUSB0', {
        baudrate: 4800,
        parser: SerialPort.parsers.readline('\r\n')
    });

    const GPS = require('gps');
    const gps = new GPS;

    gps.on('data', data => {
        gps_data.satsActive = gps.state.satsActive instanceof Array ? gps.state.satsActive.length : 0;

        console.log('data read from ' + gps_data.satsActive + ' sputniks');

        gps_data.time = gps.state.time;
        gps_data.lat = gps.state.lat;
        gps_data.lon = gps.state.lon;
        gps_data.alt = gps.state.alt;
        gps_data.speed = gps.state.speed;
        gps_data.track = gps.state.track;


        if( 'GSA' == data.type && data.valid ){
            gps_data.pdop = data.pdop;
            gps_data.vdop = data.vdop;
            gps_data.hdop = data.hdop;
        }

        if( 'GGA' == data.type && data.valid ){
            gps_data.sats_num = data.satelites;
            gps_data.geoidal = data.geoidal;
            gps_data.quality = data.quality;
        }

        if( 'RMC' == data.type && data.valid ){
            gps_data.mag_var = data.variation;
        }

    });


    port.on('data', function(data) {
      gps.update(data);
    });


    // записать данные в FB
    const save_to_fb = function(){
        if( db ){
            let data_save = {
                device_time: Math.round(+new Date().getTime()/1000)
                ,gps_time: gps_data.time
                ,lat: gps_data.lat
                ,lon: gps_data.lon
                ,speed: gps_data.speed
                ,track: gps_data.track
                ,sats: gps_data.satsActive // проверить на клиенте
                ,satsActive: gps_data.satsActive
                ,satsVisible: gps_data.satsVisible
                ,pdop: gps_data.pdop
                ,vdop: gps_data.vdop
                ,hdop: gps_data.hdop
                ,mag_var: gps_data.mag_var
                ,geoidal: gps_data.geoidal
                ,quality: gps_data.quality
                ,sats_num: gps_data.sats_num
                ,cpu_temp: system_data.cpu_temp
                ,memory_use: system_data.memory_use
                ,uptime: system_data.uptime
            };

            db.ref('devices/' + DEVICE_ID + '/realtime_data/telemetry').set(data_save).then(function(){
                console.log('data saved');
            });

            //db.ref('devices/' + DEVICE_ID + '/gps_data').push(data_save);
        }
    };

    setInterval(save_to_fb, 1000);

    /*
    var connectedRef = firebase.database().ref(".info/connected");
    connectedRef.on("value", function(snap) {
      if (snap.val() === true) {
        alert("connected");
      } else {
        alert("not connected");
      }
    });

    var offsetRef = firebase.database().ref(".info/serverTimeOffset");
    offsetRef.on("value", function(snap) {
      var offset = snap.val();
      var estimatedServerTimeMs = new Date().getTime() + offset;
    });
     */

}
catch (e){
    console.log('serial init error');
    console.log(e);
}


//
// Каждые 5 секунд меряем температуру
setInterval(function(){
    let child = exec("cat /sys/class/thermal/thermal_zone0/temp", function (error, stdout, stderr) {
        if (error !== null) {
            console.log('exec error: ' + error);
        }
        else {
          system_data.cpu_temp = Math.round(parseFloat(stdout)/1000);
        }
    });
}, 5000);

//
// 1 раз в секунду меряем память
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
