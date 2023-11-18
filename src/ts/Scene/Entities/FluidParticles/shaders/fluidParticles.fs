#include <common>
#include <packing>
#include <frag_h>

#include <re>

in vec3 vRnd;

void main( void ) {

	#include <frag_in>

	outColor = vec4( 1.0 );
	outColor.xyz *= 1.0;

	float dnv = dot( normalize( vViewNormal ), normalize( -vMVPosition ) );
	float e = pow( smoothstep(0.0, 0.9, dnv ), 3.0 );
	e *= 1.0;
	
	float emit = step( 0.95, vRnd.x );
	outEmission += vec3( 1.0, 0.0, 0.0 );
	
	#include <frag_out>

} 