const freezeMission = mission => Object.freeze({
  ...mission,
  crew: Object.freeze([...mission.crew]),
  source: Object.freeze({ ...mission.source })
});

export const nasaSpaceflights = Object.freeze([
  freezeMission({
    id: "gemini-iv",
    name: "Gemini IV",
    program: "Gemini",
    missionType: "Human Spaceflight",
    launchDate: "1965-06-03",
    returnDate: "1965-06-07",
    crewed: true,
    crew: ["James A. McDivitt Jr.", "Edward H. White II"],
    spacecraft: "Gemini 4",
    launchVehicle: "Titan II",
    destination: "Low Earth orbit",
    status: "Complete",
    highlight: "First American spacewalk",
    source: {
      title: "Gemini IV",
      url: "https://www.nasa.gov/mission/gemini-iv/"
    }
  }),
  freezeMission({
    id: "apollo-8",
    name: "Apollo 8",
    program: "Apollo",
    missionType: "Lunar Landing Preparation",
    launchDate: "1968-12-21",
    returnDate: "1968-12-27",
    crewed: true,
    crew: ["Frank Borman", "James A. Lovell Jr.", "William A. Anders"],
    spacecraft: "Apollo command and service module",
    launchVehicle: "Saturn V",
    destination: "Lunar orbit",
    status: "Complete",
    highlight: "First crewed mission to orbit the Moon",
    source: {
      title: "Apollo 8",
      url: "https://www.nasa.gov/mission/apollo-8/"
    }
  }),
  freezeMission({
    id: "apollo-11",
    name: "Apollo 11",
    program: "Apollo",
    missionType: "Lunar Landing",
    launchDate: "1969-07-16",
    returnDate: "1969-07-24",
    crewed: true,
    crew: ["Neil Armstrong", "Edwin E. \"Buzz\" Aldrin Jr.", "Michael Collins"],
    spacecraft: "Columbia and Eagle",
    launchVehicle: "Saturn V",
    destination: "Sea of Tranquility, Moon",
    status: "Complete",
    highlight: "First crewed lunar landing",
    source: {
      title: "Apollo 11 Mission Overview",
      url: "https://www.nasa.gov/mission/apollo-11/"
    }
  }),
  freezeMission({
    id: "apollo-13",
    name: "Apollo 13",
    program: "Apollo",
    missionType: "Lunar Landing",
    launchDate: "1970-04-11",
    returnDate: "1970-04-17",
    crewed: true,
    crew: ["James A. Lovell Jr.", "Fred W. Haise Jr.", "John L. Swigert Jr."],
    spacecraft: "Odyssey and Aquarius",
    launchVehicle: "Saturn V",
    destination: "Lunar free-return trajectory",
    status: "Complete",
    highlight: "Crew safely returned after an in-flight oxygen tank failure",
    source: {
      title: "Apollo 13 Mission Details",
      url: "https://www.nasa.gov/mission/apollo-13/"
    }
  }),
  freezeMission({
    id: "sts-1",
    name: "STS-1",
    program: "Space Shuttle",
    missionType: "Orbital flight test",
    launchDate: "1981-04-12",
    returnDate: "1981-04-14",
    crewed: true,
    crew: ["John W. Young", "Robert L. Crippen"],
    spacecraft: "Columbia",
    launchVehicle: "Space Shuttle",
    destination: "Low Earth orbit",
    status: "Complete",
    highlight: "First flight of NASA's Space Shuttle program",
    source: {
      title: "STS-1",
      url: "https://www.nasa.gov/mission/sts-1/"
    }
  }),
  freezeMission({
    id: "sts-31",
    name: "STS-31",
    program: "Space Shuttle",
    missionType: "Satellite deployment mission",
    launchDate: "1990-04-24",
    returnDate: "1990-04-29",
    crewed: true,
    crew: ["Loren J. Shriver", "Charles F. Bolden", "Bruce McCandless II", "Kathryn D. Sullivan", "Steven A. Hawley"],
    spacecraft: "Discovery",
    launchVehicle: "Space Shuttle",
    destination: "Low Earth orbit",
    status: "Complete",
    highlight: "Deployed the Hubble Space Telescope",
    source: {
      title: "STS-31",
      url: "https://www.nasa.gov/mission/sts-31/"
    }
  }),
  freezeMission({
    id: "sts-95",
    name: "STS-95",
    program: "Space Shuttle",
    missionType: "Research mission",
    launchDate: "1998-10-29",
    returnDate: "1998-11-07",
    crewed: true,
    crew: ["Curtis L. Brown", "Steven W. Lindsey", "Scott E. Parazynski", "Stephen K. Robinson", "Pedro Duque", "Chiaki Mukai", "John H. Glenn"],
    spacecraft: "Discovery",
    launchVehicle: "Space Shuttle",
    destination: "Low Earth orbit",
    status: "Complete",
    highlight: "Returned John Glenn to space and carried research payloads",
    source: {
      title: "STS-95",
      url: "https://www.nasa.gov/mission/sts-95/"
    }
  }),
  freezeMission({
    id: "artemis-i",
    name: "Artemis I",
    program: "Artemis",
    missionType: "Uncrewed lunar flight test",
    launchDate: "2022-11-16",
    returnDate: "2022-12-11",
    crewed: false,
    crew: [],
    spacecraft: "Orion",
    launchVehicle: "Space Launch System",
    destination: "Lunar distant retrograde orbit",
    status: "Complete",
    highlight: "First integrated flight test of SLS and Orion",
    source: {
      title: "Artemis I",
      url: "https://www.nasa.gov/mission/artemis-i/"
    }
  })
]);

const missionIndex = new Map(nasaSpaceflights.map(mission => [mission.id, mission]));

export const nasaPrograms = Object.freeze([...new Set(nasaSpaceflights.map(mission => mission.program))]);

export const missionById = id => {
  const mission = missionIndex.get(id);
  if (!mission) throw new Error(`Unknown NASA example mission: ${id}`);
  return mission;
};

export const missionsForProgram = program =>
  Object.freeze(nasaSpaceflights.filter(mission => mission.program === program));

export const crewLabel = mission =>
  mission.crewed ? mission.crew.join(", ") : "Uncrewed";

export const dateRangeLabel = mission =>
  `${mission.launchDate} to ${mission.returnDate}`;
