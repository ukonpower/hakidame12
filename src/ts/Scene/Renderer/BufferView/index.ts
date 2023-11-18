import * as GLP from 'glpower';
import * as MXP from 'maxpower';

export class BufferView extends GLP.EventEmitter {

	private gl: WebGL2RenderingContext;

	private srcFrameBuffer: GLP.GLPowerFrameBuffer;
	private renderTraget: GLP.GLPowerFrameBuffer | null;

	private count: number;
	private total: number;
	private tile: GLP.Vector;
	private tileInv: GLP.Vector;

	private resolution: GLP.Vector;

	constructor( gl: WebGL2RenderingContext ) {

		super();

		this.gl = gl;

		this.srcFrameBuffer = new GLP.GLPowerFrameBuffer( gl, { disableDepthBuffer: true } );
		this.renderTraget = null;

		this.count = 0;
		this.total = 1;
		this.tile = new GLP.Vector( 1, 1 );
		this.tileInv = new GLP.Vector( 1, 1 );

		this.resolution = new GLP.Vector();

	}

	public setRenderTarget() {
	}

	public clear() {

		this.total = this.count;
		this.count = 0;

		const sqrt = Math.sqrt( this.total );

		this.tile.set( Math.round( sqrt ), Math.ceil( sqrt ) );

		this.tileInv.set( 1.0, 1.0 ).divide( this.tile );

	}

	public draw( frameBuffer: GLP.GLPowerFrameBuffer ) {

		for ( let i = 0; i < frameBuffer.textures.length; i ++ ) {

			const tex = frameBuffer.textures[ i ];

			this.srcFrameBuffer.setSize( tex.size );
			this.srcFrameBuffer.setTexture( [ tex ], true );

			this.gl.bindFramebuffer( this.gl.READ_FRAMEBUFFER, this.srcFrameBuffer.getFrameBuffer() );
			this.gl.bindFramebuffer( this.gl.DRAW_FRAMEBUFFER, this.renderTraget );

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

		// frameBuffer.setSize( frameBuffer.size );
		// frameBuffer.setTexture( frameBuffer.textures );

	}

	public resize( resolution: GLP.Vector ) {

		this.resolution.copy( resolution );

	}

}
