import * as GLP from 'glpower';
import * as MXP from 'maxpower';

import { RenderCameraTarget } from '~/ts/libs/maxpower/Component/Camera/RenderCamera';
import { gl, power, globalUniforms } from '~/ts/Globals';


import lightShaftFrag from './shaders/lightShaft.fs';
import ssaoFrag from './shaders/ssao.fs';
import deferredShadingFrag from './shaders/deferredShading.fs';

export class DeferredPostProcess extends MXP.PostProcess {

	// light shaft

	private lightShaft: MXP.PostProcessPass;
	public rtLightShaft1: GLP.GLPowerFrameBuffer;
	public rtLightShaft2: GLP.GLPowerFrameBuffer;

	// ssao

	private ssao: MXP.PostProcessPass;
	public rtSSAO1: GLP.GLPowerFrameBuffer;
	public rtSSAO2: GLP.GLPowerFrameBuffer;

	// shading

	private shading: MXP.PostProcessPass;

	constructor() {

		// light shaft

		const rtLightShaft1 = new GLP.GLPowerFrameBuffer( gl ).setTexture( [
			power.createTexture().setting( { magFilter: gl.LINEAR, minFilter: gl.LINEAR } ),
		] );

		const rtLightShaft2 = new GLP.GLPowerFrameBuffer( gl ).setTexture( [
			power.createTexture().setting( { magFilter: gl.LINEAR, minFilter: gl.LINEAR } ),
		] );

		const lightShaft = new MXP.PostProcessPass( {
			name: 'lightShaft',
			frag: lightShaftFrag,
			renderTarget: rtLightShaft1,
			uniforms: GLP.UniformsUtils.merge( globalUniforms.time, {
				uLightShaftBackBuffer: {
					value: rtLightShaft2.textures[ 0 ],
					type: '1i'
				},
				uDepthTexture: {
					value: null,
					type: '1i'
				},
			} ),
			resolutionRatio: 0.5,
			passThrough: true,
		} );

		// ssao

		const rtSSAO1 = new GLP.GLPowerFrameBuffer( gl ).setTexture( [
			power.createTexture().setting( { magFilter: gl.LINEAR, minFilter: gl.LINEAR } ),
		] );

		const rtSSAO2 = new GLP.GLPowerFrameBuffer( gl ).setTexture( [
			power.createTexture().setting( { magFilter: gl.LINEAR, minFilter: gl.LINEAR } ),
		] );

		const ssao = new MXP.PostProcessPass( {
			name: 'ssao',
			frag: ssaoFrag,
			renderTarget: rtSSAO1,
			uniforms: GLP.UniformsUtils.merge( globalUniforms.time, {
				uSSAOBackBuffer: {
					value: rtSSAO2.textures[ 0 ],
					type: '1i'
				},
				uDepthTexture: {
					value: null,
					type: '1i'
				},
			} ),
			resolutionRatio: 1.0,
			passThrough: true,
		} );

		// shading

		const shading = new MXP.PostProcessPass( {
			name: "deferredShading",
			frag: MXP.hotGet( "deferredShading", deferredShadingFrag ),
			uniforms: GLP.UniformsUtils.merge( {
				uLightShaftTexture: {
					value: null,
					type: '1i'
				},
				uSSAOTexture: {
					value: null,
					type: '1i'
				},
				uSSAOResolutionInv: {
					value: ssao.resolutionInv,
					type: '2fv'
				}
			} )
		} );

		super( { passes: [
			lightShaft,
			ssao,
			shading,
		] } );

		this.shading = shading;
		this.lightShaft = lightShaft;
		this.ssao = ssao;

		this.rtSSAO1 = rtSSAO1;
		this.rtSSAO2 = rtSSAO2;

		this.rtLightShaft1 = rtLightShaft1;
		this.rtLightShaft2 = rtLightShaft2;

		if ( import.meta.hot ) {

			import.meta.hot.accept( "./shaders/deferredShading.fs", ( module ) => {

				if ( module ) {

					shading.frag = MXP.hotUpdate( 'deferredShading', module.default );

				}

				shading.requestUpdate();

			} );

		}

	}

	protected updateImpl( event: MXP.ComponentUpdateEvent ): void {

		// light shaft swap

		let tmp = this.rtLightShaft1;
		this.rtLightShaft1 = this.rtLightShaft2;
		this.rtLightShaft2 = tmp;

		this.lightShaft.setRendertarget( this.rtLightShaft1 );
		this.shading.uniforms.uLightShaftTexture.value = this.rtLightShaft1.textures[ 0 ];
		this.lightShaft.uniforms.uLightShaftBackBuffer.value = this.rtLightShaft2.textures[ 0 ];

		// ssao swap

		tmp = this.rtSSAO1;
		this.rtSSAO1 = this.rtSSAO2;
		this.rtSSAO2 = tmp;

		this.ssao.setRendertarget( this.rtSSAO1 );
		this.shading.uniforms.uSSAOTexture.value = this.rtSSAO1.textures[ 0 ];
		this.ssao.uniforms.uSSAOBackBuffer.value = this.rtSSAO2.textures[ 0 ];

	}

	public setRenderTarget( renderTarget: RenderCameraTarget ) {

		for ( let i = 0; i < renderTarget.gBuffer.textures.length; i ++ ) {

			const tex = renderTarget.gBuffer.textures[ i ];

			this.shading.uniforms[ "sampler" + i ] = this.ssao.uniforms[ "sampler" + i ] = {
				type: '1i',
				value: tex
			};

		}

		this.lightShaft.uniforms.uDepthTexture.value = renderTarget.gBuffer.depthTexture;
		this.ssao.uniforms.uDepthTexture.value = renderTarget.gBuffer.depthTexture;

		this.shading.renderTarget = renderTarget.shadingBuffer;

	}

}
