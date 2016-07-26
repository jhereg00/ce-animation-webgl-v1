/**
 *  The main animation script
 *  Self contained, so it can be intialized on demand
 */

// requirements
var windowSize = require('lib/windowSize');
var GLShaders = require('lib/webgl/GLShaders');
var GLProgram = require('lib/webgl/GLProgram');
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
      [gl.VERTEX_SHADER, 'flatVertex', 'glsl/flat.vs.glsl'],
      [gl.FRAGMENT_SHADER, 'flatFrag', 'glsl/flat.fs.glsl']
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
      flat: GLProgram.create(
          'flat',
          this.gl,
          [
            GLShaders.get('flatVertex'),
            GLShaders.get('flatFrag')
          ],
          [
            'aVertexPosition'
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
    }

    return this;
  },
  // initialize the objects in the program
  initObjects: function () {
    // temp
    this.flower = new Flower (this.gl, this.programs.flower);
    this.flower.setObjectTransform(0, Math.PI / 180 * 30, 0, 0, 0, 0);
    this.flower.setWorldTransform(0, 0, 0, -0.5, 0, 0);

    this.screenRenderer = new ScreenRenderer (this.gl, this.programs.flat);

    // cameras
    // var pCam = new OrthographicCamera();
    // pCam.makeOrtho(2, this.canvas.width / this.canvas.height, 0.1, 9.1)
    var pCam = new PerspectiveCamera();
    pCam.makePerspective(45, this.canvas.width / this.canvas.height, .5, 4);
    pCam.moveTo(Vector.create([0,0,2]));
    this.cameras = {
      primary: pCam
    }

    this.initted = true;
    // TODO: convert to custom event emitter
    if (this.onInit && typeof this.onInit === 'function') {
      this.onInit(this);
    }

    return this;
  },
  addInitFunction: function (fn) {
    this.onInit = fn;
  },
  update: function () {
    // update objects that can be updated
    this.flower.update();
  },
  // draw everything
  draw: function () {
    // clear output buffer
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    this.flower.draw(this.cameras.primary);
    //this.screenRenderer.draw();

    return this;
  }
}

module.exports = CEAnimation;
