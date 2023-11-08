import * as GLP from 'glpower';
import * as MXP from 'maxpower';

import gridCubeVert from './shaders/gridCube.vs';
import gridCubeFrag from './shaders/gridCube.fs';

import gridCubeCompute from './shaders/gridCubeCompute.glsl';

import { gl, globalUniforms, lpd8, midimix, mpkmini } from '~/ts/Globals';
import { gridCubeInstance } from './instance';
import { GridCubeCore } from './GridCubeCore';

export class GridCube extends MXP.Entity {

	private gpu: MXP.GPUComputePass;

	private action: GLP.Vector = new GLP.Vector();
	private tmpQuaternion: GLP.Quaternion;
	private tmpVector: GLP.Vector;
	private tmpEuler: GLP.Euler;

	constructor() {

		super();

		const res = 16;

		const count = new GLP.Vector( res * res, res );
		this.tmpQuaternion = new GLP.Quaternion();
		this.tmpVector = new GLP.Vector( );
		this.tmpEuler = new GLP.Euler( 1.0, 1.0, 1.0 );

		const commonUnforms: GLP.Uniforms = GLP.UniformsUtils.merge( {
			uGrid: {
				value: res,
				type: "1f"
			},
			uGridInv: {
				value: 1.0 / res,
				type: "1f"
			},
			uMidi: {
				value: midimix.vectorsLerped[ 0 ],
				type: "4fv"
			},
			uAction: {
				value: this.action,
				type: "4fv"
			},
		}, globalUniforms.audio, globalUniforms.time, );

		lpd8.on( "pad2/1", ( value: number ) => {

			this.action.x = ( this.action.x + 1 ) % 3;
			this.action.y += value;

		} );

		lpd8.on( "pad2/0", ( value: number ) => {

			this.action.z = value;

		} );

		/*-------------------------------
			GPU
		-------------------------------*/

		this.gpu = new MXP.GPUComputePass( gl, {
			name: 'gpu/GridCube',
			size: count,
			layerCnt: 2,
			frag: MXP.hotGet( "paraCompute", gridCubeCompute ),
			uniforms: GLP.UniformsUtils.merge( commonUnforms ),
		} );

		this.gpu.initTexture( ( l, x, y ) => {

			if ( l == 0 ) {

				return [ 0, 0, 0, Math.random() ];

			} else {

				return [ 0, 0, 0, Math.random() ];

			}

		} );

		this.addComponent( "gpuCompute", new MXP.GPUCompute( { passes: [
			this.gpu
		] } ) );

		/*-------------------------------
			Geometry
		-------------------------------*/

		const geo = this.addComponent( "geometry", new MXP.CubeGeometry( 1 / res, 1 / res, 1 / res ) );

		const { positionArray, normalArray, idArray, randomArray } = gridCubeInstance( res );

		geo.setAttribute( "instancePos", new Float32Array( positionArray ), 3, { instanceDivisor: 1 } );
		geo.setAttribute( "instanceNormal", new Float32Array( normalArray ), 3, { instanceDivisor: 1 } );
		geo.setAttribute( "instanceId", new Float32Array( idArray ), 4, { instanceDivisor: 1 } );
		geo.setAttribute( "instanceRandom", new Float32Array( randomArray ), 3, { instanceDivisor: 1 } );

		/*-------------------------------
			Material
		-------------------------------*/

		const mat = this.addComponent( "material", new MXP.Material( {
			name: "gridCube",
			type: [ "deferred", "shadowMap" ],
			uniforms: GLP.UniformsUtils.merge( globalUniforms.time, globalUniforms.tex, this.gpu.outputUniforms, commonUnforms ),
			vert: MXP.hotGet( 'gridCubeVert', gridCubeVert ),
			frag: MXP.hotGet( 'gridCubeFrag', gridCubeFrag ),
		} ) );

		/*-------------------------------
			Hot
		-------------------------------*/

		if ( import.meta.hot ) {

			import.meta.hot.accept( "./shaders/gridCube.vs", ( module ) => {

				if ( module ) {

					mat.vert = MXP.hotUpdate( 'gridCubeVert', module.default );

				}

				mat.requestUpdate();

			} );

			import.meta.hot.accept( "./shaders/gridCube.fs", ( module ) => {

				if ( module ) {

					mat.frag = MXP.hotUpdate( 'gridCubeFrag', module.default );

				}

				mat.requestUpdate();

			} );

			import.meta.hot.accept( "./shaders/gridCubeCompute.glsl", ( module ) => {

				if ( module ) {

					this.gpu.frag = MXP.hotUpdate( 'gridCubeCompute', module.default );

				}

				this.gpu.requestUpdate();

			} );


		}

		/*-------------------------------
			Core
		-------------------------------*/

		const core = new GridCubeCore( commonUnforms );
		this.add( core );

	}

	protected updateImpl( event: MXP.EntityUpdateEvent ): void {

		this.action.y *= 0.8;
		this.action.z *= 0.95;

		this.tmpQuaternion.setFromEuler( this.tmpVector.copy( this.tmpEuler ).multiply( this.action.y ) );


	}

}
