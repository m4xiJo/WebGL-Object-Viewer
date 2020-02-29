#version 300 es
  precision mediump float;
  struct directionalLight {
    vec3 direction;
    vec3 color;
  };
  in vec2 fragTexCoord;
  in vec3 fragNormal;
  out vec4 fragColor;
  uniform vec3 ambientLightIntensity;
  uniform directionalLight sun;
  uniform sampler2D sampler;
  void main() {
    vec3 surfaceNormal = normalize(fragNormal);
    vec3 normSunDir = normalize(sun.direction);
    vec4 texel = texture(sampler, fragTexCoord);
    vec3 lightIntensity = ambientLightIntensity + sun.color * max(dot(fragNormal, normSunDir), 0.0);
    fragColor = vec4(texel.rgb * lightIntensity, texel.a);
  }
