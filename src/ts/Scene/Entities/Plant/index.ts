import * as GLP from 'glpower';
import * as MXP from 'maxpower';

import { pane, paneRegister } from '~/ts/Globals/pane';
import { randomSeed } from '~/ts/libs/Math';

import leafFrag from './shaders/leaf.fs';
import branchFrag from './shaders/branch.fs';

let PlantParam = {
	root: {
		num: { value: 2, min: 0, max: 10, step: 1 },
		up: { value: 0.8, min: 0, max: 1, step: 0.01 }
	},
	branch: {
		num: { value: 2, min: 0, max: 10, step: 1 },
		depth: { value: 4, min: 0, max: 5, step: 1 },
		start: { value: 0.3, min: 0, max: 1, step: 0.01 },
		end: { value: 0.8, min: 0, max: 1, step: 0.01 },
		up: { value: 0.3, min: - 1, max: 1, step: 0.01 },
		wide: { value: 1.0, min: 0, max: 1, step: 0.01 },
		curve: { value: 0.24, min: - 1, max: 1, step: 0.01 },
		lengthMultiplier: { value: 0.6, min: 0, max: 2, step: 0.01 },
		lengthRandom: { value: 0.5, min: 0, max: 1, step: 0.01 },
	},
	shape: {
		length: { value: 0.5, min: 0, max: 2, step: 0.01 },
		radius: { value: 0.015, min: 0, max: 0.05, step: 0.001 },
	},
	leaf: {
		size: { value: 0.4, min: 0, max: 1, step: 0.01 },
		dpeth: { value: 1, min: 0, max: 5, step: 1 },
	},
	seed: { value: 0, min: 0, max: 9999, step: 1 }
};

const local = localStorage.getItem( "plant" );

if ( local ) {

	PlantParam = PlantParam;
	// PlantParam = JSON.parse( local );

}

const plantFolder = pane.addFolder( { title: "plant" } );

paneRegister( plantFolder, PlantParam );

let random = randomSeed( PlantParam.seed.value );

export class Plant extends MXP.Entity {

	private leaf: MXP.Entity | null = null;
	private root: MXP.Entity | null = null;

	constructor() {

		super();

		const branch = ( i : number, direction: GLP.Vector, radius: number, length: number ): MXP.Entity => {

			const branchEntity = new MXP.Entity();

			// branch curve

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

				const offsetY = ( Math.log2( w + 1 ) - w ) * PlantParam.branch.curve.value * 4.0;
				p.y += offsetY * length;

				points.push( {
					x: p.x, y: p.y, z: p.z,
					weight: 1.0 - w * 0.8
				} );

			}

			curve.setPoints( points );

			// branch mesh

			const geo = new MXP.CurveGeometry( curve, radius, 12, 8 );
			branchEntity.addComponent( "geometry", geo );
			branchEntity.addComponent( "material", new MXP.Material( { cullFace: false, frag: branchFrag } ) );

			// leaf

			if ( i >= PlantParam.leaf.dpeth.value && this.leaf ) {

				const point = curve.getPoint( 1 );

				const leafEntity = new MXP.Entity();
				leafEntity.addComponent( "geometry", this.leaf.getComponent( "geometry" )! );

				const size = PlantParam.leaf.size.value;
				leafEntity.scale.set( size );

				const mat = leafEntity.addComponent<MXP.Material>( "material", this.leaf.getComponent( "material" )! );
				mat.frag = leafFrag;
				mat.cullFace = false;

				leafEntity.position.copy( point.position );
				leafEntity.quaternion.multiply( new GLP.Quaternion().setFromMatrix( point.matrix ).multiply( new GLP.Quaternion().setFromEuler( new GLP.Euler( 0.0, 0.0, - Math.PI / 2 ) ) ) );

				const pos = new GLP.Vector( 0, 0.0, 0.0 );
				pos.applyMatrix3( point.matrix );

				leafEntity.position.add( pos );

				branchEntity.add( leafEntity );

			}

			// child branch

			if ( i < PlantParam.branch.depth.value - 1 ) {

				const branches = PlantParam.branch.num.value;

				for ( let j = 0; j < branches; j ++ ) {

					const pointPos = ( branches == 1 ? 0.5 : j / ( branches - 1 ) ) * ( PlantParam.branch.end.value - PlantParam.branch.start.value ) + PlantParam.branch.start.value;

					const point = curve.getPoint( pointPos );

					const nd = direction.clone();
					nd.normalize();

					const theta = ( random() - 0.5 ) * Math.PI * 2.0;
					nd.x += Math.sin( theta ) * PlantParam.branch.wide.value;
					nd.z += Math.cos( theta ) * PlantParam.branch.wide.value;
					nd.normalize();

					const dir = new GLP.Vector( 0.0, Math.sin( PlantParam.branch.up.value * Math.PI / 2.0 ), Math.cos( PlantParam.branch.up.value * Math.PI / 2.0 ) ).normalize();

					const child = branch( i + 1, dir, radius * point.weight, length * PlantParam.branch.lengthMultiplier.value * ( 1.0 - random() * PlantParam.branch.lengthRandom.value ) );
					child.quaternion.setFromEuler( new GLP.Euler( 0.0, Math.atan2( nd.x, nd.z ), 0.0 ) );

					child.position.add( point.position );
					branchEntity.add( child );

				}

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

				const dir = new GLP.Vector( 0.0, Math.sin( PlantParam.root.up.value * Math.PI / 2.0 ), Math.cos( PlantParam.root.up.value * Math.PI / 2.0 ) ).normalize();
				const b = branch( 0, dir, PlantParam.shape.radius.value, PlantParam.shape.length.value );
				b.quaternion.setFromEuler( new GLP.Euler( 0.0, i / PlantParam.root.num.value * Math.PI * 2.0, 0.0 ) );
				plant.add( b );

			}

			this.add( plant );

			this.root = plant;

		};

		create();

		// onchange

		plantFolder.on( "change", ( e ) =>{

			create();

			localStorage.setItem( "plant", JSON.stringify( PlantParam ) );

		} );

		// assets

		const loader = new MXP.GLTFLoader();

		loader.load( "/scene.glb" ).then( gltf => {

			const leaf = gltf.getEntityByName( "Leaf" );

			this.leaf = leaf!;

			create();

		} );

	}

	protected updateImpl( event: MXP.EntityUpdateEvent ): void {

		this.root?.children.forEach( ( item, i ) => {

			const wind = ( Math.sin( event.time * 1.0 ) * 0.5 + 0.5 ) * ( Math.sin( event.time * 1.4 ) * 0.5 + 0.5 );
			item.quaternion.multiply( new GLP.Quaternion().setFromEuler( new GLP.Euler( Math.sin( event.time * 8.0 + i ) * wind * 0.006, 0.0, 0.0 ) ) );

		} );


	}

}
