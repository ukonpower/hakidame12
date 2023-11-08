#include <common>
#include <noise>

layout (location = 0) out vec4 outColor0;
layout (location = 1) out vec4 outColor1;
layout (location = 2) out vec4 outColor2;

uniform sampler2D gpuSampler0;
uniform sampler2D gpuSampler1;
uniform sampler2D gpuSampler2;
uniform vec2 uGPUResolution;

uniform sampler2D uAudioWaveTex;
uniform sampler2D uAudioFreqTex;

uniform float uGrid;
uniform float uGridInv;

uniform float uTime;
uniform vec4 uAction;

in vec2 vUv;

uniform vec4 uMidi;


#include <noise4D>
#include <rotate>

// vec2 get3DUv( vec2 uv ) {

// 	return vec3(

// 	);
	
// }

void main( void ) {

	float t = uTime * 0.8;
	float id = ( vUv.x * uGPUResolution.x + vUv.y ) / uGPUResolution.x;


	vec4 position = texture( gpuSampler0, vUv );
	vec4 velocity = texture( gpuSampler1, vUv );

	// wave

	vec2 rnd = vec2(
		random( vUv ),
		random( vUv + 0.5 )
	);

	float audio = 0.0;

	// velocity

	vec3 goalPos = vec3(0.0);
	vec3 dir = vec3( 0.0 );

	if( uAction.x == 0.0 ) {

		vec3 cubePos = vec3( 0.0 );
		cubePos.x = fract(vUv.x * uGrid);
		cubePos.y = vUv.y;
		cubePos.z = floor(vUv.x * uGrid) / uGrid;
		cubePos -= 0.5;

		// outPos *= 1.0 + abs( instanceNormal ) * audio * 10.0 * smoothstep( 1.25, 0.9, length( gpuPosition ) ) * uMidi.w;

		vec3 cubeDir = vec3( 0.0 );
		vec3 absCubePos = abs( cubePos );
		float maxDim = max( max( absCubePos.x, absCubePos.y ), absCubePos.z );
		cubeDir.x = ( absCubePos.x == maxDim ? 1.0 : 0.0 ) * sign( cubePos.x );
		cubeDir.y = ( absCubePos.y == maxDim ? 1.0 : 0.0 ) * sign( cubePos.y );
		cubeDir.z = ( absCubePos.z == maxDim ? 1.0 : 0.0 ) * sign( cubePos.z );

		if( length( cubeDir ) > 1.0 ) cubeDir *= 0.0;
		
		goalPos = cubePos;
		dir = cubeDir * smoothstep( 0.8, 0.0, length( absCubePos ) );

		audio = texture( uAudioFreqTex, vec2( rnd.x, 0.0 ) ).x;
		audio = pow( audio, 1.0 ) * 2.0;

	} else if( uAction.x == 1.0 ) {

		vec3 ringPos = vec3( 0.0 );
		float rad = vUv.x * TPI;
		float r = 0.8;
		ringPos.x = cos( rad ) * r;
		ringPos.y = (vUv.y - 0.5) * .5;
		ringPos.z = sin( rad ) * r;

		goalPos = ringPos;
		dir = normalize( vec3(ringPos.x, 0.0, ringPos.z ) );

		audio = texture( uAudioFreqTex, vec2( rnd.x, 0.0 ) ).x;
		audio = pow( audio, 1.0 ) * 1.0;

	} else if( uAction.x == 2.0 ) {

		vec3 pos = vec3( 0.0 );

		pos.x = sin( vUv.x * TPI + uTime );
		pos.y = cos( vUv.x * TPI + uTime );
		pos.z = (vUv.y - 0.5) * 3.0;
		pos.xy *= sin( vUv.y* PI );

		goalPos = pos;
		dir = normalize( pos );

		audio = texture( uAudioFreqTex, vec2( vUv.y - 0.5, 0.0 ) ).x;
		audio = pow( audio, 1.0 ) * 1.0;

	}

	// goalPos.xy *= rotate( uAction.z * 10.0 );
	goalPos *= 1.0 + uAction.z;
	goalPos *= 1.0 + snoise4D( vec4( goalPos * 2.0, uTime ) ) * uAction.z * 5.0;


	velocity *= 0.5;
	velocity.xyz += dir * audio * uMidi.w;
	velocity.xyz += (goalPos - position.xyz) * (0.4);
	position.xyz += velocity.xyz;



	position.xyz += (fbm3( position.xyz + uAction.x ) - 0.5) * uAction.y;
	position.w = 1.0;

	// out

	outColor0 = position;
	outColor1 = velocity;

} 