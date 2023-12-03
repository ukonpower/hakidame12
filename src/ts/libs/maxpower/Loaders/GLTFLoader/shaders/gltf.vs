#include <common>
#include <vert_h>

#ifdef USE_TANGENT

	layout ( location = 3 ) in vec3 tangent;
	out vec3 vTangent;
	out vec3 vBitangent;

#endif

void main( void ) {

	#include <vert_in>
	#include <vert_out>

	#ifdef USE_TANGENT

		vTangent = tangent;
		vBitangent = normalize( cross( tangent, vec3( 0.0, 1.0, 0.0 ) ) );

	#endif

}