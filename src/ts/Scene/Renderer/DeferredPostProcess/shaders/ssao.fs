#include <common>
#include <packing>
#include <light_h>
#include <noise>

// uniforms

uniform sampler2D uSSAOBackBuffer;
uniform sampler2D uDepthTexture;

uniform sampler2D sampler0; // position, depth
uniform sampler2D sampler1; // normal, emissionIntensity
uniform sampler2D sampler2; // albedo, roughness
uniform sampler2D sampler3; // emission, metalic
uniform sampler2D sampler4; // velocity, env

uniform float uTime;
uniform float uFractTime;
uniform mat4 cameraMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 projectionMatrixInverse;
uniform vec3 cameraPosition;

// varying

in vec2 vUv;

layout (location = 0) out vec4 outColor;

#define SAMPLE 32

void main( void ) {

	vec3 lightShaftSum = vec3( 0.0 );

	vec3 rayPos = texture( sampler0, vUv ).xyz;
	vec4 rayViewPos = viewMatrix * vec4(rayPos, 1.0);
	
	vec4 depthRayPos = projectionMatrixInverse * vec4( vUv * 2.0 - 1.0, texture( uDepthTexture, vUv ).x * 2.0 - 1.0, 1.0 );
	depthRayPos.xyz /=depthRayPos.w;

	if( rayPos.x + rayPos.y + rayPos.z == 0.0 ) return;
	if( abs( rayViewPos.z - depthRayPos.z ) > 0.1 || length(rayPos - cameraPosition) > 100.0 ) return;

	vec3 normal = texture( sampler1, vUv ).xyz;
	float occlusion = 0.0;

	for( int i = 0; i < SAMPLE; i ++ ) {

		float seed = uFractTime + float( i ) / float( SAMPLE );
		vec3 noise = vec3( random( vUv + seed ), random( vUv - seed ), random( vUv - seed + 0.5 ) * 0.95 + 0.05 );
	
		float r = sqrt( noise.x ) * 1.5;
		float theta = TPI * noise.y;
		vec3 tDir = vec3( r * cos( theta ), r * sin( theta ), sqrt( 1.0 - noise.x ) );
		vec3 tangent = normalize( cross( normal, abs( normal.x ) > 0.001 ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 ) ) );
		vec3 binormal = cross( tangent, normal );
		
		vec3 sampleOffset = (tangent * tDir.x + binormal * tDir.y + normal * tDir.z) * noise.z;
		vec3 samplePos = rayPos + sampleOffset;

		vec4 depthCoord = (projectionMatrix * viewMatrix * vec4(samplePos, 1.0 ) );
		depthCoord.xy /= depthCoord.w;
		depthCoord.xy = depthCoord.xy * 0.5 + 0.5;

		float samplerDepth = texture(uDepthTexture, depthCoord.xy).x;
		vec4 sampleViewPos = viewMatrix * vec4( samplePos, 1.0 );
		vec4 depthViewPos = projectionMatrixInverse * vec4( depthCoord.xy * 2.0 - 1.0, samplerDepth * 2.0 - 1.0, 1.0 );
		depthViewPos.xyz /= depthViewPos.w;

		if( sampleViewPos.z < depthViewPos.z && sampleViewPos.z >= depthViewPos.z - 1.0 ) {

			occlusion += ( 1.0 - noise.z );

		}
		
	}

	occlusion /= float( SAMPLE );
	outColor = vec4( mix( texture( uSSAOBackBuffer, vUv ).xyz, vec3( occlusion ), 0.5 ), 1.0 );

}