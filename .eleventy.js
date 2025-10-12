const Image = require("@11ty/eleventy-img");
const path = require("path");
const fs = require("fs");

async function imageShortcode(src, alt, sizes = "100vw") {
  if(!alt) {
    throw new Error(`Missing \`alt\` on responsive image from: ${src}`);
  }

  // Check if the image file exists
  let imagePath = path.join(__dirname, src);
  if (!fs.existsSync(imagePath)) {
    // Return a placeholder if image doesn't exist
    console.warn(`Image not found: ${src}, using placeholder`);
    return `<div class="h-48 bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white">
              <span>Image: ${alt}</span>
            </div>`;
  }

  try {
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
  } catch (error) {
    console.warn(`Error processing image ${src}:`, error.message);
    // Fallback to simple image tag
    return `<img src="${src}" alt="${alt}" class="w-full h-48 object-cover" loading="lazy">`;
  }
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

  // Add a simple image shortcode that doesn't process images
  eleventyConfig.addShortcode("simpleImg", function(src, alt, classes = "w-full h-48 object-cover") {
    if (!src || src === '/src/images/') {
      return `<div class="h-48 bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white">
                <span>${alt || 'Image'}</span>
              </div>`;
    }
    return `<img src="${src}" alt="${alt || ''}" class="${classes}" loading="lazy">`;
  });

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