// intended to render a flat screen
precision mediump float;

attribute vec2 aVertexPosition;

varying vec2 vTextureCoords;

void main (void) {
  gl_Position = vec4(aVertexPosition,0.0,1.0);
  vTextureCoords = vec2((aVertexPosition.x + 1.0) / 2.0, (aVertexPosition.y + 1.0) / 2.0);
}
