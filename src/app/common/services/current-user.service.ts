import { computed, inject, Service } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { UserApiService } from '@common/services/user-api.service';

/**
 * The logged-in user, shared by the pages behind the login. Provided by `AppShell`, so every login loads it afresh.
 */
@Service({ autoProvided: false })
export class CurrentUserService {
  #userApi = inject(UserApiService);

  #resource = rxResource({ stream: () => this.#userApi.get() });

  readonly user = computed(() => (this.#resource.hasValue() ? this.#resource.value() : null));

  reload(): void {
    this.#resource.reload();
  }
}
