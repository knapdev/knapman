'use strict';

export class Direction{
    
	static NORTH = 0;
	static EAST = 1;
	static SOUTH = 2;
	static WEST = 3;
	static CENTER = 4;

	static getOpposite(dir){
		switch(dir){
			case Direction.NORTH:
				return Direction.SOUTH;
			case Direction.EAST:
				return Direction.WEST;
			case Direction.SOUTH:
				return Direction.NORTH;
			case Direction.WEST:
				return Direction.EAST;
			case Direction.CENTER:
				console.log('Center direction has no inverse.');
				return Direction.CENTER;
		}

		console.error(dir + ': is not a direction.');
		return null;
	}

	static isDirection(dir){
		if(dir >= 0 && dir < 7){
			return true;
		}

		return false;
	}
}