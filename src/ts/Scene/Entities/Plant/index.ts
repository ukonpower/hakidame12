import * as GLP from 'glpower';
import * as MXP from 'maxpower';

export class Plant extends MXP.Entity {

	constructor() {

		super();

		const curve = new MXP.Curve();

		curve.setPoints( [
			{ x: 0, y: 0, z: 0, radiusWeight: 0.2 },
			{ x: 4, y: 0, z: 0, radiusWeight: 0.2 },
			{ x: 3, y: 4, z: 0, radiusWeight: 0.2 },
			{ x: 3, y: 3, z: 2, radiusWeight: 0.2 },
			{ x: 3, y: 1, z: 2, radiusWeight: 0.2 },
			{ x: 0, y: 0, z: 2, radiusWeight: 0.2 },
			{ x: 0, y: 3, z: 2, radiusWeight: 0.2 },
		] );

		const geo = new MXP.CurveGeometry( curve, 48, 12 );

		this.addComponent( "geometry", geo );
		this.addComponent( "material", new MXP.Material() );

	}

}
