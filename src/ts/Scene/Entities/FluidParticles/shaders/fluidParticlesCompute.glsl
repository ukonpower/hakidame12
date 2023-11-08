#include <common>
#include <noise>

layout (location = 0) out vec4 outColor0;
layout (location = 1) out vec4 outColor1;

uniform sampler2D gpuSampler0;
uniform sampler2D gpuSampler1;
uniform float uTime;
uniform vec2 uGPUResolution;

in vec2 vUv;

#include <noise4D>
#include <rotate>

uniform vec4 uMidi;
uniform vec4 uMidi2;
uniform float uPause;

uniform sampler2D uAudioWaveTex;
uniform sampler2D uAudioFreqTex;


void main( void ) {

	float audio = texture( uAudioFreqTex, vec2(0.1, 0.0 ) ).x;
	audio = smoothstep( 0.2, 0.8, audio );

	float id = vUv.x + vUv.y * uGPUResolution.x;

	vec4 position = texture( gpuSampler0, vUv );
	vec4 velocity = texture( gpuSampler1, vUv );

	if( uPause == 1.0 ) {
		
		outColor0 = position;
		outColor1 = velocity;
		
		return;
		
	}

	float t = uTime;

	float around = uMidi2.z;
	float aroundInv = 1.0 - around;

	// velocity

	velocity.xyz *= 0.98;

	vec3 noisePosition = position.xyz * 0.5 * ( 1.0 + position.w * 0.5) * ( 1.0 - around * 0.3 );
	float pt = id * 0.005 + t * 0.5;
	vec3 noise = vec3(
		snoise4D( vec4( noisePosition, pt) ),
		snoise4D( vec4( noisePosition + 1234.5, pt) ),
		snoise4D( vec4( noisePosition + 2345.6, pt) )
	) * 0.003;

	velocity.xyz += noise * (0.5 + audio * 0.8) * (uMidi.x * 2.0);

	float rotDir = atan2( position.z, position.x );
	velocity.x += sin( rotDir ) * 0.0003 * around;
	velocity.z += -cos( rotDir ) * 0.0003 * around;

	// gravity
	vec3 gravity = vec3( 0.00001 );
	vec3 gPos = vec3( 0.0 );
	gPos = position.xyz + vec3( 0.0, 0.0, 0.0 );
	gravity += gPos.xyz * smoothstep( 0.0, 4.0, length( gPos.xyz ) ) * -vec3(0.0001) * aroundInv;
	velocity.xyz += gravity;

	//  position

	position.xyz += velocity.xyz;

	// lifetime

	if( position.w > 1.0 ) {
	
		vec3 p = vec3( 0.0);
		p.x = sin( vUv.y * TPI ) * around * 13.0;
		p.z = cos( vUv.y * TPI ) * around * 13.0;
		position = vec4( p, 0.0 );
		velocity = vec4( 0.0 );

	}

	position.w += 0.016 / 5.0;

	// out

	outColor0 = position;
	outColor1 = velocity;

} 