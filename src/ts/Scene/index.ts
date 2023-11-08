import * as GLP from 'glpower';
import * as MXP from 'maxpower';

import { animator, audio, bpm, gl, globalUniforms, lpd8, midimix, mpkmini, power } from '../Globals';

import { MainCamera } from './Entities/MainCamera';
import { Renderer } from './Renderer';
import { createTextures } from './Textures';
import { Common } from './Elements/Common';
import { Part0 } from './Elements/Parts/Part0';
import { Part1 } from './Elements/Parts/Part1';
import { Part2 } from './Elements/Parts/Part2';
import { Part3 } from './Elements/Parts/Part3';
// import { Effect0 } from './Elements/Parts/Effect0';
// import { Effect1 } from './Elements/Parts/Effect1';

type SceneUpdateParam = {
	forceDraw: boolean
}

export class Scene extends GLP.EventEmitter {

	public currentTime: number;
	public elapsedTime: number;
	public deltaTime: number;

	private root: MXP.Entity;
	private camera: MXP.Entity;
	private renderer: Renderer;

	constructor() {

		super();

		// state

		this.currentTime = new Date().getTime();
		this.elapsedTime = 0;
		this.deltaTime = 0;

		// textures

		createTextures();

		// root

		this.root = new MXP.Entity();

		// camera

		const gBuffer = new GLP.GLPowerFrameBuffer( gl );
		gBuffer.setTexture( [
			power.createTexture().setting( { type: gl.FLOAT, internalFormat: gl.RGBA32F, format: gl.RGBA, magFilter: gl.NEAREST, minFilter: gl.NEAREST } ),
			power.createTexture().setting( { type: gl.FLOAT, internalFormat: gl.RGBA32F, format: gl.RGBA } ),
			power.createTexture(),
			power.createTexture(),
			power.createTexture().setting( { type: gl.FLOAT, internalFormat: gl.RGBA32F, format: gl.RGBA } ),
		] );

		const deferredBuffer = new GLP.GLPowerFrameBuffer( gl, { disableDepthBuffer: true } );
		deferredBuffer.setTexture( [ power.createTexture(), power.createTexture() ] );

		const forwardBuffer = new GLP.GLPowerFrameBuffer( gl, { disableDepthBuffer: true } );
		forwardBuffer.setDepthTexture( gBuffer.depthTexture );
		forwardBuffer.setTexture( [ deferredBuffer.textures[ 0 ] ] );

		const uiBuffer = new GLP.GLPowerFrameBuffer( gl, { disableDepthBuffer: true } );
		uiBuffer.setTexture( [ power.createTexture() ] );

		this.root.on( 'resize', ( event: MXP.EntityResizeEvent ) => {

			gBuffer.setSize( event.resolution );
			deferredBuffer.setSize( event.resolution );
			forwardBuffer.setSize( event.resolution );
			uiBuffer.setSize( event.resolution );

		} );

		this.camera = new MainCamera( { renderTarget: { gBuffer, deferredBuffer, forwardBuffer, uiBuffer } } );
		this.camera.position.set( 0, 0, 4 );
		this.root.add( this.camera );

		// Wrold

		this.root.add( new Common() );
		this.root.add( new Part0() );
		this.root.add( new Part1() );
		this.root.add( new Part2() );
		this.root.add( new Part3() );

		// this.root.add( new Effect0() );
		// this.root.add( new Effect1() );

		// renderer

		this.renderer = new Renderer();
		this.root.add( this.renderer );

	}

	public update( param?: SceneUpdateParam ) {

		const currentTime = new Date().getTime();
		this.deltaTime = ( currentTime - this.currentTime ) / 1000;
		this.elapsedTime += this.deltaTime;
		this.currentTime = currentTime;

		globalUniforms.time.uTime.value = this.elapsedTime;
		globalUniforms.time.uFractTime.value = this.elapsedTime;
		globalUniforms.time.uTimeSeqPrev.value = globalUniforms.time.uTimeSeq.value;

		const event: MXP.EntityUpdateEvent = {
			time: this.elapsedTime,
			deltaTime: this.deltaTime,
			forceDraw: param && param.forceDraw
		};

		animator.update( this.deltaTime );

		midimix.update( this.deltaTime );

		mpkmini.update( this.deltaTime );

		lpd8.update( this.deltaTime );

		bpm.update( this.deltaTime );

		audio.update( this.deltaTime );

		const renderStack = this.root.update( event );

		this.root.noticeRecursive( "finishUp", event );

		this.renderer.render( renderStack );

		return this.deltaTime;

	}

	public resize( size: GLP.Vector ) {

		globalUniforms.resolution.uResolution.value.copy( size );

		this.root.resize( {
			resolution: size
		} );

	}

	public play( startTime: number ) {

		this.update();

		this.elapsedTime = startTime;

		this.emit( 'play' );

	}

	public dispose() {

		this.emit( 'dispose' );

	}

}
