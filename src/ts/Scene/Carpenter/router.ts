import * as MXP from 'maxpower';
import { Skybox } from '../Entities/Skybox';
import { FluidParticles } from '../Entities/FluidParticles';
import { Plant } from '../Entities/Plant';

export const router = ( node: MXP.BLidgeNode ) => {

	// class

	if ( node.class == "Skybox" ) {

		return new Skybox();

	} else if ( node.class == "FluidParticles" ) {

		return new FluidParticles();

	} else if ( node.class == "Plant" ) {

		return new Plant();

	}

	const baseEntity = new MXP.Entity();

	return baseEntity;

};
