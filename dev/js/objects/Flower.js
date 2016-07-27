/**
 *  Object that renders a texture to the entire buffer
 */
// requirements
var GLBuffer = require('lib/webgl/GLBuffer');
var makeTransformMatrix = require('lib/webgl/makeTransformMatrix');
var Matrix = require('lib/math/Matrix');

// settings
var MIN_ROT_SPEED = Math.PI / 180 * 180; // degrees per second
var MAX_ROT_SPEED = Math.PI / 180 * 360; // degrees per second

// classes
/**
 *  Flower
 *  @param {WebGLContext} gl
 *
 *
 *  @method setObjectTransform
 *    @param rotationX
 *    @param rotationY
 *    @param rotationZ
 *    @param translationX
 *    @param translationY
 *    @param translationZ
 *
 *  @method setWorldTransform
 *    @param rotationX
 *    @param rotationY
 *    @param rotationZ
 *    @param translationX
 *    @param translationY
 *    @param translationZ
 *  @method draw
 *    @param {PerspectiveCamera or OrthographicCamera} camera
 *    @param {GLProgram} program
 */
var Flower = function (gl) {
  this.gl = gl;

  this.buildLayers();
  this.buildBuffers();
  this.setObjectTransform(0,0,0,0,0,0);
  this.setWorldTransform(0,0,0,0,0,0);

  this.xSpeed = Math.random() * .2;
  this.ySpeed = Math.random() * -.3 - .2;
  this.yRotSpeed = Math.random() * Math.PI / 180 * 15;
  this.xRotSpeed = Math.random() * Math.PI / 180 * 10;
}
Flower.prototype = {
  buildLayers: function () {
    var innerRadius = .1;
    var outerRadius = .45;
    var points = 7;
    var lineCount = [80,280,130];
    // var lineCount = [
    //   Math.random() * 100 + 50,
    //   Math.random() * 100 + 200,
    //   Math.random() * 300 + 50
    // ];
    var startZ = [0,0.05, 0.01];
    var endZ = [0.2, 0.15, 0.2];
    this.layers = [];
    for (var i = 0; i < 3; i++) {
      var offset = (i * (outerRadius - innerRadius) / 2);
      var l = new Layer (
        innerRadius + offset,
        outerRadius + offset,
        points,
        lineCount[i],
        i % 2,
        startZ[i],
        endZ[i]
      );
      l.setTransform(0,0,0,0,0,0);
      this.layers.push(l);
    }
  },
  buildBuffers: function () {
    this.buffers = {
      vertices: GLBuffer.create(this.gl, this.gl.ARRAY_BUFFER, 3)
    }
  },
  setObjectTransform: function (rx, ry, rz, tx, ty, tz) {
    // build transform matrix in order we want it applied
    this.objectTransform = {
      rx: rx !== undefined ? rx : this.objectTransform.rx,
      ry: ry !== undefined ? ry : this.objectTransform.ry,
      rz: rz !== undefined ? rz : this.objectTransform.rz,
      tx: tx !== undefined ? tx : this.objectTransform.tx,
      ty: ty !== undefined ? ty : this.objectTransform.ty,
      tz: tz !== undefined ? tz : this.objectTransform.tz
    };
    this.objectTransformMatrix = makeTransformMatrix(
      this.objectTransform.rx,
      this.objectTransform.ry,
      this.objectTransform.rz,
      this.objectTransform.tx,
      this.objectTransform.ty,
      this.objectTransform.tz,
      ['rz','rx','ry','t']);
  },
  setWorldTransform: function (rx, ry, rz, tx, ty, tz) {
    this.worldTransform = {
      rx: rx !== undefined ? rx : this.worldTransform.rx,
      ry: ry !== undefined ? ry : this.worldTransform.ry,
      rz: rz !== undefined ? rz : this.worldTransform.rz,
      tx: tx !== undefined ? tx : this.worldTransform.tx,
      ty: ty !== undefined ? ty : this.worldTransform.ty,
      tz: tz !== undefined ? tz : this.worldTransform.tz
    };
    this.worldTransformMatrix = makeTransformMatrix(
      this.worldTransform.rx,
      this.worldTransform.ry,
      this.worldTransform.rz,
      this.worldTransform.tx,
      this.worldTransform.ty,
      this.worldTransform.tz,
      ['rz','rx','ry','t']);
  },
  draw: function (camera, program) {
    // use the program
    program.use();
    // bind camera
    this.gl.uniformMatrix4fv(program.uniforms.uPMatrix, false, new Float32Array(camera.getMatrix().flatten()));

    // bind the buffers
    this.buffers.vertices.bindToAttribute(program.attributes['aVertexPosition']);

    // temp
    this.gl.uniformMatrix4fv(program.uniforms.uWorldMatrix, false, new Float32Array(this.worldTransformMatrix.flatten()));

    // draw each layer
    for (var i = 0, len = this.layers.length; i < len; i++) {
      // bind uniforms
      this.gl.uniformMatrix4fv(program.uniforms.uModelMatrix, false, new Float32Array(this.layers[i].transformMatrix.x(this.objectTransformMatrix).flatten()));

      // bind the buffers' data
      this.buffers.vertices.bindData(this.layers[i].vertices);
      // draw it
      this.gl.drawArrays(this.gl.LINES, 0, this.layers[i].vertices.length / 3);
    }
  },
  update: function () {
    if (!this.lastTime) {
      this.lastTime = new Date().getTime();
    }
    var now = new Date().getTime();
    var deltaTime = now - this.lastTime;
    var deltaTimeInSeconds = deltaTime / 1000;
    // update layer rotations
    for (var i = 0, len = this.layers.length; i < len; i++) {
      this.layers[i].transform.rz += Math.PI / 180 * (this.layers[i].rotZSpeed * deltaTimeInSeconds);
      this.layers[i].setTransform();
    }
    // update world pos
    this.setWorldTransform(
      this.worldTransform.rx += this.xRotSpeed * deltaTimeInSeconds,
      this.worldTransform.ry += this.yRotSpeed * deltaTimeInSeconds,
      0,
      this.worldTransform.tx += this.xSpeed * deltaTimeInSeconds,
      this.worldTransform.ty += this.ySpeed * deltaTimeInSeconds,
      this.worldTransform.tz
    );

    if (this.worldTransform.ty < -2.5 - Math.abs(.5 * this.worldTransform.tz))
      this.worldTransform.ty = 2.5 + Math.abs(1.5 * this.worldTransform.tz);

    if (this.worldTransform.tx > 4.5 + Math.abs(.5 * this.worldTransform.tz))
      this.worldTransform.tx = -4.5 - Math.abs(1.5 * this.worldTransform.tz);

    this.lastTime = now;
  }
}

/**
 *  Layer
 *  for internal use of the Flower
 *  @param inner
 *  @param outer
 *  @param points
 *  @param lineCount
 *  @param startOnPoint
 *  @param innerZ
 *  @param outerZ
 */
var Layer = function (inner, outer, points, lineCount, startOnPoint, innerZ, outerZ) {
  var thetaPerPoint = Math.PI * 2 / points;
  var thetaOffset = startOnPoint ? Math.PI * 2 / points / 2 : 0;

  var vertices = [];

  var maxLength = outer - inner;
  var zDepth = outerZ - innerZ;
  var i = lineCount;
  while (i--) {
    var jitter = (Math.random() - .5) * Math.PI / 180;
    var theta = Math.PI * 2 / lineCount * i + jitter;
    var pointPercent = (((theta + thetaOffset) % thetaPerPoint) / thetaPerPoint) * 2;
    if (pointPercent > 1) pointPercent = 2 - pointPercent;
    var pointOffsetLength = maxLength / 2 * pointPercent;
    var pointOffset = {
      x: Math.cos(theta) * pointOffsetLength,
      y: Math.sin(theta) * pointOffsetLength,
      z: (1 - pointPercent) * zDepth
    }
    // start point
    vertices = vertices.concat([
      Math.cos(theta) * (inner + pointOffsetLength),// + pointOffset.x,
      Math.sin(theta) * (inner + pointOffsetLength),// + pointOffset.y,
      innerZ
    ])
    // end point
    .concat ([
      Math.cos(theta) * (outer - pointOffsetLength),// - pointOffset.x,
      Math.sin(theta) * (outer - pointOffsetLength),// - pointOffset.y,
      innerZ + pointOffset.z
    ]);
  }
  this.vertices = vertices;

  this.rotZSpeed = Math.random() * (MAX_ROT_SPEED - MIN_ROT_SPEED) + MIN_ROT_SPEED;
  if (startOnPoint)
    this.rotZSpeed *= -1;
}
Layer.prototype = {
  setTransform: function (rx, ry, rz, tx, ty, tz) {
    // build transform matrix in order we want it applied
    this.transform = {
      rx: rx !== undefined ? rx : this.transform.rx,
      ry: ry !== undefined ? ry : this.transform.ry,
      rz: rz !== undefined ? rz : this.transform.rz,
      tx: tx !== undefined ? tx : this.transform.tx,
      ty: ty !== undefined ? ty : this.transform.ty,
      tz: tz !== undefined ? tz : this.transform.tz
    };
    this.transformMatrix = makeTransformMatrix(
      this.transform.rx,
      this.transform.ry,
      this.transform.rz,
      this.transform.tx,
      this.transform.ty,
      this.transform.tz,
      ['rz','rx','ry','t']);
  }
}

module.exports = Flower;
