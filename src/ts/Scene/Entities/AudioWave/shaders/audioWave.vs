#include <common>
#include <vert_h>

uniform sampler2D uAudioWaveTex;
uniform vec4 uMidi;

out float vAudio;

void main( void ) {

	#include <vert_in>

	vec2 v = uv;
	v.x = abs( v.x - 0.5 ) * 2. * (uMidi.x * uMidi.x);
	v.x = 1.0 - v.x;

	float audio = texture( uAudioWaveTex, v ).x - 0.5;
	float w = audio;
	w *= uMidi.w * 0.5;
	outPos.y *= abs( w ) * 20.0;
	outPos.y += (w) * 5.0;

	vAudio = audio;
	
	#include <vert_out>

}