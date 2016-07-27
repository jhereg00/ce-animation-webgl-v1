// flower fragment shader
precision mediump float;

varying vec3 vPos;

void main (void) {
  float depth = 1.0 + vPos.z / 6.0; // vPos.z is expected to be negative
  gl_FragColor = vec4(vec3(0.3 + depth * 0.6), 1.0);
}
