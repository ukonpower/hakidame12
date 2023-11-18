import * as GLP from 'glpower';
import * as MXP from 'maxpower';

import { MainCamera } from './Entities/MainCamera';
import { Renderer } from './Renderer';
import { createTextures } from './Textures';
import { gl, globalUniforms, power } from '../Globals';
import { Carpenter } from './Carpenter';
import { RenderCamera } from '../libs/maxpower/Component/Camera/RenderCamera';
import { BufferViewer } from './BufferViewer';

type SceneUpdateParam = {
	forceDraw: boolean
}

export class Scene extends GLP.EventEmitter {

	public currentTime: number;
	public elapsedTime: number;
	public deltaTime: number;

	private root: MXP.Entity;
	private camera: MainCamera;
	private renderer: Renderer;

	// bufferView

	private cameraComponent: RenderCamera;

	private bufferViewer?: BufferViewer;

	// carpenter

	private carpenter: Carpenter;

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

		this.camera = new MainCamera();
		this.camera.position.set( 0, 0, 4 );
		this.root.add( this.camera );

		this.cameraComponent = this.camera.getComponent<RenderCamera>( 'camera' )!;

		// carpenter

		this.carpenter = new Carpenter( this.root, this.camera );

		// this.root.add( new HUD() );

		// renderer

		this.renderer = new Renderer( );
		this.root.add( this.renderer );

		// buffers

		if ( process.env.NODE_ENV == "development" ) {

			const bufferViewer = new BufferViewer( gl );

			window.addEventListener( "keydown", ( e ) => {

				if ( e.key == "d" ) {

					this.cameraComponent.displayOut = ! this.cameraComponent.displayOut;

				}

			} );

			this.renderer.on( 'drawPass', ( rt?: GLP.GLPowerFrameBuffer ) => {

				if ( this.bufferViewer && rt && ! this.cameraComponent.displayOut ) {

					this.bufferViewer.push( rt );

				}

			} );

			this.bufferViewer = bufferViewer;


		}

	}

	public update( param?: SceneUpdateParam ) {

		const currentTime = new Date().getTime();
		this.deltaTime = ( currentTime - this.currentTime ) / 1000;
		this.elapsedTime += this.deltaTime;
		this.currentTime = currentTime;

		globalUniforms.time.uTime.value = this.elapsedTime;
		globalUniforms.time.uFractTime.value = this.elapsedTime;

		const event: MXP.EntityUpdateEvent = {
			time: this.elapsedTime,
			deltaTime: this.deltaTime,
			forceDraw: param && param.forceDraw
		};

		const renderStack = this.root.update( event );

		this.root.noticeRecursive( "finishUp", event );

		this.renderer.render( renderStack );

		if ( process.env.NODE_ENV == "development" ) {

			if ( this.bufferViewer && ! this.cameraComponent.displayOut ) {

				this.bufferViewer.draw();

			}

		}

		return this.deltaTime;

	}

	public resize( resolution: GLP.Vector ) {

		this.renderer.resize( resolution );

		this.camera.resize( resolution );

		if ( process.env.NODE_ENV == "development" ) {

			if ( this.bufferViewer ) {

				this.bufferViewer.resize( resolution );

			}

		}

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
