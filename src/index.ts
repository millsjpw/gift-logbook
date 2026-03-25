import express from 'express';
import { config } from './config.js';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { middlewareErrorHandler, middlewareLogResponses, middlewareRequireAuth } from './api/middleware.js';
import * as usersApi from './api/users.js';
import * as authApi from './api/auth.js';
import * as personsApi from './api/persons.js';
import * as listsApi from './api/lists.js';

const migrationClient = postgres(config.db.url, { max: 1, onnotice: () => {} });
await migrate(drizzle(migrationClient), config.db.migrationConfig);

const app = express();

app.use(express.json());
app.use(middlewareLogResponses);

app.get('/health', (_, res) => {
    res.send('OK');
});

// Auth API
app.post('/auth/login', authApi.handleLogin);
app.post('/auth/refresh', authApi.handleRefreshToken);
app.post('/auth/logout', authApi.handleLogout);

// Users API
app.post('/users', usersApi.handleCreateUser);
app.get('/users/:id', middlewareRequireAuth, usersApi.handleGetUser);
app.put('/users/:id', middlewareRequireAuth, usersApi.handleUpdateUser);
app.delete('/users/:id', middlewareRequireAuth, usersApi.handleDeleteUser);

// Persons API
app.post('/persons', middlewareRequireAuth, personsApi.handleCreatePerson);
app.get('/persons/search', middlewareRequireAuth, personsApi.handleSearchPeopleByName);
app.get('/persons/:id', middlewareRequireAuth, personsApi.handleGetPerson);
app.put('/persons/:id', middlewareRequireAuth, personsApi.handleUpdatePerson);
app.get('/persons', middlewareRequireAuth, personsApi.handleGetPeopleCreatedByUser);
app.delete('/persons/:id', middlewareRequireAuth, personsApi.handleDeletePerson);
app.delete('/persons', middlewareRequireAuth, personsApi.handleDeletePeopleCreatedByUser);

// Lists API
app.post('/lists', middlewareRequireAuth, listsApi.handleCreateList);
app.get('/lists/search', middlewareRequireAuth, listsApi.handleGetListsByName);
app.get('/lists/person/:personId', middlewareRequireAuth, listsApi.handleGetListsByPersonId);
app.get('/lists/:id', middlewareRequireAuth, listsApi.handleGetListById);
app.put('/lists/:id', middlewareRequireAuth, listsApi.handleUpdateList);
app.get('/lists', middlewareRequireAuth, listsApi.handleGetListsByUserId);
app.delete('/lists/:id', middlewareRequireAuth, listsApi.handleDeleteList);
app.delete('/lists/:listId/items/:itemId', middlewareRequireAuth, listsApi.handleDeleteItemFromList);

app.use(middlewareErrorHandler);

app.listen(config.api.port, () => {
    console.log(`Server is running on port ${config.api.port}`);
});