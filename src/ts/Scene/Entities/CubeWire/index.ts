import * as GLP from 'glpower';
import * as MXP from 'maxpower';

import cubeWireVert from './shaders/cubeWire.vs';
import cubeWireFrag from './shaders/cubeWire.fs';

import { globalUniforms, lpd8 } from '~/ts/Globals';

export class CubeWire extends MXP.Entity {

	constructor() {

		super();

		const geo = this.addComponent( "geometry", new MXP.CubeGeometry( 0.005, 5, 0.005, 1, 20, 1 ) );

		const w = 1.0;
		const hw = w / 2.0;

		const posArray: number[] = [];
		const rotArray: number[] = [];

		for ( let i = 0; i < 3; i ++ ) {

			for ( let j = 0; j < 4; j ++ ) {

				const pos = [
					[ hw, 0.0, hw ],
					[ hw, 0.0, - hw ],
					[ - hw, 0.0, hw ],
					[ - hw, 0.0, - hw ],
				][ j ];

				pos.forEach( i => {

					posArray.push( i );

				} );


				const rot = [
					[ 0, 0, 0 ],
					[ Math.PI / 2, 0.0, 0 ],
					[ 0, 0.0, Math.PI / 2 ],
				][ i ];

				rot.forEach( i => {

					rotArray.push( i );

				} );

			}

		}

		geo.setAttribute( "instancePos", new Float32Array( posArray ), 3, { instanceDivisor: 1 } );
		geo.setAttribute( "instanceRot", new Float32Array( rotArray ), 3, { instanceDivisor: 1 } );

		const mat = this.addComponent( "material", new MXP.Material( {
			name: "cubeWire",
			type: [ "deferred", "shadowMap" ],
			uniforms: GLP.UniformsUtils.merge( globalUniforms.time, {
				uMidi: {
					value: lpd8.vectorsLerped[ 0 ],
					type: '4fv'
				}
			} ),
			vert: MXP.hotGet( 'cubeWireVert', cubeWireVert ),
			frag: MXP.hotGet( 'cubeWireFrag', cubeWireFrag ),
		} ) );

		if ( import.meta.hot ) {

			import.meta.hot.accept( "./shaders/cubeWire.vs", ( module ) => {

				if ( module ) {

					mat.vert = MXP.hotUpdate( 'cubeWireVert', module.default );

					mat.requestUpdate();

				}

			} );

			import.meta.hot.accept( "./shaders/cubeWire.fs", ( module ) => {

				if ( module ) {

					mat.frag = MXP.hotUpdate( 'cubeWireFrag', module.default );

					mat.requestUpdate();

				}

			} );

		}

	}

}
