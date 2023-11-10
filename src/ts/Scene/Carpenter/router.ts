import * as MXP from 'maxpower';
import { Skybox } from '../Entities/Skybox';
import { FluidParticles } from '../Entities/FluidParticles';

export const router = ( node: MXP.BLidgeNode ) => {

	// class

	if ( node.class == "Skybox" ) {

		return new Skybox();

	} else if ( node.class == "FluidParticles" ) {

		return new FluidParticles();

	}

	const baseEntity = new MXP.Entity();

	return baseEntity;

};
