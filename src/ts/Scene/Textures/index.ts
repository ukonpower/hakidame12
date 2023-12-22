import { gl, globalUniforms } from "~/ts/Globals";
import { TexProcedural } from "~/ts/libs/TexProcedural";

import noiseFrag from './shaders/noise.fs';
import { GLPowerTextureCube } from "glpower";

export const createTextures = () => {

	globalUniforms.tex.uNoiseTex = {
		value: new TexProcedural( {
			frag: noiseFrag
		} ),
		type: '1i'
	};

	globalUniforms.tex.uEnvTex = {
		value: new GLPowerTextureCube( gl ),
		type: '1i'
	};

};
