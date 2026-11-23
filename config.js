/* Edit only confirmed wedding details here. Empty values are intentionally unfilled. */
window.WEDDING_CONFIG = {
  couple: {
    groom: { en: "Ashish", hi: "आशीष", honorific: "Er." },
    bride: { en: "Aayushi", hi: "आयुषी", honorific: "Dr." }
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
      date: "09/02/2027",
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
