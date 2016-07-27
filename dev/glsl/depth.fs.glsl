// flower fragment shader
precision mediump float;

varying vec3 vPos;

void main (void) {
  gl_FragColor = vec4(vec3(vPos.z / -8.0), 1.0);
}
