# Google Play Data Safety preparation

Complete the Play Console form with your final deployed services and verify every answer before submission.

## Data collected

| Data category | Purpose | Stored/processed by |
| --- | --- | --- |
| Email address and Google account identifier | Authentication, account security, moderation | Breakroom API and Google Sign-In |
| User ID and app account data | Account management, blocking, reports, deletion | Breakroom API |
| Messages, captions, comments, and reactions | Community and conversation features; moderation | Breakroom API |
| Photos and videos | User-generated Work Pulses and Break Briefs | Cloudinary and Breakroom API URLs |
| Report details | Safety and policy enforcement | Breakroom API |

## Sharing and security

- User-generated media is processed by Cloudinary to store and deliver it.
- Google Sign-In processes authentication information.
- Community content is visible to other authenticated Breakroom members.
- Data is transmitted using HTTPS in production.
- Users can delete their account in Account & privacy.

## Play Console choices to review

- Does the app collect data? **Yes**.
- Is data encrypted in transit? **Yes, in production over HTTPS**.
- Is account creation supported? **Yes**.
- Can users request account deletion? **Yes, in-app Account & privacy**.
- Does the app share personal information with a third party? Review **Cloudinary** and **Google** carefully and answer according to the final integration and applicable Play definitions.
