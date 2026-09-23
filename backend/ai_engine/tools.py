"""Tool registry — every AI tool in the suite, defined once.

Each tool declares its input schema (rendered as a form in the UI), a
default system prompt and user template. DB PromptTemplate rows override
these defaults, so staff can tune assistants without a redeploy.

Categories:
  - general: available to every subscriber regardless of role
  - role tools: namespaced to a user's role workspace
"""

COMMON_STYLE = (
    "You write in clear, professional Nigerian business English — formal where "
    "required, never verbose or robotic. Use correct Nigerian conventions for "
    "names, titles (Mr, Mrs, Dr, Engr, Prof, Chief, Barr, Hon), dates "
    "(e.g. 23rd September, 2026), currency (₦/Naira), and institutions. "
    "Output clean, ready-to-use text with appropriate structure and spacing. "
    "Do not include explanations of what you did — just the deliverable, "
    "unless the task explicitly asks for feedback or critique."
)

ROLES = (
    "general", "civil_servant", "teacher", "student",
    "business_owner", "gospel_minister", "lecturer",
)

F = lambda name, label, **kw: {"name": name, "label": label, **kw}


def text(name, label, placeholder="", required=True, **kw):
    return F(name, label, type="text", placeholder=placeholder, required=required, **kw)


def textarea(name, label, placeholder="", required=True, **kw):
    return F(name, label, type="textarea", placeholder=placeholder, required=required, **kw)


def select(name, label, options, required=True, **kw):
    return F(name, label, type="select", options=options, required=required, **kw)


TOOL_DEFINITIONS = [
    # ------------------------------------------------------------------
    # GENERAL TOOLS — every subscriber
    # ------------------------------------------------------------------
    {
        "key": "email_assistant",
        "name": "Email Assistant",
        "category": "general",
        "icon": "mail",
        "description": "Compose new emails or draft replies — formal, friendly, or persuasive.",
        "system": COMMON_STYLE + " You are an expert professional email writer.",
        "template": (
            "Task: {mode}\n"
            "Tone: {tone}\n"
            "Sender name/sign-off: {sender}\n"
            "Recipient: {recipient}\n"
            "Subject or purpose: {purpose}\n"
            "Incoming email being replied to (if a reply):\n{incoming}\n"
            "Key points to include:\n{points}\n\n"
            "Write the complete email including a fitting subject line."
        ),
        "fields": [
            select("mode", "What do you need?", ["compose a new email", "reply to an email"]),
            select("tone", "Tone", ["formal / official", "friendly", "persuasive"]),
            text("sender", "Your name / sign-off", "e.g. Amina Bello, HOD Accounts", required=False),
            text("recipient", "Recipient", "e.g. The Permanent Secretary, Ministry of Finance"),
            text("purpose", "Subject / purpose", "e.g. Request for deployment letter"),
            textarea("incoming", "Incoming email (for replies)", "Paste the email you're replying to", required=False),
            textarea("points", "Key points to include", "One point per line"),
        ],
    },
    {
        "key": "whatsapp_assistant",
        "name": "WhatsApp Assistant",
        "category": "general",
        "icon": "message-circle",
        "description": "Draft WhatsApp messages — personal, business broadcasts, customer replies.",
        "system": COMMON_STYLE + (
            " You write WhatsApp messages: concise, warm, correctly formatted "
            "for chat (short paragraphs, line breaks, sparing emoji where "
            "appropriate, *bold* for emphasis using WhatsApp markup)."
        ),
        "template": (
            "Message type: {msg_type}\n"
            "Audience: {audience}\n"
            "Tone: {tone}\n"
            "What the message should say/do:\n{brief}\n\n"
            "Write the WhatsApp message(s), formatted for chat."
        ),
        "fields": [
            select("msg_type", "Message type", [
                "personal message", "business broadcast", "customer-service reply",
                "event invitation", "announcement",
            ]),
            text("audience", "Who is it for?", "e.g. customers of my thrift store"),
            select("tone", "Tone", ["warm & friendly", "professional", "urgent", "celebratory"]),
            textarea("brief", "What should it say?", "Describe the message content"),
        ],
        "future_note": "Direct WhatsApp Business API sending is planned for Pro/Business tiers.",
    },
    {
        "key": "cv_builder",
        "name": "CV Builder",
        "category": "general",
        "icon": "file-text",
        "description": "Generate a polished CV from your raw work history — Nigerian formats supported.",
        "system": COMMON_STYLE + (
            " You are an expert CV writer familiar with Nigerian and "
            "international conventions: civil-service CVs, academic CVs with "
            "publications, private-sector CVs, and entry-level formats. "
            "Produce complete, well-structured CVs in clean text format ready "
            "to paste into Word. Never invent qualifications the user did not "
            "provide; write what is given in its strongest honest form."
        ),
        "template": (
            "CV format: {format}\n"
            "Full name: {name}\n"
            "Contact details: {contact}\n"
            "Career objective/headline (optional): {objective}\n"
            "Education:\n{education}\n\n"
            "Work history:\n{experience}\n\n"
            "Skills:\n{skills}\n\n"
            "Certifications / publications / extras:\n{extras}\n\n"
            "Produce a complete {format} CV. If information is missing, "
            "structure the CV around what is provided rather than inventing "
            "details."
        ),
        "fields": [
            select("format", "CV format", [
                "Nigerian civil service", "academic (with publications)",
                "corporate / private sector", "entry level (no experience)",
            ]),
            text("name", "Full name"),
            text("contact", "Contact details", "phone, email, city"),
            textarea("objective", "Career objective (optional)", required=False),
            textarea("education", "Education", "Degree, institution, year — one per line"),
            textarea("experience", "Work history", "Role, employer, dates, key duties — per job", required=False),
            textarea("skills", "Skills", required=False),
            textarea("extras", "Certifications / publications / awards", required=False),
        ],
    },
    {
        "key": "cv_reviewer",
        "name": "CV Reviewer",
        "category": "general",
        "icon": "search",
        "description": "Paste your existing CV and get an expert critique with concrete fixes.",
        "system": COMMON_STYLE + (
            " You are a senior recruiter and CV reviewer. Give honest, "
            "specific, actionable feedback: structure, content gaps, weak "
            "phrasing, formatting advice, and a scored assessment. Be direct "
            "but constructive."
        ),
        "template": (
            "Target role/sector: {target}\n"
            "CV format expected: {format}\n\n"
            "The CV to review:\n{cv}\n\n"
            "Provide: (1) overall score out of 10 with justification, "
            "(2) what works, (3) specific problems and fixes, "
            "(4) a rewritten weak section as an example, "
            "(5) a prioritized improvement checklist."
        ),
        "fields": [
            text("target", "Target role / sector", "e.g. Admin Officer in a ministry"),
            select("format", "Expected format", [
                "Nigerian civil service", "academic", "corporate / private sector", "entry level",
            ]),
            textarea("cv", "Your current CV", "Paste the full text of your CV"),
        ],
    },
    {
        "key": "cover_letter",
        "name": "Cover Letter Generator",
        "category": "general",
        "icon": "edit-3",
        "description": "A tailored cover letter that matches your CV to the role.",
        "system": COMMON_STYLE + " You write compelling, specific cover letters — never generic.",
        "template": (
            "Role applied for: {role}\n"
            "Organisation: {organisation}\n"
            "Applicant name: {name}\n"
            "Relevant experience/highlights:\n{highlights}\n"
            "Job advert text (optional):\n{advert}\n\n"
            "Write a complete, ready-to-send cover letter."
        ),
        "fields": [
            text("role", "Role applied for"),
            text("organisation", "Organisation"),
            text("name", "Your full name"),
            textarea("highlights", "Your relevant highlights", "2–4 strongest points"),
            textarea("advert", "Job advert text (optional)", "Paste the advert for a tighter match", required=False),
        ],
    },

    # ------------------------------------------------------------------
    # CIVIL SERVANTS
    # ------------------------------------------------------------------
    {
        "key": "memo_writer",
        "name": "Official Memo Writer",
        "category": "role",
        "roles": ["civil_servant"],
        "icon": "clipboard",
        "description": "Draft official internal memos in proper civil-service format.",
        "system": COMMON_STYLE + (
            " You are an expert in Nigerian civil-service correspondence. "
            "Memos use proper structure: reference number placeholder, "
            "ministry/department header lines, TO/FROM/DATE/SUBJECT block "
            "where appropriate, numbered paragraphs, and formal closing "
            "conventions."
        ),
        "template": (
            "From (your name, rank, department): {sender}\n"
            "To: {recipient}\n"
            "Subject: {subject}\n"
            "Purpose and key facts:\n{details}\n"
            "Action requested: {action}\n\n"
            "Draft the complete official memo with reference-number "
            "placeholder and proper formatting."
        ),
        "fields": [
            text("sender", "From (name, rank, dept)", "e.g. A. Ibrahim, SAO, Planning Dept"),
            text("recipient", "To", "e.g. The Permanent Secretary"),
            text("subject", "Subject"),
            textarea("details", "Facts / background"),
            textarea("action", "Action requested", required=False),
        ],
    },
    {
        "key": "promotion_letter",
        "name": "Promotion Request Letter",
        "category": "role",
        "roles": ["civil_servant"],
        "icon": "trending-up",
        "description": "Formal letters requesting promotion or upgrade, with service records framed.",
        "system": COMMON_STYLE + (
            " You draft Nigerian civil-service promotion request letters: "
            "respectful, precise, citing service records, exams passed, and "
            "eligibility under public service rules."
        ),
        "template": (
            "Your name, rank, grade level: {sender}\n"
            "Ministry/department: {department}\n"
            "Promotion sought (grade level / position): {sought}\n"
            "Service record & justification:\n{record}\n"
            "Addressed to: {recipient}\n\n"
            "Draft the complete formal letter with address block, date "
            "placeholder, and proper salutation/closing."
        ),
        "fields": [
            text("sender", "Name, rank, grade level"),
            text("department", "Ministry / department"),
            text("sought", "Promotion sought"),
            textarea("record", "Service record & justification", "Years served, exams, achievements"),
            text("recipient", "Addressed to", "e.g. The Chairman, Civil Service Commission"),
        ],
    },
    {
        "key": "circular_summarizer",
        "name": "Circular / Policy Summarizer",
        "category": "role",
        "roles": ["civil_servant"],
        "icon": "file-minus",
        "description": "Turn long circulars and policy documents into clear actionable summaries.",
        "system": COMMON_STYLE + (
            " You summarize Nigerian government circulars and policy documents "
            "precisely: what it says, who it affects, deadlines, required "
            "actions. Never add facts not in the source."
        ),
        "template": (
            "Document type: {doc_type}\n"
            "Your role/department (for relevance): {role_context}\n\n"
            "Document text:\n{document}\n\n"
            "Provide: (1) 2–3 sentence summary, (2) key provisions as bullets, "
            "(3) deadlines/dates mentioned, (4) actions required and by whom."
        ),
        "fields": [
            select("doc_type", "Document type", ["circular", "policy document", "memo", "regulation", "other"]),
            text("role_context", "Your department/role", required=False),
            textarea("document", "Paste the document text"),
        ],
    },

    # ------------------------------------------------------------------
    # TEACHERS
    # ------------------------------------------------------------------
    {
        "key": "lesson_plan",
        "name": "Lesson Plan Generator",
        "category": "role",
        "roles": ["teacher"],
        "icon": "book-open",
        "description": "Complete lesson plans aligned to the Nigerian curriculum (NERDC/WAEC).",
        "system": COMMON_STYLE + (
            " You are an expert Nigerian educator producing lesson plans in the "
            "standard format: theme/topic, class, duration, instructional "
            "objectives, materials, previous knowledge, introduction, "
            "presentation steps, evaluation, assignment. Aligned with NERDC "
            "curriculum and WAEC/NECO expectations."
        ),
        "template": (
            "Subject: {subject}\nClass level: {level}\nTopic: {topic}\n"
            "Duration: {duration}\nSpecial notes: {notes}\n\n"
            "Produce a complete, classroom-ready lesson plan."
        ),
        "fields": [
            text("subject", "Subject", "e.g. Mathematics"),
            text("level", "Class level", "e.g. SS2, JSS1, Primary 5"),
            text("topic", "Topic", "e.g. Quadratic equations"),
            text("duration", "Duration", "e.g. 40 minutes (double period)", required=False),
            textarea("notes", "Special notes (optional)", required=False),
        ],
    },
    {
        "key": "scheme_of_work",
        "name": "Scheme of Work Assistant",
        "category": "role",
        "roles": ["teacher"],
        "icon": "calendar",
        "description": "Term schemes of work broken into weekly topics and activities.",
        "system": COMMON_STYLE + (
            " You produce Nigerian school schemes of work: weekly breakdown "
            "(usually 12–13 weeks/term), topics, content, activities, "
            "instructional materials, and evaluation — matching the NERDC "
            "curriculum for the stated class and subject."
        ),
        "template": (
            "Subject: {subject}\nClass level: {level}\nTerm: {term}\n"
            "Weeks available: {weeks}\nNotes: {notes}\n\n"
            "Produce the full scheme of work as a weekly table."
        ),
        "fields": [
            text("subject", "Subject"),
            text("level", "Class level", "e.g. JSS2"),
            select("term", "Term", ["First term", "Second term", "Third term"]),
            text("weeks", "Weeks", "e.g. 12", required=False),
            textarea("notes", "Notes (optional)", required=False),
        ],
    },
    {
        "key": "report_comments",
        "name": "Report Card Comments",
        "category": "role",
        "roles": ["teacher"],
        "icon": "message-square",
        "description": "Professional, personalised term report comments for each student.",
        "system": COMMON_STYLE + (
            " You write Nigerian school report-card comments: professional, "
            "specific, balanced (strength + area to improve), appropriate for "
            "the stated performance level. Never generic filler."
        ),
        "template": (
            "Class level: {level}\n"
            "Number of comments needed: {count}\n"
            "Performance profile(s) — describe the student(s):\n{profiles}\n"
            "Tone: {tone}\n\n"
            "Write the comment(s). If multiple profiles were given, produce "
            "one labelled comment per student."
        ),
        "fields": [
            text("level", "Class level", "e.g. Primary 4, JSS3"),
            text("count", "How many comments", "e.g. 3"),
            textarea("profiles", "Student profile(s)", "e.g. 'Amina: excellent in maths, weak in English, talkative' — one per line"),
            select("tone", "Tone", ["encouraging", "formal", "firm but kind"]),
        ],
    },
    {
        "key": "exam_questions",
        "name": "Exam / Test Question Generator",
        "category": "role",
        "roles": ["teacher"],
        "icon": "help-circle",
        "description": "Objective, theory, and mixed question sets with marking guides.",
        "system": COMMON_STYLE + (
            " You set exam/test questions for Nigerian schools: clear, "
            "unambiguous, curriculum-appropriate, with a full marking guide / "
            "answer key. Objective questions have one correct answer and "
            "plausible distractors."
        ),
        "template": (
            "Subject: {subject}\nClass level: {level}\nTopic(s): {topics}\n"
            "Question types: {qtypes}\nNumber of questions: {count}\n"
            "Difficulty: {difficulty}\n\n"
            "Produce the question paper section plus a marking guide/answers."
        ),
        "fields": [
            text("subject", "Subject"),
            text("level", "Class level", "e.g. SS1"),
            text("topics", "Topic(s)", "e.g. Photosynthesis; food chains"),
            select("qtypes", "Question type", ["objective (multiple choice)", "theory / essay", "mixed"]),
            text("count", "Number of questions", "e.g. 20"),
            select("difficulty", "Difficulty", ["easy", "standard", "challenging"], required=False),
        ],
    },

    # ------------------------------------------------------------------
    # STUDENTS
    # ------------------------------------------------------------------
    {
        "key": "study_notes",
        "name": "Study Notes Summarizer",
        "category": "role",
        "roles": ["student"],
        "icon": "layers",
        "description": "Condense long notes or textbook text into crisp revision notes.",
        "system": COMMON_STYLE + (
            " You turn raw study material into clear revision notes: key "
            "concepts, definitions, structured bullets, memory aids. Accurate "
            "to the source; flag if the source seems to contain errors."
        ),
        "template": (
            "Subject/course: {subject}\n"
            "Level: {level}\n"
            "Material to summarize:\n{material}\n\n"
            "Produce structured revision notes: headings, bullets, key terms "
            "in bold, and a 5-line 'quick recall' section at the end."
        ),
        "fields": [
            text("subject", "Subject / course"),
            text("level", "Level", "e.g. 200L university, SS3"),
            textarea("material", "Paste your notes / text"),
        ],
    },
    {
        "key": "essay_outline",
        "name": "Essay & Assignment Outliner",
        "category": "role",
        "roles": ["student"],
        "icon": "list",
        "description": "Structure your essays and assignments — outlines, arguments, sources to check.",
        "integrity_notice": (
            "Academic integrity: this tool helps you plan and structure your own "
            "work — it does not write essays for you to submit. Submitting "
            "AI-written work as your own may breach your institution's rules."
        ),
        "system": COMMON_STYLE + (
            " You are a writing tutor, NOT a ghostwriter. You produce detailed "
            "essay/assignment plans: thesis options, structured outline with "
            "argument flow, evidence types needed, counterpoints, and what to "
            "research — but you do not produce submission-ready prose. Coach "
            "the student to write it themselves."
        ),
        "template": (
            "Assignment type: {atype}\n"
            "Topic/question: {topic}\n"
            "Course/level: {level}\n"
            "Length required: {length}\n"
            "Your current ideas (optional): {ideas}\n\n"
            "Produce: (1) 2–3 possible thesis angles, (2) a detailed section "
            "outline with what to argue in each, (3) evidence/examples to "
            "gather, (4) common pitfalls, (5) suggested sources to look for. "
            "Do not write the essay itself."
        ),
        "fields": [
            select("atype", "Assignment type", ["essay", "term paper", "assignment", "report"]),
            textarea("topic", "Topic / question"),
            text("level", "Course / level"),
            text("length", "Required length", "e.g. 1500 words", required=False),
            textarea("ideas", "Your ideas so far (optional)", required=False),
        ],
    },
    {
        "key": "scholarship_letter",
        "name": "Scholarship / Personal Statement",
        "category": "role",
        "roles": ["student"],
        "icon": "award",
        "description": "Compelling scholarship essays and personal statements from your real story.",
        "system": COMMON_STYLE + (
            " You help students write authentic scholarship applications and "
            "personal statements: structured around their real achievements, "
            "aspirations, and financial need where relevant. Persuasive but "
            "honest — never fabricate credentials."
        ),
        "template": (
            "Scholarship/programme: {programme}\n"
            "Your name: {name}\n"
            "Your background & achievements:\n{background}\n"
            "Your goals:\n{goals}\n"
            "Why you deserve it / need:\n{need}\n\n"
            "Write a complete personal statement in first person."
        ),
        "fields": [
            text("programme", "Scholarship / programme name"),
            text("name", "Your name"),
            textarea("background", "Background & achievements"),
            textarea("goals", "Your goals"),
            textarea("need", "Why you deserve it / circumstances", required=False),
        ],
    },
    {
        "key": "study_planner",
        "name": "Study Planner",
        "category": "role",
        "roles": ["student"],
        "icon": "clock",
        "description": "A realistic revision timetable around your exams and commitments.",
        "system": COMMON_STYLE + (
            " You build realistic study timetables: spaced repetition, harder "
            "subjects earlier, breaks, revision blocks before exams. Output a "
            "clear day-by-day schedule."
        ),
        "template": (
            "Subjects/exams: {subjects}\n"
            "Exam date(s): {dates}\n"
            "Hours available per day: {hours}\n"
            "Other commitments: {commitments}\n"
            "Weakest areas: {weak}\n\n"
            "Produce a day-by-day study plan until the exams."
        ),
        "fields": [
            textarea("subjects", "Subjects / exams", "One per line"),
            text("dates", "Exam date(s)", "e.g. WAEC starts 12 May"),
            text("hours", "Hours per day available"),
            textarea("commitments", "Other commitments (optional)", required=False),
            textarea("weak", "Weakest areas (optional)", required=False),
        ],
    },

    # ------------------------------------------------------------------
    # BUSINESS OWNERS
    # ------------------------------------------------------------------
    {
        "key": "business_plan",
        "name": "Business Plan Generator",
        "category": "role",
        "roles": ["business_owner"],
        "icon": "briefcase",
        "description": "Structured business plans for Nigerian markets — banks, grants, investors.",
        "system": COMMON_STYLE + (
            " You write practical business plans suited to the Nigerian market: "
            "executive summary, market analysis, operations, management, "
            "financial projections (in ₦), risks. Realistic about the Nigerian "
            "operating environment."
        ),
        "template": (
            "Business name: {name}\n"
            "Industry & what you do: {idea}\n"
            "Location/target market: {market}\n"
            "Startup capital available: {capital}\n"
            "Purpose of plan: {purpose}\n"
            "Other details: {details}\n\n"
            "Produce a complete business plan with realistic ₦ figures and "
            "clearly stated assumptions where data is unknown."
        ),
        "fields": [
            text("name", "Business name"),
            textarea("idea", "What the business does"),
            text("market", "Location / target market", "e.g. Minna; wholesale to Niger State schools"),
            text("capital", "Startup capital", "e.g. ₦2,000,000", required=False),
            select("purpose", "Plan is for", ["bank loan", "grant application", "investor pitch", "internal roadmap"]),
            textarea("details", "Other details (optional)", required=False),
        ],
    },
    {
        "key": "proposal",
        "name": "Proposal / Pitch Writer",
        "category": "role",
        "roles": ["business_owner"],
        "icon": "send",
        "description": "Winning business proposals and pitch-deck text for clients and investors.",
        "system": COMMON_STYLE + (
            " You write persuasive business proposals and pitch-deck copy: "
            "problem, solution, value proposition, deliverables, pricing "
            "framing, call to action. Sharp and client-focused."
        ),
        "template": (
            "Your business: {business}\n"
            "Client/audience: {audience}\n"
            "What you're proposing: {offer}\n"
            "Their problem you solve: {problem}\n"
            "Pricing/terms (optional): {pricing}\n\n"
            "Write the complete proposal / pitch text."
        ),
        "fields": [
            text("business", "Your business"),
            text("audience", "Client / audience", "e.g. Procurement dept, private investor"),
            textarea("offer", "What you're proposing"),
            textarea("problem", "The problem you solve for them"),
            textarea("pricing", "Pricing / terms (optional)", required=False),
        ],
    },
    {
        "key": "invoice_quote",
        "name": "Invoice / Quotation Drafter",
        "category": "role",
        "roles": ["business_owner"],
        "icon": "file",
        "description": "Professional invoices and quotations with correct ₦ formatting.",
        "system": COMMON_STYLE + (
            " You draft professional Nigerian business invoices and quotations: "
            "itemised lines, subtotals, VAT note where applicable, payment "
            "terms, validity period, bank-details placeholder. Output as a "
            "clean formatted document."
        ),
        "template": (
            "Document type: {doc_type}\n"
            "Your business name & details: {business}\n"
            "Client name & details: {client}\n"
            "Items/services with prices:\n{items}\n"
            "Payment terms: {terms}\n"
            "Notes (validity, delivery, etc.): {notes}\n\n"
            "Produce the complete {doc_type} with an invoice/quote number "
            "placeholder and date."
        ),
        "fields": [
            select("doc_type", "Document", ["quotation", "invoice"]),
            textarea("business", "Your business details", "name, address, phone"),
            textarea("client", "Client details"),
            textarea("items", "Items & prices", "e.g. 'Supply of 50 desks @ ₦45,000' — one per line"),
            textarea("terms", "Payment terms", "e.g. 70% advance, balance on delivery", required=False),
            textarea("notes", "Other notes (optional)", required=False),
        ],
    },
    {
        "key": "marketing_copy",
        "name": "Marketing & Social Captions",
        "category": "role",
        "roles": ["business_owner"],
        "icon": "megaphone",
        "description": "Ad copy, product descriptions, and social captions that convert.",
        "system": COMMON_STYLE + (
            " You write Nigerian-market marketing copy: punchy, benefit-led, "
            "culturally fluent. For social captions, include relevant hashtags "
            "and a clear call to action. Match the requested platform."
        ),
        "template": (
            "Product/service: {product}\n"
            "Target audience: {audience}\n"
            "Platform/medium: {platform}\n"
            "Offer/price/hook: {hook}\n"
            "What to create: {deliverable}\n\n"
            "Write the copy."
        ),
        "fields": [
            text("product", "Product / service"),
            text("audience", "Target audience"),
            select("platform", "Platform", ["Instagram", "Facebook", "WhatsApp status", "Twitter/X", "flyer/poster", "website"]),
            text("hook", "Offer / hook", "e.g. 20% off this week, free delivery in Minna", required=False),
            select("deliverable", "Deliverable", ["single caption", "3 caption options", "ad copy + headline", "product description"]),
        ],
    },

    # ------------------------------------------------------------------
    # GOSPEL MINISTER / PASTOR
    # ------------------------------------------------------------------
    {
        "key": "sermon_outline",
        "name": "Sermon Outline Generator",
        "category": "role",
        "roles": ["gospel_minister"],
        "icon": "book",
        "description": "Structured sermon outlines with scripture, points, illustrations, altar call.",
        "system": COMMON_STYLE + (
            " You assist gospel ministers with sermon preparation: biblical "
            "fidelity first — accurate scripture references, sound "
            "interpretation, clear structure (introduction, points with "
            "supporting scriptures, illustrations, application, altar call). "
            "Respect doctrinal framing the user specifies; default to "
            "mainline evangelical framing if unspecified."
        ),
        "template": (
            "Topic/theme: {topic}\n"
            "Anchor scripture(s): {scripture}\n"
            "Occasion/service type: {occasion}\n"
            "Duration target: {duration}\n"
            "Emphasis/notes: {notes}\n\n"
            "Produce a complete sermon outline: title options, introduction, "
            "3–4 main points each with supporting scriptures, illustration "
            "ideas, application, and closing/altar call."
        ),
        "fields": [
            text("topic", "Topic / theme", "e.g. Faith in difficult seasons"),
            text("scripture", "Anchor scripture(s)", "e.g. Habakkuk 2:1-4", required=False),
            text("occasion", "Occasion", "e.g. Sunday service, youth vigil", required=False),
            text("duration", "Duration", "e.g. 40 minutes", required=False),
            textarea("notes", "Emphasis / notes (optional)", required=False),
        ],
    },
    {
        "key": "bible_study",
        "name": "Bible Study Guide",
        "category": "role",
        "roles": ["gospel_minister"],
        "icon": "book-open",
        "description": "Interactive Bible study guides with discussion questions.",
        "system": COMMON_STYLE + (
            " You prepare Bible study guides for small groups and midweek "
            "services: passage context, verse-by-verse teaching points, "
            "discussion questions, life application, memory verse, closing "
            "prayer points. Accurate and edifying."
        ),
        "template": (
            "Passage/theme: {passage}\n"
            "Audience: {audience}\n"
            "Session length: {length}\n"
            "Focus/notes: {notes}\n\n"
            "Produce the complete study guide."
        ),
        "fields": [
            text("passage", "Passage / theme", "e.g. James 1 — trials & wisdom"),
            text("audience", "Audience", "e.g. adult fellowship, youth class", required=False),
            text("length", "Session length", "e.g. 60 minutes", required=False),
            textarea("notes", "Focus / notes (optional)", required=False),
        ],
    },
    {
        "key": "event_announcement",
        "name": "Event / Programme Announcements",
        "category": "role",
        "roles": ["gospel_minister"],
        "icon": "volume-2",
        "description": "Church programme announcements for service, posters, and WhatsApp.",
        "system": COMMON_STYLE + (
            " You write church announcements: warm, clear, complete (what, "
            "when, where, who, what to bring/expect). Adapt register to the "
            "channel — pulpit announcement vs poster vs WhatsApp broadcast."
        ),
        "template": (
            "Event: {event}\n"
            "Date & time: {datetime}\n"
            "Venue: {venue}\n"
            "Channel: {channel}\n"
            "Details (guests, theme, dress code, etc.): {details}\n\n"
            "Write the announcement text for {channel}."
        ),
        "fields": [
            text("event", "Event name", "e.g. 3-day revival, harvest thanksgiving"),
            text("datetime", "Date & time"),
            text("venue", "Venue"),
            select("channel", "Channel", ["pulpit announcement", "poster/flyer", "WhatsApp broadcast", "church bulletin"]),
            textarea("details", "Details (optional)", required=False),
        ],
    },
    {
        "key": "newsletter",
        "name": "Congregation Newsletter",
        "category": "role",
        "roles": ["gospel_minister"],
        "icon": "mail",
        "description": "Monthly/weekly newsletters — pastoral message, news, upcoming events.",
        "system": COMMON_STYLE + (
            " You draft church newsletters: pastoral message, reports, "
            "upcoming events, birthdays/celebrations section, prayer focus. "
            "Warm, organised, ready to print or send."
        ),
        "template": (
            "Church name: {church}\n"
            "Period covered: {period}\n"
            "Pastoral message theme: {theme}\n"
            "News & reports:\n{news}\n"
            "Upcoming events:\n{events}\n\n"
            "Produce the complete newsletter."
        ),
        "fields": [
            text("church", "Church / ministry name"),
            text("period", "Period", "e.g. October 2026"),
            text("theme", "Pastoral message theme", required=False),
            textarea("news", "News & reports", required=False),
            textarea("events", "Upcoming events", required=False),
        ],
    },

    # ------------------------------------------------------------------
    # LECTURER
    # ------------------------------------------------------------------
    {
        "key": "course_outline",
        "name": "Course Outline / Syllabus",
        "category": "role",
        "roles": ["lecturer"],
        "icon": "grid",
        "description": "Full course outlines: objectives, weekly topics, assessment scheme.",
        "system": COMMON_STYLE + (
            " You produce university course outlines/syllabi: course "
            "description, learning outcomes, weekly topic breakdown "
            "(12–15 weeks), assessment & grading scheme, recommended texts. "
            "Appropriate for Nigerian universities (NUC conventions)."
        ),
        "template": (
            "Course title & code: {course}\n"
            "Level/units: {level}\n"
            "Semester weeks: {weeks}\n"
            "Topics to cover: {topics}\n"
            "Notes: {notes}\n\n"
            "Produce the complete course outline."
        ),
        "fields": [
            text("course", "Course title & code", "e.g. PHY 301 — Electromagnetism"),
            text("level", "Level / credit units", "e.g. 300L, 3 units"),
            text("weeks", "Weeks", "e.g. 14", required=False),
            textarea("topics", "Topics to cover (optional)", required=False),
            textarea("notes", "Notes (optional)", required=False),
        ],
    },
    {
        "key": "research_proposal",
        "name": "Research Proposal Assistant",
        "category": "role",
        "roles": ["lecturer"],
        "icon": "flask",
        "description": "Structure research proposals: problem, objectives, methodology, significance.",
        "system": COMMON_STYLE + (
            " You assist academics in structuring research proposals: "
            "background, problem statement, aim & objectives, research "
            "questions/hypotheses, methodology, significance, scope, "
            "preliminary timeline. Rigorous and discipline-appropriate. "
            "Do not fabricate citations — suggest the kinds of sources needed."
        ),
        "template": (
            "Field/discipline: {field}\n"
            "Proposed topic: {topic}\n"
            "Purpose (grant, thesis, conference): {purpose}\n"
            "Initial thoughts/methods: {thoughts}\n\n"
            "Produce a complete structured proposal draft."
        ),
        "fields": [
            text("field", "Field / discipline"),
            textarea("topic", "Proposed topic / title"),
            select("purpose", "Purpose", ["grant application", "postgraduate thesis", "conference paper", "institutional research"]),
            textarea("thoughts", "Initial thoughts / methods (optional)", required=False),
        ],
    },
    {
        "key": "question_bank",
        "name": "Exam / Question Bank",
        "category": "role",
        "roles": ["lecturer"],
        "icon": "archive",
        "description": "University-level question banks with answer keys across cognitive levels.",
        "system": COMMON_STYLE + (
            " You write university exam questions mapped to Bloom's taxonomy "
            "levels, with a marking scheme/answer key. Questions are rigorous, "
            "unambiguous, and appropriately weighted."
        ),
        "template": (
            "Course: {course}\n"
            "Topic areas: {topics}\n"
            "Question format: {format}\n"
            "Number of questions: {count}\n"
            "Marks/time context: {marks}\n\n"
            "Produce the questions plus a marking guide."
        ),
        "fields": [
            text("course", "Course title & code"),
            textarea("topics", "Topic areas"),
            select("format", "Format", ["multiple choice", "short answer", "essay / long-form", "mixed"]),
            text("count", "Number of questions", "e.g. 30"),
            text("marks", "Marks / time (optional)", required=False),
        ],
    },
    {
        "key": "abstract_assistant",
        "name": "Abstract / Summary Assistant",
        "category": "role",
        "roles": ["lecturer"],
        "icon": "align-left",
        "description": "Draft and tighten abstracts and executive summaries for papers and reports.",
        "system": COMMON_STYLE + (
            " You write and refine academic abstracts: background, methods, "
            "results, conclusion — within typical word limits, precise and "
            "publication-appropriate. For summaries of long documents, "
            "preserve the argument faithfully."
        ),
        "template": (
            "Task: {task}\n"
            "Discipline: {discipline}\n"
            "Word limit: {limit}\n"
            "Source text (paper draft, thesis section, or notes):\n{source}\n\n"
            "Produce the abstract/summary plus 4–6 keywords if appropriate."
        ),
        "fields": [
            select("task", "Task", ["write an abstract from my draft", "summarize a document", "tighten my existing abstract"]),
            text("discipline", "Discipline", required=False),
            text("limit", "Word limit", "e.g. 250", required=False),
            textarea("source", "Source text"),
        ],
    },
]

TOOLS_BY_KEY = {t["key"]: t for t in TOOL_DEFINITIONS}

# Workspace tabs shown in the dashboard, in display order.
WORKSPACES = [
    {"role": "general", "label": "General", "icon": "sparkles"},
    {"role": "civil_servant", "label": "Civil Servants", "icon": "landmark"},
    {"role": "teacher", "label": "Teachers", "icon": "book-open"},
    {"role": "student", "label": "Students", "icon": "graduation-cap"},
    {"role": "business_owner", "label": "Business Owners", "icon": "briefcase"},
    {"role": "gospel_minister", "label": "Ministers", "icon": "book"},
    {"role": "lecturer", "label": "Lecturers", "icon": "microscope"},
]


def tools_for_role(role):
    """General tools for everyone; role tools only for that role."""
    out = []
    for t in TOOL_DEFINITIONS:
        if t["category"] == "general":
            out.append(t)
        elif role in t.get("roles", []):
            out.append(t)
    return out


def get_tool(key):
    return TOOLS_BY_KEY.get(key)
