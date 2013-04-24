// Catmull-Rom Splines http://steve.hollasch.net/cgindex/curves/catmull-rom.html
function getV(start, dir, c1, c2, coef) {
	return CSG.cylinder({
			start: start,
			end: dir.times(5*(coef||1)).plus(start),
			radius: 0.2
		}).setColor(c1).union(CSG.cylinder({
			start: start,
			end: dir.times(coef||1).plus(start),
			radius: 0.21
		}).setColor(c2 || c1));
}
function main(params) {
	var r = 40,
		a10 = Math.PI * 2 / 18, //10 deg
		points = [];

	for (var i = 0; i < 36; i++) {
		points.push(new CSG.Vector3D(r * (i + 5) / 20 * Math.sin(a10 * i), r * (i + 5) / 20 * Math.cos(a10 * i), i * 8));
	}

	var spline = new CSG.Spline.CatmullRom(points.slice(0, 10), 1);
//window.spline = spline;

	var radius = 5,
		height = 60,
		vec = new CSG.Vector3D(0, 5, 0),
		angle;

	var arrow = CSG.cylinder({
			start: [0,0,0],
			end: [0,0,20],
			radius: 0.2
		}).setColor([0,0.5,0.5]).union(CSG.cylinder({
			start: [0,0,20],
			end: [0,0,22],
			radius: 0.35,
			radiusEnd: 0.01
		}).setColor([1,0,0])),
		nSides = 5,
		angle = 360 / nSides,
		allP = [vec//.rotateZ(0 * angle),
				,vec.rotateZ(1 * angle)
				,vec.rotateZ(2 * angle)
				,vec.rotateZ(3 * angle)
				,vec.rotateZ(4 * angle)
				,vec
			].slice(0, nSides),
		pent = CSG.Polygon.createFromPoints(allP).rotateY(90).translate([20,20,0]);


	var arr = [CSG.cube({
				center: [0,0,0],
				radius: 1
			}).setColor([0,1,0])], mx, axis, center, tmx, nrm;
	var csg = pent.solidFromSlices({
		numslices: spline.length(),
		loop: spline.loop,
		callback: function(t, slice) {
			var t= spline.csgNext(this);
			arr.push(t.toPointCloud(0.5));

			center = t.vertices[0].pos;//spline._dbg.center;
			arr.push(getV(center, t.plane.normal, [1.0,0.5,0.0], [0.0,0.5,0.0]));

			//arr.push(getV(center, spline.planeTZ.normal, [1.0,0.0,0.0], [0.0,0.5,0.0]));
			//arr.push(getV(center, spline.tangentZ, [1.0,0.0,0.0], [0.0,0.5,0.0]));
			//arr.push(getV(center, spline.planeSZ.normal, [1.0,0.5,1.0], [0.0,0.5,0.0]));
			//arr.push(getV(center, spline.sideZ, [1.0,0.5,1.0], [0.0,0.5,0.0]));

			arr.push(getV(center, t.vertices[1].pos.minus(center), [0.0,1.0,0.0], [0.0,1.0,1.0], 0.3));
			arr.push(getV(center, spline.cur.tangent.negated(), [0.0,0.0,1.0], [1.0,0.0,0.0]));

			return t;
		}
	});
	arr.push(csg.setColor([1,0,0,0.9]));//arr.push(csg);
	arr.push(pent.toPointCloud(0.5));
	return arr;

	var arr=[], solid1 = pent.solidFromSlices({
		numslices: spline.length(),
		loop: spline.loop,
		callback: function(t, slice) {
			var csg = spline.csgNext(this);
			arr.push(arrow.transform(spline.mx));
			return csg;
		}
	});
	arr.unshift(solid1);
	/*
	spline.reset();
	var pnt, arr = [solid1];
	while(pnt = spline.csgNext(arrow, new CSG.Vector3D([0,0,1]))) {
		arr.push(spline._key == 38 ? pnt.setColor([0,0,1]) : pnt);
	};
	*/
	return arr;

	return pent.solidFromSlices({
		numslices: spline.length(),
		loop: spline.loop,
		callback: function(t, slice) {
			return spline.csgNext(
					arrow,
					new CSG.Vector3D([0,0,1])
				).union(spline.csgNext(this, null, spline.current));

			var csg = spline.csgNext(this);
			return csg.union(
				spline.csgNext(
					arrow,
					new CSG.Vector3D([0,0,1]),
					spline.current
				)
			);
		}
	});
}
