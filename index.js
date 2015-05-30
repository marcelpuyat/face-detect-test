var fs = require('fs');
var gm = require('gm');
var face_detect = require('face-detect');
var Canvas = require('canvas')
  , Image = Canvas.Image
  , canvas = new Canvas(200, 200)
  , ctx = canvas.getContext('2d');

var imgName = 'img.jpg';

fs.readFile(imgName, function(err, photo){
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
		.write("with_rect.jpg", function(err) {
			console.log(err ? "Error writing rect to image: " + err : "Success writing image");
		});
	}
});