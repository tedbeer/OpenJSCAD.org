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
	var r = 20,
		a10 = Math.PI * 2 / 18, //10 deg
		points = [];

	for (var i = 0; i < 36; i++) {
		points.push(new CSG.Vector3D(r * (i + 5) / 20 * Math.sin(a10 * i), r * (i + 5) / 20 * Math.cos(a10 * i), i * 1));
	}

	var spline = new CSG.Spline.CatmullRom(points.slice(3, 15), 1);
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
	}).setColor([1,0,0]));

	angle = 360 / 5;
	var pent = CSG.Polygon.createFromPoints([
					vec,//.rotateZ(0 * angle),
					vec.rotateZ(1 * angle),
					vec.rotateZ(2 * angle),
					vec.rotateZ(3 * angle),
					vec.rotateZ(4 * angle)
					,vec
				]).rotateY(90);

/*	CSG.sphere({
			center: p,
			radius: 1
		})
/*
	var arrow = CSG.cylinder({
		start: [0,0,0],
		end: [0,0,20],
		radius: 0.2
	}).setColor([0,0.5,0.5]).union(CSG.cylinder({
		start: [0,0,20],
		end: [0,0,22],
		radius: 0.35,
		radiusEnd: 0.01
	}).setColor([1,0,0]));

/*
    pent = pent.extrude([0,0,0.1]);
    var pnt, arr = [], l = spline.length(), t=0;
	while(pnt = spline.csgNext(pent, new CSG.Vector3D([0,0,1]))) {
		arr.push(pnt.setColor(hsl2rgb(t/l,1,0.5)));t++;
	}
	return arr;
*/

	var arr = [], mx, axis, center, tmx, nrm;
	var csg = pent.solidFromSlices({
		numslices: spline.length(),
		loop: spline.loop,
		callback: function(t, slice) {
			var t= spline.csgNext(this);
/*
console.log(spline._dbg + '');
console.log('tangent:' + spline.cur.tangent);
/*
 if (slice == 1) {
    axis = spline._dbg.axis;
 } else if (slice >= 2) {
     center = spline._dbg.center,
        degrees = spline._dbg.degrees;
    mx = CSG.Matrix4x4.translation(center).multiply(
    			CSG.Matrix4x4.rotation(center, axis, degrees)
				)

 }
// tmx = CSG.Matrix4x4.translation(spline._dbg.center).multiply(
// 	CSG.Matrix4x4.rotation(spline._dbg.center, axis, degrees)
// );
 t = this.transform(mx || spline._dbg.matrix);
// 	var c =
// 	t = t.rotate( pent)
// }
*/
			arr.push(t.toPointCloud(0.5));
//			arr.push(arrow.transform(spline._dbg.matrix));

			center = t.vertices[0].pos;//spline._dbg.center;
			arr.push(getV(center, spline.cur.tangent.negated(), [0.0,0.0,1.0], [1.0,0.0,0.0]));
			arr.push(getV(center, this.plane.normal, [0.0,1.0,0.0], [0.0,1.0,1.0]));
			arr.push(getV(center, spline._dbg.axis, [1.0,0.5,0.0], [0.0,0.5,0.0], 3));

			return t;
		}
	});
	arr.push(csg.setColor([1,0,0,0.6]));//arr.push(csg);
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