import type { Trail, ElevationPoint } from '../../types/trail';

export const mockElevationProfile: ElevationPoint[] = [
  { distance: 0, elevation: 100 },
  { distance: 1, elevation: 300 },
  { distance: 2, elevation: 200 },
  { distance: 3, elevation: 500 },
  { distance: 4, elevation: 400 },
];

export const emptyElevationProfile: ElevationPoint[] = [];

export const singleElevationProfile: ElevationPoint[] = [
  { distance: 0, elevation: 250 },
];

export const mockTrails: Trail[] = [
  {
    id: 'trail-001',
    name: '香山红叶步道',
    description: '经典城市近郊徒步路线',
    distance: 8.6,
    elevationGain: 520,
    duration: '3-4 小时',
    difficulty: '中等',
    region: '北京市海淀区',
    elevationProfile: mockElevationProfile,
  },
  {
    id: 'trail-002',
    name: '武功山金顶穿越',
    description: '高山草甸与云海奇观',
    distance: 22.5,
    elevationGain: 1680,
    duration: '2 天',
    difficulty: '困难',
    region: '江西省萍乡市',
    elevationProfile: mockElevationProfile,
  },
  {
    id: 'trail-003',
    name: '西湖群山漫步',
    description: '环绕西湖的休闲徒步路线',
    distance: 5.2,
    elevationGain: 180,
    duration: '2 小时',
    difficulty: '简单',
    region: '浙江省杭州市',
    elevationProfile: mockElevationProfile,
  },
  {
    id: 'trail-004',
    name: '西湖龙井茶园徒步',
    description: '穿越龙井茶园',
    distance: 7.5,
    elevationGain: 280,
    duration: '3 小时',
    difficulty: '简单',
    region: '浙江省杭州市',
    elevationProfile: mockElevationProfile,
  },
  {
    id: 'trail-005',
    name: '虎跳峡高路徒步',
    description: '沿金沙江峡谷行走',
    distance: 16.2,
    elevationGain: 980,
    duration: '1 天',
    difficulty: '中等偏难',
    region: '云南省丽江市',
    elevationProfile: mockElevationProfile,
  },
];
