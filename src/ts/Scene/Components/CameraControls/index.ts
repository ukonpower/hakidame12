import * as GLP from 'glpower';
import * as MXP from 'maxpower';
import { animator, bpm, midimix, mpkmini } from '~/ts/Globals';

/*
MODE
0 - 静止
1 - 中央
2 - 並行移動
3 - 爆
*/

export class CameraControls extends MXP.Component {

	private up: GLP.Vector;

	// position

	private targetPos: GLP.Vector;
	private targetVel: GLP.Vector;

	private selfPos: GLP.Vector;
	private selfVel: GLP.Vector;

	// params

	private zoom: number;
	private zoomLerped: number;
	private dofOffset: number;
	private dofPower: number;
	private spawnDistance: number;
	private cameraSpeed: number;

	// move

	private mode: number;
	private manualCameraMove: boolean;

	// components

	private cameraComponent: MXP.Camera | null;

	// tmps

	private tmpVec1: GLP.Vector;
	private tmpQuaternion: GLP.Quaternion;
	private tmpMatrix1: GLP.Matrix;

	constructor() {

		super();

		this.up = new GLP.Vector( 0, 1, 0 );

		this.targetPos = new GLP.Vector();
		this.targetVel = new GLP.Vector();

		this.selfPos = new GLP.Vector();
		this.selfVel = new GLP.Vector();

		this.mode = 0;
		this.manualCameraMove = false;

		this.zoom = this.zoomLerped = 0.5;
		this.dofOffset = 0.5;
		this.dofPower = 0.5;
		this.spawnDistance = 0.5;
		this.cameraSpeed = 1.0;

		this.cameraComponent = null;

		this.tmpVec1 = new GLP.Vector();
		this.tmpQuaternion = new GLP.Quaternion();
		this.tmpMatrix1 = new GLP.Matrix();

		this.move( 0 );

		animator.add( "cameraPos", new GLP.Vector(), GLP.Easings.easeInOutCubic );
		animator.add( "cameraTarget", new GLP.Vector(), GLP.Easings.easeInOutCubic );

		/*-------------------------------
			BPM
		-------------------------------*/

		bpm.on( "tick/1", this.onBeat.bind( this ) );

		/*-------------------------------
			Midi
		-------------------------------*/

		midimix.on( "row1/7", ( value: number ) => {

			this.manualCameraMove = value == 1;

		} );

		midimix.on( "vector/7", ( vec: GLP.Vector ) => {

			this.spawnDistance = vec.x;
			this.dofPower = vec.y;
			this.dofOffset = vec.z;

		} );

		mpkmini.on( "vector/0", ( vec: GLP.Vector ) => {

			this.cameraSpeed = vec.x;

		} );

		mpkmini.on( "pad1", ( index: number ) => {

			this.mode = index;

			this.move( this.mode );

		} );

	}

	private move( mode: number ) {

		const w = 2.0;

		// self

		if ( this.mode == 0.0 ) {

			/*-------------------------------
				Mode0 静止
			-------------------------------*/

			this.selfPos.set( 0, 0, 0 );
			this.targetPos.set( 0, 0, 0 );

			this.selfVel.set( 0, 0, 0 );
			this.targetVel.set( 0, 0, 0 );

		} else if ( this.mode == 1.0 ) {

			/*-------------------------------
				Mode1 中心
			-------------------------------*/

			const selfRadius = 0.2 + ( this.spawnDistance * 10.0 );
			const selfRadian = Math.random() * Math.PI * 2.0;

			this.selfPos.set(
				Math.cos( selfRadian ) * selfRadius,
				0.0,
				Math.sin( selfRadian ) * selfRadius,
			).multiply( w );

			this.selfVel.set( 0, ( Math.random() - 0.5 ) * this.cameraSpeed * 5.0, 0 );

			this.targetPos.set( 0, 0, 0 );
			this.targetVel.set( 0, 0.0, 0 );


		} else if ( this.mode == 2.0 ) {

			/*-------------------------------
				Mode2 平行移動
			-------------------------------*/

			const selfRadius = 0.5 + Math.random() * 0.2 + ( this.spawnDistance * 10.0 );
			const selfRadian = Math.random() * Math.PI * 2.0;

			this.selfPos.set(
				Math.cos( selfRadian ) * selfRadius,
				Math.random() - 0.5,
				Math.sin( selfRadian ) * selfRadius,
			).multiply( w );

			this.selfVel.set(
				Math.random() - 0.5,
				Math.random() - 0.5,
				Math.random() - 0.5,
			).normalize().multiply( 0.5 );

			// target

			const targetRadius = Math.random() * w * 0.4;
			const targetRadian = Math.random() * Math.PI * 2.0;

			this.targetPos.set(
				Math.cos( targetRadian ) * targetRadius,
				( Math.random() - 0.5 ) * targetRadius,
				Math.sin( targetRadian ) * targetRadius,
			).multiply( w );

			this.targetVel.set(
				Math.random() - 0.5,
				Math.random() - 0.5,
				Math.random() - 0.5,
			).normalize().multiply( 0.2 );

		} else if ( this.mode == 3.0 ) {

			/*-------------------------------
				Mode3 爆
			-------------------------------*/

			const selfRadius = 0.5 + Math.random() * 0.2 + ( this.spawnDistance * 10.0 );
			const selfRadian = Math.random() * Math.PI * 2.0;

			animator.animate( "cameraPos", new GLP.Vector(
				Math.cos( selfRadian ) * selfRadius,
				Math.random() - 0.5,
				Math.sin( selfRadian ) * selfRadius,
			).multiply( w ), 0.1 );

			const targetRadius = Math.random() * w * 0.4;
			const targetRadian = Math.random() * Math.PI * 2.0;

			animator.animate( "cameraTarget", new GLP.Vector(
				Math.cos( targetRadian ) * targetRadius,
				( Math.random() - 0.5 ) * targetRadius,
				Math.sin( targetRadian ) * targetRadius,
			), 0.1 );

		}

		this.updateFov();

	}

	protected updateImpl( event: MXP.ComponentUpdateEvent ): void {

		const deltaTime = event.deltaTime;

		const entity = event.entity;

		if ( this.mode == 0 ) {

			this.selfPos.z = 0.5 + midimix.vectorsLerped[ 7 ].x * 15.0;
			this.selfPos.x = Math.sin( event.time ) * 10.0 * mpkmini.vectorsLerped[ 0 ].x;

			this.updateFov();


		} else if ( this.mode == 1 ) {

			this.tmpQuaternion.setFromEuler( this.tmpVec1.copy( this.selfVel ).multiply( event.deltaTime ) );
			this.selfPos.applyMatrix3( this.tmpMatrix1.identity().applyQuaternion( this.tmpQuaternion ) );


		} else if ( this.mode == 2 ) {


			this.selfPos.add( this.tmpVec1.copy( this.selfVel ).multiply( deltaTime ) );
			this.targetPos.add( this.tmpVec1.copy( this.targetVel ).multiply( deltaTime ) );


		} else if ( this.mode == 3 ) {


			this.selfPos.copy( animator.getValue<GLP.Vector>( 'cameraPos' )! );
			this.targetPos.copy( animator.getValue<GLP.Vector>( 'cameraTarget' )! );

		}

		entity.matrixWorld.lookAt( this.selfPos, this.targetPos, this.up );

		// dof

		entity.userData.dofLenght = this.tmpVec1.copy( this.targetPos ).sub( this.selfPos ).length() * ( this.dofOffset * 2.0 );
		entity.userData.dofPower = this.dofPower;

	}

	private onBeat() {

		if ( ! this.manualCameraMove ) {

			this.move( this.mode );

		}

	}

	private updateFov() {

		if ( this.cameraComponent ) {

			this.cameraComponent.fov = 130 - ( ( midimix.vectorsLerped[ 7 ].w ) ) * 125.0;

		}

	}

	protected setEntityImpl( entity: MXP.Entity | null, prevEntity: MXP.Entity | null ): void {

		if ( entity ) {

			entity.autoMatrixUpdate = false;

			this.cameraComponent = entity.getComponent<MXP.Camera>( "camera" )!;

		}

	}


}
