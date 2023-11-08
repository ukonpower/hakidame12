import * as MXP from 'maxpower';
import { Part } from '..';
import { Trails } from '~/ts/Scene/Entities/Trails';

export class Part2 extends Part {

	private trail: Trails;

	constructor() {

		super( 2 );

		this.trail = new Trails();
		this.add( this.trail );

	}

	protected updateImpl( event: MXP.EntityUpdateEvent ): void {

		super.updateImpl( event );

		this.trail.trailVisibility = this.switcher.visibility;

	}

}
