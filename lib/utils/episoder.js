//From https://github.com/rohanorton/episoder
var path = require("path"),
    titleCase = require("to-title-case");

// filename: string
// options: object
function parseFilename(filename, options) {

  if (options === undefined) {
    options = {};
  }

  var ext = path.extname(filename).toLowerCase(),
    show,
    season,
    episode,
    offset,
    title,
    episodeObject = {},
    // the following regex should match:
    //   Community S01E04.mp4
    //   Community s01e04.mp4
    //   Community 1x04.mp4
    //   Community 1-04.mp4
    //   Community - Title episode s01e04.mp4
  re = /([^\n-]*)(-\s(.*))?\s\D?(\d{1,2})[ex\-](\d{1,3})/i,
  searchResults = filename.match(re);

  if(searchResults !== null){
    show = searchResults[1];
    season = searchResults[4];
    episode = searchResults[5];
    if(searchResults[3]){
      title = searchResults[3];
    }
  }

  if (searchResults === null) {
    // this regex should match:
    //   Community Season 1 Episode 4.mp4
    // (case insensitive)
    re = /(.*)Season.*?(\d{1,2}).*Episode\D*?(\d{1,3})/i;
    searchResults = filename.match(re);
    if(searchResults !== null){
      show = searchResults[1];
      season = searchResults[2];
      episode = searchResults[3];
    }
  }

  if (searchResults === null) {
    // this regex should match:
    //   Community 104.mp4
    re = /(.*)\D(\d)+(\d\d)\D/;
    searchResults = filename.match(re);
    if(searchResults !== null){
      show = searchResults[1];
      season = searchResults[2];
      episode = searchResults[3];
    }
  }

  if (searchResults === null && options.season) {
    // this regex should match:
    //   Community 04.mp4
    // but only if we've specified a season with season flag
    re = /(.*)\D(\d+)\D/;
    searchResults = filename.match(re);
    if(searchResults !== null){
      show = searchResults[1];
      episode = searchResults[2];
    }
  }

  if (searchResults === null && options.season && options.show) {
    // this regex should match:
    //   04.mp4
    // but only if we've specified a season and show with flags
    re = /(\d+)\D/;
    searchResults = filename.match(re);
    if(searchResults !== null){
      episode = searchResults[1];
    }
  }

  try {
    if(!show){
      show = options.show;
    }
  } catch (e) {
    return null;
  }
  offset = options.offset || 0;

  if(options.episode) {
    episode = options.episode;
  }
  if(offset){
    episode += offset;
  }
  if(options.season){
    season = options.season;
  }

  show = titleCase(show
      // remove hanging characters
      .replace(/^[\-.\s]+|[\-.\s]+$/g, "")
      .trim());
  if(title){
    title = title.trim();
  }

  episodeObject = {
    originalFilename: filename,
    show: show,
    season: season,
    episode: episode,
    extension: ext,
    title: title
  };
  return episodeObject;
}

exports.parseFilename = parseFilename;
