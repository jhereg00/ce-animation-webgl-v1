// output fragment shader
precision mediump float;

uniform sampler2D uSampler;
uniform sampler2D uDepthMap;
uniform vec2 uDepthMapSize;

varying vec2 vTextureCoords;

const float near = 0.1;
const float far = 0.3;
const float blurAmount = 2.;
const int blurDistance = 2;

void main (void) {
  // determine depth from texture sent
  float depth = texture2D(uDepthMap, vTextureCoords).r;
  // determine floats representing a single screen pixel
  vec2 onePixel = vec2(1.0) / uDepthMapSize;

  // set color to black, since we're going to add to it
  vec3 color = vec3(0.0);
  // determine blur size
  float texelSize = max((depth - far) * blurAmount, (near - depth) * blurAmount);
  texelSize = max(texelSize, 0.0);
  // define variable to see if neighbor is close enough to pull color from
  float neighborDepth;

  if (texelSize != 0.0) {
    // remember how many colors we combined so we can average
    int count = 0;
    for (int y = -blurDistance; y <= blurDistance; ++y) {
      for (int x = -blurDistance; x <= blurDistance; ++x) {
        // determine location of where we're checking in order to pull a color from
        vec2 offset = vTextureCoords + vec2(float(x) * texelSize * onePixel.x, float(y) * texelSize * onePixel.y);
        // make sure we're within bounds
        offset.x = min(1.0, max(0.0, offset.x));
        offset.y = min(1.0, max(0.0, offset.y));
        // check neighbor's depth
        neighborDepth = texture2D(uDepthMap, offset).r;
        if ( neighborDepth < near || neighborDepth > far ) {
          color += texture2D(uSampler, offset).rgb;
          ++count;
        }
      }
    }
    color /= float(count);
  }
  else
    color = texture2D(uSampler, vTextureCoords).rgb;

  gl_FragColor = vec4(color, 1.0);
}
