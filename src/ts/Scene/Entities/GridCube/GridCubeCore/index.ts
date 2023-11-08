import * as GLP from 'glpower';
import * as MXP from 'maxpower';

import coreVert from './shaders/core.vs';
import coreFrag from './shaders/core.fs';

export class GridCubeCore extends MXP.Entity {

	constructor( uniforms: GLP.Uniforms ) {

		super();

		this.addComponent( "geometry", new MXP.SphereGeometry( 0.05 ) );

		const mat = this.addComponent( "material", new MXP.Material( {
			name: "core",
			type: [ "deferred", "shadowMap" ],
			uniforms: GLP.UniformsUtils.merge( uniforms ),
			vert: MXP.hotGet( 'coreVert', coreVert ),
			frag: MXP.hotGet( 'coreFrag', coreFrag ),
		} ) );

		if ( import.meta.hot ) {

			import.meta.hot.accept( "./shaders/core.vs", ( module ) => {

				if ( module ) {

					mat.vert = MXP.hotUpdate( 'coreVert', module.default );

					mat.requestUpdate();

				}

			} );

			import.meta.hot.accept( "./shaders/core.fs", ( module ) => {

				if ( module ) {

					mat.frag = MXP.hotUpdate( 'coreFrag', module.default );

					mat.requestUpdate();

				}

			} );

		}

	}

}
