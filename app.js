//set up requirements - sqlite3, mustache, morgan, marked(for later), moment(for timestamps, can do hour/minute and stuff), express ...

var sqlite3 = require('sqlite3')
var express = require('express')
var morgan = require('morgan')
var Mustache = require('mustache')
var fs = require('fs')
var methodOverride = require('method-override')
var bodyParser = require('body-parser')
var moment = require('moment')
var he = require('he')

//var sendgrid = require('sendgrid')(api_user, api_key);
// sendgrid.send({
//   to: 'example@example.com',
//   from: 'other@example.com',
//   subject: 'Hello World',
//   text: 'My first email through SendGrid.'
// }, function(err, json) {
//   if (err) {
//     return console.error(err);
//   }
//   console.log(json);
// });

var marked = require('marked')
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

//set up db variable, link to file
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

// get "/" - read db, render a template with results of "articles" table, send index page as HTML
app.get('/', function(req, res) {
  fs.readFile('./views/index.html', 'utf8', function(err, indexTemplate) {
    //query db for author and article content for 5 most recent entries
    db.all("SELECT *, SUBSTR(content, 1, 200) AS excerpt, articles.id AS article_id FROM articles JOIN authors ON authors.id=articles.author_id ORDER BY timestamp DESC LIMIT 5;", {}, function(err, recentEntries) {

      recentEntries.forEach(function(e) {
        e.title = he.decode(e.title)
        e.excerpt = marked(he.decode(e.excerpt + "..."));
      });

      var html = Mustache.render(indexTemplate, {
        articles: recentEntries
      })
      console.log(recentEntries)
      res.send(html);

    }); //end db.all function
  }); //end readFile function
}); //end app.get function

//add new article FORM
app.get('/articles/new', function(req, res) {
  db.all("SELECT * FROM authors;", {}, function(err, authorArray) {
    fs.readFile('./views/new.html', 'utf8', function(err, newTemplate) {
      var html = Mustache.render(newTemplate, {
        authors: authorArray
      })
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
    db.all("SELECT title, author, timestamp, content, category, articles.id AS article_id, categories.id AS category_id FROM articles JOIN tags ON articles.id = article_id JOIN categories ON categories.id = category_id JOIN authors ON authors.id = author_id WHERE articles.id = " + articleID + ";", {}, function(err, articleData) {
      var categoryArray = []
      articleData.forEach(function(e) {
        var categoryObj = {
          "category": e.category,
          "category_id": e.category_id
        };
        categoryArray.push(categoryObj);
      });
      articleData[0].categories = categoryArray;
      console.log(articleData)
      articleData[0].content = marked(he.decode(articleData[0].content))
      articleData[0].title = he.decode(articleData[0].title)
      console.log(articleData[0].content)
      var html = Mustache.render(articleTemplate, articleData[0])
      res.send(html);
    }); //end db.all function
  }); //end readfile function
}); //end app.get function


//add new article to db - submitting to db & adding relations
app.post('/articles', function(req, res) {
  //set up all the variables, clean up
  var timestamp = moment().format('YYYY-MM-DD HH:mm:ss a');;
  var authorId = req.body.author;
  var newTitle = he.encode(req.body.title);
  var newContent = he.encode(req.body.content);
  var newCategories = req.body.categories.split(",");
  console.log(newCategories)
  var newCatTrimmed = []
  newCategories.forEach(function(e) {
    var trimmed = e.trim();
    newCatTrimmed.push(trimmed);
  }); //end forEach funkin

  //insert categories into catgories table

  newCatTrimmed.forEach(function(e) {
    if (e.replace(/ /g, "") !== "") {
      db.run("INSERT INTO categories (category) SELECT '" + e + "' WHERE NOT EXISTS (SELECT 1 FROM categories WHERE category='" + e + "');")
    } else {
      console.log("Empty category thing")
    }
  }); //end foreach

  //insert article info into article table
  db.run("INSERT INTO articles (author_id, title, timestamp, content) SELECT " + authorId + ",'" + newTitle + "','" + timestamp + "','" + newContent + "' WHERE NOT EXISTS (SELECT 1 FROM articles WHERE author_id =" + authorId + " AND title='" + newTitle + "' AND timestamp='" + timestamp + "' AND content='" + newContent + "');")

  //get IDs for all categories & get author id, send to tags table
  db.all("SELECT id FROM articles WHERE author_id='" + authorId + "' AND title='" + newTitle + "' AND timestamp ='" + timestamp + "' AND content='" + newContent + "';", {}, function(err, articleData) {
    //var parsedArt = JSON.parse(articleData);
    var articleID = articleData[0].id;
    newCatTrimmed.forEach(function(e) {
      db.all("SELECT id FROM categories WHERE category='" + e + "';", {}, function(err, category) {
        var categoryId = category[0].id;
        db.run("INSERT INTO tags (article_id, category_id) VALUES ('" + articleID + "','" + categoryId + "');")
      }); //end category ID get db.all function

    }); //end foreach
    res.redirect('/articles/' + articleID)
  }); //end db.all get article id function
}); //end app.post articles function


//edit article form
app.get('/articles/:id/edit', function(req, res) {
  var articleID = req.params.id;
  db.all("SELECT * FROM articles INNER JOIN tags ON tags.article_id = articles.id INNER JOIN categories ON tags.category_id = categories.id WHERE articles.id ='" + articleID + "';", {}, function(err, articleData) {
    var categoryArray = []
    articleData.forEach(function(e) {
      categoryArray.push(e.category);
    });
    articleData[0].catString = categoryArray.join(", ")

    fs.readFile('./views/edit.html', 'utf8', function(err, editTemplate) {
      var html = Mustache.render(editTemplate, articleData[0])
      res.send(html)

    }); //end readfile 
  }); //end db.all funkyshun
}); //end app.get function

//submit edited article formdata

app.put('/articles/:id', function(req, res) {
  //set up all the variables, clean up
  var articleID = req.params.id;
  var timestamp = moment().format('YYYY-MM-DD HH:mm:ss a');
  var newTitle = req.body.title;
  var newContent = req.body.content;
  var newCategories = req.body.categories.split(",");
  console.log("This is a length " + newCategories.length)
  if (newCategories.length > 0) {

    var newCatTrimmed = []
    newCategories.forEach(function(e) {
      var trimmed = e.trim();
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
  db.run("UPDATE articles SET title ='" + newTitle + "', timestamp='" + timestamp + "', content='" + newContent + "' WHERE id='" + articleID + "';");
  res.redirect('/articles/' + articleID);
});

//delete article
app.delete('/articles/:id', function(req, res) {
  var articleID = req.params.id;
  db.run("DELETE FROM articles WHERE id='" + articleID + "';");
  db.run("DELETE FROM tags WHERE article_id='" + articleID + "';");
  res.redirect('/');

}); //end delete callback

//see all by author
app.get('/authors/:id', function(req, res) {
  var authorId = req.params.id;
  fs.readFile('./views/authorpage.html', 'utf8', function(err, authorTemplate) {
    db.all("SELECT *, SUBSTR(content, 1, 200) AS excerpt, articles.id AS article_id FROM articles JOIN authors ON articles.author_id=authors.id WHERE author_id='" + authorId + "';", {}, function(err, articles) {

      articles.forEach(function(e) {
        e.excerpt = marked(he.decode(e.excerpt + "..."))
      });

      var toRender = {
        author: articles[0].author,
        email: articles[0].email,
        articleCount: articles.length,
        articles: articles
      }
      var html = Mustache.render(authorTemplate, toRender)
      res.send(html)
    });
  });

}); //end authors get callback

//see categories
app.get('/categories', function(req, res) {
  fs.readFile('./views/categories.html', 'utf8', function(err, categoryListTemplate) {
    db.all("SELECT * FROM categories;", {}, function(err, categories) {
      var html = Mustache.render(categoryListTemplate, {
        categories: categories
      });
      res.send(html);
    });
  });
});

//see all in particular category
app.get('/categories/:id', function(req, res) {
  var categoryId = req.params.id;
  fs.readFile('./views/categories_by_id.html', 'utf8', function(err, categoryListTemplate) {
    db.all("SELECT category, articles.id AS article_id, author_id, title, timestamp, SUBSTR(content,1,200) AS excerpt, categories.id AS category_id FROM categories INNER JOIN tags ON tags.category_id= categories.id INNER JOIN articles ON tags.article_id= articles.id WHERE categories.id=" + categoryId + ";", {}, function(err, articles) {
      if(articles[0] !== undefined){

      articles[0].articles = articles.map(function(e){
        return {article_id : e.article_id, title: e.title}
      });
      console.log(articles[0])
      var html = Mustache.render(categoryListTemplate, articles[0]);
      res.send(html);
    } else {
      res.send("SELECT category, articles.id AS article_id, author_id, title, timestamp, SUBSTR(content,1,200) AS excerpt, categories.id AS category_id FROM categories INNER JOIN tags ON tags.category_id= categories.id INNER JOIN articles ON tags.article_id= articles.id WHERE categories.id=" + categoryId + ";" + "<br><br>"+ articles + "<br><br>" + err)
    }
    });
  });
});

//search function



//app listen on 3000
app.listen(3000, function() {
  console.log("Server is alive and listening keenly on 3000")
});