import * as GLP from 'glpower';
import * as MXP from 'maxpower';
import { Part } from '..';
import { FluidParticles } from '~/ts/Scene/Entities/FluidParticles';


export class Part1 extends Part {

	private particles: FluidParticles;

	constructor() {

		super( 1 );

		this.particles = new FluidParticles();
		this.add( this.particles );

	}

	protected updateImpl( event: MXP.EntityUpdateEvent ): void {

		super.updateImpl( event );

		this.particles.trailVisibility = this.switcher.visibility;

	}

}
