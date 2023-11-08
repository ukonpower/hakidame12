import * as GLP from 'glpower';
import * as MXP from 'maxpower';
import { animator, midimix } from '~/ts/Globals';

export class VisibilitySwitcher extends MXP.Component {

	public readonly phaseId: string;
	public readonly phaseNumber: number;

	public rot: GLP.Euler;
	public rotQua: GLP.Quaternion;

	private visiblePrev: number;
	public visibleDiff: number = 0;
	public visibility: number = 0;

	constructor( phaseNumber: number ) {

		super();

		this.phaseNumber = phaseNumber;
		this.phaseId = "phase/" + phaseNumber;

		this.rot = new GLP.Euler();
		this.rotQua = new GLP.Quaternion();

		// visible
		animator.add( this.phaseId, 0, GLP.Easings.easeInOutCubic );
		this.visiblePrev = 0;

		// events

		const onRow1 = this.phaseChange.bind( this );

		midimix.on( "row1", onRow1 );

		this.once( "dispose", () => {

			midimix.off( "row1", onRow1 );

		} );

	}

	protected setEntityImpl( entity: MXP.Entity | null, prevEntity: MXP.Entity | null ): void {

		if ( entity ) {

			entity.visible = false;

		}

	}


	protected updateImpl( event: MXP.ComponentUpdateEvent ): void {

		this.visibility = animator.getValue<number>( this.phaseId ) !;
		const visibilityDiff = Math.abs( this.visiblePrev - this.visibility );
		this.visiblePrev = this.visibility;

		this.visibleDiff += visibilityDiff * 25.0;
		this.visibleDiff *= 0.95;

		// rot

		this.rot.set( this.visibleDiff * event.deltaTime, 0, 0 );
		this.rotQua.setFromEuler( this.rot );

	}


	protected phaseChange( phase: number, value: number ) {

		if ( ! this.entity ) return;

		if ( phase !== this.phaseNumber ) return;

		const entity = this.entity;

		const d = .5;

		if ( value ) {

			entity.visible = true;

			animator.animate( this.phaseId, 1, 5 * d, () => {

			} );

		} else {

			animator.animate( this.phaseId, 0, 5 * d, () => {

				entity.visible = false;

			} );

		}

	}

}
