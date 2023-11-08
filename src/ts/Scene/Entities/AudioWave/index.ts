import * as GLP from 'glpower';
import * as MXP from 'maxpower';

import audioWaveVert from './shaders/audioWave.vs';
import audioWaveFrag from './shaders/audioWave.fs';

import { audio, globalUniforms, midimix } from '~/ts/Globals';

export class AudioWave extends MXP.Entity {

	constructor() {

		super();

		this.addComponent( "geometry", new MXP.CylinderGeometry( 1.0, 1.0, 1.0, audio.size, 3, false ) );

		const mat = this.addComponent( "material", new MXP.Material( {
			name: "audioWave",
			type: [ "deferred" ],
			uniforms: GLP.UniformsUtils.merge( globalUniforms.time, globalUniforms.audio, {
				uMidi: {
					value: midimix.vectorsLerped[ 6 ],
					type: '4fv'
				}
			} ),
			vert: MXP.hotGet( 'audioWaveVert', audioWaveVert ),
			frag: MXP.hotGet( 'audioWaveFrag', audioWaveFrag ),
			cullFace: false,
		} ) );

		if ( import.meta.hot ) {

			import.meta.hot.accept( "./shaders/audioWave.fs", ( module ) => {

				if ( module ) {

					mat.frag = MXP.hotUpdate( 'audioWaveFrag', module.default );

				}

				mat.requestUpdate();

			} );

			import.meta.hot.accept( "./shaders/audioWave.vs", ( module ) => {

				if ( module ) {

					mat.vert = MXP.hotUpdate( 'audioWaveVert', module.default );

				}

				mat.requestUpdate();

			} );


		}

	}

}
