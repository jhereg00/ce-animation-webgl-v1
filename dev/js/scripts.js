/**
 *  scripts.js
 *  This should include objects, which in turn include the lib files they need.
 *  This keeps us using a modular approach to dev while also only including the
 *  parts of the library we need.
 */

// requirements
var Matrix = require('lib/math/Matrix');
var Vector = require('lib/math/Vector');

// TODO: make a gl-lite lib

// step 1:
// make a canvas
var canvas = document.createElement('canvas');
canvas.width = window.innerWidth - 50;
canvas.height = window.innerHeight - 100;
document.body.appendChild(canvas);

// step 2:
// prepare the context
function initWebGL (canvas) {
  var gl = null;

  try {
    // try to grab the standard context, fall back to experimental
    gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
  }
  catch (e) {}

  // no context? BAIL!
  if (!gl) {
    console.error('Unable to initialize WebGL. Your browser may not support it.');
    gl = null;
  }

  return gl;
}

var gl = initWebGL (canvas);

// make sure we got it
if (gl) {
  // set the clear color to black, fully opaque
  gl.clearColor(0.0, 0.0, 0.3, 1.0);
	gl.clearDepth(1.0);
  // Enable depth testing
  gl.enable(gl.DEPTH_TEST);
  // Near things obscure far things
  gl.depthFunc(gl.LEQUAL);

  // to update viewport resolution
  gl.viewport(0, 0, canvas.width, canvas.height);
}

// Step 3:
// attach shaders to a program3d (also...make the program3d)
function attachShader (program3d, shaderSrc, type) {
  var shader = gl.createShader(type);
  gl.shaderSource(shader, shaderSrc);
  // compile it
  gl.compileShader(shader);
  // check that it compiled correctly
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));
    return null;
  }
  // attach to the program3d
  return gl.attachShader(program3d, shader);
}
// make program3d
var program3d = gl.createProgram();
attachShader(program3d, document.getElementById('vertex-shader').innerText, gl.VERTEX_SHADER);
attachShader(program3d, document.getElementById('fragment-shader').innerText, gl.FRAGMENT_SHADER);
gl.linkProgram(program3d);
if (!gl.getProgramParameter(program3d, gl.LINK_STATUS)) {
  alert("Unable to initialize the shader program3d: " + gl.getProgramInfoLog(shader));
}
gl.useProgram(program3d);
var vertexPositionAttribute = gl.getAttribLocation(program3d, "aVertexPosition");
gl.enableVertexAttribArray(vertexPositionAttribute);
var vertexColorAttribute = gl.getAttribLocation(program3d, "aVertexColor");
gl.enableVertexAttribArray(vertexColorAttribute);

// Step 4:
// make an object
var shapeVerticesBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, shapeVerticesBuffer);
var vertices = [ // we're making an 'l', with 0.0 being the bottom left
	// front
	0.0,	0.0,	0.0,
	0.0,	1.0,	0.0,
	0.25,	1.0,	0.0,
	0.25,	0.0,	0.0,
	0.25,	0.25,	0.0,
	0.75,	0.25,	0.0,
	0.75,	0.0,	0.0,

	// left
	0.0,	0.0,	0.0,
	0.0,	1.0,	0.0,
	0.0,	1.0,	-0.25,
	0.0,	0.0,	-0.25,
	// bottom
	// reuse some from left:
	//  index 7
	//  index 10
	0.75, 0.0,	0.0,
	0.75,	0.0,	-0.25,
	// right
	// reuse some from bottom
	//  index 11
	//  index 12
	0.75, 0.25, 0.0,
	0.75, 0.25, -0.25,
	// tail top
	// reuse some from right
	//  index 13
	//  index 14
	0.25, 0.25, 0.0,
	0.25, 0.25, -0.25,
	// shaft right
	// reuse some from tail top
	//  index 15
	//  index 16
	0.25, 1.0, 0.0,
	0.25, 1.0, -0.25,
	// top
	// reuse shaft right and left
	//  index 17
	//  index 18
	//  index 8
	//  index 9
	// back
	0.0,	0.0,	-0.25,
	0.0,	1.0,	-0.25,
	0.25,	1.0,	-0.25,
	0.25,	0.0,	-0.25,
	0.25,	0.25,	-0.25,
	0.75,	0.25,	-0.25,
	0.75,	0.0,	-0.25
];
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

// bind the indexes of the vertices to create the tris
var shapeVerticesIndexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, shapeVerticesIndexBuffer);

var shapeVertexIndices = [
	// front
	0,	1,	2,
	0,	2,	3,
	3,	4,	5,
	3,	5,	6,
	// left
	7,	8,	9,
	9, 10,  7,
	// bottom
	7, 10, 11,
	10,11, 12,
	// right
	11,12, 13,
	12,13, 14,
	// tail top
	13,14, 15,
	14,15, 16,
	// shaft right
	15,16, 17,
	16,17, 18,
	// top
	17,18,  9,
	17, 9,  8,
	// back
	19,	20,	21,
	19,	21,	22,
	22,	23,	24,
	22,	24,	25
];
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(shapeVertexIndices), gl.STATIC_DRAW);

// colors
var shapeVerticesColorBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, shapeVerticesColorBuffer);
var colors = [
	// front
	1.0, 0.6, 1.0, 1.0,
	1.0, 0.6, 1.0, 1.0,
	1.0, 0.6, 1.0, 1.0,
	1.0, 0.6, 1.0, 1.0,
	1.0, 0.6, 1.0, 1.0,
	1.0, 0.6, 1.0, 1.0,
	1.0, 0.6, 1.0, 1.0,
	// left
	0.3, 0.8, 1.0, 1.0,
	0.3, 0.8, 1.0, 1.0,
	0.3, 0.8, 1.0, 1.0,
	0.3, 0.8, 1.0, 1.0,
	// bottom
	0.3, 0.8, 1.0, 1.0,
	0.3, 0.8, 1.0, 1.0,
	// right
	0.3, 0.8, 1.0, 1.0,
	0.3, 0.8, 1.0, 1.0,
	// tail top
	0.3, 0.8, 1.0, 1.0,
	0.3, 0.8, 1.0, 1.0,
	// shaft right
	0.3, 0.8, 1.0, 1.0,
	0.3, 0.8, 1.0, 1.0,
	// back
	0.0, 0.8, 0.9, 0.66,
	0.0, 0.8, 0.9, 0.66,
	0.0, 0.8, 0.9, 0.66,
	0.0, 0.8, 0.9, 0.66,
	0.0, 0.8, 0.9, 0.66,
	0.0, 0.8, 0.9, 0.66,
	0.0, 0.8, 0.9, 0.66
];
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

//
// gluPerspective
//
function makePerspective(fovy, aspect, znear, zfar)
{
    var ymax = znear * Math.tan(fovy * Math.PI / 360.0);
    var ymin = -ymax;
    var xmin = ymin * aspect;
    var xmax = ymax * aspect;

    return makeFrustum(xmin, xmax, ymin, ymax, znear, zfar);
}

//
// glFrustum
//
function makeFrustum(left, right,
                     bottom, top,
                     znear, zfar)
{
    var X = 2*znear/(right-left);
    var Y = 2*znear/(top-bottom);
    var A = (right+left)/(right-left);
    var B = (top+bottom)/(top-bottom);
    var C = -(zfar+znear)/(zfar-znear);
    var D = -2*zfar*znear/(zfar-znear);

    return new Matrix ([[X, 0, A, 0],
               [0, Y, B, 0],
               [0, 0, C, D],
               [0, 0, -1, 0]]);
}

function makeOrtho(left, right, bottom, top, znear, zfar)
{
    var tx = - (right + left) / (right - left);
    var ty = - (top + bottom) / (top - bottom);
    var tz = - (zfar + znear) / (zfar - znear);

    return Matrix.create([[2 / (right - left), 0, 0, tx],
           [0, 2 / (top - bottom), 0, ty],
           [0, 0, -2 / (zfar - znear), tz],
           [0, 0, 0, 1]]);
}


// temp: no perspective
var aspect = canvas.width / canvas.height;
// makeOrtho(-aspect, aspect, -1, 1, .1, 1);
var perspectiveMatrix = makePerspective(45, aspect, .5, 100.0);
console.log(perspectiveMatrix.inspect());
var orthoMatrix = makeOrtho(-aspect, aspect, -1, 1, .1, 1);
var translateMatrix = Matrix.create.translation3d(new Vector ([0, 0, -3]));

// Step 5:
// set uniforms
var pUniform = gl.getUniformLocation (program3d, 'uPMatrix');
gl.uniformMatrix4fv(pUniform, false, new Float32Array(perspectiveMatrix.flatten()));
var mvUniform = gl.getUniformLocation (program3d, 'uMVMatrix');
// gl.uniformMatrix4fv(mvUniform, false, new Float32Array(mvMatrix.flatten()));

// Step 6:
// draw object
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
gl.bindBuffer(gl.ARRAY_BUFFER, shapeVerticesBuffer);
gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
gl.bindBuffer(gl.ARRAY_BUFFER, shapeVerticesColorBuffer);
gl.vertexAttribPointer(vertexColorAttribute, 4, gl.FLOAT, false, 0, 0);
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, shapeVerticesIndexBuffer);

// draw loop
var rotY = 0;
var rotX = 0;
(function draw () {
	rotY += Math.PI / 180;
	// slide left by half, rotate, then apply translation
	var mvMatrix = Matrix.create.translation3d(new Vector ([-.75/2, -0.5, 0.25/2 - 3]));//.multiply(Matrix.create.rotationY(rotY)).multiply(Matrix.create.rotationX(rotX)).multiply(translateMatrix);
	console.log(mvMatrix.inspect());
	gl.uniformMatrix4fv(mvUniform, false, new Float32Array(mvMatrix.flatten()));
	gl.drawElements(gl.TRIANGLES, shapeVertexIndices.length, gl.UNSIGNED_SHORT, 0);

	//requestAnimationFrame(draw);
})();
canvas.addEventListener('mousemove', function (e) {
	rotX = Math.PI / 180 * 45 * (e.offsetY / canvas.offsetHeight * 2 - 1);
});
