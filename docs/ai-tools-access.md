# Recommended Tools Access Status

Guidance on AI agents and mapping libraries.

---

## Development AI Agents

| Tool | Access | Notes |
| :--- | :--- | :--- |
| **GitHub Copilot** | Free (Students) | Available via [GitHub Student Developer Pack](https://github.com/settings/education/benefits). Includes 180 monthly Codespaces hours, plus other premium tools. Must use @ufmg email for registration (and/or official proof of enrollment). |
| **Gemini / Gemini Code Assist** | Free / Student Plan | Can be used for IDE integration and terminal operations. Robust free tier for individual developers. |
| **Cursor** | Freemium | Offers one year of Pro for students, with required "sign up". Requires university email; subscription renews at Pro price after 12 months. |
| **ChatGPT** | Freemium | Standard browser access. Lack of native IDE integration. |
| **Claude Code** | Paid (Pro) | No student plan currently available. Requires individual Pro subscription (~USD$20/month). |

---

## Mapping and Integrated AI

The following tools are recommended for implementing the map-based features of KULTI:

### 1. Gemini API (Core AI)
- **Status:** Free Tier (Google AI Studio).
- **Usage:** Primary API for KULTI's AI integration. 
- **Constraint:** Content in the free tier is used to improve Google products.

### 2. Mapbox GL JS
- **Status:** Freemium.
- **Usage:** High-performance vector maps. 
- **Limit:** 50,000 free map loads per month. A "load" occurs on Map object initialization.

### 3. Leaflet
- **Status:** Open Source.
- **Usage:** Lightweight, interactive maps. 
- **Benefit:** Completely free and highly extensible, though visually more "standard" than Mapbox.

### 4. Protomaps
- **Status:** Open Source.
- **Usage:** Self-hosted map tiles. 
- **Requirement:** Requires independent cloud storage; no external API dependency.
