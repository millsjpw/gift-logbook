import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { config } from "./config/runtime.js";
import {
  middlewareErrorHandler,
  middlewareLogResponses,
  middlewareRequireAuth,
} from "./api/middleware.js";
import * as usersApi from "./api/users.js";
import * as authApi from "./api/auth.js";
import * as personsApi from "./api/persons.js";
import * as listsApi from "./api/lists.js";
import * as recordsApi from "./api/records.js";
import * as tagsApi from "./api/tags.js";
import * as exchangesApi from "./api/exchanges.js";
import * as logbooksApi from "./api/logbooks.js";

const allowedOrigins = (process.env.CORS_ORIGINS ?? "").split(",");

const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      const isVercelPreview = origin.endsWith(".vercel.app");

      if (allowedOrigins.includes(origin) || isVercelPreview) {
        return callback(null, true);
      }

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());
app.use(middlewareLogResponses);

app.get("/health", (_, res) => {
  res.send("OK");
});

// Serve OpenAPI spec and Redoc UI
app.get("/openapi.json", (_, res) => {
  res.sendFile(path.join(process.cwd(), "openapi.json"));
});

app.get("/docs", (_, res) => {
  res.type("html").send(`
    <!DOCTYPE html>
    <html>
        <head>
            <meta charset="utf-8" />
            <title>Gift Logbook API Docs</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body>
            <redoc spec-url="/openapi.json"></redoc>
            <script src="https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js"></script>
        </body>
    </html>`);
});

// Auth API
app.post("/auth/login", authApi.handleLogin);
app.get("/auth/me", authApi.handleMe);
app.post("/auth/logout", authApi.handleLogout);

// Users API
app.post("/users", usersApi.handleCreateUser);
app.get("/users/:id", middlewareRequireAuth, usersApi.handleGetUser);
app.put("/users/:id", middlewareRequireAuth, usersApi.handleUpdateUser);
app.delete("/users/:id", middlewareRequireAuth, usersApi.handleDeleteUser);

// Logbooks API
app.post("/logbooks", middlewareRequireAuth, logbooksApi.handleCreateLogbook);
app.get(
  "/logbooks",
  middlewareRequireAuth,
  logbooksApi.handleGetLogbooksForUser,
);
app.get(
  "/logbooks/:id",
  middlewareRequireAuth,
  logbooksApi.handleGetLogbookById,
);
app.put(
  "/logbooks/:id",
  middlewareRequireAuth,
  logbooksApi.handleUpdateLogbook,
);
app.post(
  "/logbooks/:id/members",
  middlewareRequireAuth,
  logbooksApi.handleAddLogbookMember,
);
app.get(
  "/logbooks/:id/members",
  middlewareRequireAuth,
  logbooksApi.handleGetLogbookMembers,
);
app.delete(
  "/logbooks/:id/members/:userId",
  middlewareRequireAuth,
  logbooksApi.handleRemoveLogbookMember,
);

// Persons API
// Logbook-scoped: listing/creating/searching/bulk-deleting persons all
// happen within one logbook. Single-person routes stay flat (below) since a
// person id is already globally unique and the service resolves access via
// the person's own logbook membership.
app.post(
  "/logbooks/:logbookId/persons",
  middlewareRequireAuth,
  personsApi.handleCreatePerson,
);
app.get(
  "/logbooks/:logbookId/persons/search",
  middlewareRequireAuth,
  personsApi.handleSearchPeopleByName,
);
app.get(
  "/logbooks/:logbookId/persons",
  middlewareRequireAuth,
  personsApi.handleGetPeopleInLogbook,
);
app.delete(
  "/logbooks/:logbookId/persons",
  middlewareRequireAuth,
  personsApi.handleDeletePeopleInLogbook,
);

app.get(
  "/persons/accessible",
  middlewareRequireAuth,
  personsApi.handleGetPersonsAccessible,
);
app.get(
  "/persons/accessible/upcoming-birthdays",
  middlewareRequireAuth,
  personsApi.handleGetUpcomingBirthdays,
);
app.get("/persons/:id", middlewareRequireAuth, personsApi.handleGetPerson);
app.put("/persons/:id", middlewareRequireAuth, personsApi.handleUpdatePerson);
app.get(
  "/persons/:id/exclusions",
  middlewareRequireAuth,
  personsApi.handleGetExclusions,
);
app.put(
  "/persons/:id/exclusions",
  middlewareRequireAuth,
  personsApi.handleSetExclusions,
);
app.delete(
  "/persons/:id",
  middlewareRequireAuth,
  personsApi.handleDeletePerson,
);

// Lists API
app.post("/lists", middlewareRequireAuth, listsApi.handleCreateList);
app.get("/lists/search", middlewareRequireAuth, listsApi.handleGetListsByName);
app.get("/lists/recent", middlewareRequireAuth, listsApi.handleGetRecentLists);
app.get(
  "/lists/shared-with-me",
  middlewareRequireAuth,
  listsApi.handleGetListsSharedWithMe,
);
app.get(
  "/lists/person/:personId",
  middlewareRequireAuth,
  listsApi.handleGetListsByPersonId,
);
app.get("/lists/:id", middlewareRequireAuth, listsApi.handleGetListById);
app.put("/lists/:id", middlewareRequireAuth, listsApi.handleUpdateList);
app.get("/lists", middlewareRequireAuth, listsApi.handleGetListsByUserId);
app.delete("/lists/:id", middlewareRequireAuth, listsApi.handleDeleteList);
app.delete(
  "/lists/:listId/items/:itemId",
  middlewareRequireAuth,
  listsApi.handleDeleteItemFromList,
);
app.post(
  "/lists/:listId/items/:itemId/tags",
  middlewareRequireAuth,
  listsApi.handleAddTagToListItem,
);
app.delete(
  "/lists/:listId/items/:itemId/tags/:tagId",
  middlewareRequireAuth,
  listsApi.handleRemoveTagFromListItem,
);
app.post("/lists/:id/shares", middlewareRequireAuth, listsApi.handleShareList);
app.get(
  "/lists/:id/shares",
  middlewareRequireAuth,
  listsApi.handleGetSharesForList,
);
app.delete(
  "/lists/:id/shares/:userId",
  middlewareRequireAuth,
  listsApi.handleUnshareList,
);

// Records API
// Logbook-scoped, same shape as Persons above.
app.post(
  "/logbooks/:logbookId/records",
  middlewareRequireAuth,
  recordsApi.handleAddRecord,
);
app.get(
  "/logbooks/:logbookId/records/search",
  middlewareRequireAuth,
  recordsApi.handleGetRecordsByItemText,
);
app.get(
  "/logbooks/:logbookId/records/person/:personId",
  middlewareRequireAuth,
  recordsApi.handleGetRecordsByPersonId,
);
app.get(
  "/logbooks/:logbookId/records",
  middlewareRequireAuth,
  recordsApi.handleGetRecordsByLogbook,
);
app.delete(
  "/logbooks/:logbookId/records/person/:personId",
  middlewareRequireAuth,
  recordsApi.handleDeleteRecordsByPersonId,
);
app.delete(
  "/logbooks/:logbookId/records",
  middlewareRequireAuth,
  recordsApi.handleDeleteRecordsByLogbook,
);

app.get("/records/:id", middlewareRequireAuth, recordsApi.handleGetRecordById);
app.put("/records/:id", middlewareRequireAuth, recordsApi.handleUpdateRecord);
app.post(
  "/records/:id/tags",
  middlewareRequireAuth,
  recordsApi.handleAddTagToRecord,
);
app.get(
  "/records/:id/tags",
  middlewareRequireAuth,
  recordsApi.handleGetTagsForRecord,
);
app.delete(
  "/records/:id",
  middlewareRequireAuth,
  recordsApi.handleDeleteRecord,
);
app.delete(
  "/records/:id/tags/:tag",
  middlewareRequireAuth,
  recordsApi.handleRemoveTagFromRecord,
);

// Tags API
app.post("/tags", middlewareRequireAuth, tagsApi.handleCreateTag);
app.get("/tags", middlewareRequireAuth, tagsApi.handleGetTagsByUserId);
app.get("/tags/:id", middlewareRequireAuth, tagsApi.handleGetTagById);
app.put("/tags/:id", middlewareRequireAuth, tagsApi.handleUpdateTag);
app.delete("/tags/:id", middlewareRequireAuth, tagsApi.handleDeleteTag);

// Exchanges API
app.post(
  "/exchanges",
  middlewareRequireAuth,
  exchangesApi.handleCreateExchange,
);
app.get(
  "/exchanges",
  middlewareRequireAuth,
  exchangesApi.handleGetAllUserExchanges,
);
app.get(
  "/exchanges/:id",
  middlewareRequireAuth,
  exchangesApi.handleGetFullExchange,
);
app.put(
  "/exchanges/:id",
  middlewareRequireAuth,
  exchangesApi.handleUpdateExchange,
);
app.delete(
  "/exchanges/:id",
  middlewareRequireAuth,
  exchangesApi.handleDeleteExchange,
);
app.post(
  "/exchanges/:id/participants",
  middlewareRequireAuth,
  exchangesApi.handleAddParticipant,
);
app.put(
  "/exchanges/:id/participants",
  middlewareRequireAuth,
  exchangesApi.handleReplaceParticipants,
);
app.delete(
  "/exchanges/:id/participants/:personId",
  middlewareRequireAuth,
  exchangesApi.handleRemoveParticipant,
);
app.get(
  "/exchanges/:id/generate",
  middlewareRequireAuth,
  exchangesApi.handleGenerateAssignments,
);
app.post(
  "/exchanges/:id/clone",
  middlewareRequireAuth,
  exchangesApi.handleCloneExchange,
);
app.post(
  "/exchanges/:id/assignments",
  middlewareRequireAuth,
  exchangesApi.handleSaveAssignments,
);

app.use(middlewareErrorHandler);

app.listen(config.api.port, () => {
  console.log(`Server is running on port ${config.api.port}`);
});
