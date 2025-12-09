{
  "project": {
    "name": "BuildWise",
    "description": "A platform to help engineering students generate, learn, build, purchase, and get mentorship for hardware projects.",
    "vision": "To become the #1 platform for engineering students to create innovative hardware projects with complete guidance, components, documentation, and mentorship — all in one place."
  },

  "problems": [
    "Students struggle to find unique hardware project ideas.",
    "Lack of proper documentation and tutorials.",
    "Difficulty sourcing components/kits.",
    "No available mentors for debugging and guidance.",
    "Incomplete understanding leading to failed projects."
  ],

  "solutions": [
    "AI-powered project idea generator.",
    "Step-by-step documentation with downloadable PDFs and PPTs.",
    "Built-in store for components and pre-bundled project kits.",
    "1:1 mentorship system.",
    "Featured verified projects for direct purchase."
  ],

  "user_personas": {
    "student": {
      "goals": ["Find projects", "Buy kits", "Generate custom ideas", "Get mentor help"],
      "pain_points": ["No ideas", "No components", "No clarity", "Time pressure"]
    },
    "beginner_learner": {
      "goals": ["Learn Arduino", "Learn robotics", "Follow structured steps"]
    },
    "mentor": {
      "goals": ["Help students", "Get session assignments"]
    },
    "admin": {
      "goals": ["Upload/check projects", "Manage stock", "Approve AI projects", "Handle orders"]
    }
  },

  "core_features": [
    "AI Project Generator",
    "Featured Project Library",
    "Step-by-Step Documentation",
    "Components Store",
    "Project Kit Store",
    "1:1 Mentorship System",
    "Order and Payment via PhonePe",
    "Admin Dashboard"
  ],

  "system_architecture": {
    "frontend": "Next.js",
    "backend": "Node.js (pnpm)",
    "database": "Azure Flexible Postgres",
    "auth_providers": ["Google", "GitHub", "Email + Password"],
    "payment_gateway": "PhonePe",
    "ai_engine": "Gemini 3 Pro",
    "file_storage": "Azure Blob Storage"
  },

  "modules": {
    "auth_module": {
      "features": [
        "OAuth login with Google/GitHub",
        "Email-password login/signup",
        "Role-based access: student, mentor, admin"
      ],
      "tables": ["users", "auth_accounts", "email_credentials", "sessions"]
    },

    "ai_project_generator": {
      "input": ["keywords", "budget", "difficulty", "hardware"],
      "output": [
        "title",
        "summary",
        "components_list",
        "cost_estimate",
        "methodology",
        "applications",
        "future_scope",
        "circuit_diagram_text",
        "block_diagram_text",
        "downloadable_pdf",
        "downloadable_ppt",
        "complexity_level"
      ],
      "tables": ["ai_generation_requests", "ai_generation_results"]
    },

    "project_library": {
      "features": [
        "Featured verified projects",
        "AI-generated drafts",
        "Project steps",
        "Project documentation bundle",
        "Diagrams and assets",
        "Default mentor"
      ],
      "tables": [
        "projects",
        "project_steps",
        "project_document_bundle",
        "project_assets",
        "project_components"
      ]
    },

    "component_store": {
      "features": [
        "Browse components",
        "View price and stock",
        "Add to cart or buy individually"
      ],
      "tables": ["components"]
    },

    "kit_store": {
      "features": [
        "Project-specific kits",
        "Bundled components",
        "Stock management"
      ],
      "tables": ["kits", "kit_components"]
    },

    "mentor_system": {
      "features": [
        "Project mentor assignment",
        "Student → mentor 1:1 session booking",
        "Mentor profiles"
      ],
      "tables": [
        "mentors",
        "project_mentors",
        "mentor_sessions"
      ]
    },

    "order_management": {
      "features": [
        "Cart → Checkout",
        "PhonePe payment",
        "Order tracking",
        "Order types: kit-only, built-project, components-only"
      ],
      "tables": [
        "orders",
        "order_items",
        "payments",
        "addresses"
      ]
    },

    "admin_dashboard": {
      "features": [
        "CRUD for projects, components, kits",
        "Approve AI-generated projects",
        "Manage orders",
        "Assign mentors",
        "Upload PDFs, assets"
      ],
      "tables": ["admin_action_logs", "file_uploads"]
    }
  },

  "database_tables": [
    "users",
    "auth_accounts",
    "email_credentials",
    "sessions",

    "projects",
    "project_steps",
    "project_document_bundle",
    "project_assets",
    "project_components",

    "components",
    "kits",
    "kit_components",

    "ai_generation_requests",
    "ai_generation_results",

    "orders",
    "order_items",
    "payments",
    "addresses",

    "mentors",
    "project_mentors",
    "mentor_sessions",

    "admin_action_logs",
    "file_uploads"
  ],

  "order_flow": {
    "steps": [
      "User selects project or kit",
      "User proceeds to checkout",
      "Payment is initiated via PhonePe",
      "Payment callback validates transaction",
      "Order is created and marked as 'paid'",
      "Admin processes and ships the order",
      "User tracks the order until delivery"
    ]
  },

  "non_functional_requirements": {
    "scalability": "1000+ active users",
    "security": [
      "JWT authentication",
      "Role-based access",
      "Rate limit AI usage",
      "Validate payment callback"
    ],
    "performance": "API responses < 200ms",
    "availability": "99%",
    "backups": "Daily Postgres backup"
  },

  "roadmap": {
    "phase_1": [
      "AI generator MVP",
      "Featured project library",
      "Component store",
      "Kit store",
      "PhonePe payment integration",
      "Admin dashboard"
    ],
    "phase_2": [
      "Advanced AI mentor chat",
      "Circuit diagram auto-render",
      "Video tutorials",
      "Beginner learning paths"
    ],
    "phase_3": [
      "Marketplace for student-built projects",
      "College dashboards",
      "Internship credit system"
    ]
  }
}
