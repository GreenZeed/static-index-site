export const CLUB_THEMES = {
    psg: { color1: '#004170', color2: '#E30613', name: 'Paris Saint-Germain' },
    om: { color1: '#2FAEE0', color2: '#FFFFFF', name: 'Olympique de Marseille' },
    ol: { color1: '#DA000C', color2: '#003C7D', name: 'Olympique Lyonnais' },
    asse: { color1: '#00965E', color2: '#FFFFFF', name: 'AS Saint-Étienne' },
    losc: { color1: '#CC0000', color2: '#000033', name: 'LOSC Lille' },
    monaco: { color1: '#CC0000', color2: '#FFFFFF', name: 'AS Monaco' },
    rennes: { color1: '#E50027', color2: '#000000', name: 'Stade Rennais' }
};

export const SEASON_THEMES = {
    christmas: { color1: '#C41E3A', color2: '#165B33', emoji: '🎄', label: 'Noël' },
    summer: { color1: '#FFD700', color2: '#FF6B35', emoji: '☀️', label: 'Été' },
    playoffs: { color1: '#FFD700', color2: '#000000', emoji: '🏆', label: 'Playoffs' },
    halloween: { color1: '#FF6600', color2: '#1a1a1a', emoji: '🎃', label: 'Halloween' },
    valentine: { color1: '#FF1493', color2: '#C71585', emoji: '❤️', label: 'St-Valentin' }
};

export const DEFAULT_DATA = {
    match: { homeTeam: 'FC GENÈVE', awayTeam: 'FC LAUSANNE', date: 'Samedi 14 Décembre', time: '15:00', stadium: 'Stade de Genève', color1: '#007AFF', color2: '#0051D5', bgImage: null, textSize: 80 },
    score: { homeTeam: 'FC GENÈVE', awayTeam: 'FC LAUSANNE', homeScore: 3, awayScore: 1, competition: 'Championnat Régional', date: '03 Décembre 2025', color1: '#10B981', color2: '#059669', homeLogo: null, awayLogo: null, textSize: 48 },
    player: { playerName: 'THOMAS MULLER', number: '10', position: 'Attaquant', stats: 'Buts: 2 | Passes: 1', team: 'FC GENÈVE', playerPhoto: null, color1: '#FF3B30', color2: '#C7221F', textSize: 70 },
    ranking: { title: 'CLASSEMENT', competition: 'Ligue 1', teams: '1. FC Genève - 45 pts\n2. FC Lausanne - 42 pts\n3. FC Sion - 38 pts\n4. Servette FC - 35 pts\n5. Young Boys - 32 pts', color1: '#5856D6', color2: '#3634A3', textSize: 32 },
    upnext: {
        numMatches: 3,
        colorHeader: '#D32F2F',
        colorPanel: '#FFFFFF',
        colorText: '#1f2937',
        matches: [
            { homeTeam: 'FC GENÈVE', awayTeam: 'FC LAUSANNE', date: 'SAM 14 OCT', time: '14H00', stadium: 'STADE DE GENÈVE', homeLogo: null, awayLogo: null },
            { homeTeam: 'FC SION', awayTeam: 'SERVETTE FC', date: 'DIM 15 OCT', time: '16H30', stadium: 'TOURBILLON', homeLogo: null, awayLogo: null },
            { homeTeam: 'YOUNG BOYS', awayTeam: 'FC BÂLE', date: 'SAM 21 OCT', time: '18H00', stadium: 'WANKDORF', homeLogo: null, awayLogo: null }
        ]
    }
};

export const FORMATS = {
    square: { width: 1080, height: 1080, label: '1080 x 1080' },
    portrait: { width: 1080, height: 1350, label: '1080 x 1350' },
    story: { width: 1080, height: 1920, label: '1080 x 1920' }
};

export const FIELD_SETS = {
    match: [{ key: 'homeTeam', label: 'Équipe Domicile', type: 'text' }, { key: 'awayTeam', label: 'Équipe Extérieur', type: 'text' }, { key: 'date', label: 'Date', type: 'text' }, { key: 'time', label: 'Heure', type: 'text' }, { key: 'stadium', label: 'Stade', type: 'text' }, { key: 'textSize', label: 'Taille texte', type: 'range', min: 40, max: 120 }, { key: 'bgImage', label: 'Image de fond (optionnel)', type: 'image' }, { key: 'color1', label: 'Couleur 1', type: 'color' }, { key: 'color2', label: 'Couleur 2 (gradient)', type: 'color' }],
    score: [{ key: 'homeTeam', label: 'Équipe Domicile', type: 'text' }, { key: 'awayTeam', label: 'Équipe Extérieur', type: 'text' }, { key: 'homeScore', label: 'Score Domicile', type: 'number' }, { key: 'awayScore', label: 'Score Extérieur', type: 'number' }, { key: 'competition', label: 'Compétition', type: 'text' }, { key: 'date', label: 'Date', type: 'text' }, { key: 'textSize', label: 'Taille texte', type: 'range', min: 24, max: 72 }, { key: 'homeLogo', label: 'Logo Domicile', type: 'image' }, { key: 'awayLogo', label: 'Logo Extérieur', type: 'image' }, { key: 'color1', label: 'Couleur 1', type: 'color' }, { key: 'color2', label: 'Couleur 2', type: 'color' }],
    player: [{ key: 'playerName', label: 'Nom du joueur', type: 'text' }, { key: 'number', label: 'Numéro', type: 'text' }, { key: 'position', label: 'Position', type: 'text' }, { key: 'stats', label: 'Statistiques', type: 'text' }, { key: 'team', label: 'Équipe', type: 'text' }, { key: 'textSize', label: 'Taille texte', type: 'range', min: 40, max: 100 }, { key: 'playerPhoto', label: 'Photo du joueur', type: 'image' }, { key: 'color1', label: 'Couleur 1', type: 'color' }, { key: 'color2', label: 'Couleur 2', type: 'color' }],
    ranking: [{ key: 'title', label: 'Titre', type: 'text' }, { key: 'competition', label: 'Compétition', type: 'text' }, { key: 'teams', label: 'Classement (une ligne par équipe)', type: 'textarea' }, { key: 'textSize', label: 'Taille texte', type: 'range', min: 20, max: 48 }, { key: 'color1', label: 'Couleur 1', type: 'color' }, { key: 'color2', label: 'Couleur 2', type: 'color' }]
};
