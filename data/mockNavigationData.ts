export interface NavigationRoute {
  id: 'A' | 'B' | 'C';
  name: string;
  time: number;
  distance: number;
  stairs: boolean;
  steepSlope: boolean;
  curb: boolean;
  narrowSidewalk: boolean;
  unsafeRoad: boolean;
  score: number;
  recommended: boolean;
  statusLabel: '이동약자 추천' | '주의 필요' | '이동 어려움';
  description: string;
  pathCoordinates: string;
}

export interface Obstacle {
  id: string;
  title: string;
  type: 'STAIRS' | 'STEEP_SLOPE' | 'CURB';
  locationName: string;
  description: string;
  detail: string;
  imageUrl: string;
  x: number;
  y: number;
}

export interface ParkingLot {
  id: string;
  name: string;
  distance: number;
  accessibleScore: number;
  hasDisabledSpot: boolean;
  hasStairsToDest: boolean;
  recommended: boolean;
  description: string;
}

export function calculateAccessibilityScore(
  route: Omit<NavigationRoute, 'score' | 'statusLabel' | 'recommended'>,
): Pick<NavigationRoute, 'score' | 'statusLabel' | 'recommended'> {
  let score = 100;
  if (route.stairs) score -= 40;
  if (route.steepSlope) score -= 25;
  if (route.curb) score -= 15;
  if (route.narrowSidewalk) score -= 10;
  if (route.unsafeRoad) score -= 20;

  const finalScore = Math.max(0, score);
  const hasFatalFlaw = route.stairs || route.unsafeRoad;
  const recommended = finalScore >= 80 && !hasFatalFlaw;
  const statusLabel: NavigationRoute['statusLabel'] = recommended
    ? '이동약자 추천'
    : finalScore >= 60 && !hasFatalFlaw
      ? '주의 필요'
      : '이동 어려움';

  return { score: finalScore, statusLabel, recommended };
}

export const INITIAL_OBSTACLE: Obstacle = {
  id: 'obs-cheongil-stairs',
  title: '청일조계지 경계 계단 (급경사 석단)',
  type: 'STAIRS',
  locationName: '인천 중구 관동1가 청일조계지 계단',
  description: '자유공원으로 직결되는 통로이나 전 구간이 가파른 석조 계단입니다.',
  detail: '휠체어, 유모차 및 거동이 불편한 보행자는 통행이 물리적으로 불가능합니다.',
  imageUrl: 'https://images.unsplash.com/photo-1590736969955-71cc94801759?auto=format&fit=crop&w=600&q=80',
  x: 200,
  y: 200,
};

export const MOCK_ROUTES: NavigationRoute[] = [
  {
    id: 'A', name: '제물포구락부 방면 완만 우회로', time: 8, distance: 520,
    stairs: false, steepSlope: false, curb: false, narrowSidewalk: false, unsafeRoad: false,
    score: 92, recommended: true, statusLabel: '이동약자 추천',
    description: '계단과 단차가 없으며 유효 보도 폭이 확보된 최적의 휠체어 우회로',
    pathCoordinates: 'M 180 340 C 120 280, 130 170, 220 80',
  },
  {
    id: 'B', name: '각국조계석 방면 포장로', time: 6, distance: 430,
    stairs: false, steepSlope: true, curb: false, narrowSidewalk: false, unsafeRoad: false,
    score: 75, recommended: false, statusLabel: '주의 필요',
    description: '계단은 없으나 10% 이상의 오르막 경사가 지속되어 동행인 보조 권장',
    pathCoordinates: 'M 180 340 C 240 270, 270 200, 220 80',
  },
  {
    id: 'C', name: '청일조계지 중앙계단 직진로 (기존 최단로)', time: 5, distance: 350,
    stairs: true, steepSlope: false, curb: false, narrowSidewalk: true, unsafeRoad: false,
    score: 45, recommended: false, statusLabel: '이동 어려움',
    description: '일반 지도 기준 최단 경로이나 휠체어 진입이 불가능한 가파른 계단 구간',
    pathCoordinates: 'M 180 340 L 200 200 L 220 80',
  },
];

export const MOCK_PARKING_LOTS: ParkingLot[] = [
  {
    id: 'park-A', name: '자유공원 서측 공영주차장', distance: 420, accessibleScore: 91,
    hasDisabledSpot: true, hasStairsToDest: false, recommended: true,
    description: '공원 정상 평지 보행로와 직통 연결되며 무계단 완만 경사로 구비',
  },
  {
    id: 'park-B', name: '차이나타운 노상 공영주차장', distance: 250, accessibleScore: 52,
    hasDisabledSpot: true, hasStairsToDest: true, recommended: false,
    description: '목적지와 직선거리는 가까우나 공원 방면 진입로 전체가 가파른 돌계단',
  },
];
