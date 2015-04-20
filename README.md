#Punderful
Punderful is an online wiki for images, information and terrible puns!

[Check out this project on Digital Ocean!](http://45.55.146.194:3000/)

##Features

##Libraries & APIs

###morgan (v 1.5.2)
  - This module provides a log of all the HTTP requests sent to your server along with the error/success code - super duper helpful!
###sqlite3 (v 3.0.5)
  - The sqlite node module allows a JavaScript application to send SQL queries and instructions directly to a database.
###express (v 4.12.3)
  - This module allows us to easily set up an HTTP server using node - it abstracts away a lot of the complexity of node's native HTTP features.
###method-override (v 2.3.2)
  - Requiring method-override allows our server to accept and interpret PUT and DELETE requests as distinct from POST requests.
###body-parser (v 1.12.3)
  - Allows express to parse the body of post and put requests in HTTP requests.
###he (v 0.5.0)
  - This module encodes special characters in strings as HTML entities. It's used in this application to encode and decode problematic characters within user input (think ', %, &, etc.) that might cause errors when submitted to a SQL database.
###marked (v 0.3.3)
  - Takes text that's been formatted in markdown and interprets it as HTML - also works in reverse!
###moment (v 2.10.2)
  - Very powerful tool for parsing, validating, and formatting dates in node. Used in this application to generate timestamps in a format that's readable by humans AND machines - without the whole "human error" thing.
###mustache (v 2.0.0)
  -
###sendgrid (v 1.6.1)

##Feature backlog/to-do list:
  - Ability to delete tags from an article on an individual basis.
  - More prettily formatted display dates on article pages.
  - Adding error messages to Mustache templates that display conditionally
