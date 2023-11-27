import * as GLP from 'glpower';
import { normalize } from 'path';

const N = 2;


type CurvePoint = GLP.IVector3 & {
	radiusWeight?: number
}

export class Curve extends GLP.EventEmitter {

	public points: CurvePoint[];
	private knot: number[];

	constructor() {

		super();

		this.points = [];
		this.knot = [];

	}

	public setPoints( points: CurvePoint[] ) {

		this.points = [ ...points ];

		const knotLength = this.points.length + N + 1;

		this.knot.length = knotLength;

		for ( let i = 0; i < N + 1; i ++ ) {

			this.knot[ i ] = 0;
			this.knot[ knotLength - 1 - i ] = 1;

		}

		const n = knotLength - ( N + 1 ) * 2;

		for ( let i = 0; i < n; i ++ ) {

			this.knot[ i + N + 1 ] = ( i + 1 ) / ( n + 1 );

		}

	}

	private basis( u: number, j: number, k: number ): number {

		if ( k == 0 ) {

			if ( this.knot[ j ] <= u && u < this.knot[ j + 1 ] ) {

				return 1;

			}

			return 0;

		}

		const b1b = ( this.knot[ j + k ] - this.knot[ j ] );
		const b1 = b1b === 0.0 ? 0 : ( u - this.knot[ j ] ) / b1b;

		const b2b = ( this.knot[ j + k + 1 ] - this.knot[ j + 1 ] );
		const b2 = b2b === 0.0 ? 0 : ( this.knot[ j + k + 1 ] - u ) / b2b;

		return b1 * this.basis( u, j, k - 1 ) + b2 * this.basis( u, j + 1, k - 1 );

	}

	public getPosition( t: number ) {

		t *= 0.9999;

		const pos: GLP.IVector3 = { x: 0, y: 0, z: 0 };
		let radiusWeight = 0.0;

		for ( let i = 0; i < this.points.length; i ++ ) {

			const p = this.points[ i ];

			const w = this.basis( t, i, N );

			pos.x += p.x * w;
			pos.y += p.y * w;
			pos.z += p.z * w;

			radiusWeight += ( p.radiusWeight ?? 1.0 ) * 0.1;

		}

		return { pos, radiusWeight };

	}

	public getPoint( t: number ) {

		const d = 0.01;

		const p1 = this.getPosition( t );
		const p2 = this.getPosition( t + d );
		const p3 = this.getPosition( t - d );

		const normal = new GLP.Vector().copy( p2.pos ).sub( p3.pos ).normalize();
		const binormal = new GLP.Vector().copy(
			new GLP.Vector().copy( p2.pos ).sub( p1.pos ).normalize()
		).sub(
			new GLP.Vector().copy( p1.pos ).sub( p3.pos ).normalize()
		).normalize();

		const tangent = new GLP.Vector().copy( normal ).cross( binormal );

		// const mat = new GLP.Matrix( [
		// 	normal.x, normal.y, normal.z, 0.0,
		// 	binormal.x - tangent.x, binormal.y - tangent.y, binormal.z - tangent.z, 0.0,
		// 	binormal.x + tangent.x, binormal.y + tangent.y, binormal.z + tangent.z, 0.0,
		// 	0.0, 0.0, 0.0, 1.0
		// ] );

		return {
			pos: p1.pos,
			normal,
			binormal,
			tangent,
			// mat,
			weight: p1.radiusWeight
		};

	}

	public getFrenetFrames( segments: number ) {

		const normals: GLP.Vector[] = [];
		const binormals: GLP.Vector[] = [];
		const tangents: GLP.Vector[] = [];

		for ( let i = 0; i <= segments; i ++ ) {

			const t = i / segments;

			const d = 0.001;

			const p2 = this.getPosition( Math.min( t + d, 1.0 ) );
			const p3 = this.getPosition( Math.max( t - d, 0.0 ) );

			const tangent = new GLP.Vector().copy( p2.pos ).sub( p3.pos ).normalize();

			tangents[ i ] = tangent;

		}

		const nnnnn = new GLP.Vector( 0.0, 1.0, 0.0 );

		normals[ 0 ] = new GLP.Vector();
		binormals[ 0 ] = new GLP.Vector();

		const min = Number.MAX_VALUE;
		const tx = Math.abs( tangents[ 0 ].x );
		const ty = Math.abs( tangents[ 0 ].y );
		const tz = Math.abs( tangents[ 0 ].z );


		// if ( tx <= min ) {

		// 	min = tx;
		// 	nnnnn.set( 1, 0, 0 );

		// }

		// if ( ty <= min ) {

		// 	min = ty;
		// 	nnnnn.set( 0, 1, 0 );

		// }

		// if ( tz <= min ) {

		// 	nnnnn.set( 0, 0, 1 );

		// }

		const vec = new GLP.Vector();

		normals[ 0 ].copy( tangents[ 0 ] ).cross( nnnnn ).normalize();
		binormals[ 0 ].copy( tangents[ 0 ] ).cross( normals[ 0 ] );

		for ( let i = 1; i <= segments; i ++ ) {

			normals[ i ] = normals[ i - 1 ].clone();
			binormals[ i ] = binormals[ i - 1 ].clone();

			vec.copy( tangents[ i - 1 ] ).cross( tangents[ i ] );

			if ( vec.length() > Number.EPSILON ) {

				vec.normalize();

				const dt = new GLP.Vector().copy( tangents[ i - 1 ] ).dot( tangents[ i ] );

				const theta = Math.acos( Math.min( 1.0, Math.max( - 1.0, dt ) ) );

				// console.log( theta );

				normals[ i ].applyMatrix4( new GLP.Matrix().makeRotationAxis( vec, theta ) );

			}

			binormals[ i ].copy( tangents[ i ] ).cross( normals[ i ] );

		}

		return {
			normals,
			binormals,
			tangents,
		};

	}

}
