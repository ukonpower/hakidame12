#include <common>
#include <frag_h>

uniform sampler2D uAudioFreqTex;

uniform sampler2D uNoiseTex;

in vec4 vGpuPos;
in vec4 vGpuVel;

void main( void ) {

	#include <frag_in>

	outEmission += smoothstep( 0.0, 0.4, length( vGpuVel ) );
	
	#include <frag_out>

}