import { EditablePlanetParams } from '../types';

export type ScenarioPreset = {
  id: string;
  name: string;
  description: string;
  icon: string;
  sunMass: number;
  gravity: number;
  planets: EditablePlanetParams[];
};

export const SCENARIO_PRESETS: ScenarioPreset[] = [
  {
    id: 'default',
    name: '標準太陽系',
    description: '8つの惑星とハレー彗星を含む標準的な太陽系',
    icon: '☀️',
    sunMass: 10000,
    gravity: 6.674e-3,
    planets: [
      {
        name: 'Mercury',
        type: 'rocky',
        radius: 3.8,
        color: 'gray',
        texturePath: 'planets/mercury.jpg',
        mass: 0.055,
        initialOrbitalRadius: 58,
        rotationSpeed: 0.017
      },
      {
        name: 'Venus',
        type: 'rocky',
        radius: 9.2,
        color: 'orange',
        texturePath: 'planets/venus.jpg',
        mass: 0.815,
        initialOrbitalRadius: 108,
        rotationSpeed: -0.004
      },
      {
        name: 'Earth',
        type: 'rocky',
        radius: 9,
        color: 'blue',
        texturePath: 'planets/earth.jpg',
        mass: 1,
        initialOrbitalRadius: 150,
        rotationSpeed: 0.02
      },
      {
        name: 'Mars',
        type: 'rocky',
        radius: 4.8,
        color: 'red',
        texturePath: 'planets/mars.jpg',
        mass: 0.107,
        initialOrbitalRadius: 228,
        rotationSpeed: 0.018
      },
      {
        name: 'Jupiter',
        type: 'gas',
        radius: 100,
        color: '#e0c080',
        texturePath: '',
        mass: 317.8,
        initialOrbitalRadius: 778,
        rotationSpeed: 0.04
      },
      {
        name: 'Saturn',
        type: 'gas',
        radius: 83.7,
        color: '#ffe5a2',
        texturePath: '',
        mass: 95.2,
        initialOrbitalRadius: 1430,
        rotationSpeed: 0.036
      },
      {
        name: 'Uranus',
        type: 'gas',
        radius: 36.4,
        color: '#b0e0e6',
        texturePath: '',
        mass: 14.5,
        initialOrbitalRadius: 2870,
        rotationSpeed: -0.03
      },
      {
        name: 'Neptune',
        type: 'gas',
        radius: 35.2,
        color: '#4166f5',
        texturePath: '',
        mass: 17.1,
        initialOrbitalRadius: 4500,
        rotationSpeed: 0.032
      },
      {
        name: 'Halley',
        type: 'comet',
        radius: 2,
        color: '#87CEEB',
        texturePath: '',
        mass: 0.001,
        initialOrbitalRadius: 300,
        rotationSpeed: 0.05
      }
    ],
  },
  {
    id: 'inner',
    name: '内惑星系',
    description: '水星・金星・地球・火星と小惑星帯に焦点',
    icon: '🪨',
    sunMass: 10000,
    gravity: 6.674e-3,
    planets: [
      {
        name: 'Mercury',
        type: 'rocky',
        radius: 3.8,
        color: 'gray',
        texturePath: 'planets/mercury.jpg',
        mass: 0.055,
        initialOrbitalRadius: 58,
        rotationSpeed: 0.017
      },
      {
        name: 'Venus',
        type: 'rocky',
        radius: 9.2,
        color: 'orange',
        texturePath: 'planets/venus.jpg',
        mass: 0.815,
        initialOrbitalRadius: 108,
        rotationSpeed: -0.004
      },
      {
        name: 'Earth',
        type: 'rocky',
        radius: 9,
        color: 'blue',
        texturePath: 'planets/earth.jpg',
        mass: 1,
        initialOrbitalRadius: 150,
        rotationSpeed: 0.02
      },
      {
        name: 'Mars',
        type: 'rocky',
        radius: 4.8,
        color: 'red',
        texturePath: 'planets/mars.jpg',
        mass: 0.107,
        initialOrbitalRadius: 228,
        rotationSpeed: 0.018
      },
      {
        name: 'Ceres',
        type: 'dwarf',
        radius: 2.5,
        color: '#888',
        texturePath: '',
        mass: 0.015,
        initialOrbitalRadius: 414,
        rotationSpeed: 0.012
      },
      {
        name: 'Vesta',
        type: 'asteroid',
        radius: 1.5,
        color: '#999',
        texturePath: '',
        mass: 0.004,
        initialOrbitalRadius: 353,
        rotationSpeed: 0.02
      },
    ],
  },
  {
    id: 'outer',
    name: '外惑星系',
    description: '木星・土星・天王星・海王星の巨大ガス惑星',
    icon: '🪐',
    sunMass: 10000,
    gravity: 6.674e-3,
    planets: [
      {
        name: 'Jupiter',
        type: 'gas',
        radius: 100,
        color: '#e0c080',
        texturePath: '',
        mass: 317.8,
        initialOrbitalRadius: 300,
        rotationSpeed: 0.04
      },
      {
        name: 'Saturn',
        type: 'gas',
        radius: 83.7,
        color: '#ffe5a2',
        texturePath: '',
        mass: 95.2,
        initialOrbitalRadius: 550,
        rotationSpeed: 0.036
      },
      {
        name: 'Uranus',
        type: 'gas',
        radius: 36.4,
        color: '#b0e0e6',
        texturePath: '',
        mass: 14.5,
        initialOrbitalRadius: 870,
        rotationSpeed: -0.03
      },
      {
        name: 'Neptune',
        type: 'gas',
        radius: 35.2,
        color: '#4166f5',
        texturePath: '',
        mass: 17.1,
        initialOrbitalRadius: 1200,
        rotationSpeed: 0.032
      },
    ],
  },
  {
    id: 'chaos',
    name: 'カオスモード',
    description: '多数の小さな天体が密集した不安定な系',
    icon: '💥',
    sunMass: 15000,
    gravity: 8e-3,
    planets: [
      {
        name: 'Alpha',
        type: 'asteroid',
        radius: 8,
        color: '#ff6666',
        texturePath: '',
        mass: 2,
        initialOrbitalRadius: 100,
        rotationSpeed: 0.05
      },
      {
        name: 'Beta',
        type: 'asteroid',
        radius: 10,
        color: '#66ff66',
        texturePath: '',
        mass: 3,
        initialOrbitalRadius: 130,
        rotationSpeed: 0.04
      },
      {
        name: 'Gamma',
        type: 'asteroid',
        radius: 7,
        color: '#6666ff',
        texturePath: '',
        mass: 1.5,
        initialOrbitalRadius: 160,
        rotationSpeed: 0.06
      },
      {
        name: 'Delta',
        type: 'asteroid',
        radius: 12,
        color: '#ffff66',
        texturePath: '',
        mass: 4,
        initialOrbitalRadius: 190,
        rotationSpeed: 0.03
      },
      {
        name: 'Epsilon',
        type: 'asteroid',
        radius: 6,
        color: '#ff66ff',
        texturePath: '',
        mass: 1.2,
        initialOrbitalRadius: 115,
        rotationSpeed: 0.07
      },
      {
        name: 'Zeta',
        type: 'asteroid',
        radius: 9,
        color: '#66ffff',
        texturePath: '',
        mass: 2.5,
        initialOrbitalRadius: 145,
        rotationSpeed: 0.045
      },
      {
        name: 'Eta',
        type: 'asteroid',
        radius: 5,
        color: '#ff9966',
        texturePath: '',
        mass: 1,
        initialOrbitalRadius: 175,
        rotationSpeed: 0.055
      },
      {
        name: 'Theta',
        type: 'asteroid',
        radius: 11,
        color: '#99ff66',
        texturePath: '',
        mass: 3.5,
        initialOrbitalRadius: 205,
        rotationSpeed: 0.035
      },
    ],
  },
  {
    id: 'binary',
    name: '二重星系',
    description: '巨大な惑星が中心の太陽と共に軌道を巡る',
    icon: '⭐',
    sunMass: 8000,
    gravity: 6.674e-3,
    planets: [
      {
        name: 'Giant-A',
        type: 'gas',
        radius: 50,
        color: '#ffcc00',
        texturePath: '',
        mass: 500,
        initialOrbitalRadius: 200,
        rotationSpeed: 0.02
      },
      {
        name: 'Planet-1',
        type: 'rocky',
        radius: 8,
        color: '#4488ff',
        texturePath: 'planets/earth.jpg',
        mass: 1,
        initialOrbitalRadius: 350,
        rotationSpeed: 0.03
      },
      {
        name: 'Planet-2',
        type: 'rocky',
        radius: 6,
        color: '#ff8844',
        texturePath: 'planets/mars.jpg',
        mass: 0.5,
        initialOrbitalRadius: 450,
        rotationSpeed: 0.025
      },
      {
        name: 'Comet-X',
        type: 'comet',
        radius: 3,
        color: '#aaddff',
        texturePath: '',
        mass: 0.01,
        initialOrbitalRadius: 280,
        rotationSpeed: 0.08
      },
    ],
  },
  {
    id: 'comets',
    name: '彗星群',
    description: '複数の彗星が太陽の周りを舞う',
    icon: '☄️',
    sunMass: 10000,
    gravity: 6.674e-3,
    planets: [
      {
        name: 'Earth',
        type: 'rocky',
        radius: 9,
        color: 'blue',
        texturePath: 'planets/earth.jpg',
        mass: 1,
        initialOrbitalRadius: 150,
        rotationSpeed: 0.02
      },
      {
        name: 'Halley',
        type: 'comet',
        radius: 3,
        color: '#87CEEB',
        texturePath: '',
        mass: 0.002,
        initialOrbitalRadius: 200,
        rotationSpeed: 0.05
      },
      {
        name: 'Encke',
        type: 'comet',
        radius: 2.5,
        color: '#ADD8E6',
        texturePath: '',
        mass: 0.001,
        initialOrbitalRadius: 250,
        rotationSpeed: 0.06
      },
      {
        name: 'Hale-Bopp',
        type: 'comet',
        radius: 4,
        color: '#B0E0E6',
        texturePath: '',
        mass: 0.003,
        initialOrbitalRadius: 350,
        rotationSpeed: 0.04
      },
      {
        name: 'Swift-Tuttle',
        type: 'comet',
        radius: 3.5,
        color: '#AFEEEE',
        texturePath: '',
        mass: 0.002,
        initialOrbitalRadius: 300,
        rotationSpeed: 0.045
      },
      {
        name: 'Tempel',
        type: 'comet',
        radius: 2,
        color: '#E0FFFF',
        texturePath: '',
        mass: 0.001,
        initialOrbitalRadius: 180,
        rotationSpeed: 0.055
      },
    ],
  },
];
