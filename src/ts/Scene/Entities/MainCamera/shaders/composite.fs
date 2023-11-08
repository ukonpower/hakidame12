#include <common>

uniform sampler2D backbuffer0;
uniform sampler2D uBloomTexture[4];
uniform sampler2D uAudioWaveTex;
uniform sampler2D uTitleTex;

uniform vec3 cameraPosition;
uniform float cameraNear;
uniform float cameraFar;
uniform vec4 uMidi;
uniform vec4 uMidi2;
uniform vec4 uMidiMaster;
uniform float uTitleVis;

in vec2 vUv;

layout (location = 0) out vec4 outColor;

vec2 lens_distortion(vec2 r, float alpha) {
    return r * (1.0 - alpha * dot(r, r));
}

// https://github.com/dmnsgn/glsl-tone-map/blob/main/filmic.glsl

vec3 filmic(vec3 x) {
  vec3 X = max(vec3(0.0), x - 0.004);
  vec3 result = (X * (6.2 * X + 0.5)) / (X * (6.2 * X + 1.7) + 0.06);
  return pow(result, vec3(2.2));
}

void main( void ) {

	float audioWave = texture(uAudioWaveTex, vec2( vUv.x * 0.15, 0.0 ) ).x - 0.5;

	vec3 col = vec3( 0.0, 0.0, 0.0 );
	vec2 uv = vUv;
	vec2 cuv = uv - 0.5;
	float len = length(cuv);
	float w = 0.001 + audioWave * 20.0 * uMidi2.x;


	float d;
	#pragma loop_start 8
		d = -float( LOOP_INDEX ) / 8.0 * w;
        col.x += texture( backbuffer0, (lens_distortion( cuv + vec2( (float( LOOP_INDEX ) / 8.0 - 0.5 ) * 0.007, 0.0 ), d ) * 0.95 + 0.5)).x;
        col.y += texture( backbuffer0, lens_distortion( cuv, d * 3.0 ) * 0.95 + 0.5 ).y;
        col.z += texture( backbuffer0, lens_distortion( cuv, d * 6.0 ) * 0.95 + 0.5 ).z;
	#pragma loop_end
	col.xyz /= 8.0;


	col = filmic( col ) * 1.4;
	
	#pragma loop_start 4
		col += texture( uBloomTexture[ LOOP_INDEX ], uv ).xyz * ( 0.5 + float(LOOP_INDEX) * 0.5 ) * 0.2;
	#pragma loop_end

	col *= smoothstep( 1.0, 0.4, len );

	outColor = vec4( col, 1.0 );

	outColor.xyz *= 1.0 - (uMidi.z * uMidi.w);
	
	vec4 ttl = texture( uTitleTex, vUv );
	outColor.xyz = mix( outColor.xyz, vec3( 1.0 ), ttl.w * uMidi.w * uTitleVis );

	outColor.xyz *= uMidiMaster.x;
}