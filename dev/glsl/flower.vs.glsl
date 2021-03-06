// flower vertex shader
precision mediump float;

attribute vec3 aVertexPosition;

uniform mat4 uModelMatrix; // model transforms
uniform mat4 uWorldMatrix; // world transforms
uniform mat4 uPMatrix; // projection

varying vec3 vPos;
varying float depth;

void main(void) {
  vec4 truePos = uWorldMatrix * uModelMatrix * vec4(aVertexPosition, 1.0);
  gl_Position = uPMatrix * truePos;
  vPos = truePos.xyz;
  depth = (gl_Position.z - 1.0) / 4.0;
}
