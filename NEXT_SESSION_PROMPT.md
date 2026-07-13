# Next Session: Community Detail Pages & Course Module

## Overview
Extend the existing Knowledge Hub React application with detailed pages for individual communities and courses, following the established architecture and design patterns from the documentation.

## Required Documentation Context
Before starting, review these files:
- `documentation/client-react-architecture.md` - Code patterns and structure
- `documentation/theme.md` - Material Design 3 specifications
- `documentation/site-structure.md` - Overall site structure

## Task 1: Community Detail Pages

### Route
- Add route: `/communities/:slug` (use slug from community data)
- Example: `/communities/ban-tai-lue-weaving`

### Page Sections (in order)

#### 1. Hero Section
- Full-width banner with community main image
- Community name (TH/EN based on language context)
- Tagline overlay
- Type badge (group/individual)
- Region and province display

#### 2. Community Leader Profile Card
Design as prominent card with elevation-2:
- **Profile Photo** (use `leader.image` from data)
- **Name** (TH/EN)
- **Occupation** (TH/EN - add to mock data)
- **CU Alumni Status Section:**
  - Year of graduation (add to mock data)
  - Faculty (TH/EN - add to mock data)
  - Major (TH/EN - add to mock data)
  - Display only if `leader.cuAlumni === true`
- **CU Relationship Section:**
  - Research projects (array - add to mock data)
  - Advisor name (if applicable - add to mock data)
  - Collaboration projects (array - add to mock data)
  - Display as chips/tags with icons

#### 3. Storytelling Section
- **Timeline Component** (vertical timeline with Material Icons)
  - Add `timeline` array to community mock data
  - Each entry: `{ year: string, title: {th, en}, description: {th, en}, image?: string }`
  - Display chronologically with connecting line
  - Alternating left/right layout on desktop
  
- **Media Gallery**
  - Photo gallery grid (use existing `images` array + add more)
  - Video embeds (add `videos` array with YouTube/Vimeo URLs)
  - Use responsive grid with image modal on click

#### 4. Story Section
- Full-width text section
- Use existing `story` field from data
- Add more detailed story content (add `storyDetails: {th, en}` to mock data)
- Typography: body-large, relaxed line-height

#### 5. Members Section (Conditional)
- **Show only if** `type === 'group'`
- Grid of member cards (use existing `members` array)
- Each card:
  - Photo
  - Name
  - Role
  - Expertise tags

#### 6. Products Section
- Heading: "Products from this Community"
- Horizontal scrollable cards or grid
- Reuse product card component from Showroom
- Filter products by `communityId`
- Link to individual product pages (future enhancement)

#### 7. Courses Section
- Heading: "Learn from this Community"
- Horizontal scrollable cards or grid
- Reuse course card component from Courses page
- Filter courses by `communityId`
- Link to individual course pages (Task 2)

#### 8. Follow/Subscribe Section
- Floating action button (FAB) - bottom right corner
- Icon: bell or bookmark
- On click: Toggle follow state
- Store follow state in localStorage: `followedCommunities` array
- Show toast notification: "Following [Community Name]" / "Unfollowed"
- Add follow count badge to FAB

### Mock Data Updates Required

Update `src/data/communities.json` to add:

```json
{
  "leader": {
    "name": { "th": "...", "en": "..." },
    "image": "/images/leaders/...",
    "cuAlumni": true,
    "occupation": { "th": "...", "en": "..." },
    "graduationYear": "2015",
    "faculty": { "th": "คณะ...", "en": "Faculty of ..." },
    "major": { "th": "...", "en": "..." },
    "cuRelationship": {
      "researchProjects": [
        { "th": "...", "en": "..." }
      ],
      "advisor": { "th": "...", "en": "..." },
      "collaborations": [
        { "th": "...", "en": "..." }
      ]
    }
  },
  "timeline": [
    {
      "year": "2010",
      "title": { "th": "...", "en": "..." },
      "description": { "th": "...", "en": "..." },
      "image": "/images/timeline/..."
    }
  ],
  "videos": [
    {
      "title": { "th": "...", "en": "..." },
      "url": "https://youtube.com/...",
      "thumbnail": "/images/..."
    }
  ],
  "storyDetails": {
    "th": "... (longer detailed story)",
    "en": "... (longer detailed story)"
  }
}
```

### API Service Updates

Add to `src/api/dataService.js`:

```javascript
export const getCommunityBySlugWithDetails = async (slug) => {
  // Existing getCommunityBySlug + add follow count
  // Fetch from localStorage: followedCommunities
  // Add isFollowing and followCount to returned data
}

export const toggleFollowCommunity = async (communityId) => {
  // Update localStorage
  // Return new follow state
}
```

---

## Task 2: Course Detail Pages (Coursera-style)

### Route
- Add route: `/courses/:id`
- Example: `/courses/1`

### Page Layout (Two-column on desktop)

#### Left Column (Main Content - 66% width)

##### 1. Course Header
- Course thumbnail (large)
- Course title (TH/EN)
- Instructor info (name, avatar, affiliation)
- Rating stars + student count
- Language badges
- Certificate badge if applicable

##### 2. About This Course
- Full description (add `fullDescription: {th, en}` to course data)
- What you'll learn (add `learningObjectives` array to course data)
- Prerequisites (add `prerequisites: {th, en}` to course data)

##### 3. Course Content (Curriculum)
Design as expandable accordion (Material Design):

Add to course mock data:
```json
{
  "curriculum": [
    {
      "sectionId": 1,
      "title": { "th": "...", "en": "..." },
      "duration": "2 hours",
      "lessons": [
        {
          "lessonId": 1,
          "title": { "th": "...", "en": "..." },
          "type": "video", // video, reading, quiz
          "duration": "15 min",
          "videoUrl": "https://...",
          "thumbnail": "/images/...",
          "isPreview": true // Allow preview without enrollment
        }
      ]
    }
  ]
}
```

Each section card shows:
- Section number and title
- Total duration
- Lesson count
- Expand/collapse icon

Expanded view shows:
- List of lessons with:
  - Play icon for videos
  - Document icon for readings
  - Quiz icon for quizzes
  - Duration
  - Lock icon if not enrolled (except previews)
  - Preview badge for free preview lessons

##### 4. Instructor Profile
- Full instructor bio (expand from existing data)
- Courses taught count
- Student count
- Rating
- Social links if applicable

#### Right Column (Enrollment Card - 33% width)

##### Sticky Enrollment Card
- Price (or "Free" badge)
- Enroll/Start Course button (filled button, primary color)
- Course details list:
  - Duration
  - Level (beginner/intermediate/advanced)
  - Language(s)
  - Max students (with current enrollment count)
  - Certificate availability
  - Deadline if applicable (add to data)
- Share buttons (social media icons)
- Add to wishlist button (outlined)

##### What You'll Learn Highlights
- Bullet points (reuse from learning objectives)
- Check icons (Material Icons)

### Mock Data Updates Required

Update `src/data/courses.json`:

```json
{
  "fullDescription": {
    "th": "... (detailed description)",
    "en": "... (detailed description)"
  },
  "learningObjectives": [
    { "th": "...", "en": "..." }
  ],
  "prerequisites": {
    "th": "...",
    "en": "..."
  },
  "curriculum": [...],
  "instructor": {
    "name": "...",
    "avatar": "/images/...",
    "bio": { "th": "...", "en": "..." },
    "affiliation": "...",
    "coursesCount": 5,
    "studentsCount": 1250,
    "rating": 4.8,
    "socialLinks": {
      "linkedin": "...",
      "website": "..."
    }
  },
  "deadline": "2026-12-31", // optional
  "requirements": {
    "th": "...",
    "en": "..."
  }
}
```

### Components to Create

1. **Timeline Component** (`src/components/common/Timeline/`)
   - TimelineItem component
   - Vertical connector line
   - Responsive (vertical only on mobile)

2. **MediaGallery Component** (`src/components/common/MediaGallery/`)
   - Photo grid with lightbox
   - Video player modal
   - Responsive grid

3. **FollowButton Component** (`src/components/common/FollowButton/`)
   - FAB style
   - Toggle state
   - Toast notification

4. **CurriculumAccordion Component** (`src/components/course/CurriculumAccordion/`)
   - Expandable sections
   - Lesson list with icons
   - Preview/lock states

5. **EnrollmentCard Component** (`src/components/course/EnrollmentCard/`)
   - Sticky positioning
   - Price display
   - CTA button
   - Course details list

### Navigation Updates

Update `src/components/common/Navbar/Navbar.jsx`:
- No changes needed (routes handle detail pages)

Update link clicks in:
- `src/pages/Communities/Communities.jsx` - Link to `/communities/${community.slug}`
- `src/pages/Courses/Courses.jsx` - Link to `/courses/${course.id}`

---

## Design Consistency Requirements

### Follow Existing Patterns

1. **Component Structure:**
   - Each page: `src/pages/[PageName]/[PageName].jsx` + `.module.scss`
   - Each component: `src/components/[category]/[ComponentName]/[ComponentName].jsx` + `.module.scss`

2. **SCSS Imports:**
   - Import only `@import '../../styles/mixins';` (which includes variables)
   - Use existing mixins and variables

3. **State Management:**
   - Use `useLanguage()` hook for bilingual content
   - Use `t()` helper: `t(content.title)` for objects with {th, en}
   - Use `useState`, `useEffect` for local state

4. **Data Fetching:**
   - Use existing patterns from `src/api/dataService.js`
   - Simulate 500ms delay with Promise
   - Show Loading component while fetching

5. **Styling:**
   - Use Material Design 3 tokens from `_variables.scss`
   - Follow existing component patterns (cards with elevation, hover states)
   - Responsive: Mobile-first, use `$breakpoint-md` (768px)
   - Use `@include` mixins for typography

6. **Icons:**
   - Material Symbols Outlined (already loaded in HTML)
   - Use `<span className="material-symbols-outlined">icon_name</span>`

7. **Routing:**
   - Add routes to `src/App.js`
   - Use `useParams()` for dynamic routes
   - Use `Link` from react-router-dom for navigation

### Color Usage
- Primary: CU Pink `#DB5F8E` - CTAs, links, active states
- Tertiary: CU Silver `#898989` - secondary elements
- Follow surface/container patterns from theme.md

### Typography Scale
- Page titles: `@include display-medium` or `headline-large`
- Section headings: `@include headline-medium`
- Card titles: `@include title-large`
- Body text: `@include body-large` or `body-medium`
- Captions/meta: `@include body-small` or `label-medium`

### Spacing
- Section padding: `$spacing-12` (48px) vertical
- Card padding: `$spacing-6` (24px)
- Component gaps: `$spacing-4` or `$spacing-6`

---

## Acceptance Criteria

### Community Detail Page:
- [ ] Route works with dynamic slug parameter
- [ ] All sections render with correct data
- [ ] Timeline displays chronologically with proper styling
- [ ] Leader profile shows all CU alumni info when applicable
- [ ] Members section hidden for individual type communities
- [ ] Products and courses filtered correctly by communityId
- [ ] Follow button works and persists to localStorage
- [ ] Fully responsive (mobile/tablet/desktop)
- [ ] Bilingual (TH/EN) switching works correctly

### Course Detail Page:
- [ ] Route works with dynamic course ID
- [ ] Two-column layout on desktop, stacked on mobile
- [ ] Curriculum accordion expands/collapses
- [ ] Video preview lessons can be played
- [ ] Enrollment card is sticky on desktop
- [ ] All course details display correctly
- [ ] Instructor profile shows complete information
- [ ] Fully responsive
- [ ] Bilingual switching works correctly

### Code Quality:
- [ ] No console errors
- [ ] ESLint warnings resolved
- [ ] Consistent naming conventions
- [ ] Proper component composition
- [ ] DRY principle (reuse existing components where possible)
- [ ] All imports use relative paths correctly
- [ ] SCSS modules scoped properly

---

## Implementation Order

1. **Update mock data files** (communities.json, courses.json)
2. **Create Timeline component** (reusable)
3. **Create MediaGallery component** (reusable)
4. **Create FollowButton component**
5. **Create CommunityDetail page** with all sections
6. **Test community page** with all 3 existing communities
7. **Create CurriculumAccordion component**
8. **Create EnrollmentCard component**
9. **Create CourseDetail page** with two-column layout
10. **Test course page** with all 4 existing courses
11. **Update navigation** links in Communities and Courses list pages
12. **Add routes** to App.js
13. **Final testing** - all routes, responsive, bilingual

---

## Development Notes

- Start dev server: `npm start` from `knowledgehub-client` directory
- Test on: http://localhost:3000
- Test responsive: Chrome DevTools device emulator
- Test bilingual: Use language toggle in navbar

## Reference Existing Code

Look at these files for patterns:
- `src/pages/Landing/Landing.jsx` - Data fetching, sections layout
- `src/pages/Communities/Communities.jsx` - Card grid, filtering
- `src/components/common/Navbar/Navbar.jsx` - Responsive menu, toggle states
- `src/components/common/Footer/Footer.jsx` - Grid layout, responsive
- `src/styles/_mixins.scss` - Available mixins
- `src/styles/_variables.scss` - Available design tokens
