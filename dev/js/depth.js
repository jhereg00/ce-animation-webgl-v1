// requirements
var Matrix = require('lib/math/Matrix');
var Vector = require('lib/math/Vector');
var PerspectiveCamera = require('lib/webgl/PerspectiveCamera');
var OrthographicCamera = require('lib/webgl/OrthographicCamera');

// global vars
var vertexPositionAttribute,
		vertexColorAttribute,
		vertexNormalAttribute,
		activeProgram;

// make canvas
var canvas = document.createElement('canvas');
canvas.width = window.innerWidth - 50;
canvas.height = window.innerHeight - 100;
canvasHolder.appendChild(canvas);

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
if (!gl) {
	console.error('failed to init gl');
	return false;
}

// set some default settings
// set the clear color to black, fully opaque
gl.clearColor(0.0, 0.0, 0.3, 1.0);
gl.clearDepth(1.0);
// Enable depth testing
gl.enable(gl.DEPTH_TEST);
// Near things obscure far things
gl.depthFunc(gl.LEQUAL);

// to update viewport resolution
gl.viewport(0, 0, canvas.width, canvas.height);


// functions to make/use programs and shaders
function makeProgram (shaders) {
	var p = gl.createProgram();
	shaders.forEach(function (s) {
		gl.attachShader(p, s);
	});
	gl.linkProgram(p);
	if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
	  alert("Unable to initialize the shader program: " + gl.getProgramInfoLog(shader));
	}

	return p;
}
function useProgram (p) {
	gl.useProgram(p);
	vertexPositionAttribute = gl.getAttribLocation(p, "aVertexPosition");
	gl.enableVertexAttribArray(vertexPositionAttribute);
	if (p !== programOutput) {
		vertexColorAttribute = gl.getAttribLocation(p, "aVertexColor");
		gl.enableVertexAttribArray(vertexColorAttribute);
		vertexNormalAttribute = gl.getAttribLocation(p, 'aVertexNormal');
		gl.enableVertexAttribArray(vertexNormalAttribute);
	}
	activeProgram = p;
}
function makeShader (shaderSrc, type) {
	var shader = gl.createShader(type);
	gl.shaderSource(shader, shaderSrc);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));
    return null;
  }
	return shader;
}

// compile shaders
var shaders = {
	'vertex-shader-3d': makeShader(document.getElementById('vertex-shader-3d').innerText, gl.VERTEX_SHADER),
	'vertex-shader-2d': makeShader(document.getElementById('vertex-shader-2d').innerText, gl.VERTEX_SHADER),
	'fragment-color-shader': makeShader(document.getElementById('fragment-color-shader').innerText, gl.FRAGMENT_SHADER),
	'fragment-depth-shader': makeShader(document.getElementById('fragment-depth-shader').innerText, gl.FRAGMENT_SHADER),
	'fragment-output-shader': makeShader(document.getElementById('fragment-output-shader').innerText, gl.FRAGMENT_SHADER),
	'fragment-shadow-shader': makeShader(document.getElementById('fragment-shadow-shader').innerText, gl.FRAGMENT_SHADER)
}

// make programs
var programColor = makeProgram([shaders['vertex-shader-3d'], shaders['fragment-color-shader']]);
var programDepth = makeProgram([shaders['vertex-shader-3d'], shaders['fragment-depth-shader']]);
var programOutput = makeProgram([shaders['vertex-shader-2d'], shaders['fragment-output-shader']]);
var programShadowMap = makeProgram([shaders['vertex-shader-3d'], shaders['fragment-shadow-shader']]);

// set up shape
var shape = require('objects/l-shape');

// set up shape buffers
var verticesBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(shape.vertices), gl.STATIC_DRAW);
var indicesBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(shape.indices), gl.STATIC_DRAW);
var colorBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(shape.colors), gl.STATIC_DRAW);
var normalBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(shape.normals), gl.STATIC_DRAW);

// 2d buffers
var vertices2dBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertices2dBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
	-1.0, 1.0,
	1.0, 1.0,
	-1.0, -1.0,
	1.0, -1.0
]), gl.STATIC_DRAW);


// set up perspectiveCamera
var perspectiveCamera = new PerspectiveCamera().makePerspective(45, canvas.width/canvas.height, .5, 100.0);
perspectiveCamera.moveTo(Vector.create([1.0, 0.8, 0.9]));
perspectiveCamera.lookAt(Vector.create([0.0, 0, -3]));
// ortho for now
var orthoCamera = new OrthographicCamera().makeOrtho(4, 1, .1, 20);
orthoCamera.moveTo(Vector.create([1.0, 0.8, 0.9]));
orthoCamera.lookAt(Vector.create([0.0, 0, -3]));

// translation matrix
var translateMatrix = Matrix.create.translation3d(new Vector ([0, 0, -3]));

// textures that get rendered to
function createAndSetupTexture() {
	var texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);

	// set up texture so we can render any size image and so we are working with pixels
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

	return texture;
}
var shapeColorTexture = createAndSetupTexture();

// 2 textures we can go back and forth
var textures = [];
var textureSizes = [];
var renderbuffers = [];
var framebuffers = [];
function makeTextureBuffer (width, height) {
	var texture = createAndSetupTexture();
	textures.push(texture);

	width = width || canvas.width;
	height = height || canvas.height;

	textureSizes.push([width, height]);

	// make the texture the same size as the image
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

	// make a renderbuffer for depth
	var rbo = gl.createRenderbuffer();
	gl.bindRenderbuffer(gl.RENDERBUFFER, rbo);
	gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);

	// create a framebuffer
	var fbo = gl.createFramebuffer();
	framebuffers.push(fbo);
	gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);

	// attach a texture
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
	gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, rbo);
	return framebuffers.length - 1;
}
function setBuffer (index) {
	gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffers[index]);
	gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffers[index]);
	//gl.bindTexture(gl.TEXTURE_2D, textures[index]);
	gl.viewport(0, 0, textureSizes[index][0], textureSizes[index][1]);
}

var textureBuffers = {
	COLOR: makeTextureBuffer(),
	DEPTH: makeTextureBuffer(),
	PASS0: makeTextureBuffer(),
	SHADOWMAP: makeTextureBuffer(2048, 2048)
}
var currentPass = 0;

var worldMatrix1 = Matrix.create.translation3d(Vector.create([0, -.5, 0]));
var worldMatrix2 = Matrix.create.rotationZ(Math.PI / 2 - .02)
										.multiply(Matrix.create.translation3d(Vector.create([0.5,-0.1,-2])));
var worldMatrix3 = Matrix.create.translation3d(Vector.create([-.325,-.5,-.125]))
										.multiply(Matrix.create.rotationZ(Math.PI / 4 * 3))
										.multiply(Matrix.create.translation3d(Vector.create([.325,.5,.125])))
										.multiply(Matrix.create.translation3d(Vector.create([-.75,-.66,1.4])));
// var worldMatrix1 = Matrix.create.translation3d(Vector.create([0, -.5, 0]));
// var worldMatrix2 = Matrix.create.translation3d(Vector.create([-0.5, -.5, 2]));
// var worldMatrix3 = Matrix.create.translation3d(Vector.create([1.5, -.5, 0]));
var currentCamera;

// draw functions
function draw3d () {
	set3dUniforms(worldMatrix1);
	gl.drawElements(gl.TRIANGLES, shape.indices.length, gl.UNSIGNED_SHORT, 0);
	set3dUniforms(worldMatrix2);
	gl.drawElements(gl.TRIANGLES, shape.indices.length, gl.UNSIGNED_SHORT, 0);
	set3dUniforms(worldMatrix3);
	gl.drawElements(gl.TRIANGLES, shape.indices.length, gl.UNSIGNED_SHORT, 0);
}
function drawShadowMap () {
	currentCamera = orthoCamera;
	useProgram(programShadowMap);
	setBuffer(textureBuffers.SHADOWMAP);
	gl.clearColor(1.0,1.0,1.0,1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	draw3d();
}
function drawShapeColor () {
	currentCamera = perspectiveCamera;
	useProgram(programColor);
	setBuffer(textureBuffers.COLOR);
	gl.clearColor(0.0, 0.0, 0.3, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	bindShadowMap();
	draw3d();
}
function drawDepthMap () {
	currentCamera = perspectiveCamera;
	useProgram(programDepth);
	setBuffer(textureBuffers.DEPTH);
	// white means don't blur
	gl.clearColor(1.0, 1.0, 1.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	draw3d();
}
function drawOutputBlurPass () {
	useProgram(programOutput);
	set2dUniforms();
	if (currentPass % 2) {
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, textures[textureBuffers.PASS0]);
		setBuffer(textureBuffers.COLOR);
	}
	else {
		setBuffer(textureBuffers.PASS0);
	}
	currentPass++;
	gl.clearColor(0.0, 0.0, 0.3, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	//gl.clear(gl.COLOR_BUFFER_BIT);
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}
function drawOutput () {
	useProgram(programOutput);
	set2dUniforms();
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		// gl.activeTexture(gl.TEXTURE0);
		// gl.bindTexture(gl.TEXTURE_2D, textures[textureBuffers.SHADOWMAP]);
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

function bindShadowMap () {
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, textures[textureBuffers.SHADOWMAP]);
	gl.uniform1i(gl.getUniformLocation(activeProgram, 'uShadowSampler'), 0);
	gl.uniformMatrix4fv(gl.getUniformLocation(activeProgram, 'uLightProjection'), false, new Float32Array(orthoCamera.getMatrix().flatten()));
}

function set3dUniforms (worldMatrix) {
	worldMatrix = worldMatrix || Matrix.create.identity(4);

	gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
	gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
	gl.vertexAttribPointer(vertexColorAttribute, 4, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
	gl.vertexAttribPointer(vertexNormalAttribute, 3, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
	// get uniform locations
	var pUniform = gl.getUniformLocation (activeProgram, 'uPMatrix');
	var mvUniform = gl.getUniformLocation (activeProgram, 'uMVMatrix');
	var normalUniform = gl.getUniformLocation (activeProgram, 'uNormalMatrix');
	// apply perspective
	gl.uniformMatrix4fv(pUniform, false, new Float32Array(currentCamera.getMatrix().flatten()));
	// slide left by half, rotate, then apply translation
	var mvMatrix = Matrix.create.translation3d(new Vector ([-.75/2, 0, 0.25/2])).multiply(Matrix.create.rotationY(rotY)).multiply(Matrix.create.rotationX(rotX)).multiply(translateMatrix).multiply(worldMatrix);
	gl.uniformMatrix4fv(mvUniform, false, new Float32Array(mvMatrix.flatten()));
	var normalMatrix = mvMatrix.inverse().transpose();
	gl.uniformMatrix4fv(normalUniform, false, new Float32Array(normalMatrix.flatten()));
}

function set2dUniforms () {
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, textures[textureBuffers.COLOR]);
	gl.activeTexture(gl.TEXTURE1);
	gl.bindTexture(gl.TEXTURE_2D, textures[textureBuffers.DEPTH]);
	gl.bindBuffer(gl.ARRAY_BUFFER, vertices2dBuffer);
	gl.vertexAttribPointer(vertexPositionAttribute, 2, gl.FLOAT, false, 0, 0);
	gl.uniform1i(gl.getUniformLocation(activeProgram, 'uSampler'), 0);
	gl.uniform1i(gl.getUniformLocation(activeProgram, 'uDepthMap'), 1);
	gl.uniform2fv(gl.getUniformLocation(activeProgram, 'uTextureSize'), [canvas.width, canvas.height]);
}

var rotX = 0;
var rotY = 0;

var camDist = 3.0;
var camRotY = 0;
(function draw () {

	// apply transforms
	// rotX += Math.PI / 360;
	rotY += Math.PI / 180;

	camRotY += Math.PI / 2160;
	perspectiveCamera.moveTo(Vector.create([
		Math.sin(camRotY) * camDist,
		0.8,
		Math.cos(camRotY) * camDist - 3.0
	]));

	currentPass = 0;
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	drawShadowMap();
	drawShapeColor();
	drawDepthMap();
	for (var i = 0; i < 25; i++) {
		drawOutputBlurPass();
	}
	drawOutput();

	requestAnimationFrame(draw);
})();
