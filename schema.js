var sqlite3 = require('sqlite3')
  //set db equal to my db file
var db = new sqlite3.Database('./wikidata.db', function(err, data){
  console.log("DB linked!!");
})
  //type schemas here in db.runs
db.serialize(function() {
  db.run("DROP TABLE IF EXISTS authors;")
  db.run("DROP TABLE IF EXISTS articles;")
  db.run("DROP TABLE IF EXISTS categories;")
  db.run("DROP TABLE IF EXISTS tags")
  db.run("DROP TABLE IF EXISTS changelog")
  db.run("CREATE TABLE authors (id INTEGER PRIMARY KEY, author VARCHAR(255), email VARCHAR(255));")
  db.run("CREATE TABLE articles (id INTEGER PRIMARY KEY, author_id INTEGER REFERENCES authors(id), title VARCHAR(255), timestamp DATE, content TEXT);")
  db.run("CREATE TABLE categories (id INTEGER PRIMARY KEY, category VARCHAR(255));")
  db.run("CREATE TABLE tags (article_id INTEGER REFERENCES articles(id), category_id INTEGER REFERENCES categories(id))")
  db.run("CREATE TABLE changelog (id INTEGER PRIMARY KEY, article_id INTEGER REFERENCES articles(id), author VARCHAR(255), title varchar(255), timestamp DATE, content TEXT);")
});