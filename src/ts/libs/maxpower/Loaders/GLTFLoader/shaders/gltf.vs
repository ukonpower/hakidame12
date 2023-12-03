#include <common>
#include <vert_h>

#ifdef USE_TANGENT

	layout ( location = 3 ) in vec4 tangent;
	out vec3 vTangent;
	out vec3 vBitangent;

#endif

void main( void ) {

	#include <vert_in>
	#include <vert_out>

	#ifdef USE_TANGENT

		vTangent = tangent.xyz;
		vBitangent = normalize( cross( tangent.xyz, vec3( 0.0, 1.0, 0.0 ) ) * tangent.w );

	#endif

}