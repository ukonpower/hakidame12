import * as GLP from 'glpower';
import * as MXP from 'maxpower';


import hudVert from './shaders/hud.vs';
import hudFrag from './shaders/hud.fs';
import { gl, globalUniforms } from '~/ts/Globals';

export class HUD extends MXP.Entity {

	constructor() {

		super();

		const img = document.createElement( "img" );
		img.src = "data:image/svg+xml," + encodeURIComponent( `
		<svg width="512" height="256" viewBox="0 0 512 256" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path d="M128.985 95.4286H80.9254V157.143H183.91V44H26V212H252.567V44H486V212H324.657V95.4286H431.075V157.143H376.149" stroke="white" stroke-width="8"/>
		</svg>
		` );

		const texture = new GLP.GLPowerTexture( gl );
		texture.setting( {
			wrapS: gl.REPEAT,
			wrapT: gl.REPEAT,
		} );

		img.onload = () => {

			texture.attach( img );

		};

		const border = new MXP.Entity();
		this.add( border );

		const borderGeo = border.addComponent( "geometry", new MXP.PlaneGeometry( 2.0, 2.0 ) );

		borderGeo.setAttribute( 'num', new Float32Array( ( ()=>{

			const num = 2;

			const r: number[] = [];

			for ( let i = 0; i < num; i ++ ) {

				r.push( i );

			}

			return r;

		} )() ), 1, { instanceDivisor: 1 } );

		const mat = border.addComponent( "material", new MXP.Material( {
			frag: MXP.hotGet( 'hudFrag', hudFrag ),
			vert: MXP.hotGet( 'hudVert', hudVert ),
			uniforms: GLP.UniformsUtils.merge( globalUniforms.time, {
				uTex: {
					value: texture,
					type: "1i"
				}
			} ),
			type: [ "ui" ],
		} ) );

		if ( import.meta.hot ) {

			import.meta.hot.accept( "./shaders/hud.vs", ( module ) => {

				if ( module ) {

					mat.vert = MXP.hotUpdate( 'hudVert', module.default );
					mat.requestUpdate();

				}

			} );

			import.meta.hot.accept( "./shaders/hud.fs", ( module ) => {

				if ( module ) {

					mat.frag = MXP.hotUpdate( 'hudFrag', module.default );
					mat.requestUpdate();

				}

			} );

		}


	}

}
