#include <common>
#include <frag_h>

void main( void ) {

	#include <frag_in>

	// outEnv = 1.8;
	outColor.xyz = vec3( 1.0, 0.0, 0.0 );
	outMetalic = 0.4;

	// otuEmission += 
	outEmission += 0.9;

	
	#include <frag_out>

}