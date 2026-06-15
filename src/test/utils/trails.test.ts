import {
  filterTrails,
  fuzzyMatchKeyword,
  calculateElevationStats,
  findMaxElevationIndex,
  sortByField,
  toggleSortState,
  type TrailFilter,
  type SortDirection,
} from '../../utils/trails';
import {
  mockTrails,
  mockElevationProfile,
  emptyElevationProfile,
  singleElevationProfile,
} from './testData';

describe('路线工具函数测试', () => {
  describe('fuzzyMatchKeyword - 模糊匹配函数', () => {
    const trail = mockTrails[0];

    test('匹配路线名称中的关键词', () => {
      expect(fuzzyMatchKeyword(trail, '香山')).toBe(true);
    });

    test('匹配区域中的关键词', () => {
      expect(fuzzyMatchKeyword(trail, '北京')).toBe(true);
    });

    test('不匹配的关键词返回 false', () => {
      expect(fuzzyMatchKeyword(trail, '西湖')).toBe(false);
    });

    test('空关键词返回 true', () => {
      expect(fuzzyMatchKeyword(trail, '')).toBe(true);
    });

    test('仅包含空格的关键词返回 true', () => {
      expect(fuzzyMatchKeyword(trail, '   ')).toBe(true);
    });

    test('关键词不区分大小写', () => {
      expect(fuzzyMatchKeyword(trail, 'XIANGSHAN')).toBe(false);
      expect(fuzzyMatchKeyword(trail, '香山'.toLowerCase())).toBe(true);
    });

    test('部分匹配也能命中', () => {
      expect(fuzzyMatchKeyword(trail, '红叶')).toBe(true);
      expect(fuzzyMatchKeyword(trail, '海淀')).toBe(true);
    });

    test('关键词自动去除首尾空格', () => {
      expect(fuzzyMatchKeyword(trail, '  香山  ')).toBe(true);
    });
  });

  describe('filterTrails - 过滤函数', () => {
    test('空过滤条件返回全部路线', () => {
      const result = filterTrails(mockTrails, {});
      expect(result).toHaveLength(mockTrails.length);
    });

    test('按难度过滤 - 正常过滤', () => {
      const filter: TrailFilter = { difficulty: '简单' };
      const result = filterTrails(mockTrails, filter);
      expect(result).toHaveLength(2);
      expect(result.every((t) => t.difficulty === '简单')).toBe(true);
    });

    test('按区域过滤 - 正常过滤', () => {
      const filter: TrailFilter = { region: '浙江省杭州市' };
      const result = filterTrails(mockTrails, filter);
      expect(result).toHaveLength(2);
      expect(result.every((t) => t.region === '浙江省杭州市')).toBe(true);
    });

    test('按关键词过滤 - 正常过滤', () => {
      const filter: TrailFilter = { keyword: '西湖' };
      const result = filterTrails(mockTrails, filter);
      expect(result).toHaveLength(2);
      expect(result.every((t) => t.name.includes('西湖'))).toBe(true);
    });

    test('空关键词不过滤', () => {
      const filter: TrailFilter = { keyword: '' };
      const result = filterTrails(mockTrails, filter);
      expect(result).toHaveLength(mockTrails.length);
    });

    test('仅空格的关键词不过滤', () => {
      const filter: TrailFilter = { keyword: '   ' };
      const result = filterTrails(mockTrails, filter);
      expect(result).toHaveLength(mockTrails.length);
    });

    test('多条件组合过滤 - 难度 + 区域', () => {
      const filter: TrailFilter = {
        difficulty: '简单',
        region: '浙江省杭州市',
      };
      const result = filterTrails(mockTrails, filter);
      expect(result).toHaveLength(2);
      expect(result.every((t) => t.difficulty === '简单' && t.region === '浙江省杭州市')).toBe(true);
    });

    test('多条件组合过滤 - 难度 + 关键词', () => {
      const filter: TrailFilter = {
        difficulty: '中等',
        keyword: '香山',
      };
      const result = filterTrails(mockTrails, filter);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('香山红叶步道');
    });

    test('多条件组合过滤 - 区域 + 关键词', () => {
      const filter: TrailFilter = {
        region: '浙江省杭州市',
        keyword: '龙井',
      };
      const result = filterTrails(mockTrails, filter);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('西湖龙井茶园徒步');
    });

    test('三条件组合过滤', () => {
      const filter: TrailFilter = {
        difficulty: '简单',
        region: '浙江省杭州市',
        keyword: '西湖',
      };
      const result = filterTrails(mockTrails, filter);
      expect(result).toHaveLength(2);
    });

    test('无匹配结果时返回空数组', () => {
      const filter: TrailFilter = { difficulty: '极难' };
      const result = filterTrails(mockTrails, filter);
      expect(result).toHaveLength(0);
    });

    test('传入空数组返回空数组', () => {
      const result = filterTrails([], { difficulty: '简单' });
      expect(result).toHaveLength(0);
    });

    test('不修改原数组', () => {
      const originalLength = mockTrails.length;
      filterTrails(mockTrails, { difficulty: '简单' });
      expect(mockTrails).toHaveLength(originalLength);
    });
  });

  describe('calculateElevationStats - 海拔统计计算函数', () => {
    test('正常计算海拔统计数据', () => {
      const result = calculateElevationStats(mockElevationProfile);
      expect(result.isValid).toBe(true);
      expect(result.maxElevation).toBe(500);
      expect(result.minElevation).toBe(100);
      expect(result.elevationDrop).toBe(400);
    });

    test('空海拔数组返回无效标识', () => {
      const result = calculateElevationStats(emptyElevationProfile);
      expect(result.isValid).toBe(false);
      expect(result.maxElevation).toBe(0);
      expect(result.minElevation).toBe(0);
      expect(result.elevationDrop).toBe(0);
    });

    test('单个海拔点的统计', () => {
      const result = calculateElevationStats(singleElevationProfile);
      expect(result.isValid).toBe(true);
      expect(result.maxElevation).toBe(250);
      expect(result.minElevation).toBe(250);
      expect(result.elevationDrop).toBe(0);
    });

    test('所有海拔相同的情况', () => {
      const flatProfile = [
        { distance: 0, elevation: 200 },
        { distance: 1, elevation: 200 },
        { distance: 2, elevation: 200 },
      ];
      const result = calculateElevationStats(flatProfile);
      expect(result.isValid).toBe(true);
      expect(result.maxElevation).toBe(200);
      expect(result.minElevation).toBe(200);
      expect(result.elevationDrop).toBe(0);
    });

    test('海拔先升后降的情况', () => {
      const profile = [
        { distance: 0, elevation: 100 },
        { distance: 1, elevation: 200 },
        { distance: 2, elevation: 300 },
        { distance: 3, elevation: 200 },
        { distance: 4, elevation: 100 },
      ];
      const result = calculateElevationStats(profile);
      expect(result.isValid).toBe(true);
      expect(result.maxElevation).toBe(300);
      expect(result.minElevation).toBe(100);
      expect(result.elevationDrop).toBe(200);
    });

    test('海拔持续下降的情况', () => {
      const profile = [
        { distance: 0, elevation: 500 },
        { distance: 1, elevation: 400 },
        { distance: 2, elevation: 300 },
        { distance: 3, elevation: 200 },
        { distance: 4, elevation: 100 },
      ];
      const result = calculateElevationStats(profile);
      expect(result.isValid).toBe(true);
      expect(result.maxElevation).toBe(500);
      expect(result.minElevation).toBe(100);
      expect(result.elevationDrop).toBe(400);
    });
  });

  describe('findMaxElevationIndex - 海拔最高点索引函数', () => {
    test('正常找到最高点索引', () => {
      const result = findMaxElevationIndex(mockElevationProfile);
      expect(result).toBe(3);
    });

    test('空数组返回 -1', () => {
      const result = findMaxElevationIndex(emptyElevationProfile);
      expect(result).toBe(-1);
    });

    test('单个点返回 0', () => {
      const result = findMaxElevationIndex(singleElevationProfile);
      expect(result).toBe(0);
    });

    test('多个相同最高点时返回第一个的索引', () => {
      const profile = [
        { distance: 0, elevation: 100 },
        { distance: 1, elevation: 300 },
        { distance: 2, elevation: 300 },
        { distance: 3, elevation: 200 },
      ];
      const result = findMaxElevationIndex(profile);
      expect(result).toBe(1);
    });
  });

  describe('sortByField - 按字段排序函数', () => {
    test('null 字段不排序，返回原顺序副本', () => {
      const result = sortByField(mockTrails, null, 'asc');
      expect(result).toHaveLength(mockTrails.length);
      expect(result[0].id).toBe(mockTrails[0].id);
      expect(result).not.toBe(mockTrails);
    });

    test('null 方向不排序，返回原顺序副本', () => {
      const result = sortByField(mockTrails, 'distance', null);
      expect(result).toHaveLength(mockTrails.length);
      expect(result[0].id).toBe(mockTrails[0].id);
    });

    test('按数字字段升序排序', () => {
      const result = sortByField(mockTrails, 'distance', 'asc');
      expect(result).toHaveLength(mockTrails.length);
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i].distance).toBeLessThanOrEqual(result[i + 1].distance);
      }
    });

    test('按数字字段降序排序', () => {
      const result = sortByField(mockTrails, 'distance', 'desc');
      expect(result).toHaveLength(mockTrails.length);
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i].distance).toBeGreaterThanOrEqual(result[i + 1].distance);
      }
    });

    test('按字符串字段升序排序', () => {
      const result = sortByField(mockTrails, 'name', 'asc');
      expect(result).toHaveLength(mockTrails.length);
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i].name.localeCompare(result[i + 1].name)).toBeLessThanOrEqual(0);
      }
    });

    test('按字符串字段降序排序', () => {
      const result = sortByField(mockTrails, 'name', 'desc');
      expect(result).toHaveLength(mockTrails.length);
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i].name.localeCompare(result[i + 1].name)).toBeGreaterThanOrEqual(0);
      }
    });

    test('不修改原数组', () => {
      const originalOrder = mockTrails.map((t) => t.id);
      sortByField(mockTrails, 'distance', 'asc');
      expect(mockTrails.map((t) => t.id)).toEqual(originalOrder);
    });

    test('空数组返回空数组', () => {
      const result = sortByField([], 'distance', 'asc');
      expect(result).toHaveLength(0);
    });
  });

  describe('toggleSortState - 排序切换函数', () => {
    test('无排序状态切换到目标字段升序', () => {
      const result = toggleSortState(null, null, 'distance');
      expect(result.field).toBe('distance');
      expect(result.direction).toBe('asc');
    });

    test('升序切换为降序', () => {
      const result = toggleSortState('distance', 'asc', 'distance');
      expect(result.field).toBe('distance');
      expect(result.direction).toBe('desc');
    });

    test('降序切换为无排序', () => {
      const result = toggleSortState('distance', 'desc', 'distance');
      expect(result.field).toBeNull();
      expect(result.direction).toBeNull();
    });

    test('三种状态循环切换 - 完整循环', () => {
      let field: string | null = null;
      let direction: SortDirection = null;

      const state1 = toggleSortState(field, direction, 'distance');
      expect(state1.field).toBe('distance');
      expect(state1.direction).toBe('asc');

      const state2 = toggleSortState(state1.field, state1.direction, 'distance');
      expect(state2.field).toBe('distance');
      expect(state2.direction).toBe('desc');

      const state3 = toggleSortState(state2.field, state2.direction, 'distance');
      expect(state3.field).toBeNull();
      expect(state3.direction).toBeNull();

      const state4 = toggleSortState(state3.field, state3.direction, 'distance');
      expect(state4.field).toBe('distance');
      expect(state4.direction).toBe('asc');
    });

    test('切换到不同字段时重置为升序', () => {
      const result = toggleSortState('name', 'desc', 'distance');
      expect(result.field).toBe('distance');
      expect(result.direction).toBe('asc');
    });

    test('从升序切换到不同字段', () => {
      const result = toggleSortState('name', 'asc', 'distance');
      expect(result.field).toBe('distance');
      expect(result.direction).toBe('asc');
    });

    test('当前字段为 null 且目标字段存在时进入升序', () => {
      const result = toggleSortState(null, 'asc', 'name');
      expect(result.field).toBe('name');
      expect(result.direction).toBe('asc');
    });
  });
});
