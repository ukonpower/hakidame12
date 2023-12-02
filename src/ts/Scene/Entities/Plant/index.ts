import * as GLP from 'glpower';
import * as MXP from 'maxpower';
import { FolderApi } from 'tweakpane';

import { pane } from '~/ts/Globals';
import { randomSeed } from '~/ts/libs/Math';

const PlantParam = {
	branch: {
		num: { value: 4, min: 0, max: 10, step: 1 },
		depth: { value: 2, min: 0, max: 5, step: 1 },
		radius: { value: 0.02, min: 0, max: 0.2, step: 0.01 },
		length: { value: 0.2, min: 0, max: 2, step: 0.01 },
		lengthMultiplier: { value: 0.9, min: 0, max: 2, step: 0.01 },
		yOffset: { value: 0.1, min: 0, max: 1, step: 0.01 },
		start: { value: 0.1, min: 0, max: 1, step: 0.01 },
		end: { value: 0.3, min: 0, max: 1, step: 0.01 },
	},
	leaf: {
		size: { value: 0.3, min: 0, max: 1, step: 0.01 },
	},
	seed: { value: 0, min: 0, max: 9999, step: 1 }
};

const _ = ( folder: FolderApi, o: any ) => {

	const keys = Object.keys( o );

	for ( let i = 0; i < keys.length; i ++ ) {

		const key = keys[ i ];
		const prop = o[ key ];

		if ( typeof prop == "object" ) {

			if ( prop.value !== undefined ) {

				if ( typeof prop.value == "number" ) {

					folder.addBinding( prop, "value", { ...prop, label: key } );

				}

			} else {

				_( folder.addFolder( { title: key } ), prop );

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

		const branch = ( i : number, direction: GLP.Vector, radius: number, length: number ): MXP.Entity => {

			const b = new MXP.Entity();

			const curve = new MXP.Curve();

			const points: MXP.CurvePoint[] = [];

			points.push( {
				x: 0,
				y: 0,
				z: 0,
			} );

			const segs = 8;

			for ( let i = 0; i < segs; i ++ ) {

				const w = ( i / ( segs - 1 ) );

				const p = new GLP.Vector();
				p.add( direction.clone().multiply( length * w ) );
				const offsetY = ( Math.log2( w + 1 ) ) * PlantParam.branch.yOffset.value;

				points.push( {
					x: p.x, y: p.y + offsetY, z: p.z,
					weight: ( 1.0 - w * 0.8 )
				} );

			}

			curve.setPoints( points );

			const geo = new MXP.CurveGeometry( curve, radius, 12, 8 );
			b.addComponent( "geometry", geo );
			b.addComponent( "material", new MXP.Material() );

			const ni = i + 1;
			const nl = length * PlantParam.branch.lengthMultiplier.value;

			if ( ni < PlantParam.branch.depth.value ) {

				const branches = PlantParam.branch.num.value;

				for ( let j = 0; j < branches; j ++ ) {

					const point = curve.getPoint( j / ( branches - 1 ) * ( PlantParam.branch.end.value - PlantParam.branch.start.value ) + PlantParam.branch.start.value );

					const nd = direction.clone();
					nd.y *= 0.0;
					const theta = random() * Math.PI * 2.0;
					nd.x += Math.sin( theta );
					nd.z += Math.cos( theta );

					const child = branch( ni, nd, radius * point.weight, nl );
					child.position.copy( point.position );

					b.add( child );

				}

			}

			if ( i > - 1 ) {

				const frame = curve.getFrenetFrames( 5 );

				const point = curve.getPoint( 1 );

				const child = new MXP.Entity();
				const size = PlantParam.leaf.size.value;

				child.addComponent( "geometry", new MXP.PlaneGeometry( size, size ) );
				child.addComponent( "material", new MXP.Material( { cullFace: false } ) );
				child.position.copy( point.position );

				child.quaternion.multiply( new GLP.Quaternion().setFromMatrix( frame.matrices[ 4 ] ) );

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

			plant = branch( 0, new GLP.Vector( 0.3, 1.0, 0.0 ), radius, length );

			this.add( plant );

		};

		plantFolder.on( "change", ( e ) =>{

			create();

		} );


		create();


	}

}
