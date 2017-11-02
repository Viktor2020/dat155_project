"use strict";

/**
 * Collection of general purpose utilities.
 */
class Utilities {
	/**
	 * Loads image from url.
	 * @param  {String} url Location of image to load.
	 * @return {Promise} A Promise-object that resolves with the Image-object.
	 */
	static loadImage(url) {
		return new Promise((resolve, reject) => {

			if (!url) {
				reject('No URL was specified.');
			}

			let image = new Image();
			image.src = url;

			image.addEventListener('load', () => {
			    resolve(image);
			});

			image.addEventListener('error', () => {
				reject('Unable to load image. Make sure the URL is correct (' + image.src + ').');
			});
		});
	}

	
}