#include <common>
#include <packing>
#include <frag_h>

#include <re>

uniform vec4 uMidi2;

in vec3 vRnd;
in float vAudio;

void main( void ) {

	#include <frag_in>

	outColor = vec4( 1.0 );
	outColor.xyz *= 1.0;

	outRoughness = .2;
	outMetalic = 0.0;

	
	float dnv = dot( normalize( vViewNormal ), normalize( -vMVPosition ) );
	float e = pow( smoothstep(0.0, 0.9, dnv ), 3.0 );
	e *= vAudio * 3.0 * uMidi2.x;

	
	float emit = step( 0.95, vRnd.x );
	outEmission += emit * e * vec3( 0.8, 5.0, 0.8 );
	
	#include <frag_out>

} 