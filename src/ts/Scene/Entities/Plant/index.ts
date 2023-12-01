import * as GLP from 'glpower';
import * as MXP from 'maxpower';
import { FolderApi } from 'tweakpane';

import { pane } from '~/ts/Globals';
import { randomSeed } from '~/ts/libs/Math';

const PlantParam = {
	branch: {
		num: { value: 4, opt: { min: 0, max: 10, step: 1 } },
		depth: { value: 3, opt: { min: 0, max: 5, step: 1 } },
		radius: { value: 0.02, opt: { min: 0, max: 0.2, step: 0.01 } },
		length: { value: 1.0, opt: { min: 0, max: 2, step: 0.01 } },
	},
	seed: { value: 0, opt: { min: 0, max: 9999, step: 1 } }
};

const _ = ( folder: FolderApi, o: any ) => {

	const keys = Object.keys( o );

	for ( let i = 0; i < keys.length; i ++ ) {

		const key = keys[ i ];
		const prop = o[ key ];

		if ( typeof prop == "object" ) {

			const f = folder.addFolder( { title: key } );

			if ( prop.value !== undefined ) {

				if ( typeof prop.value == "number" ) {

					f.addBinding( prop, "value", prop.opt );

				}

			} else {

				_( f, prop );

			}

			continue;

		}

	}

};

const plantFolder = pane.addFolder( { title: "plant" } );

_( plantFolder, PlantParam );

let random = randomSeed( PlantParam.seed.value );

export class Plant extends MXP.Entity {

	constructor() {

		super();

		const branch = ( i : number, radius: number, length: number ): MXP.Entity => {

			const b = new MXP.Entity();

			const curve = new MXP.Curve();

			const points: MXP.CurvePoint[] = [];

			points.push( {
				x: 0,
				y: 0,
				z: 0,
			} );

			const segs = 3;

			for ( let i = 0; i < segs; i ++ ) {

				const w = ( i / ( segs - 1 ) );

				const x = ( random() - 0.5 ) * 0.1;
				const y = w * length;
				const z = ( random() - 0.5 ) * 0.1;

				points.push( {
					x, y, z,
					weight: ( 1.0 - w * 0.8 )
				} );

			}

			curve.setPoints( points );

			const geo = new MXP.CurveGeometry( curve, radius, 12, 8 );
			b.addComponent( "geometry", geo );
			b.addComponent( "material", new MXP.Material() );

			const ni = i + 1;
			const nl = length * ( 0.6 - ( 1.0 - radius ) * 0.15 );

			if ( ni < PlantParam.branch.depth.value ) {

				const branches = PlantParam.branch.num.value;

				for ( let j = 0; j < branches; j ++ ) {

					const point = curve.getPoint( j / ( branches - 1 ) * 0.5 + 0.4 );

					const child = branch( ni, radius * point.weight, nl );
					child.position.copy( point.position );
					child.quaternion.multiply( new GLP.Quaternion().setFromEuler( new GLP.Euler( Math.PI / 4, random() * Math.PI * 2.0, 0, "ZYX" ) ) );

					b.add( child );

				}

			}

			if ( i > 0 ) {


				const point = curve.getPoint( 1 );

				const child = new MXP.Entity();
				child.addComponent( "geometry", new MXP.PlaneGeometry( 0.1, 0.1 ) );
				child.addComponent( "material", new MXP.Material( { cullFace: false } ) );
				child.position.copy( point.position );

				b.add( child );


			}


			return b;


		};


		let plant: MXP.Entity | null = null;

		const create = () => {

			random = randomSeed( PlantParam.seed.value );

			if ( plant ) {

				this.remove( plant );

			}

			const radius = PlantParam.branch.radius.value;
			const length = PlantParam.branch.length.value;

			plant = branch( 0, radius, length );

			this.add( plant );

		};

		plantFolder.on( "change", ( e ) =>{

			create();

		} );


		create();


	}

}
