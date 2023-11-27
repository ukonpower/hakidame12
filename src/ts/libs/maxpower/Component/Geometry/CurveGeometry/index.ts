import * as GLP from 'glpower';
import { Geometry } from "..";
import { Curve } from "../../../Utils/Curve";

export class CurveGeometry extends Geometry {

	constructor( curve: Curve, curveSegments: number = 24, radSegments: number = 8 ) {

		super();

		const posArray: number[] = [];
		const normalArray: number[] = [];
		const uvArray: number[] = [];
		const indexArray: number[] = [];

		const futa = true;
		const rad = 1.0;
		const height = 1.0;

		const tmpVector: GLP.Vector = new GLP.Vector();

		const frenet = curve.getFrenetFrames( curveSegments + 1 );

		for ( let i = 0; i <= curveSegments; i ++ ) {

			const { pos, weight } = curve.getPoint( i / curveSegments );

			const N = frenet.normals[ i ];
			const B = frenet.binormals[ i ];

			for ( let j = 0; j < radSegments; j ++ ) {

				const theta = Math.PI * 2.0 / radSegments * j;

				if ( i <= curveSegments ) {

					const radius = rad * weight;

					const sin = Math.sin( theta );
					const cos = - Math.cos( theta );

					// normal

					const vec = new GLP.Vector();

					vec.x = ( cos * N.x + sin * B.x );
					vec.y = ( cos * N.y + sin * B.y );
					vec.z = ( cos * N.z + sin * B.z );

					vec.normalize();

					normalArray.push( vec.x, vec.y, vec.z );

					vec.x = pos.x + radius * vec.x;
					vec.y = pos.y + radius * vec.y;
					vec.z = pos.z + radius * vec.z;

					posArray.push( vec.x, vec.y, vec.z );

					uvArray.push(
						j / radSegments,
						i / curveSegments
					);


					if ( i < curveSegments ) {

						indexArray.push(
							i * radSegments + j,
							( i + 1 ) * radSegments + ( j + 1 ) % radSegments,
							i * radSegments + ( j + 1 ) % radSegments,

							i * radSegments + j,
							( i + 1 ) * radSegments + j,
							( i + 1 ) * radSegments + ( j + 1 ) % radSegments,

						);

					}

				}

			}

		}

		this.setAttribute( 'position', new Float32Array( posArray ), 3 );
		this.setAttribute( 'normal', new Float32Array( normalArray ), 3 );
		this.setAttribute( 'uv', new Float32Array( uvArray ), 2 );
		this.setAttribute( 'index', new Uint16Array( indexArray ), 1 );

	}

}
