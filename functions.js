var he = require('he')
var marked = require('marked')

module.export = {
  formatEntries: function (entryArray) {
    var toReturn = entryArray.forEach(function(e) {
      e.title = he.decode(e.title)
      if (marked(he.decode(e.excerpt)).indexOf('<img src=') > 0) {
        e.excerpt = "<p><strong>Image post!</strong></p>" + marked(he.decode(e.excerpt + "..."));
      } else {
        e.excerpt = marked(he.decode(e.excerpt + "..."));
      }
    });
    return toReturn
  }
}