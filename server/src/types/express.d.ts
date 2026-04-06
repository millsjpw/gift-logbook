declare global {
  namespace Express {
    interface Request {
      auth?: AuthContext;
    }
  }
}

interface AuthContext {
    userId: string;
    roles?: string[];
    sessionId?: string;
}
export {};