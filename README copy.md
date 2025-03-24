# DunderTasks API

DunderTasks is the ultimate task management API, designed for the employees of
*Dunder Mifflin*. Whether you're Michael planning a party, Dwight managing
beets, or Jim setting up pranks, DunderTasks has you covered.

## Features

Currently, the app has the following features implemented:

- **User Management**  
  - Create a user (`POST /users`)
  - Find users (`GET /users`)
  - Find a user (`GET /users/:id`)
  - Promote a user (`PATCH /users/:id/promote`)
  - Demote a user (`PATCH /users/:id/demote`)
  - Activate a user (`PATCH /users/:id/activate`)
  - Deactivate a user (`PATCH /users/:id/deactivate`)
  - Login a user (`POST /login`)
- **Task Management**  
  - Create a task (`POST /tasks`)
  - Find tasks (`GET /tasks`)
  - Find a task (`GET /tasks/:id`)
  - Share a task (`POST /tasks/:id/share`)
  - Prioritize a task (`PATCH /tasks/:id/prioritize`)
  - Mark a task as complete (`PATCH /tasks/:id/complete`)

## Development

The project uses [tsx](https://tsx.is/) to run TypeScript. All the necessary
npm scripts are in package.json, but feel free to add any other if needed.
To interact with Knex, use `npm run knex` instead of using `npx knex` because
of the usage of the `tsx` library.

### Setup

To setup the project, first run the Docker container:
```sh
docker compose up
```

Then, install the dependencies:
```sh
npm install
```

Then, create the development database, migrate it and seed it:
```sh
npm run dev:db:create && npm run dev:db:migrate && npm run dev:db:seed
```

Then run the web app:
```sh
npm run dev
```

Then visit the [API documentation](http://localhost:3000/docs).

### Testing

First, setup the test database:

```sh
npm run test:db:create && npm run test:db:migrate
```

Then run the tests:

```sh
npm test
```

---
"Somehow I Manage" your tasks, so you don’t have to.

![Somehow I Manage](cover.jpg)
