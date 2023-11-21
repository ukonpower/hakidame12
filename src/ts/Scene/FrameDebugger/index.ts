import * as GLP from 'glpower';
import * as MXP from 'maxpower';
import { Renderer } from '../Renderer';
import frameDebuggerFrag from './shaders/frameDebugger.fs';

type Frame = {
	frameBuffer: GLP.GLPowerFrameBuffer,
	texture: GLP.GLPowerTexture,
	label: string,
}


export class FrameDebugger extends GLP.EventEmitter {

	private gl: WebGL2RenderingContext;
	private renderer: Renderer;

	// buffers

	private srcFrameBuffer: GLP.GLPowerFrameBuffer;
	private outFrameBuffer: GLP.GLPowerFrameBuffer;
	private frameList: Frame[];

	// status

	private _enable: boolean;

	private resolution: GLP.Vector;
	private count: number;
	private total: number;
	private tile: GLP.Vector;
	private tilePixelSize: GLP.Vector;
	private tileInv: GLP.Vector;

	// controls

	private focus: number | null;

	// postprocess

	private uniforms: GLP.Uniforms;
	private outPostProcess: MXP.PostProcess;

	// canvas

	private canvas: HTMLCanvasElement;
	private cctx: CanvasRenderingContext2D;
	private canvasTexture: GLP.GLPowerTexture;


	constructor( gl: WebGL2RenderingContext ) {

		super();

		this.gl = gl;

		this.renderer = new Renderer();

		this.srcFrameBuffer = new GLP.GLPowerFrameBuffer( gl, { disableDepthBuffer: true } );
		this.outFrameBuffer = new GLP.GLPowerFrameBuffer( gl, { disableDepthBuffer: true } ).setTexture( [
			new GLP.GLPowerTexture( gl ).setting( ),
		] );

		this._enable = false;
		this.count = 0;
		this.total = 1;
		this.tile = new GLP.Vector( 1, 1 );
		this.tilePixelSize = new GLP.Vector( 1, 1 );
		this.tileInv = new GLP.Vector( 1, 1 );

		this.focus = null;

		this.resolution = new GLP.Vector();

		// canvas

		this.canvas = document.createElement( "canvas" );
		this.cctx = this.canvas.getContext( "2d" )!;

		this.canvasTexture = new GLP.GLPowerTexture( gl ).attach( this.canvas );

		// out

		this.uniforms = {
			uCanvas: {
				value: this.canvasTexture,
				type: "1i"
			}
		};

		this.outPostProcess = new MXP.PostProcess( {
			input: this.outFrameBuffer.textures,
			passes: [ new MXP.PostProcessPass( {
				uniforms: this.uniforms,
				renderTarget: null,
				frag: frameDebuggerFrag
			} ) ],
		} );

		this.frameList = [];

		// controls

		const onClick = this.onClick.bind( this );

		window.addEventListener( "click", onClick );

		this.once( "dispose", () => {

			window.removeEventListener( "click", onClick );

		} );

	}

	private calcTilePos( num: number ) {

		const x = num % this.tile.x * this.tileInv.x * this.resolution.x;
		const y = Math.floor( num / this.tile.x ) * this.tileInv.y * this.resolution.y;

		return { x, y };

	}

	public push( frameBuffer: GLP.GLPowerFrameBuffer, label?: string ) {

		for ( let i = 0; i < frameBuffer.textures.length; i ++ ) {

			if ( this.focus == null || this.focus == this.count ) {

				const tex = frameBuffer.textures[ i ];

				this.srcFrameBuffer.setSize( tex.size );
				this.srcFrameBuffer.setTexture( [ tex ], true );

				this.gl.bindFramebuffer( this.gl.READ_FRAMEBUFFER, this.srcFrameBuffer.getFrameBuffer() );
				this.gl.bindFramebuffer( this.gl.DRAW_FRAMEBUFFER, this.outFrameBuffer.getFrameBuffer() );

				let { x, y } = this.calcTilePos( this.count );
				let w = this.tilePixelSize.x, h = this.tilePixelSize.y;

				if ( this.focus !== null ) {

					x = 0;
					y = 0;
					w = this.resolution.x;
					h = this.resolution.y;

				}

				this.gl.blitFramebuffer(
					0, 0, frameBuffer.size.x, frameBuffer.size.y,
					x, this.resolution.y - y - h,
					x + w, this.resolution.y - y,
					this.gl.COLOR_BUFFER_BIT, this.gl.NEAREST );

				this.srcFrameBuffer.setTexture( [], true );

				this.frameList.push( {
					frameBuffer: frameBuffer,
					texture: tex,
					label: label ? label + ( i > 0 ? "_" + i : '' ) : ''
				} );

			}

			this.count ++;

		}


		this.gl.bindFramebuffer( this.gl.READ_FRAMEBUFFER, null );
		this.gl.bindFramebuffer( this.gl.DRAW_FRAMEBUFFER, null );

	}

	public draw() {

		// draw canvas

		this.cctx.clearRect( 0, 0, this.resolution.x, this.resolution.y );

		this.cctx.font = `500 13px 'Courier New'`;

		this.cctx.fillStyle = "#fff";

		for ( let i = 0; i < this.frameList.length; i ++ ) {

			const { x, y } = this.calcTilePos( i );

			const frame = this.frameList[ i ];

			this.cctx.fillText( frame.label, x + 5, y + 15 );

		}

		this.canvasTexture.attach( this.canvas );

		// out

		this.renderer.renderPostProcess( this.outPostProcess );

		// calc status

		this.total = this.count;

		const sqrt = Math.sqrt( this.total );
		this.tile.set( Math.round( sqrt ), Math.ceil( sqrt ) );
		this.tileInv.set( 1.0, 1.0 ).divide( this.tile );
		this.tilePixelSize.copy( this.tileInv ).multiply( this.resolution );

		this.frameList.length = 0;
		this.count = 0;

	}

	public reflesh( ) {

		this.resize( this.resolution );

	}

	public resize( resolution: GLP.Vector ) {

		this.resolution.copy( resolution );

		this.renderer.resize( resolution );

		this.outFrameBuffer.setSize( resolution );

		this.outPostProcess.resize( resolution );

		this.canvas.width = resolution.x;
		this.canvas.height = resolution.y;
		this.canvasTexture.attach( this.canvas );

	}

	private onClick( e: MouseEvent ) {

		if ( ! this._enable ) {

			return;

		}

		this.reflesh();

		if ( this.focus !== null ) {

			this.focus = null;

			return;

		}

		const x = Math.floor( e.clientX / this.tilePixelSize.x );
		const y = Math.floor( e.clientY / this.tilePixelSize.y );

		this.focus = x + y * this.tile.x;


	}

	public set enable( value: boolean ) {

		this._enable = value;

		if ( value ) {

			this.reflesh();

		}

	}

	public get enable( ) {

		return this._enable;

	}

	public dispose( ) {

		this.emit( "dispose" );

	}

}