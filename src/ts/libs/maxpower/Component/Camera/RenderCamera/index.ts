import { GLPowerFrameBuffer } from "~/ts/libs/glpower_local/GLPowerFrameBuffer";
import { CameraParam, Camera } from "..";
import { power } from "~/ts/Globals";
import { Vector } from "glpower";

export type RenderCameraTarget = {
	gBuffer: GLPowerFrameBuffer,
	deferredBuffer: GLPowerFrameBuffer,
	forwardBuffer: GLPowerFrameBuffer,
	uiBuffer: GLPowerFrameBuffer,
}

export interface RenderCameraParam extends CameraParam {
	gl: WebGL2RenderingContext
}

export class RenderCamera extends Camera {

	public renderTarget: RenderCameraTarget;

	constructor( gl: WebGL2RenderingContext, param?: RenderCameraParam ) {

		super( param );

		const gBuffer = new GLPowerFrameBuffer( gl );
		gBuffer.setTexture( [
			power.createTexture().setting( { type: gl.FLOAT, internalFormat: gl.RGBA32F, format: gl.RGBA, magFilter: gl.NEAREST, minFilter: gl.NEAREST } ),
			power.createTexture().setting( { type: gl.FLOAT, internalFormat: gl.RGBA32F, format: gl.RGBA } ),
			power.createTexture(),
			power.createTexture(),
			power.createTexture().setting( { type: gl.FLOAT, internalFormat: gl.RGBA32F, format: gl.RGBA } ),
		] );

		const deferredBuffer = new GLPowerFrameBuffer( gl, { disableDepthBuffer: true } );
		deferredBuffer.setTexture( [ power.createTexture().setting( { type: gl.FLOAT, internalFormat: gl.RGBA32F, format: gl.RGBA } ), power.createTexture() ] );

		const forwardBuffer = new GLPowerFrameBuffer( gl, { disableDepthBuffer: true } );
		forwardBuffer.setDepthTexture( gBuffer.depthTexture );
		forwardBuffer.setTexture( [ deferredBuffer.textures[ 0 ] ] );

		const uiBuffer = new GLPowerFrameBuffer( gl, { disableDepthBuffer: true } );
		uiBuffer.setTexture( [ power.createTexture() ] );

		this.renderTarget = { gBuffer, deferredBuffer, forwardBuffer, uiBuffer };

	}

	public resize( resolution: Vector ) {

		this.renderTarget.gBuffer.setSize( resolution );
		this.renderTarget.deferredBuffer.setSize( resolution );
		this.renderTarget.forwardBuffer.setSize( resolution );
		this.renderTarget.uiBuffer.setSize( resolution );

	}

}
