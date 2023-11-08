import * as GLP from 'glpower';
import * as MXP from 'maxpower';

import gridVert from './shaders/grid.vs';
import gridFrag from './shaders/grid.fs';

import { globalUniforms, lpd8 } from '~/ts/Globals';

export class Grid extends MXP.Entity {

	constructor() {

		super();

		const geo = this.addComponent( "geometry", new MXP.CubeGeometry( 0.001, 0.015, 0.001, 1, 1, 1 ) );

		const w = 1.0;
		const hw = w / 2.0;

		const posArray: number[] = [];
		const rotArray: number[] = [];

		const num = 11;

		for ( let i = 0; i < num; i ++ ) {

			for ( let j = 0; j < num; j ++ ) {

				for ( let k = 0; k < num; k ++ ) {

					const x = i / num - 0.5;
					const y = j / num - 0.5;
					const z = k / num - 0.5;

					posArray.push( x, y, z );
					rotArray.push( 0.0, 0.0, 0.0 );

					posArray.push( x, y, z );
					rotArray.push( Math.PI / 2, 0.0, 0.0 );

					posArray.push( x, y, z );
					rotArray.push( 0.0, 0.0, Math.PI / 2 );

				}

			}

		}

		geo.setAttribute( "instanceRot", new Float32Array( rotArray ), 3, { instanceDivisor: 1 } );
		geo.setAttribute( "instancePos", new Float32Array( posArray ), 3, { instanceDivisor: 1 } );

		const mat = this.addComponent( "material", new MXP.Material( {
			name: "grid",
			type: [ "deferred" ],
			uniforms: GLP.UniformsUtils.merge( globalUniforms.time, {
				uMidi: {
					value: lpd8.vectorsLerped[ 0 ],
					type: "4fv"
				}
			} ),
			vert: MXP.hotGet( 'gridVert', gridVert ),
			frag: MXP.hotGet( 'gridFrag', gridFrag ),
		} ) );

		if ( import.meta.hot ) {

			import.meta.hot.accept( "./shaders/grid.vs", ( module ) => {

				if ( module ) {

					mat.vert = MXP.hotUpdate( 'gridVert', module.default );

					mat.requestUpdate();

				}

			} );

			import.meta.hot.accept( "./shaders/grid.fs", ( module ) => {

				if ( module ) {

					mat.frag = MXP.hotUpdate( 'gridFrag', module.default );

					mat.requestUpdate();

				}

			} );

		}

	}

}
