// generate a 'L' shape

var vertices = [
	// front
	0.0,	0.0,	0.0,
	0.0,	1.0,	0.0,
	0.25,	1.0,	0.0,
	0.25,	0.0,	0.0,
	0.25,	0.25,	0.0,
	0.75,	0.25,	0.0,
	0.75,	0.0,	0.0,

	// left -- index 7
	0.0,	0.0,	0.0,
	0.0,	1.0,	0.0,
	0.0,	1.0,	-0.25,
	0.0,	0.0,	-0.25,

	// bottom -- index 11
	0.0,	0.0,	0.0,
	0.0,	0.0,	-0.25,
	0.75, 0.0,	0.0,
	0.75,	0.0,	-0.25,

	// right -- index 15
	0.75, 0.0,	0.0,
	0.75,	0.0,	-0.25,
	0.75, 0.25, 0.0,
	0.75, 0.25, -0.25,

	// tail top -- index 19
	0.75, 0.25, 0.0,
	0.75, 0.25, -0.25,
	0.25, 0.25, 0.0,
	0.25, 0.25, -0.25,

	// shaft right -- index 23
	0.25, 0.25, 0.0,
	0.25, 0.25, -0.25,
	0.25, 1.0, 0.0,
	0.25, 1.0, -0.25,

	// top -- index 27
	0.0, 1.0, 0.0,
	0.0, 1.0, -0.25,
	0.25, 1.0, 0.0,
	0.25, 1.0, -0.25,

	// back -- index 31
	0.0,	0.0,	-0.25,
	0.0,	1.0,	-0.25,
	0.25,	1.0,	-0.25,
	0.25,	0.0,	-0.25,
	0.25,	0.25,	-0.25,
	0.75,	0.25,	-0.25,
	0.75,	0.0,	-0.25
]

var indices = [
	// front
	0,  1,  2,
	0,  2,  3,
	3,  4,  5,
	3,  5,  6,
	// left
	7,  8,  9,
	7,  9,  10,
	// bottom
	11, 12, 13,
	12, 13, 14,
	// right
	15, 16, 17,
	16, 17, 18,
	// tail top
	19, 20, 21,
	20, 21, 22,
	// shaft right
	23, 24, 25,
	24, 25, 26,
	// top
	27, 28, 29,
	28, 29, 30,
	// back
	31, 32, 33,
	31, 33, 34,
	34, 35, 36,
	34, 36, 37
];

var normals = [];
// front
for (var i = 0; i < 7; i++) normals = normals.concat([0.0,0.0,1.0]);
// left
for (var i = 0; i < 4; i++) normals = normals.concat([-1.0,0.0,0.0]);
// bottom
for (var i = 0; i < 4; i++) normals = normals.concat([0.0,-1.0,0.0]);
// right
for (var i = 0; i < 4; i++) normals = normals.concat([1.0,0.0,0.0]);
// tail top
for (var i = 0; i < 4; i++) normals = normals.concat([0.0,1.0,0.0]);
// shaft right
for (var i = 0; i < 4; i++) normals = normals.concat([1.0,0.0,0.0]);
// top
for (var i = 0; i < 4; i++) normals = normals.concat([0.0,1.0,0.0]);
// back
for (var i = 0; i < 7; i++) normals = normals.concat([0.0,0.0,-1.0]);

var colors = [];
// front
for (var i = 0; i < 7; i++) colors = colors.concat([1.0,0.0,0.8,1.0]);
// left
for (var i = 0; i < 4; i++) colors = colors.concat([0.0,0.7,0.9,1.0]);
// bottom
for (var i = 0; i < 4; i++) colors = colors.concat([0.0,0.7,0.9,1.0]);
// right
for (var i = 0; i < 4; i++) colors = colors.concat([0.0,0.7,0.9,1.0]);
// tail top
for (var i = 0; i < 4; i++) colors = colors.concat([0.0,0.7,0.9,1.0]);
// shaft right
for (var i = 0; i < 4; i++) colors = colors.concat([0.0,0.7,0.9,1.0]);
// top
for (var i = 0; i < 4; i++) colors = colors.concat([0.0,0.7,0.9,1.0]);
// back
for (var i = 0; i < 7; i++) colors = colors.concat([0.5,0.8,0.2,1.0]);

module.exports = {
	vertices: vertices,
	indices: indices,
	normals: normals,
	colors: colors
}
