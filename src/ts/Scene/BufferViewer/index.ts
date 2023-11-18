import * as GLP from 'glpower';
import * as MXP from 'maxpower';
import { Renderer } from '../Renderer';

export class BufferViewer extends GLP.EventEmitter {

	private gl: WebGL2RenderingContext;

	private renderer: Renderer;

	private srcFrameBuffer: GLP.GLPowerFrameBuffer;
	private outFrameBuffer: GLP.GLPowerFrameBuffer;

	private count: number;
	private total: number;
	private tile: GLP.Vector;
	private tileInv: GLP.Vector;

	private resolution: GLP.Vector;

	private outPostProcess: MXP.PostProcess;

	constructor( gl: WebGL2RenderingContext ) {

		super();

		this.gl = gl;

		this.renderer = new Renderer();

		this.srcFrameBuffer = new GLP.GLPowerFrameBuffer( gl, { disableDepthBuffer: true } );
		this.outFrameBuffer = new GLP.GLPowerFrameBuffer( gl, { disableDepthBuffer: true } ).setTexture( [
			new GLP.GLPowerTexture( gl ).setting( ),
		] );

		this.count = 0;
		this.total = 1;
		this.tile = new GLP.Vector( 1, 1 );
		this.tileInv = new GLP.Vector( 1, 1 );

		this.resolution = new GLP.Vector();

		this.outPostProcess = new MXP.PostProcess( {
			input: this.outFrameBuffer.textures,
			passes: [ new MXP.PostProcessPass( {
				renderTarget: null
			} ) ],
		} );

	}

	public push( frameBuffer: GLP.GLPowerFrameBuffer ) {

		for ( let i = 0; i < frameBuffer.textures.length; i ++ ) {

			const tex = frameBuffer.textures[ i ];

			this.srcFrameBuffer.setSize( tex.size );
			this.srcFrameBuffer.setTexture( [ tex ], true );

			this.gl.bindFramebuffer( this.gl.READ_FRAMEBUFFER, this.srcFrameBuffer.getFrameBuffer() );
			this.gl.bindFramebuffer( this.gl.DRAW_FRAMEBUFFER, this.outFrameBuffer.getFrameBuffer() );

			const x = this.count % this.tile.x * this.tileInv.x * this.resolution.x;
			const y = Math.floor( this.count / this.tile.x ) * this.tileInv.y * this.resolution.y;

			this.gl.blitFramebuffer(
				0, 0, frameBuffer.size.x, frameBuffer.size.y,
				x, y,
				x + this.tileInv.x * this.resolution.x, y + this.tileInv.y * this.resolution.y,
				this.gl.COLOR_BUFFER_BIT, this.gl.NEAREST );

			this.srcFrameBuffer.setTexture( [], true );

			this.count ++;

		}

	}

	public draw() {

		this.renderer.renderPostProcess( this.outPostProcess );

		this.total = this.count;
		this.count = 0;

		const sqrt = Math.sqrt( this.total );

		this.tile.set( Math.round( sqrt ), Math.ceil( sqrt ) );

		this.tileInv.set( 1.0, 1.0 ).divide( this.tile );

	}

	public resize( resolution: GLP.Vector ) {

		this.resolution.copy( resolution );

		this.outFrameBuffer.setSize( resolution );

		this.outPostProcess.resize( resolution );

		this.renderer.resize( resolution );

	}

}
