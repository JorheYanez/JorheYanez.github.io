/* Sample portfolio + resume content for the profile mockup (all fictional).
   Kept apart from BC_SEED so it shows up for visitors who already have saved data.
   art: house | tower | bridge | landscape | interior | site | roof */
window.BC_PORTFOLIO = {
  p1: {
    kind: "Company", team: "24-person crew", founded: 2007,
    projects: [
      { title: "Hillside Modern Residence", art: "house", year: 2025, place: "West Lake Hills, TX", role: "General contractor", value: "$2.4M", size: "4,800 sq ft",
        text: "Ground-up custom home on a sloped lot with a cantilevered upper floor, steel moment frame and full site retaining." },
      { title: "South Congress Tenant Finish-Out", art: "interior", year: 2024, place: "Austin, TX", role: "General contractor", value: "$680K", size: "6,200 sq ft",
        text: "Restaurant and retail finish-out delivered in 11 weeks, including grease interceptor, storefront and ADA upgrades." },
      { title: "Two-Story Rear Addition", art: "house", year: 2024, place: "Round Rock, TX", role: "Design-build", value: "$310K", size: "1,150 sq ft",
        text: "Primary suite and flex room added over a new slab, matched to the existing 1990s brick exterior." },
      { title: "Cedar Park Medical Office", art: "tower", year: 2023, place: "Cedar Park, TX", role: "General contractor", value: "$3.1M", size: "12,000 sq ft",
        text: "Single-story tilt-wall medical office building with imaging suite shielding and phased occupancy." }
    ],
    resume: [
      { title: "Owner & President", org: "Maria Delgado Builders", start: 2007, end: null, text: "Runs estimating, permitting and field operations for 30–40 projects a year." },
      { title: "Project Manager", org: "Hill Country Construction", start: 2001, end: 2007, text: "Managed custom residential builds from $500K to $2M." },
      { title: "Assistant Superintendent", org: "Lone Star Commercial", start: 1998, end: 2001, text: "Scheduling and subcontractor coordination on retail and office shells." }
    ],
    education: ["B.S. Construction Science, Texas A&M University", "NAHB Certified Green Professional"]
  },
  p2: {
    kind: "Individual", team: "Solo practice + 2 associates", founded: 2009,
    projects: [
      { title: "Alder Street Passive House", art: "house", year: 2025, place: "Portland, OR", role: "Architect of record", value: "$1.1M", size: "2,300 sq ft",
        text: "Certified Passive House with a CLT roof, triple-glazed windows and an HRV, using 80% less heating energy than code." },
      { title: "Backyard ADU Series", art: "house", year: 2024, place: "Portland, OR", role: "Designer", value: "$240K each", size: "640 sq ft",
        text: "A permit-ready ADU design built five times across the city, with a shared prefab wall system." },
      { title: "Mass Timber Duplex", art: "tower", year: 2023, place: "Eugene, OR", role: "Architect of record", value: "$1.8M", size: "4,100 sq ft",
        text: "Two side-by-side units on an exposed glulam frame." }
    ],
    resume: [
      { title: "Principal", org: "Watanabe Architecture", start: 2009, end: null, text: "Residential and small multifamily design, Passive House consulting." },
      { title: "Project Architect", org: "Northwest Collaborative", start: 2003, end: 2009, text: "Led schools and civic projects through construction administration." }
    ],
    education: ["M.Arch, University of Oregon", "Certified Passive House Designer (PHI)"]
  },
  p3: {
    kind: "Individual", team: "Independent consultant", founded: 2016,
    projects: [
      { title: "Mission Street Soft-Story Retrofit", art: "tower", year: 2025, place: "San Francisco, CA", role: "Engineer of record", value: "$420K", size: "4 stories, 16 units",
        text: "Mandatory soft-story retrofit with steel moment frames at the garage level, done while tenants stayed in place." },
      { title: "Oakland Mid-Rise Peer Review", art: "tower", year: 2024, place: "Oakland, CA", role: "Peer reviewer", value: "—", size: "7 stories",
        text: "Independent peer review of a post-tensioned concrete podium with a wood-frame residential tower above." },
      { title: "Pedestrian Bridge Assessment", art: "bridge", year: 2023, place: "San Jose, CA", role: "Structural engineer", value: "$95K", size: "180 ft span",
        text: "Seismic evaluation and retrofit design for a 1970s steel truss pedestrian bridge." },
      { title: "Hayes Valley Steel Addition", art: "site", year: 2022, place: "San Francisco, CA", role: "Engineer of record", value: "$1.3M", size: "2-story vertical addition",
        text: "Light-gauge and structural steel vertical addition over an existing concrete building." }
    ],
    resume: [
      { title: "Principal Structural Engineer", org: "Raman Structural (independent)", start: 2016, end: null, text: "Seismic retrofit, mid-rise design and third-party peer review." },
      { title: "Senior Engineer", org: "Bay Structural Partners", start: 2013, end: 2016, text: "Steel and concrete design for 5–12 story residential and lab buildings." },
      { title: "Staff Engineer", org: "Pacific Engineering Group", start: 2010, end: 2013, text: "Analysis in ETABS and SAP2000, construction-phase site visits." }
    ],
    education: ["M.S. Structural Engineering, UC Berkeley", "B.Tech Civil Engineering, IIT Madras"]
  },
  p10: {
    kind: "Company", team: "12-person studio", founded: 1995,
    projects: [
      { title: "Riverfront Office Lofts", art: "tower", year: 2025, place: "Minneapolis, MN", role: "Architect", value: "$14M", size: "62,000 sq ft",
        text: "Adaptive reuse of a 1910s warehouse into creative office space with a new rooftop terrace." },
      { title: "Northside Library Branch", art: "interior", year: 2023, place: "St. Paul, MN", role: "Architect", value: "$6.5M", size: "18,000 sq ft",
        text: "A daylit public library with a community room that opens to a new plaza." },
      { title: "Lakeshore Pavilion", art: "landscape", year: 2022, place: "Duluth, MN", role: "Architect", value: "$1.2M", size: "3,000 sq ft",
        text: "A timber park pavilion with restrooms and a warming room for winter use." }
    ],
    resume: [
      { title: "Studio founded", org: "Studio Halvorsen", start: 1995, end: null, text: "Commercial, civic and adaptive-reuse architecture across the Upper Midwest." }
    ],
    education: ["AIA Minnesota Firm Award, 2024"]
  }
};
