#include <common>

#include <packing>
#include <frag_h>

#ifdef USE_COLOR

	uniform vec4 uBaseColor;

#endif

#ifdef USE_COLOR_MAP

	uniform sampler2D uBaseColorMap;

#endif

#ifdef USE_ROUGHNESS

	uniform float uRoughness;

#endif

#ifdef USE_METALNESS

	uniform float uMetalness;

#endif

#ifdef USE_MR_MAP

	uniform sampler2D uMRMap;

#endif

#ifdef USE_EMISSION

	uniform vec3 uEmission;

#endif


#ifdef USE_EMISSION_MAP

	uniform sampler2D uEmissionMap;

#endif

#ifdef USE_EMISSION_STRENGTH

	uniform float uEmissionStrength;

#endif

void main( void ) {

	#include <frag_in>

	vec2 mapUv = vUv;
	mapUv.y = 1.0 - mapUv.y;

	#ifdef USE_COLOR

		outColor = uBaseColor;

	#endif

	#ifdef USE_COLOR_MAP

		outColor = texture( uBaseColorMap, mapUv );

	#endif

	outMetalic = 1.0;

	#ifdef USE_MR_MAP

		vec4 mr = texture( uMRMap, mapUv );
		outRoughness = mr.y;
		outMetalic = mr.z;

	#endif
	
	#ifdef USE_ROUGHNESS

		outRoughness = uRoughness;

	#endif

	#ifdef USE_METALNESS

		outMetalic = uMetalness;

	#endif

	#ifdef USE_EMISSION

		outEmission = uEmission;

	#endif

	#ifdef USE_EMISSION_MAP

		vec4 emission = texture( uEmissionMap, mapUv );
		outEmission = emission.xyz;

	#endif

	#ifdef USE_EMISSION_STRENGTH

		outEmissionIntensity *= uEmissionStrength;

	#endif

	#include <frag_out>

} 