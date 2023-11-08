import * as GLP from 'glpower';
import * as MXP from 'maxpower';

import { Tree } from '~/ts/Scene/Entities/Tree';

const GRID = 8.0;
export class GridObjects extends MXP.Entity {

	private trees: Tree[];
	private tmpVector: GLP.Vector = new GLP.Vector();
	private tmpEuler: GLP.Vector = new GLP.Euler();

	constructor() {

		super();

		this.trees = [];

		for ( let i = 0; i < 3; i ++ ) {

			for ( let j = 0; j < 3; j ++ ) {

				for ( let k = 0; k < 3; k ++ ) {

					const obj = new MXP.Entity();
					obj.addComponent( "geometry", new MXP.CubeGeometry() );
					obj.addComponent( "material", new MXP.Material( {} ) );

					const x = ( i - 1 ) * GRID;
					const y = ( j - 1 ) * GRID;
					const z = ( k - 1 ) * GRID;

					obj.position.set( x, y, z );
					this.add( obj );

				}

			}

		}

	}

	protected updateImpl( event: MXP.EntityUpdateEvent ): void {

	}

}
