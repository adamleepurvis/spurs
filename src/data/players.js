// PLACEHOLDER DATA: player pool (names/teams/positions) reflects the
// 2025-26 Premier League as best known, but the `points` field
// (projected season fantasy points) is a rough, made-up placeholder
// generated from general FPL tiering knowledge, NOT a real projection
// model. Replace `points` with your own projections before relying on
// this for a real draft. See the in-app banner for the same notice.

let _id = 0
const p = (name, team, pos, points) => ({
  id: `p${++_id}`,
  name,
  team,
  pos,
  points,
})

export const PLAYERS_SEED = [
  // Arsenal
  p('David Raya', 'ARS', 'GK', 152),
  p('Neto', 'ARS', 'GK', 48),
  p('William Saliba', 'ARS', 'DEF', 138),
  p('Gabriel Magalhaes', 'ARS', 'DEF', 132),
  p('Jurrien Timber', 'ARS', 'DEF', 120),
  p('Riccardo Calafiori', 'ARS', 'DEF', 108),
  p('Myles Lewis-Skelly', 'ARS', 'DEF', 96),
  p('Martin Odegaard', 'ARS', 'MID', 178),
  p('Declan Rice', 'ARS', 'MID', 172),
  p('Bukayo Saka', 'ARS', 'MID', 220),
  p('Kai Havertz', 'ARS', 'FWD', 158),
  p('Viktor Gyokeres', 'ARS', 'FWD', 216),

  // Aston Villa
  p('Emiliano Martinez', 'AVL', 'GK', 128),
  p('Ezri Konsa', 'AVL', 'DEF', 104),
  p('Pau Torres', 'AVL', 'DEF', 92),
  p('Matty Cash', 'AVL', 'DEF', 98),
  p('Lucas Digne', 'AVL', 'DEF', 88),
  p('Youri Tielemans', 'AVL', 'MID', 122),
  p('John McGinn', 'AVL', 'MID', 128),
  p('Morgan Rogers', 'AVL', 'MID', 148),
  p('Emiliano Buendia', 'AVL', 'MID', 78),
  p('Ollie Watkins', 'AVL', 'FWD', 186),

  // Bournemouth
  p('Djordje Petrovic', 'BOU', 'GK', 118),
  p('Marcos Senesi', 'BOU', 'DEF', 94),
  p('Adam Smith', 'BOU', 'DEF', 76),
  p('Illia Zabarnyi', 'BOU', 'DEF', 90),
  p('Bafode Diakite', 'BOU', 'DEF', 82),
  p('Ryan Christie', 'BOU', 'MID', 102),
  p('Justin Kluivert', 'BOU', 'MID', 118),
  p('David Brooks', 'BOU', 'MID', 82),
  p('Antoine Semenyo', 'BOU', 'MID', 146),
  p('Evanilson', 'BOU', 'FWD', 128),

  // Brentford
  p('Mark Flekken', 'BRE', 'GK', 108),
  p('Ethan Pinnock', 'BRE', 'DEF', 82),
  p('Nathan Collins', 'BRE', 'DEF', 100),
  p('Rico Henry', 'BRE', 'DEF', 78),
  p('Keane Lewis-Potter', 'BRE', 'DEF', 88),
  p('Mikkel Damsgaard', 'BRE', 'MID', 116),
  p('Yoane Wissa', 'BRE', 'FWD', 152),
  p('Kevin Schade', 'BRE', 'FWD', 134),

  // Brighton
  p('Bart Verbruggen', 'BHA', 'GK', 114),
  p('Lewis Dunk', 'BHA', 'DEF', 86),
  p('Pervis Estupinan', 'BHA', 'DEF', 96),
  p('Jan Paul van Hecke', 'BHA', 'DEF', 92),
  p('Tariq Lamptey', 'BHA', 'DEF', 74),
  p('Kaoru Mitoma', 'BHA', 'MID', 136),
  p('Yankuba Minteh', 'BHA', 'MID', 128),
  p('Georginio Rutter', 'BHA', 'MID', 130),
  p('Danny Welbeck', 'BHA', 'FWD', 118),

  // Burnley
  p('James Trafford', 'BUR', 'GK', 110),
  p('Maxime Esteve', 'BUR', 'DEF', 80),
  p('CJ Egan-Riley', 'BUR', 'DEF', 74),
  p('Quilindschy Hartman', 'BUR', 'DEF', 70),
  p('Josh Cullen', 'BUR', 'MID', 88),
  p('Josh Brownhill', 'BUR', 'MID', 90),
  p('Jaidon Anthony', 'BUR', 'MID', 84),
  p('Lyle Foster', 'BUR', 'FWD', 96),

  // Chelsea
  p('Robert Sanchez', 'CHE', 'GK', 122),
  p('Filip Jorgensen', 'CHE', 'GK', 46),
  p('Levi Colwill', 'CHE', 'DEF', 96),
  p('Reece James', 'CHE', 'DEF', 118),
  p('Marc Cucurella', 'CHE', 'DEF', 122),
  p('Malo Gusto', 'CHE', 'DEF', 92),
  p('Wesley Fofana', 'CHE', 'DEF', 78),
  p('Moises Caicedo', 'CHE', 'MID', 134),
  p('Enzo Fernandez', 'CHE', 'MID', 148),
  p('Cole Palmer', 'CHE', 'MID', 224),
  p('Pedro Neto', 'CHE', 'MID', 138),
  p('Nicolas Jackson', 'CHE', 'FWD', 142),
  p('Liam Delap', 'CHE', 'FWD', 130),

  // Crystal Palace
  p('Dean Henderson', 'CRY', 'GK', 126),
  p('Marc Guehi', 'CRY', 'DEF', 108),
  p('Tyrick Mitchell', 'CRY', 'DEF', 96),
  p('Daniel Munoz', 'CRY', 'DEF', 110),
  p('Maxence Lacroix', 'CRY', 'DEF', 88),
  p('Eberechi Eze', 'CRY', 'MID', 172),
  p('Adam Wharton', 'CRY', 'MID', 118),
  p('Ismaila Sarr', 'CRY', 'MID', 132),
  p('Jean-Philippe Mateta', 'CRY', 'FWD', 148),

  // Everton
  p('Jordan Pickford', 'EVE', 'GK', 136),
  p('James Tarkowski', 'EVE', 'DEF', 98),
  p('Jarrad Branthwaite', 'EVE', 'DEF', 94),
  p('Vitalii Mykolenko', 'EVE', 'DEF', 84),
  p('Nathan Patterson', 'EVE', 'DEF', 68),
  p('Idrissa Gueye', 'EVE', 'MID', 76),
  p('James Garner', 'EVE', 'MID', 88),
  p('Iliman Ndiaye', 'EVE', 'MID', 124),
  p('Dwight McNeil', 'EVE', 'MID', 110),
  p('Beto', 'EVE', 'FWD', 92),

  // Fulham
  p('Bernd Leno', 'FUL', 'GK', 130),
  p('Calvin Bassey', 'FUL', 'DEF', 84),
  p('Joachim Andersen', 'FUL', 'DEF', 90),
  p('Antonee Robinson', 'FUL', 'DEF', 102),
  p('Kenny Tete', 'FUL', 'DEF', 78),
  p('Sasa Lukic', 'FUL', 'MID', 82),
  p('Andreas Pereira', 'FUL', 'MID', 104),
  p('Emile Smith Rowe', 'FUL', 'MID', 96),
  p('Alex Iwobi', 'FUL', 'MID', 108),
  p('Raul Jimenez', 'FUL', 'FWD', 118),
  p('Rodrigo Muniz', 'FUL', 'FWD', 106),

  // Leeds United
  p('Lucas Perri', 'LEE', 'GK', 104),
  p('Pascal Struijk', 'LEE', 'DEF', 86),
  p('Ethan Ampadu', 'LEE', 'DEF', 88),
  p('Jayden Bogle', 'LEE', 'DEF', 82),
  p('Gabriel Gudmundsson', 'LEE', 'DEF', 66),
  p('Ilia Gruev', 'LEE', 'MID', 70),
  p('Brenden Aaronson', 'LEE', 'MID', 92),
  p('Daniel James', 'LEE', 'MID', 88),
  p('Joel Piroe', 'LEE', 'FWD', 108),
  p('Lukas Nmecha', 'LEE', 'FWD', 78),

  // Liverpool
  p('Alisson Becker', 'LIV', 'GK', 148),
  p('Giorgi Mamardashvili', 'LIV', 'GK', 58),
  p('Virgil van Dijk', 'LIV', 'DEF', 136),
  p('Ibrahima Konate', 'LIV', 'DEF', 108),
  p('Milos Kerkez', 'LIV', 'DEF', 118),
  p('Andrew Robertson', 'LIV', 'DEF', 106),
  p('Jeremie Frimpong', 'LIV', 'DEF', 116),
  p('Ryan Gravenberch', 'LIV', 'MID', 128),
  p('Alexis Mac Allister', 'LIV', 'MID', 146),
  p('Dominik Szoboszlai', 'LIV', 'MID', 152),
  p('Mohamed Salah', 'LIV', 'MID', 258),
  p('Florian Wirtz', 'LIV', 'MID', 176),
  p('Cody Gakpo', 'LIV', 'FWD', 162),
  p('Alexander Isak', 'LIV', 'FWD', 200),
  p('Hugo Ekitike', 'LIV', 'FWD', 168),

  // Manchester City
  p('Ederson', 'MCI', 'GK', 130),
  p('Stefan Ortega', 'MCI', 'GK', 42),
  p('Ruben Dias', 'MCI', 'DEF', 118),
  p('Josko Gvardiol', 'MCI', 'DEF', 132),
  p('Nathan Ake', 'MCI', 'DEF', 96),
  p('Rico Lewis', 'MCI', 'DEF', 98),
  p('Rayan Ait-Nouri', 'MCI', 'DEF', 108),
  p('Rodri', 'MCI', 'MID', 138),
  p('Bernardo Silva', 'MCI', 'MID', 148),
  p('Phil Foden', 'MCI', 'MID', 176),
  p('Tijjani Reijnders', 'MCI', 'MID', 124),
  p('Erling Haaland', 'MCI', 'FWD', 252),
  p('Omar Marmoush', 'MCI', 'FWD', 154),

  // Manchester United
  p('Andre Onana', 'MUN', 'GK', 110),
  p('Altay Bayindir', 'MUN', 'GK', 42),
  p('Matthijs de Ligt', 'MUN', 'DEF', 96),
  p('Leny Yoro', 'MUN', 'DEF', 92),
  p('Noussair Mazraoui', 'MUN', 'DEF', 88),
  p('Diogo Dalot', 'MUN', 'DEF', 94),
  p('Patrick Dorgu', 'MUN', 'DEF', 82),
  p('Bruno Fernandes', 'MUN', 'MID', 190),
  p('Kobbie Mainoo', 'MUN', 'MID', 104),
  p('Mason Mount', 'MUN', 'MID', 86),
  p('Bryan Mbeumo', 'MUN', 'MID', 164),
  p('Matheus Cunha', 'MUN', 'FWD', 158),
  p('Benjamin Sesko', 'MUN', 'FWD', 140),

  // Newcastle
  p('Nick Pope', 'NEW', 'GK', 138),
  p('Sven Botman', 'NEW', 'DEF', 92),
  p('Fabian Schar', 'NEW', 'DEF', 98),
  p('Kieran Trippier', 'NEW', 'DEF', 112),
  p('Tino Livramento', 'NEW', 'DEF', 100),
  p('Dan Burn', 'NEW', 'DEF', 88),
  p('Bruno Guimaraes', 'NEW', 'MID', 150),
  p('Sandro Tonali', 'NEW', 'MID', 128),
  p('Anthony Gordon', 'NEW', 'MID', 158),
  p('Jacob Murphy', 'NEW', 'MID', 110),
  p('William Osula', 'NEW', 'FWD', 74),
  p('Nick Woltemade', 'NEW', 'FWD', 132),

  // Nottingham Forest
  p('Matz Sels', 'NFO', 'GK', 132),
  p('Murillo', 'NFO', 'DEF', 106),
  p('Nikola Milenkovic', 'NFO', 'DEF', 98),
  p('Ola Aina', 'NFO', 'DEF', 96),
  p('Neco Williams', 'NFO', 'DEF', 92),
  p('Morgan Gibbs-White', 'NFO', 'MID', 160),
  p('Elliot Anderson', 'NFO', 'MID', 108),
  p('Ibrahim Sangare', 'NFO', 'MID', 84),
  p('Chris Wood', 'NFO', 'FWD', 158),
  p('Taiwo Awoniyi', 'NFO', 'FWD', 98),

  // Sunderland
  p('Robin Roefs', 'SUN', 'GK', 106),
  p('Dan Ballard', 'SUN', 'DEF', 82),
  p('Trai Hume', 'SUN', 'DEF', 84),
  p('Reinildo Mandava', 'SUN', 'DEF', 72),
  p('Nordi Mukiele', 'SUN', 'DEF', 76),
  p('Granit Xhaka', 'SUN', 'MID', 118),
  p('Chris Rigg', 'SUN', 'MID', 86),
  p('Enzo Le Fee', 'SUN', 'MID', 92),
  p('Wilson Isidor', 'SUN', 'FWD', 98),
  p('Eliezer Mayenda', 'SUN', 'FWD', 84),

  // Tottenham
  p('Guglielmo Vicario', 'TOT', 'GK', 128),
  p('Cristian Romero', 'TOT', 'DEF', 116),
  p('Micky van de Ven', 'TOT', 'DEF', 110),
  p('Pedro Porro', 'TOT', 'DEF', 128),
  p('Destiny Udogie', 'TOT', 'DEF', 104),
  p('Archie Gray', 'TOT', 'MID', 82),
  p('James Maddison', 'TOT', 'MID', 152),
  p('Yves Bissouma', 'TOT', 'MID', 92),
  p('Mohammed Kudus', 'TOT', 'MID', 138),
  p('Dominic Solanke', 'TOT', 'FWD', 132),
  p('Richarlison', 'TOT', 'FWD', 128),
  p('Randal Kolo Muani', 'TOT', 'FWD', 116),

  // West Ham
  p('Alphonse Areola', 'WHU', 'GK', 112),
  p('Max Kilman', 'WHU', 'DEF', 88),
  p('Konstantinos Mavropanos', 'WHU', 'DEF', 92),
  p('Aaron Wan-Bissaka', 'WHU', 'DEF', 90),
  p('Emerson Palmieri', 'WHU', 'DEF', 76),
  p('Tomas Soucek', 'WHU', 'MID', 114),
  p('Lucas Paqueta', 'WHU', 'MID', 132),
  p('Jarrod Bowen', 'WHU', 'MID', 158),
  p('Niclas Fullkrug', 'WHU', 'FWD', 108),

  // Wolves
  p('Jose Sa', 'WOL', 'GK', 116),
  p('Emmanuel Agbadou', 'WOL', 'DEF', 86),
  p('Yerson Mosquera', 'WOL', 'DEF', 80),
  p('Ki-Jana Hoever', 'WOL', 'DEF', 70),
  p('Rodrigo Gomes', 'WOL', 'DEF', 66),
  p('Joao Gomes', 'WOL', 'MID', 100),
  p('Andre', 'WOL', 'MID', 96),
  p('Jean-Ricner Bellegarde', 'WOL', 'MID', 84),
  p('Jorgen Strand Larsen', 'WOL', 'FWD', 136),
  p('Hwang Hee-chan', 'WOL', 'FWD', 118),
]

export const TEAM_CODES = [...new Set(PLAYERS_SEED.map((p) => p.team))].sort()
