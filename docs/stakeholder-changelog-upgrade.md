# FinTrackAI Secure Upgrade Changelog

## What’s new

- Added safer Google sign-in startup handling
- Added validated CSV/PDF ingestion pipeline
- Added automated expense categorization
- Added stronger spending, category, and savings analytics
- Added richer dashboard insights

## What stayed stable

- Existing login/signup still work
- Existing Google OAuth flow was preserved
- Existing upload/report/transaction flows were preserved
- Existing dashboard routes were preserved

## User-facing improvements

- uploads now provide structured validation feedback
- financial data is categorized more intelligently
- dashboard highlights savings opportunities and top spending areas
- analytics are more useful without changing the familiar navigation

## Operational impact

- upgrade was implemented modularly
- new capabilities are additive, not replacements
- system remains deployable even if a new module is temporarily unavailable

## Remaining known follow-ups

- broaden PDF parsing support for additional bank statement layouts
- improve development-time Google OAuth callback flexibility
- add browser-level end-to-end staging checks
