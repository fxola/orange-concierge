export type ActorRole = 'admin' | 'consultant' | 'reviewer';

export type Actor = Readonly<{
  id: string;
  role: ActorRole;
}>;
