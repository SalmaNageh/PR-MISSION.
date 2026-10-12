
const OPTIONS = ["Sponsor", "Partner", "CSR"];

function makeCase({
  id,
  level,
  title,
  company,
  companyType,
  difficulty,
  situation,
  goal,
  audience,
  resources,
  companyGoals,
  history,
  correctAnswer,
  explanation,
  sponsorFeedback,
  partnerFeedback,
  csrFeedback,
  ask,
  offer,
  learningPoint,
}) {
  return {
    id,
    level,
    title,
    company,
    companyType,
    difficulty,
    situation,
    options: OPTIONS,
    correctAnswer,
    explanation,

    companyProfile: {
      goals: companyGoals,
      targetAudience: audience,
      availableResources: resources,
      history:
        history ||
        "Training scenario only. No real company collaboration is claimed.",
    },

    opportunity: {
      event: title,
      goal,
      audience,
      resourcesNeeded: resources,
    },

    answerFeedback: {
      Sponsor: sponsorFeedback,
      Partner: partnerFeedback,
      CSR: csrFeedback,
    },

    ask,
    offer,
    learningPoint,
  };
}

export const cases = [
  // ==========================================
  // LEVEL 1 — PR ROOKIE
  // Learn the basics
  // ==========================================

  makeCase({
    id: 1,
    level: 1,
    title: "Feed the Volunteers",
    company: "Famous",
    companyType: "Restaurant",
    difficulty: "Easy",

    situation:
      "Your team is organizing a student event in Minya. You need meals for 30 volunteers. The restaurant can provide the meals, and your team can offer agreed social media posts, logo placement, and event mentions. The main exchange is food support for promotional exposure.",

    goal: "Provide meals for event volunteers.",
    audience: "University students and event participants",
    resources: ["Meals", "Meal vouchers", "Promotional exposure"],
    companyGoals: [
      "Reach potential local customers",
      "Increase awareness among students",
    ],

    correctAnswer: "Sponsor",

    explanation:
      "Sponsorship is the strongest fit because the restaurant provides event support in exchange for agreed promotional benefits. The support can be in-kind rather than cash.",

    sponsorFeedback:
      "Strong choice! Food can be an in-kind sponsorship when it is exchanged for defined promotional benefits.",

    partnerFeedback:
      "Partnership could fit if the restaurant actively co-designed or delivered the event. Here, the main exchange is support for exposure.",

    csrFeedback:
      "Providing meals can have a social benefit, but the situation is primarily an event support and promotion arrangement.",

    ask:
      "Request 30 meals or meal vouchers for volunteers.",

    offer:
      "Offer agreed social media mentions, logo placement, and a short event report.",

    learningPoint:
      "Sponsorship can be cash or in-kind support in exchange for agreed benefits.",
  }),

  makeCase({
    id: 2,
    level: 1,
    title: "Student Discount Day",
    company: "Crepino",
    companyType: "Food & Beverage",
    difficulty: "Easy",

    situation:
      "Your team wants to organize a student discount campaign. The restaurant offers special vouchers, while your team promotes the offer to students. Both sides contribute to a campaign intended to attract customers and give students affordable options.",

    goal: "Create a mutually beneficial student offer.",
    audience: "University students",
    resources: ["Discount vouchers", "Social media promotion"],
    companyGoals: [
      "Reach students",
      "Encourage repeat visits",
      "Promote special offers",
    ],

    correctAnswer: "Partner",

    explanation:
      "Partnership is the strongest fit because both sides contribute to a shared campaign. The restaurant supplies discounts, and your team helps connect students with the offer.",

    sponsorFeedback:
      "Sponsorship could work if the restaurant pays for a defined advertising package. The scenario describes a shared promotional campaign instead.",

    partnerFeedback:
      "Correct! Both sides contribute something useful toward a shared outcome.",

    csrFeedback:
      "Student discounts can help students, but a discount campaign alone is not automatically CSR.",

    ask:
      "Request a unique student discount code and a clear offer period.",

    offer:
      "Offer student outreach, campaign promotion, and a summary of voucher engagement.",

    learningPoint:
      "A partnership involves mutual contribution toward a shared goal.",
  }),

  makeCase({
    id: 3,
    level: 1,
    title: "The Event Prize Fund",
    company: "McDonald's",
    companyType: "Food & Beverage",
    difficulty: "Easy",

    situation:
      "Your team is organizing a university competition. You request prizes or funding. In return, the brand receives agreed visibility on the event materials and social media. There is no joint program delivery or specific social-impact target in the brief.",

    goal: "Secure resources for a university competition.",
    audience: "Students and competition participants",
    resources: ["Prizes", "Meal vouchers", "Funding"],
    companyGoals: [
      "Reach a relevant audience",
      "Receive measurable promotional exposure",
    ],

    correctAnswer: "Sponsor",

    explanation:
      "Sponsorship is the strongest fit because the request focuses on event support in exchange for visibility.",

    sponsorFeedback:
      "Correct! The proposal offers a clear exchange between event support and promotional benefits.",

    partnerFeedback:
      "A partnership could work if both sides co-delivered the competition. That is not part of the current brief.",

    csrFeedback:
      "A student competition may be beneficial, but the primary arrangement described is promotional sponsorship.",

    ask:
      "Request a defined number of prizes, vouchers, or a contribution to event expenses.",

    offer:
      "Offer clear sponsor benefits and a post-event visibility report.",

    learningPoint:
      "Look at the actual exchange rather than assuming every large brand should be a sponsor.",
  }),

  makeCase({
    id: 4,
    level: 1,
    title: "Skills for Everyone",
    company: "A Local Bank",
    companyType: "Banking",
    difficulty: "Easy",

    situation:
      "Your team plans a free workshop to teach students basic budgeting and financial awareness. The main goal is to improve participants' knowledge, especially students who cannot access paid training. The bank may provide speakers or educational materials.",

    goal: "Improve access to financial education.",
    audience: "Students with limited access to financial education",
    resources: ["Speakers", "Workshop materials", "Educational support"],
    companyGoals: [
      "Support community education",
      "Increase financial awareness",
    ],

    correctAnswer: "CSR",

    explanation:
      "CSR is the strongest fit for the initiative's primary purpose: creating measurable community benefit through financial education. A bank might also sponsor or partner in delivering the activity.",

    sponsorFeedback:
      "Sponsorship could fund the event, but the initiative's main purpose is educational impact.",

    partnerFeedback:
      "A delivery partnership may be useful. The question asks for the initiative's primary purpose, which is social impact.",

    csrFeedback:
      "Correct! The main goal is to improve access to useful knowledge and create a community benefit.",

    ask:
      "Request speakers, accessible educational materials, and support for free participation.",

    offer:
      "Offer attendance figures, participant feedback, and learning outcome measurements.",

    learningPoint:
      "CSR is driven by a social or environmental purpose, not simply by positive publicity.",
  }),

  makeCase({
    id: 5,
    level: 1,
    title: "The Tech Challenge",
    company: "A Local Technology Company",
    companyType: "Technology",
    difficulty: "Easy",

    situation:
      "Your team is organizing an AI competition. The company can provide mentors and technical workshops. Your team will organize the competition, and the company will actively help students develop their projects.",

    goal: "Help students build practical technology skills.",
    audience: "Students interested in AI and software",
    resources: ["Technical mentors", "Workshops", "Software tools"],
    companyGoals: [
      "Connect with future talent",
      "Encourage practical technology learning",
    ],

    correctAnswer: "Partner",

    explanation:
      "Partnership is the strongest fit because both sides actively contribute to delivering the experience.",

    sponsorFeedback:
      "Sponsorship would fit if the company mainly provided resources for promotional benefits. Here, technical collaboration is central.",

    partnerFeedback:
      "Correct! The company provides expertise, and your team delivers the event with it.",

    csrFeedback:
      "The competition may create educational value, but the relationship described is active collaboration.",

    ask:
      "Request mentor hours, technical workshops, and access to relevant tools.",

    offer:
      "Offer an organized student program, community engagement, and project outcome reporting.",

    learningPoint:
      "When both sides actively contribute to delivering a shared activity, Partnership may be the best fit.",
  }),

  // ==========================================
  // LEVEL 2 — COMPANY DETECTIVE
  // Research and match the opportunity
  // ==========================================

  makeCase({
    id: 6,
    level: 2,
    title: "The Sports Day Deal",
    company: "Freekah",
    companyType: "Restaurant",
    difficulty: "Medium",

    situation:
      "Your team is preparing a sports day and needs refreshments and meal vouchers. You have learned that the restaurant may be interested in attracting students. You must propose a specific arrangement instead of simply asking for free food.",

    goal: "Arrange refreshments and reach a relevant student audience.",
    audience: "Students attending the sports day",
    resources: ["Meal vouchers", "Refreshments", "Special offers"],
    companyGoals: [
      "Reach potential customers",
      "Promote offers to students",
    ],

    correctAnswer: "Partner",

    explanation:
      "Partnership is the strongest fit if the restaurant and team jointly develop the student offer and contribute to its success. A paid promotional package could instead be sponsorship.",

    sponsorFeedback:
      "Possible if the restaurant provides support in exchange for a defined advertising package. The case emphasizes a shared offer.",

    partnerFeedback:
      "Strong choice! A shared offer can benefit both the event participants and the restaurant.",

    csrFeedback:
      "Providing refreshments does not automatically make an arrangement CSR. Identify the main objective first.",

    ask:
      "Request meal vouchers and agree on the discount, quantity, and redemption period.",

    offer:
      "Offer student outreach, event promotion, and a clear voucher distribution plan.",

    learningPoint:
      "Research helps you understand what the company may value, but the actual agreement determines the relationship.",
  }),

  makeCase({
    id: 7,
    level: 2,
    title: "The Café Community",
    company: "Arkan",
    companyType: "Café & Hospitality",
    difficulty: "Medium",

    situation:
      "Your team wants a venue for a small networking meetup. The venue may provide a suitable space, while your team organizes registration and brings participants. Both sides will coordinate the event, and each has responsibilities in making it happen.",

    goal: "Host a productive student networking meetup.",
    audience: "Students, graduates, and invited professionals",
    resources: ["Venue space", "Event coordination", "Promotion"],
    companyGoals: [
      "Attract relevant visitors",
      "Create a positive guest experience",
    ],

    correctAnswer: "Partner",

    explanation:
      "Partnership is the strongest fit because the venue and team share responsibilities in delivering the meetup. If the venue simply sells a package or provides space in exchange for advertising, sponsorship may be appropriate instead.",

    sponsorFeedback:
      "Could fit if the venue is providing a defined benefit in exchange for promotion. This case focuses on shared delivery.",

    partnerFeedback:
      "Correct! The venue and team coordinate resources and responsibilities toward a shared event.",

    csrFeedback:
      "A networking meetup can benefit students, but it is not automatically a CSR initiative.",

    ask:
      "Request a suitable venue arrangement and clarify capacity, timing, and included services.",

    offer:
      "Offer event organization, relevant attendance, and promotion of the meetup.",

    learningPoint:
      "Venue support can take different forms. Clarify whether the arrangement is a transaction, sponsorship, or real collaboration.",
  }),

  makeCase({
    id: 8,
    level: 2,
    title: "The Fashion Prize",
    company: "Mimo",
    companyType: "Retail",
    difficulty: "Medium",

    situation:
      "Your team is organizing a student challenge and needs prizes. The store may be able to provide products or gift vouchers. In return, you can offer a defined sponsor package with logo placement and social media mentions.",

    goal: "Secure prizes for competition winners.",
    audience: "Students and competition participants",
    resources: ["Products", "Gift vouchers", "Promotional placement"],
    companyGoals: [
      "Reach potential shoppers",
      "Showcase selected products",
    ],

    correctAnswer: "Sponsor",

    explanation:
      "Sponsorship is the strongest fit because the store provides prizes in exchange for agreed promotional benefits.",

    sponsorFeedback:
      "Correct! Products and gift vouchers can be in-kind sponsorship when exchanged for defined exposure.",

    partnerFeedback:
      "Partnership could fit if the store actively co-designed or delivered the challenge. The current brief focuses on prizes and visibility.",

    csrFeedback:
      "Donating products for a social-impact program could be part of CSR, but this case describes event prizes for promotional benefits.",

    ask:
      "Request specific prizes or gift vouchers and agree on their value and quantity.",

    offer:
      "Offer logo placement, event mentions, and a short summary of audience reach.",

    learningPoint:
      "In-kind sponsorship is still sponsorship when the value exchange is clear.",
  }),

  makeCase({
    id: 9,
    level: 2,
    title: "A Greener Neighborhood",
    company: "Benaa",
    companyType: "Real Estate",
    difficulty: "Medium",

    situation:
      "Your team wants to run a community campaign encouraging people to reduce waste and care for shared spaces. The proposal asks the company to support measurable activities, and the main success measure is community participation and environmental improvement rather than brand exposure.",

    goal: "Encourage responsible care for shared community spaces.",
    audience: "Local residents and students",
    resources: ["Campaign materials", "Volunteers", "Activity support"],
    companyGoals: [
      "Support community initiatives",
      "Encourage responsible use of shared spaces",
    ],

    correctAnswer: "CSR",

    explanation:
      "CSR is the strongest fit for the campaign's primary purpose because its central goal is community and environmental benefit. The company could also sponsor or partner in delivering activities.",

    sponsorFeedback:
      "Sponsorship could support individual activities, but the main objective is measurable community impact.",

    partnerFeedback:
      "A partner could help deliver the campaign. CSR best describes its primary impact-driven purpose.",

    csrFeedback:
      "Correct! The proposal prioritizes community outcomes rather than promotional exposure.",

    ask:
      "Request support for specific activities, volunteer resources, or educational materials.",

    offer:
      "Offer measurable participation and a transparent report on campaign outcomes.",

    learningPoint:
      "For CSR, define who benefits, what changes, and how the impact will be measured.",
  }),

  makeCase({
    id: 10,
    level: 2,
    title: "The Student Meal Campaign",
    company: "KFC",
    companyType: "Food & Beverage",
    difficulty: "Medium",

    situation:
      "Your team wants to launch a limited student meal offer. The restaurant would provide a special deal, and your team would promote it to a relevant audience. Before proposing it, you need to define the offer, expected reach, and how results will be tracked.",

    goal: "Create a student offer with measurable engagement.",
    audience: "University students",
    resources: ["Special meal offer", "Discount code", "Campaign promotion"],
    companyGoals: [
      "Reach relevant customers",
      "Measure campaign engagement",
    ],

    correctAnswer: "Partner",

    explanation:
      "Partnership is the strongest fit if the team and restaurant jointly develop and run the campaign. If the restaurant simply pays for advertising, the arrangement may be sponsorship instead.",

    sponsorFeedback:
      "Sponsorship may fit a paid advertising arrangement. This scenario focuses on jointly developing the offer.",

    partnerFeedback:
      "Correct! Both sides contribute to a shared campaign and can track its results.",

    csrFeedback:
      "A student offer may be useful, but a discount alone does not establish a CSR purpose.",

    ask:
      "Request a clear student offer with an agreed period and redemption method.",

    offer:
      "Offer targeted outreach, campaign promotion, and anonymized engagement statistics.",

    learningPoint:
      "A brand name does not determine the relationship. The details of the deal do.",
  }),

  // ==========================================
  // LEVEL 3 — PR STRATEGIST
  // Same company, different opportunity
  // ==========================================

  makeCase({
    id: 11,
    level: 3,
    title: "The Restaurant Pitch",
    company: "Dabousa",
    companyType: "Restaurant",
    difficulty: "Hard",

    situation:
      "Your team needs support for a large student event. You can offer three sponsorship packages with different visibility benefits. The restaurant is not expected to help organize the event; your goal is to present a clear proposal and show why the audience matters.",

    goal: "Secure event support through a defined proposal.",
    audience: "Students and event guests",
    resources: ["Event support", "Meal vouchers", "Promotional benefits"],
    companyGoals: [
      "Reach a relevant audience",
      "Receive clear promotional deliverables",
    ],

    correctAnswer: "Sponsor",

    explanation:
      "Sponsorship is the strongest fit because the proposal has defined support levels in exchange for promotional benefits.",

    sponsorFeedback:
      "Correct! A structured package makes the requested support and expected benefits clear.",

    partnerFeedback:
      "Partnership would be stronger if the restaurant shared responsibility for delivering the event.",

    csrFeedback:
      "The case does not define a primary social-impact objective; it focuses on event support and promotion.",

    ask:
      "Present tiered support packages and specify what each package includes.",

    offer:
      "Offer agreed visibility, event mentions, and a report of delivered benefits.",

    learningPoint:
      "A strong sponsorship proposal is specific, realistic, and transparent about the exchange.",
  }),

  makeCase({
    id: 12,
    level: 3,
    title: "The Innovation Challenge",
    company: "El Mohandes",
    companyType: "Real Estate",
    difficulty: "Hard",

    situation:
      "Your team is organizing a competition for ideas that improve local living spaces. The company can send professionals to mentor students, help assess feasibility, and provide feedback. Your team will organize the competition and coordinate the mentors.",

    goal: "Connect student ideas with practical industry knowledge.",
    audience: "Students interested in innovation and urban development",
    resources: ["Professional mentors", "Project feedback", "Competition support"],
    companyGoals: [
      "Engage with emerging talent",
      "Contribute practical expertise",
    ],

    correctAnswer: "Partner",

    explanation:
      "Partnership is the strongest fit because the company and team actively contribute expertise and organization to deliver the challenge.",

    sponsorFeedback:
      "Could fit if the company only provided funding or prizes in exchange for visibility. Here, the main contribution is active mentoring.",

    partnerFeedback:
      "Correct! The company brings professional knowledge, and your team organizes the program.",

    csrFeedback:
      "The competition may benefit the community, but the described relationship centers on collaboration and delivery.",

    ask:
      "Request mentor hours, feedback sessions, and participation in judging.",

    offer:
      "Offer a structured program, relevant student engagement, and a summary of project outcomes.",

    learningPoint:
      "Professional expertise can be a major partnership contribution even when no cash changes hands.",
  }),

  makeCase({
    id: 13,
    level: 3,
    title: "The Community Learning Day",
    company: "Arkan",
    companyType: "Hospitality",
    difficulty: "Hard",

    situation:
      "Your team wants to host a free learning day for young people who have limited access to educational activities. The venue may be able to help with space. The main priority is safe, accessible participation and a measurable educational outcome.",

    goal: "Provide free educational access to underserved young people.",
    audience: "Young people with limited access to educational activities",
    resources: ["Accessible space", "Learning materials", "Volunteer support"],
    companyGoals: [
      "Explore community engagement",
      "Support access to local activities",
    ],

    correctAnswer: "CSR",

    explanation:
      "CSR is the strongest fit for the initiative's primary purpose: educational access and community impact. A venue partnership could still be part of delivering the event.",

    sponsorFeedback:
      "Sponsorship might support the event, but the main objective is access to education.",

    partnerFeedback:
      "The venue could be a delivery partner. The overall initiative is primarily impact-driven.",

    csrFeedback:
      "Correct! The proposal starts with a defined community need and an intended outcome.",

    ask:
      "Request space or resources that remove barriers to free participation.",

    offer:
      "Offer participation data, feedback, and a report on educational outcomes.",

    learningPoint:
      "CSR begins with the community need and the intended impact, not with the company that might support it.",
  }),

  makeCase({
    id: 14,
    level: 3,
    title: "The Digital Marketing Lab",
    company: "Casa Bella",
    companyType: "Restaurant & Hospitality",
    difficulty: "Hard",

    situation:
      "Your team wants to help local businesses understand digital marketing. The business can share its own challenges and participate in a practical student workshop. Students will analyze a fictionalized business brief and present ideas, while the business provides feedback.",

    goal: "Create a practical learning experience through shared expertise.",
    audience: "Students interested in marketing and local businesses",
    resources: ["Business brief", "Feedback", "Workshop participation"],
    companyGoals: [
      "Explore student ideas",
      "Engage with the local student community",
    ],

    correctAnswer: "Partner",

    explanation:
      "Partnership is the strongest fit because both sides actively contribute to the learning activity. The business shares a challenge and feedback; the team organizes the workshop.",

    sponsorFeedback:
      "Sponsorship would fit a funding-for-visibility deal, which is not the central arrangement here.",

    partnerFeedback:
      "Correct! The business contributes a real-world learning context, and the team creates the workshop experience.",

    csrFeedback:
      "The activity may have educational value, but the relationship described is shared participation and delivery.",

    ask:
      "Request a business challenge, a representative, and feedback on student ideas.",

    offer:
      "Offer an organized workshop, student research, and practical recommendations.",

    learningPoint:
      "A strong partnership defines what each side contributes and what both sides will achieve.",
  }),

  makeCase({
    id: 15,
    level: 3,
    title: "One Brand, Two Missions",
    company: "McDonald's",
    companyType: "Food & Beverage",
    difficulty: "Hard",

    situation:
      "Your team is considering two possible activities with the same brand. Option A is a university event that needs prizes in exchange for logo placement. Option B is a long-term initiative to improve access to nutrition education for children, with defined community outcomes. You must classify Option B.",

    goal: "Identify the primary purpose of an impact-driven initiative.",
    audience: "Children and their families",
    resources: ["Educational materials", "Qualified contributors", "Program support"],
    companyGoals: [
      "Potentially support community education",
      "Engage with a relevant audience",
    ],

    correctAnswer: "CSR",

    explanation:
      "Option B is primarily CSR because it is designed around a defined social-impact goal. Option A is more naturally sponsorship. The same brand can participate in different types of relationships.",

    sponsorFeedback:
      "Option A is a sponsorship example. Option B is different because its primary goal is a defined community outcome.",

    partnerFeedback:
      "Partners could help deliver Option B, but CSR best describes the initiative's main purpose.",

    csrFeedback:
      "Correct! You evaluated the mission rather than assuming the company always needs the same relationship.",

    ask:
      "Request support tied to educational access, qualified delivery, and measurable outcomes.",

    offer:
      "Offer a clear impact plan, beneficiary safeguards, and transparent outcome reporting.",

    learningPoint:
      "The same company can be a sponsor for one activity and a supporter of a CSR initiative for another.",
  }),

  // ==========================================
  // LEVEL 4 — THE NEGOTIATOR
  // Handle objections and redesign the offer
  // ==========================================

  makeCase({
    id: 16,
    level: 4,
    title: "No Cash Available",
    company: "Surf & Turf",
    companyType: "Restaurant",
    difficulty: "Hard",

    situation:
      "You requested cash sponsorship for an event. The restaurant declines because it cannot allocate cash this month, but it may be able to provide meals or vouchers. You can revise the proposal and offer a realistic promotional package in exchange.",

    goal: "Adapt a proposal to available in-kind resources.",
    audience: "Event participants and volunteers",
    resources: ["Meals", "Vouchers", "Promotional placement"],
    companyGoals: [
      "Use available resources efficiently",
      "Reach relevant customers",
    ],

    correctAnswer: "Sponsor",

    explanation:
      "The strongest next move is an in-kind sponsorship proposal: request food or vouchers in exchange for agreed promotional benefits. Sponsorship does not have to be cash-only.",

    sponsorFeedback:
      "Correct! Adapt the request to the resources available and keep the value exchange clear.",

    partnerFeedback:
      "Could fit if the restaurant takes an active role in delivering the event. The confirmed option is product-based support.",

    csrFeedback:
      "There is no defined social-impact objective in the brief. The negotiation concerns event support and promotional value.",

    ask:
      "Offer an alternative package based on a specific number of meals or vouchers.",

    offer:
      "Agree on realistic promotional benefits and report what was delivered.",

    learningPoint:
      "When a company rejects your request, find out whether the issue is budget, timing, resources, or fit.",
  }),

  makeCase({
    id: 17,
    level: 4,
    title: "We Need More Than a Logo",
    company: "A Local Real Estate Company",
    companyType: "Real Estate",
    difficulty: "Hard",

    situation:
      "Your first proposal asks for funding in exchange for logo placement. The company says it wants to contribute expertise instead of simply paying for visibility. It can send professionals to mentor students and help evaluate project ideas. Your team must revise the relationship proposal.",

    goal: "Redesign the proposal around expertise and shared delivery.",
    audience: "Students working on local problem-solving projects",
    resources: ["Professional mentors", "Expert feedback", "Project evaluation"],
    companyGoals: [
      "Share professional expertise",
      "Engage with emerging talent",
    ],

    correctAnswer: "Partner",

    explanation:
      "Partnership is the strongest fit after the change because the company will actively contribute expertise to the program instead of only providing funding for exposure.",

    sponsorFeedback:
      "Your original proposal was sponsorship-oriented. The company has now offered active participation, so the relationship should be reconsidered.",

    partnerFeedback:
      "Correct! You listened to the company's response and redesigned the proposal around shared delivery.",

    csrFeedback:
      "The projects may have social value, but the immediate relationship is professional collaboration.",

    ask:
      "Request a defined number of mentoring sessions and evaluation hours.",

    offer:
      "Offer organized sessions, prepared participants, and a clear schedule and outcome report.",

    learningPoint:
      "A negotiation can change the best relationship type when the company's contribution changes.",
  }),

  makeCase({
    id: 18,
    level: 4,
    title: "The Discount Is Too Small",
    company: "Crepino",
    companyType: "Food & Beverage",
    difficulty: "Hard",

    situation:
      "The restaurant agrees to offer a discount, but the offer is not attractive enough to encourage students to participate. You need to renegotiate the terms, clarify the expected student reach, and suggest a way to track results. Both sides are open to adjusting the campaign.",

    goal: "Improve a shared offer so it benefits both sides.",
    audience: "University students",
    resources: ["Discount code", "Offer period", "Campaign promotion"],
    companyGoals: [
      "Reach interested customers",
      "Evaluate campaign results",
    ],

    correctAnswer: "Partner",

    explanation:
      "Partnership remains the strongest fit if both sides adjust and deliver a shared campaign. The next step is to negotiate a useful offer and measurable outcomes.",

    sponsorFeedback:
      "Sponsorship could be appropriate for a paid promotional package, but the scenario focuses on adjusting a shared offer.",

    partnerFeedback:
      "Correct! Negotiate terms that are attractive to students and useful to the restaurant.",

    csrFeedback:
      "A discount campaign is not automatically CSR. The primary objective is mutual benefit.",

    ask:
      "Negotiate a stronger discount, a limited-time bundle, or a clearer redemption offer.",

    offer:
      "Offer targeted promotion, a defined campaign period, and anonymized engagement results.",

    learningPoint:
      "Negotiation means improving the agreement, not just repeating the first request.",
  }),

  makeCase({
    id: 19,
    level: 4,
    title: "The Visibility Objection",
    company: "KFC",
    companyType: "Food & Beverage",
    difficulty: "Hard",

    situation:
      "A representative says your event proposal promises social media exposure but does not explain the audience, expected reach, or deliverables. The company asks why it should support the event. You need to improve the proposal before asking again.",

    goal: "Make a sponsorship proposal measurable and credible.",
    audience: "Students and event attendees",
    resources: ["Event support", "Promotional deliverables", "Audience data"],
    companyGoals: [
      "Understand expected reach",
      "Evaluate promotional value",
    ],

    correctAnswer: "Sponsor",

    explanation:
      "Sponsorship is still the strongest fit, but the proposal needs measurable deliverables, a relevant audience description, and realistic expectations.",

    sponsorFeedback:
      "Correct! Keep the sponsorship model but improve the evidence and deliverables in your proposal.",

    partnerFeedback:
      "Partnership could fit if both sides actively deliver the event together. The current objection is about the sponsorship value offered.",

    csrFeedback:
      "The scenario does not define a primary social-impact initiative; it asks you to improve a promotional proposal.",

    ask:
      "Present a specific support request and a clear list of promotional deliverables.",

    offer:
      "Describe the audience, planned posts, logo placements, and post-event reporting without inventing reach figures.",

    learningPoint:
      "Never promise vague or unverified exposure. A credible proposal defines deliverables and reports honestly.",
  }),

  makeCase({
    id: 20,
    level: 4,
    title: "The Final PR Mission",
    company: "Local Business Coalition",
    companyType: "Multiple Local Businesses",
    difficulty: "Hard",

    situation:
      "Your team is preparing a community initiative to provide free career guidance to young people. One business can fund the event in exchange for visibility. Another can provide professionals to deliver sessions. A third wants to support the initiative's long-term social outcomes. Your task is to recommend the right relationship for the business whose main contribution is delivering expert sessions with your team.",

    goal: "Match each contribution to the right relationship.",
    audience: "Young people seeking career guidance",
    resources: [
      "Event funding",
      "Professional speakers",
      "Career workshops",
      "Impact measurement",
    ],
    companyGoals: [
      "Contribute relevant resources",
      "Support youth development",
    ],

    correctAnswer: "Partner",

    explanation:
      "Partnership is the strongest fit for the business that actively provides professionals and works with your team to deliver the sessions. The funding-for-visibility business is more naturally a sponsor, while the long-term impact initiative may be CSR-oriented.",

    sponsorFeedback:
      "Sponsorship best describes the business providing funding in exchange for visibility, not the business delivering expert sessions with your team.",

    partnerFeedback:
      "Correct! You matched the relationship to the actual contribution and distinguished it from the other two opportunities.",

    csrFeedback:
      "CSR may describe the initiative's social purpose, but the question asks about the business actively co-delivering sessions with your team.",

    ask:
      "Request qualified professionals, defined session hours, and help planning the workshops.",

    offer:
      "Offer an organized program, prepared participants, feedback collection, and an outcomes report.",

    learningPoint:
      "A single initiative can have sponsors, delivery partners, and a CSR purpose at the same time. Identify exactly which relationship you are proposing.",
  }),
];
