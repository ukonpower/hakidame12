import * as MXP from 'maxpower';
import { VisibilitySwitcher } from '../../Components/VisibilitySwitcher';

export class Part extends MXP.Entity {

	public switcher: VisibilitySwitcher;

	constructor( partNum: number ) {

		super();

		this.switcher = this.addComponent( "switcher", new VisibilitySwitcher( partNum ) );

	}

}
