#include <common>
#include <packing>
#include <frag_h>

#include <sdf>
#include <noise4D>
#include <rotate>

uniform vec4 uMidi;
uniform vec3 cameraPosition;
uniform mat4 modelMatrixInverse;

uniform float uTime;
uniform float uTimeSeq;
uniform float uVisibility;

vec2 D( vec3 p ) {

	vec3 pp = p;

	vec2 d = vec2( 99999.0, 0.0 );

	float t = uTime * 0.25;
	
	float rot = floor( t ) + ( 1.0 - exp( fract( t ) * - 5.0 ));
	float rot2 = floor( t * 0.5 ) + ( 1.0 - exp( fract( t * 0.5 ) * - 20.0 ));
	
	float vInv = 1.0 - uVisibility;
	pp.xz *= rotate( vInv * 2.0 );
	pp.yz *= rotate( vInv * 5.0 );

	vec3 boxSize = vec3( 0.01 + uMidi.y * 0.1, 0.1 * uMidi.x, 0.01 + uMidi.y * 0.1 ) * uVisibility * uMidi.w * 2.0;

	for( int i = 0; i < 8; i++ ) {


		pp.x = abs( pp.x );
		pp.x -= 0.05;

		pp.xz *= rotate( rot * PI / 2.0 );
		pp.zy *= rotate( rot * PI / 4.0 );

		pp.z = abs( pp.z );
		pp.z -= 0.05;
		
		pp.xz *= rotate( rot * PI / 4.0 );
		pp.xy *= rotate( rot * PI / 9.0 );

		pp.yz *= rotate( vInv * 2.0 );

	}

	d = add( d, vec2( sdBox( pp, boxSize ), 1.0 ) );

	return d;

}

vec3 N( vec3 pos, float delta ){

    return normalize( vec3(
		D( pos ).x - D( vec3( pos.x - delta, pos.y, pos.z ) ).x,
		D( pos ).x - D( vec3( pos.x, pos.y - delta, pos.z ) ).x,
		D( pos ).x - D( vec3( pos.x, pos.y, pos.z - delta ) ).x
	) );
	
}

void main( void ) {

	#include <frag_in>

	vec3 rayPos = ( modelMatrixInverse * vec4( gl_FrontFacing ? vPos : cameraPosition , 1.0 ) ).xyz;
	vec3 rayDir = normalize( ( modelMatrixInverse * vec4( normalize( vPos - cameraPosition ), 0.0 ) ).xyz );
	vec2 dist = vec2( 0.0 );
	bool hit = false;

	vec3 normal;
	
	for( int i = 0; i < 64; i++ ) { 

		dist = D( rayPos );		
		rayPos += dist.x * rayDir;

		if( dist.x < 0.001 ) {

			normal = N( rayPos, 0.000001 );

			hit = true;
			break;

		}
		
	}

	if( dist.y == 1.0 ) {
		
		outRoughness = 0.05;
		outMetalic = 0.0;
		outColor.xyz = vec3( 1.1 );

	} 
		
	outNormal = normalize(modelMatrix * vec4( normal, 0.0 )).xyz;

	if( !hit ) discard;

	outPos = ( modelMatrix * vec4( rayPos, 1.0 ) ).xyz;

	#if defined(IS_DEPTH) || defined(IS_DEFERRED)
		vec4 mv = viewMatrix * vec4(outPos, 1.0);
	#endif


	#ifdef IS_DEPTH
		float depth_z = (-mv.z - cameraNear) / (cameraFar - cameraNear);
		outColor0 = vec4(floatToRGBA( depth_z ));
	#endif

	#ifdef IS_DEFERRED
		vec4 mvp = projectionMatrix * mv;
		gl_FragDepth = ( mvp.z / mvp.w ) * 0.5 + 0.5;
		outColor0 = vec4( outPos, 1.0 );
		outColor1 = vec4( normalize( outNormal ), packColor( outSS ) );
		outColor2 = vec4( outColor.xyz, outRoughness);
		outColor3 = vec4( outEmission, outMetalic );
		outColor4 = vec4( vVelocity * 0.5, 0.0, outEnv );
	#endif

}