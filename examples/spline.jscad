// Catmull-Rom Splines http://steve.hollasch.net/cgindex/curves/catmull-rom.html

function main(params) {
	var r = 20,
		a10 = Math.PI * 2 / 18, //10 deg
		points = [];

	for (var i = 0; i < 36; i++) {
		points.push(new CSG.Vector3D(r * (i + 5) / 20 * Math.sin(a10 * i), r * (i + 5) / 20 * Math.cos(a10 * i), i * 1));
	}
/* celtic ring control points
	points =
	    [
	    [0,     0,  1, 1],   //over across the middle
	    [10,  10, -1, 0],  //under the first cross
	    [20,  20,  1, 1],   //over the second cross
	//  [30,  24,  0, 0],   //curving into the corner
	    [39,  27.25,  0, 1],   // the sharp corner
	//  [32,  12,  0, 0],
	    [30,  10, -1, 0],
	//  [28,  8,   0, 0],
	    [20,  3.75,   0, 0],  // bottom of loop under the corner
	    [10,  10,  1, 1],
	    [4,   20,  0, 0], // grand curve near the sharp corner (under the long arc)
	////    [6,   26,  0, 0],
	//  [8,   28,  0, 0],
	    [10,  30, -1, 0],
	    [24,  34,  0, 0],
	//  [30,  35,  0, 0], // top of the long arc
	    [40,  34,  0, 0],
	    [50,  30,  1, 1], // about where the long arc crosses over
	//  [58,  22,  0, 0],
	    [60,  20, -1, 0],
	    [70,  10,  1, 1],
	    [75,  5,  0, 0],
	    [80,  0,  -1, 0]
	//  [79.9, .1, -1, 0]   // under the middle (2 cycles right)
	//  [79.95, .05, -1, 0]   // under the middle (2 cycles right)
	].map(function(arr){
		return new CSG.Vector3D(arr[0], arr[1], arr[2]);
	});
*/
	//make a loop
	points.push(new CSG.Vector3D(points[0].x, points[0].y, 35));
	points.push(new CSG.Vector3D(points[0].x, points[0].y, 18));
	points.push(new CSG.Vector3D(points[0].x, points[0].y, 0));

	var spline = new CSG.Spline.CatmullRom(points, 2);
window.spline = spline;
/*
	var arrow = CSG.cylinder({
		start: [0,0,0],
		end: [0,0,30],
		radius: 0.1
	}).setColor([0,0.5,0.5]).union(CSG.cylinder({
		start: [0,0,30],
		end: [0,0,32],
		radius: 0.3,
		radiusEnd: 0.01
	}).setColor([1,0,0]));

	var pnt, arr = [];
	while(pnt = spline.csgNext(arrow, new CSG.Vector3D([0,0,1]))) {
		arr.push(spline._key == 38 ? pnt.setColor([0,0,1]) : pnt);
	};
	return arr;
*/
	var radius = 50,
		height = 60,
		vec = new CSG.Vector3D(0, 5, 0),
		angle;

	angle = 360 / 5;
	var pent = CSG.Polygon.createFromPoints([
					vec,//.rotateZ(0 * angle),
					vec.rotateZ(1 * angle),
					vec.rotateZ(2 * angle),
					vec.rotateZ(3 * angle),
					vec.rotateZ(4 * angle)
				]);

	var ccc = CSG.cylinder({
			start: new CSG.Vector3D(points[0].x, points[0].y, 36),
			end: new CSG.Vector3D(points[0].x, points[0].y, 38),
			radius: 2
		});

	return pent.solidFromSlices({
		numslices: spline.length(),
		loop: spline.loop,
		callback: function(t, slice) {
			return spline.csgNext(this);
		}
	});
}