import 'server-only';
import { randomUUID } from 'node:crypto';
import { SubmitInteraction, type Actor, type ActorRole } from '@orange-concierge/core';
import {
  createInfrastructure,
  type InfrastructureComposition,
} from '@orange-concierge/infrastructure';
import { createAppConfigFromEnvironment, type AppConfig } from './config';

export type AuthenticatedUser = Readonly<{
  id: string;
  role: ActorRole;
}>;

export type Application = Readonly<{
  submitInteraction: SubmitInteraction;
  toActor: (user: AuthenticatedUser) => Actor;
}>;

export const toActor = (user: AuthenticatedUser): Actor => ({
  id: user.id,
  role: user.role,
});

declare global {
  var __appRuntime: CompositionRoot | undefined;
}

export class CompositionRoot {
  private readonly config: AppConfig;
  private readonly infrastructure: InfrastructureComposition;
  private application: Application | undefined;

  private constructor(config: AppConfig) {
    this.config = config;
    this.infrastructure = this.createInfrastructure();
  }

  static createCompositionRoot(config: AppConfig): CompositionRoot {
    // Cached on globalThis so Next dev/HMR does not create duplicate DB pools.
    // In production this is just a per-process singleton.
    const existingRoot = globalThis.__appRuntime;
    if (existingRoot) {
      return existingRoot;
    }

    const root = new CompositionRoot(config);
    globalThis.__appRuntime = root;
    return root;
  }

  private createInfrastructure(): InfrastructureComposition {
    const { databaseUrl, baseUrl, authSecret, trustedOrigins } = this.config;

    return createInfrastructure({ databaseUrl, baseUrl, authSecret, trustedOrigins });
  }

  /**
   * All business use cases are wired here
   */
  private createApplication(): Application {
    const submitInteraction = new SubmitInteraction({
      submittedInteractionRecorder: this.infrastructure.submittedInteractionRecorder,
      newInteractionId: randomUUID,
      now: () => new Date(),
    });

    return {
      submitInteraction,
      toActor,
    };
  }

  getAuth(): InfrastructureComposition['auth'] {
    return this.infrastructure.auth;
  }

  getApplication(): Application {
    if (this.application) {
      return this.application;
    }

    this.application = this.createApplication();
    return this.application;
  }
}

const getCompositionRoot = (): CompositionRoot => {
  return CompositionRoot.createCompositionRoot(createAppConfigFromEnvironment());
};

export const getAuth = (): InfrastructureComposition['auth'] => {
  return getCompositionRoot().getAuth();
};

export const getApplication = (): Application => {
  return getCompositionRoot().getApplication();
};

export type AppAuth = ReturnType<typeof getAuth>;
