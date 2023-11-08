import * as GLP from 'glpower';
import { canvas, gpuState } from './Globals';
import { Scene } from "./Scene";

class App {

	// elms

	private rootElm: HTMLElement;
	private canvasWrapElm: HTMLElement;
	private canvas: HTMLCanvasElement;

	private scene: Scene;

	constructor() {

		/*-------------------------------
			Element
		-------------------------------*/

		document.title = "draw();";

		this.rootElm = document.createElement( 'div' );
		this.rootElm.classList.add( 'r' );
		document.body.appendChild( this.rootElm );

		/*-------------------------------
			Canvas
		-------------------------------*/

		this.canvasWrapElm = document.createElement( 'div' );
		this.canvasWrapElm.classList.add( 'cw' );
		this.rootElm.appendChild( this.canvasWrapElm );

		this.canvas = canvas;
		this.canvasWrapElm.appendChild( this.canvas );

		this.canvasWrapElm.style.display = 'block';
		this.canvasWrapElm.style.cursor = 'none';

		/*-------------------------------
			Scene
		-------------------------------*/

		this.scene = new Scene();

		/*-------------------------------
			Event
		-------------------------------*/

		window.addEventListener( 'resize', this.resize.bind( this ) );

		this.resize();

		// gpustate

		if ( process.env.NODE_ENV == 'development' ) {

			if ( gpuState ) {

				const memoryElm = document.createElement( 'div' );
				memoryElm.classList.add( "dev" );
				memoryElm.style.pointerEvents = "none";
				memoryElm.style.position = "absolute";
				memoryElm.style.width = "50%";
				memoryElm.style.maxWidth = "300px";
				memoryElm.style.height = "100%";
				memoryElm.style.top = '0';
				memoryElm.style.left = "0";
				memoryElm.style.overflowY = 'auto';
				memoryElm.style.fontSize = "12px";
				memoryElm.style.color = "#fff";
				this.canvasWrapElm.appendChild( memoryElm );

				const timerElm = document.createElement( 'div' );
				timerElm.classList.add( "dev" );
				timerElm.style.pointerEvents = "none";
				timerElm.style.position = "absolute";
				timerElm.style.maxWidth = "300px";
				timerElm.style.width = "50%";
				timerElm.style.height = "100%";
				timerElm.style.top = "0";
				timerElm.style.right = "0";
				timerElm.style.overflowY = 'auto';
				timerElm.style.fontSize = "12px";
				this.canvasWrapElm.appendChild( timerElm );

				this.canvasWrapElm.style.fontFamily = "'Share Tech Mono', monospace";

				gpuState.init( memoryElm, timerElm );

			}

		}

		this.play();

	}

	private animate() {

		this.scene.update();

		window.requestAnimationFrame( this.animate.bind( this ) );

	}

	private play() {

		this.resize();
		this.animate();

		this.canvasWrapElm.style.opacity = "1";

	}

	private resize() {

		const aspect = 16 / 9;
		const scale = 1.0;

		this.canvas.width = 1920 * scale;
		this.canvas.height = this.canvas.width / aspect;

		if ( window.innerWidth / window.innerHeight < aspect ) {

			this.canvas.style.width = window.innerWidth + 'px';
			this.canvas.style.height = window.innerWidth / aspect + 'px';

		} else {

			this.canvas.style.height = window.innerHeight + 'px';
			this.canvas.style.width = window.innerHeight * aspect + 'px';

		}

		this.scene.resize( new GLP.Vector( this.canvas.width, this.canvas.height ) );

	}

}

new App();
