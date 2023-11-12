import * as GLP from 'glpower';

import { gl, power } from '~/ts/Globals';
import { Material, MaterialParam } from '../Material';

export interface PostProcessPassParam extends MaterialParam{
	// input?: ( GLPowerTexture | null )[],
	renderTarget?: GLP.GLPowerFrameBuffer | null,
	clearColor?: GLP.Vector;
	clearDepth?: number;
	resolutionRatio?: number;
	passThrough?: boolean;
}

import quadVert from './shaders/quad.vs';
import { ComponentResizeEvent } from '..';

export class PostProcessPass extends Material {

	public renderTarget: GLP.GLPowerFrameBuffer | null;

	public clearColor: GLP.Vector | null;
	public clearDepth: number | null;

	public resolutionRatio: number;
	public passThrough: boolean;

	public resolution: GLP.Vector;

	constructor( param: PostProcessPassParam ) {

		super( { ...param, vert: param.vert || quadVert } );

		this.resolution = new GLP.Vector();

		this.uniforms.uPPResolution = {
			value: this.resolution,
			type: '2fv'
		};

		this.uniforms.uPPPixelSize = {
			value: new GLP.Vector(),
			type: '2fv'
		};

		this.renderTarget = param.renderTarget !== undefined ? param.renderTarget : new GLP.GLPowerFrameBuffer( gl ).setTexture( [
			power.createTexture().setting( { magFilter: gl.LINEAR, minFilter: gl.LINEAR } ),
		] );

		this.clearColor = param.clearColor ?? null;
		this.clearDepth = param.clearDepth ?? null;
		this.depthTest = param.depthTest !== undefined ? param.depthTest : false;
		this.resolutionRatio = param.resolutionRatio || 1;
		this.passThrough = param.passThrough ?? false;

	}

	public onAfterRender() {
	}

	public resize( event: ComponentResizeEvent ): void {

		this.resolution.copy( event.resolution ).multiply( this.resolutionRatio );
		this.uniforms.uPPPixelSize.value.set( 1.0 / this.resolution.x, 1.0 / this.resolution.y );

		if ( this.renderTarget ) {

			this.renderTarget.setSize( this.resolution );

		}

	}

	public setRendertarget( renderTarget:GLP.GLPowerFrameBuffer | null ) {

		this.renderTarget = renderTarget;

		if ( this.renderTarget && ( this.renderTarget.size.x != this.resolution.x || this.renderTarget.size.y != this.resolution.y ) ) {

			this.renderTarget.setSize( this.resolution );

		}

	}

}
