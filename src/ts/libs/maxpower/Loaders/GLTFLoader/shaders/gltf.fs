#include <common>

#include <packing>
#include <frag_h>

#ifdef USE_MAP

	uniform sampler2D uBaseColorMap;

#endif

void main( void ) {

	#include <frag_in>

	#ifdef USE_MAP

		vec2 uv = vUv;
		uv.y = 1.0 - uv.y;

		outColor = texture( uBaseColorMap, uv );

	#endif

	#include <frag_out>

} 