#include <common>
#include <packing>
#include <light_h>
#include <noise>

// uniforms

uniform sampler2D uSSAOTexture;
uniform vec2 uPPPixelSize;

uniform sampler2D uNormalTexture;
uniform sampler2D uDepthTexture;

// varying

in vec2 vUv;

layout (location = 0) out vec4 outColor;

#define SSAOSAMPLE 16

float gauss(float x, float x0, float sx){
    
    float arg = x-x0;
    arg = -1./2.*arg*arg/sx;
    
    float a = 1./(sqrt(2.*3.1415*sx));
    
    return a*exp(arg);
}

void main( void ) {

	float occlusion = 0.0;

	vec2 offset = vec2( uPPPixelSize );	
	float weight = 0.0;

	vec3 normalBasis = texture( uNormalTexture, vUv ).xyz;
	float depthBasis = texture( uDepthTexture, vUv ).w;

	float alpha = 32.0;
	float beta = 0.25;

	for(int i = 0; i < SSAOSAMPLE; i++){
		
		for(int j = 0; j < SSAOSAMPLE; j++){

			vec2 offset = vec2( float( i ), float(j) );
			offset /= float( SSAOSAMPLE );
			offset -= 0.5;
			offset *= uPPPixelSize * 16.0;

			vec2 uvOffset = vUv + offset;

			float xw = float( i ) / float( SSAOSAMPLE ) - 0.5;
			float yw = float( j ) / float( SSAOSAMPLE ) - 0.5;

			vec3 normalOffset = texture( uNormalTexture, uvOffset ).xyz;
			float depthOffset = texture( uDepthTexture, uvOffset ).w;

			float bilateralWeight = pow( ( dot( normalBasis, normalOffset ) + 1.0 ) / 2.0, alpha ) * pow( 1.0 / ( abs( depthBasis - depthOffset ) + 0.001 ), beta );

			float gx = gauss( xw, 0.0, 0.5 );
			float gy = gauss( yw, 0.0, 0.5 );

			float gw = gx * gy * bilateralWeight;

			occlusion += texture( uSSAOTexture, uvOffset ).x * gw;

			weight += gw;

		}
		
	}

	occlusion /= weight;

	outColor = vec4( vec3( occlusion ), 1.0 );

}