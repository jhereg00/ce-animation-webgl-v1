// flower fragment shader
precision mediump float;

varying float vHeight;
varying float vDepth;

void main (void) {
  gl_FragColor = vec4(vec3(vDepth), 1.0);
}
