// intended to render a flat screen
precision mediump float;

attribute vec2 uVertexPosition;

void main (void) {
  gl_Position = vec4(uVertexPosition,0.0,1.0);
}
