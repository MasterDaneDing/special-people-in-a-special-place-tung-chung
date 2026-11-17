export interface BodyAsset {
  id: string;
  name: string;
  src: string;
  neckX: number; // 0..1 normalized X of neck anchor on body image
  neckY: number; // 0..1 normalized Y of neck anchor on body image
  headScale: number; // default multiplier
}

export interface PlaceAsset {
  id: string;
  name: string;
  src: string;
}

export interface StorybookConfig {
  googleAppsScriptUrl: string;
  bodies: BodyAsset[];
  places: PlaceAsset[];
  danceSongUrl: string;
}

export type Pronoun = 'He' | 'She';

export type Adjective =
  | 'calm'
  | 'friendly'
  | 'healthy'
  | 'humble'
  | 'kind'
  | 'naughty'
  | 'neat'
  | 'shy'
  | 'smart'
  | 'sporty'
  | 'nerdy';

export const ADJECTIVES: Adjective[] = [
  'calm',
  'friendly',
  'healthy',
  'humble',
  'kind',
  'naughty',
  'neat',
  'shy',
  'smart',
  'sporty',
  'nerdy',
];

export const PRONOUNS: Pronoun[] = ['He', 'She'];

export interface Character {
  id: string;
  name: string;
  headDataUrl: string;
  bodyId: string;
  bodySrc: string;
  headOffsetX: number; // px relative to base body width (200px)
  headOffsetY: number;
  headScale: number; // user tweak multiplier (default 1.0)
  headTilt: number; // degrees (-25 to +25)
  neckX: number;
  neckY: number;
  baseHeadScale: number;
  createdOnPage: number;
}

export interface PlacedCharacter {
  charId: string;
  x: number; // 0..1 stage percentage (center X)
  y: number; // 0..1 stage percentage (center Y)
  scale: number; // 0.45..2.2
  flipX: boolean;
  zIndex: number;
}

export interface DrawnObject {
  id: string;
  name: string;
  dataUrl: string;
  width: number;
  height: number;
}

export interface PlacedObject {
  instanceId: string;
  objectId: string;
  x: number;
  y: number;
  scale: number;
  flipX: boolean;
  zIndex: number;
}

export interface PageState {
  pageNumber: number; // 1..12
  bgPlaceId: string;
  placed: PlacedCharacter[];
  objects: PlacedObject[];
  placeName: string; // Editable on Page 1 (defaults to "Tung Chung")
  friendName: string; // Pages 2..11 (and Page 1 student name)
  pronoun: Pronoun;
  adjective: Adjective;
}

declare global {
  interface Window {
    GOOGLE_APPS_SCRIPT_URL?: string;
    STORYBOOK_CONFIG?: StorybookConfig;
  }
}
