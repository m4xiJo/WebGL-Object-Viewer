#version 300 es
  in vec3 vertPosition;
  in vec2 vertTexCoord;
  in vec3 vertNormal;
  out vec2 fragTexCoord;
  out vec3 fragNormal;
  uniform mat4 world;
  uniform mat4 view;
  uniform mat4 proj;
  void main() {
    fragTexCoord = vertTexCoord;
    fragNormal = (world * vec4(vertNormal, 0.0)).xyz;
    gl_Position = proj * view * world * vec4(vertPosition, 1.0);
  }
