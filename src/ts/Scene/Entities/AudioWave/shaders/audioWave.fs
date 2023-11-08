#include <common>
#include <frag_h>

uniform vec4 uMidi;

in float vAudio;

void main( void ) {

	#include <frag_in>

	float len = abs( vUv.y - 0.5 );
	len *= abs( vAudio ) * 18.0 * uMidi.y + 0.5;

	float vig = uMidi.y;

	vec3 emit = vec3( 0.0 );
	emit.x += sin( len * (TPI) * (1.0 + vig * 0.0));
	emit.y += sin( len * (TPI) * (1.0 + vig * 0.1) );
	emit.z += sin( len * (TPI) * (1.0 + vig * 0.2) );

	outEmission = emit * uMidi.z;
	outEnv = 0.0;

	// outEmission = vec3( 1.0 );
	
	#include <frag_out>

}