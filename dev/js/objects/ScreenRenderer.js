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
var ScreenRenderer = function (gl) {
  this.gl = gl;
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
  draw: function (camera, program, texture, depthmap, depthmapSize) {
    var gl = this.gl;
    // use the program
    program.use();
    // bind the buffer
    this.buffers.vertices.bindToAttribute(program.attributes['aVertexPosition']);
    // bind the texture
  	gl.activeTexture(gl.TEXTURE0);
  	gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(program.uniforms.uSampler, 0);
  	gl.activeTexture(gl.TEXTURE1);
  	gl.bindTexture(gl.TEXTURE_2D, depthmap);
    gl.uniform1i(program.uniforms.uDepthMap, 1);
    gl.uniform2fv(program.uniforms.uDepthMapSize, new Float32Array(depthmapSize));
    // draw it
    this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
  }
}

module.exports = ScreenRenderer;
