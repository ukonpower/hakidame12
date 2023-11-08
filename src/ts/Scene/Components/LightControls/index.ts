import * as GLP from 'glpower';
import * as MXP from 'maxpower';
import { animator, lpd8 } from '~/ts/Globals';

let lightControlsId = 0;

export class LightControls extends MXP.Component {

	private baseSelfPos: GLP.Vector;
	private baseTargetPos: GLP.Vector;

	private selfPos: GLP.Vector;
	private targetPos: GLP.Vector;

	private up: GLP.Vector;

	private id: number;

	constructor() {

		super();

		this.baseSelfPos = new GLP.Vector();
		this.baseTargetPos = new GLP.Vector();

		this.selfPos = new GLP.Vector();
		this.targetPos = new GLP.Vector();

		this.up = new GLP.Vector( 0.0, 0.0, 1.0, 0.0 );

		animator.add( "lconSelf" + lightControlsId, new GLP.Vector(), GLP.Easings.easeOutCubic );
		animator.add( "lconTarget" + lightControlsId, new GLP.Vector(), GLP.Easings.easeOutCubic );

		this.id = lightControlsId;

		lightControlsId ++;

		/*-------------------------------
			Midi
		-------------------------------*/

		lpd8.on( "pad1/3", ( value: number ) => {

			this.move();

		} );

	}

	protected setEntityImpl( entity: MXP.Entity | null, prevEntity: MXP.Entity | null ): void {

		if ( entity ) {

			this.baseSelfPos.copy( entity.position );

			this.baseTargetPos.set(
				0.0,
				0.0,
				0.0,
			);

			this.selfPos.copy( this.baseSelfPos );
			this.targetPos.copy( this.baseTargetPos );

			entity.autoMatrixUpdate = false;

		}

	}

	private move( ) {

		const selfRadius = 5.0 + Math.random() * 5.0;
		const selfRadian = Math.random() * Math.PI * 2.0;

		animator.animate( "lconSelf" + this.id, new GLP.Vector(
			Math.cos( selfRadian ) * selfRadius,
			( Math.random() - 0.5 ) * selfRadius,
			Math.sin( selfRadian ) * selfRadius,
		), 0.5 );

		animator.animate( "lconTarget" + this.id, new GLP.Vector(
			Math.cos( selfRadian ) * selfRadius * 0.2,
			( Math.random() - 0.5 ) * selfRadius * 0.2,
			Math.sin( selfRadian ) * selfRadius * 0.2,
		), 0.5 );

	}

	protected updateImpl( event: MXP.ComponentUpdateEvent ): void {

		const entity = event.entity;

		this.selfPos.copy( animator.getValue<GLP.Vector>( "lconSelf" + this.id )! );
		this.targetPos.copy( animator.getValue<GLP.Vector>( "lconTarget" + this.id )! );

		entity.matrixWorld.lookAt( this.selfPos, this.targetPos, this.up );
		// entity.matrixWorld.lookAt( new GLP.Vector( 0, 5, 0 ), new GLP.Vector( 0, 0, 0 ), this.up );

	}


}
