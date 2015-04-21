#Punderful
_Punderful is an wiki for images, information and terrible puns._

**[Check it out here!](http://45.55.146.194:3000/)**

##Features

###User-created Content
  - Users can add articles to the wiki by entering a title, content and optionally adding categories. Once they click submit, they're taken directly to their new article.
  - Markdown formatting is supported, so users can embed images and format their articles as they like.
  - Each article can be viewed individually. A list of the 5 most recent articles is displayed on the main page of the application.
  - Users can view a list of every article in the database by clicking a sidebar link.

###Editing
  - The body and title of all articles are editable by the original author and other users. The editor of the article has the option to enter their name to be credited for the edit, or they can choose to remain anonymous. Users may also tag any article with a new category using the same form.
  - On any change to an article, the original author is updated and informed of the edits.
  - If a user is unhappy with an edit, a timestamped changelog with the option to restore previous versions of the article is available on each article's "edit" page.

###Searching and Categorization
  - At the top of every page, the user can input a search term that will return a list of results for a string within any article's title or category tags.
  - If a search term brings no matches, the user is informed and directed to view all articles.
  - Each category can be viewed in a master list of categories, or users can access a list of all articles tagged with that category.

###Author Information
  - An author page is generated for each user who creates a new article. This page contains a link to send an email to the author as well as a list of all the articles they've submitted!
  - On creating a new article, users can select their username from a drop-down list before they submit their entry.

##Libraries & APIs

###morgan (v 1.5.2)
This module provides a log of all the HTTP requests sent to your server along with the error/success code - super helpful!

###sqlite3 (v 3.0.5)
The sqlite node module allows a JavaScript application to send SQL queries and instructions directly to a database.

###express (v 4.12.3)
This module allows us to easily set up an HTTP server using node - it abstracts away a lot of the complexity of node's native HTTP features.

###method-override (v 2.3.2)
Requiring method-override allows our server to accept and interpret PUT and DELETE requests as distinct from POST requests.

###body-parser (v 1.12.3)
Allows express to parse the body of post and put requests in HTTP requests.

###he (v 0.5.0)
This module encodes special characters in strings as HTML entities. It's used in this application to encode and decode problematic characters within user input (think ', %, &, etc.) that might cause errors when submitted to a SQL database.

###marked (v 0.3.3)
Takes text that's been formatted in markdown and interprets it as HTML - also works in reverse!

###moment (v 2.10.2)
Very powerful tool for parsing, validating, and formatting dates in node. Used in this application to generate timestamps in a format that's readable by humans AND machines - without the whole "human error" thing.

###mustache (v 2.0.0)
Mustache is a tool for rendering key-value pairs into a template designed by {{your_name_here}}!

###sendgrid (v 1.6.1)
The sendgrid module is a tool provided by [SendGrid](https://sendgrid.com/), a transactional email service. The module allows the application to send an email programmatically - for example, whenever a change to an article the user has created changes.

##Wireframe

![Alt text](wireframe.png)

##ERD

![Alt text](erd.jpg)

####Additional table added:

|id|article_id|author|title|timestamp|content|
|-|
|INTEGER PRIMARY KEY|INTEGER REFERENCES articles(id)|VARCHAR(255)|VARCHAR(255)|DATE|TEXT|

This table stores a record of all changes to all articles and saves a backup.

##Installation & Setup

If you'd like to set this application up and run it on localhost, follow the instructions below:

1. Make a directory on your computer **outside of any existing git repository**. Name it whatever you'd like!

2. Navigate inside that directory and run `git init`.

3. Clone this repository to your machine by running `git clone https://github.com/annarankin/wiki.git`.

4. You'll need a SendGrid username and password - replace the variables in `var sendgrid = require('sendgrid')('YOUR USERNAME', 'YOUR API KEY');` in **app.js** with your own credentials.

5. Run `npm install .` to install all node modules.

6. Run `node schema.js` to set up your database.

7. Run `node seed.js` to seed your database.

8. Run `node app.js` - **you're good to go!**


##Feature backlog/to-do list:
  - Ability to delete tags from an article on an individual basis.
  - More prettily formatted display dates on article pages.
  - Adding error messages to Mustache templates that display conditionally:
    - On the search page when a term is not found
    - On author page when an author has no articles attributed to them
    - When an article has no tags.
