# Brainstorming: Dominican Republic Market Improvements

## Research Insights (Anticipated)
- **Visuals:** High preference for vibrant colors, clear imagery, and "status" signaling.
- **Language:** Informal but respectful. Use of "Tú" vs "Usted" depends on context, but "Tú" is friendlier for a lifestyle app.
- **Trust:** Social proof (who else goes there?) is massive.
- **Connectivity:** Data saving modes are appreciated. WhatsApp is king.

## 20 Improvement Ideas

1.  **"Coro" Mode (Group Booking):** Book slots for you and a friend together.
2.  **WhatsApp "Quick-Login":** One-tap login using WhatsApp (if possible) or just "Send code to WhatsApp" as default.
3.  **"Voice Note" Reviews:** Allow users to leave short audio reviews (very popular in DR).
4.  **"Colmado" Style Chat:** Direct chat with the business owner for quick questions ("¿Hay luz?").
5.  **"Planta" Badge:** Explicitly show if a business has a backup generator (crucial in DR).
6.  **"Picapollo" Deals (Flash Sales):** Last-minute discounts for empty slots in the next hour.
7.  **Dynamic "Dembow" Mode:** A fun UI theme switch (dark mode + neon) for weekend discovery.
8.  **"Fiao" (Credit) Tracker:** For trusted clients, businesses can mark a service as "Paid later" (digital notebook).
9.  **Map "Concho" Integration:** Show "How to get there" using popular local landmarks, not just street names.
10. **Status Stories:** Businesses post 24h stories of their work (cuts, nails) appearing on their profile.
11. **"El Final" Badge:** Top-rated services get a special "El Final" (The Best) badge.
12. **Data Saver Mode:** Option to disable auto-play videos on the feed.
13. **Cash "Sencillo" Reminder:** Remind users to bring small bills if paying cash.
14. **QR Code "Check-in":** User scans a QR at the desk to mark "I'm here".
15. **"Junta de Vecinos" (Community):** See which of your friends have booked at a place.
16. **Tipping via App:** Even if paying cash for service, allow digital tip via card/transfer.
17. **"Full" Indicator:** Real-time "We are full" toggle for businesses.
18. **Birthday "Fria":** Auto-send a "Free Beer/Drink" offer on client birthdays.
19. **Local Payment Icons:** Explicitly show logos for "Transferencia Popular", "Banreservas", "Qik".
20. **Spanglish Search:** Handle search terms like "Blow dry", "Full set", "Cerquillo" correctly.

## Analysis & Selection (Top 8)

| Idea | Impact (DR) | Feasibility | Selected |
| :--- | :--- | :--- | :--- |
| **1. "Planta" Badge** | **Critical** | High | ✅ |
| **2. WhatsApp Login/OTP** | **High** | High | ✅ |
| **3. "Picapollo" (Flash) Deals** | High | Medium | ✅ |
| **4. Voice Note Reviews** | High | Medium | ✅ |
| **5. Local Payment Icons** | High | High | ✅ |
| **6. Spanglish/Slang UI** | High | High | ✅ |
| **7. Data Saver (Video Toggle)** | High | High | ✅ |
| **8. "El Final" (Verified) Badge** | Medium | High | ✅ |

*Note: "Coro" mode and "Fiao" are great but complex for this sprint.*

## Implementation Plan for Top 8

1.  **Localization (Global):** Translate all text to Dominican Spanish (e.g., "Book" -> "Reservar", "Discover" -> "Explorar").
2.  **"Planta" Badge:** Add `has_generator` boolean to Business schema and UI.
3.  **WhatsApp OTP:** Ensure the auth flow explicitly mentions "WhatsApp".
4.  **Flash Deals:** Add `discount_ends_at` to Service schema.
5.  **Voice Reviews:** Add audio recording to the Review component.
6.  **Local Payment UI:** Add visual indicators for local banks in the booking summary.
7.  **Data Saver:** Add a toggle in the video feed to pause auto-play.
8.  **"El Final" Badge:** Visual flair for businesses with >4.8 rating.
