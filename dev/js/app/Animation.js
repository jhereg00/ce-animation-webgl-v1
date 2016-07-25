/**
 *  The main animation script
 *  Self contained, so it can be intialized on demand
 */

// requirements
var windowSize = require('lib/windowSize');
var GLShaders = require('lib/webgl/GLShaders');

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
    console.log('Initializing CEAnimation');
    // build canvas and get gl context
    this.canvas = document.createElement('canvas');
    this.canvas.width = windowSize.width();
    this.canvas.height = windowSize.height();
    var gl = this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');

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
      [gl.FRAGMENT_SHADER, 'flowerFrag', 'glsl/flower.fs.glsl']
    ], function (success) {
      // done!
      console.log('loaded shaders! succeeded: ' + success);
    });
  }
}

module.exports = CEAnimation;
