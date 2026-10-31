# ZERETHON TOOLS --- QR GENERATOR INTEGRATION, SMART EXTENSION & CHROME WEB STORE RELEASE

## 1. Role and objective

Act as a Senior Full-stack Engineer and Software Architect working on
the existing Zerethon ecosystem.

Existing products: - Tools website: https://tools.zerethon.com - QR
Generator: https://tools.zerethon.com/qr-code-generator - Published
Chrome Extension:
https://chromewebstore.google.com/detail/zerethon-tools/mdbcbnalkhjogllppjkenlecankpeomk?hl=vi

Your task is to enhance the existing products and prepare a
production-ready new version of the Chrome Extension for submission to
the Google Chrome Web Store for review and approval.

This is an upgrade to the existing published extension, not a rewrite
and not a new extension listing.

### Product vision

Zerethon Tools Extension is the intelligent entry point to the Zerethon
ecosystem. Users select content anywhere on the web, right-click, and
are directed to the most relevant Zerethon tool.

Principles: - Fast, local, privacy-first. - Deterministic
JavaScript-based classification. - No AI, LLM API, external
classification service, or token consumption. - Always provide manual
tool selection when automatic detection is uncertain. - Build on
existing architecture and preserve working functionality.

------------------------------------------------------------------------

## 2. Mandatory architecture audit

Before coding, inspect the actual repositories and existing
implementation. Do not assume file paths or architecture.

Inspect the website: - Homepage layout and design system. - Tool
registry, categories, search and trending logic. - QR Generator routes,
input handling, QR modes and generation lifecycle.

Inspect the Chrome Extension: - `manifest.json` and Manifest V3
configuration. - Background/service worker. - Context menu
implementation. - Popup/Launcher and Side Panel. - Omnibox. - Existing
offline tools: JSON, Base64 and Hash. - Favorites, Recents and storage
schema. - Message passing and navigation architecture. - Current
permissions and Chrome Web Store disclosures.

Identify risks and write a concise implementation plan, then continue
implementation. Do not stop after the audit unless a critical blocker
requires clarification.

------------------------------------------------------------------------

## 3. Task A --- Promote QR Generator on the Tools homepage

Update https://tools.zerethon.com.

### A1. Featured QR Generator box

Add a visually prominent but compact featured tool box near the top of
the homepage, preferably below the Hero/Search section and before the
main tool categories.

Content: - Title: **QR Code Generator** - Description: Create custom QR
codes for URLs, text, Wi-Fi, email and phone numbers. - CTA: **Create QR
Code** - Destination: `/qr-code-generator` - Include a QR Code
icon/visual and a **NEW** badge. - Responsive on desktop and mobile. -
Follow the existing Zerethon design system and Tailwind conventions. -
Do not make the box excessively large or disruptive.

### A2. Preserve JSON Formatter

CRITICAL: - Keep the existing JSON Formatter on the homepage. - Do not
remove, replace, hide, downgrade or relocate its current prominent
placement. - Preserve its current behavior and visibility.

### A3. Preserve Trending Tools

CRITICAL: - Keep the existing Trending Tools section and functionality
fully operational. - Do not replace dynamic trending data with static
data. - Do not change ranking logic, analytics, tracking or API
contracts. - Do not artificially mark QR Generator as trending. - QR
Generator may appear in the appropriate tool list with a NEW badge.

### A4. Tool listing and metadata

-   Add QR Generator to the appropriate existing category/list.
-   Use the existing tool registry or metadata structure.
-   Add the appropriate icon, NEW badge and route.
-   Avoid duplicating metadata across components.
-   Preserve search, category and discovery behavior.
-   Follow existing conventions for NEW badge lifecycle where available.

------------------------------------------------------------------------

## 4. Task B --- Build a local Rule-based Smart Context Router

Enhance the existing Chrome Extension. Do not rebuild it.

Implement a reusable classification layer independent of individual tool
implementations.

Conceptual flow:

``` text
Selected Content
      |
      v
Context Detector
      |
      v
Rule-based Classifier
      |
      v
Tool Registry
      |
      v
Suggested Action + Manual Tool Menu
      |
      v
Zerethon Tool
```

Suggested interface (adapt to existing conventions):

``` typescript
type ContentType =
  | 'url'
  | 'email'
  | 'phone'
  | 'json'
  | 'source_code'
  | 'text'
  | 'unknown';

interface DetectionResult {
  type: ContentType;
  confidence: number;
  language?: string;
  suggestedTool: string;
}
```

### B1. Detection rules

Use deterministic local JavaScript rules. Suggested priority:

1.  URL
2.  Email
3.  Phone
4.  JSON
5.  Source Code
6.  Plain Text fallback

**URL** - Recognize `https://example.com`, URLs with query strings, and
valid `www.example.com` forms. - Suggested action: QR Generator in URL
mode.

**Email** - Validate email-like selected content. - Suggested action: QR
Generator in Email mode.

**Phone** - Support common local and international formats, including
`0905123456` and `+84905123456`. - Normalize only when appropriate. - Do
not classify arbitrary numeric strings as phone numbers without
sufficient evidence. - Suggested action: QR Generator in Phone mode.

**JSON** - Validate with `JSON.parse`. - Suggested action: existing JSON
Formatter.

**Source Code** - Detect common languages using syntax patterns,
keywords and structural evidence. - Initial language support: -
JavaScript - TypeScript - PHP - Python - Java - C - C++ - C# - Go -
Rust - SQL - HTML - CSS - Bash - Consider imports, namespaces,
declarations, functions/classes and language-specific syntax. - Avoid
false certainty for short or ambiguous snippets. - If language
confidence is low, open Zerethon IDE with the selected code and
`language=auto` or the IDE's existing auto-detection mechanism. - Allow
manual language selection in the IDE.

**Plain Text / Unknown** - Plain text should default to QR Generator in
Text mode. - If classification is unknown or uncertain, never create a
dead end: retain the manual tool menu.

### B2. Confidence and ambiguity

-   Use confidence thresholds and deterministic priority rules.
-   A piece of content may match more than one category (for example,
    JSON is also source text); avoid conflicting suggestions.
-   Do not claim a language with high confidence when evidence is
    insufficient.
-   A failed or uncertain detection must still allow manual selection.

------------------------------------------------------------------------

## 5. Task C --- Context Menu UX

Enhance the existing Chrome Context Menu, reusing its current
infrastructure.

Proposed structure:

``` text
Zerethon Tools
  Suggested Action (dynamic)
  -------------------------
  Create QR Code
  Open in IDE
  Format JSON
  Encode / Decode Base64
  Generate Hash
  -------------------------
  All Tools
```

Behavior: 1. Put the most relevant suggested action first when content
is selected. 2. Keep manual tool selection available at all times. 3.
When detection fails, show a useful standard menu and All Tools. 4. Do
not hide or remove existing tools. 5. Avoid duplicate menu entries. 6.
Update menu state safely for each selection. 7. Preserve current
launcher, Side Panel and Omnibox behavior.

Examples: - URL → Suggested: Create QR Code. - Email → Suggested: Create
QR Code. - Phone → Suggested: Create QR Code. - JSON → Suggested: Format
JSON. - PHP/JavaScript/Python code → Suggested: Open in IDE with
detected language when reliable. - Plain text → Suggested: Create QR
Code (Text). - Unknown → Manual tool choices remain available.

Do not make the menu depend on AI or a network request.

------------------------------------------------------------------------

## 6. Task D --- Integrate QR Generator with the Extension

Destination: `https://tools.zerethon.com/qr-code-generator`

When users select content and choose Create QR Code: - Open the existing
QR Generator. - Pass selected content and detected QR mode. -
Automatically populate the input. - Automatically select the correct
mode. - Generate the QR preview immediately where supported. - Preserve
the existing manual QR creation workflow. - Reuse the existing QR
generation engine; do not build a second one.

Supported modes: - URL - Text - Email - Phone

### D1. Data transfer

Prefer URL fragment-based transfer rather than query parameters.

Example concept:

``` text
https://tools.zerethon.com/qr-code-generator#...
```

Requirements: - Correctly encode/decode Unicode and Vietnamese text. -
Handle long content safely. - Validate the received input. - Do not put
selected content in HTTP query parameters. - Do not send selected
content to external services. - Clear transient data from the fragment
after successful initialization where appropriate. - Consider browser
refresh and duplicate initialization behavior. - Do not break existing
QR page functionality.

Use a robust, documented fragment format. Consider URL-safe Base64 or
another safe encoding strategy. Avoid truncating content silently. If a
practical browser URL limit is reached, provide a graceful fallback that
does not transmit content to a third party.

------------------------------------------------------------------------

## 7. Task E --- Tool Registry

Reuse or improve the existing centralized tool registry. Do not create a
separate hardcoded routing system for each tool.

Conceptual structure:

``` typescript
interface ToolDefinition {
  id: string;
  name: string;
  url?: string;
  supportedContentTypes: ContentType[];
  contextMenuEnabled: boolean;
  icon?: string;
}
```

Example mappings:

  Selected content   Destination
  ------------------ -------------------------
  URL                QR Generator --- URL
  Plain text         QR Generator --- Text
  Email              QR Generator --- Email
  Phone              QR Generator --- Phone
  JSON               Existing JSON Formatter
  Source code        Existing Zerethon IDE
  Base64             Existing Base64 tool
  Other              All Tools / Launcher

Requirements: - Adapt to the actual existing architecture. - Avoid
duplicate metadata. - Reuse existing routes and URLs. - Make future tool
integration straightforward. - Only link to products/tools that actually
exist. - Do not create placeholder destinations for nonexistent
products. - Preserve existing tool discovery and search.

------------------------------------------------------------------------

## 8. Task F --- Privacy, permissions and performance

Privacy-first is a core Zerethon principle.

Mandatory: - All content classification runs locally. - No AI, LLM or
external classification APIs. - No unnecessary server-side processing of
selected content. - Do not log selected content. - Request only
necessary Chrome permissions. - Avoid broad host permissions unless
technically required. - Avoid unnecessary content scripts. - Keep the
extension lightweight and responsive. - Maintain Manifest V3
compatibility. - Handle long selected text without freezing the browser.

Review whether the existing architecture can use `contextMenus`,
`activeTab`, `storage` and existing messaging without adding broader
permissions. Do not add `tabs`, `<all_urls>` or other permissions unless
there is a demonstrated technical need.

------------------------------------------------------------------------

## 9. Task G --- Short URL / Short Code

Do NOT implement a URL-shortening backend in this milestone.

For now: - Generate normal QR Codes using the original content. - Ensure
mobile scanning opens the original destination directly. - Do not
introduce redirect infrastructure or tracking. - Keep the design
compatible with a possible future short URL feature, without
implementing it now.

------------------------------------------------------------------------

## 10. Task H --- Chrome Web Store release and review

This is a production upgrade of the existing published Zerethon Tools
extension. The deliverable must be ready for Google Chrome Web Store
submission and review.

Existing listing:
https://chromewebstore.google.com/detail/zerethon-tools/mdbcbnalkhjogllppjkenlecankpeomk

### H1. Version and identity

-   Inspect the currently published version and local manifest version.
-   Increment `version` in `manifest.json` according to Chrome Web Store
    requirements.
-   Preserve the existing extension ID.
-   Preserve the existing Chrome Web Store listing.
-   Do not create a new extension listing.
-   Maintain Manifest V3.
-   Do not change manifest configuration unnecessarily.

### H2. Backward compatibility

-   Preserve all existing functionality.
-   Preserve existing permissions wherever possible.
-   Do not request additional permissions without a clear technical
    requirement.
-   Ensure existing users can upgrade without losing settings, favorites
    or recents.
-   Preserve storage schemas or implement safe backward-compatible
    migrations.
-   Test both fresh installation and upgrade from the previous published
    version.

### H3. Chrome Web Store compliance

Review: - Manifest permissions and host permissions. - Content Security
Policy. - Remote code restrictions. - Privacy practices. - Selected-text
handling. - Data collection and transmission. - Third-party
dependencies. - Extension functionality description. - Privacy policy
and data-use disclosures, if applicable.

All new functionality must comply with Chrome Web Store policies.

No AI services, external classification APIs or unnecessary data
collection.

If the privacy policy or Web Store disclosures need changes, identify
the exact required changes and prepare them.

### H4. Production QA

Before packaging: - Run existing tests. - Add tests for classification
and routing. - Build the production extension. - Validate the generated
package. - Test fresh installation. - Test upgrade from the previous
version. - Verify Context Menu, Side Panel, Omnibox, Launcher, Favorites
and Recents. - Verify QR Generator integration. - Verify existing JSON,
Base64 and Hash tools. - Verify permission behavior and privacy
expectations. - Fix critical regressions before release.

### H5. Release artifacts

Prepare: 1. Production extension build. 2. ZIP package ready for Chrome
Web Store upload. 3. Version number and release notes. 4. Updated Chrome
Web Store description, if needed. 5. Permission justification. 6.
Privacy disclosure changes, if required. 7. QA report. 8. Exact manual
submission instructions.

### H6. Submission status

If authorized Chrome Web Store publishing credentials and submission
tools are available, use the authorized workflow to submit the new
version for review.

Otherwise: - Do not claim submission has occurred. - Provide the ZIP
package and exact upload instructions. - Clearly state that manual
submission is required.

Never claim Google approval before Google completes its review.

Report the actual status accurately: Draft, Ready to Submit, Submitted,
In Review, Approved or Rejected.

------------------------------------------------------------------------

## 11. Implementation milestones

### M0 --- Architecture Audit

-   Inspect website and extension repositories.
-   Identify existing components, services, routes, registry and
    permissions.
-   Identify QR initialization requirements.
-   Identify Context Menu constraints.
-   Document compatibility risks.
-   Produce a concise implementation plan, then continue.

### M1 --- Homepage

-   Add Featured QR Generator box.
-   Keep JSON Formatter in its current prominent position.
-   Preserve Trending Tools and all existing dynamic behavior.
-   Add QR Generator to the correct tool listing with NEW badge.
-   Verify responsive behavior.

### M2 --- QR Integration

-   Implement fragment-based initialization.
-   Support URL, Text, Email and Phone.
-   Populate the correct input and mode.
-   Generate preview.
-   Test Unicode, Vietnamese text and long content.
-   Preserve manual generation.

### M3 --- Smart Router

-   Implement local rule-based classification.
-   Add URL, Email, Phone, JSON, Source Code and Text detection.
-   Add confidence and ambiguity handling.
-   Integrate IDE auto-detection fallback.

### M4 --- Context Menu

-   Add dynamic Suggested Action.
-   Preserve manual tool choices and All Tools.
-   Preserve existing extension functionality.
-   Test all detection paths.

### M5 --- Production QA and Release

-   Run tests and fix regressions.
-   Verify permissions and Chrome Web Store compliance.
-   Increment version.
-   Build and validate ZIP.
-   Prepare release notes and submission materials.
-   Submit for review if authorized access is available.

------------------------------------------------------------------------

## 12. Engineering constraints

These are mandatory: 1. Do not rewrite existing applications. 2. Do not
replace the current design system. 3. Do not remove working
functionality. 4. Do not break existing public routes. 5. Do not
duplicate existing components or registries. 6. Do not introduce
unnecessary dependencies. 7. Do not use AI for classification. 8. Do not
introduce unnecessary backend infrastructure. 9. Follow existing coding
conventions. 10. Keep changes focused, maintainable and
production-ready. 11. Preserve the existing extension ID and listing.
12. Do not claim tests, packaging, submission or approval unless
actually completed.

If a detail in this specification conflicts with the existing
architecture, adapt the implementation while preserving the intended
behavior and explain the decision.

------------------------------------------------------------------------

## 13. Definition of Done

### Website

-   QR Generator is promoted in a featured box near the top.
-   JSON Formatter retains its existing prominent homepage placement.
-   Trending Tools remains fully functional and dynamic.
-   QR Generator appears in the appropriate listing with a NEW badge.
-   Search, categories and responsive layouts work.

### Extension

-   Existing extension is upgraded, not rewritten.
-   URL, Email, Phone, JSON, Source Code and Text detection work
    locally.
-   Suggested Action is relevant.
-   Manual tool selection is always available.
-   Selected content reaches the correct tool.
-   QR Generator initializes the correct mode.
-   IDE receives source code and detected language or auto-detect
    setting.
-   Existing JSON, Base64, Hash, Favorites, Recents, Omnibox, Launcher
    and Side Panel continue working.
-   No AI or classification API calls occur.

### Release

-   Version is incremented.
-   Existing extension ID and listing are preserved.
-   Existing users can upgrade safely.
-   Tests pass and no critical regression remains.
-   Production ZIP is generated and validated.
-   Release notes and required review materials are ready.
-   Submission status is accurately reported.

------------------------------------------------------------------------

## 14. Final engineering report

After implementation, provide:

-   Architecture findings.
-   Implementation plan and completed milestones.
-   Files changed.
-   Components/services added or updated.
-   Classification rules and confidence handling.
-   Context Menu behavior.
-   QR fragment format and initialization behavior.
-   Homepage changes.
-   Permissions changes and justification.
-   Backward-compatibility and migration details.
-   Tests executed and results.
-   Production build and ZIP location.
-   Version number and release notes.
-   Chrome Web Store compliance checklist.
-   Submission status and any remaining manual steps.
-   Known limitations.

Separate completed work from work requiring manual verification.

## Final product vision

Zerethon Tools Extension is the intelligent entry point to the Zerethon
ecosystem.

Users can select content anywhere on the web, right-click, and quickly
reach the right Zerethon product.

Fast. Local. Privacy-first. No AI dependency.

Build on what already exists. Preserve working functionality. Finish,
test, package and prepare the existing extension upgrade for Google
review.
