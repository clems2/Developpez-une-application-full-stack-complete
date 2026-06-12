---
name: angular-jest-test-generator
description: Generate Jest unit and integration tests for Angular 19+ projects with standalone components. Use when the user asks to write tests for an Angular service, guard, interceptor, or component, or to set up a test coverage strategy. Covers HTTP testing, standalone components, ActivatedRoute mocking, Angular Material mocking quirks (MatSnackBar useClass pattern), and OnPush change detection. Produces tests that target ~80% coverage on statements, branches, lines, and functions as a generation ambition, while the CI gate (coverageThreshold) is configured at 70%, with at least 30% integration tests.
---

# Angular + Jest Test Generator

## When to use this skill

Use this skill whenever:
- The user wants to **write tests** for an Angular service, guard, interceptor, or component
- The user wants to **set up Jest** in an Angular project
- The user mentions **coverage thresholds** (CI gate 70%, generation target ~80% statements/branches/lines/functions)
- The user asks about **testing standalone components**
- The user is **stuck on a testing issue** (mocks not applied, async pipe, MatSnackBar, etc.)

## Core principles

### 1. Test categorization is by injection, not file location

| Type | How to spot it | Tool |
|---|---|---|
| **Unit** | Service/guard/interceptor — instantiate directly or with TestBed but no template render | `TestBed.inject` |
| **Integration** | Component — uses `TestBed.createComponent`, renders template, queries DOM | `fixture.debugElement` + `By.css` |

Aim for at least 30% integration tests (typical Angular projects exceed this naturally).

### 2. Modern Angular APIs only

| Deprecated | Use instead |
|---|---|
| `HttpClientTestingModule` | `provideHttpClient()` + `provideHttpClientTesting()` |
| `RouterTestingModule` | `provideRouter([])` |
| `declarations: [StandaloneComponent]` | `imports: [StandaloneComponent]` |

### 3. The standard sequence for components with async pipe

```
1. fixture.detectChanges()         → triggers async pipe subscription → HTTP request fires
2. httpMock.expectOne(url)         → intercept
3. req.flush(mockData)             → simulate response
4. await fixture.whenStable()      → let microtasks settle
5. fixture.detectChanges()         → re-render with new data
```

Skipping step 5 leaves the DOM empty even though `component.data` has the value.

---

## Templates

### Service with HTTP

```typescript
import { expect } from '@jest/globals';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { MyService } from './my.service';

describe('MyService', () => {
  let service: MyService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        MyService
      ]
    });
    service = TestBed.inject(MyService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should GET data', () => {
    const mockData = { id: 1, name: 'test' };

    service.getData().subscribe(data => {
      expect(data).toEqual(mockData);
    });

    const req = httpMock.expectOne('api/data');
    expect(req.request.method).toBe('GET');
    req.flush(mockData);
  });

  it('should POST data', () => {
    const payload = { name: 'new' };

    service.create(payload).subscribe();

    const req = httpMock.expectOne('api/data');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(null); // null for void endpoints
  });
});
```

### Guard

```typescript
import { expect } from '@jest/globals';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MyGuard } from './my.guard';
import { SessionService } from '../core/service/session.service';

describe('MyGuard', () => {
  let guard: MyGuard;
  let sessionService: SessionService;
  let routerMock: { navigate: jest.Mock };

  beforeEach(() => {
    routerMock = { navigate: jest.fn() };

    TestBed.configureTestingModule({
      providers: [
        MyGuard,
        SessionService,
        { provide: Router, useValue: routerMock }
      ]
    });

    guard = TestBed.inject(MyGuard);
    sessionService = TestBed.inject(SessionService);
  });

  it('should allow access when condition is met', () => {
    sessionService.isLogged = true;
    expect(guard.canActivate()).toBe(true);
    expect(routerMock.navigate).not.toHaveBeenCalled();
  });

  it('should deny access and redirect when condition is not met', () => {
    sessionService.isLogged = false;
    expect(guard.canActivate()).toBe(false);
    expect(routerMock.navigate).toHaveBeenCalledWith(['login']);
  });
});
```

### Functional interceptor

```typescript
import { expect } from '@jest/globals';
import { TestBed } from '@angular/core/testing';
import { HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { of } from 'rxjs';
import { customJwtInterceptorFn } from './customJwtInterceptorFn';
import { SessionService } from '../core/service/session.service';

describe('customJwtInterceptorFn', () => {
  let sessionService: SessionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SessionService]
    });
    sessionService = TestBed.inject(SessionService);
  });

  it('should add Authorization header when logged in', () => {
    sessionService.logIn({ token: 'fake-token', /* ... */ } as any);

    const request = new HttpRequest('GET', '/api/test');
    let capturedRequest: HttpRequest<unknown> | undefined;
    const next: HttpHandlerFn = (req) => {
      capturedRequest = req as HttpRequest<unknown>;
      return of({} as HttpEvent<unknown>);
    };

    TestBed.runInInjectionContext(() => {
      customJwtInterceptorFn(request, next).subscribe();
    });

    expect(capturedRequest?.headers.get('Authorization')).toBe('Bearer fake-token');
  });

  it('should not add header when not logged in', () => {
    sessionService.isLogged = false;

    const request = new HttpRequest('GET', '/api/test');
    let capturedRequest: HttpRequest<unknown> | undefined;
    const next: HttpHandlerFn = (req) => {
      capturedRequest = req as HttpRequest<unknown>;
      return of({} as HttpEvent<unknown>);
    };

    TestBed.runInInjectionContext(() => {
      customJwtInterceptorFn(request, next).subscribe();
    });

    expect(capturedRequest?.headers.get('Authorization')).toBeNull();
  });
});
```

### Simple standalone component (no HTTP)

```typescript
import { expect } from '@jest/globals';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MyComponent } from './my.component';

describe('MyComponent', () => {
  let component: MyComponent;
  let fixture: ComponentFixture<MyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(MyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display content', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Expected text');
  });
});
```

### Component with form, HTTP, and signals

```typescript
import { expect, jest } from '@jest/globals';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should have invalid form initially', () => {
    expect(component.form.invalid).toBe(true);
  });

  it('should disable submit button when invalid', () => {
    const button = fixture.debugElement.query(By.css('button[type="submit"]'));
    expect(button.nativeElement.disabled).toBe(true);
  });

  it('should submit and navigate on success', async () => {
    const navigateSpy = jest.spyOn(router, 'navigate');

    component.form.setValue({ email: 'test@test.com', password: 'pass123' });
    component.submit();

    const req = httpMock.expectOne('/api/auth/login');
    req.flush({ token: 'fake-token' });

    await fixture.whenStable();

    expect(navigateSpy).toHaveBeenCalledWith(['/sessions']);
  });

  it('should set onError signal on failure', async () => {
    component.form.setValue({ email: 'wrong@test.com', password: 'wrong' });
    component.submit();

    const req = httpMock.expectOne('/api/auth/login');
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.onError()).toBe(true);
  });
});
```

### Component with ActivatedRoute params

```typescript
import { provideRouter, ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';

await TestBed.configureTestingModule({
  imports: [MyComponent],
  providers: [
    provideRouter([]),
    provideHttpClient(),
    provideHttpClientTesting(),
    {
      provide: ActivatedRoute,
      useValue: {
        snapshot: { paramMap: convertToParamMap({ id: '1' }) },
        paramMap: of(convertToParamMap({ id: '1' }))
      }
    }
  ]
}).compileComponents();
```

⚠️ `ActivatedRoute` provider MUST be declared **after** `provideRouter([])` to take precedence.

### Component with MatSnackBar — the tricky pattern

`MatSnackBar` is `@Injectable({ providedIn: 'root' })`, so `useValue` mocking often fails silently (coverage shows 100% but mock not called). Use `useClass` + `overrideComponent`:

```typescript
import { MatSnackBar } from '@angular/material/snack-bar';

class MatSnackBarMock {
  open = jest.fn();
}

describe('MyComponent', () => {
  let snackBarMock: MatSnackBarMock;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyComponent, NoopAnimationsModule],
      providers: [
        { provide: MatSnackBar, useClass: MatSnackBarMock },
        // ... other providers
      ]
    }).compileComponents();

    TestBed.overrideComponent(MyComponent, {
      set: {
        providers: [
          { provide: MatSnackBar, useClass: MatSnackBarMock }
        ]
      }
    });

    fixture = TestBed.createComponent(MyComponent);
    component = fixture.componentInstance;
    // Critical: get the instance the component actually uses
    snackBarMock = fixture.debugElement.injector.get(MatSnackBar) as unknown as MatSnackBarMock;
    fixture.detectChanges();
  });

  it('should show snackbar', async () => {
    component.someAction();
    // ... flush HTTP if needed ...
    expect(snackBarMock.open).toHaveBeenCalledWith('Message', 'Close', { duration: 3000 });
  });
});
```

---

## Jest configuration

### `jest.config.js`

```javascript
module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  collectCoverage: true,
  coverageDirectory: './coverage/jest',
  collectCoverageFrom: [
    'src/app/**/*.ts',
    '!src/app/**/*.module.ts',
    '!src/app/**/*.interface.ts',
    '!src/app/**/*.routes.ts',
    '!src/app/app.config.ts',
    '!src/app/**/index.ts',
    '!src/**/*.d.ts',
  ],
  coverageReporters: ['html', 'text-summary', 'lcov'],
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/cypress/'],
  coveragePathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/cypress/'],
  // CI gate fixé à 70% (seuil exigé par le projet). Ambition de génération : ~80%.
  coverageThreshold: {
    global: {
      statements: 70,
      branches: 70,
      lines: 70,
      functions: 70,
    },
  },
};
```

### `setup-jest.ts`

```typescript
import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';
setupZoneTestEnv();

const mock = () => {
  let storage: { [key: string]: string } = {};
  return {
    getItem: (key: string) => (key in storage ? storage[key] : null),
    setItem: (key: string, value: string) => (storage[key] = value || ''),
    removeItem: (key: string) => delete storage[key],
    clear: () => (storage = {}),
  };
};
Object.defineProperty(window, 'localStorage', { value: mock() });
Object.defineProperty(window, 'sessionStorage', { value: mock() });
```

---

## Troubleshooting reference

| Symptom | Cause | Fix |
|---|---|---|
| `Unexpected "X" found in declarations` | Component is standalone | Move from `declarations` to `imports` |
| `RouterTestingModule is deprecated` | Old API | Use `provideRouter([])` |
| `GET api/X/null` instead of `GET api/X/1` | Bad ActivatedRoute mock | Use `convertToParamMap({...})` |
| Coverage 100% but `Number of calls: 0` on snackbar | `useValue` doesn't override `providedIn: 'root'` | Use `useClass` + `overrideComponent` |
| `Could not parse CSS stylesheet` | jsdom doesn't support `@layer` | Mock `MatSnackBar` instead of letting it render |
| `Property 'toBe' does not exist on type 'Assertion'` | Chai/Jest type conflict | `import { expect } from '@jest/globals'` |
| Callback after `req.flush()` never runs | `takeUntilDestroyed` cuts the flow | `await fixture.whenStable()` after flush |
| Intercept PUT but get GET | Cold Observable re-fired | Use matcher: `httpMock.expectOne(r => r.url === '...' && r.method === 'PUT')` |
| `Expected no open requests, found N` | Forgot to flush a request | Flush every request before `httpMock.verify()` |
| Mock not applied despite useValue | Service has `providedIn: 'root'` | Switch to `useClass` |

---

## Workflow when generating tests

When asked to write tests for a file, follow this order:

1. **Read the source file** to understand:
   - Constructor injections / `inject()` calls
   - Public methods
   - Template references (for components: routerLinks, async pipes, *ngFor, conditional displays)
   - HTTP endpoints called
   - Any `@Injectable({ providedIn: 'root' })` dependencies that might need `useClass`

2. **Identify the test categories needed**:
   - One `should be created` / `should create` baseline
   - One test per public method (happy path + error path if applicable)
   - One test per conditional template branch (admin vs user, logged in vs not, etc.)
   - Form validation tests if forms are present

3. **Pick the right template** from this skill based on what the file is

4. **Apply known fixes preemptively**:
   - Material component? → `NoopAnimationsModule` + `useClass` for MatSnackBar
   - Uses `ActivatedRoute`? → `convertToParamMap` pattern
   - Uses `takeUntilDestroyed`? → `await fixture.whenStable()` after flush

5. **Verify coverage** with the targeted command:
   ```bash
   npx jest path/to/file.spec.ts --coverage --collectCoverageFrom="path/to/file.ts"
   ```

6. **Comment each test** with a one-line description of what it validates, ideally tying back to a functional requirement (login flow, admin permissions, etc.)

---

## Commit plan template

For a project of typical Angular size (8-12 components, 4-5 services), structure commits this way:

```
1. test: setup jest config + placeholder specs
2. test(unit): SessionService (or main state service)
3. test(unit): API services
4. test(unit): guards and interceptor
5. test(integration): static and root components
6-N. test(integration): one component per commit
N+1. chore(test): final coverage threshold + README
```

Each commit should leave the test suite passing with the placeholder/real tests intact.
