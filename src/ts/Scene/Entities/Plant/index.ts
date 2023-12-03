import * as GLP from 'glpower';
import * as MXP from 'maxpower';
import { pane, paneRegister } from '~/ts/Globals/pane';
import { randomSeed } from '~/ts/libs/Math';

let PlantParam = {
	root: {
		num: { value: 2, min: 0, max: 10, step: 1 },
		wide: { value: 0, min: 0.01, max: 2, step: 0.01 },
	},
	branch: {
		num: { value: 2, min: 0, max: 10, step: 1 },
		depth: { value: 2, min: 0, max: 5, step: 1 },
		start: { value: 0.1, min: 0, max: 1, step: 0.01 },
		end: { value: 0.3, min: 0, max: 1, step: 0.01 },
		wide: { value: 0.2, min: 0, max: 2, step: 0.01 },
		up: { value: 1.0, min: 0, max: 2, step: 0.01 },
		curve: { value: 0.24, min: - 2, max: 2, step: 0.01 },
		lengthMultiplier: { value: 0.9, min: 0, max: 2, step: 0.01 },
	},
	shape: {
		length: { value: 0.2, min: 0, max: 2, step: 0.01 },
		radius: { value: 0.02, min: 0, max: 0.05, step: 0.001 },
	},
	leaf: {
		size: { value: 0.1, min: 0, max: 1, step: 0.01 },
	},
	seed: { value: 0, min: 0, max: 9999, step: 1 }
};

const local = localStorage.getItem( "plant" );

if ( local ) {

	PlantParam = PlantParam;
	PlantParam = JSON.parse( local );

}

const plantFolder = pane.addFolder( { title: "plant" } );

paneRegister( plantFolder, PlantParam );

let random = randomSeed( PlantParam.seed.value );

export class Plant extends MXP.Entity {

	private leaf: MXP.Entity | null = null;

	constructor() {

		super();

		const branch = ( i : number, direction: GLP.Vector, radius: number, length: number ): MXP.Entity => {

			const branchEntity = new MXP.Entity();
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
				p.y += w * PlantParam.branch.up.value * length;

				const offsetY = ( Math.log2( w + 1 ) - w ) * PlantParam.branch.curve.value;
				p.y += offsetY * length;

				points.push( {
					x: p.x, y: p.y, z: p.z,
					weight: 1.0 - w * 0.8
				} );

			}

			curve.setPoints( points );

			const geo = new MXP.CurveGeometry( curve, radius, 12, 8 );
			branchEntity.addComponent( "geometry", geo );
			branchEntity.addComponent( "material", new MXP.Material( { cullFace: false } ) );

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
					child.position.add( point.position );

					branchEntity.add( child );

				}

			}

			// leafe

			if ( i > - 1 && this.leaf ) {

				const point = curve.getPoint( 1 );

				const leafEntity = new MXP.Entity();
				const size = PlantParam.leaf.size.value;

				leafEntity.addComponent( "geometry", this.leaf.getComponent( "geometry" )! );
				const mat = leafEntity.addComponent<MXP.Material>( "material", this.leaf.getComponent( "material" )! );
				mat.cullFace = false;

				leafEntity.position.copy( point.position );
				leafEntity.quaternion.multiply( new GLP.Quaternion().setFromMatrix( point.matrix ).multiply( new GLP.Quaternion().setFromEuler( new GLP.Euler( 0.0, 0.0, - Math.PI / 2 ) ) ) );


				const pos = new GLP.Vector( 0, 0.0, 0.0 );
				pos.applyMatrix3( point.matrix );

				leafEntity.position.add( pos );

				branchEntity.add( leafEntity );

			}

			return branchEntity;

		};

		let plant: MXP.Entity | null = null;

		const create = () => {

			random = randomSeed( PlantParam.seed.value );

			if ( plant ) {

				this.remove( plant );

			}

			plant = new MXP.Entity();

			for ( let i = 0; i < PlantParam.root.num.value; i ++ ) {

				const dir = new GLP.Vector( ( random() - 0.5 ) * PlantParam.root.wide.value, 1.0, ( random() - 0.5 ) * PlantParam.root.wide.value ).normalize();

				plant.add( branch( 0, dir, PlantParam.shape.radius.value, PlantParam.shape.length.value ) );

			}

			this.add( plant );

		};

		plantFolder.on( "change", ( e ) =>{

			create();

			localStorage.setItem( "plant", JSON.stringify( PlantParam ) );

		} );

		create();

		// assets

		const loader = new MXP.GLTFLoader();

		loader.load( "/scene.glb" ).then( gltf => {

			const leaf = gltf.getEntityByName( "Leaf" );

			this.leaf = leaf!;

			create();

		} );

	}

}
