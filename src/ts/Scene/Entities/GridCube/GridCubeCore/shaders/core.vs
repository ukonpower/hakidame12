#include <common>
#include <vert_h>

uniform sampler2D uAudioFreqTex;

void main( void ) {

	float audio = texture( uAudioFreqTex, vec2( 0.4, 0.0 ) ).x;
	audio = pow( audio, 1.0 ) * 2.0;

	#include <vert_in>

	outPos *= 1.0 + audio * 1.0;

	#include <vert_out>

}