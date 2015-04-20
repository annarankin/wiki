var sqlite3 = require('sqlite3')
  //set db equal to my db file
var db = new sqlite3.Database('./wikidata.db', function(err, data) {
  console.log("DB linked!!");
})
db.run("INSERT INTO authors (author, email) VALUES ('Anna', 'EMAIL@ADDRESS.COM');")
db.run("INSERT INTO authors (author, email) VALUES ('Banana', 'EMAIL@ADDRESS.COM');")
db.run("INSERT INTO authors (author, email) VALUES ('Fofanna', 'EMAIL@ADDRESS.COM');")

db.run("INSERT INTO articles (author_id, title, timestamp, content) VALUES (1, 'THINGS', '2014-05-09', 'LDGLFLJDHFDJLSFGDLSFGLSJDFGLDKFGLDSFGLDSFGLISUDFGLSIDFGLIDKSJGFLKJDSBFLKSDJFSDGKG');")
db.run("INSERT INTO articles (author_id, title, timestamp, content) VALUES (2, 'STUFF', '2014-05-09', 'LDGLFLJDHFDJLSFGDLSFGLSJDFGLDKFGLDSFGLDSFGLISUDFGLSIDFGLIDKSJGFLKJDSBFLKSDJFSDGKG');")
db.run("INSERT INTO articles (author_id, title, timestamp, content) VALUES (1, 'UGH', '2014-05-09', 'LDGLFLJDHFDJLSFGDLSFGLSJDFGLDKFGLDSFGLDSFGLISUDFGLSIDFGLIDKSJGFLKJDSBFLKSDJFSDGKG');")

db.run("INSERT INTO categories (category) VALUES ('apples');")
db.run("INSERT INTO categories (category) VALUES ('oranges');")
db.run("INSERT INTO categories (category) VALUES ('bananas');")

db.run("INSERT INTO tags (article_id, category_id) VALUES (1,3);")
db.run("INSERT INTO tags (article_id, category_id) VALUES (1,2);")
db.run("INSERT INTO tags (article_id, category_id) VALUES (2,1);")
db.run("INSERT INTO tags (article_id, category_id) VALUES (2,2);")
db.run("INSERT INTO tags (article_id, category_id) VALUES (3,3);")

db.run("INSERT INTO changelog (article_id, author, title, timestamp, content) VALUES (1, 'ME', 'THINGS', '2014-05-09', 'LDGLFLJDHFDJLSFGDLSFGLSJDFGLDKFGLDSFGLDSFGLISUDFGLSIDFGLIDKSJGFLKJDSBFLKSDJFSDGKG');")
db.run("INSERT INTO changelog (article_id, author, title, timestamp, content) VALUES (2, 'ME', 'STUFF', '2014-05-09', 'LDGLFLJDHFDJLSFGDLSFGLSJDFGLDKFGLDSFGLDSFGLISUDFGLSIDFGLIDKSJGFLKJDSBFLKSDJFSDGKG');")
db.run("INSERT INTO changelog (article_id, author, title, timestamp, content) VALUES (2, 'ME', 'UGH', '2014-05-09', 'LDGLFLJDHFDJLSFGDLSFGLSJDFGLDKFGLDSFGLDSFGLISUDFGLSIDFGLIDKSJGFLKJDSBFLKSDJFSDGKG');")