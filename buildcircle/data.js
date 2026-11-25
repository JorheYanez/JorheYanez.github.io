/* Taxonomy + seed data for BuildCircle (all people below are fictional). */
window.BC_CATEGORIES = {
  Contractor: {
    color: "var(--contractor)",
    subs: ["General Contractor", "Electrical", "Plumbing", "HVAC", "Roofing", "Concrete & Masonry", "Carpentry", "Remodeling"],
    licenseTypes: ["General Contractor License", "Master Electrician", "Journeyman Electrician", "Master Plumber", "HVAC Contractor", "Roofing Contractor", "Home Improvement License", "OSHA 30"]
  },
  Architect: {
    color: "var(--architect)",
    subs: ["Residential", "Commercial", "Landscape", "Interior", "Urban Design", "Historic Preservation"],
    licenseTypes: ["Registered Architect (RA)", "NCARB Certificate", "Landscape Architect (RLA)", "LEED AP BD+C", "NCIDQ"]
  },
  Engineer: {
    color: "var(--engineer)",
    subs: ["Structural", "Civil", "Mechanical (MEP)", "Electrical", "Geotechnical", "Environmental"],
    licenseTypes: ["Professional Engineer (PE)", "Structural Engineer (SE)", "Engineer in Training (EIT)", "LEED AP", "PMP"]
  }
};

window.BC_SEED = (function () {
  const d = (daysAgo) => new Date(Date.now() - daysAgo * 864e5).toISOString();
  const pros = [
    { id: "p1", name: "Maria Delgado Builders", category: "Contractor", sub: "General Contractor", location: "Austin, TX", years: 18, rate: 95, available: true,
      headline: "Custom homes & ground-up builds, on time and on budget",
      bio: "Family-run general contracting firm handling custom residential builds, additions and light commercial tenant finish-outs across Central Texas.",
      tags: ["Custom homes", "Additions", "Tenant finish-out", "Permitting"],
      licenses: [{ type: "General Contractor License", number: "GC-448120", state: "TX", expires: "2027-08-31", verified: true }, { type: "OSHA 30", number: "OS-30-99812", state: "US", expires: "2028-01-15", verified: true }],
      connections: 214, joined: d(900) },
    { id: "p2", name: "Kenji Watanabe, AIA", category: "Architect", sub: "Residential", location: "Portland, OR", years: 22, rate: 165, available: true,
      headline: "Passive-house residential architect",
      bio: "Designs energy-efficient homes and ADUs with a focus on daylight, timber and Passive House standards.",
      tags: ["Passive House", "ADUs", "Mass timber", "Revit"],
      licenses: [{ type: "Registered Architect (RA)", number: "OR-6631", state: "OR", expires: "2027-12-31", verified: true }, { type: "NCARB Certificate", number: "NC-77120", state: "US", expires: "2027-06-30", verified: true }],
      connections: 389, joined: d(1200) },
    { id: "p3", name: "Priya Raman, PE, SE", category: "Engineer", sub: "Structural", location: "San Francisco, CA", years: 15, rate: 185, available: false,
      headline: "Seismic retrofits and mid-rise structural design",
      bio: "Structural engineer specializing in soft-story retrofits, steel and concrete mid-rise, and peer review.",
      tags: ["Seismic retrofit", "Steel", "Concrete", "ETABS"],
      licenses: [{ type: "Structural Engineer (SE)", number: "S-6120", state: "CA", expires: "2027-03-31", verified: true }, { type: "Professional Engineer (PE)", number: "C-81902", state: "CA", expires: "2027-03-31", verified: true }],
      connections: 302, joined: d(700) },
    { id: "p4", name: "Bright Line Electric", category: "Contractor", sub: "Electrical", location: "Denver, CO", years: 11, rate: 110, available: true,
      headline: "Residential & commercial electrical, EV chargers, solar tie-ins",
      bio: "Master-electrician-led crew for service upgrades, panel replacements, EV charging and solar interconnects.",
      tags: ["EV chargers", "Panel upgrades", "Solar", "Generators"],
      licenses: [{ type: "Master Electrician", number: "ME.0102938", state: "CO", expires: "2026-09-30", verified: true }],
      connections: 128, joined: d(500) },
    { id: "p5", name: "Ana Sofía Ortiz", category: "Architect", sub: "Landscape", location: "Phoenix, AZ", years: 9, rate: 120, available: true,
      headline: "Xeriscape and desert-adapted landscape architecture",
      bio: "Landscape architect designing water-wise residential and municipal landscapes, stormwater and shade planning.",
      tags: ["Xeriscape", "Stormwater", "Parks", "AutoCAD"],
      licenses: [{ type: "Landscape Architect (RLA)", number: "LA-55019", state: "AZ", expires: "2027-05-31", verified: true }],
      connections: 97, joined: d(400) },
    { id: "p6", name: "Tom Brennan Plumbing", category: "Contractor", sub: "Plumbing", location: "Chicago, IL", years: 27, rate: 105, available: true,
      headline: "Master plumber — repipes, remodels, and code corrections",
      bio: "Third-generation plumber. Full repipes, bathroom and kitchen remodels, water heaters, and inspections.",
      tags: ["Repipes", "Water heaters", "Remodels", "Backflow"],
      licenses: [{ type: "Master Plumber", number: "058-123456", state: "IL", expires: "2027-04-30", verified: true }],
      connections: 176, joined: d(1500) },
    { id: "p7", name: "Grace Okafor, PE", category: "Engineer", sub: "Civil", location: "Atlanta, GA", years: 13, rate: 150, available: true,
      headline: "Site development, grading and stormwater design",
      bio: "Civil engineer for subdivisions, commercial site plans, grading, drainage and utility design.",
      tags: ["Site plans", "Stormwater", "Grading", "Civil 3D"],
      licenses: [{ type: "Professional Engineer (PE)", number: "PE041122", state: "GA", expires: "2027-12-31", verified: true }, { type: "PMP", number: "PMP-2219034", state: "US", expires: "2026-02-28", verified: false }],
      connections: 241, joined: d(800) },
    { id: "p8", name: "Summit Roofing Co.", category: "Contractor", sub: "Roofing", location: "Charlotte, NC", years: 7, rate: 85, available: false,
      headline: "Storm damage, re-roofs, and metal roofing",
      bio: "Shingle, metal and low-slope roofing. Insurance claim support and warranty-backed installs.",
      tags: ["Metal roofs", "Storm damage", "Insurance claims"],
      licenses: [{ type: "Roofing Contractor", number: "RC-31977", state: "NC", expires: "2026-12-31", verified: false }],
      connections: 64, joined: d(300) },
    { id: "p9", name: "Luis Moreno, PE", category: "Engineer", sub: "Mechanical (MEP)", location: "Miami, FL", years: 19, rate: 160, available: true,
      headline: "MEP design for multifamily and hospitality",
      bio: "Leads mechanical, electrical and plumbing design for hotels, condos and restaurants. Energy modeling and commissioning.",
      tags: ["HVAC design", "Energy modeling", "Commissioning", "Revit MEP"],
      licenses: [{ type: "Professional Engineer (PE)", number: "PE71230", state: "FL", expires: "2027-02-28", verified: true }, { type: "LEED AP", number: "LA-10293847", state: "US", expires: "2027-09-30", verified: true }],
      connections: 198, joined: d(1000) },
    { id: "p10", name: "Studio Halvorsen", category: "Architect", sub: "Commercial", location: "Minneapolis, MN", years: 31, rate: 190, available: true,
      headline: "Commercial, civic and adaptive-reuse architecture",
      bio: "Mid-size studio delivering offices, libraries and adaptive reuse of historic warehouses.",
      tags: ["Adaptive reuse", "Civic", "Offices", "LEED"],
      licenses: [{ type: "Registered Architect (RA)", number: "MN-21880", state: "MN", expires: "2026-06-30", verified: true }, { type: "LEED AP BD+C", number: "LB-55001", state: "US", expires: "2027-11-30", verified: true }],
      connections: 455, joined: d(1800) },
    { id: "p11", name: "CoolAir HVAC Services", category: "Contractor", sub: "HVAC", location: "Phoenix, AZ", years: 5, rate: 90, available: true,
      headline: "Heat pumps, mini-splits and AC replacements",
      bio: "Fast installs and honest repair quotes for residential HVAC. NATE-certified techs.",
      tags: ["Heat pumps", "Mini-splits", "Ductwork"],
      licenses: [{ type: "HVAC Contractor", number: "ROC-331004", state: "AZ", expires: "2027-01-31", verified: true }],
      connections: 52, joined: d(200) },
    { id: "p12", name: "Hannah Schultz, EIT", category: "Engineer", sub: "Geotechnical", location: "Seattle, WA", years: 3, rate: 95, available: true,
      headline: "Geotech investigations and foundation recommendations",
      bio: "Early-career geotechnical engineer: soil borings, slope stability and foundation recommendations for residential lots.",
      tags: ["Soil borings", "Slope stability", "Foundations"],
      licenses: [{ type: "Engineer in Training (EIT)", number: "EIT-20931", state: "WA", expires: "2029-01-01", verified: true }],
      connections: 41, joined: d(120) },
    { id: "p13", name: "Ironwood Carpentry", category: "Contractor", sub: "Carpentry", location: "Nashville, TN", years: 14, rate: 80, available: true,
      headline: "Finish carpentry, built-ins and timber framing",
      bio: "Custom cabinetry, built-ins, staircases, and exposed timber framing.",
      tags: ["Built-ins", "Timber framing", "Stairs"],
      licenses: [{ type: "Home Improvement License", number: "HI-7741", state: "TN", expires: "2027-07-31", verified: true }],
      connections: 88, joined: d(650) },
    { id: "p14", name: "Rebecca Lin, NCIDQ", category: "Architect", sub: "Interior", location: "New York, NY", years: 12, rate: 175, available: false,
      headline: "Workplace and hospitality interiors",
      bio: "Interior architecture for restaurants, boutique hotels and offices, from concept through FF&E.",
      tags: ["Hospitality", "FF&E", "Workplace"],
      licenses: [{ type: "NCIDQ", number: "NCIDQ-031887", state: "US", expires: "2027-12-31", verified: true }],
      connections: 267, joined: d(950) }
  ];

  /* Fictional contact details: 555-01xx numbers and reserved .example domains. */
  const contacts = {
    p1: ["(512) 555-0142", "hello@delgadobuilders.example", "delgadobuilders.example"],
    p2: ["(503) 555-0118", "kenji@watanabe-arch.example", "watanabe-arch.example"],
    p3: ["(415) 555-0177", "priya@ramanstructural.example", "ramanstructural.example"],
    p4: ["(303) 555-0131", "service@brightline.example", "brightline.example"],
    p5: ["(602) 555-0164", "ana@ortizla.example", "ortizla.example"],
    p6: ["(312) 555-0109", "tom@brennanplumbing.example", "brennanplumbing.example"],
    p7: ["(404) 555-0156", "grace@okaforcivil.example", "okaforcivil.example"],
    p8: ["(704) 555-0190", "estimates@summitroofing.example", "summitroofing.example"],
    p9: ["(305) 555-0123", "luis@morenomep.example", "morenomep.example"],
    p10: ["(612) 555-0185", "studio@halvorsen.example", "halvorsen.example"],
    p11: ["(480) 555-0147", "book@coolairhvac.example", "coolairhvac.example"],
    p12: ["(206) 555-0138", "hannah@schultzgeo.example", "schultzgeo.example"],
    p13: ["(615) 555-0172", "shop@ironwood.example", "ironwood.example"],
    p14: ["(212) 555-0161", "rebecca@lininteriors.example", "lininteriors.example"]
  };
  pros.forEach((p) => {
    const c = contacts[p.id];
    p.contact = { phone: c[0], email: c[1], website: c[2] };
  });

  const R = (id, proId, author, role, rating, project, text, days, helpful) =>
    ({ id, proId, author, role, rating, project, text, date: d(days), helpful: helpful || 0 });
  const reviews = [
    R("r1", "p1", "Jason K.", "Homeowner", 5, "Custom home", "Maria's team built our 3,200 sq ft home and finished two weeks early. Weekly updates, clean site, zero surprise change orders.", 12, 8),
    R("r2", "p1", "Kenji Watanabe, AIA", "Architect", 5, "Passive house build", "Best GC I've worked with on airtightness details. They actually read the drawings.", 40, 5),
    R("r3", "p1", "Lauren P.", "Homeowner", 4, "Addition", "Great quality. Scheduling slipped a bit during permitting but communication was excellent.", 95, 2),
    R("r4", "p2", "Erin M.", "Homeowner", 5, "ADU", "Kenji designed our backyard ADU — light-filled, efficient, and he navigated city review for us.", 20, 6),
    R("r5", "p2", "Maria Delgado Builders", "Contractor", 5, "Custom home", "Drawings are thorough and buildable. RFIs answered same day.", 60, 4),
    R("r6", "p3", "Mission St HOA", "Property owner", 5, "Soft-story retrofit", "Priya made a complicated retrofit understandable and the city approved on first submission.", 30, 7),
    R("r7", "p3", "Studio Halvorsen", "Architect", 4, "Mid-rise office", "Rigorous and responsive. Fees are on the higher end but worth it.", 150, 1),
    R("r8", "p4", "Sam T.", "Homeowner", 5, "EV charger", "Installed a 60A charger and upgraded our panel in one day. Tidy work.", 8, 3),
    R("r9", "p4", "Greg L.", "Homeowner", 3, "Service upgrade", "Work was good, but they arrived late twice and the invoice came in above estimate.", 70, 2),
    R("r10", "p5", "City of Tempe Parks", "Municipal client", 5, "Park renovation", "Ana Sofía's planting plan cut irrigation use by 40%.", 45, 4),
    R("r11", "p6", "Diane W.", "Homeowner", 5, "Full repipe", "Replaced all galvanized pipe in a 1920s bungalow with minimal wall damage. Fair price.", 15, 5),
    R("r12", "p6", "Ironwood Carpentry", "Contractor", 4, "Kitchen remodel", "Reliable sub. Shows up when he says he will.", 120, 1),
    R("r13", "p7", "Peachtree Dev LLC", "Developer", 5, "Subdivision", "Grace got our 40-lot site plan through county review with one comment round.", 25, 3),
    R("r14", "p8", "Mike R.", "Homeowner", 3, "Re-roof", "Roof looks great but cleanup missed a lot of nails in the driveway.", 35, 2),
    R("r15", "p8", "Tasha B.", "Homeowner", 4, "Storm damage", "Helped with the insurance adjuster, which was a big relief.", 80, 1),
    R("r16", "p9", "Coral Hotel Group", "Developer", 5, "Hotel MEP", "Energy model was spot on; commissioning went smoothly.", 55, 2),
    R("r17", "p10", "Hennepin County", "Municipal client", 5, "Library", "Beautiful, community-driven design process.", 100, 6),
    R("r18", "p10", "Priya Raman, PE, SE", "Engineer", 5, "Warehouse reuse", "Great collaborators who respect structural constraints.", 200, 2),
    R("r19", "p11", "Jorge A.", "Homeowner", 4, "Heat pump", "Quick install, honest quote. Thermostat setup needed a follow-up visit.", 10, 1),
    R("r20", "p13", "Beth C.", "Homeowner", 5, "Built-ins", "Library wall built-ins are stunning. True craftsman.", 18, 4),
    R("r21", "p14", "Noodle Bar NYC", "Business owner", 5, "Restaurant fit-out", "Rebecca turned a narrow space into our best-performing location.", 50, 3),
    R("r22", "p12", "Grace Okafor, PE", "Engineer", 4, "Residential lot", "Clear, well-organized geotech report. Promising young engineer.", 22, 2),
    R("r23", "p9", "Studio Halvorsen", "Architect", 4, "Office", "Solid coordination, a few clashes caught late in BIM.", 140, 0)
  ];
  return { pros, reviews };
})();

/* Membership plans. Prices are placeholders; no payment is processed in this demo. */
window.BC_PLANS = {
  free: {
    name: "Free",
    tagline: "Find and connect with pros",
    features: [
      "Browse the full directory",
      "Filter by category, specialty, experience & rating",
      "See star ratings and review counts",
      "Create your own pro profile",
      "Connect with other pros",
      "Write reviews"
    ]
  },
  pro: {
    name: "Pro",
    tagline: "Hire and partner with confidence",
    monthly: 19,
    annual: 190,
    features: [
      "Everything in Free, plus:",
      "Read every review of other businesses",
      "Contact info: phone, email & website",
      "Full license details: numbers, states, expiry & verification status",
      "Filter by license state and license type",
      "Search by license number",
      "Pro badge on your profile"
    ]
  }
};
