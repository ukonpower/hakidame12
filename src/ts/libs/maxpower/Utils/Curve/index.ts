import * as GLP from 'glpower';

const N = 2;

export class Curve extends GLP.EventEmitter {

	public points: GLP.IVector3[];
	private knot: number[];

	constructor() {

		super();

		this.points = [];
		this.knot = [];

	}

	public setPoints( points: GLP.IVector3[] ) {

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

		// for ( let i = 0; i < knotLength; i ++ ) {

		// 	this.knot[ i ] = i / ( knotLength - 1 );

		// }

		// console.log( this.knot );

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

	public getPoint( t: number ) {

		t *= 0.9999;

		const res: GLP.IVector3 = { x: 0, y: 0, z: 0 };

		for ( let i = 0; i < this.points.length; i ++ ) {

			const p = this.points[ i ];

			const w = this.basis( t, i, N );

			res.x += p.x * w;
			res.y += p.y * w;
			res.z += p.z * w;

		}

		return res;

	}

}
