import {
  Adjective,
  Character,
  PageState,
  Pronoun,
  StorybookConfig,
} from '../types';

export function getDefaultConfig(): StorybookConfig {
  const winCfg = window.STORYBOOK_CONFIG;
  return {
    googleAppsScriptUrl:
      winCfg?.googleAppsScriptUrl ||
      window.GOOGLE_APPS_SCRIPT_URL ||
      'https://script.google.com/macros/s/AKfycbxqFuzVKW631ehs8uTmWw6FN2h-EXA5YqGZomOgl2s76t-rFWA2vjFJ3CR_tJ0mQPHF/exec',
    bodies: winCfg?.bodies || [
      {
        id: 'school-hero',
        name: 'Red Star Tunic',
        src: './make-you-bodies/school-hero.png',
        neckX: 0.5,
        neckY: 0.22,
        headScale: 1.0,
      },
      {
        id: 'sunny-overalls',
        name: 'Sunny Overalls',
        src: './make-you-bodies/sunny-overalls.png',
        neckX: 0.5,
        neckY: 0.22,
        headScale: 1.0,
      },
      {
        id: 'sporty-tracksuit',
        name: 'Sporty Tracksuit',
        src: './make-you-bodies/sporty-tracksuit.png',
        neckX: 0.5,
        neckY: 0.22,
        headScale: 1.0,
      },
      {
        id: 'pink-cardigan',
        name: 'Berry Cardigan',
        src: './make-you-bodies/pink-cardigan.png',
        neckX: 0.5,
        neckY: 0.22,
        headScale: 1.0,
      },
      {
        id: 'explorer-vest',
        name: 'Lantau Explorer',
        src: './make-you-bodies/explorer-vest.png',
        neckX: 0.5,
        neckY: 0.22,
        headScale: 1.0,
      },
      {
        id: 'rainbow-sweater',
        name: 'Rainbow Sweater',
        src: './make-you-bodies/rainbow-sweater.png',
        neckX: 0.5,
        neckY: 0.22,
        headScale: 1.0,
      },
      {
        id: 'artist-apron',
        name: 'Artist Apron',
        src: './make-you-bodies/artist-apron.png',
        neckX: 0.5,
        neckY: 0.22,
        headScale: 1.0,
      },
      {
        id: 'cape-superstar',
        name: 'Sky Superstar',
        src: './make-you-bodies/cape-superstar.png',
        neckX: 0.5,
        neckY: 0.22,
        headScale: 1.0,
      },
      {
        id: 'make-you-001',
        name: 'Red Tee & Yellow Shorts',
        src: './make-you-bodies/001.png',
        neckX: 0.5,
        neckY: 0.05,
        headScale: 1.0,
      },
      {
        id: 'make-you-002',
        name: 'Sunshine Tee & Green Shorts',
        src: './make-you-bodies/002.png',
        neckX: 0.5,
        neckY: 0.05,
        headScale: 1.0,
      },
      {
        id: 'make-you-003',
        name: 'Sky Blue Tee',
        src: './make-you-bodies/003.png',
        neckX: 0.5,
        neckY: 0.05,
        headScale: 1.0,
      },
      {
        id: 'make-you-004',
        name: 'Green Stripe Tee',
        src: './make-you-bodies/004.png',
        neckX: 0.5,
        neckY: 0.05,
        headScale: 1.0,
      },
      {
        id: 'make-you-005',
        name: 'Orange Star Tee',
        src: './make-you-bodies/005.png',
        neckX: 0.5,
        neckY: 0.05,
        headScale: 1.0,
      },
      {
        id: 'make-you-006',
        name: 'Blue Overalls',
        src: './make-you-bodies/006.png',
        neckX: 0.5,
        neckY: 0.05,
        headScale: 1.0,
      },
      {
        id: 'make-you-007',
        name: 'Cherry Tee & Blue Shorts',
        src: './make-you-bodies/007.png',
        neckX: 0.5,
        neckY: 0.05,
        headScale: 1.0,
      },
      {
        id: 'make-you-008',
        name: 'Teddy Bear Tee',
        src: './make-you-bodies/008.png',
        neckX: 0.5,
        neckY: 0.05,
        headScale: 1.0,
      },
      {
        id: 'make-you-009',
        name: 'Green Hoodie',
        src: './make-you-bodies/009.png',
        neckX: 0.5,
        neckY: 0.05,
        headScale: 1.0,
      },
      {
        id: 'make-you-010',
        name: 'Blue Stripe Tee',
        src: './make-you-bodies/010.png',
        neckX: 0.5,
        neckY: 0.05,
        headScale: 1.0,
      },
      {
        id: 'make-you-011',
        name: 'Yellow Tee & Purple Shorts',
        src: './make-you-bodies/011.png',
        neckX: 0.5,
        neckY: 0.05,
        headScale: 1.0,
      },
      {
        id: 'make-you-012',
        name: 'Sailor Shirt',
        src: './make-you-bodies/012.png',
        neckX: 0.5,
        neckY: 0.05,
        headScale: 1.0,
      },
      {
        id: 'make-you-013',
        name: 'Red Car Tee',
        src: './make-you-bodies/013.png',
        neckX: 0.5,
        neckY: 0.05,
        headScale: 1.0,
      },
      {
        id: 'make-you-014',
        name: 'Orange Tee & Green Shorts',
        src: './make-you-bodies/014.png',
        neckX: 0.5,
        neckY: 0.05,
        headScale: 1.0,
      },
      {
        id: 'make-you-015',
        name: 'Frog Tee',
        src: './make-you-bodies/015.png',
        neckX: 0.5,
        neckY: 0.05,
        headScale: 1.0,
      },
      {
        id: 'make-you-016',
        name: 'Red Raglan Tee',
        src: './make-you-bodies/016.png',
        neckX: 0.5,
        neckY: 0.05,
        headScale: 1.0,
      },
      {
        id: 'make-you-017',
        name: 'Navy Polo',
        src: './make-you-bodies/017.png',
        neckX: 0.5,
        neckY: 0.05,
        headScale: 1.0,
      },
      {
        id: 'make-you-018',
        name: 'Green Stripe Polo',
        src: './make-you-bodies/018.png',
        neckX: 0.5,
        neckY: 0.05,
        headScale: 1.0,
      },
      {
        id: 'make-you-019',
        name: 'Red Pocket Tee',
        src: './make-you-bodies/019.png',
        neckX: 0.5,
        neckY: 0.05,
        headScale: 1.0,
      },
      {
        id: 'make-you-020',
        name: 'Blue Stripe Overalls',
        src: './make-you-bodies/020.png',
        neckX: 0.5,
        neckY: 0.05,
        headScale: 1.0,
      },
      {
        id: 'make-you-021',
        name: 'Red Polo & Yellow Shorts',
        src: './make-you-bodies/021.png',
        neckX: 0.5,
        neckY: 0.05,
        headScale: 1.0,
      },
      {
        id: 'make-you-022',
        name: 'Yellow Polo',
        src: './make-you-bodies/022.png',
        neckX: 0.5,
        neckY: 0.05,
        headScale: 1.0,
      },
      {
        id: 'make-you-023',
        name: 'Green Stripe Shirt',
        src: './make-you-bodies/023.png',
        neckX: 0.5,
        neckY: 0.05,
        headScale: 1.0,
      },
      {
        id: 'make-you-024',
        name: 'Sky Polo',
        src: './make-you-bodies/024.png',
        neckX: 0.5,
        neckY: 0.05,
        headScale: 1.0,
      },
      {
        id: 'make-you-025',
        name: 'White Tee, Orange Trim',
        src: './make-you-bodies/025.png',
        neckX: 0.5,
        neckY: 0.05,
        headScale: 1.0,
      },
      {
        id: 'make-you-026',
        name: 'Sky Pocket Shirt',
        src: './make-you-bodies/026.png',
        neckX: 0.5,
        neckY: 0.05,
        headScale: 1.0,
      },
      {
        id: 'make-you-027',
        name: 'Green Raglan Tee',
        src: './make-you-bodies/027.png',
        neckX: 0.5,
        neckY: 0.05,
        headScale: 1.0,
      },
      {
        id: 'make-you-028',
        name: 'Red Hoodie',
        src: './make-you-bodies/028.png',
        neckX: 0.5,
        neckY: 0.05,
        headScale: 1.0,
      },
      {
        id: 'make-you-029',
        name: 'Sunshine Stripe Tee',
        src: './make-you-bodies/029.png',
        neckX: 0.5,
        neckY: 0.05,
        headScale: 1.0,
      },
      {
        id: 'make-you-030',
        name: 'White Car Tee',
        src: './make-you-bodies/030.png',
        neckX: 0.5,
        neckY: 0.05,
        headScale: 1.0,
      },
      {
        id: 'make-you-031',
        name: 'Blue Overalls & Red Shoes',
        src: './make-you-bodies/031.png',
        neckX: 0.5,
        neckY: 0.05,
        headScale: 1.0,
      },
      {
        id: 'make-you-032',
        name: 'White Star Tee',
        src: './make-you-bodies/032.png',
        neckX: 0.5,
        neckY: 0.05,
        headScale: 1.0,
      },
      {
        id: 'make-you-033',
        name: 'Mint Pocket Shirt',
        src: './make-you-bodies/033.png',
        neckX: 0.5,
        neckY: 0.05,
        headScale: 1.0,
      },
      {
        id: 'make-you-034',
        name: 'Sailor Shirt & Khaki Shorts',
        src: './make-you-bodies/034.png',
        neckX: 0.5,
        neckY: 0.05,
        headScale: 1.0,
      },
      {
        id: 'make-you-035',
        name: 'Orange Tee & Yellow Shorts',
        src: './make-you-bodies/035.png',
        neckX: 0.5,
        neckY: 0.05,
        headScale: 1.0,
      },
      {
        id: 'make-you-036',
        name: 'Baby Blue Tee',
        src: './make-you-bodies/036.png',
        neckX: 0.5,
        neckY: 0.05,
        headScale: 1.0,
      },
      {
        id: 'make-you-037',
        name: 'Teddy Bear Sweater',
        src: './make-you-bodies/037.png',
        neckX: 0.5,
        neckY: 0.05,
        headScale: 1.0,
      },
      {
        id: 'make-you-038',
        name: 'Red Stripe Tee',
        src: './make-you-bodies/038.png',
        neckX: 0.5,
        neckY: 0.05,
        headScale: 1.0,
      },
      {
        id: 'make-you-039',
        name: 'Green Pocket Shirt',
        src: './make-you-bodies/039.png',
        neckX: 0.5,
        neckY: 0.05,
        headScale: 1.0,
      },
      {
        id: 'make-you-040',
        name: 'Blue Button Pyjamas',
        src: './make-you-bodies/040.png',
        neckX: 0.5,
        neckY: 0.05,
        headScale: 1.0,
      },
      {
        id: 'make-you-041',
        name: 'Red Tee',
        src: './make-you-bodies/041.png',
        neckX: 0.5,
        neckY: 0.05,
        headScale: 1.0,
      },
      {
        id: 'make-you-042',
        name: 'Royal Blue Tee',
        src: './make-you-bodies/042.png',
        neckX: 0.5,
        neckY: 0.05,
        headScale: 1.0,
      },
      {
        id: 'make-you-043',
        name: 'Forest Green Tee',
        src: './make-you-bodies/043.png',
        neckX: 0.5,
        neckY: 0.05,
        headScale: 1.0,
      },
      {
        id: 'make-you-044',
        name: 'Yellow Tee & Red Shorts',
        src: './make-you-bodies/044.png',
        neckX: 0.5,
        neckY: 0.05,
        headScale: 1.0,
      },
      {
        id: 'make-you-045',
        name: 'Yellow Tee & Teal Shorts',
        src: './make-you-bodies/045.png',
        neckX: 0.5,
        neckY: 0.05,
        headScale: 1.0,
      },
      {
        id: 'make-you-046',
        name: 'Sky Tee & Stripe Socks',
        src: './make-you-bodies/046.png',
        neckX: 0.5,
        neckY: 0.05,
        headScale: 1.0,
      },
      {
        id: 'make-you-047',
        name: 'Sand Pocket Shirt',
        src: './make-you-bodies/047.png',
        neckX: 0.5,
        neckY: 0.05,
        headScale: 1.0,
      },
      {
        id: 'make-you-048',
        name: 'Orange Hoodie',
        src: './make-you-bodies/048.png',
        neckX: 0.5,
        neckY: 0.05,
        headScale: 1.0,
      },
      {
        id: 'make-you-049',
        name: 'Grey Hoodie',
        src: './make-you-bodies/049.png',
        neckX: 0.5,
        neckY: 0.05,
        headScale: 1.0,
      },
      {
        id: 'make-you-050',
        name: 'White Polo & Stripe Socks',
        src: './make-you-bodies/050.png',
        neckX: 0.5,
        neckY: 0.05,
        headScale: 1.0,
      },
      {
        id: 'make-you-051',
        name: 'Blue Henley',
        src: './make-you-bodies/051.png',
        neckX: 0.5,
        neckY: 0.05,
        headScale: 1.0,
      },
      {
        id: 'make-you-052',
        name: 'Brown Explorer Vest',
        src: './make-you-bodies/052.png',
        neckX: 0.5,
        neckY: 0.05,
        headScale: 1.0,
      },
      {
        id: 'make-you-053',
        name: 'Pink Collar Dress',
        src: './make-you-bodies/053.png',
        neckX: 0.5,
        neckY: 0.05,
        headScale: 1.0,
      },
      {
        id: 'make-you-054',
        name: 'Lilac Dress',
        src: './make-you-bodies/054.png',
        neckX: 0.5,
        neckY: 0.05,
        headScale: 1.0,
      },
      {
        id: 'make-you-055',
        name: 'Yellow Button Dress',
        src: './make-you-bodies/055.png',
        neckX: 0.5,
        neckY: 0.05,
        headScale: 1.0,
      },
      {
        id: 'make-you-056',
        name: 'Rose Tunic Dress',
        src: './make-you-bodies/056.png',
        neckX: 0.5,
        neckY: 0.05,
        headScale: 1.0,
      },
      {
        id: 'make-you-057',
        name: 'Green Floral Dress',
        src: './make-you-bodies/057.png',
        neckX: 0.5,
        neckY: 0.05,
        headScale: 1.0,
      },
      {
        id: 'make-you-058',
        name: 'Bright Red Tee',
        src: './make-you-bodies/058.png',
        neckX: 0.5,
        neckY: 0.05,
        headScale: 1.0,
      },
      {
        id: 'make-you-059',
        name: 'Cobalt Tee',
        src: './make-you-bodies/059.png',
        neckX: 0.5,
        neckY: 0.05,
        headScale: 1.0,
      },
      {
        id: 'make-you-060',
        name: 'Sunshine Tee',
        src: './make-you-bodies/060.png',
        neckX: 0.5,
        neckY: 0.05,
        headScale: 1.0,
      },
      {
        id: 'make-you-061',
        name: 'Blue Stripe Polo',
        src: './make-you-bodies/061.png',
        neckX: 0.5,
        neckY: 0.05,
        headScale: 1.0,
      },
      {
        id: 'make-you-062',
        name: 'Green Tee & Khaki Shorts',
        src: './make-you-bodies/062.png',
        neckX: 0.5,
        neckY: 0.05,
        headScale: 1.0,
      },
      {
        id: 'make-you-063',
        name: 'Orange Tee & Brown Shorts',
        src: './make-you-bodies/063.png',
        neckX: 0.5,
        neckY: 0.05,
        headScale: 1.0,
      },
      {
        id: 'make-you-064',
        name: 'Sky Polo & Khaki Shorts',
        src: './make-you-bodies/064.png',
        neckX: 0.5,
        neckY: 0.05,
        headScale: 1.0,
      },
      {
        id: 'make-you-065',
        name: 'Sand Shirt & Red Shoes',
        src: './make-you-bodies/065.png',
        neckX: 0.5,
        neckY: 0.05,
        headScale: 1.0,
      },
      {
        id: 'make-you-066',
        name: 'Cherry Tee & Navy Shorts',
        src: './make-you-bodies/066.png',
        neckX: 0.5,
        neckY: 0.05,
        headScale: 1.0,
      },
      {
        id: 'make-you-067',
        name: 'Mint Cargo Outfit',
        src: './make-you-bodies/067.png',
        neckX: 0.5,
        neckY: 0.05,
        headScale: 1.0,
      },
      {
        id: 'make-you-068',
        name: 'Blue Overalls & Yellow Shirt',
        src: './make-you-bodies/068.png',
        neckX: 0.5,
        neckY: 0.05,
        headScale: 1.0,
      },
      {
        id: 'make-you-069',
        name: 'Blue Breton Stripe',
        src: './make-you-bodies/069.png',
        neckX: 0.5,
        neckY: 0.05,
        headScale: 1.0,
      },
      {
        id: 'make-you-070',
        name: 'Yellow Hoodie',
        src: './make-you-bodies/070.png',
        neckX: 0.5,
        neckY: 0.05,
        headScale: 1.0,
      },
      {
        id: 'make-you-071',
        name: 'White Tank & Red Shorts',
        src: './make-you-bodies/071.png',
        neckX: 0.5,
        neckY: 0.05,
        headScale: 1.0,
      },
      {
        id: 'make-you-072',
        name: 'Navy Tee & Grey Trousers',
        src: './make-you-bodies/072.png',
        neckX: 0.5,
        neckY: 0.05,
        headScale: 1.0,
      },
      {
        id: 'make-you-073',
        name: 'Pink Party Dress',
        src: './make-you-bodies/073.png',
        neckX: 0.5,
        neckY: 0.05,
        headScale: 1.0,
      },
      {
        id: 'make-you-074',
        name: 'Purple Daisy Dress',
        src: './make-you-bodies/074.png',
        neckX: 0.5,
        neckY: 0.05,
        headScale: 1.0,
      },
      {
        id: 'make-you-075',
        name: 'Buttercup Dress',
        src: './make-you-bodies/075.png',
        neckX: 0.5,
        neckY: 0.05,
        headScale: 1.0,
      },
      {
        id: 'make-you-076',
        name: 'Pink Floral Set',
        src: './make-you-bodies/076.png',
        neckX: 0.5,
        neckY: 0.05,
        headScale: 1.0,
      },
      {
        id: 'make-you-077',
        name: 'Teal Tunic & Scarf',
        src: './make-you-bodies/077.png',
        neckX: 0.5,
        neckY: 0.05,
        headScale: 1.0,
      },
    ],
    places: winCfg?.places || [
      {
        id: 'ngong-ping-cable-car',
        name: 'Ngong Ping 360 & Bay',
        src: './Tung Chung Places/ngong-ping-cable-car.jpg',
      },
      {
        id: 'tung-chung-park',
        name: 'Tung Chung Park',
        src: './Tung Chung Places/tung-chung-park.jpg',
      },
      {
        id: 'tung-chung-fort',
        name: 'Tung Chung Fort',
        src: './Tung Chung Places/tung-chung-fort.jpg',
      },
      {
        id: 'tung-chung-places-1',
        name: 'Caribbean Coast Swimming Pool',
        src: './Tung Chung Places/Tung Chung Places (1).jpeg',
      },
      {
        id: 'tung-chung-places-18',
        name: 'Yat Tung Shopping Centre',
        src: './Tung Chung Places/Tung Chung Places (18).jpeg',
      },
      {
        id: 'tung-chung-places-19',
        name: 'Tung Chung Ferry Pier',
        src: './Tung Chung Places/Tung Chung Places (19).jpeg',
      },
      {
        id: 'tung-chung-places-20',
        name: 'Tung Chung Promenade',
        src: './Tung Chung Places/Tung Chung Places (20).jpeg',
      },
      {
        id: 'tung-chung-places-21',
        name: 'Chui Kwan Drive',
        src: './Tung Chung Places/Tung Chung Places (21).jpeg',
      },
      {
        id: 'tung-chung-places-22',
        name: 'Mun Tung Wet Market',
        src: './Tung Chung Places/Tung Chung Places (22).jpeg',
      },
      {
        id: 'tung-chung-places-23',
        name: 'Mun Tung Estate',
        src: './Tung Chung Places/Tung Chung Places (23).jpeg',
      },
      {
        id: 'tung-chung-places-24',
        name: 'Masjid Ismail',
        src: './Tung Chung Places/Tung Chung Places (24).jpeg',
      },
      {
        id: 'tung-chung-places-25',
        name: 'Caribbean Coast',
        src: './Tung Chung Places/Tung Chung Places (25).jpeg',
      },
      {
        id: 'tung-chung-places-26',
        name: 'Citygate Fountain',
        src: './Tung Chung Places/Tung Chung Places (26).jpeg',
      },
      {
        id: 'tung-chung-places-27',
        name: 'Cheung Tung Bus Terminal',
        src: './Tung Chung Places/Tung Chung Places (27).jpeg',
      },
      {
        id: 'tung-chung-places-28',
        name: 'Yu Nga Court',
        src: './Tung Chung Places/Tung Chung Places (28).jpeg',
      },
      {
        id: 'tung-chung-places-29',
        name: 'Yat Tung Market Food Stalls',
        src: './Tung Chung Places/Tung Chung Places (29).jpeg',
      },
      {
        id: 'tung-chung-places-30',
        name: 'Ma Wan Chung',
        src: './Tung Chung Places/Tung Chung Places (30).jpeg',
      },
      {
        id: 'tung-chung-places-31',
        name: 'Yat Tung Estate',
        src: './Tung Chung Places/Tung Chung Places (31).jpeg',
      },
      {
        id: 'tung-chung-places-32',
        name: 'Outside Yat Tung Estate',
        src: './Tung Chung Places/Tung Chung Places (32).jpeg',
      },
      {
        id: 'tung-chung-places-33',
        name: 'Yat Tung Estate Bus Terminal',
        src: './Tung Chung Places/Tung Chung Places (33).jpeg',
      },
    ],
    danceSongUrl: winCfg?.danceSongUrl || './Tung Chung.mp3',
  };
}

export function createInitialPages(places: { id: string }[]): PageState[] {
  const getBg = (idx: number) =>
    places.length > 0 ? places[idx % places.length].id : 'ngong-ping-cable-car';

  const defaultAdjectives: Adjective[] = [
    'friendly',
    'kind',
    'sporty',
    'smart',
    'calm',
    'healthy',
    'humble',
    'neat',
    'shy',
    'naughty',
    'nerdy',
    'friendly',
  ];

  return Array.from({ length: 12 }, (_, idx) => {
    const pageNumber = idx + 1;
    return {
      pageNumber,
      bgPlaceId: getBg(idx),
      placed: [],
      objects: [],
      placeName: 'Tung Chung',
      friendName: pageNumber === 1 ? 'Me' : `Friend ${pageNumber}`,
      pronoun: (pageNumber % 2 === 0 ? 'She' : 'He') as Pronoun,
      adjective: defaultAdjectives[idx],
    };
  });
}

export function getPageSentence(page: PageState, characters: Character[]): string {
  const p = page.pageNumber;
  const adj = page.adjective;
  const pronoun = page.pronoun;
  const pronounLower = pronoun.toLowerCase();
  const createdChar = characters.find((c) => c.createdOnPage === p);
  const name =
    (page.friendName && page.friendName.trim()) ||
    createdChar?.name ||
    `Friend ${p}`;

  switch (p) {
    case 1: {
      const place = (page.placeName && page.placeName.trim()) || 'Tung Chung';
      return `This is me! I live in ${place}! I am a ${adj} person.`;
    }
    case 2:
      return `Oh look! It is ${name}. ${pronoun} is ${adj}.`;
    case 3:
      return `Now I can see ${name}. ${pronoun} is ${adj}!`;
    case 4:
      return `Oh, hey look! It's ${name}. ${pronoun} really is ${adj}.`;
    case 5:
      return `Over there is ${name}! Everyone knows ${pronounLower} is ${adj}.`;
    case 6:
      return `Look who is in Tung Chung! It's ${name}, and ${pronounLower} is very ${adj}.`;
    case 7:
      return `Here comes ${name} with a big smile! ${pronoun} is so ${adj}.`;
    case 8:
      return `Guess who I met today? It is ${name}, and ${pronounLower} is ${adj}!`;
    case 9:
      return `Wave hello to ${name}! My friend is always ${adj}.`;
    case 10:
      return `Wait—is that ${name} over by the trees? Yes! ${pronoun} is super ${adj}.`;
    case 11:
      return `And here is ${name}, ready to play! ${pronoun} is wonderfully ${adj}!`;
    case 12:
    default:
      return `We are special people in a special place: Tung Chung!`;
  }
}

export function speakSentence(text: string): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const englishVoice =
      voices.find(
        (v) =>
          v.lang.startsWith('en') &&
          (v.name.includes('Samantha') ||
            v.name.includes('Daniel') ||
            v.name.includes('Google') ||
            v.localService)
      ) || voices.find((v) => v.lang.startsWith('en'));

    if (englishVoice) {
      utterance.voice = englishVoice;
    }
    utterance.lang = 'en-US';
    utterance.rate = 0.94;
    utterance.pitch = 1.08;
    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('Speech synthesis error:', err);
  }
}

/**
 * Generates charming cartoon face stickers for the Cover Page animated preview.
 */
export function createSampleStickerHead(
  bgColor: string,
  cheekColor: string,
  hairColor: string
): string {
  const canvas = document.createElement('canvas');
  canvas.width = 220;
  canvas.height = 240;
  const ctx = canvas.getContext('2d')!;

  // Hair back
  ctx.fillStyle = hairColor;
  ctx.strokeStyle = '#3a2e28';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.arc(110, 108, 76, Math.PI * 0.9, Math.PI * 2.1);
  ctx.fill();
  ctx.stroke();

  // Face circle
  ctx.fillStyle = bgColor;
  ctx.beginPath();
  ctx.ellipse(110, 126, 68, 74, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Cute Anpanman-inspired rosy cheeks & nose
  ctx.fillStyle = cheekColor;
  ctx.beginPath();
  ctx.arc(68, 136, 16, 0, Math.PI * 2);
  ctx.arc(152, 136, 16, 0, Math.PI * 2);
  ctx.fill();

  // Eyes
  ctx.fillStyle = '#3a2e28';
  ctx.beginPath();
  ctx.ellipse(86, 112, 7, 10, 0, 0, Math.PI * 2);
  ctx.ellipse(134, 112, 7, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  // Eye sparkles
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(84, 108, 3, 0, Math.PI * 2);
  ctx.arc(132, 108, 3, 0, Math.PI * 2);
  ctx.fill();

  // Friendly nose
  ctx.fillStyle = '#ff6b57';
  ctx.beginPath();
  ctx.arc(110, 128, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#3a2e28';
  ctx.lineWidth = 4;
  ctx.stroke();

  // Happy smile
  ctx.strokeStyle = '#3a2e28';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(110, 138, 22, 0.2, Math.PI - 0.2);
  ctx.stroke();

  // Hair bangs
  ctx.fillStyle = hairColor;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(46, 104);
  ctx.quadraticCurveTo(80, 62, 110, 82);
  ctx.quadraticCurveTo(140, 60, 174, 104);
  ctx.quadraticCurveTo(154, 48, 110, 48);
  ctx.quadraticCurveTo(66, 48, 46, 104);
  ctx.fill();
  ctx.stroke();

  return canvas.toDataURL('image/png');
}
