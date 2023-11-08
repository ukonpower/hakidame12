#include <common>
#include <vert_h>

uniform sampler2D uAudioWaveTex;
uniform sampler2D uAudioFreqTex;

uniform sampler2D gpuSampler0;
uniform sampler2D gpuSampler1;

uniform float uGrid;
uniform float uGridInv;
uniform vec2 uAction;

uniform float uTime;
uniform vec4 uMidi;

layout (location=3) in vec3 instancePos;
layout (location=4) in vec4 instanceId;
layout (location=5) in vec3 instanceNormal;
layout (location=6) in vec4 instanceRandom;

vec2 getGPUUV( vec3 index ) {

	return vec2( uGridInv * index.x + index.z, index.y );
	
}

#include <rotate>

out vec4 vGpuPos;
out vec4 vGpuVel;

void main( void ) {

	#include <vert_in>

	vec2 gpuUv = getGPUUV( instanceId.xyz );
	vec4 gpuPos = texture( gpuSampler0, gpuUv );
	vec4 gpuVel = texture(gpuSampler1, gpuUv );

	float audio = texture( uAudioFreqTex, vec2( instanceRandom.x, 0.0 ) ).x;
	audio = pow( audio, 1.0 ) * 2.0;

	mat3 velRot = mat3( 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0 );

	if( length( gpuVel.xyz ) > 0.001 )  {
		velRot = makeRotationDir(normalize(gpuVel.xyz), vec3( 0.01, 1.0, 0.0 ));
	}

	outPos *= 1.0 + sin( length( gpuPos.xyz ) * 3.0 + audio + uTime * - 1.0 ) * 0.9 * uMidi.w;
	
	outPos.xyz *= 1.0 + length( gpuVel ) * 2.0;
	outPos.z *= 1.0 + length( gpuVel ) * 50.0;
	outPos *= velRot;
	outNormal *= velRot;
	
	// outPos *= 1.0 + scaleDir * 10.0;

	outPos += gpuPos.xyz;

	#include <vert_out>

	vGpuPos = gpuPos;
	vGpuVel = gpuVel;
	
	vec4 vel = ( projectionMatrix * viewMatrix * modelMatrix * vec4( gpuVel.xyz, 0.0 ) );
	vVelocity += vel.xy * 0.5;

}