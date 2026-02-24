# StatStack — Iteration Playbook

## Deployment Checklist (Do Now — ~15 min)

### 1. Push Code to GitHub
```bash
cd ~/Documents/claude/statstack
# Option A: SSH (add your key to GitHub first)
git remote set-url origin git@github.com:THatch26/statstack.git
git push -u origin main

# Option B: HTTPS with token
git remote set-url origin https://<your-token>@github.com/THatch26/statstack.git
git push -u origin main

# Option C: GitHub CLI
gh auth login
git push -u origin main
```

### 2. Enable GitHub Pages
1. Go to https://github.com/THatch26/statstack/settings/pages
2. Source: **Deploy from a branch**
3. Branch: **main** / **(root)**
4. Save → site will be live at https://thatch26.github.io/statstack/ within 2 min

### 3. Verify
- [ ] Visit https://thatch26.github.io/statstack/
- [ ] Play through all 10 rounds
- [ ] Tap "Share Results" — verify clipboard works
- [ ] Check about.html and privacy.html links
- [ ] Test on mobile

---

## Revenue Setup (~10 min human time)

### Google AdSense Application
1. Go to https://adsense.google.com
2. Sign up with your Google account
3. Add site: `thatch26.github.io`
4. Add the AdSense script tag to `index.html` `<head>`:
   ```html
   <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXX" crossorigin="anonymous"></script>
   ```
5. Create ad units and place them in the `ad-top`, `ad-results`, and `ad-bottom` divs
6. Wait for approval (typically 1-3 days for new sites, can take 2-4 weeks)

### Alternative: Start with Buy Me a Coffee
While waiting for AdSense approval:
1. Create account at buymeacoffee.com
2. Add a small "Support StatStack" link in the footer

---

## Week 1 Distribution Plan (Day 1-7)

### Day 1: Soft Launch
- [ ] Post in r/WebGames with title: "I made a daily higher-or-lower statistics game — can you beat 8/10?"
- [ ] Post in r/CasualGames
- [ ] Share personal social media with your score screenshot

### Day 2: Broader Reddit
- [ ] r/InternetIsBeautiful — "StatStack: a daily game where you guess which stat is higher"
- [ ] r/boardgames or r/puzzles if first posts got traction

### Day 3: Twitter/X Push
- [ ] Post with your score grid + "Can you beat my score?" + link
- [ ] Use hashtags: #StatStack #DailyGame #Wordle

### Day 4-5: Community Seeding
- [ ] Discord gaming servers (find 3-5 "daily games" or "casual games" channels)
- [ ] Hacker News "Show HN" post
- [ ] Product Hunt listing (schedule for Tuesday 12:01 AM PT for best visibility)

### Day 6-7: Observe and Optimize
- [ ] Check which sources drove traffic
- [ ] Read any feedback and note improvement ideas

---

## Growth Levers (Weeks 2-8)

### Content SEO Pages (High Impact, Free)
Create individual pages for popular stat categories:
- `/stats/world-populations` — "Can you rank these populations?"
- `/stats/company-revenues` — "How well do you know Big Tech revenue?"
- `/stats/space-facts` — "Test your space knowledge"

Each page targets a long-tail keyword and links to the main game.

### Social Proof Loop
The emoji grid sharing is your #1 growth engine. Optimize it:
- Make sure the share text includes the URL
- A/B test the share format (add a tagline, change emoji style)
- Consider adding "Challenge a friend" with a direct link

### Retention Hooks
- **Streak counter**: Already built. Players come back to maintain streaks.
- **"Yesterday's answers"**: Add a section showing yesterday's stats so returning players feel rewarded
- **Weekly leaderboard**: Use localStorage to track weekly performance, show "Your best week"

---

## Monetization Progression

| Month | Expected Traffic | Revenue Source | Est. Revenue |
|-------|-----------------|----------------|-------------|
| 1 | 100-500/day | Buy Me a Coffee | $0-20 |
| 2 | 500-2K/day | AdSense approved | $5-30/mo |
| 3-6 | 2K-10K/day | AdSense + affiliate | $50-300/mo |
| 6-12 | 10K-50K/day | Premium ads + sponsor | $300-1500/mo |

### Revenue Optimization
1. **AdSense placement**: Top banner + between-results + bottom. The results page ad has highest viewability.
2. **Affiliate potential**: Link stat sources to relevant books/courses (Amazon affiliate)
3. **Sponsored stats**: Companies pay to have their stats featured ("Sponsored by DataCamp")
4. **Premium tier** (Month 6+): Ad-free experience, stats archive, custom challenges

---

## Technical Iterations

### Quick Wins (< 1 hour each)
- [ ] Add Google Analytics / Plausible for traffic tracking
- [ ] Add "Yesterday's Answers" section on results page
- [ ] Add social meta tags for specific daily challenges (dynamic OG image)
- [ ] Service worker for true offline PWA support

### Medium Effort (2-4 hours)
- [ ] Difficulty modes (Easy: same category, Hard: mixed categories)
- [ ] Category-specific daily challenges (e.g., "Space Saturday")
- [ ] Archive page showing past days and your history
- [ ] Multiplayer mode: challenge a friend with a shared link

### Growth Features (4-8 hours)
- [ ] Programmatic SEO: auto-generate 100+ stat comparison pages
- [ ] User-submitted statistics with moderation
- [ ] Email digest: "Your weekly stats recap"
- [ ] Embeddable widget for blogs

---

## KPIs to Track

| Metric | Target (Month 1) | Target (Month 6) |
|--------|------------------|------------------|
| Daily visitors | 100+ | 5,000+ |
| Game completion rate | 70%+ | 80%+ |
| Share rate | 15%+ | 20%+ |
| Return rate (next day) | 30%+ | 50%+ |
| AdSense RPM | N/A | $5-15 |

---

## Adding New Statistics

Edit `js/stats-data.js` and add entries in this format:
```javascript
{ text: "Description of the statistic", value: 12345, unit: "unit", source: "Source Name" }
```

Guidelines:
- Use verified, citeable sources
- Round to significant figures (no false precision)
- Include a mix of surprising and intuitive values
- Aim for 365+ total entries so daily content doesn't repeat within a year
- Keep values comparable within reasonable ranges to maintain fun (don't pair a number in the billions with a number less than 10)
