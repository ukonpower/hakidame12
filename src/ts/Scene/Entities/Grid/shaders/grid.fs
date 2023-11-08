#include <common>
#include <frag_h>

uniform float uTime;

void main( void ) {

	#include <frag_in>

	outColor *= 0.0;
	outMetalic = 1.0;
	outRoughness = 1.0;
	outEmission += 0.4;
	
	#include <frag_out>

}