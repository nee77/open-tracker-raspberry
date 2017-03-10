const NodeWebcam = require( "node-webcam" );
const fs = require("fs");


const webcam_opts = {
    width: 352,
    height: 288,
    delay: 0,
    quality: 50,
    output: "jpeg",
    verbose: true,
    setValues: '-F 2'
};


//const Webcam = NodeWebcam.create( webcam_opts ); // прямая работа с камерой
const FSWebcam = NodeWebcam.FSWebcam; // или через приложение fswebcam (apt-get install fswebcam)
const Webcam = new FSWebcam(webcam_opts);

//
// Каждую секунду сохраняем картинку
const save_image = function(){
    let filename = '/media/usb/DCIM/' + Math.floor(+new Date()/1000) + '.jpg';

    // Проверить есть ли флешка и можно ли туда записать файл
    let time_start = +new Date();
    try {
        // Сохранить картинку на диск
        Webcam.capture(filename, function( err, data ) {
            console.log( err ? 'error saving file' : filename + ' created' );
            console.log('finished in ' + (+new Date() - time_start) + ' ms');
        });
    }
    catch (e){
        console.log(e);
    }

};

setInterval(save_image, 1000);


//
// Каждую секунду сохраняем покзания GPS
const save_gps_data = function(){

};

setInterval(save_gps_data, 1000);
