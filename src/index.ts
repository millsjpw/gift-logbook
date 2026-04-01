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
import * as recordsApi from './api/records.js';
import * as tagsApi from './api/tags.js';

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

// Records API
app.post('/records', middlewareRequireAuth, recordsApi.handleAddRecord);
app.get('/records/search', middlewareRequireAuth, recordsApi.handleGetRecordsByItemText);
app.get('/records', middlewareRequireAuth, recordsApi.handleGetRecordsByUserId);
app.get('/records/person/:personId', middlewareRequireAuth, recordsApi.handleGetRecordsByPersonId);
app.get('/records/:id', middlewareRequireAuth, recordsApi.handleGetRecordById);
app.put('/records/:id', middlewareRequireAuth, recordsApi.handleUpdateRecord);
app.post('/records/:id/tags', middlewareRequireAuth, recordsApi.handleAddTagToRecord);
app.get('/records/:id/tags', middlewareRequireAuth, recordsApi.handleGetTagsForRecord);
app.delete('/records/:id', middlewareRequireAuth, recordsApi.handleDeleteRecord);
app.delete('/records', middlewareRequireAuth, recordsApi.handleDeleteRecordsByUserId);
app.delete('/records/person/:personId', middlewareRequireAuth, recordsApi.handleDeleteRecordsByPersonId);
app.delete('/records/:id/tags/:tag', middlewareRequireAuth, recordsApi.handleRemoveTagFromRecord);

// Tags API
app.post('/tags', middlewareRequireAuth, tagsApi.handleCreateTag);
app.get('/tags', middlewareRequireAuth, tagsApi.handleGetTagsByUserId);
app.get('/tags/:id', middlewareRequireAuth, tagsApi.handleGetTagById);
app.put('/tags/:id', middlewareRequireAuth, tagsApi.handleUpdateTag);
app.delete('/tags/:id', middlewareRequireAuth, tagsApi.handleDeleteTag);

app.use(middlewareErrorHandler);

app.listen(config.api.port, () => {
    console.log(`Server is running on port ${config.api.port}`);
});