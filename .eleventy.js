const Image = require("@11ty/eleventy-img");

module.exports = function (eleventyConfig) {

    eleventyConfig.addPassthroughCopy('css')
    eleventyConfig.addPassthroughCopy('fonts')

    eleventyConfig.addFilter('dateForTitle', str => {
        return new Date(str).toLocaleDateString('en-UK', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            timeZone: 'UTC'
          })
    })
	
    eleventyConfig.addFilter('getDate', str => {
        return new Date(str).getUTCDate();
    })


    eleventyConfig.addShortcode("image", async function(src, alt, classes) {
		let metadata = await Image(src, {
			widths: [480, 960],
            outputDir: "./_site/img/"
		});

		let imageAttributes = {
			alt,
			class: classes,
			sizes: [480, 960],
			loading: "lazy",
			decoding: "async",
		};

		// You bet we throw an error on a missing alt (alt="" works okay)
		return Image.generateHTML(metadata, imageAttributes);
	});
}