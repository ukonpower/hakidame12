import * as GLP from 'glpower';
import * as MXP from 'maxpower';

import finalCubeVert from './shaders/finalCube.vs';
import finalCubeFrag from './shaders/finalCube.fs';

import { globalUniforms, midimix } from '~/ts/Globals';

export class FinalCube extends MXP.Entity {

	private uniforms: GLP.Uniforms;

	constructor() {

		super();

		this.addComponent( "geometry", new MXP.CubeGeometry( 1, 1, 1, 5, 5, 5 ) );

		const mat = this.addComponent( "material", new MXP.Material( {
			name: "finalCube",
			type: [ "deferred", "shadowMap" ],
			uniforms: GLP.UniformsUtils.merge( globalUniforms.time, {
				uMidi: {
					value: midimix.vectorsLerped[ 3 ],
					type: '4fv'
				},
				uVisibility: {
					value: 0,
					type: '1f'
				}
			} ),
			// vert: MXP.hotGet( 'finalCubeVert', finalCubeVert ),
			frag: MXP.hotGet( 'finalCubeFrag', finalCubeFrag ),
			cullFace: false
		} ) );

		this.uniforms = mat.uniforms;

		if ( import.meta.hot ) {

			// import.meta.hot.accept( "./shaders/finalCube.vs", ( module ) => {

			// 	if ( module ) {

			// 		mat.vert = MXP.hotUpdate( 'finalCubeVert', module.default );

			// 		mat.requestUpdate();

			// 	}

			// } );

			import.meta.hot.accept( "./shaders/finalCube.fs", ( module ) => {

				if ( module ) {

					mat.frag = MXP.hotUpdate( 'finalCubeFrag', module.default );

					mat.requestUpdate();

				}

			} );

		}

	}

	public set visiblity( value: number ) {

		this.uniforms.uVisibility.value = value;

	}

}
