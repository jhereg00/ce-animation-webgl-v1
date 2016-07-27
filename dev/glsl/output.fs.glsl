// output fragment shader
precision mediump float;

uniform sampler2D uSampler;

varying vec2 vTextureCoords;

void main (void) {
  gl_FragColor = texture2D(uSampler, vTextureCoords); //vec4(vTextureCoords.x, vTextureCoords.y, 0.0, 1.0);
}
