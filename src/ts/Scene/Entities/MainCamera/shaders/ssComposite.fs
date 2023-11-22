#include <common>
#include <packing>
#include <light_h>
#include <re>
#include <noise>

uniform sampler2D backbuffer0;

uniform sampler2D uGbufferPos;
uniform sampler2D uGbufferNormal;
uniform sampler2D uSSRTexture;

uniform vec3 cameraPosition;
uniform float cameraNear;
uniform float cameraFar;

in vec2 vUv;

layout (location = 0) out vec4 outColor;

void main( void ) {

	vec4 gCol0 = texture( uGbufferPos, vUv );
	vec4 gCol1 = texture( uGbufferNormal, vUv );
	
	outColor += vec4( texture( backbuffer0, vUv ).xyz, 1.0 );
	
	vec3 dir = normalize( cameraPosition - gCol0.xyz );
	float f = fresnel( dot( dir, gCol1.xyz ) );

	outColor += texture( uSSRTexture, vUv ) * 0.3 * f;

}