# user_event_mangement

DB setup
I used MySQL, DB configs can be changed from utils/rds file
I created DB with name user_events
I created 3 tables (check queries.sql)

to start node service do following on cmd prompt

1.  npm install
2.  node index.js

this will start server at port 4344

there are 2 files event.sh user.sh they can be used to add events and users to db

Always add users first like
./user.sh pathtouser.csv
Add events like
./event.sh pathtoevent.csv

After setting up data for step 2 I have made two more POST APIS
http://localhost:4344/user_availability (startTime, endTime, username as json body)
http://localhost:4344/events(startTime, endTime, as json body)

sample postman apis file are also attached
