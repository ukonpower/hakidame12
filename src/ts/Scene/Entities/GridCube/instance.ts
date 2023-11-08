export const gridCubeInstance = ( res: number ) => {

	const positionArray = [];
	const normalArray = [];
	const idArray = [];
	const randomArray = [];

	let c = 0;

	for ( let i = 0; i < res; i ++ ) {

		for ( let j = 0; j < res; j ++ ) {

			for ( let k = 0; k < res; k ++ ) {

				const indexX = k / ( res );
				const indexY = j / ( res );
				const indexZ = i / ( res );

				const posX = k / ( res - 1 ) - 0.5;
				const posY = j / ( res - 1 ) - 0.5;
				const posZ = i / ( res - 1 ) - 0.5;

				// pos

				positionArray.push(
					posX,
					posY,
					posZ
				);

				//  id
				idArray.push(
					indexX,
					indexY,
					indexZ,
					c,
				);

				// random

				randomArray.push(
					Math.random(),
					Math.random(),
					Math.random(),
					Math.random(),
				);


				// direction

				let maxP = 0.0;
				let dir = 'x';

				if ( Math.abs( maxP ) < Math.abs( posX ) ) {

					dir = 'x';
					maxP = posX;

				}

				if ( Math.abs( maxP ) < Math.abs( posY ) ) {

					dir = 'y';
					maxP = posY;

				}

				if ( Math.abs( maxP ) < Math.abs( posZ ) ) {

					dir = 'z';
					maxP = posZ;

				}

				normalArray.push(
					( dir == 'x' ? 1.0 : 0.0 ) * Math.sign( maxP ),
					( dir == 'y' ? 1.0 : 0.0 ) * Math.sign( maxP ),
					( dir == 'z' ? 1.0 : 0.0 ) * Math.sign( maxP ),
				);

				c ++;

			}

		}

	}

	return {
		positionArray,
		normalArray,
		idArray,
		randomArray
	};

};
