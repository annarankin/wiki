var sqlite3 = require('sqlite3')
  //set db equal to my db file
var db = new sqlite3.Database('./wikidata.db')
  //insert data in db.runs

//authors : id INTEGER PRIMARY KEY, author VARCHAR(255), email VARCHAR(255)

db.run("INSERT INTO authors (author, email) VALUES ('AnnieB','anna@annarankin.com')")
db.run("INSERT INTO authors (author, email) VALUES ('Squeedle','anniesqueedle@gmail.com')")
db.run("INSERT INTO authors (author, email) VALUES ('Woof','annanotabanana@gmail.com')")

//articles : id INTEGER PRIMARY KEY, author_id INTEGER REFERENCES authors(id), title VARCHAR(255), timestamp DATE, content TEXT
//timestamp format: '2013-02-08 09:30'


db.run("INSERT INTO articles (author_id, title, timestamp, content) VALUES (1, 'How to Paint By Numbers', '2015-04-16 13:47', 'Bacon ipsum dolor sit amet tenderloin salami pig, fatback pastrami ham hock shoulder bacon t-bone pork meatball. Pancetta ham turkey shankle turducken jerky. Jowl spare ribs short ribs andouille tongue shoulder. Rump shoulder cow turducken, salami filet mignon ham sausage pancetta pork prosciutto brisket short ribs boudin. Shoulder short ribs andouille swine venison ham hock.');");
db.run("INSERT INTO articles (author_id, title, timestamp, content) VALUES (1, 'Clicks-And-Mortar Solutions', '2015-04-16 14:00', 'Collaboratively administrate empowered markets via plug-and-play networks. Dynamically procrastinate B2C users after installed base benefits. Dramatically visualize customer directed convergence without revolutionary ROI. Efficiently unleash cross-media information without cross-media value. Quickly maximize timely deliverables for real-time schemas. Dramatically maintain clicks-and-mortar solutions without functional solutions.');");

//categories : id INTEGER PRIMARY KEY, category VARCHAR(255)

db.run("INSERT INTO categories (category) VALUES ('painting');")
db.run("INSERT INTO categories (category) VALUES ('biz');")
db.run("INSERT INTO categories (category) VALUES ('blibberish');")

//tags : article_id INTEGER REFERENCES articles(id), category_id INTEGER REFERENCES categories(id)

db.run("INSERT INTO tags (article_id, category_id) VALUES (1,1)")
db.run("INSERT INTO tags (article_id, category_id) VALUES (1,3)")
db.run("INSERT INTO tags (article_id, category_id) VALUES (2,2)")
db.run("INSERT INTO tags (article_id, category_id) VALUES (2,3)")




