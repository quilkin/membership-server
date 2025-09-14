# Membership server

Server-side code to run Truro Cycling Club's RideHub facility.
See [Membership](https://github.com/quilkin/membership) for the client code.

# Development

Developed using Visual Studio Code, Node.js, express and mysql
To compile Typescript to Javascript: 
```sh
tsc
```
To run on development machine:
```sh
 node dist\app.js  
```
This service was developed later than the Ridehub service and is currently run separately as two node.js services on the same machine.
## ToDo:
Combine this service with the [Ridehub Server](https://github.com/quilkin/ridehub-server) to reduce server requirements

## Database

MySql used for data storage. The same database is used for both Membership and the [Ridehub Server](https://github.com/quilkin/ridehub-server) facility. 
SQL database creation code can be found in file 'mysql.sql'