# 🎯 BuildWise - Quick Reference Guide

**Last Updated:** December 10, 2025

---

## 🌟 Four Core Features

### 1️⃣ Featured Projects (Admin-Created)
**Flow:** Admin creates + uploads YT video → Students view free preview → Purchase DIY kit OR pre-built → Build with mentor → Publish

**Revenue Model:** Freemium (view free, pay for docs/kit/pre-built)

**Example:** "Smart Home Automation Kit"
- DIY Kit: ₹2,499 (components + docs + video)
- Pre-Built: ₹3,999 (fully assembled by mentor)
- Public: Title, description, component list, prices, YT preview
- Locked: Full docs, circuit PDFs, code, complete YT video
- Unlocked by: Buying DIY kit, pre-built, OR all components

---

### 2️⃣ Component Marketplace
**Flow:** Browse → Add to cart → Checkout → Receive

**Revenue Model:** Direct sales (per component)

**Example:** "Arduino Uno R3" - ₹1,799
- Standalone purchase
- No project association required
- No documentation unlock

---

### 3️⃣ AI-Powered Custom Projects
**Flow:** Chat with AI → AI generates plan → Admin approves → Mentor creates docs + YT video → Purchase → Build → Publish

**Revenue Model:** Premium service + component sales

**Example:** Student asks for "IoT irrigation system"
1. AI generates complete project plan with BOM
2. Admin reviews and assigns mentor
3. Mentor creates documentation + YouTube tutorial
4. Student purchases components (₹2,499)
5. Documentation + video unlocked
6. Builds with mentor support
7. Publishes to community

---

### 4️⃣ Student Marketplace (2nd-Hand & Pre-Built) 🆕
**Flow:** Student lists item → Admin verifies → Goes live → Other students buy → Rate & review

**Revenue Model:** 10% platform fee on sales

**Example:** Student selling completed project
- List: "Smart Home Automation - Built" for ₹2,499
- Admin verifies authenticity
- Buyer purchases with escrow payment
- Seller ships → Buyer confirms → Payment released
- Both rate each other

**What Can Be Sold:**
- 2nd-hand components (unused/old)
- Pre-built projects (completed BuildWise or personal)
- Complete robotics kits
- Any working hardware

---

## 👥 User Roles

| Role | Can Do |
|------|--------|
| **Student** | Browse projects, purchase components, request AI projects, build & publish, **sell 2nd-hand items** |
| **Mentor** | Create documentation, **record YouTube tutorials**, conduct sessions, support students, **build pre-built projects** |
| **Admin** | Create featured projects, **upload YT videos**, approve AI requests, **verify student listings**, assign mentors, manage inventory |

---

## 🔒 Access Control Logic

### Featured Project Content:

**FREE (No Login):**
- Project title, description, difficulty
- Component BOM with prices
- Materials list, stock status
- Learning outcomes
- **YouTube video preview (first 2 min)**

**LOCKED 🔒 (Purchase Required):**
- Implementation documentation
- Circuit diagrams (downloadable)
- Assembly guide PDFs
- Source code packages
- **Complete YouTube tutorial**
- Mentor contact

**Unlock Conditions:**
1. Buy DIY kit, OR
2. Buy pre-built project, OR
3. Buy ALL required components, OR
4. Buy some components + ₹99 unlock fee

---

## 💰 Pricing Strategy

### Featured Project Options:

**DIY Kit:**
```
Components:  ₹2,100
Mentor Fee:  ₹300
Packaging:   ₹99
─────────────────────
Total:       ₹2,499
```

**Pre-Built Project (NEW!):**
```
Components:  ₹2,100
Assembly:    ₹1,500 (mentor labor)
Testing:     ₹200
QA & Warranty: ₹199
─────────────────────
Total:       ₹3,999
```

### AI Custom Project:
```
Dynamic pricing based on AI output
Average range: ₹1,500 - ₹5,000
Includes mentor documentation + YT video + support
```

### Individual Component:
```
Per-unit pricing
No kit discount
No documentation unlock
```

### Student Marketplace (NEW!):
```
Student sets price (2nd-hand/pre-built)
Platform takes 10% commission
Example: ₹2,499 sale → ₹250 platform, ₹2,249 to seller
Escrow payment for buyer protection
```

---

## 🤖 AI Integration (Gemini 3 Pro)

**System Prompt Structure:**
```
Context: Available components database with stock & pricing
Task: Generate complete hardware project plan
Output: JSON with BOM, cost, steps, difficulty, feasibility
Requirements:
- Only use in-stock components
- Accurate pricing
- Technical feasibility
- Complete BOM (no missing parts)
- Safety considerations
```

**AI Output Includes:**
- Project title & description
- Component list with quantities
- Total cost calculation
- Build difficulty level
- Step-by-step outline
- Prerequisites & learning outcomes
- Alternative components (if needed)

---

## 📊 Database Models

### Key Models:

**Project:**
- isFeatured (admin-created)
- isAIGenerated (from AI request)
- isPublished (student completed)

**ProjectAsset:**
- type: CIRCUIT_DIAGRAM, PDF, CODE_ZIP
- isLocked: true/false
- fileUrl: Azure Blob Storage

**AIGeneration:**
- status: DRAFT, ACCEPTED, DISCARDED
- geminiResponse: Full AI output JSON
- projectId: Links to created project

**Order:**
- type: KIT_ONLY, PROJECT_KIT, COMPONENTS_ONLY
- projectId: If buying for a project
- Unlocks documentation on DELIVERED status

**ProjectMentor:**
- role: PRIMARY, SECONDARY
- Assigned by admin

**MentorSession:**
- Scheduled mentor-student meetings
- Duration, meeting link, notes

---

## 🔄 Complete User Journeys

### Journey 1: Featured Project Purchase
```
Student discovers project
  ↓
Views free preview (components, price)
  ↓
Decides to buy full kit (₹2,399)
  ↓
Checkout & payment
  ↓
Order delivered → Documentation unlocked
  ↓
Builds project with mentor support
  ↓
Completes & publishes to community
  ↓
Gets achievement badge & recognition
```

### Journey 2: Component Shopping
```
Student needs Arduino for personal project
  ↓
Browses component marketplace
  ↓
Adds Arduino Uno to cart (₹1,799)
  ↓
Checkout & payment
  ↓
Receives component
  ↓
(No documentation unlock)
```

### Journey 3: AI Custom Project
```
Student has project idea
  ↓
Chats with AI: "I want IoT plant watering"
  ↓
AI asks clarifying questions
  ↓
AI generates complete project plan
  ↓
Student reviews: ₹2,499, 7 components, INTERMEDIATE
  ↓
Submits for admin approval
  ↓
Admin reviews technical feasibility
  ↓
Admin approves & assigns mentor
  ↓
Mentor creates documentation (1 week)
  ↓
Admin final approval
  ↓
Student notified: "Ready to build!"
  ↓
Student purchases components
  ↓
Documentation unlocked
  ↓
Builds with mentor support (sessions)
  ↓
Completes project
  ↓
Publishes to community with photos/video
  ↓
Tagged: "AI-Powered Custom Build by [Student]"
```

---

## 🎯 Implementation Phases

### ✅ Phase 0: Foundation (DONE)
- User authentication
- Email system
- Component CRUD
- Admin role management

### 🔄 Phase 1: Projects Module (NEXT)
- Featured projects CRUD
- Project assets management
- Access control system
- Mentor assignment

### 📋 Phase 2: AI Integration
- Gemini API integration
- AI project generation
- Admin review workflow
- Mentor documentation flow

### 📋 Phase 3: Orders & Payments
- Shopping cart
- Order management
- PhonePe integration
- Documentation unlock logic

### 📋 Phase 4: Community & Polish
- Student project publishing
- Community showcase
- Badges & achievements
- Analytics dashboard

---

## 🚨 Critical Business Rules

1. **Documentation Lock:**
   - MUST purchase to unlock
   - Check ALL required components purchased
   - OR purchase full kit
   - OR pay ₹99 unlock fee

2. **Mentor Assignment:**
   - Admin assigns after project approval
   - Mentor creates docs before student purchase
   - Mentor fee included in kit price

3. **AI Project Approval:**
   - MUST be reviewed by admin
   - Check technical feasibility
   - Verify component availability
   - Validate pricing accuracy

4. **Stock Management:**
   - Real-time stock checks
   - Reserve on cart add (10 min)
   - Deduct on payment success
   - Low stock admin alerts

5. **Access Control:**
   - JWT authentication for all protected routes
   - Role-based authorization (STUDENT, MENTOR, ADMIN)
   - Purchase verification for locked content
   - Mentor access to assigned projects only

---

## 🔑 Key Differentiators

What makes BuildWise unique:

1. **AI Project Generation** 🤖
   - First platform with Gemini-powered hardware project creation
   - Personalized to student's needs and budget
   - Real-time component availability checking

2. **Integrated Mentorship** 👨‍🏫
   - Every project gets expert mentor
   - Professional documentation creation
   - **YouTube video tutorials** (NEW!)
   - Live support during building

3. **Pre-Built Option** 🔧 (NEW!)
   - Buy fully assembled projects
   - Mentor-built and tested
   - Quality guaranteed
   - Save time, learn by studying

4. **Student Marketplace** 🔄 (NEW!)
   - Sell unused components
   - List completed projects
   - Peer-to-peer trading
   - Affordable 2nd-hand hardware
   - 10% platform fee
   - Escrow payment protection

5. **Freemium Access** 💰
   - View projects free
   - Pay only for premium content
   - Smart purchase-to-unlock system
   - YouTube preview before buying

6. **Community Publishing** 🌍
   - Students showcase completed builds
   - Build coding portfolio
   - Get recognition & badges

7. **Hybrid Marketplace** 🛒
   - Featured curated projects
   - Standalone component sales
   - Custom AI projects
   - Student-to-student marketplace
   - All in one platform

---

## 📞 Support

For questions about this HLD:
- Email: team@buildwise.com
- Slack: #product-development
- Docs: `/backend/docs/PRODUCT_HLD.md`

---

*This is a living document. Update as product evolves.*
