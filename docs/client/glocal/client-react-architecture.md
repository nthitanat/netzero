# KnowledgeHub client architecture and consistency rules

Last reviewed: 2026-09-30

Scope: `glocal-client/src`, client configuration, and related client documentation.

This is the main guideline for the [client inconsistency index](INCONSISTENCY_INDEX.md). It describes the current Glocal platform React client and defines the constraints for new code and consistency fixes. The [SCSS architecture](scss-architecture.md) and [organic theme](organic-theme.md) guides support this document. `GENERAL_ARCHITECTURE.md` is outside this review's scope; this update does not adopt its requirements or relocate project documents.

**Required** means new or changed behavior must satisfy the rule. **Optional** means use it only when the responsibility warrants it. **Current** describes verified implementation, including defects; it does not make those defects acceptable patterns. Existing violations remain tracked in the index until implementation and verification are complete. A documentation update does not make the client compliant.

## 1. Current project structure

The [package manifest](../../../glocal-client/package.json) declares React 18, React Router 6, Create React App (`react-scripts` 5), Axios, and Sass. The client uses JavaScript, JSX, and SCSS Modules. It has no declared server-state caching library or TypeScript setup.

```text
glocal-client/src/
├── index.js                       # React root, StrictMode, global stylesheet
├── App.js                         # Providers, HashRouter, Navbar, routes, Footer
├── api/
│   ├── client.js                  # Named axiosInstance export and interceptors
│   ├── auth.js                    # authService, authentication response/error handling
│   ├── checkinService.js          # Survey check-in verification request
│   └── dataService.js             # Async catalog services backed by local JSON
├── data/                          # communities, products, courses, articles JSON
├── context/LanguageContext.js     # Thai/English language state and t helper
├── contexts/
│   ├── AuthContext.js             # Authentication state and operations
│   └── AuthFlowContext.js         # Auth/survey modal orchestration and toast
├── pages/                         # Route-level composition; KnowledgeHub is not routed
│   └── CheckIn/                   # Existing JSX + SCSS + useCheckIn + CheckInHandler
├── components/
│   ├── common/                    # Shared navigation, heroes, cards, modals, controls
│   └── course/                    # EnrollmentCard and CurriculumAccordion
├── styles/
│   ├── main.scss                 # Global reset, typography, utility classes
│   ├── _variables.scss           # Sass tokens and emitted :root CSS variables
│   ├── _mixins.scss              # Foundation helpers; imports variables
│   ├── _palettes.scss            # Named palette maps
│   ├── _animations.scss          # Emitted keyframes
│   └── _organic-theme.scss       # Theme mixins; imports animations and palettes
└── utils/                         # storage, publicAssetUrl, youtube helpers
```

Both `context/` and `contexts/` exist. Preserve these import paths unless a scoped migration updates all callers. Shared components currently use direct imports; there is no required common barrel export. Do not create placeholder hook, handler, service, or stylesheet files solely to satisfy a template.

### Current routes and identifiers

[App.js](../../../glocal-client/src/App.js) owns these routes inside `HashRouter`:

| Route | Rendered page | Record key |
| --- | --- | --- |
| `/` | Landing | — |
| `/about` | About | — |
| `/communities` | Communities | Selects featured/first community after loading |
| `/communities/:slug` | Communities → CommunityDetailView | `community.slug` |
| `/showroom` | Showroom | — |
| `/showroom/:id` | ProductDetail | `product.id` |
| `/courses` | Courses | — |
| `/courses/:id` | CourseDetail | `course.id` |
| `/check-in` | CheckIn | — |

`KnowledgeHub.jsx` exists but `/knowledge-hub` is not registered. Footer also links to unregistered `/co-design`; no wildcard route currently handles these gaps (INC-14, INC-22).

**Required:** use React Router `Link` or `useNavigate` for internal navigation and the record key expected by its service. A course link must use `course.id`, never an assumed `course.slug` (INC-04). Validate required identifiers before links or mutations; never generate an `undefined` destination or storage key. Use stable record IDs for list keys rather than array positions when records can change.

The package deployment prefix is `/glocal`; direct hash navigation is, for example, `/glocal/#/courses/<id>`. Pass `/courses/<id>` to `Link`, without manually adding the deployment prefix or hash. Use [publicAssetUrl](../../../glocal-client/src/utils/publicAssetUrl.js) for assets under `public/`. Verify direct navigation and refresh when changing routes. New navigation entries require an implemented destination; remove or omit unavailable destinations and unverified contact/social placeholders instead of advertising broken links.

## 2. Responsibility boundaries

| Owner | Required responsibility | Must not become |
| --- | --- | --- |
| `api/client.js` | HTTP base configuration, timeout, token injection, transport interceptors | A renderer, page state store, or duplicate feature client |
| `api/auth.js`, `api/checkinService.js`, `api/dataService.js` | Requests/data access and explicit response contracts | A place for JSX, navigation, modal visibility, or presentation text |
| Page/feature hook | Request lifecycle, data state, mutation orchestration, derived feature state | Another HTTP client or independent duplicate of shared state |
| Page JSX | Route parameters, page composition, rendering loading/empty/error/content states | A large collection of service orchestration and persistence code |
| Shared component | Explicit data/callback contract, rendering, private interaction state | An implicit owner of the same business fact in multiple instances |
| Context | State genuinely shared across its consumers, such as auth/language/auth flow | A default dumping ground for all page state |
| `utils/` | Focused reusable storage, URL, or transformation helpers | Components, hooks disguised as ordinary functions, or page orchestration |
| SCSS Module | Scoped layout and component variants using shared foundations | Global resets or a second copy of shared design rules |

### Services and response shapes

**Current:** [client.js](../../../glocal-client/src/api/client.js) exports `axiosInstance` by name. A 401 clears stored auth and emits `auth:unauthorized`; a 403 emits `auth:forbidden`. These events are consumed by `AuthContext`; the interceptor does not redirect to a login route.

```js
// Inside src/api/: use the existing configured transport.
import { axiosInstance } from './client';
```

[dataService.js](../../../glocal-client/src/api/dataService.js) simulates asynchronous catalog access with a delay and local JSON. Authentication and check-in use HTTP. Do not describe catalog data, follow counts, or enrollment as account-backed services without an implemented contract.

| Service family | Current resolved value consumed by callers |
| --- | --- |
| Catalog list/detail getters | Lists return named arrays inside `data` (for example `response.data.courses`); details return named records (for example `response.data.course`). Inspect each getter for related records and metadata. |
| `getProductsByCommunity`, `getCoursesByCommunity` | Arrays directly |
| Auth operations such as `login` | Unwrapped response body (`response.data` inside the service), with its own `success` and `data` fields |
| `verifyCheckin` | Axios response; `completed` and `redirectUrl` are at `response.data.data` |

**Required:** inspect the actual exported function and its immediate callers before changing a service. Preserve these shapes or migrate every consumer together. Do not blindly use `response.data.items`, add duplicate aliases, bypass services with JSON imports in views, or assume every service uses the same envelope. Document new service inputs, outputs, not-found behavior, and failures at the exported function. Browser persistence for a feature must have one owner and handle missing/malformed stored values and storage failures; auth storage already uses `storageService`.

### Required versus optional file organization

A page or component has a JSX implementation and a colocated `.module.scss` when it needs local styling. Match its existing class naming convention; both PascalCase and lower camel case exist. Exact JSX-to-module class matching is mandatory; mass renaming for casing alone is unnecessary.

**Required:** put new or substantially refactored asynchronous data loading and multi-step feature state in a colocated `usePageName` or `useFeatureName` hook. The hook owns the effect, request status, cleanup, and feature callbacks; the view consumes its result. Shared render components receive data and callbacks. Reusable feature containers may own a hook, but must expose their inputs explicitly. Existing inline fetching in Courses, Showroom, CourseDetail, and CommunityDetailView is migration work under INC-08, not evidence that this separation is already complete.

**Optional:** a separate `PageNameHandler.js` can hold hook-free validation, transformations, or orchestration with explicit dependencies when that makes the code clearer. CheckIn currently uses this layout. A helper that calls `useNavigate`, `useState`, or another hook must itself be a `use...` hook called at the top level of a component/hook. Do not label a state-mutating or I/O handler “pure.”

Simple toggles, local tab selection, DOM refs, and small event handlers can stay in JSX. A state-only page does not need four files. Use context only when state must outlive or be shared beyond the nearest common owner; introducing a state library is not required by this guide.

## 3. State and asynchronous consistency

### One owner for each shared fact

**Required:** controls displaying or changing the same follow/enrollment fact consume one state owner, keyed by the actual community/course ID. Calling a hook separately in two buttons still creates two independent states unless it reads a shared store. Lift ownership to their common parent or an appropriate shared provider, then pass controlled values and callbacks to both consumers.

- **Following (INC-01, INC-02):** the current `FollowButton` accepts `communityId` and `communityName`; the hero's `isFollowing`/`onClick` props do not satisfy that contract. A fix must update the implementation and both callers together, reject missing IDs, and synchronize follow/unfollow. Counts must come from an authoritative data source or be omitted. Random numbers or a browser-local counter cannot represent a shared follower count.
- **Enrollment (INC-18):** `EnrollmentCard` currently owns a local flag while `CurriculumAccordion` receives `enrolled={false}`. A fix must give them the same enrollment owner, or use an accurately labeled preview/external action until enrollment exists. A UI flag cannot establish server-side lesson authorization.
- **Persistence:** the product contract must state whether follow/enrollment is a browser prototype or an account-backed feature, and its behavior across reload, navigation, logout, and a new session. These decisions remain open; this document does not invent endpoints or persistence guarantees.

Document required props, optional props/defaults, callback arguments, and ownership next to each shared component, using JSDoc where helpful. Audit every call site when changing the contract. Keep private UI state, such as expansion, local unless consumers need to coordinate it; do not mirror a controlled business value into unsynchronized local state.

### Request lifecycle (INC-08, INC-09)

**Required for asynchronous reads:**

1. Key the request to all relevant route/filter inputs and include them in effect dependencies.
2. On a new request, clear the previous error and prevent data from a previous record appearing as the new record. Expose loading explicitly.
3. Distinguish successful empty lists, missing records, and request failures. Logging alone is not an error UI; failures need understandable localized feedback and a retry/recovery path where appropriate.
4. Cancel the obsolete request when supported, or ignore its result after input changes/unmount. Guard success, error, and final loading updates. A stale `finally` must not clear a newer request's loading state.
5. Clean up listeners, timers, observers, and any created object URLs. Effects must tolerate the development StrictMode lifecycle. Do not suppress dependency warnings to force a mount-only request.

[ProductDetail](../../../glocal-client/src/pages/ProductDetail/ProductDetail.jsx) demonstrates an `active` flag guarding all promise branches. Its inline placement and combined failure/not-found display are not a full template for the target hook contract. The current mock catalog getters do not accept an abort signal; ignoring obsolete results is valid. Never claim cancellation simply because an unused `AbortController` was constructed.

Mutations must prevent duplicate submissions while pending, expose failures, and only show success after the chosen operation contract succeeds. If updates are optimistic, define and verify rollback. Route changes must not attach an older mutation result to a different record.

### Survey and authentication outcomes (INC-17)

**Required:** modal dismissal and verified survey completion are separate outcomes. Closing the intro, clicking “already filled,” repeated iframe loads, or an arbitrary `postMessage` must not establish submission or show a completion toast.

If the integration supplies a documented completion message, validate its exact allowed origin, `event.source === iframeRef.current?.contentWindow`, payload schema, and the current survey flow before accepting it. These checks alone do not prove that the provider actually offers such a signal. Alternatively use a verified backend completion result tied to the intended participant. The check-in service exists, but no equivalence between that flow and modal completion is assumed here. Until a reliable completion contract is established, the modal must describe the result as unverified rather than claim success.

`AuthContext` owns authentication; `AuthFlowContext` owns modal coordination. Shared buttons request that flow rather than creating competing auth state. Preserve the existing provider dependencies: `AuthFlowProvider` consumes both auth and language providers.

## 4. Shared UI and interaction contracts

**Required:** reuse a shared implementation when behavior and presentation match. Similar appearance alone does not justify combining distinct content structures.

| Pattern | Constraint and current gap |
| --- | --- |
| Actions (INC-05) | Consolidate matching action styles into a small shared API with named variants, pending/disabled behavior, and accessible labels. Use a button for an action, a Router link for internal navigation, and an anchor for an external destination. Existing `.Button` classes and mixins are foundations, not an already implemented shared React button API. |
| Catalogs (INC-06) | Extract matching slider/card layout and arrow behavior with explicit items, stable keys, selected key, item rendering, and selection callback. Courses selects an ID locally; Communities selects a slug through routing. Preserve that difference. `CollapsibleCatalog` currently shares the shell only. |
| Headers (INC-07) | Share matching title/badge/subtitle sections. Preserve distinct `SplitHero`, `SplitBanner`, and `FeaturedHero` contracts; do not force every header into one layout. |
| Theme (INC-19) | A shared component used on differently themed pages must accept a documented palette variant or inherit scoped theme variables. The current catalog hard-codes orange while Courses uses CU pink. |
| Expansion (INC-20) | Expanded content must remain visible after data, images, viewport, or language changes. Prefer layout without a fixed measured cap; if measuring, do it after layout and update on size changes with cleanup. Do not read `scrollHeight` during render or rely on an arbitrary fallback maximum. |
| Keyboard (INC-21) | Gallery triggers and other actions use native buttons with accessible names, visible focus, and Enter/Space activation. Icon-only controls need labels; decorative icons are hidden from assistive technology. |

**Required:** use `useLanguage` and its `t` helper for bilingual data, or colocated Thai/English label maps for control text. New shared controls must localize visible text, hints, accessible labels, loading/empty/error messages, and success feedback. Avoid parallel copies of the translation helper. Current language state starts in Thai on each mount; writing language to storage does not mean a saved preference is restored. Verify switching between Thai and English, including longer text and expanded panels.

## 5. Styling constraints

The existing design foundation is CU/Material Design tokens plus organic palette mixins. Use actual exports from `_variables.scss`, `_mixins.scss`, `_palettes.scss`, and `_organic-theme.scss`; there is no `colors.scss` or required glassmorphism system.

**Required:**

- Keep global reset, typography, and utilities owned by `main.scss`, imported at the application entry. Never import `main.scss` into a SCSS Module. Currently both `index.js` and `App.js` import it; a future cleanup should keep the entry import without claiming this update removed the duplicate.
- Import foundation helpers into modules; import organic-theme only when using its mixins. **Shared components may consume theme mixins**, provided their theme/variant contract is explicit and they do not add global resets. This resolves the intended boundary in INC-10 in favor of existing themed shared components. The supporting SCSS guide's page-only prohibition is stale and must be reconciled before INC-10 can close.
- Account for emitted CSS: `_variables.scss` contains `:root`, and `_organic-theme.scss` imports keyframes. These imports are not currently emission-free. Keep ownership of global declarations in the shared style layer; when consolidating emissions, inspect compiled CSS and preserve animation references. Do not claim CSS duplication was eliminated by changing guidance alone.
- Use existing semantic color tokens or palette roles instead of repeated raw colors. Reuse spacing/shape/type tokens where their meaning matches. Share repeated catalog dimensions in the shared component or common token owner. Intentional page-specific dimensions, image ratios, and zero values need not become global tokens.
- Express banner sizes and other repeated variants through mixin parameters or component variants. Do not add `!important` overrides to compensate for an unsuitable shared mixin; parameterize it and check all affected callers (INC-11).
- Every `styles.Name` reference must exist in its imported module. Remove unused `ArrowLeft`/`ArrowRight` references or implement actual variants (INC-23). A successful build does not guarantee these lookups exist.
- Remove confirmed unused selectors after checking JSX and other callers; do not preserve speculative future UI in active page styles (INC-12).
- Use inline styles only for values determined at runtime, such as a measured dimension or scoped theme property. Static visual rules belong in SCSS.

### CSS Modules and global icon classes (INC-03)

A global icon font class stays global in JSX. Scope the parent and explicitly escape the nested global selector:

```scss
// Example inside a page module; adjust relative paths for component depth.
@import '../../styles/mixins';

.ArrowBtn {
  color: $color-primary;

  :global(.material-symbols-outlined) {
    font-size: 24px;
  }
}
```

```jsx
<button type="button" className={styles.ArrowBtn} aria-label={label}>
  <span className="material-symbols-outlined" aria-hidden="true">chevron_left</span>
</button>
```

Alternatively add an explicit module class to the icon and style that class. A plain nested `.material-symbols-outlined` in a module is renamed and does not match the global class. Inspect production selectors and representative icons visually; source appearance or build success is insufficient.

## 6. Alignment assessment

**The guide now matches the client's actual structure and makes the required conventions explicit; the implementation is only partially compliant.** This is a client source/configuration review, not a backend, deployment, or whole-project certification.

| Area | Evidence and current assessment | Index findings |
| --- | --- | --- |
| Project identity and structure | Actual package, API/context paths, router, styles, and optional file conventions replace the unrelated project template. | INC-13: documentation corrected |
| Shared business state | Follow props/owners conflict, counts are fabricated, enrollment and lesson access disagree. | INC-01, INC-02, INC-18: open |
| Data lifecycle | Most page loading remains inline; detail request cleanup differs. | INC-08, INC-09: open |
| Navigation/content | Related courses use absent `slug`; Knowledge Hub and Co-Design destinations are missing; Footer contains placeholders. | INC-04, INC-14, INC-22: open |
| Shared presentation | Actions, catalogs, and matching headers remain duplicated; theme rules and variants disagree. | INC-05, INC-06, INC-07, INC-10, INC-11, INC-19: open |
| Style correctness | Global icon selectors are scoped incorrectly; unused Landing styles and missing arrow classes remain. | INC-03, INC-12, INC-23: open |
| Interaction/outcomes | Survey completion is unverified; catalog labels/height and gallery keyboard controls violate the required contracts. | INC-17, INC-20, INC-21: open |
| Automated checks | Strict build fails on unused variables; the test suite cannot resolve its testing dependency. | INC-15, INC-16: open |

This guide chooses code-organization and styling conventions. It leaves product decisions explicit: follow/enrollment persistence, authoritative counts, survey completion integration, missing page roles, and verified contacts still require decisions before dependent implementations. Do not invent those decisions to close findings.

## 7. Verification and completion gates

For each source fix, inspect immediate callers and the affected user flow. Record the actual change, checks, result, and limitations in the corresponding index row. Mark a finding **Fixed** only after its verification target passes; document changes alone can close a documentation finding, not a behavior finding.

Run the existing checks from `glocal-client`:

```sh
CI=true npm run build
CI=true npm test -- --watch=false --runInBand
```

A normal production build with warnings is not the strict build gate. Fix unused variables without disabling warnings. Repair test dependencies and setup, and make the existing test assert current application behavior; installing a missing package alone is insufficient. The manifest has no standalone lint or typecheck script, and these checks do not automatically enforce every architecture rule.

Required verification depends on the changed contract:

| Change | Verification needed before closure |
| --- | --- |
| Follow/enrollment | Both consumers agree before/after actions; invalid IDs do not mutate state; reload, navigation, and session behavior match the chosen persistence contract. |
| Data loading | Loading, success, empty, failure, retry/recovery, and missing records; rapid A → B navigation where A resolves/rejects last cannot change B's data or loading state. |
| Survey | Dismiss each step without success; repeated iframe loads and unrelated-window messages do not complete; only the established trusted signal completes the current flow. |
| Routes/contacts | Every changed link resolves to its intended record/page/contact; direct hash navigation and refresh work under the deployment prefix. |
| Shared styling/UI | Affected callers at mobile and desktop widths, Thai and English, keyboard operation, content growth, palette variants, and compiled icon selectors. |

Add meaningful regression coverage for changed behavioral contracts after restoring the test setup. Visual/manual review remains necessary where automated checks do not cover layout, focus, or localization. Report failed or unrun checks plainly. Completion of this index supports client consistency only; broader project alignment needs a separate scoped review.
