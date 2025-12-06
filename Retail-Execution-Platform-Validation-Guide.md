# Retail Execution Intelligence Platform - Validation & Implementation Guide
## From Concept to Semester MVP

**Date:** 2025-11-27
**Purpose:** Actionable guide to validate and build Retail Execution Intelligence Platform within 12-week semester timeline
**Top Recommendation from Team Skills Analysis**

---

## Part 1: Customer Validation Questions (Week 1-2)

### Target Customers to Interview

**Profile: SME CPG Brands (Small-to-Medium Enterprise Consumer Packaged Goods)**

Who to contact:
- Regional beer/beverage brands (Bavaria-based breweries)
- Local food manufacturers (bakeries, dairy, specialty foods)
- Cosmetics/personal care brands (German SMEs)
- Specialty products (organic, regional, artisanal)

**Target Company Characteristics:**
- 10-50 employees
- Products sold in 50-500 retail locations
- Annual revenue €1M-€20M
- Too small for enterprise solutions (ParallelDots, Pepperi)
- Currently struggling with retail visibility

**How to Find Them:**
- LinkedIn search: "Brand Manager" + "Bavaria" + "Food/Beverage"
- Industry associations: BVE (Bundesvereinigung der Deutschen Ernährungsindustrie)
- Local trade shows and food halls
- University alumni network (business school connections)

---

### Interview Script: CPG Brand Managers

**Opening (2 minutes):**
"Hi [Name], I'm a student at TU Dresden working on a research project about retail execution challenges for regional CPG brands. I'm trying to understand how brands like yours monitor product placement and availability in stores. Would you have 15-20 minutes to share your experience?"

**Discovery Questions (15 minutes):**

#### 1. Current State - Retail Execution Challenges

**Q1: "How do you currently monitor how your products are displayed and stocked in retail stores?"**
- Listen for: Manual store visits, reliance on sales reps, mystery shoppers, nothing at all
- Follow-up: "How often do you check each store? How many stores do you cover?"

**Q2: "What's your biggest frustration or blind spot when it comes to retail visibility?"**
- Listen for: Out-of-stocks, planogram violations, pricing errors, competitor actions
- Follow-up: "Can you give me a specific example of when this cost you sales?"

**Q3: "How do you find out if a store is out of stock or if your products aren't displayed properly?"**
- Listen for: Customer complaints, sales data lag, sales rep reports
- Follow-up: "How long does it typically take to discover and fix these issues?"

#### 2. Pain Quantification

**Q4: "What does it cost you when stores don't execute properly - out-of-stocks, poor placement, or missed promotions?"**
- Listen for: Lost sales estimates, specific incidents, brand damage concerns
- Follow-up: "If you had perfect visibility, how much more do you think you could sell?"

**Q5: "Have you tried any solutions for retail monitoring? What worked or didn't work?"**
- Listen for: Mystery shopping agencies, field merchandisers, manual audits, nothing
- Follow-up: "What did those solutions cost? Why did you stop using them or not start?"

#### 3. Solution Validation

**Q6: "If you could get real-time photos of your products on shelves across all your stores for €500-€1,000 per month, would that be valuable?"**
- Listen for: Budget feasibility, perceived value, comparison to current costs
- Follow-up: "What specific insights would be most valuable - stock levels, placement, freshness, competitor presence?"

**Q7: "Would you trust student shoppers to take these photos, or would you need professional auditors?"**
- Listen for: Quality concerns, authenticity requirements, brand protection
- Follow-up: "What would make you comfortable with student data collectors?"

**Q8: "How quickly would you need to see the data after a store visit?"**
- Listen for: Real-time expectations, weekly summaries, monthly reports
- Follow-up: "What actions would you take with this data?"

#### 4. Decision-Making

**Q9: "Who in your organization would make the decision to purchase a retail monitoring solution?"**
- Listen for: Title, budget authority, procurement process
- Follow-up: "What would you need to see to justify the investment?"

**Q10: "If we built a pilot program to monitor 20 of your stores for one month, would you be interested in testing it?"**
- Listen for: Willingness to pilot, timeline, decision process
- Follow-up: "What would success look like in a pilot?"

**Closing (3 minutes):**
"Thank you so much for your insights. Would it be okay if I follow up with you in a few weeks as we develop this concept further? If we run a pilot, I'd love to include [Brand Name]."

---

### Interview Script: Student Micro-Challenge Workers

**Profile:** 10 university students (diverse demographics)

**Opening:**
"Hey, I'm working on a project about flexible student work opportunities. Quick question - would you be interested in earning €5-€8 for 10-15 minute tasks?"

**Key Questions:**

**Q1: "How do you currently earn money as a student?"**
- Listen for: Part-time jobs, gig work, tutoring, parental support

**Q2: "If you could earn €5-€8 by visiting a supermarket, taking photos of product shelves, and answering a few questions - all in 10-15 minutes - would you do it?"**
- Listen for: Interest level, concerns, questions
- Follow-up: "How many of these would you be willing to do per week?"

**Q3: "What would make this more or less appealing than other student jobs you've had?"**
- Listen for: Flexibility, pay rate, ease, fun factor, time commitment

**Q4: "Would you feel comfortable photographing products in stores, or would that feel awkward?"**
- Listen for: Social anxiety, privacy concerns, ease of task

**Q5: "If you could do 4 store audits in one hour and earn €20-€30/hour, is that competitive with other student work you know about?"**
- Listen for: Comparison to food delivery, tutoring, retail jobs

**Q6: "What would motivate you to keep doing this regularly - money, gamification, cause you care about?"**
- Listen for: Primary motivation, engagement drivers

---

### Validation Success Criteria

**GO Decision if:**
✅ 3+ CPG brands express willingness to pilot (even if "maybe interested")
✅ At least 2 brands articulate clear pain with quantified cost (lost sales, missed revenue)
✅ Pricing range €500-€1,500/month is within "would consider" range
✅ 7+ students say they'd definitely do this work
✅ Students confirm €5-€8 per 10-15 min task is appealing

**NO-GO Decision if:**
❌ Brands already have satisfactory solutions
❌ Brands unwilling to pay more than €200-€300/month (below viability threshold)
❌ Trust concerns about student data quality are insurmountable
❌ Students aren't interested even at €8 per task

---

## Part 2: MVP Technical Architecture (Week 3-12)

### System Overview

**Three-Part Architecture:**
1. **Mobile App** (Student-facing) - Photo capture + GPS + questionnaire
2. **Backend Platform** - Data processing, AI analysis, quality control
3. **Dashboard** (Brand-facing) - Data visualization, alerts, reporting

---

### Mobile App (React Native)

**Core Features for MVP:**

**Feature 1: Task Assignment & Discovery**
```
Screen: Available Tasks
- List of nearby store audit opportunities
- Filter by: proximity, payout, brand, time requirement
- Shows: Store name, address, payout (€5-€8), estimated time, distance

Task Card:
  [Brand Logo]
  Store: REWE, Hauptstraße 123
  Task: Product availability & freshness check
  Payout: €7.50 | Time: 12 min | Distance: 800m
  [Accept Task] button
```

**Feature 2: Guided Photo Capture**
```
In-Store Workflow:
Step 1: GPS Check-in (verify location within 50m of store)
Step 2: Guided photo capture
  - "Take photo of [Brand X] shelf section"
  - AI feedback: "Photo too blurry, please retake"
  - "Photo clear ✓ - captured 4 products"
Step 3: Quick questionnaire
  - "Are any products out of stock?" [Yes/No]
  - If yes: "Which products?" [Multi-select from detected items]
  - "Are expiry dates visible?" [Yes/No]
  - "Rate shelf cleanliness" [1-5 stars]
Step 4: Submit
  - Auto-upload with GPS + timestamp metadata
  - Immediate feedback: "Task submitted! €7.50 earned"
```

**Feature 3: Earnings & Gamification**
```
Profile Screen:
- Total earned: €127.50
- Tasks completed: 18
- Success rate: 94% (quality score)
- Current streak: 7 days
- Next reward unlock: 20 tasks → €2 bonus

Leaderboard (optional):
- Top earners this week
- Most reliable auditors (quality scores)
```

**Technical Stack:**
- **Framework:** React Native (cross-platform iOS/Android)
- **Camera:** react-native-camera with quality validation
- **GPS:** react-native-geolocation-service
- **State Management:** Redux or Context API
- **Backend Communication:** Axios for REST API calls
- **Image Upload:** react-native-image-picker with compression

---

### Backend Platform (Python/FastAPI)

**Core Services:**

**Service 1: Task Management API**
```python
POST /api/tasks/create
{
  "brand_id": "brand_123",
  "store_locations": [
    {"store_id": "rewe_001", "address": "...", "lat": 51.05, "lon": 13.74}
  ],
  "products_to_check": ["Product A", "Product B"],
  "questions": [...],
  "payout_per_task": 7.50,
  "deadline": "2025-12-15"
}

GET /api/tasks/available?lat=51.05&lon=13.74&radius=5000
Returns: List of tasks near student's location

POST /api/tasks/{task_id}/submit
{
  "student_id": "student_456",
  "photos": ["base64_encoded_image_1", "..."],
  "gps_lat": 51.051,
  "gps_lon": 13.741,
  "timestamp": "2025-11-27T14:30:00Z",
  "questionnaire_responses": {...}
}
```

**Service 2: AI Image Analysis Pipeline**
```python
# Simplified MVP version (expand later with real AI)

def analyze_shelf_photo(image_bytes):
    """
    MVP: Basic image quality check + OCR for text
    Future: Product detection, planogram compliance, freshness analysis
    """
    # Step 1: Quality validation
    quality_score = check_image_quality(image_bytes)
    if quality_score < 0.7:
        return {"status": "rejected", "reason": "blurry_image"}

    # Step 2: OCR for expiry dates and prices (using Tesseract)
    text_detected = extract_text_ocr(image_bytes)
    expiry_dates = parse_expiry_dates(text_detected)
    prices = parse_prices(text_detected)

    # Step 3: Basic object detection (using pre-trained model)
    # For MVP: Count number of products visible
    product_count = count_products_basic(image_bytes)

    return {
        "status": "approved",
        "quality_score": quality_score,
        "product_count": product_count,
        "expiry_dates_detected": expiry_dates,
        "prices_detected": prices,
        "shelf_fullness": estimate_shelf_fullness(product_count)
    }
```

**Service 3: Quality Control & Fraud Detection**
```python
def validate_submission(task_id, student_id, submission_data):
    """
    MVP fraud checks:
    1. GPS verification (within 100m of store)
    2. Timestamp validation (reasonable visit duration)
    3. Photo metadata check (not stock photos)
    4. Student history (flag if <80% approval rate)
    """
    checks = {
        "gps_valid": verify_gps_proximity(submission_data["gps"], task.store_location),
        "timestamp_valid": verify_reasonable_time(submission_data["timestamp"]),
        "photo_authentic": check_photo_metadata(submission_data["photos"]),
        "student_reliable": get_student_quality_score(student_id) > 0.8
    }

    if all(checks.values()):
        return {"approved": True, "payout": task.payout}
    else:
        return {"approved": False, "reason": failed_checks(checks)}
```

**Service 4: Brand Dashboard API**
```python
GET /api/brand/{brand_id}/dashboard
Returns:
{
  "total_stores_monitored": 47,
  "tasks_completed_this_week": 134,
  "out_of_stock_alerts": [
    {"store": "REWE_001", "product": "Product A", "detected_at": "..."}
  ],
  "average_shelf_compliance": 87.3,  # percentage
  "expiry_date_alerts": [
    {"store": "EDEKA_003", "product": "Product B", "expires_in_days": 3}
  ],
  "photo_gallery": [...],  # recent shelf photos
  "trends": {
    "stock_levels_trend": [95, 92, 88, 91],  # last 4 weeks
    "competitor_presence": {"Competitor X": 12, "Competitor Y": 8}
  }
}
```

**Technical Stack:**
- **Framework:** FastAPI (Python) - fast development, auto-generated docs
- **Database:** PostgreSQL (relational data: tasks, students, submissions)
- **Image Storage:** AWS S3 or local MinIO (for MVP)
- **AI/ML:**
  - Tesseract OCR (expiry dates, prices)
  - Pre-trained models from Hugging Face (basic object detection)
  - Future: Custom-trained models on CPG products
- **Background Jobs:** Celery + Redis (async image processing)
- **API Documentation:** Automatic with FastAPI Swagger UI

---

### Brand Dashboard (React)

**Core Views for MVP:**

**View 1: Overview Dashboard**
```
[Header: Brand Logo | Stores: 47 | Active Tasks: 12 | Alerts: 3]

[KPI Cards Row]
  Tasks Completed This Week: 134
  Average Compliance Score: 87.3%
  Out-of-Stock Rate: 4.2%
  Freshness Alerts: 2

[Map View]
  - Interactive map with store pins
  - Color-coded: Green (good), Yellow (warnings), Red (critical alerts)
  - Click pin → store details popup

[Recent Alerts]
  🔴 Out of Stock - REWE Hauptstraße - Product A - 2 hours ago
  🟡 Expiry Warning - EDEKA Center - Product B expires in 3 days
  🟢 Compliance Issue - Shelf placement incorrect at Kaufland

[Photo Feed]
  Grid of recent shelf photos with thumbnails
  Click to view full resolution + metadata
```

**View 2: Store Detail View**
```
Store: REWE, Hauptstraße 123, Munich

[Last Audit: 4 hours ago by Student_ID_789]

Product Availability:
  ✅ Product A - In Stock (shelf 80% full)
  ❌ Product B - Out of Stock
  ✅ Product C - In Stock (shelf 60% full)

Freshness Status:
  ⚠️ Product A - 2 units expiring in 5 days
  ✅ Product C - All units fresh (>14 days)

Shelf Photos:
  [Photo Gallery with before/after comparisons]

Competitor Presence:
  - Competitor X: Visible in 3 photos
  - Competitor Y: Not detected

Actions:
  [Schedule Re-audit] [Contact Store Manager] [Export Report]
```

**View 3: Analytics & Trends**
```
[Time Period Selector: Last 7 Days | Last 30 Days | Custom]

Stock Level Trends (Line Chart):
  - Product A stock levels over time across all stores
  - Identify patterns (weekday vs weekend stockouts)

Store Rankings (Table):
  Store Name | Compliance Score | Out-of-Stock Rate | Last Audit
  REWE Hbf   | 94%              | 2.1%              | 2h ago
  EDEKA City | 88%              | 5.3%              | 1d ago
  ...

Geographic Heatmap:
  - Which regions have best/worst execution
  - Overlay with sales data (if integrated)
```

**Technical Stack:**
- **Framework:** React with TypeScript
- **Charting:** Chart.js or Recharts
- **Maps:** Mapbox or Google Maps API
- **UI Components:** Material-UI or Ant Design
- **State Management:** React Query for server state
- **Deployment:** Vercel or Netlify (simple hosting)

---

### Data Flow Diagram

```
[Student Mobile App]
      |
      | 1. Student accepts task & visits store
      |
      v
[Camera + GPS Capture]
      |
      | 2. Photo + GPS + Timestamp sent to backend
      |
      v
[FastAPI Backend]
      |
      |---> [Quality Check Service] (GPS validation, photo quality)
      |---> [AI Analysis Service] (OCR, product detection)
      |---> [Fraud Detection] (student reliability check)
      |
      | 3. Approved submissions stored
      |
      v
[PostgreSQL Database]
      |
      | 4. Brand requests dashboard data
      |
      v
[Dashboard API]
      |
      | 5. Aggregated insights returned
      |
      v
[Brand React Dashboard]
```

---

### MVP Database Schema

**Tables (PostgreSQL):**

```sql
-- Brands (CPG companies)
CREATE TABLE brands (
    id UUID PRIMARY KEY,
    name VARCHAR(255),
    contact_email VARCHAR(255),
    subscription_tier VARCHAR(50),  -- basic, premium
    created_at TIMESTAMP
);

-- Stores
CREATE TABLE stores (
    id UUID PRIMARY KEY,
    brand_id UUID REFERENCES brands(id),
    name VARCHAR(255),
    address TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMP
);

-- Products
CREATE TABLE products (
    id UUID PRIMARY KEY,
    brand_id UUID REFERENCES brands(id),
    name VARCHAR(255),
    sku VARCHAR(100),
    category VARCHAR(100),
    image_url TEXT
);

-- Tasks
CREATE TABLE tasks (
    id UUID PRIMARY KEY,
    brand_id UUID REFERENCES brands(id),
    store_id UUID REFERENCES stores(id),
    products_to_check JSONB,  -- ["product_id_1", "product_id_2"]
    questionnaire JSONB,  -- Dynamic questions
    payout DECIMAL(5, 2),
    status VARCHAR(50),  -- open, assigned, completed, verified
    deadline TIMESTAMP,
    created_at TIMESTAMP
);

-- Students
CREATE TABLE students (
    id UUID PRIMARY KEY,
    email VARCHAR(255),
    name VARCHAR(255),
    quality_score DECIMAL(3, 2),  -- 0.00 to 1.00
    total_tasks_completed INTEGER DEFAULT 0,
    total_earned DECIMAL(8, 2) DEFAULT 0,
    created_at TIMESTAMP
);

-- Submissions
CREATE TABLE submissions (
    id UUID PRIMARY KEY,
    task_id UUID REFERENCES tasks(id),
    student_id UUID REFERENCES students(id),
    photos JSONB,  -- Array of S3 URLs
    gps_latitude DECIMAL(10, 8),
    gps_longitude DECIMAL(11, 8),
    submitted_at TIMESTAMP,
    questionnaire_responses JSONB,
    ai_analysis_results JSONB,
    quality_score DECIMAL(3, 2),
    approval_status VARCHAR(50),  -- pending, approved, rejected
    approved_at TIMESTAMP,
    payout_amount DECIMAL(5, 2)
);

-- Alerts (for brands)
CREATE TABLE alerts (
    id UUID PRIMARY KEY,
    brand_id UUID REFERENCES brands(id),
    store_id UUID REFERENCES stores(id),
    product_id UUID REFERENCES products(id),
    alert_type VARCHAR(100),  -- out_of_stock, expiry_warning, compliance_issue
    severity VARCHAR(50),  -- low, medium, high, critical
    message TEXT,
    created_at TIMESTAMP,
    resolved_at TIMESTAMP
);
```

---

## Part 3: 12-Week Development Timeline

### Phase 1: Foundation (Weeks 1-2)

**Week 1: Validation & Setup**
- [ ] Monday-Tuesday: Conduct 5 CPG brand interviews
- [ ] Wednesday-Thursday: Conduct 10 student interviews
- [ ] Friday: Compile validation report, make GO/NO-GO decision
- [ ] Weekend: Setup development environment
  - Install Node.js, Python, PostgreSQL
  - Create GitHub repository
  - Setup project structure (mobile app, backend, dashboard)

**Week 2: Core Backend Infrastructure**
- [ ] Design database schema (finalize tables)
- [ ] Setup FastAPI project with authentication (JWT)
- [ ] Create database models (SQLAlchemy ORM)
- [ ] Build basic REST API endpoints:
  - POST /api/tasks/create
  - GET /api/tasks/available
  - POST /api/tasks/submit
- [ ] Setup PostgreSQL database locally
- [ ] Write API tests (pytest)

**Deliverable:** Working backend API that can create and retrieve tasks

---

### Phase 2: Mobile App MVP (Weeks 3-5)

**Week 3: Mobile App Foundation**
- [ ] Initialize React Native project
- [ ] Setup navigation (React Navigation)
- [ ] Create authentication screens (login/signup)
- [ ] Implement camera integration
- [ ] Test GPS location services
- [ ] Build task list screen (fetch from backend API)

**Week 4: Task Execution Flow**
- [ ] Build guided photo capture workflow
  - GPS check-in
  - Photo capture with preview
  - Basic photo quality feedback (client-side)
- [ ] Create questionnaire form (dynamic from task data)
- [ ] Implement photo upload to backend
- [ ] Build submission confirmation screen
- [ ] Test end-to-end: accept task → capture → submit

**Week 5: Student Experience Polish**
- [ ] Create earnings/profile screen
- [ ] Implement task history view
- [ ] Add success/error handling for submissions
- [ ] Basic gamification (show earnings, streak)
- [ ] Test on Android and iOS devices
- [ ] Fix critical bugs from user testing

**Deliverable:** Functional mobile app where students can accept tasks, take photos, and submit

---

### Phase 3: AI & Quality Control (Weeks 6-7)

**Week 6: Image Analysis Pipeline**
- [ ] Integrate Tesseract OCR for text extraction
- [ ] Build expiry date parser (DD.MM.YYYY, MM/YY formats)
- [ ] Build price parser (€X.XX formats)
- [ ] Integrate basic object detection (Hugging Face pre-trained model)
- [ ] Test AI accuracy with sample shelf photos
- [ ] Create AI analysis results JSON schema

**Week 7: Quality Control System**
- [ ] Implement GPS verification (within 100m of store)
- [ ] Build timestamp validation logic
- [ ] Create photo metadata checker (EXIF data)
- [ ] Implement student quality scoring algorithm
- [ ] Build manual review interface (for rejected submissions)
- [ ] Test fraud detection with simulated bad submissions

**Deliverable:** AI pipeline that analyzes photos and flags quality issues

---

### Phase 4: Brand Dashboard (Weeks 8-9)

**Week 8: Dashboard Foundation**
- [ ] Initialize React dashboard project
- [ ] Setup authentication for brands
- [ ] Build overview dashboard with KPI cards
- [ ] Create store list view
- [ ] Implement photo gallery view
- [ ] Connect to backend API (fetch tasks, submissions, alerts)

**Week 9: Analytics & Store Details**
- [ ] Build store detail page with product status
- [ ] Create stock level trend charts (Chart.js)
- [ ] Implement interactive map view (Mapbox)
- [ ] Build alert notification system
- [ ] Add export to PDF/Excel functionality
- [ ] Test with sample data from 2-3 pilot stores

**Deliverable:** Brand dashboard showing real-time store execution data

---

### Phase 5: Pilot & Iteration (Weeks 10-11)

**Week 10: Pilot Launch**
- [ ] Recruit 1 CPG brand for pilot (offer free trial)
- [ ] Recruit 10 students as auditors
- [ ] Setup 10-20 stores for monitoring
- [ ] Launch pilot: students complete 50-100 tasks
- [ ] Monitor submissions daily
- [ ] Collect feedback from brand and students

**Week 11: Iteration & Bug Fixes**
- [ ] Fix critical bugs discovered in pilot
- [ ] Improve AI accuracy based on real photos
- [ ] Enhance UX based on student feedback
- [ ] Add missing features requested by brand
- [ ] Optimize performance (image upload speed, API response times)
- [ ] Prepare final presentation materials

**Deliverable:** Validated MVP with real pilot data

---

### Phase 6: Presentation & Demo (Week 12)

**Week 12: Final Presentation Prep**
- [ ] Compile pilot results:
  - Total tasks completed
  - Number of out-of-stock alerts generated
  - Student earnings (total & per hour)
  - Brand feedback quotes
  - AI accuracy metrics
- [ ] Create presentation slides
- [ ] Prepare live demo video (in case of technical issues)
- [ ] Write final project report
- [ ] Practice presentation with team
- [ ] **Friday:** Present to professors

**Deliverable:** Polished presentation with real-world pilot results

---

### Team Member Responsibilities (Aligned to Skills)

**Ron (Business Information Systems, GenAI):**
- AI image analysis pipeline (Week 6)
- GenAI integration planning (future roadmap)
- Business model validation with CPG brands

**Salma (Logistics & Supply Chain):**
- Supply chain interviews (understand CPG retail execution pain points)
- Logistics optimization strategy (task assignment algorithm)
- Store coverage planning

**Nico (Business Informatics, AI use cases):**
- Backend API development (FastAPI)
- Database schema design
- AI model integration and testing

**Chaimae (Marketing, Community):**
- Student recruitment for pilot
- Brand outreach and pilot negotiations
- Social media presence for student acquisition

**Steffi (Industrial Engineering, Strategic PM):**
- Project timeline management (sprint planning)
- Go-to-market strategy
- Investor pitch preparation

**Jiayi (SAP S/4HANA, Python, Process Optimization):**
- Backend development (Python/FastAPI)
- Database management (PostgreSQL)
- SAP integration planning (future enterprise tier)

---

## Part 4: Risk Mitigation

### Technical Risks

**Risk 1: AI accuracy too low (products not detected, OCR fails)**
- **Mitigation:** Start with manual verification in MVP, AI assists human review
- **Fallback:** Students answer structured questions instead of relying on AI analysis
- **Timeline:** If AI not ready by Week 7, defer to post-MVP enhancement

**Risk 2: Photo upload performance (large file sizes, slow networks)**
- **Mitigation:** Client-side image compression before upload
- **Technical:** Resize to max 1080px, compress to 80% quality (React Native Image Resizer)
- **Fallback:** Progressive upload (upload in background, show immediate confirmation)

**Risk 3: GPS spoofing (students fake location)**
- **Mitigation:** Require photo metadata (EXIF GPS), cross-check with device GPS
- **Detection:** Flag submissions where EXIF GPS doesn't match reported GPS
- **Escalation:** Manual review for flagged submissions, ban repeat offenders

---

### Business Risks

**Risk 4: CPG brands don't see value after pilot**
- **Mitigation:** Weekly check-ins during pilot, iterate based on feedback
- **Success Metrics:** Generate at least 5 actionable insights (out-of-stocks, expiry alerts)
- **Fallback:** Offer extended free trial until value demonstrated

**Risk 5: Students don't complete tasks (low retention)**
- **Mitigation:** Ensure competitive pay (€5-€8 = €20-€48/hour effective)
- **Engagement:** Gamification (streaks, bonuses for quality), quick payouts
- **Fallback:** Increase payout if retention <60% after first week

**Risk 6: Sample bias (only certain stores/times covered)**
- **Mitigation:** Offer bonus for off-peak hours and distant stores
- **Scheduling:** Allow brands to request specific days/times
- **Fallback:** Combine with field merchandisers for critical coverage gaps

---

### Regulatory Risks

**Risk 7: GDPR compliance (storing student data, photos of stores)**
- **Mitigation:**
  - Explicit consent from students (data processing agreement)
  - Anonymize student data for brands (show only "Auditor ID")
  - Don't photograph store employees (focus on products/shelves)
  - Data retention policy (delete photos after 90 days)
- **Legal Review:** Consult university legal department before pilot

**Risk 8: Store policies against photography**
- **Mitigation:** Students check discretely, use phone naturally (not obvious photography)
- **Communication:** Brands can notify stores in advance ("we're monitoring our products")
- **Fallback:** Focus on stores that explicitly allow (partner with retail chains)

---

## Part 5: SDG Justification for Professors

### SDG 12.3 Alignment - Food Waste Reduction

**How Retail Execution Intelligence Addresses SDG 12.3:**

**Target 12.3:**
"By 2030, halve per capita global food waste at the retail and consumer levels and reduce food losses along production and supply chains, including post-harvest losses"

**Source:** [UN SDG 12.3](https://sdgs.un.org/goals/goal12)

---

### The SDG Connection Explained

**1. Better Inventory Management → Reduces Waste**

**Problem:**
- Overstocking leads to spoilage (products expire before sale)
- Understocking leads to lost sales but also encourages over-ordering as compensation
- Poor rotation (FIFO not followed) causes older products to expire

**Our Solution:**
Real-time visibility into shelf stock levels helps retailers:
- Order optimal quantities (reducing overstocking)
- Identify slow-moving products before expiry
- Reduce safety stock (over-ordering buffer)

**Evidence:**
"Better inventory management can reduce food waste by up to 30% in retail environments"
**Source:** [UNEP Food Waste Index Report 2024](https://wedocs.unep.org/handle/20.500.11822/45230)

---

**2. Expiry Date Monitoring → Prevents Food Waste**

**Problem:**
- Products near expiry often not noticed until too late
- No systematic tracking of product freshness across locations
- Retailers miss opportunity to discount and sell near-expiry items

**Our Solution:**
AI-powered OCR detects expiry dates in shelf photos, alerting retailers when:
- Products have <7 days until expiry (time to discount/promote)
- Products are already expired (immediate removal needed)
- Expiry date distribution is poor (older products hidden behind newer ones)

**Retailer Action:**
- Discount products 3-5 days before expiry (move inventory)
- Donate near-expiry products to food banks
- Adjust ordering to account for shelf life

**Evidence:**
"Dynamic pricing based on expiry dates can reduce food waste by 20-40%"
**Source:** [Too Good To Go - Food Waste Impact Report](https://www.toogoodtogo.com/en/impact)

---

**3. FIFO Rotation Verification → Ensures Freshness**

**Problem:**
- Store staff don't always rotate stock properly
- Older products pushed to back, newer in front (LIFO = Last In First Out)
- Result: Older products expire while newer products sell

**Our Solution:**
Photo verification of shelf organization:
- Check if older expiry dates are at front
- Flag stores with poor rotation practices
- Train store staff on proper rotation

**Evidence:**
"Proper FIFO implementation reduces retail food waste by 15-25%"
**Source:** [Retail Food Waste Action Guide](https://www.wrap.org.uk/resources/guide/retail-food-waste-action-guide)

---

### For Your Professors: The Academic Pitch

**Slide for Presentation:**

---

**SDG 12.3 - Responsible Consumption and Production**

**Target:** "Halve per capita global food waste at retail and consumer levels by 2030"

**Our Contribution:**

We enable CPG brands and retailers to reduce food waste through three mechanisms:

1. **Optimized Inventory Management**
   - Real-time stock visibility prevents overstocking (30% waste reduction potential)
   - Data-driven ordering reduces safety stock buffers

2. **Proactive Expiry Management**
   - AI-powered expiry date detection alerts retailers 3-7 days in advance
   - Enables dynamic pricing, donations, and targeted promotions (20-40% waste reduction)

3. **FIFO Rotation Compliance**
   - Photo verification ensures older products sell first
   - Training feedback loop improves store practices (15-25% waste reduction)

**Academic Evidence:**
- UNEP Food Waste Index Report 2024: Better inventory management reduces waste by up to 30%
- Too Good To Go Impact Report: Dynamic expiry pricing reduces waste by 20-40%
- WRAP Retail Guide: Proper FIFO reduces waste by 15-25%

**Our Pilot Goal:**
Measure food waste reduction at 10-20 pilot stores over 3 months, targeting 10-15% reduction in perishable product waste.

---

**Why This SDG Connection is Defensible (Not SDG Washing):**

✅ **Specific Target:** We cite SDG Target 12.3 (not just vague "SDG 12")

✅ **Measurable Indicator:** We can measure Indicator 12.3.1(b) - Food Waste Index at retail level

✅ **Evidence-Based:** Academic research supports our mechanisms (UNEP, WRAP, Too Good To Go)

✅ **Direct Contribution:** Our data enables retailers to take waste-reducing actions

✅ **Honest Limitations:** We acknowledge we're a TOOL that enables waste reduction, not solving all food waste ourselves

✅ **Pilot Measurement:** We will measure actual waste reduction in pilot stores (not just claims)

---

### Alternative SDG Angle (If Needed)

If professors question SDG 12.3 connection, you can also claim:

**SDG 12.6 - Corporate Sustainability Reporting**

**Target 12.6:**
"Encourage companies to adopt sustainable practices and integrate sustainability information into their reporting cycle"

**Our Contribution:**
- We provide retailers/CPG brands with verified sustainability data (food waste metrics)
- Photo-documented audit trail supports ESG reporting
- Real-time measurement enables tracking of waste reduction progress

This is weaker than SDG 12.3 but still defensible. Recommend leading with 12.3.

---

## Part 6: Success Metrics & Pilot KPIs

### MVP Success Criteria (End of Week 12)

**Technical Success:**
- [ ] Mobile app: 90% task completion rate (students finish tasks they start)
- [ ] Backend: <2 second API response time for task fetching
- [ ] AI: >70% accuracy on expiry date OCR detection
- [ ] Dashboard: 95% uptime during pilot period

**Business Success:**
- [ ] 1 CPG brand actively using platform in pilot
- [ ] 10-20 stores monitored
- [ ] 50-100 tasks completed
- [ ] 10+ students as active auditors
- [ ] 80%+ student retention after first week

**Impact Success (SDG Validation):**
- [ ] Generate 5+ actionable food waste insights (near-expiry alerts, rotation issues)
- [ ] Document 1-2 examples where brand took action (discounted products, changed ordering)
- [ ] Brand feedback: "We can see how this reduces waste" (qualitative validation)

**Academic Success:**
- [ ] Professors accept SDG 12.3 justification
- [ ] Project receives passing grade (or better)
- [ ] Team can articulate technical architecture and business model clearly

---

## Final Checklist Before Launch

**Legal & Compliance:**
- [ ] GDPR consent forms for students
- [ ] Data processing agreement template
- [ ] Store photography policy guidelines
- [ ] Brand service agreement (pilot terms)

**Technical Readiness:**
- [ ] Backend deployed and accessible (Heroku, DigitalOcean, or AWS)
- [ ] Database backups configured
- [ ] Mobile app built for iOS and Android (TestFlight / Google Play Internal Testing)
- [ ] Error tracking setup (Sentry or similar)

**Go-to-Market:**
- [ ] 1 CPG brand confirmed for pilot
- [ ] 10 students recruited and onboarded
- [ ] 10-20 stores mapped in database
- [ ] Tasks created for first week
- [ ] Communication plan (student onboarding email, brand check-ins)

**Presentation Materials:**
- [ ] Slide deck with problem, solution, SDG alignment, tech architecture, pilot results
- [ ] Live demo video (2-3 minutes)
- [ ] Code repository organized and documented (GitHub)
- [ ] Business model canvas
- [ ] 12-month roadmap (post-MVP vision)

---

## Conclusion: Why This Will Work

**Team Strengths Alignment:**
- ✅ Ron & Nico: AI/GenAI skills → Image analysis pipeline
- ✅ Jiayi: Python, SAP, process optimization → Backend development
- ✅ Salma: Supply chain expertise → Retail execution domain knowledge
- ✅ Chaimae: Marketing → Student recruitment, brand partnerships
- ✅ Steffi: Strategic PM → Timeline management, go-to-market

**Market Validation:**
- ✅ Proven market: Image recognition in CPG growing from $1.4B → $3.7B (2020-2025)
- ✅ Existing players validate demand (ParallelDots, Pepperi, GoSpotCheck)
- ✅ Underserved segment: SME CPG brands can't afford enterprise solutions

**SDG Alignment:**
- ✅ Defensible SDG 12.3 connection (food waste reduction)
- ✅ Evidence-based mechanisms (inventory, expiry, rotation)
- ✅ Measurable impact (can quantify waste reduction in pilot)

**Technical Feasibility:**
- ✅ Buildable in 12 weeks with existing tech stack
- ✅ No novel research needed (pre-trained AI models available)
- ✅ Clear MVP scope (manual fallbacks if AI not ready)

**You have everything you need to validate and build this in one semester. Start with customer interviews next week.**

---

**Next Action:** Schedule 5 CPG brand interviews using the script in Part 1.

Good luck! 🚀
