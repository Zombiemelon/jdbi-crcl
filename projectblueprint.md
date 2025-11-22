from pathlib import Path

content = """# crcl. – Complete Product Implementation Blueprint

## 1. PRODUCT SUMMARY (3–5 sentences)
crcl. is a trust-based recommendation platform where users get advice only from friends, family, and trusted peers — not strangers or anonymous reviewers. It is designed for individuals, families, and local communities who feel overwhelmed by noise on group chats and distrust online review platforms. The product solves the problem of unreliable, scattered recommendations by organizing them into structured cards and trust-based circles. The core action is posting and receiving trustworthy recommendations within personal circles.

## 2. USER GOAL FLOWS (TASK LIST)
### ACCOUNT & NETWORK
- Create an account
- Complete basic profile
- Select interests
- Add friends
- Create inner/outer circles
- Add friends to circles
- View demo circle
- Invite friends (optional)

### RECOMMENDATIONS
- Post a recommendation (text + optional image)
- Choose visibility (inner circle / outer circle)
- Choose anonymity
- Ask a question
- Reply to a question
- View recommendation cards
- Browse trending/trusted lists
- View a friend's profile

### DISCOVERY & NOTIFICATIONS
- Receive email notification for new posts
- Browse community/trending recommendations
- Explore users with similar interests
- Filter recommendations (category / friend)

### CREDIBILITY
- View basic credibility score
- Provide feedback after receiving a helpful recommendation

## 3. SCREEN LIST + PURPOSE
1. Login / Signup – Authenticate user (email-based).
2. Profile Setup – Enter name, choose interests.
3. Circle Setup – Create inner & outer circle, add friends.
4. Demo Circle Screen – Present example recommendations for new users.
5. Home Feed – Display recommendation cards from circles.
6. Ask Question Screen – Post a question to a circle.
7. Post Recommendation Screen – Create recommendation card.
8. Trending / Community Lists – Explore trusted lists for fallback mode.
9. User Profile – View own recommendations and credibility score.
10. Friend Profile – View friend’s recommendations (if allowed).
11. Recommendation Detail – Full view of a single recommendation.
12. Notifications – Simple list of recent events.
13. Settings – Privacy, anonymity defaults, logout.

## 4. KEY VARIABLES (STATE + DATA MODELS)
### Local State
- sessionUser
- circleSelection (inner | outer)
- postDraft
- questionDraft
- isAnonymous
- isLoading
- filters (category, circle, friendId)
- imageUploadProgress

### Global State
- currentUser
- friends[]
- circles[]
- recommendations[]
- questions[]
- notifications[]
- credibilityScores[]
- demoData[]

## 5. CORE LOGIC RULES (DETERMINISTIC)

### Circle Visibility
IF post.visibility = "inner" → visible only to inner-circle friends  
IF post.visibility = "outer" → visible to both inner + outer circle  
IF anonymous = true → show "Anonymous" but preserve internal userID

### Credibility Scoring (Simple V1)
credibility = directRelationshipWeight  
            + manualTrustRating  
            + helpfulnessFeedback  
            + circleWeight  

### Ranking Logic
IF multiple recommendations → sort by credibility DESC  
IF tie → sort by recency DESC  

### Discovery Mode (Zero-Friend Case)
IF user.friends.length = 0:
- show demo circle  
- show trending trusted lists  
- suggest users with similar interests  

### Notifications
IF friend posts → send email  
IF user is tagged/replied → send email  

### Posting Rules
IF text.length = 0 → error  
IF image upload fails → continue with text  

## 6. API CALLS & RETURN SHAPES
### Auth
POST /auth/signup  
→ { userId, token }

POST /auth/login  
→ { userId, token }

### Users
GET /users/me  
→ { userId, name, interests[], credibilityScore }

PATCH /users/me  
{ name?, interests? }

### Friends
POST /friends/add  
→ { success: true }

GET /friends  
→ [{ userId, name, credibilityScore }]

### Circles
POST /circles  
{ name: "inner" | "outer" }

POST /circles/:id/add  
{ friendId }

### Recommendations
POST /recommendations  
{ text, imageUrl?, visibility, anonymous }  
→ { recommendationId }

GET /recommendations/feed  
→ [{ id, author, text, imageUrl, credibility, createdAt }]

GET /recommendations/:id  
→ { id, author, text, imageUrl, comments[], credibility }

### Questions
POST /questions  
{ text, visibility }  
→ { questionId }

POST /questions/:id/reply  
{ text }  
→ { replyId }

### Credibility
POST /credibility/feedback  
{ targetUserId, scoreDelta }

### Notifications
GET /notifications  
→ [{ id, type, message, createdAt }]

## 7. EDGE CASES
- User signs up but adds 0 friends → activate fallback mode.  
- User deletes all circles → recreate default inner + outer circles.  
- Duplicate friend requests.  
- User tries to view a recommendation outside their visibility level.  
- Empty text posts → reject.  
- Oversized image → reject or compress.  
- Anonymous post → maintain anonymity even when edited.  
- Feed empty → show demo content + prompts.  
- Conflicting recommendations → credibility ranking.  
- Email downtime → queue and retry.  

## 8. NON-FUNCTIONAL REQUIREMENTS
### Performance
- Feed loads < 200ms (cached)
- Images < 5MB

### Security
- JWT auth
- Sanitized inputs
- Strict visibility checks

### Scalability
- Indexed DB tables
- CDN for images

### Privacy
- Anonymous posting
- Private visibility rules

### Compliance
- Allow user deletion & data export

## 9. COMPONENT BREAKDOWN
### Frontend Components
- AuthForm
- ProfileSetup
- CircleCreator
- FriendAdder
- DemoCircle
- RecommendationCard
- QuestionCard
- PostComposer
- Feed
- TrendingList
- UserProfile
- FriendProfile
- NotificationBadge
- SettingsPanel

### Backend Modules
- auth.service
- user.service
- circle.service
- friend.service
- recommendation.service
- question.service
- credibility.service
- notification.service
- media.service

## 10. VALIDATIONS
- Email format
- Password length >= 8
- Recommendation text required
- Max 2 circles in V1
- ScoreDelta ∈ [-5,5]
- Cannot rate yourself

## 11. ERROR STATES
- ERR_UNAUTHORIZED
- ERR_FORBIDDEN
- ERR_VALIDATION
- ERR_NOT_FOUND
- ERR_RATE_LIMIT
- ERR_UPLOAD_FAILED
- ERR_FRIEND_NOT_FOUND

## 12. LOADING BEHAVIOR
- Skeleton loaders
- Progressive image loading
- Button spinners
- Lazy-loading components

## 13. IMPLEMENTATION PLAN
### Week 1–2
- Backend setup
- Auth
- Users/Friends/Circles
- React scaffold

### Week 3–4
- Recommendations
- Questions & replies
- Media uploads
- Feed
- Credibility
- Email notifications

### Week 5
- Demo circle
- Trending lists
- Profiles
- Filters

### Week 6
- QA
- Error handling
- Loading polish
- Launch

"""

# Write file
filepath = Path('/mnt/data/crcl_blueprint.md')
filepath.write_text(content)

filepath
