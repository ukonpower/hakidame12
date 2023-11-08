import * as MXP from 'maxpower';
import { Part } from '..';
import { FinalCube } from '~/ts/Scene/Entities/FinalCube';

export class Part3 extends Part {

	private finalCube: FinalCube;

	constructor() {

		super( 3 );

		this.finalCube = new FinalCube();
		this.finalCube.scale.set( 10.0, 10.0, 10.0 );
		this.add( this.finalCube );

	}

	protected updateImpl( event: MXP.EntityUpdateEvent ): void {

		super.updateImpl( event );

		this.finalCube.visiblity = this.switcher.visibility;

	}

}
