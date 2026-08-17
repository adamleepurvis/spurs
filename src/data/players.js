// Seeded from the official Fantasy Premier League API (bootstrap-static),
// fetched by the user on 2026-08-17, ahead of the 2026-27 season's
// Gameweek 1 (deadline 2026-08-21). Names, teams, and positions are real
// and current as of that fetch.
//
// `points` is the player's ACTUAL total FPL points from the completed
// 2025-26 season (real historical data, not invented) — used here as a
// starting-point baseline for this season, not a real projection model.
// It does not account for age, new-club fit, tactical changes, etc.
//
// Players with ~no 2025-26 Premier League history (promoted-club squads,
// players newly arrived in the league) have no meaningful total_points to
// draw from, so `estimated: true` marks entries whose `points` is instead
// derived from their FPL price using the position's real points-per-cost
// ratio among established players — a rougher guess, flagged in the UI.
//
// Replace/adjust `points` with your own projections before a real draft,
// either by editing this file or using the inline points override in the
// app.

let _id = 0
const p = (name, team, pos, points, estimated = false) => ({
  id: `p${++_id}`,
  name,
  team,
  pos,
  points,
  estimated,
})

export const PLAYERS_SEED = [
  // ARS
  p('Raya', 'ARS', 'GK', 162),
  p('Arrizabalaga', 'ARS', 'GK', 107, true),
  p('Gabriel', 'ARS', 'DEF', 209),
  p('J.Timber', 'ARS', 'DEF', 149),
  p('Saliba', 'ARS', 'DEF', 137),
  p('Calafiori', 'ARS', 'DEF', 109),
  p('Rice', 'ARS', 'MID', 184),
  p('Saka', 'ARS', 'MID', 157),
  p('Bruno G.', 'ARS', 'MID', 154),
  p('Zubimendi', 'ARS', 'MID', 133),
  p('Gyökeres', 'ARS', 'FWD', 128),
  p('Havertz', 'ARS', 'FWD', 36),

  // AVL
  p('Martinez', 'AVL', 'GK', 120),
  p('M.Bizot', 'AVL', 'GK', 16),
  p('Cash', 'AVL', 'DEF', 117),
  p('Konsa', 'AVL', 'DEF', 100),
  p('A.García', 'AVL', 'DEF', 71, true),
  p('Nedeljkovic', 'AVL', 'DEF', 71, true),
  p('McGinn', 'AVL', 'MID', 103),
  p('Buendía', 'AVL', 'MID', 102),
  p('Manzambi', 'AVL', 'MID', 89, true),
  p('Gomes', 'AVL', 'MID', 85),
  p('Watkins', 'AVL', 'FWD', 167),
  p('Madjo', 'AVL', 'FWD', 74, true),

  // BHA
  p('Verbruggen', 'BHA', 'GK', 130),
  p('Steele', 'BHA', 'GK', 86, true),
  p('F.Kadıoğlu', 'BHA', 'DEF', 118),
  p('Struijk', 'BHA', 'DEF', 108),
  p('Dunk', 'BHA', 'DEF', 100),
  p('Wieffer', 'BHA', 'DEF', 94),
  p('Minteh', 'BHA', 'MID', 117),
  p('Ayari', 'BHA', 'MID', 98),
  p('Gomez', 'BHA', 'MID', 97),
  p('Hinshelwood', 'BHA', 'MID', 91),
  p('Georginio', 'BHA', 'FWD', 87),
  p('Ferguson', 'BHA', 'FWD', 67, true),

  // BOU
  p('Petrović', 'BOU', 'GK', 124),
  p('Forster', 'BOU', 'GK', 86, true),
  p('Truffert', 'BOU', 'DEF', 165),
  p('Hill', 'BOU', 'DEF', 110),
  p('Silva', 'BOU', 'DEF', 89, true),
  p('J.Araujo', 'BOU', 'DEF', 80, true),
  p('Tavernier', 'BOU', 'MID', 137),
  p('Scott', 'BOU', 'MID', 136),
  p('Kroupi.Jr', 'BOU', 'MID', 113),
  p('Adams', 'BOU', 'MID', 77),
  p('Evanilson', 'BOU', 'FWD', 115),
  p('Rodríguez', 'BOU', 'FWD', 81, true),

  // BRE
  p('Kelleher', 'BRE', 'GK', 143),
  p('Valdimarsson', 'BRE', 'GK', 96, true),
  p('Collins', 'BRE', 'DEF', 129),
  p('Van den Berg', 'BRE', 'DEF', 113),
  p('Kayode', 'BRE', 'DEF', 113),
  p('Pinnock', 'BRE', 'DEF', 80, true),
  p('O.Dango', 'BRE', 'MID', 136),
  p('Schade', 'BRE', 'MID', 125),
  p('Lewis-Potter', 'BRE', 'MID', 115),
  p('Damsgaard', 'BRE', 'MID', 113),
  p('Thiago', 'BRE', 'FWD', 181),
  p('Wilson', 'BRE', 'FWD', 74, true),

  // CHE
  p('Sánchez', 'CHE', 'GK', 113),
  p('Penders', 'CHE', 'GK', 96, true),
  p('Lacroix', 'CHE', 'DEF', 154),
  p('James', 'CHE', 'DEF', 115),
  p('Palestra', 'CHE', 'DEF', 98, true),
  p('Gusto', 'CHE', 'DEF', 96),
  p('Rogers', 'CHE', 'MID', 169),
  p('Enzo', 'CHE', 'MID', 157),
  p('Neto', 'CHE', 'MID', 125),
  p('Palmer', 'CHE', 'MID', 114),
  p('João Pedro', 'CHE', 'FWD', 177),
  p('Welbeck', 'CHE', 'FWD', 126),

  // COV
  p('Rushworth', 'COV', 'GK', 96, true),
  p('Wilson', 'COV', 'GK', 96, true),
  p('Thomas', 'COV', 'DEF', 71, true),
  p('Kitching', 'COV', 'DEF', 71, true),
  p('van Ewijk', 'COV', 'DEF', 71, true),
  p('Dasilva', 'COV', 'DEF', 71, true),
  p('Mason-Clark', 'COV', 'MID', 81, true),
  p('Torp', 'COV', 'MID', 81, true),
  p('Tchaouna', 'COV', 'MID', 81, true),
  p('Hamer', 'COV', 'MID', 81, true),
  p('Wright', 'COV', 'FWD', 74, true),
  p('Thomas-Asante', 'COV', 'FWD', 67, true),

  // CRY
  p('Henderson', 'CRY', 'GK', 131),
  p('Benitez', 'CRY', 'GK', 96, true),
  p('Muñoz', 'CRY', 'DEF', 136),
  p('Mitchell', 'CRY', 'DEF', 135),
  p('Richards', 'CRY', 'DEF', 128),
  p('Khalaili', 'CRY', 'DEF', 89, true),
  p('Sarr', 'CRY', 'MID', 117),
  p('Wharton', 'CRY', 'MID', 112),
  p('Yeremy', 'CRY', 'MID', 77),
  p('Esse', 'CRY', 'MID', 74, true),
  p('Mateta', 'CRY', 'FWD', 114),
  p('Strand Larsen', 'CRY', 'FWD', 75),

  // EVE
  p('Pickford', 'EVE', 'GK', 135),
  p('Travers', 'EVE', 'GK', 107, true),
  p('Tarkowski', 'EVE', 'DEF', 170),
  p('Keane', 'EVE', 'DEF', 131),
  p('O\'Brien', 'EVE', 'DEF', 116),
  p('Mykolenko', 'EVE', 'DEF', 95),
  p('Garner', 'EVE', 'MID', 159),
  p('Dewsbury-Hall', 'EVE', 'MID', 151),
  p('Ndiaye', 'EVE', 'MID', 128),
  p('Hackney', 'EVE', 'MID', 81, true),
  p('Beto', 'EVE', 'FWD', 104),
  p('Barry', 'EVE', 'FWD', 95),

  // FUL
  p('Leno', 'FUL', 'GK', 122),
  p('Lecomte', 'FUL', 'GK', 86, true),
  p('Andersen', 'FUL', 'DEF', 123),
  p('Bassey', 'FUL', 'DEF', 103),
  p('Sessegnon', 'FUL', 'DEF', 95),
  p('Tete', 'FUL', 'DEF', 81),
  p('Iwobi', 'FUL', 'MID', 103),
  p('Berge', 'FUL', 'MID', 91),
  p('Palacios', 'FUL', 'MID', 81, true),
  p('Smith Rowe', 'FUL', 'MID', 80),
  p('Gonzalo', 'FUL', 'FWD', 81, true),
  p('Kusi-Asare', 'FUL', 'FWD', 60, true),

  // HUL
  p('Butland', 'HUL', 'GK', 96, true),
  p('Tzolakis', 'HUL', 'GK', 96, true),
  p('Egan', 'HUL', 'DEF', 71, true),
  p('Hughes', 'HUL', 'DEF', 71, true),
  p('Ajayi', 'HUL', 'DEF', 71, true),
  p('Coyle', 'HUL', 'DEF', 71, true),
  p('Belloumi', 'HUL', 'MID', 74, true),
  p('Millar', 'HUL', 'MID', 74, true),
  p('Ömür', 'HUL', 'MID', 74, true),
  p('Akintola', 'HUL', 'MID', 74, true),
  p('McBurnie', 'HUL', 'FWD', 74, true),

  // IPS
  p('Walton', 'IPS', 'GK', 96, true),
  p('Van Oevelen', 'IPS', 'GK', 96, true),
  p('Kipré', 'IPS', 'DEF', 71, true),
  p('O\'Shea', 'IPS', 'DEF', 71, true),
  p('Davis', 'IPS', 'DEF', 71, true),
  p('Greaves', 'IPS', 'DEF', 71, true),
  p('Clarke', 'IPS', 'MID', 81, true),
  p('Fatawu', 'IPS', 'MID', 81, true),
  p('Philogene', 'IPS', 'MID', 81, true),
  p('Maeda', 'IPS', 'MID', 81, true),
  p('Emersonn', 'IPS', 'FWD', 74, true),
  p('Hirst', 'IPS', 'FWD', 67, true),

  // LEE
  p('Trafford', 'LEE', 'GK', 107, true),
  p('Perri', 'LEE', 'GK', 43),
  p('Rodon', 'LEE', 'DEF', 109),
  p('Bijol', 'LEE', 'DEF', 99),
  p('Bogle', 'LEE', 'DEF', 96),
  p('Justin', 'LEE', 'DEF', 94),
  p('Wilson', 'LEE', 'MID', 168),
  p('Stach', 'LEE', 'MID', 137),
  p('Ampadu', 'LEE', 'MID', 134),
  p('Aaronson', 'LEE', 'MID', 126),
  p('Calvert-Lewin', 'LEE', 'FWD', 142),
  p('Nmecha', 'LEE', 'FWD', 73),

  // LIV
  p('A.Becker', 'LIV', 'GK', 91),
  p('Woodman', 'LIV', 'GK', 86, true),
  p('Virgil', 'LIV', 'DEF', 175),
  p('Araujo', 'LIV', 'DEF', 98, true),
  p('Jacquet', 'LIV', 'DEF', 89, true),
  p('Tsimikas', 'LIV', 'DEF', 89, true),
  p('Szoboszlai', 'LIV', 'MID', 160),
  p('Gravenberch', 'LIV', 'MID', 144),
  p('Gakpo', 'LIV', 'MID', 131),
  p('Wirtz', 'LIV', 'MID', 125),
  p('Ekitiké', 'LIV', 'FWD', 125),
  p('Danns', 'LIV', 'FWD', 60, true),

  // MCI
  p('Donnarumma', 'MCI', 'GK', 135),
  p('Rulli', 'MCI', 'GK', 107, true),
  p('Guéhi', 'MCI', 'DEF', 179),
  p('O\'Reilly', 'MCI', 'DEF', 160),
  p('Matheus N.', 'MCI', 'DEF', 154),
  p('Rúben', 'MCI', 'DEF', 113),
  p('Semenyo', 'MCI', 'MID', 202),
  p('Anderson', 'MCI', 'MID', 180),
  p('Cherki', 'MCI', 'MID', 135),
  p('Foden', 'MCI', 'MID', 131),
  p('Haaland', 'MCI', 'FWD', 239),
  p('Marmoush', 'MCI', 'FWD', 56),

  // MUN
  p('Lammens', 'MUN', 'GK', 109),
  p('Heaton', 'MUN', 'GK', 86, true),
  p('Shaw', 'MUN', 'DEF', 113),
  p('Dalot', 'MUN', 'DEF', 111),
  p('Maguire', 'MUN', 'DEF', 90),
  p('Amass', 'MUN', 'DEF', 71, true),
  p('B.Fernandes', 'MUN', 'MID', 235),
  p('Mbeumo', 'MUN', 'MID', 148),
  p('Cunha', 'MUN', 'MID', 143),
  p('Rashford', 'MUN', 'MID', 103, true),
  p('Šeško', 'MUN', 'FWD', 111),
  p('Obi', 'MUN', 'FWD', 60, true),

  // NEW
  p('Horníček', 'NEW', 'GK', 107, true),
  p('Pope', 'NEW', 'GK', 96),
  p('Thiaw', 'NEW', 'DEF', 126),
  p('Burn', 'NEW', 'DEF', 93),
  p('Botman', 'NEW', 'DEF', 89),
  p('Hall', 'NEW', 'DEF', 79),
  p('Barnes', 'NEW', 'MID', 106),
  p('Touré', 'NEW', 'MID', 89, true),
  p('J.Murphy', 'NEW', 'MID', 82),
  p('Steur', 'NEW', 'MID', 74, true),
  p('Woltemade', 'NEW', 'FWD', 108),
  p('Osula', 'NEW', 'FWD', 76),

  // NFO
  p('Sels', 'NFO', 'GK', 105),
  p('John', 'NFO', 'GK', 96, true),
  p('N.Williams', 'NFO', 'DEF', 128),
  p('Milenković', 'NFO', 'DEF', 119),
  p('Diomande', 'NFO', 'DEF', 98, true),
  p('Murillo', 'NFO', 'DEF', 83),
  p('Gibbs-White', 'NFO', 'MID', 188),
  p('Sangaré', 'NFO', 'MID', 89),
  p('Hudson-Odoi', 'NFO', 'MID', 88),
  p('Hutchinson', 'NFO', 'MID', 82),
  p('Igor Jesus', 'NFO', 'FWD', 114),
  p('Kalimuendo', 'NFO', 'FWD', 74, true),

  // SUN
  p('Roefs', 'SUN', 'GK', 136),
  p('Ellborg', 'SUN', 'GK', 16),
  p('Mukiele', 'SUN', 'DEF', 151),
  p('Alderete', 'SUN', 'DEF', 125),
  p('Ballard', 'SUN', 'DEF', 116),
  p('Hume', 'SUN', 'DEF', 110),
  p('E.Le Fée', 'SUN', 'MID', 147),
  p('Xhaka', 'SUN', 'MID', 124),
  p('Talbi', 'SUN', 'MID', 83),
  p('Sadiki', 'SUN', 'MID', 80),
  p('Brobbey', 'SUN', 'FWD', 92),
  p('Isidor', 'SUN', 'FWD', 74),

  // TOT
  p('Dubravka', 'TOT', 'GK', 96),
  p('Vicario', 'TOT', 'GK', 90),
  p('Senesi', 'TOT', 'DEF', 175),
  p('Van Hecke', 'TOT', 'DEF', 148),
  p('Pedro Porro', 'TOT', 'DEF', 117),
  p('Van de Ven', 'TOT', 'DEF', 116),
  p('Fernandes', 'TOT', 'MID', 135),
  p('Maddison', 'TOT', 'MID', 96, true),
  p('Kulusevski', 'TOT', 'MID', 96, true),
  p('Bentancur', 'TOT', 'MID', 86),
  p('Richarlison', 'TOT', 'FWD', 119),
  p('Scarlett', 'TOT', 'FWD', 60, true),
]

export const TEAM_CODES = [...new Set(PLAYERS_SEED.map((p) => p.team))].sort()
