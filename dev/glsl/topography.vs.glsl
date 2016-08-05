// flower vertex shader
precision mediump float;

attribute vec3 aVertexPosition;

uniform mat4 uModelMatrix; // model transforms
uniform mat4 uWorldMatrix; // world transforms
uniform mat4 uPMatrix; // projection

varying float vHeight;
varying float vDepth;

void main(void) {
  gl_PointSize = 10.0;
  vec4 truePos = uWorldMatrix * uModelMatrix * vec4(aVertexPosition, 1.0);
  gl_Position = uPMatrix * truePos;
  vHeight = aVertexPosition.z;
  vDepth = (gl_Position.z - 1.0) / 6.0;
}
