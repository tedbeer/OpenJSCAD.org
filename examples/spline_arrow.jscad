// Catmull-Rom Splines http://steve.hollasch.net/cgindex/curves/catmull-rom.html

function rad2deg(rad) {
	return (rad / Math.PI) * 180;
}
var a10 = Math.PI * 2 * 10 / 360; //10 deg
function getPoint(ind, r) {
 return new CSG.Vector3D(r * Math.sin(a10 * ind), r * Math.cos(a10 * ind), 0);
}
function main(params) {
	var arrowZ = CSG.cylinder({
		start: [0,0,0],
		end: [0,0,10],
		radius: 0.2
	}).setColor([0,0,1]).union(CSG.cylinder({
		start: [0,0,10],
		end: [0,0,12],
		radius: 0.35,
		radiusEnd: 0.01
	}).setColor([1,0,0]));

	var norms = {
		X: new CSG.Vector3D([1,0,0]),
		Y: new CSG.Vector3D([0,1,0]),
		Z: new CSG.Vector3D([0,0,1]),
		XY: (new CSG.Vector3D([1,1,0])).unit(),
		XZ: new CSG.Vector3D([1,0,1]).unit(),
		YZ: new CSG.Vector3D([0,1,1]).unit(),
		XYZ: new CSG.Vector3D([1,1,1])//.unit()
	}, arrows = {
		X: arrowZ.rotateY(90).setColor([1,0,0]),
		Y: arrowZ.rotateX(-90).setColor([0,1,0]),
		Z: arrowZ,
		XY: arrowZ.rotateY(90).rotateZ(45).setColor([1,1,0]),
		XZ: arrowZ.rotateY(45).setColor([1,0,1]),
		YZ: arrowZ.rotateX(-45).setColor([0,1,1]),
		XYZ: arrowZ.rotateY(rad2deg(Math.acos(Math.sqrt(1/3)))).rotateZ(45).setColor([0.4,0.5,0.7])
	};

	//return [arrow.X, arrow.Y, arrow.Z, arrow.XY, arrow.XZ, arrow.YZ, arrow.XYZ];

	var r = 20,
		points = [];
	for (var i = -1; i < 30; i++) {
		points.push(getPoint(i, r));
	}
	//points.push(points[0]);


/*	return points.map(function(p){
		return CSG.sphere({
			center: p,
			radius: 1
		});
	});
*/
	var steps = 1,
		r2 = r*3,
		centers = [
			[-r2, -r2, 0],
			[0, -r2, 0],
			[r2, -r2, 0],

			[-r2, 0, 0],
			[0, 0, 0],
			[r2, 0, 0],

			[-r2, r2, 0],
			[0, r2, 0],
			[r2, r2, 0]
		],
		spline = {
			X: new CSG.Spline.CatmullRom(points.map(function(p){return p.rotateY(90)}), steps),
			Y: new CSG.Spline.CatmullRom(points.map(function(p){return p.rotateX(-90)}), steps),
			Z: new CSG.Spline.CatmullRom(points, steps),
			XY: new CSG.Spline.CatmullRom(points.map(function(p){return p.rotateY(90).rotateZ(45)}), steps),
			XZ: new CSG.Spline.CatmullRom(points.map(function(p){return p.rotateY(45)}), steps),
			YZ: new CSG.Spline.CatmullRom(points.map(function(p){return p.rotateX(-45)}), steps),
			XYZ: new CSG.Spline.CatmullRom(points.map(function(p){return p.rotateY(45).rotateZ(-45)}), steps)
	};
window.spline = spline;
window.arrows = arrows;
	var pnt, arr = [],
		all = ['X', 'Y', 'Z', 'XY', 'XZ', 'YZ', 'XYZ'],
		//all = ['XY'],//, 'YZ', 'XYZ'],
		csgInd = 'XZ',
		color = [0,0,0],
		pos = 0, center,
		arrow = arrows[csgInd],
		norm = norms[csgInd];

	for(var a = 0, aMax = all.length; a < aMax; a++) {
		arrow = arrows[all[a]];
		norm = norms[all[a]];
		center = centers[pos];
		//console.log(all[a], center);
		arr.push(arrow.translate(center))
		for(var s = 0, sMax = all.length; s < sMax; s++) {
			color = hsl2rgb(s/sMax, 1, 0.5);
			while(pnt = spline[all[s]].csgNext(arrow, norm)) {
				arr.push(pnt.translate(center).setColor(color));
			}
			spline[all[s]].reset();
		}
		pos++;
	}
/*
	arr.push(arrow.setColor(hsl2rgb(0, 1, 0.5)));
	csg = CSG.cylinder({
	 start: [0,0,0],
	 end: norm.times(5),
	 radius: 0.4
	 }).setColor([0,0,1]);
	arr.push(csg);

	while(pnt = spline.X.csgNext(arrow, norm)) {
			arr.push(pnt);//.setColor(hsl2rgb(i/iMax, 1, 0.5))
	}
	while(pnt = spline.Y.csgNext(arrow, norm)) {
		arr.push(pnt);
	}
	while(pnt = spline.Z.csgNext(arrow, norm)) {
		arr.push(pnt);
	}
*/
	return arr;
}