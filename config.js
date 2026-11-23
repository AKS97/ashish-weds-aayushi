/* Edit only confirmed wedding details here. Empty values are intentionally unfilled. */
window.WEDDING_CONFIG = {
  couple: {
    groom: { en: "Ashish", hi: "आशीष", honorific: "Er." },
    bride: { en: "Aayushi", hi: "आयुषी", honorific: "Dr." }
  },
  // User-approved Hindi wording; the original English details stay below.
  translations: {
    hi: {
      "weds": "संग",
      "Er.": "इंजी",
      "Dr.": "डॉ.",
      "Luckhnow": "लखनऊ",
      "S/o SMT Beena & SH Lokendra Pal Singh": "श्रीमती बीना एवं श्री लोकेंद्र पाल सिंह के सुपुत्र",
      "D/o SMT Neeta & SH Anuj Singh": "श्रीमती नीता एवं श्री अनुज सिंह की सुपुत्री",
      "With the blessings of our families, a beautiful forever begins...": "हमारे परिवारों के आशीर्वाद से, शुरू हो रहा है जीवनभर का एक खूबसूरत साथ...",
      "Together with our families, we warmly invite you to celebrate the beginning of our forever": "हम अपने परिवारों सहित, जीवनभर के इस खूबसूरत साथ की शुरुआत का उत्सव मनाने के लिए आपको सप्रेम आमंत्रित करते हैं",
      "Golden Blossom Imperial Resorts": "गोल्डन ब्लॉसम इम्पीरियल रिसॉर्ट्स",
      "Monday": "सोमवार",
      "Monday, 08/02/2027": "सोमवार, 08/02/2027",
      "Tuesday": "मंगलवार",
      "Tuesday, 09/02/2027": "मंगलवार, 09/02/2027",
      "HALDI HUNGAMA": "हल्दी हंगामा",
      "Hues of Sunshine": "धूप के सुनहरे रंग",
      "Liquid (Poolside Banquet)": "लिक्विड (पूलसाइड बैंक्वेट)",
      "THE GREEN GALA": "द ग्रीन गाला",
      "Mehendi Mosaic": "मेहंदी मोज़ेक",
      "GLITTER AND GROVES": "ग्लिटर एंड ग्रोव्स",
      "Sitaron ki Mehefil": "सितारों की महफ़िल",
      "Golden Colosseum 4": "गोल्डन कोलोसियम 4",
      "SHAGANA DI SHAAM": "शगना दी शाम",
      "Golden Oak (Front Lawn)": "गोल्डन ओक (फ्रंट लॉन)"
    }
  },
  city: "Luckhnow",
  timezone: "Asia/Kolkata",
  weddingDate: "09/02/2027",
  muhurat: "2027-02-09T19:00:00+05:30",
  weddingTime: "7 PM",
  weddingNote: { en: "Followed by Dinner & Ashirwad", hi: "तत्पश्चात रात्रिभोज एवं आशीर्वाद" },
  venue: "Golden Blossom Imperial Resorts",
  venueMapUrl: "https://maps.app.goo.gl/TrByfiT13atFGGMi6",
  // Supply the final public URL before sharing so Open Graph metadata can be absolute.
  siteUrl: "",
  assets: {
    monogram: "assets/monogram.png",
    instrumental: "assets/Tainu-Leke.mp3",
    invitationFilm: "",
    socialImage: "assets/social-preview.png"
  },
  // Copy each original card line exactly, including punctuation and honorifics.
  // Strings are preserved in both languages; {en, hi} may be used only for approved translations.
  family: {
    groom: { parents: "S/o SMT Beena & SH Lokendra Pal Singh", blessing: ["With the blessings of our families, a beautiful forever begins..."], invitation: ["Together with our families, we warmly invite you to celebrate the beginning of our forever"], rsvp: [] },
    bride: { parents: "D/o SMT Neeta & SH Anuj Singh", blessing: ["With the blessings of our families, a beautiful forever begins..."], invitation: ["Together with our families, we warmly invite you to celebrate the beginning of our forever"], rsvp: [] }
  },
  events: [
    {
      id: "haldi-hungama",
      title: "HALDI HUNGAMA",
      subtitle: "Hues of Sunshine",
      date: "Monday, 08/02/2027",
      time: "9 AM",
      startsAt: "2027-02-08T09:00:00+05:30",
      venue: "Liquid (Poolside Banquet)",
      image: "assets/haldi-hungama.png",
      dressCode: "",
      note: ""
    },
    {
      id: "the-green-gala",
      title: "THE GREEN GALA",
      subtitle: "Mehendi Mosaic",
      date: "Monday, 08/02/2027",
      time: "1 PM",
      startsAt: "2027-02-08T13:00:00+05:30",
      venue: "Liquid (Poolside Banquet)",
      image: "assets/the-green-gala.png",
      dressCode: "",
      note: ""
    },
    {
      id: "glitter-and-groves",
      title: "GLITTER AND GROVES",
      subtitle: "Sitaron ki Mehefil",
      date: "Monday, 08/02/2027",
      time: "7:30 PM",
      startsAt: "2027-02-08T19:30:00+05:30",
      venue: "Golden Colosseum 4",
      image: "assets/glitter-and-groves.png",
      dressCode: "",
      note: ""
    },
    {
      id: "shagana-di-shaam",
      title: "SHAGANA DI SHAAM",
      date: "Tuesday, 09/02/2027",
      time: "7:00 PM",
      startsAt: "2027-02-09T19:00:00+05:30",
      venue: "Golden Oak (Front Lawn)",
      image: "assets/shagana-di-shaam.png",
      dressCode: "",
      note: ""
    }
  ],
  // Add only your actual photographs: { src: "assets/photo.jpg", alt: "Approved description", caption: "" }.
  gallery: []
};
