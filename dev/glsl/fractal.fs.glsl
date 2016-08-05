// flower fragment shader
precision mediump float;

varying float vHeight;

void main (void) {
  //float depth = 1.0 + vPos.z / 6.0; // vPos.z is expected to be negative
  gl_FragColor = vec4(vec3(vHeight + 0.5), 1.0);
}
