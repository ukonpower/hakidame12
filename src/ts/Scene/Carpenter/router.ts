import * as MXP from 'maxpower';
import { Skybox } from '../Entities/Skybox';

export const router = ( node: MXP.BLidgeNode ) => {

	// class

	if ( node.class == "Skybox" ) {

		return new Skybox();

	}

	const baseEntity = new MXP.Entity();

	return baseEntity;

};
