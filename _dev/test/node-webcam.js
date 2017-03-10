var NodeWebcam = require( "node-webcam" );


//Default options

var opts = {

    width: 320,

    height: 240,

    delay: 0,

    quality: 50,

    output: "jpeg",

    verbose: true

};

//var Webcam = NodeWebcam.create( opts );
var FSWebcam = NodeWebcam.FSWebcam;
var Webcam = new FSWebcam( opts );


//Will automatically append location output type

Webcam.capture( "test_picture3.jpg" );