/**
 *  Object that renders a texture to the entire buffer
 */
// requirements
var GLBuffer = require('lib/webgl/GLBuffer');

// settings

// classes
/**
 *  ScreenRenderer
 *  @param {WebGLContext} gl
 *  @param {GLProgram} program
 *
 *  @method draw
 */
var ScreenRenderer = function (gl, program) {
  this.gl = gl;
  this.program = program;
  this.buildBuffers();
}
ScreenRenderer.prototype = {
  buildBuffers: function () {
    this.buffers = {};
    this.buffers.vertices = GLBuffer.create(this.gl, this.gl.ARRAY_BUFFER, 2);
    this.buffers.vertices.bindData([
      -1.0, 1.0,
      1.0, 1.0,
      -1.0, -1.0,
      1.0, -1.0
    ]);
  },
  draw: function () {
    // use the program
    this.program.use();
    // bind the buffer
    this.buffers.vertices.bindToAttribute(this.program.attributes['uVertexPosition']);
    // draw it
    this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
  }
}

module.exports = ScreenRenderer;
