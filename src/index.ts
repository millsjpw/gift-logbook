import express from 'express';
import { config } from './config.js';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { middlewareErrorHandler, middlewareLogResponses, middlewareRequireAuth } from './api/middleware.js';
import * as usersApi from './api/users.js';
import * as authApi from './api/auth.js';
import * as personsApi from './api/persons.js';

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
app.get('/persons/:id', middlewareRequireAuth, personsApi.handleGetPerson);
app.put('/persons/:id', middlewareRequireAuth, personsApi.handleUpdatePerson);
app.delete('/persons/:id', middlewareRequireAuth, personsApi.handleDeletePerson);
app.get('/persons', middlewareRequireAuth, personsApi.handleGetPeopleCreatedByUser);
app.get('/persons/search', middlewareRequireAuth, personsApi.handleSearchPeopleByName);
app.delete('/persons', middlewareRequireAuth, personsApi.handleDeletePeopleCreatedByUser);

app.use(middlewareErrorHandler);

app.listen(config.api.port, () => {
    console.log(`Server is running on port ${config.api.port}`);
});