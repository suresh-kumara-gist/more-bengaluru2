const Image = require("@11ty/eleventy-img");

async function imageShortcode(src, alt, sizes = "100vw") {
  if(!alt) {
    throw new Error(`Missing \`alt\` on responsive image from: ${src}`);
  }

  let metadata = await Image(src, {
    widths: [400, 800, 1200],
    formats: ['avif', 'webp', 'jpeg'],
    outputDir: './_site/img/',
    urlPath: '/img/'
  });

  let imageAttributes = {
    alt,
    sizes,
    loading: "lazy",
    decoding: "async",
  };

  return Image.generateHTML(metadata, imageAttributes);
}

// Date filter for formatting
function postDate(date) {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function postDateKannada(date) {
  return new Date(date).toLocaleDateString('kn-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Slug filter for URLs
function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
}

module.exports = function(eleventyConfig) {
  // Add image shortcode for both Nunjucks and Liquid
  eleventyConfig.addNunjucksAsyncShortcode("image", imageShortcode);
  eleventyConfig.addLiquidShortcode("image", imageShortcode);
  eleventyConfig.addJavaScriptFunction("image", imageShortcode);

  // Add date filters
  eleventyConfig.addFilter("postDate", postDate);
  eleventyConfig.addFilter("postDateKannada", postDateKannada);
  eleventyConfig.addFilter("slug", slugify);

  // Pass through files
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("admin");
  eleventyConfig.addPassthroughCopy("src/images");
  eleventyConfig.addPassthroughCopy("**/*.jpg");
  eleventyConfig.addPassthroughCopy("**/*.png");
  eleventyConfig.addPassthroughCopy("**/*.webp");

  // Create news collections
  eleventyConfig.addCollection("news_en", function(collection) {
    return collection.getFilteredByGlob("_news/*.md").filter(item => {
      return item.data.lang === 'en';
    }).sort((a, b) => b.date - a.date);
  });

  eleventyConfig.addCollection("news_kn", function(collection) {
    return collection.getFilteredByGlob("_news/*.md").filter(item => {
      return item.data.lang === 'kn';
    }).sort((a, b) => b.date - a.date);
  });

  // Create corporators collection
  eleventyConfig.addCollection("corporators", function(collection) {
    return collection.getFilteredByGlob("_corporators/*.md");
  });

  // Simple image shortcode for testing
  eleventyConfig.addShortcode("simpleImage", function(src, alt) {
    return `<img src="${src}" alt="${alt}" class="w-full h-48 object-cover" loading="lazy">`;
  });

  // Set input and output directories
  return {
    dir: {
      input: ".",
      output: "_site",
      includes: "_includes"
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk"
  };
};