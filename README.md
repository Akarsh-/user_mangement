# user_mangement
to start project do following on cmd prompt
1)  npm install
2) node index.js

this will start server

there are 2 files event.sh user.sh they can be used to add events and users to db

Always add users first like
./user.sh pathtouser.csv
Add events like 
./event.sh pathtoevent.csv

There are 3 tables in db
users (conatins user name, phone, email) pk name,
events (conatains event tittle, start_time, end_time, desc, allday),
event_users (contains user to event mapping with response)

they will be filled accordingly
