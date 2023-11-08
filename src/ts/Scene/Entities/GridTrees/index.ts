import * as GLP from 'glpower';
import * as MXP from 'maxpower';

import { Tree } from '~/ts/Scene/Entities/Tree';

const GRID = 8.0;
export class GridTrees extends MXP.Entity {

	private trees: Tree[];
	private tmpVector: GLP.Vector = new GLP.Vector();
	private tmpEuler: GLP.Vector = new GLP.Euler();

	constructor() {

		super();

		this.trees = [];

		for ( let i = 0; i < 2; i ++ ) {

			for ( let j = 0; j < 3; j ++ ) {

				for ( let k = 0; k < 14; k ++ ) {

					const tree = Math.random() < 0.5 ? new Tree() : createBox();

					const y = ( k / 14 - 0.5 ) * 4.0;
					const x = ( i - 0.5 ) * 1.5;
					const z = j - 1.0;

					tree.position.set( x * GRID, y * GRID, z * GRID );
					this.trees.push( tree );
					this.add( tree );

					tree.userData.rot = new GLP.Quaternion().setFromEuler( new GLP.Euler( Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5 ).multiply( 0.005 ) );
					tree.userData.moveY = Math.sin( x ) * Math.cos( z * 10.0 );


					const size = ( Math.sin( y ) * 0.5 + 0.5 ) * 0.7 + 0.3;
					tree.scale.set( size, size, size );

				}

			}

		}

	}

	protected updateImpl( event: MXP.EntityUpdateEvent ): void {

		for ( let i = 0; i < this.trees.length; i ++ ) {

			const tree = this.trees[ i ];

			tree.position.y += tree.userData.moveY * event.deltaTime * 0.5;

			if ( tree.position.y >= GRID * 2.0 ) {

				tree.position.y = - GRID * 2.0;

			} else if ( tree.position.y < - GRID * 2.0 ) {

				tree.position.y = GRID * 2.0;

			}

			tree.quaternion.multiply( tree.userData.rot );

		}

	}

}


const createBox = () => {

	const box = new MXP.Entity();

	box.addComponent( "geometry", Math.random() < 0.5 ? new MXP.CubeGeometry() : new MXP.CylinderGeometry( 0.25, 0.25, 1.0 ) );
	box.addComponent( "material", new MXP.Material( {} ) );

	return box;

};
