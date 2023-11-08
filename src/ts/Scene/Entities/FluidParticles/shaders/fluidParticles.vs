#include <common>
#include <vert_h>
#include <noise>
layout (location = 3) in vec2 computeUV;
layout (location = 4) in vec3 rnd;

uniform vec4 uMidi;

uniform sampler2D gpuSampler0;
uniform sampler2D gpuSampler1;
uniform float uVisibility;

uniform sampler2D uAudioWaveTex;
uniform sampler2D uAudioFreqTex;
uniform float uPause;

uniform float uTime;

out vec3 vRnd;
out float vAudio;

void main( void ) {

	#include <vert_in>

	vec4 gpuPos = texture(gpuSampler0, computeUV );
	vec4 gpuVel = texture(gpuSampler1, computeUV );

	float audio = texture( uAudioFreqTex, vec2( computeUV.x * 0.3, 0.0 ) ).x;
	audio = pow( audio, 3.0 );

	outPos *= rnd.x * rnd.x * 5.0 + audio * 30.5;

	outPos *= 0.2 + 0.8 * (sin( length( gpuPos.xyz) * 3.0 - uTime * 5.0 ) * 0.5 + 0.5);
	
	outPos *= uMidi.w * uVisibility;
	outPos *= smoothstep( 1.0, 0.1, gpuPos.w);
	outPos *= smoothstep( 0.1, 0.15, gpuPos.w);
	outPos += gpuPos.xyz;
	
	if( uMidi.y > 0.001 ) {

		// float m = (1.0 - pow( 1.0 - uMidi.y, 1.0 ) );
		float m = uMidi.y;

		// m *= sin( length( outPos ) * 2.0 - uTime * 2.0 ) * 0.5 + 0.5;
		m *= snoise4D( vec4( outPos * 0.5, uTime * 0.2 ) ) * 0.5 + 0.5;
		// m = 1.0;

		m = smoothstep( 0.0, 0.7, m );

		m = 1.0 - pow( 1.0 - m, 2.0 );
		// m = floor( m * 10.0) / 10.0;

		float res = 0.5 + 100.0 * ( 1.0 - m );

		outPos.xyz = floor( (outPos - 0.5) * res ) / res + 0.5;
		
	}
	
	#include <vert_out>

	vRnd = rnd;
	
	vec4 vel = ( projectionMatrix * viewMatrix * modelMatrix * vec4( gpuVel.xyz, 0.0 ) );
	vVelocity += vel.xy * 0.08 * ( 1.0 - uPause );

	vAudio = audio;
	
}