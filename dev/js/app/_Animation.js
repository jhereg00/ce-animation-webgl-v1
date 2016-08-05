/**
 *  The main animation script
 *  Self contained, so it can be intialized on demand
 */

// requirements
var windowSize = require('lib/windowSize');
var GLShaders = require('lib/webgl/GLShaders');
var GLProgram = require('lib/webgl/GLProgram');
var GLTextureFramebuffer = require('lib/webgl/GLTextureFramebuffer');
var PerspectiveCamera = require('lib/webgl/PerspectiveCamera');
var OrthographicCamera = require('lib/webgl/OrthographicCamera');
var Vector = require('lib/math/Vector');

var ScreenRenderer = require('objects/ScreenRenderer');
var Flower = require('objects/Flower');

/////////////////
// settings
/////////////////
// background color, normalized for GLSL
var BG_COLOR = [23 / 255, 22 / 255, 23 / 255, 1];

// objects
/**
 *  CEAnimation
 *  the main object that runs the animation
 *  @param {DOMElement} container to add the animation to
 *  @method init
 *    builds and starts animation
 */
var CEAnimation = function (containerEl) {
  this.container = containerEl;
}
CEAnimation.prototype = {
  // main init function
  init: function () {
    var _this = this;
    // start outputting useful dev info
    console.log('Initializing CEAnimation');
    // build canvas and get gl context
    this.canvas = document.createElement('canvas');
    this.canvas.width = windowSize.width();
    this.canvas.height = windowSize.height();
    var gl = this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');

    // add to container
    this.container.appendChild(this.canvas);

    // ensure gl context was successful
    if (!gl) {
      console.error('failed to get WebGL context.');
      return false;
    }

    // establish gl defaults
    gl.clearColor(BG_COLOR[0],BG_COLOR[1],BG_COLOR[2],BG_COLOR[3]);
    gl.clearDepth(1.0);
    // enable depth testing
    gl.enable(gl.DEPTH_TEST);
    // make nearer things obscure farther things
    gl.depthFunc(gl.LEQUAL);

    // load some sexy shaders
    GLShaders.loadAll(gl, [
      [gl.VERTEX_SHADER, 'flowerVertex', 'glsl/flower.vs.glsl'],
      [gl.FRAGMENT_SHADER, 'flowerFrag', 'glsl/flower.fs.glsl'],
      [gl.VERTEX_SHADER, 'outputVertex', 'glsl/output.vs.glsl'],
      [gl.FRAGMENT_SHADER, 'outputFrag', 'glsl/output.fs.glsl'],
      [gl.FRAGMENT_SHADER, 'depthFrag', 'glsl/depth.fs.glsl'],
      [gl.FRAGMENT_SHADER, 'dofFrag', 'glsl/dof.fs.glsl']
    ], function (success) {
      // done!
      console.log('Finished loading shaders. succeeded: ' + success);
      if (!success) {
        return console.error('Failed to load all shaders files.');
      }

      // shaders are ready, keep going
      _this.initPrograms();
    });

    return this;
  },
  // initializes programs
  initPrograms: function () {
    console.log('Initializing GL Programs');
    this.programs = {
      flower: GLProgram.create(
          'flower',
          this.gl,
          [
            GLShaders.get('flowerVertex'),
            GLShaders.get('flowerFrag')
          ],
          [
            'aVertexPosition'
          ],
          [
            'uModelMatrix',
            'uWorldMatrix',
            'uPMatrix'
          ]),
      flowerDepth: GLProgram.create(
          'flowerDepth',
          this.gl,
          [
            GLShaders.get('flowerVertex'),
            GLShaders.get('depthFrag')
          ],
          [
            'aVertexPosition'
          ],
          [
            'uModelMatrix',
            'uWorldMatrix',
            'uPMatrix'
          ]),
      output: GLProgram.create(
          'output',
          this.gl,
          [
            GLShaders.get('outputVertex'),
            GLShaders.get('outputFrag')
          ],
          [
            'aVertexPosition'
          ],
          [
            'uSampler'
          ]),
      dof: GLProgram.create(
          'dof',
          this.gl,
          [
            GLShaders.get('outputVertex'),
            GLShaders.get('dofFrag')
          ],
          [
            'aVertexPosition'
          ],
          [
            'uSampler',
            'uDepthMap',
            'uDepthMapSize'
          ])
    };
    // check that it worked
    var successful = true;
    for (var p in this.programs) {
      if (!this.programs[p])
        successful = false;
    }

    if (successful) {
      // programs are ready, keep going
      this.initObjects();
      this.initCameras();
      this.initFramebuffers();
      // TODO: convert to custom event emitter
      this.initted = true;
      if (this.onInit && typeof this.onInit === 'function') {
        this.onInit(this);
      }
    }

    return this;
  },
  // initialize the objects in the program
  initObjects: function () {
    // temp
    this.flowers = [];
    for (var i = 0; i < 30; i++) {
      var f = new Flower (this.gl, this.programs.flower);
      f.setWorldTransform(Math.random() * Math.PI, Math.random() * Math.PI, 0, Math.random () * 3.5 - 2.5, Math.random () * 8 - 4, Math.random () * 7 - 6);
      this.flowers.push(f);
    }

    this.screenRenderer = new ScreenRenderer (this.gl, this.programs.flat);

    return this;
  },
  initCameras: function () {
    var pCamRadiusFromOrigin = 2;
    var pCam = new PerspectiveCamera();
    pCam.makePerspective(45, this.canvas.width / this.canvas.height, .5, 8);
    pCam.moveTo(Vector.create([0,0,pCamRadiusFromOrigin]));
    pCam.lookAt(Vector.create([0,0,0]));
    this.cameras = {
      primary: pCam
    }

    // listen and move
    document.body.addEventListener('mousemove', function (e) {
      var xRot = e.clientY / windowSize.height() * (Math.PI / 180 * 30) - (Math.PI / 180 * 15);
      var yRot = e.clientX / windowSize.width() * (Math.PI / 180 * 30) - (Math.PI / 180 * 15) + (Math.PI / 2);
      pCam.moveTo(Vector.create([
        -Math.cos(yRot) * pCamRadiusFromOrigin,
        -Math.sin(xRot) * pCamRadiusFromOrigin,
        Math.sin(yRot) * pCamRadiusFromOrigin
      ]));
    });

    return this;
  },
  initFramebuffers: function () {
    this.framebuffers = {
      'color': GLTextureFramebuffer.create(this.gl, this.canvas.width, this.canvas.height),
      'depth': GLTextureFramebuffer.create(this.gl, this.canvas.width, this.canvas.height)
    }
  },
  addInitFunction: function (fn) {
    this.onInit = fn;
  },
  update: function () {
    // update objects that can be updated
    for (var i = 0, len = this.flowers.length; i < len; i++) {
      this.flowers[i].update();
    }
  },
  // draw everything
  draw: function () {
    var gl = this.gl;
    var _this = this;
    function _drawAllObjects (camera, program) {
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      for (var i = 0, len = _this.flowers.length; i < len; i++) {
        _this.flowers[i].draw(camera, program);
      }
    }

    // draw colors
    this.framebuffers.color.use();

    gl.clearColor(BG_COLOR[0],BG_COLOR[1],BG_COLOR[2],BG_COLOR[3]);
    _drawAllObjects(this.cameras.primary, this.programs.flower);

    // draw depth
    this.framebuffers.depth.use();

    gl.clearColor(1.0,1.0,1.0,1.0);
    _drawAllObjects(this.cameras.primary, this.programs.flowerDepth);

    // draw depth

    // draw output
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    this.gl.viewport(0,0,this.canvas.width, this.canvas.height);
    this.screenRenderer.draw(
      null,
      this.programs.dof,
      this.framebuffers.color.getTexture(),
      this.framebuffers.depth.getTexture(),
      [this.framebuffers.depth.width, this.framebuffers.depth.height]);

    return this;
  }
}

module.exports = CEAnimation;
