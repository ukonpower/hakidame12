import * as MXP from 'maxpower';

export class Plant extends MXP.Entity {

	constructor() {

		super();

		const curve = new MXP.Curve();

		const points: MXP.CurvePoint[] = [];

		for ( let i = 0; i < 50; i ++ ) {

			points.push( {
				x: ( Math.random() - 0.5 ) * 8.0,
				y: ( Math.random() - 0.5 ) * 8.0,
				z: ( Math.random() - 0.5 ) * 8.0,
			} );

		}

		curve.setPoints( points );

		const geo = new MXP.CurveGeometry( curve, 0.1, 512, 24 );
		this.addComponent( "geometry", geo );
		this.addComponent( "material", new MXP.Material() );

	}

}
