var fs = require('fs');
var request = require('request');
var gm = require('gm').subClass({ imageMagick: true });
var face_detect = require('face-detect');
var Canvas = require('canvas')
  , Image = Canvas.Image
  , canvas = new Canvas(200, 200)
  , ctx = canvas.getContext('2d');

var express = require('express');
var app = express();

var server = app.listen(3000, function () {

	var host = server.address().address;
	var port = server.address().port;

	console.log('Example app listening at http://%s:%s', host, port);

});

// For detecting keyboard input
process.stdin.setRawMode(true);
process.stdin.resume();

var imgNum = 0;
var imgName = 'img.jpg';

console.log('Press a key to take picture');

process.stdin.on('data', function(data) {
	console.log("Key pressed");
	if (data['0'] == 3) {
		// CTRL + C
		process.exit(0);
	}
	console.log("Sending!");
	loadImage('http://:safecloud@10.31.138.209/image.jpg', function(image) {
		fs.writeFileSync(imgName, image);

		fs.readFile('img.jpg', function(err, photo){
			if (err) throw err;
			var img = new Image;
			img.src = photo;
			ctx.drawImage(img, 0, 0, img.width / 4, img.height / 4);
			var result = face_detect.detect_objects({ "canvas" : canvas,
			  "interval" : 5,
			  "min_neighbors" : 1 });

			console.log('Found ' + result.length  + ' faces.');

			if (result.length > 0) {
				var faceObj = result[0];
				gm(imgName)
				.stroke('red')
				.fill('none')
				.drawRectangle(faceObj.x * 4,
							   faceObj.y * 4,
							   (faceObj.x + faceObj.width) * 4,
							   (faceObj.y + faceObj.height) * 4)
				.write(imgName, function(err) {
					console.log(err ? "Error writing rect to image: " + err : "Success writing image");
					if (!err) {
						// Add express route to this image
						console.log("Adding route: /"+imgName);
						app.get('/'+imgName, function (req, res) {
							res.sendfile(imgName);
						});
					}
				});
			}
			console.log("Press key to take another photo");
		});
	});
});

/* From: https://stackoverflow.com/questions/11280063/get-image-from-another-domain-and-encode-base64-by-node-js */
function loadImage(url, callback) {
    console.log("Attempting request to: " + url);

    // Make request to our image url
    request({url: url, encoding: null}, function (err, res, body) {
    	console.log("Heard back from: " + url);
    	if (!err && res.statusCode == 200) {
            if (typeof callback == 'function') {
            	callback(body);
            }
        } else {
        	console.log(err);
        	console.log("ERROR!");
        }
    });
}