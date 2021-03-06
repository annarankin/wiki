var config = require('./information.js')
var sqlite3 = require('sqlite3')
var express = require('express')
var morgan = require('morgan')
var Mustache = require('mustache')
var fs = require('fs')
var methodOverride = require('method-override')
var bodyParser = require('body-parser')
var moment = require('moment')
var he = require('he')
var marked = require('marked')
var sendgrid = require('sendgrid')(config.sendgridUsername, config.sendgridKey);
// var functions = require('./functions.js')
marked.setOptions({
  renderer: new marked.Renderer(),
  gfm: true,
  tables: true,
  breaks: true,
  pedantic: false,
  sanitize: true,
  smartLists: true,
  smartypants: false
});
var db = new sqlite3.Database('./wikidata.db', function(err, data) {
  console.log("DB linked!!");
});
//set up application's server
var app = express();
app.use(morgan('dev'))
app.use(bodyParser.urlencoded({
  extended: false
}))
app.use(methodOverride('_method'))
app.use(express.static(__dirname, 'views'))

var htmlHeader = fs.readFileSync('./views/header.html', 'utf8');
var htmlFooter = fs.readFileSync('./views/footer.html', 'utf8');

function formatEntries(entryArray) {
  var toReturn = entryArray.forEach(function(e) {
    e.title = he.decode(e.title)
    if (marked(he.decode(e.excerpt)).indexOf('<img src=') > 0) {
      e.excerpt = '<p><span style="color:red"><strong>Image post!</strong></span></p>' + marked(he.decode(e.excerpt + "..."));
    } else {
      e.excerpt = marked(he.decode(e.excerpt + "..."));
    }
  });
  return toReturn
}

// get "/" - read db, render a template with results of "articles" table, send index page as HTML
app.get('/', function(req, res) {
  fs.readFile('./views/index.html', 'utf8', function(err, indexTemplate) {
    //query db for author and article content for 5 most recent entries
    db.all("SELECT *, SUBSTR(content, 1, 200) AS excerpt, articles.id AS article_id FROM articles JOIN authors ON authors.id=articles.author_id ORDER BY timestamp DESC LIMIT 5;", {}, function(err, recentEntries) {
      formatEntries(recentEntries);
      var html = htmlHeader + Mustache.render(indexTemplate, {
        articles: recentEntries
      }) + htmlFooter;
      res.send(html);
    }); //end db.all function
  }); //end readFile function
}); //end app.get function

//view articles
app.get('/articles', function(req, res) {
  fs.readFile('./views/articlelist.html', 'utf8', function(err, indexTemplate) {
    //query db for author and article content for 5 most recent entries
    db.all("SELECT *, SUBSTR(content, 1, 200) AS excerpt, articles.id AS article_id FROM articles JOIN authors ON authors.id=articles.author_id ORDER BY timestamp DESC;", {}, function(err, recentEntries) {
      formatEntries(recentEntries);
      var html = htmlHeader + Mustache.render(indexTemplate, {
        articles: recentEntries
      }) + htmlFooter;
      res.send(html);
    }); //end db.all function
  }); //end readFile function
}); //end app.get function});

//add new article FORM
app.get('/articles/new', function(req, res) {
  var erroar = req.query.erroar
  console.log(erroar)
  db.all("SELECT * FROM authors;", {}, function(err, authorArray) {
    fs.readFile('./views/new.html', 'utf8', function(err, newTemplate) {
      if (erroar === "YUP") {
        var html = htmlHeader + Mustache.render(newTemplate, {
          authors: authorArray
        }) + '<span class="erroar">**Please enter a title AND content!**</span>' + htmlFooter;
      } else {
        var html = htmlHeader + Mustache.render(newTemplate, {
          authors: authorArray
        }) + htmlFooter;
      }
      res.send(html)
    }); //end readfile function
  }); //end db.all function
}); //end app.get function

//add new author

app.post('/articles/new', function(req, res) {
  var newAuthor = req.body.new_author;
  var newEmail = req.body.new_email;
  db.run("INSERT INTO authors (author, email) VALUES ('" + newAuthor + "','" + newEmail + "');")
  res.redirect('/articles/new')
}); //end app.post function



// get "/article/id" - query db for specific article by ID, render into HTML template and send

app.get('/articles/:id', function(req, res) {
  var articleID = req.params.id;
  fs.readFile('./views/article.html', 'utf8', function(err, articleTemplate) {
    db.all("SELECT title, author, authors.id AS author_id, timestamp, content, category, articles.id AS article_id, categories.id AS category_id FROM articles JOIN tags ON articles.id = article_id JOIN categories ON categories.id = category_id JOIN authors ON authors.id = author_id WHERE articles.id = " + articleID + ";", {}, function(err, articleData) {
      console.log(articleData[0])
      if (articleData[0] !== undefined) {
        var categoryArray = []
        articleData.forEach(function(e) {
          var categoryObj = {
            "category": e.category,
            "category_id": e.category_id
          };
          categoryArray.push(categoryObj);
        });
        articleData[0].categories = categoryArray;
        articleData[0].content = marked(he.decode(articleData[0].content))
        articleData[0].title = he.decode(articleData[0].title)
        console.log(articleData[0].content)
        var html = htmlHeader + Mustache.render(articleTemplate, articleData[0]) + htmlFooter;
        res.send(html);
      } else {
        db.all("SELECT title, author, timestamp, content, articles.id AS article_id FROM articles JOIN authors ON authors.id = author_id WHERE articles.id = " + articleID + ";", {}, function(err, article) {
          console.log(article)
          article[0].categories = {
            category: "No categories yet!"
          }
          var html = htmlHeader + Mustache.render(articleTemplate, article[0]) + htmlFooter;
          res.send(html);
        });
      }
    }); //end db.all function
  }); //end readfile function
}); //end app.get function

//add new article to db - submitting to db & adding relations
app.post('/articles', function(req, res) {

  var timestamp = moment().format('YYYY-MM-DD HH:mm:ss a');;
  var authorId = req.body.author;
  var newTitle = he.encode(req.body.title);
  var newContent = he.encode(req.body.content);
  var newCategories = req.body.categories.split(",");

  var newCatTrimmed = []
  newCategories.forEach(function(e) {
    var trimmed = e.trim().toLowerCase().replace(/\W/g, "_").replace(/ /g, "_");
    newCatTrimmed.push(trimmed);
  });

  if (newTitle.length > 1 && newContent.length > 1) {
    db.run("INSERT INTO articles (author_id, title, timestamp, content) SELECT " + authorId + ",'" + newTitle + "','" + timestamp + "','" + newContent + "' WHERE NOT EXISTS (SELECT 1 FROM articles WHERE author_id =" + authorId + " AND title='" + newTitle + "' AND timestamp='" + timestamp + "' AND content='" + newContent + "');")
    db.all("SELECT id FROM articles WHERE title='" + newTitle + "' AND content='" + newContent + "' AND timestamp='" + timestamp + "';", {}, function(err, article_id) {
      var articleID = article_id[0].id;
      db.run("INSERT INTO changelog (article_id, author, title, timestamp, content) VALUES (" + articleID + ", 'original author','" + newTitle + "','" + timestamp + "','" + newContent + "');")
    });

    newCatTrimmed.forEach(function(e) {
      if (e.replace(/ /g, "") !== "") {
        db.run("INSERT INTO categories (category) SELECT '" + e + "' WHERE NOT EXISTS (SELECT 1 FROM categories WHERE category='" + e + "');")
      } else {
        console.log("Empty category thing")
      }
    }); //end foreach

    //get IDs for all categories & get author id, send to tags table
    db.all("SELECT id FROM articles WHERE author_id='" + authorId + "' AND title='" + newTitle + "' AND timestamp ='" + timestamp + "' AND content='" + newContent + "';", {}, function(err, articleData) {
      //var parsedArt = JSON.parse(articleData);
      var articleID = articleData[0].id;
      newCatTrimmed.forEach(function(e) {
        db.all("SELECT id FROM categories WHERE category='" + e + "';", {}, function(err, category) {
          if (category[0] !== undefined) {
            var categoryId = category[0].id;
            db.run("INSERT INTO tags (article_id, category_id) VALUES ('" + articleID + "','" + categoryId + "');")
          }
        }); //end category ID get db.all function

      }); //end foreach
      res.redirect('/articles/' + articleID)
    }); //end db.all get article id function
  } else {
    res.redirect('/articles/new?erroar=YUP')
  } //end conditional that checks if user entered both title and content.
}); //end app.post articles function


//edit article form
app.get('/articles/:id/edit', function(req, res) {
  var articleID = req.params.id;
  db.all("SELECT * FROM articles INNER JOIN tags ON tags.article_id = articles.id INNER JOIN categories ON tags.category_id = categories.id WHERE articles.id ='" + articleID + "';", {}, function(err, articleData) {
    if (articleData[0] === undefined) {
      db.all("SELECT *, id AS article_id FROM articles WHERE articles.id =" + articleID, {}, function(err, article) {
        fs.readFile('./views/edit.html', 'utf8', function(err, editTemplate) {
          var html = htmlHeader + Mustache.render(editTemplate, article[0]) + htmlFooter;
          res.send(html)
        });
      });
    } else {
      var categoryArray = []
      articleData.forEach(function(e) {
        categoryArray.push(e.category);
      });
      articleData[0].catString = categoryArray.join(", ")

      db.all("SELECT * FROM changelog WHERE article_id=" + articleID, {}, function(err, revisions) {
        articleData[0].revisions = revisions;
        articleData[0].content = he.decode(articleData[0].content)
        articleData[0].title = he.decode(articleData[0].title)
        fs.readFile('./views/edit.html', 'utf8', function(err, editTemplate) {
          var html = htmlHeader + Mustache.render(editTemplate, articleData[0]) + htmlFooter;
          res.send(html)
        }); //end readfile
      });
    }
  }); //end db.all funkyshun
}); //end app.get function

//restore revision
app.put('/articles/:article_id/edit/:id', function(req, res) {
  var articleID = req.params.article_id;
  var revisionID = req.params.id;
  db.all("SELECT * FROM changelog WHERE id =" + revisionID + ";", {}, function(err, article) {
    newContent = article[0].content;
    newTitle = article[0].title;
    timestamp = moment().format('YYYY-MM-DD HH:mm:ss a');
    //add article DB info
    db.run("UPDATE articles SET title ='" + newTitle + "', content='" + newContent + "' WHERE id='" + articleID + "';");
    db.run("INSERT INTO changelog (article_id, author, title, timestamp, content) VALUES (" + articleID + ", 'restoration to prior version','" + newTitle + "','" + timestamp + "','" + newContent + "');")
    res.redirect('/articles/' + articleID);
  });
});


//submit edited article formdata
app.put('/articles/:id', function(req, res) {
  //set up all the variables, clean up
  var articleID = req.params.id;
  var timestamp = moment().format('YYYY-MM-DD HH:mm:ss a');
  var newTitle = he.encode(req.body.title);
  var newContent = he.encode(req.body.content);
  var newEditor = req.body.author;
  if (newEditor === undefined) {
    newEditor = "anonymous editor";
  };
  var newCategories = req.body.categories.split(",");
  console.log("This is a length " + newCategories.length)
  if (newCategories.length > 0) {

    var newCatTrimmed = []
    newCategories.forEach(function(e) {
      var trimmed = e.trim().toLowerCase().replace(/\W/g, "").replace(/ /g, "_");
      newCatTrimmed.push(trimmed);
    });

    newCatTrimmed.forEach(function(e) {
      db.serialize(function() {
        db.run("INSERT INTO categories (category) SELECT '" + e + "' WHERE NOT EXISTS (SELECT 1 FROM categories WHERE category='" + e + "');")
        db.all("SELECT id FROM categories WHERE category='" + e + "';", {}, function(err, category) {
            var categoryId = category[0].id;
            db.run("INSERT INTO tags SELECT '" + articleID + "','" + categoryId + "' WHERE NOT EXISTS (SELECT 1 FROM tags WHERE article_id='" + articleID + "' AND category_id='" + categoryId + "');")
            console.log("categolly" + category)
          }) //end serialization callbach
      }); //end category ID get db.all function
    }); //end foreach
  } //close conditional that checks for new categories

  //add article DB info
  db.run("UPDATE articles SET title ='" + newTitle + "', content='" + newContent + "' WHERE id='" + articleID + "';");
  db.run("INSERT INTO changelog (article_id, author, title, timestamp, content) VALUES (" + articleID + ", '" + newEditor + "','" + newTitle + "','" + timestamp + "','" + newContent + "');")
  res.redirect('/articles/' + articleID);

  //send email to author
  if (newEditor.length < 1) {
    newEditor = "anonymous";
  }
  var emailContent = '<h1 style="color:#ee4433;">Your article has been updated!</h1><h2>Edited by ' + newEditor + " on " + timestamp + ":</h2><h3>" + newTitle + "</h3><p>" + marked(newContent) + "</p>"

  db.all("SELECT email FROM authors LEFT JOIN articles on articles.id=" + articleID + " WHERE authors.id = articles.author_id", {}, function(err, authorEmail) {
    sendgrid.send({
      to: authorEmail[0].email,
      from: 'anna@annarankin.com',
      subject: 'Your article has been updated!',
      html: emailContent
    }, function(err, json) {
      if (err) {
        return console.error(err);
      }
      console.log(json);
    });
  })

});

//delete article
app.delete('/articles/:id', function(req, res) {
  var articleID = req.params.id;
  db.run("DELETE FROM articles WHERE id='" + articleID + "';");
  db.run("DELETE FROM tags WHERE article_id='" + articleID + "';");
  db.run("DELETE FROM categories WHERE id NOT IN (SELECT DISTINCT category_id FROM tags);")
  res.redirect('/');

}); //end delete callback


//see all by author
app.get('/authors/:id', function(req, res) {
  var authorId = req.params.id;
  fs.readFile('./views/authorpage.html', 'utf8', function(err, authorTemplate) {
    db.all("SELECT *, SUBSTR(content, 1, 200) AS excerpt, articles.id AS article_id FROM articles JOIN authors ON articles.author_id=authors.id WHERE author_id='" + authorId + "';", {}, function(err, articles) {
      console.log("THIS IS A LOG: " + articles)
      if (articles[0] === undefined) {
        db.all("SELECT * FROM authors WHERE id=" + authorId, {}, function(err, author) {
          var toRender = {
            author: author[0].author,
            email: author[0].email,
            articleCount: 0,
            articles: "No articles yet!"
          }
          var html = htmlHeader + Mustache.render(authorTemplate, toRender) + htmlFooter;
          res.send(html)
        });
      } else {
        formatEntries(articles);
        var toRender = {
          author: articles[0].author,
          email: articles[0].email,
          articleCount: articles.length,
          articles: articles
        }
        var html = htmlHeader + Mustache.render(authorTemplate, toRender) + htmlFooter;
        res.send(html)
      }
    });
  }); //end readfile
}); //end authors get callback

//see all authors
app.get('/authors', function(req, res) {
  fs.readFile('./views/authors.html', 'utf8', function(err, authorTemplate) {
    console.log(authorTemplate)
    db.all('SELECT * FROM authors;', {}, function(err, authors) {
      console.log(authors);
      var html = htmlHeader + Mustache.render(authorTemplate, {
        authors: authors
      }) + htmlFooter;
      res.send(html)
    })
  })
})

//see categories
app.get('/categories', function(req, res) {
  fs.readFile('./views/categories.html', 'utf8', function(err, categoryListTemplate) {
    db.all("SELECT * FROM categories;", {}, function(err, categories) {
      var html = htmlHeader + Mustache.render(categoryListTemplate, {
        categories: categories
      }) + htmlFooter;
      res.send(html);
    });
  });
});

//see all in particular category
app.get('/categories/:id', function(req, res) {
  var categoryId = req.params.id;
  fs.readFile('./views/categories_by_id.html', 'utf8', function(err, categoryListTemplate) {
    db.all("SELECT category, articles.id AS article_id, author_id, title, timestamp, SUBSTR(content,1,200) AS excerpt, categories.id AS category_id FROM categories INNER JOIN tags ON tags.category_id= categories.id INNER JOIN articles ON tags.article_id= articles.id WHERE categories.id=" + categoryId + ";", {}, function(err, articles) {
      if (articles[0] !== undefined) {

        articles[0].articles = articles.map(function(e) {
          return {
            article_id: e.article_id,
            title: e.title
          }
        });
        console.log(articles[0])
        var html = htmlHeader + Mustache.render(categoryListTemplate, articles[0]) + htmlFooter;;
        res.send(html);
      } else {
        res.send("SELECT category, articles.id AS article_id, author_id, title, timestamp, SUBSTR(content,1,200) AS excerpt, categories.id AS category_id FROM categories INNER JOIN tags ON tags.category_id= categories.id INNER JOIN articles ON tags.article_id= articles.id WHERE categories.id=" + categoryId + ";" + "<br><br>" + articles + "<br><br>" + err)
      }
    });
  });
});

//search function
app.get('/search', function(req, res) {
  var query = req.query.q;
  fs.readFile('./views/categories_by_id.html', 'utf8', function(err, categoryListTemplate) {
    //pull out categories that match
    //pull out article titles that match
    //
    db.all("SELECT DISTINCT title, categories.id AS category_id, article_id, category FROM tags, articles, categories WHERE category LIKE '%" + query + "%' AND tags.article_id=articles.id AND categories.id=category_id OR title LIKE '%" + query + "%' AND tags.article_id=articles.id AND categories.id=category_id GROUP BY article_id;", {}, function(err, articles) {
      if (articles[0] !== undefined) {
        var toRender = {
          category: query,
          articles: articles
        }
        var html = htmlHeader + Mustache.render(categoryListTemplate, toRender) + htmlFooter;;
        res.send(html);
      } else {
        var toRender = {
          category: query,
          articles: {
            article_id: "",
            title: "I FOUND NOTHING! Click to view all articles"
          }
        }
        var html = htmlHeader + Mustache.render(categoryListTemplate, toRender) + htmlFooter;;
        res.send(html);
      }
    });
  });
});


//app listen on 3000
app.listen(3000, function() {
  console.log("Server is alive and listening keenly on 3000")
});