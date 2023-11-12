#version 300 es
precision highp float;

uniform sampler2D backbuffer0;

in vec2 vUv;

layout (location = 0) out vec4 outColor;

void main( void ) {

	vec4 c = texture( backbuffer0, vUv );
  
	vec3 f;
	f.x = max(0.0, c.x);
	f.y = max(0.0, c.y);
	f.z = max(0.0, c.z);


	outColor = vec4(vec3(c) * f, 1.0 );
	
}